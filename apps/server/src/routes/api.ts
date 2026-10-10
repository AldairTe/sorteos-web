import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { OcrService } from '../services/ocrService';
import { ExcelService } from '../services/excelService';
import { notificarNuevaCompraAdmin, notificarActualizacionTicketCliente } from '../sockets/chatSocket';
import { Compra, Ticket, Sorteo, Reclamacion, GanadorFama } from '@sorteos/shared';

const router = Router();

// Configuración de Multer para almacenar comprobantes
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `comprobante-${Date.now()}-${uuidv4().substring(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Máximo 10MB
});

// ==========================================
// 1. RUTAS DE SORTEOS
// ==========================================

// Obtener sorteo actualmente activo
router.get('/sorteos/activo', (_req: Request, res: Response) => {
  const activo = db.getSorteoActivo();
  if (!activo) {
    return res.status(404).json({ error: 'No hay sorteo activo en este momento' });
  }
  return res.json(activo);
});

// Obtener todos los sorteos
router.get('/sorteos', (_req: Request, res: Response) => {
  const sorteos = db.getSorteos();
  return res.json(sorteos);
});

// Crear nuevo sorteo
router.post('/sorteos', (req: Request, res: Response) => {
  const data = req.body;
  const nuevoSorteo: Sorteo = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  db.createSorteo(nuevoSorteo);
  return res.status(201).json(nuevoSorteo);
});

// Modificar sorteo
router.put('/sorteos/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = db.updateSorteo(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Sorteo no encontrado' });
  }
  return res.json(updated);
});

// Validar ticket dentro de un sorteo específico (para cierre de sorteo y asignación de ganadores)
router.get('/sorteos/:id/validar-ticket/:numero', (req: Request, res: Response) => {
  const sorteoId = String(req.params.id);
  const rawNumero = String(req.params.numero).replace(/\D/g, '');
  const numero = parseInt(rawNumero, 10);
  if (isNaN(numero)) {
    return res.status(400).json({ valido: false, mensaje: 'Número de ticket inválido' });
  }

  const sorteo = db.getSorteoById(sorteoId);
  if (!sorteo) {
    return res.status(404).json({ valido: false, mensaje: 'Sorteo no encontrado' });
  }

  const tickets = db.getTickets(sorteoId);
  const ticket = tickets.find(t => t.numero === numero);
  if (!ticket) {
    return res.status(404).json({ valido: false, mensaje: `El ticket #${numero} no existe en este sorteo.` });
  }

  if (ticket.estado !== 'PARTICIPANDO') {
    return res.status(400).json({ 
      valido: false, 
      mensaje: `El ticket #${numero} está en estado '${ticket.estado}' (debe estar PARTICIPANDO para poder ganar).` 
    });
  }

  const compra = db.getCompraById(ticket.compraId);

  return res.json({
    valido: true,
    ticket: {
      numero: ticket.numero,
      numeroFormateado: ticket.numeroFormateado,
      dni: ticket.dni,
      nombreCompleto: ticket.nombreCompleto,
      celular: compra ? compra.celular : undefined,
    }
  });
});

// Finalizar sorteo (asignar ganadores y cerrar)
router.post('/sorteos/:id/finalizar', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { ganadores } = req.body;

  const sorteo = db.getSorteoById(id);
  if (!sorteo) {
    return res.status(404).json({ error: 'Sorteo no encontrado' });
  }

  // Actualizar premios con datos de ganadores
  if (Array.isArray(ganadores)) {
    ganadores.forEach((g: any) => {
      const premio = sorteo.premios.find(p => p.id === g.premioId);
      if (premio) {
        if (Array.isArray(g.ganadores)) {
          premio.ganadores = g.ganadores;
          const first = g.ganadores[0];
          if (first) {
            premio.ganadorTicket = first.numeroTicket;
            premio.ganadorNombre = first.nombre;
            premio.ganadorDni = first.dni;
          }
        } else if (g.ticketNumero) {
          premio.ganadorTicket = g.ticketNumero;
          premio.ganadorNombre = g.ganadorNombre;
          premio.ganadorDni = g.ganadorDni;
          premio.ganadores = [{
            numeroTicket: g.ticketNumero,
            dni: g.ganadorDni,
            nombre: g.ganadorNombre,
            telefono: g.telefono,
            fechaAsignacion: new Date().toISOString()
          }];
        }
      }
    });
  }

  sorteo.estado = 'FINALIZADO';
  db.updateSorteo(id, sorteo);

  return res.json({ mensaje: 'Sorteo finalizado exitosamente', sorteo });
});

// Exportar reporte completo a Excel (.xlsx)
router.get('/sorteos/:id/exportar-excel', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const buffer = await ExcelService.generarReporteSorteo(id);
    const sorteo = db.getSorteoById(id);
    const filename = `Reporte_Sorteo_${sorteo ? sorteo.titulo.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_') : id}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error: any) {
    console.error('Error al exportar Excel:', error);
    return res.status(500).json({ error: error.message || 'Error al generar Excel' });
  }
});

// ==========================================
// 2. RUTAS DE OCR Y COMPROBANTES
// ==========================================

// Pre-analizar comprobante con OCR antes de enviar el formulario
router.post('/comprobantes/analizar-ocr', upload.single('comprobante'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Debe subir un archivo de comprobante' });
    }

    const resultado = await OcrService.analizarComprobante(req.file.path);
    return res.json({
      ...resultado,
      archivoUrl: `/uploads/${req.file.filename}`
    });
  } catch (error: any) {
    console.error('Error en ruta OCR:', error);
    return res.status(500).json({ error: error.message || 'Error al analizar comprobante con OCR' });
  }
});

// ==========================================
// 3. RUTAS DE COMPRAS Y TICKETS
// ==========================================

// Registrar compra con comprobante (Cliente)
router.post('/compras', upload.single('comprobante'), async (req: Request, res: Response) => {
  try {
    const {
      sorteoId,
      dni,
      nombreCompleto,
      celular,
      cantidadTickets,
      metodoPago,
      codigoOperacionManual
    } = req.body;

    if (!dni || !nombreCompleto || !celular || !cantidadTickets) {
      return res.status(400).json({ error: 'Faltan datos obligatorios del participante' });
    }

    const sorteo = db.getSorteoById(sorteoId) || db.getSorteoActivo();
    if (!sorteo) {
      return res.status(400).json({ error: 'No se encontró el sorteo especificado' });
    }

    let comprobanteUrl = '';
    let codigoOperacion = codigoOperacionManual || '';
    let ocrVerificado = false;

    // Si viene archivo, lo procesamos
    if (req.file) {
      comprobanteUrl = `/uploads/${req.file.filename}`;
      // Si no nos enviaron el código ya escaneado, lo pasamos por el OCR
      if (!codigoOperacion) {
        const ocr = await OcrService.analizarComprobante(req.file.path);
        if (ocr.codigoOperacion) {
          codigoOperacion = ocr.codigoOperacion;
          ocrVerificado = true;
        }
      }
    }

    // VALIDACIÓN ANTIDUPLICADOS: Verificar si el código ya existe
    if (codigoOperacion && db.existeCodigoOperacion(codigoOperacion)) {
      return res.status(400).json({
        error: `El comprobante con N° de Operación #${codigoOperacion} ya fue registrado en el sistema. No se permiten comprobantes duplicados.`
      });
    }

    const cant = parseInt(cantidadTickets, 10) || 1;
    const montoTotal = cant * Number(sorteo.precioTicket);

    const nuevaCompra: Compra = {
      id: uuidv4(),
      sorteoId: sorteo.id,
      sorteoTitulo: sorteo.titulo,
      dni: dni.trim(),
      nombreCompleto: nombreCompleto.trim(),
      celular: celular.trim(),
      cantidadTickets: cant,
      montoTotal,
      metodoPago: metodoPago || 'YAPE',
      comprobanteUrl,
      codigoOperacion,
      ocrVerificado,
      estado: 'PENDIENTE', // PENDIENTE DE VERIFICACIÓN
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createCompra(nuevaCompra);

    // Notificar en tiempo real al panel del administrador
    notificarNuevaCompraAdmin(nuevaCompra);

    return res.status(201).json({
      mensaje: 'Compra registrada con éxito. Tu pago está pendiente de verificación.',
      compra: nuevaCompra
    });
  } catch (error: any) {
    console.error('Error al registrar compra:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Consultar compras y tickets por DNI ("Mis Tickets")
router.get('/compras/mis-tickets/:dni', (req: Request, res: Response) => {
  const dni = String(req.params.dni).trim();
  const compras = db.getComprasByDni(dni);
  const tickets = db.getTicketsByDni(dni);

  // Mapear los tickets dentro de cada compra correspondiente
  const resultado = compras.map(c => ({
    ...c,
    tickets: tickets.filter(t => t.compraId === c.id)
  }));

  return res.json(resultado);
});

// Listar compras para el panel de administración
router.get('/compras', (req: Request, res: Response) => {
  const sorteoId = req.query.sorteoId as string | undefined;
  const estado = req.query.estado as string | undefined;

  let compras = db.getCompras(sorteoId);
  if (estado) {
    compras = compras.filter(c => c.estado === estado);
  }

  const tickets = db.getTickets(sorteoId);
  const comprasConTickets = compras.map(c => ({
    ...c,
    tickets: tickets.filter(t => t.compraId === c.id)
  }));

  return res.json(comprasConTickets);
});

// Cambiar estado de compra (Aprobar a 'PARTICIPANDO' o Rechazar a 'RECHAZADO')
router.patch('/compras/:id/estado', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { estado, motivoRechazo } = req.body;

  if (estado !== 'PARTICIPANDO' && estado !== 'RECHAZADO' && estado !== 'PENDIENTE') {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  const compra = db.getCompraById(id);
  if (!compra) {
    return res.status(404).json({ error: 'Compra no encontrada' });
  }

  // Si se aprueba a PARTICIPANDO, generamos los números de tickets correlativos únicos
  if (estado === 'PARTICIPANDO' && compra.estado !== 'PARTICIPANDO') {
    const ultimoNumero = db.getUltimoNumeroTicket(compra.sorteoId);
    const nuevosTickets: Ticket[] = [];

    for (let i = 1; i <= compra.cantidadTickets; i++) {
      const num = ultimoNumero + i;
      nuevosTickets.push({
        id: uuidv4(),
        compraId: compra.id,
        sorteoId: compra.sorteoId,
        numero: num,
        numeroFormateado: `#${String(num).padStart(7, '0')}`,
        dni: compra.dni,
        nombreCompleto: compra.nombreCompleto,
        estado: 'PARTICIPANDO',
        esGanador: false,
      });
    }

    db.addTickets(nuevosTickets);
  }

  compra.estado = estado;
  if (motivoRechazo) compra.motivoRechazo = motivoRechazo;
  db.updateCompra(id, compra);

  // Notificar al cliente y al admin en tiempo real
  notificarActualizacionTicketCliente(compra);

  return res.json({ mensaje: `Compra actualizada a ${estado}`, compra });
});

// ==========================================
// 4. RUTAS DE CHAT EN TIEMPO REAL
// ==========================================

// Listar todas las conversaciones activas (Admin)
router.get('/chat/conversaciones', (_req: Request, res: Response) => {
  const conversaciones = db.getConversaciones();
  return res.json(conversaciones);
});

// Obtener mensajes de una conversación específica o por DNI
router.get('/chat/:idOrDni', (req: Request, res: Response) => {
  const param = String(req.params.idOrDni).trim();
  let conversacion = db.getConversacionById(param) || db.getConversacionByDni(param);
  if (!conversacion) {
    return res.json({ mensajes: [] });
  }
  return res.json(conversacion);
});

// Subir imagen de código QR para billetera digital
router.post('/configuracion/subir-qr', upload.single('qr'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Debe subir una imagen de código QR' });
  }
  const qrUrl = `/uploads/${req.file.filename}`;
  return res.json({ qrUrl });
});

// Subir imagen de logo oficial del negocio
router.post('/configuracion/subir-logo', upload.single('logo'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Debe subir una imagen de logo' });
  }
  const logoUrl = `/uploads/${req.file.filename}`;
  const config = db.updateConfiguracion({ logoUrl });
  return res.json({ logoUrl, config });
});

router.get('/configuracion', (_req: Request, res: Response) => {
  return res.json(db.getConfiguracion());
});

router.put('/configuracion', (req: Request, res: Response) => {
  const updated = db.updateConfiguracion(req.body);
  return res.json(updated);
});

// ==========================================
// 5. LIBRO DE RECLAMACIONES
// ==========================================
router.get('/reclamaciones', (_req: Request, res: Response) => {
  return res.json(db.getReclamaciones());
});

router.post('/reclamaciones', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.nombres || !data.numeroDocumento || !data.detalle) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const year = new Date().getFullYear();
  const count = db.getReclamaciones().length + 1;
  const codigo = `REC-${year}-${String(count).padStart(4, '0')}`;

  const reclamacion: Reclamacion = {
    id: uuidv4(),
    codigo,
    tipo: data.tipo || 'RECLAMO',
    fecha: new Date().toISOString(),
    nombres: data.nombres,
    apellidos: data.apellidos || '',
    tipoDocumento: data.tipoDocumento || 'DNI',
    numeroDocumento: data.numeroDocumento,
    email: data.email || '',
    telefono: data.telefono || '',
    domicilio: data.domicilio || '',
    montoReclamado: data.montoReclamado ? Number(data.montoReclamado) : undefined,
    descripcionBien: data.descripcionBien || 'Ticket de sorteo',
    detalle: data.detalle,
    pedido: data.pedido || '',
    estado: 'PENDIENTE',
  };

  db.createReclamacion(reclamacion);
  return res.status(201).json({ exito: true, reclamacion });
});

router.put('/reclamaciones/:id/estado', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { estado, respuesta } = req.body;
  const updated = db.updateReclamacionEstado(id, estado, respuesta);
  if (!updated) {
    return res.status(404).json({ error: 'Reclamación no encontrada' });
  }
  return res.json(updated);
});

// ==========================================
// 6. SALÓN DE LA FAMA (GANADORES)
// ==========================================
router.get('/ganadores-fama', (_req: Request, res: Response) => {
  return res.json(db.getGanadoresFama());
});

router.post('/ganadores-fama/subir-foto', upload.single('foto'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Debe subir una imagen' });
  }
  const fotoUrl = `/uploads/${req.file.filename}`;
  return res.json({ fotoUrl });
});

router.post('/ganadores-fama', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.nombre || !data.premio || !data.fotoUrl) {
    return res.status(400).json({ error: 'Nombre, premio y fotoUrl son obligatorios' });
  }
  const ganador: GanadorFama = {
    id: uuidv4(),
    nombre: data.nombre,
    premio: data.premio,
    sorteoTitulo: data.sorteoTitulo,
    ticketNumero: data.ticketNumero,
    fotoUrl: data.fotoUrl,
    fecha: data.fecha || new Date().toISOString().slice(0, 10),
    ciudad: data.ciudad || 'Perú',
    orden: Number(data.orden) || 1,
  };
  db.createGanadorFama(ganador);
  return res.status(201).json(ganador);
});

router.delete('/ganadores-fama/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const eliminado = db.deleteGanadorFama(id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Ganador no encontrado' });
  }
  return res.json({ exito: true });
});

export default router;

