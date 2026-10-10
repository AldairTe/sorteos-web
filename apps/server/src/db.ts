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
    id: 'sorteo-dinamica-2027',
    codigo: 'SORTEO #001',
    titulo: 'Gran Sorteo: Premios de la Dinámica',
    descripcion: '¡Participa por autos 0 Km año 2027, mototaxi Torito TVS, laptops gamer HP Victus, iPhones 17 Pro Max, PlayStation 5 y 100 premios en efectivo de S/ 500!',
    precioTicket: 5,
    fechaSorteo: '2026-11-28',
    horaSorteo: '20:00',
    fechaCierre: '2026-11-28',
    horaCierre: '19:30',
    estado: 'ACTIVO',
    imagenPrincipal: '/uploads/sorteo-dinamica-banner.png',
    metaTickets: 5000,
    yapeNumero: '987 654 321',
    yapeNombre: 'Juan Lorenzo Perez',
    yapeQr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=YAPE:987654321',
    plinNumero: '987 654 321',
    plinNombre: 'Juan Lorenzo Perez',
    plinQr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PLIN:987654321',
    createdAt: new Date().toISOString(),
    premios: [
      {
        id: 'premio-dinamica-1',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '1 NISSAN URVAN 0 KM AÑO 2027',
        descripcion: 'Miniván de pasajeros color blanco 0 Km año 2027, motor diésel de alta durabilidad y máximo confort.',
        categoria: 'Miniván / Pasajeros',
        modelo: 'Nissan Urvan NV350 2027',
        cantidad: 1,
        esMayor: true,
        orden: 1,
        imagenUrl: '/uploads/premio-nissan-urvan.png',
        valorEstimado: 130000
      },
      {
        id: 'premio-dinamica-2',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '1 TOYOTA RUSH 0 KM AÑO 2027',
        descripcion: 'Camioneta SUV moderna color rojo metálico 0 Km año 2027, 3 filas de asientos, pantalla multimedia y aros de aleación.',
        categoria: 'Camioneta SUV',
        modelo: 'Toyota Rush Full 2027',
        cantidad: 1,
        esMayor: true,
        orden: 2,
        imagenUrl: '/uploads/premio-toyota-rush.png',
        valorEstimado: 95000
      },
      {
        id: 'premio-dinamica-3',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '1 TOYOTA YARIS 0 KM AÑO 2027',
        descripcion: 'Sedán color plateado 0 Km año 2027, excelente rendimiento de combustible, transmisión moderna y seguridad garantizada.',
        categoria: 'Sedán / Auto',
        modelo: 'Toyota Yaris Sedán 2027',
        cantidad: 1,
        esMayor: false,
        orden: 3,
        imagenUrl: '/uploads/premio-toyota-yaris.png',
        valorEstimado: 75000
      },
      {
        id: 'premio-dinamica-4',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '1 MOTO TORITO TVS 0 KM - COLOR AZUL',
        descripcion: 'Mototaxi Torito TVS 0 Km color azul, motor 4 tiempos de alta potencia, lista para transporte y trabajo diario.',
        categoria: 'Vehículo Menor',
        modelo: 'Torito TVS King Deluxe 200cc',
        cantidad: 1,
        esMayor: false,
        orden: 4,
        imagenUrl: '/uploads/premio-torito-tvs.png',
        valorEstimado: 18000
      },
      {
        id: 'premio-dinamica-5',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '2 LAPTOP GAMER HP VICTUS',
        descripcion: 'Laptops potentes para gaming y edición profesional, procesador de alto rendimiento, gráficos dedicados y pantalla IPS 144Hz.',
        categoria: 'Laptop Gamer',
        modelo: 'HP Victus Gaming 15.6"',
        cantidad: 2,
        esMayor: false,
        orden: 5,
        imagenUrl: '/uploads/premio-laptop-victus.png',
        valorEstimado: 4200
      },
      {
        id: 'premio-dinamica-6',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '3 iPhone 17 Pro Max de 256 GB COLOR BLANCO',
        descripcion: 'Smartphones Apple de última generación, 256 GB de memoria, color blanco titanio, sellados en caja con garantía oficial.',
        categoria: 'Smartphone / Apple',
        modelo: 'iPhone 17 Pro Max 256GB Blanco',
        cantidad: 3,
        esMayor: false,
        orden: 6,
        imagenUrl: '/uploads/premio-iphone-17-pro.png',
        valorEstimado: 6500
      },
      {
        id: 'premio-dinamica-7',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '1 PLAYSTATION 5',
        descripcion: 'Consola Sony PlayStation 5 con mando inalámbrico DualSense, lector de disco y retrocompatibilidad total.',
        categoria: 'Videojuegos / Consola',
        modelo: 'Sony PlayStation 5 Slim',
        cantidad: 1,
        esMayor: false,
        orden: 7,
        imagenUrl: '/uploads/premio-playstation-5.png',
        valorEstimado: 2900
      },
      {
        id: 'premio-dinamica-8',
        sorteoId: 'sorteo-dinamica-2027',
        nombre: '100 PREMIOS DE S/500',
        descripcion: '100 premios en dinero en efectivo de S/ 500 cada uno, entregados de inmediato por transferencia bancaria, Yape o Plin.',
        categoria: 'Dinero en Efectivo',
        modelo: 'Efectivo Soles (S/ 500 cada uno)',
        cantidad: 100,
        esMayor: false,
        orden: 8,
        imagenUrl: '/uploads/premio-efectivo-500.png',
        valorEstimado: 50000
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

