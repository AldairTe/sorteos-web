// Estados del ticket / compra
export type EstadoTicket = 'PENDIENTE' | 'PARTICIPANDO' | 'RECHAZADO';

// Estados del sorteo
export type EstadoSorteo = 'BORRADOR' | 'ACTIVO' | 'FINALIZADO';

// Métodos de pago soportados
export type MetodoPago = 'YAPE' | 'PLIN' | 'TRANSFERENCIA';

export interface Premio {
  id: string;
  sorteoId: string;
  nombre: string;
  descripcion?: string;
  categoria?: string; // Ej. "Laptop", "Smartphone", "Vehículo"
  modelo?: string; // Ej. "MacBook Air", "iPhone 16"
  cantidad?: number; // Cantidad de unidades (ej. 4)
  esMayor: boolean;
  orden: number;
  imagenUrl?: string;
  ganadorNombre?: string;
  ganadorDni?: string;
  ganadorTicket?: number;
}

export interface Sorteo {
  id: string;
  codigo?: string; // Ej. "SORTEO #001"
  titulo: string;
  descripcion?: string;
  precioTicket: number;
  fechaSorteo: string; // ISO date string
  horaSorteo: string;
  fechaCierre: string; // ISO date string
  horaCierre: string;
  estado: EstadoSorteo;
  imagenPrincipal?: string;
  premios: Premio[];
  totalTicketsVendidos?: number;
  metaTickets?: number;
  whatsappNumero?: string;
  yapeNumero?: string;
  yapeNombre?: string;
  yapeQr?: string;
  plinNumero?: string;
  plinNombre?: string;
  plinQr?: string;
  createdAt: string;
}

export interface Compra {
  id: string;
  sorteoId: string;
  sorteoTitulo?: string;
  dni: string;
  nombreCompleto: string;
  celular: string;
  cantidadTickets: number;
  montoTotal: number;
  metodoPago: MetodoPago;
  comprobanteUrl: string;
  // Campos extraídos por el lector OCR para verificación antifraude
  codigoOperacion: string; // Único para prevenir duplicados
  fechaOperacion?: string;
  ocrVerificado: boolean;
  estado: EstadoTicket;
  motivoRechazo?: string;
  tickets?: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  compraId: string;
  sorteoId: string;
  numero: number; // Ej. 10423
  numeroFormateado: string; // Ej. "#010423"
  dni: string;
  nombreCompleto: string;
  estado: EstadoTicket;
  esGanador?: boolean;
  premioGanado?: string;
}

// Resultados devueltos por el OCR
export interface ResultadoOcr {
  exito: boolean;
  codigoOperacion?: string;
  montoDetectado?: number;
  fechaDetectada?: string;
  metodoDetectado?: MetodoPago;
  textoCompleto: string;
  esDuplicado: boolean;
  mensaje?: string;
}

// Mensaje de Chat en Tiempo Real
export interface MensajeChat {
  id: string;
  conversacionId: string;
  remitente: 'CLIENTE' | 'ADMIN';
  autorNombre: string;
  mensaje: string;
  leido: boolean;
  timestamp: string;
}

export interface Conversacion {
  id: string;
  clienteDni: string;
  clienteNombre: string;
  clienteCelular?: string;
  ultimoMensaje?: string;
  noLeidosAdmin: number;
  noLeidosCliente: number;
  updatedAt: string;
  mensajes: MensajeChat[];
}

export interface BilleteraDigital {
  id: string;
  nombre: string;
  tipo: string;
  numero: string;
  titular: string;
  qrUrl?: string;
  color?: string;
  instrucciones?: string;
  activo: boolean;
}

export interface ConfiguracionWeb {
  nombreNegocio: string;
  slogan: string;
  logoUrl?: string;
  tituloPestana?: string; // Título que se muestra en la pestaña del navegador
  ruc?: string;
  razonSocial?: string;
  direccionLegal?: string;
  emailLegal?: string;
  telefonoLegal?: string;
  yapeNumero: string;
  yapeNombre: string;
  yapeQr: string;
  plinNumero: string;
  plinNombre: string;
  plinQr: string;
  billeteras: BilleteraDigital[];
  whatsappNumero: string;
  whatsappMensaje: string;
  facebookUrl: string;
  tiktokUrl: string;
  canalTransmisionUrl: string; // Enlace a Facebook Live / YouTube / Kick
  // Configuración de la sección de transmisiones en vivo
  transmisionesActiva?: boolean;
  transmisionFacebookUrl?: string;
  transmisionFacebookActivo?: boolean;
  transmisionWhatsappUrl?: string;
  transmisionWhatsappActivo?: boolean;
}

export interface Reclamacion {
  id: string;
  codigo: string; // Ej. "REC-2026-0001"
  tipo: 'RECLAMO' | 'QUEJA';
  fecha: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string; // DNI, CE, Pasaporte
  numeroDocumento: string;
  email: string;
  telefono: string;
  domicilio: string;
  montoReclamado?: number;
  descripcionBien: string; // "Ticket de sorteo #..." o "Servicio"
  detalle: string;
  pedido: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';
  respuesta?: string;
  fechaRespuesta?: string;
}

export interface GanadorFama {
  id: string;
  nombre: string;
  premio: string;
  sorteoTitulo?: string;
  ticketNumero?: string;
  fotoUrl: string;
  fecha: string;
  ciudad?: string;
  orden?: number;
}

