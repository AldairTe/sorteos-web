import React, { useState, useEffect } from 'react';
import { Search, Ticket, Clock, CheckCircle, XCircle, AlertTriangle, MessageCircle, Loader2 } from 'lucide-react';
import { Compra } from '@sorteos/shared';
import { consultarMisTickets } from '../services/api';
import { socket } from '../services/socket';

interface Props {
  initialDni?: string;
  onOpenChat: (dni?: string) => void;
}

export const MisTicketsSection: React.FC<Props> = ({ initialDni, onOpenChat }) => {
  const [dni, setDni] = useState(initialDni || '');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buscarTickets = async (dniABuscar: string) => {
    const cleaned = dniABuscar.replace(/\D/g, '').slice(0, 8);
    if (!cleaned || cleaned.length !== 8) {
      setErrorMsg('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setHaBuscado(true);

    try {
      const data = await consultarMisTickets(cleaned);
      setCompras(data);

      // Unirse a la sala de socket para este DNI para recibir cambios reactivos
      socket.emit('unirse_cliente', cleaned);
    } catch (err: any) {
      setErrorMsg('No se pudieron consultar los tickets. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialDni) {
      const clean = initialDni.replace(/\D/g, '').slice(0, 8);
      setDni(clean);
      if (clean.length === 8) {
        buscarTickets(clean);
      }
    }
  }, [initialDni]);

  // Escuchar actualizaciones en tiempo real cuando el administrador apruebe o rechace
  useEffect(() => {
    const handleTicketActualizado = (compraActualizada: Compra) => {
      console.log('[Socket Cliente] Compra actualizada en vivo:', compraActualizada);
      setCompras(prev =>
        prev.map(c => (c.id === compraActualizada.id ? { ...c, ...compraActualizada } : c))
      );
    };

    socket.on('ticket_estado_actualizado', handleTicketActualizado);
    return () => {
      socket.off('ticket_estado_actualizado', handleTicketActualizado);
    };
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    buscarTickets(dni);
  };

  return (
    <section id="mis-tickets" className="py-16 sm:py-24 bg-white dark:bg-[#0c0817] transition-colors relative border-t border-purple-100 dark:border-purple-900/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/50 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Consulta rápida
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            Consulta el Estado de tus Tickets
          </h2>
          <p className="mt-2 text-slate-600 dark:text-purple-200/80 text-sm font-medium">
            Ingresa tu DNI para ver tus compras registradas, comprobantes y números asignados en tiempo real.
          </p>
        </div>

        {/* Buscador por DNI con validación estricta de 8 dígitos numéricos */}
        <form onSubmit={handleBuscar} className="max-w-md mx-auto mb-12">
          <div className="flex items-center gap-2 bg-purple-50/60 dark:bg-[#150d28] p-2 rounded-2xl border-2 border-purple-200/80 dark:border-purple-900/60 focus-within:border-purple-500 dark:focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-200/50 dark:focus-within:ring-purple-900/30 transition shadow-sm">
            <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 ml-2" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{8}"
              value={dni}
              onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Ingresa tu DNI (8 dígitos)..."
              className="bg-transparent flex-1 text-sm font-bold text-slate-900 dark:text-white outline-none px-2 placeholder:text-slate-400 dark:placeholder:text-purple-300/50"
              maxLength={8}
            />
            <button
              type="submit"
              disabled={loading || dni.trim().length !== 8}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-purple-950/50 dark:disabled:text-slate-600 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-md shadow-purple-600/20 disabled:shadow-none flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Buscar</span>}
            </button>
          </div>
          <p className="text-center text-[11px] font-semibold text-slate-400 dark:text-purple-300/60 mt-2">
            Solo números · exactamente 8 dígitos ({dni.length}/8)
          </p>
        </form>

        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm rounded-2xl text-center mb-6 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Resultados de la búsqueda */}
        {haBuscado && !loading && (
          <div className="space-y-6">
            {compras.length === 0 ? (
              <div className="text-center p-8 bg-pastel-50 dark:bg-[#0c1524] rounded-3xl border border-pastel-200 dark:border-slate-800">
                <Ticket className="w-12 h-12 text-pastel-400 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  No se encontraron tickets con el DNI "{dni}"
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                  Asegúrate de ingresar el mismo DNI que usaste al registrar tu pago, o contáctanos por el chat de soporte.
                </p>
              </div>
            ) : (
              compras.map(compra => (
                <div
                  key={compra.id}
                  className="bg-white dark:bg-[#0c1524] rounded-3xl border border-pastel-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-pastel transition"
                >
                  {/* Encabezado de la compra */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        Fecha: {new Date(compra.createdAt).toLocaleString('es-PE')}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {compra.sorteoTitulo || 'Sorteo Oficial'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Comprador: <strong className="text-slate-800 dark:text-slate-200">{compra.nombreCompleto}</strong> (DNI: {compra.dni})
                      </p>
                    </div>

                    {/* BADGES DE ESTADO (PENDIENTE / PARTICIPANDO / RECHAZADO) */}
                    <div>
                      {compra.estado === 'PENDIENTE' && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs sm:text-sm animate-pulse">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>PENDIENTE DE VERIFICACIÓN</span>
                        </div>
                      )}

                      {compra.estado === 'PARTICIPANDO' && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs sm:text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>¡PARTICIPANDO OFICIALMENTE!</span>
                        </div>
                      )}

                      {compra.estado === 'RECHAZADO' && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs sm:text-sm">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>RECHAZADO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo y Explicación del Estado */}
                  <div className="pt-4 space-y-4">
                    {compra.estado === 'PENDIENTE' && (
                      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-amber-900 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">
                            Tu pago ya está registrado en nuestro sistema.
                          </strong>
                          <span>
                            El administrador está verificando tu comprobante de {compra.metodoPago} por un monto de{' '}
                            <strong>S/ {Number(compra.montoTotal).toFixed(2)}</strong>. En cuanto sea aprobado, verás aquí tus {compra.cantidadTickets} tickets en tiempo real sin recargar la página.
                          </span>
                        </div>
                      </div>
                    )}

                    {compra.estado === 'PARTICIPANDO' && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Tus Números de la Suerte ({compra.tickets?.length || compra.cantidadTickets} tickets asignados):
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {compra.tickets && compra.tickets.length > 0 ? (
                            compra.tickets.map(t => (
                              <div
                                key={t.id}
                                className="ticket-badge text-white px-4 py-2 text-sm sm:text-base font-black tracking-widest shadow-sm flex items-center justify-center min-w-[100px]"
                              >
                                {t.numeroFormateado}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold">
                              Tickets validados correctamente.
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {compra.estado === 'RECHAZADO' && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-start justify-between gap-3">
                        <div>
                          <strong className="block font-bold">Comprobante no aprobado:</strong>
                          <span>{compra.motivoRechazo || 'Monto incorrecto o datos no legibles.'}</span>
                        </div>
                        <button
                          onClick={() => onOpenChat(compra.dni)}
                          className="shrink-0 bg-white border border-rose-300 text-rose-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chatear</span>
                        </button>
                      </div>
                    )}

                    {/* Datos del Comprobante y Código OCR */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        {compra.codigoOperacion && (
                          <span className="mr-3">
                            N° Operación: <strong>#{compra.codigoOperacion}</strong>
                          </span>
                        )}
                        <span>Método: <strong>{compra.metodoPago}</strong></span>
                      </div>
                      <span className="font-bold text-pastel-700">
                        Total: S/ {Number(compra.montoTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
