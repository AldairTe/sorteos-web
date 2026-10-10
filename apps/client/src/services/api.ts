import { Sorteo, Compra, ResultadoOcr, ConfiguracionWeb, Conversacion } from '@sorteos/shared';

const API_BASE = '/api';

export async function getSorteos(): Promise<Sorteo[]> {
  const res = await fetch(`${API_BASE}/sorteos`);
  if (!res.ok) throw new Error('No se pudieron obtener los sorteos');
  const list: Sorteo[] = await res.json();
  return list.filter(s => s.estado === 'ACTIVO');
}

export async function getSorteoActivo(): Promise<Sorteo> {
  const res = await fetch(`${API_BASE}/sorteos/activo`);
  if (!res.ok) throw new Error('No se pudo obtener el sorteo activo');
  return res.json();
}

export async function getConfiguracion(): Promise<ConfiguracionWeb> {
  const res = await fetch(`${API_BASE}/configuracion`);
  if (!res.ok) throw new Error('No se pudo obtener la configuración');
  return res.json();
}

export async function analizarComprobanteOcr(file: File): Promise<ResultadoOcr & { archivoUrl?: string }> {
  const formData = new FormData();
  formData.append('comprobante', file);
  const res = await fetch(`${API_BASE}/comprobantes/analizar-ocr`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al analizar el comprobante con OCR');
  }
  return res.json();
}

export async function registrarCompra(formData: FormData): Promise<{ mensaje: string; compra: Compra }> {
  const res = await fetch(`${API_BASE}/compras`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al registrar la compra');
  }
  return res.json();
}

export async function consultarMisTickets(dni: string): Promise<Compra[]> {
  const res = await fetch(`${API_BASE}/compras/mis-tickets/${encodeURIComponent(dni)}`);
  if (!res.ok) throw new Error('Error al consultar tickets');
  return res.json();
}

export async function getHistorialChat(dni: string): Promise<Conversacion> {
  const res = await fetch(`${API_BASE}/chat/${encodeURIComponent(dni)}`);
  if (!res.ok) throw new Error('Error al consultar chat');
  return res.json();
}

export async function getGanadoresFama() {
  const res = await fetch(`${API_BASE}/ganadores-fama`);
  if (!res.ok) throw new Error('Error al obtener el salón de la fama');
  return res.json();
}

export async function crearReclamacion(data: any) {
  const res = await fetch(`${API_BASE}/reclamaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al enviar la reclamación');
  }
  return res.json();
}

