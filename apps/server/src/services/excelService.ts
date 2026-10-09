import ExcelJS from 'exceljs';
import { Sorteo, Compra, Ticket } from '@sorteos/shared';
import { db } from '../db';

export class ExcelService {
  /**
   * Genera un libro de Excel profesional con todo el histórico del sorteo
   */
  public static async generarReporteSorteo(sorteoId: string): Promise<ExcelJS.Buffer> {
    const sorteo = db.getSorteoById(sorteoId);
    if (!sorteo) {
      throw new Error(`Sorteo con ID ${sorteoId} no encontrado`);
    }

    const compras = db.getCompras(sorteoId);
    const tickets = db.getTickets(sorteoId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Sorteos Digitales';
    workbook.created = new Date();

    // ----------------------------------------------------
    // HOJA 1: PARTICIPANTES Y TICKETS
    // ----------------------------------------------------
    const sheetParticipantes = workbook.addWorksheet('Participantes y Tickets', {
      views: [{ showGridLines: true }]
    });

    sheetParticipantes.columns = [
      { header: 'N°', key: 'idx', width: 6 },
      { header: 'DNI', key: 'dni', width: 14 },
      { header: 'Nombre Completo', key: 'nombre', width: 30 },
      { header: 'Celular / WhatsApp', key: 'celular', width: 18 },
      { header: 'Cant. Tickets', key: 'cantidad', width: 14 },
      { header: 'Números de Tickets Asignados', key: 'ticketsStr', width: 35 },
      { header: 'Monto Total (S/)', key: 'monto', width: 16 },
      { header: 'Método', key: 'metodo', width: 12 },
      { header: 'N° Operación (OCR)', key: 'operacion', width: 20 },
      { header: 'Estado', key: 'estado', width: 18 },
      { header: 'Fecha de Registro', key: 'fecha', width: 22 },
    ];

    // Estilos del encabezado
    sheetParticipantes.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetParticipantes.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6C24E8' } // Morado elegante
    };
    sheetParticipantes.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    compras.forEach((compra, index) => {
      const ticketsAsignados = tickets
        .filter(t => t.compraId === compra.id)
        .map(t => t.numeroFormateado)
        .join(', ');

      const row = sheetParticipantes.addRow({
        idx: index + 1,
        dni: compra.dni,
        nombre: compra.nombreCompleto,
        celular: compra.celular,
        cantidad: compra.cantidadTickets,
        ticketsStr: ticketsAsignados || 'Sin asignar (Pendiente)',
        monto: Number(compra.montoTotal).toFixed(2),
        metodo: compra.metodoPago,
        operacion: compra.codigoOperacion || 'N/A',
        estado: compra.estado,
        fecha: new Date(compra.createdAt).toLocaleString('es-PE'),
      });

      // Color condicional por estado
      const cellEstado = row.getCell('estado');
      if (compra.estado === 'PARTICIPANDO') {
        cellEstado.font = { bold: true, color: { argb: 'FF10B981' } };
      } else if (compra.estado === 'PENDIENTE') {
        cellEstado.font = { bold: true, color: { argb: 'FFF59E0B' } };
      } else {
        cellEstado.font = { bold: true, color: { argb: 'FFEF4444' } };
      }
    });

    // ----------------------------------------------------
    // HOJA 2: PREMIOS Y GANADORES
    // ----------------------------------------------------
    const sheetGanadores = workbook.addWorksheet('Ganadores y Premios');
    sheetGanadores.columns = [
      { header: 'Premio', key: 'premio', width: 32 },
      { header: 'Tipo', key: 'tipo', width: 16 },
      { header: 'N° Ticket Ganador', key: 'ticket', width: 20 },
      { header: 'DNI Ganador', key: 'dni', width: 14 },
      { header: 'Nombre del Ganador', key: 'nombre', width: 30 },
    ];

    sheetGanadores.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetGanadores.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4C1D95' }
    };
    sheetGanadores.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    sorteo.premios.forEach(p => {
      sheetGanadores.addRow({
        premio: p.nombre,
        tipo: p.esMayor ? '⭐ Premio Mayor' : 'Premio Secundario',
        ticket: p.ganadorTicket ? `#${String(p.ganadorTicket).padStart(5, '0')}` : 'Por sortear',
        dni: p.ganadorDni || '-',
        nombre: p.ganadorNombre || '-',
      });
    });

    // ----------------------------------------------------
    // HOJA 3: RESUMEN ECONÓMICO Y ESTADÍSTICAS
    // ----------------------------------------------------
    const sheetResumen = workbook.addWorksheet('Resumen General');
    sheetResumen.columns = [
      { header: 'Métrica', key: 'metrica', width: 32 },
      { header: 'Valor', key: 'valor', width: 30 }
    ];

    sheetResumen.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetResumen.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E1B4B' }
    };

    const totalRecaudado = compras
      .filter(c => c.estado === 'PARTICIPANDO')
      .reduce((acc, c) => acc + Number(c.montoTotal), 0);

    const ticketsParticipando = tickets.filter(t => t.estado === 'PARTICIPANDO').length;
    const comprasPendientes = compras.filter(c => c.estado === 'PENDIENTE').length;

    sheetResumen.addRow({ metrica: 'Título del Sorteo', valor: sorteo.titulo });
    sheetResumen.addRow({ metrica: 'Precio por Ticket', valor: `S/ ${sorteo.precioTicket.toFixed(2)}` });
    sheetResumen.addRow({ metrica: 'Fecha del Sorteo', valor: `${sorteo.fechaSorteo} ${sorteo.horaSorteo}` });
    sheetResumen.addRow({ metrica: 'Total Personas que Compraron', valor: compras.length });
    sheetResumen.addRow({ metrica: 'Tickets Activos en el Sorteo', valor: ticketsParticipando });
    sheetResumen.addRow({ metrica: 'Compras Pendientes de Revisión', valor: comprasPendientes });
    sheetResumen.addRow({ metrica: 'Total Recaudado Efectivo (Aprobados)', valor: `S/ ${totalRecaudado.toFixed(2)}` });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as ExcelJS.Buffer;
  }
}
