import fs from 'fs';
import path from 'path';
import { Sorteo, Compra, Ticket, Conversacion, MensajeChat, ConfiguracionWeb, Reclamacion, GanadorFama } from '@sorteos/shared';

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

// Crear directorio data si no existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBData {
  configuracion: ConfiguracionWeb;
  sorteos: Sorteo[];
  compras: Compra[];
  tickets: Ticket[];
  conversaciones: Conversacion[];
  reclamaciones: Reclamacion[];
  ganadoresFama: GanadorFama[];
}

const DEFAULT_BILLETERAS = [
  {
    id: 'billetera-yape',
    nombre: 'Yape Oficial',
    tipo: 'YAPE',
    numero: '987 654 321',
    titular: 'Juan Lorenzo Perez',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=YAPE:987654321',
    color: '#742284',
    instrucciones: 'Aceptamos transferencias Yape las 24 horas',
    activo: true,
  },
  {
    id: 'billetera-plin',
    nombre: 'Plin',
    tipo: 'PLIN',
    numero: '987 654 321',
    titular: 'Juan Lorenzo Perez',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PLIN:987654321',
    color: '#00D2B5',
    instrucciones: 'Transferencia directa desde BBVA, Interbank o Scotiabank',
    activo: true,
  },
  {
    id: 'billetera-bcp',
    nombre: 'BCP Transferencia Bancaria',
    tipo: 'BANCO',
    numero: '191-98765432-0-45',
    titular: 'Juan Lorenzo Perez (Sorteos Oficiales)',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BCP:19198765432045',
    color: '#002A8F',
    instrucciones: 'CCI Interbancario: 002-1910098765432045-56',
    activo: true,
  }
];

const DEFAULT_CONFIG: ConfiguracionWeb = {
  nombreNegocio: 'Sorteos El Trébol',
  slogan: '¡Participa, sueña y gana grandes premios!',
  tituloPestana: 'Sorteos El Trébol — Gana Autos, Motos y Dinero en Efectivo',
  ruc: '20609876543',
  razonSocial: 'SORTEOS EL TREBOL S.A.C.',
  direccionLegal: 'Av. Las Palmeras 1234, San Isidro, Lima, Perú',
  emailLegal: 'contacto@sorteoseltrebol.com',
  telefonoLegal: '+51 987 654 321',
  yapeNumero: '987 654 321',
  yapeNombre: 'Juan Lorenzo Perez',
  yapeQr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=YAPE:987654321',
  plinNumero: '987 654 321',
  plinNombre: 'Juan Lorenzo Perez',
  plinQr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PLIN:987654321',
  billeteras: DEFAULT_BILLETERAS,
  whatsappNumero: '+51987654321',
  whatsappMensaje: 'Hola, tengo una consulta sobre el sorteo activo.',
  facebookUrl: 'https://facebook.com',
  tiktokUrl: 'https://tiktok.com',
  canalTransmisionUrl: 'https://facebook.com/live',
  transmisionesActiva: true,
  transmisionFacebookUrl: 'https://facebook.com/sorteoseltrebol.oficial',
  transmisionFacebookActivo: true,
  transmisionWhatsappUrl: 'https://chat.whatsapp.com/invite/sorteos-comunidad',
  transmisionWhatsappActivo: true,
};

const DEFAULT_GANADORES_FAMA: GanadorFama[] = [
  {
    id: 'fama-1',
    nombre: 'Carlos Mendoza',
    premio: 'Toyota RAV4 Híbrida 0 Km',
    sorteoTitulo: 'La Gran Fortuna #001',
    ticketNumero: '#002847',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    fecha: '2026-09-15',
    ciudad: 'Lima, Perú',
    orden: 1,
  },
  {
    id: 'fama-2',
    nombre: 'Valeria Quispe',
    premio: 'MacBook Air M3 + iPhone 16 Pro',
    sorteoTitulo: 'Sorteo Apple Pro',
    ticketNumero: '#001429',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    fecha: '2026-08-30',
    ciudad: 'Arequipa, Perú',
    orden: 2,
  },
  {
    id: 'fama-3',
    nombre: 'Jorge Luis Huamán',
    premio: 'S/ 10,000 en Efectivo',
    sorteoTitulo: 'Mega Sorteo 4x4',
    ticketNumero: '#005932',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    fecha: '2026-08-10',
    ciudad: 'Trujillo, Perú',
    orden: 3,
  }
];


const DEFAULT_SORTEOS: Sorteo[] = [
  {
    id: 'sorteo-activo-1',
    codigo: 'SORTEO #001',
    titulo: 'La Gran Fortuna',
    descripcion: 'Tu oportunidad de ganar grandes premios.',
    precioTicket: 10.00,
    fechaSorteo: '2026-10-20',
    horaSorteo: '20:00',
    fechaCierre: '2026-10-20',
    horaCierre: '20:00',
    estado: 'ACTIVO',
    imagenPrincipal: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
    metaTickets: 1000,
    yapeNumero: '987 654 321',
    yapeNombre: 'Juan Lorenzo Perez',
    yapeQr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=YAPE:987654321',
    plinNumero: '987 654 321',
    plinNombre: 'Juan Lorenzo Perez',
    plinQr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PLIN:987654321',
    createdAt: new Date().toISOString(),
    premios: [
      {
        id: 'premio-1',
        sorteoId: 'sorteo-activo-1',
        nombre: 'Toyota RAV4',
        descripcion: 'El gran premio del sorteo',
        categoria: 'Vehículo SUV',
        modelo: 'Toyota RAV4 Híbrida 0 Km',
        cantidad: 1,
        esMayor: true,
        orden: 1,
        imagenUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-2',
        sorteoId: 'sorteo-activo-1',
        nombre: 'MacBook Air',
        descripcion: 'Chip M3 con 512GB SSD',
        categoria: 'Laptop',
        modelo: 'MacBook Air',
        cantidad: 2,
        esMayor: false,
        orden: 2,
        imagenUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-3',
        sorteoId: 'sorteo-activo-1',
        nombre: 'iPhone 16',
        descripcion: 'Titanio 256GB Sellado en caja',
        categoria: 'Smartphone',
        modelo: 'iPhone 16',
        cantidad: 4,
        esMayor: false,
        orden: 3,
        imagenUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-4',
        sorteoId: 'sorteo-activo-1',
        nombre: 'AirPods Max',
        descripcion: 'Cancelación de ruido activa',
        categoria: 'Audífonos',
        modelo: 'AirPods Max',
        cantidad: 4,
        esMayor: false,
        orden: 4,
        imagenUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'sorteo-activo-2',
    titulo: 'Mega Sorteo 4x4: ¡Camioneta Toyota Hilux + Cuatrimoto + S/ 5,000!',
    descripcion: '¡El sorteo más esperado del año! Llévate una Hilux 0Km o su valor en efectivo.',
    precioTicket: 20.00,
    fechaSorteo: '2026-11-15',
    horaSorteo: '21:00',
    fechaCierre: '2026-11-15',
    horaCierre: '19:00',
    estado: 'ACTIVO',
    imagenPrincipal: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
    metaTickets: 3000,
    yapeNumero: '987 654 321',
    yapeNombre: 'Juan Lorenzo Perez',
    createdAt: new Date().toISOString(),
    premios: [
      {
        id: 'premio-hilux-1',
        sorteoId: 'sorteo-activo-2',
        nombre: 'Camioneta Toyota Hilux 4x4 (0 Km)',
        descripcion: 'Doble cabina, motor 2.8L turbo diésel, equipamiento completo.',
        esMayor: true,
        orden: 1,
        imagenUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-hilux-2',
        sorteoId: 'sorteo-activo-2',
        nombre: 'Cuatrimoto Yamaha Raptor 700R',
        descripcion: 'Edición especial todoterreno con amortiguación de alto rendimiento.',
        esMayor: false,
        orden: 2,
        imagenUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-hilux-3',
        sorteoId: 'sorteo-activo-2',
        nombre: 'S/ 5,000 en Efectivo para Combustible',
        descripcion: 'Premio en efectivo entregado el mismo día de la transmisión.',
        esMayor: false,
        orden: 3,
        imagenUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'sorteo-activo-3',
    titulo: 'Sorteo Apple Pro: ¡iPhone 16 Pro Max + MacBook Air M3 + S/ 2,000!',
    descripcion: 'El combo Apple definitivo con los equipos más potentes de última generación.',
    precioTicket: 10.00,
    fechaSorteo: '2026-11-05',
    horaSorteo: '19:30',
    fechaCierre: '2026-11-05',
    horaCierre: '18:00',
    estado: 'ACTIVO',
    imagenPrincipal: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
    metaTickets: 1500,
    createdAt: new Date().toISOString(),
    premios: [
      {
        id: 'premio-apple-1',
        sorteoId: 'sorteo-activo-3',
        nombre: 'iPhone 16 Pro Max 256GB Titanio Natural',
        descripcion: 'Sellado en caja, libre para cualquier operador, garantía oficial Apple.',
        esMayor: true,
        orden: 1,
        imagenUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-apple-2',
        sorteoId: 'sorteo-activo-3',
        nombre: 'MacBook Air 15" Chip M3',
        descripcion: 'Memoria unificada de 16GB, 512GB SSD, color Medianoche.',
        esMayor: false,
        orden: 2,
        imagenUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'premio-apple-3',
        sorteoId: 'sorteo-activo-3',
        nombre: 'S/ 2,000 en Efectivo directo a tu cuenta',
        descripcion: 'Premio en efectivo para accesorios o libre disposición.',
        esMayor: false,
        orden: 3,
        imagenUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80'
      }
    ]
  }
];

class Database {
  private data: DBData;

  constructor() {
    this.data = this.load();
  }

  private load(): DBData {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Garantizar que existan las billeteras y múltiples sorteos si es una base vieja
        if (!parsed.configuracion.billeteras || parsed.configuracion.billeteras.length === 0) {
          parsed.configuracion.billeteras = DEFAULT_BILLETERAS;
        }
        if (!parsed.sorteos || parsed.sorteos.length <= 1) {
          parsed.sorteos = DEFAULT_SORTEOS;
        }
        if (!parsed.reclamaciones) {
          parsed.reclamaciones = [];
        }
        if (!parsed.ganadoresFama || parsed.ganadoresFama.length === 0) {
          parsed.ganadoresFama = DEFAULT_GANADORES_FAMA;
        }
        // Migración de campos legales y de streaming en configuración si no existen
        parsed.configuracion = {
          ...DEFAULT_CONFIG,
          ...parsed.configuracion,
        };
        this.saveData(parsed);
        return parsed;
      } catch (e) {
        console.error('Error cargando base de datos JSON, inicializando por defecto:', e);
      }
    }

    const initial: DBData = {
      configuracion: DEFAULT_CONFIG,
      sorteos: DEFAULT_SORTEOS,
      compras: [],
      tickets: [],
      conversaciones: [],
      reclamaciones: [],
      ganadoresFama: DEFAULT_GANADORES_FAMA,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DBData): void {
    const d = dataToSave || this.data;
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), 'utf-8');
  }

  public save(): void {
    this.saveData();
  }

  // Sorteos
  public getSorteos(): Sorteo[] {
    return this.data.sorteos;
  }

  public getSorteoActivo(): Sorteo | undefined {
    return this.data.sorteos.find(s => s.estado === 'ACTIVO');
  }

  public getSorteoById(id: string): Sorteo | undefined {
    return this.data.sorteos.find(s => s.id === id);
  }

  public createSorteo(sorteo: Sorteo): Sorteo {
    this.data.sorteos.push(sorteo);
    this.save();
    return sorteo;
  }

  public updateSorteo(id: string, updates: Partial<Sorteo>): Sorteo | null {
    const idx = this.data.sorteos.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.sorteos[idx] = { ...this.data.sorteos[idx], ...updates };
    this.save();
    return this.data.sorteos[idx];
  }

  // Compras y Validación Antifraude
  public getCompras(sorteoId?: string): Compra[] {
    if (sorteoId) {
      return this.data.compras.filter(c => c.sorteoId === sorteoId);
    }
    return this.data.compras;
  }

  public getComprasByDni(dni: string, sorteoId?: string): Compra[] {
    return this.data.compras.filter(c => {
      const matchDni = c.dni.trim() === dni.trim();
      return sorteoId ? matchDni && c.sorteoId === sorteoId : matchDni;
    });
  }

  public getCompraById(id: string): Compra | undefined {
    return this.data.compras.find(c => c.id === id);
  }

  /**
   * Verifica si un código de operación ya existe en cualquier compra (evita duplicados)
   */
  public existeCodigoOperacion(codigo: string): boolean {
    if (!codigo || codigo.trim().length === 0) return false;
    const cleanCode = codigo.replace(/\D/g, '');
    if (!cleanCode) return false;
    return this.data.compras.some(c => c.codigoOperacion && c.codigoOperacion.replace(/\D/g, '') === cleanCode);
  }

  public createCompra(compra: Compra): Compra {
    this.data.compras.push(compra);
    this.save();
    return compra;
  }

  public updateCompra(id: string, updates: Partial<Compra>): Compra | null {
    const idx = this.data.compras.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.compras[idx] = { ...this.data.compras[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.compras[idx];
  }

  // Tickets
  public getTickets(sorteoId?: string): Ticket[] {
    if (sorteoId) {
      return this.data.tickets.filter(t => t.sorteoId === sorteoId);
    }
    return this.data.tickets;
  }

  public getTicketsByDni(dni: string, sorteoId?: string): Ticket[] {
    return this.data.tickets.filter(t => {
      const match = t.dni.trim() === dni.trim();
      return sorteoId ? match && t.sorteoId === sorteoId : match;
    });
  }

  public getUltimoNumeroTicket(sorteoId: string): number {
    const ticketsSorteo = this.data.tickets.filter(t => t.sorteoId === sorteoId);
    if (ticketsSorteo.length === 0) return 0;
    return Math.max(...ticketsSorteo.map(t => t.numero));
  }

  public addTickets(nuevosTickets: Ticket[]): void {
    this.data.tickets.push(...nuevosTickets);
    this.save();
  }

  public limpiarTicketsSorteo(sorteoId: string): void {
    this.data.tickets = this.data.tickets.filter(t => t.sorteoId !== sorteoId);
    this.save();
  }

  // Chat
  public getConversaciones(): Conversacion[] {
    return this.data.conversaciones;
  }

  public getConversacionByDni(dni: string): Conversacion | undefined {
    return this.data.conversaciones.find(c => c.clienteDni.trim() === dni.trim());
  }

  public getConversacionById(id: string): Conversacion | undefined {
    return this.data.conversaciones.find(c => c.id === id);
  }

  public saveConversacion(conversacion: Conversacion): void {
    const idx = this.data.conversaciones.findIndex(c => c.id === conversacion.id);
    if (idx === -1) {
      this.data.conversaciones.push(conversacion);
    } else {
      this.data.conversaciones[idx] = conversacion;
    }
    this.save();
  }

  // Configuración
  public getConfiguracion(): ConfiguracionWeb {
    return this.data.configuracion;
  }

  public updateConfiguracion(updates: Partial<ConfiguracionWeb>): ConfiguracionWeb {
    this.data.configuracion = { ...this.data.configuracion, ...updates };
    this.save();
    return this.data.configuracion;
  }

  // Libro de Reclamaciones
  public getReclamaciones(): Reclamacion[] {
    return this.data.reclamaciones || [];
  }

  public getReclamacionById(id: string): Reclamacion | undefined {
    return (this.data.reclamaciones || []).find(r => r.id === id);
  }

  public createReclamacion(rec: Reclamacion): Reclamacion {
    if (!this.data.reclamaciones) this.data.reclamaciones = [];
    this.data.reclamaciones.unshift(rec);
    this.save();
    return rec;
  }

  public updateReclamacionEstado(id: string, estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO', respuesta?: string): Reclamacion | null {
    if (!this.data.reclamaciones) return null;
    const idx = this.data.reclamaciones.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reclamaciones[idx].estado = estado;
    if (respuesta !== undefined) {
      this.data.reclamaciones[idx].respuesta = respuesta;
      this.data.reclamaciones[idx].fechaRespuesta = new Date().toISOString();
    }
    this.save();
    return this.data.reclamaciones[idx];
  }

  // Salón de la Fama
  public getGanadoresFama(): GanadorFama[] {
    return this.data.ganadoresFama || [];
  }

  public createGanadorFama(ganador: GanadorFama): GanadorFama {
    if (!this.data.ganadoresFama) this.data.ganadoresFama = [];
    this.data.ganadoresFama.unshift(ganador);
    this.save();
    return ganador;
  }

  public deleteGanadorFama(id: string): boolean {
    if (!this.data.ganadoresFama) return false;
    const initialLen = this.data.ganadoresFama.length;
    this.data.ganadoresFama = this.data.ganadoresFama.filter(g => g.id !== id);
    if (this.data.ganadoresFama.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();

