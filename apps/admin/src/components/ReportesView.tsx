import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Gift,
  Calendar,
  Ticket,
  DollarSign,
  Search,
  Check,
  X,
  Loader2,
  Users,
} from 'lucide-react';
import { Sorteo, Compra, EstadoSorteo, GanadorPremio } from '@sorteos/shared';
import { getExcelUrl, finalizarSorteo, validarTicketSorteo } from '../services/api';

interface Props {
  sorteos: Sorteo[];
  sorteoInicial?: Sorteo;
  compras: Compra[];
  onSorteoFinalizado: (sorteo: Sorteo) => void;
}

interface SlotState {
  ticketInput: string;
  validando: boolean;
  error?: string;
  ganador?: GanadorPremio;
}

export const ReportesView: React.FC<Props> = ({
  sorteos,
  sorteoInicial,
  compras,
  onSorteoFinalizado,
}) => {
  // Filtro de estado de sorteos
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | EstadoSorteo>('TODOS');
  const [sorteoIdSeleccionado, setSorteoIdSeleccionado] = useState<string>(
    sorteoInicial?.id || sorteos[0]?.id || ''
  );

  // Slots de ganadores: [premioId]: SlotState[]
  const [slotsPorPremio, setSlotsPorPremio] = useState<{
    [premioId: string]: SlotState[];
  }>({});
  const [cerrando, setCerrando] = useState(false);

  // Filtrar lista de sorteos según estado
  const sorteosFiltrados = sorteos.filter(s => {
    if (filtroEstado === 'TODOS') return true;
    return s.estado === filtroEstado;
  });

  const sorteoSeleccionado =
    sorteos.find(s => s.id === sorteoIdSeleccionado) || sorteosFiltrados[0] || sorteoInicial || sorteos[0];

  // Inicializar slots de ganadores cuando cambia el sorteo seleccionado
  useEffect(() => {
    if (!sorteoSeleccionado) return;

    const initialSlots: { [premioId: string]: SlotState[] } = {};

    sorteoSeleccionado.premios?.forEach(p => {
      const cantidad = p.cantidad || 1;
      const slots: SlotState[] = [];

      for (let i = 0; i < cantidad; i++) {
        // Si el sorteo ya está finalizado y tiene ganadores registrados
        const ganadorExistente = p.ganadores?.[i] || (i === 0 && p.ganadorTicket ? {
          numeroTicket: p.ganadorTicket,
          dni: p.ganadorDni || '',
          nombre: p.ganadorNombre || '',
        } : undefined);

        slots.push({
          ticketInput: ganadorExistente ? String(ganadorExistente.numeroTicket) : '',
          validando: false,
          ganador: ganadorExistente,
        });
      }
      initialSlots[p.id] = slots;
    });

    setSlotsPorPremio(initialSlots);
  }, [sorteoSeleccionado?.id]);

  if (!sorteoSeleccionado) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        No hay sorteos registrados para reportes.
      </div>
    );
  }

  const finalizado = sorteoSeleccionado.estado === 'FINALIZADO';

  // Métricas del sorteo seleccionado
  const comprasSorteo = compras.filter(c => c.sorteoId === sorteoSeleccionado.id);
  const comprasAprobadas = comprasSorteo.filter(c => c.estado === 'PARTICIPANDO');
  const comprasPendientes = comprasSorteo.filter(c => c.estado === 'PENDIENTE');
  const totalRecaudado = comprasAprobadas.reduce((acc, c) => acc + Number(c.montoTotal), 0);
  const totalTickets = comprasAprobadas.reduce((acc, c) => acc + c.cantidadTickets, 0);

  const handleDescargarExcel = () => {
    window.open(getExcelUrl(sorteoSeleccionado.id), '_blank');
  };

  const handleTicketInputChange = (premioId: string, slotIdx: number, val: string) => {
    setSlotsPorPremio(prev => {
      const slots = [...(prev[premioId] || [])];
      slots[slotIdx] = {
        ...slots[slotIdx],
        ticketInput: val.replace(/\D/g, ''),
        error: undefined,
        ganador: undefined, // Reiniciar validación previa si el usuario cambia el número
      };
      return { ...prev, [premioId]: slots };
    });
  };

  const handleValidarTicketSlot = async (premioId: string, slotIdx: number) => {
    const slot = slotsPorPremio[premioId]?.[slotIdx];
    if (!slot || !slot.ticketInput) return;

    setSlotsPorPremio(prev => {
      const slots = [...(prev[premioId] || [])];
      slots[slotIdx] = { ...slots[slotIdx], validando: true, error: undefined };
      return { ...prev, [premioId]: slots };
    });

    try {
      const res = await validarTicketSorteo(sorteoSeleccionado.id, slot.ticketInput);
      if (res.valido && res.ticket) {
        setSlotsPorPremio(prev => {
          const slots = [...(prev[premioId] || [])];
          slots[slotIdx] = {
            ...slots[slotIdx],
            validando: false,
            error: undefined,
            ganador: {
              numeroTicket: res.ticket!.numero,
              dni: res.ticket!.dni,
              nombre: res.ticket!.nombreCompleto,
              telefono: res.ticket!.celular,
              fechaAsignacion: new Date().toISOString(),
            },
          };
          return { ...prev, [premioId]: slots };
        });
      } else {
        setSlotsPorPremio(prev => {
          const slots = [...(prev[premioId] || [])];
          slots[slotIdx] = {
            ...slots[slotIdx],
            validando: false,
            error: res.mensaje || 'Ticket no válido para este sorteo',
            ganador: undefined,
          };
          return { ...prev, [premioId]: slots };
        });
      }
    } catch (err: any) {
      setSlotsPorPremio(prev => {
        const slots = [...(prev[premioId] || [])];
        slots[slotIdx] = {
          ...slots[slotIdx],
          validando: false,
          error: err.message || 'Error al validar ticket',
          ganador: undefined,
        };
        return { ...prev, [premioId]: slots };
      });
    }
  };

  const handleFinalizarSorteo = async () => {
    // Validar si hay premios sin validar
    let totalPremiosEsperados = 0;
    let totalGanadoresValidados = 0;

    sorteoSeleccionado.premios.forEach(p => {
      const slots = slotsPorPremio[p.id] || [];
      const cantidad = p.cantidad || 1;
      totalPremiosEsperados += cantidad;
      slots.forEach(s => {
        if (s.ganador) totalGanadoresValidados++;
      });
    });

    const confirm = window.confirm(
      `¿Estás seguro de finalizar el sorteo "${sorteoSeleccionado.titulo}"?\n` +
      `Se registrarán ${totalGanadoresValidados} ganadores validados de ${totalPremiosEsperados} posiciones configuradas.`
    );
    if (!confirm) return;

    setCerrando(true);
    try {
      const ganadoresPayload = sorteoSeleccionado.premios.map(p => {
        const slots = slotsPorPremio[p.id] || [];
        const ganadoresList: GanadorPremio[] = slots
          .filter(s => s.ganador)
          .map(s => s.ganador!);

        return {
          premioId: p.id,
          ganadores: ganadoresList,
        };
      });

      const res = await finalizarSorteo(sorteoSeleccionado.id, ganadoresPayload);
      onSorteoFinalizado(res.sorteo);
      alert('¡Sorteo finalizado exitosamente! El estado ha cambiado a FINALIZADO y los datos están listos en Excel.');
    } catch (err: any) {
      alert(`Error al finalizar sorteo: ${err.message || 'Error del servidor'}`);
    } finally {
      setCerrando(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Cierre de Sorteo y Exportación a Excel
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Audita boletos por sorteo, valida números de tickets premiados en vivo y exporta el reporte oficial en Excel (.xlsx).
        </p>
      </div>

      {/* SELECTOR Y FILTRO DE SORTEOS (Optimizado para decenas/centenas de sorteos) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Seleccionar Sorteo
            </span>
          </div>

          {/* Filtros de Estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['TODOS', 'ACTIVO', 'FINALIZADO', 'BORRADOR'] as const).map(est => (
              <button
                key={est}
                type="button"
                onClick={() => setFiltroEstado(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filtroEstado === est
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {est === 'TODOS' ? 'Todos' : est === 'ACTIVO' ? 'Activos' : est === 'FINALIZADO' ? 'Finalizados' : 'Borradores'}
                <span className="ml-1.5 text-[10px] opacity-80">
                  ({sorteos.filter(s => est === 'TODOS' || s.estado === est).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Selector Limpio y Moderno */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={sorteoIdSeleccionado}
            onChange={e => setSorteoIdSeleccionado(e.target.value)}
            className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {sorteosFiltrados.map(s => (
              <option key={s.id} value={s.id}>
                {s.codigo || 'SORTEO'} — {s.titulo} ({s.estado}) · S/ {s.precioTicket.toFixed(2)}
              </option>
            ))}
          </select>

          <span className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-center shrink-0 ${
            sorteoSeleccionado.estado === 'ACTIVO'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : sorteoSeleccionado.estado === 'FINALIZADO'
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-slate-200 text-slate-700'
          }`}>
            Estado: {sorteoSeleccionado.estado}
          </span>
        </div>
      </div>

      {/* Resumen del Sorteo Seleccionado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Tickets Aprobados</span>
            <span className="text-lg font-black text-slate-900">{totalTickets} Boletos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Recaudado (Efectivo)</span>
            <span className="text-lg font-black text-emerald-700">S/ {totalRecaudado.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Pendientes de Revisión</span>
            <span className="text-lg font-black text-amber-700">{comprasPendientes.length} Compras</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Fecha del Sorteo</span>
            <span className="text-xs font-bold text-slate-800">
              {sorteoSeleccionado.fechaSorteo} · {sorteoSeleccionado.horaSorteo}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Exportación a Excel */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Auditoría Oficial del Concurso</span>
          </div>
          <h3 className="text-2xl font-black">
            Descargar Excel de "{sorteoSeleccionado.titulo}"
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Genera un documento profesional (.xlsx) con hojas completas: participantes, boletos asignados, comprobantes y registro de ganadores por cada premio.
          </p>
        </div>

        <button
          onClick={handleDescargarExcel}
          className="bg-white hover:bg-emerald-50 text-emerald-800 font-black px-6 py-4 rounded-2xl transition shadow-md flex items-center gap-2 text-sm shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Descargar Excel (.xlsx)</span>
        </button>
      </div>

      {/* Asignación de Ganadores Dinámica por Cantidad de Cada Premio */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Validación de Tickets Ganadores por Premio</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa el número de ticket y presiona <strong>"Validar"</strong>. El sistema verificará que el ticket participe en este sorteo y extraerá automáticamente el nombre y DNI del ganador.
            </p>
          </div>

          {finalizado ? (
            <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              <span>Sorteo Finalizado</span>
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span>Sorteo en Marcha</span>
            </span>
          )}
        </div>

        <div className="space-y-6">
          {sorteoSeleccionado.premios?.map(p => {
            const cantidad = p.cantidad || 1;
            const slots = slotsPorPremio[p.id] || [];

            return (
              <div
                key={p.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4"
              >
                {/* Cabecera del Premio */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    {p.imagenUrl && (
                      <img
                        src={p.imagenUrl}
                        alt={p.nombre}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white p-1"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                          p.esMayor
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-purple-100 text-purple-900'
                        }`}>
                          {p.esMayor ? '👑 Premio Mayor' : 'Premio'}
                        </span>
                        <span className="bg-purple-600 text-white font-black text-xs px-2 py-0.5 rounded-md">
                          x{cantidad} {cantidad === 1 ? 'Unidad' : 'Unidades'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1">{p.nombre}</h4>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Requiere {cantidad} {cantidad === 1 ? 'ganador' : 'ganadores'}
                  </span>
                </div>

                {/* Slots para cada unidad del premio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: cantidad }).map((_, slotIdx) => {
                    const slot = slots[slotIdx] || { ticketInput: '', validando: false };
                    const ganador = slot.ganador;

                    return (
                      <div
                        key={slotIdx}
                        className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-700">
                            Ganador {slotIdx + 1} de {cantidad}
                          </span>
                          {ganador && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Validado</span>
                            </span>
                          )}
                        </div>

                        {/* Input de ticket y botón Validar */}
                        {!finalizado ? (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">
                                #
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="N° de Ticket (ej: 5)"
                                value={slot.ticketInput}
                                onChange={e => handleTicketInputChange(p.id, slotIdx, e.target.value)}
                                className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleValidarTicketSlot(p.id, slotIdx)}
                              disabled={slot.validando || !slot.ticketInput}
                              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              {slot.validando ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Search className="w-3.5 h-3.5" />
                              )}
                              <span>Validar</span>
                            </button>
                          </div>
                        ) : null}

                        {/* Mensaje de error si la validación falla */}
                        {slot.error && (
                          <p className="text-[11px] font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                            ⚠️ {slot.error}
                          </p>
                        )}

                        {/* Ficha con datos extraídos del ticket ganador */}
                        {ganador ? (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                            <p className="font-black text-emerald-950">
                              🏆 {ganador.nombre}
                            </p>
                            <p className="text-slate-600 font-mono">
                              DNI: <strong>{ganador.dni}</strong> · Ticket: <strong>#{ganador.numeroTicket}</strong>
                            </p>
                            {ganador.telefono && (
                              <p className="text-slate-600">
                                Celular: <strong>{ganador.telefono}</strong>
                              </p>
                            )}
                          </div>
                        ) : (
                          finalizado && (
                            <p className="text-xs text-slate-400 italic">
                              Sin ganador registrado para este puesto.
                            </p>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón de Finalización Oficial */}
        {!finalizado && (
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Al finalizar, el sorteo cambiará a estado "FINALIZADO" y se archivará con sus ganadores definitivos en la base de datos y en el Excel.
            </p>
            <button
              onClick={handleFinalizarSorteo}
              disabled={cerrando}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs px-8 py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider"
            >
              {cerrando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizando Sorteo...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>Finalizar y Guardar Ganadores</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
