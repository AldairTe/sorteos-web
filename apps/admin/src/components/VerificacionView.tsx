import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, ShieldCheck, Eye, Search, AlertCircle, ExternalLink, X } from 'lucide-react';
import { Compra, EstadoTicket } from '@sorteos/shared';
import { cambiarEstadoCompra } from '../services/api';

interface Props {
  compras: Compra[];
  onCompraActualizada: (compra: Compra) => void;
}

export const VerificacionView: React.FC<Props> = ({ compras, onCompraActualizada }) => {
  const [filtroEstado, setFiltroEstado] = useState<EstadoTicket | 'TODOS'>('PENDIENTE');
  const [busqueda, setBusqueda] = useState('');
  const [modalImagen, setModalImagen] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  // Modal para rechazar con motivo
  const [compraARechazar, setCompraARechazar] = useState<Compra | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('Monto no coincide con los tickets solicitados');
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const handleAprobar = async (compra: Compra) => {
    setProcesandoId(compra.id);
    try {
      const res = await cambiarEstadoCompra(compra.id, 'PARTICIPANDO');
      onCompraActualizada(res.compra);
    } catch (err) {
      alert('Error al aprobar compra');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!compraARechazar) return;
    setProcesandoId(compraARechazar.id);
    try {
      const res = await cambiarEstadoCompra(compraARechazar.id, 'RECHAZADO', motivoRechazo);
      onCompraActualizada(res.compra);
      setCompraARechazar(null);
    } catch (err) {
      alert('Error al rechazar compra');
    } finally {
      setProcesandoId(null);
    }
  };

  const comprasFiltradas = compras.filter(c => {
    const matchEstado = filtroEstado === 'TODOS' ? true : c.estado === filtroEstado;
    const matchBusqueda =
      c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dni.includes(busqueda) ||
      (c.codigoOperacion && c.codigoOperacion.includes(busqueda));
    return matchEstado && matchBusqueda;
  });

  const totalPaginas = Math.ceil(comprasFiltradas.length / ITEMS_POR_PAGINA) || 1;
  const comprasPaginadas = comprasFiltradas.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  );

  const pendientesCount = compras.filter(c => c.estado === 'PENDIENTE').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Bandeja de Verificación de Pagos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprueba las capturas de Yape y Plin escaneadas por OCR y asigna los números de ticket.
          </p>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por DNI, Nombre o N° Operación..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full text-xs font-semibold outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Filtros por pestaña */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setFiltroEstado('PENDIENTE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filtroEstado === 'PENDIENTE'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendientes ({pendientesCount})</span>
        </button>

        <button
          onClick={() => setFiltroEstado('PARTICIPANDO')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filtroEstado === 'PARTICIPANDO'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Participando / Aprobados</span>
        </button>

        <button
          onClick={() => setFiltroEstado('RECHAZADO')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filtroEstado === 'RECHAZADO'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Rechazados</span>
        </button>

        <button
          onClick={() => setFiltroEstado('TODOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filtroEstado === 'TODOS'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todos ({compras.length})
        </button>
      </div>

      {/* Lista de Tarjetas de Pago */}
      <div className="space-y-4">
        {comprasFiltradas.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h4 className="font-bold text-slate-700 text-base">No hay pagos en esta sección</h4>
            <p className="text-xs text-slate-500 mt-1">Los nuevos comprobantes aparecerán aquí al instante.</p>
          </div>
        ) : (
          comprasPaginadas.map(compra => (
            <div
              key={compra.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Información del Cliente */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                    DNI: {compra.dni}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(compra.createdAt).toLocaleString('es-PE')}
                  </span>
                  {compra.estado === 'PENDIENTE' && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                      🟡 PENDIENTE DE REVISIÓN
                    </span>
                  )}
                  {compra.estado === 'PARTICIPANDO' && (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                      🟢 PARTICIPANDO
                    </span>
                  )}
                  {compra.estado === 'RECHAZADO' && (
                    <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                      🔴 RECHAZADO
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {compra.nombreCompleto}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span>Celular / WhatsApp: <strong>{compra.celular}</strong></span>
                  <span>Método: <strong>{compra.metodoPago}</strong></span>
                  <span>Cantidad: <strong>{compra.cantidadTickets} tickets</strong></span>
                  <span className="text-purple-700 font-bold text-sm">
                    Monto: S/ {Number(compra.montoTotal).toFixed(2)}
                  </span>
                </div>

                {/* Datos del OCR Antifraude */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {compra.codigoOperacion ? (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>N° Operación: #{compra.codigoOperacion} (Comprobante Único)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-medium">
                      <span>Sin código detectado automáticamente</span>
                    </div>
                  )}

                  {/* Tickets asignados si ya está aprobado */}
                  {compra.estado === 'PARTICIPANDO' && compra.tickets && (
                    <div className="text-xs text-slate-600">
                      Boletos:{' '}
                      <strong className="text-purple-700">
                        {compra.tickets.map(t => t.numeroFormateado).join(', ')}
                      </strong>
                    </div>
                  )}

                  {compra.estado === 'RECHAZADO' && compra.motivoRechazo && (
                    <span className="text-xs text-rose-600 font-medium">
                      Motivo: {compra.motivoRechazo}
                    </span>
                  )}
                </div>
              </div>

              {/* Comprobante y Acciones */}
              <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                {/* Miniatura de la imagen */}
                {compra.comprobanteUrl ? (
                  <button
                    onClick={() => setModalImagen(compra.comprobanteUrl)}
                    className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-purple-500 shadow-sm transition"
                    title="Ver comprobante en grande"
                  >
                    <img
                      src={compra.comprobanteUrl}
                      alt="Comprobante de pago"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                      <Eye className="w-5 h-5" />
                    </div>
                  </button>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold text-center p-2">
                    Sin Captura
                  </div>
                )}

                {/* Botones de Aprobar y Rechazar */}
                <div className="flex flex-col gap-2">
                  {compra.estado !== 'PARTICIPANDO' && (
                    <button
                      onClick={() => handleAprobar(compra)}
                      disabled={procesandoId === compra.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprobar Pago</span>
                    </button>
                  )}

                  {compra.estado !== 'RECHAZADO' && (
                    <button
                      onClick={() => setCompraARechazar(compra)}
                      disabled={procesandoId === compra.id}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
            <span>
              Mostrando {((pagina - 1) * ITEMS_POR_PAGINA) + 1} - {Math.min(pagina * ITEMS_POR_PAGINA, comprasFiltradas.length)} de {comprasFiltradas.length} compras
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagina <= 1}
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span className="px-2 text-purple-700 font-extrabold">Página {pagina} de {totalPaginas}</span>
              <button
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Zoom Comprobante */}
      {modalImagen && (
        <div
          onClick={() => setModalImagen(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl p-4 shadow-2xl overflow-hidden">
            <button
              onClick={() => setModalImagen(null)}
              className="absolute top-4 right-4 bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={modalImagen}
              alt="Comprobante en detalle"
              className="max-h-[80vh] w-auto mx-auto rounded-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal Rechazar Compra */}
      {compraARechazar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-slate-900 text-lg">Rechazar Comprobante</h3>
            <p className="text-xs text-slate-500">
              Indica el motivo del rechazo para que el cliente lo vea en su sección de "Mis Tickets".
            </p>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Motivo:</label>
              <select
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none"
              >
                <option value="Monto no coincide con los tickets solicitados">
                  Monto no coincide con los tickets solicitados
                </option>
                <option value="Comprobante borroso o ilegible">Comprobante borroso o ilegible</option>
                <option value="Comprobante no corresponde a la cuenta de la empresa">
                  Comprobante no corresponde a la cuenta de la empresa
                </option>
                <option value="Comprobante duplicado o no válido">Comprobante duplicado o no válido</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCompraARechazar(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRechazo}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
