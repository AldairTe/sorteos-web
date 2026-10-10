import { Sorteo, Compra, Conversacion, ConfiguracionWeb, EstadoTicket } from '@sorteos/shared';

const API_BASE = '/api';

export async function getSorteos(): Promise<Sorteo[]> {
  const res = await fetch(`${API_BASE}/sorteos`);
  if (!res.ok) throw new Error('Error al listar sorteos');
  return res.json();
}

export async function crearSorteo(data: Partial<Sorteo>): Promise<Sorteo> {
  const res = await fetch(`${API_BASE}/sorteos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear sorteo');
  return res.json();
}

export async function actualizarSorteo(id: string, data: Partial<Sorteo>): Promise<Sorteo> {
  const res = await fetch(`${API_BASE}/sorteos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar sorteo');
  return res.json();
}

export async function finalizarSorteo(id: string, ganadores: any[]): Promise<any> {
  const res = await fetch(`${API_BASE}/sorteos/${id}/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ganadores }),
  });
  if (!res.ok) throw new Error('Error al finalizar sorteo');
  return res.json();
}

export async function validarTicketSorteo(
  sorteoId: string,
  numeroTicket: string | number
): Promise<{ valido: boolean; mensaje?: string; ticket?: { numero: number; numeroFormateado: string; dni: string; nombreCompleto: string; celular?: string } }> {
  const res = await fetch(`${API_BASE}/sorteos/${sorteoId}/validar-ticket/${encodeURIComponent(numeroTicket)}`);
  const data = await res.json();
  if (!res.ok) {
    return { valido: false, mensaje: data.mensaje || data.error || 'Ticket no válido' };
  }
  return data;
}

export async function getCompras(sorteoId?: string, estado?: EstadoTicket): Promise<Compra[]> {
  const params = new URLSearchParams();
  if (sorteoId) params.append('sorteoId', sorteoId);
  if (estado) params.append('estado', estado);

  const res = await fetch(`${API_BASE}/compras?${params.toString()}`);
  if (!res.ok) throw new Error('Error al listar compras');
  return res.json();
}

export async function cambiarEstadoCompra(
  id: string,
  estado: EstadoTicket,
  motivoRechazo?: string
): Promise<{ mensaje: string; compra: Compra }> {
  const res = await fetch(`${API_BASE}/compras/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, motivoRechazo }),
  });
  if (!res.ok) throw new Error('Error al cambiar estado de compra');
  return res.json();
}

export function getExcelUrl(sorteoId: string): string {
  return `${API_BASE}/sorteos/${sorteoId}/exportar-excel`;
}

export async function getConversaciones(): Promise<Conversacion[]> {
  const res = await fetch(`${API_BASE}/chat/conversaciones`);
  if (!res.ok) throw new Error('Error al listar conversaciones');
  return res.json();
}

export async function getHistorialChat(idOrDni: string): Promise<Conversacion> {
  const res = await fetch(`${API_BASE}/chat/${encodeURIComponent(idOrDni)}`);
  if (!res.ok) throw new Error('Error al obtener mensajes');
  return res.json();
}

export async function subirImagenQr(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('qr', file);
  const res = await fetch(`${API_BASE}/configuracion/subir-qr`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir imagen QR');
  const data = await res.json();
  return data.qrUrl;
}

export async function subirImagenLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('logo', file);
  const res = await fetch(`${API_BASE}/configuracion/subir-logo`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir logo oficial');
  const data = await res.json();
  return data.logoUrl;
}

export async function getConfiguracion(): Promise<ConfiguracionWeb> {
  const res = await fetch(`${API_BASE}/configuracion`);
  if (!res.ok) throw new Error('Error al obtener configuración');
  return res.json();
}

export async function actualizarConfiguracion(data: Partial<ConfiguracionWeb>): Promise<ConfiguracionWeb> {
  const res = await fetch(`${API_BASE}/configuracion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar configuración');
  return res.json();
}

// Libro de Reclamaciones (Admin)
export async function getReclamaciones(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/reclamaciones`);
  if (!res.ok) throw new Error('Error al obtener reclamaciones');
  return res.json();
}

export async function actualizarEstadoReclamacion(
  id: string,
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO',
  respuesta?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/reclamaciones/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, respuesta }),
  });
  if (!res.ok) throw new Error('Error al actualizar reclamación');
  return res.json();
}

// Salón de la Fama (Admin)
export async function getGanadoresFama(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/ganadores-fama`);
  if (!res.ok) throw new Error('Error al listar ganadores de la fama');
  return res.json();
}

export async function subirFotoGanador(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('foto', file);
  const res = await fetch(`${API_BASE}/ganadores-fama/subir-foto`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir foto del ganador');
  const data = await res.json();
  return data.fotoUrl;
}

export async function crearGanadorFama(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/ganadores-fama`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al registrar ganador');
  return res.json();
}

export async function eliminarGanadorFama(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/ganadores-fama/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar ganador');
  return res.json();
}

