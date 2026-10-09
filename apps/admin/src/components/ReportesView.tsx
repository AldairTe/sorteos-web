import React, { useState } from 'react';
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
} from 'lucide-react';
import { Sorteo, Compra } from '@sorteos/shared';
import { getExcelUrl, finalizarSorteo } from '../services/api';

interface Props {
  sorteos: Sorteo[];
  sorteoInicial?: Sorteo;
  compras: Compra[];
  onSorteoFinalizado: (sorteo: Sorteo) => void;
}

export const ReportesView: React.FC<Props> = ({
  sorteos,
  sorteoInicial,
  compras,
  onSorteoFinalizado,
}) => {
  const [sorteoIdSeleccionado, setSorteoIdSeleccionado] = useState<string>(
    sorteoInicial?.id || sorteos[0]?.id || ''
  );
  const [ganadoresInput, setGanadoresInput] = useState<{
    [premioId: string]: { ticket: string; nombre: string; dni: string };
  }>({});
  const [cerrando, setCerrando] = useState(false);

  const sorteoSeleccionado =
    sorteos.find(s => s.id === sorteoIdSeleccionado) || sorteoInicial || sorteos[0];

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
  const totalRecaudado = comprasAprobadas.reduce((acc, c) => acc + Number(c.montoTotal), 0);
  const totalTickets = comprasAprobadas.reduce((acc, c) => acc + c.cantidadTickets, 0);

  const handleInputChange = (premioId: string, field: 'ticket' | 'nombre' | 'dni', value: string) => {
    setGanadoresInput(prev => ({
      ...prev,
      [premioId]: {
        ...prev[premioId],
        [field]: value,
      },
    }));
  };

  const handleDescargarExcel = () => {
    window.open(getExcelUrl(sorteoSeleccionado.id), '_blank');
  };

  const handleFinalizarSorteo = async () => {
    const confirm = window.confirm(
      `¿Estás seguro de finalizar el sorteo "${sorteoSeleccionado.titulo}"? Se registrarán los ganadores y se guardará el histórico en Excel.`
    );
    if (!confirm) return;

    setCerrando(true);
    try {
      const ganadoresPayload = sorteoSeleccionado.premios.map(p => {
        const input = ganadoresInput[p.id] || {};
        return {
          premioId: p.id,
          ticketNumero: parseInt(input.ticket, 10) || null,
          ganadorNombre: input.nombre || '',
          ganadorDni: input.dni || '',
        };
      });

      const res = await finalizarSorteo(sorteoSeleccionado.id, ganadoresPayload);
      onSorteoFinalizado(res.sorteo);
      alert('¡Sorteo finalizado exitosamente! Puedes descargar el Excel histórico ahora.');
    } catch (err) {
      alert('Error al finalizar sorteo');
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
          Selecciona cualquiera de tus sorteos para auditar sus boletos, exportar a Excel (.xlsx) y registrar a los ganadores oficiales.
        </p>
      </div>

      {/* SELECTOR DE SORTEO (Multi-Sorteo Support) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Elige el Sorteo a Exportar:</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {sorteos.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSorteoIdSeleccionado(s.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                s.id === sorteoSeleccionado.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{s.codigo || `SORTEO #${idx + 1}`}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  s.id === sorteoSeleccionado.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-300 text-slate-800'
                }`}
              >
                {s.estado}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Resumen del Sorteo Seleccionado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Tickets en Juego</span>
            <span className="text-lg font-black text-slate-900">{totalTickets} Boletos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Recaudado</span>
            <span className="text-lg font-black text-emerald-700">S/ {totalRecaudado.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Fecha y Cierre</span>
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
            Genera un documento profesional (.xlsx) con 3 hojas: lista de participantes con sus tickets y DNI, historial de comprobantes verificados y balance de recaudación.
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

      {/* Asignación de Ganadores del Sorteo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Registro de Boletos Ganadores ({sorteoSeleccionado.premios?.length || 0} Premios)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresa los tickets extraídos en tu transmisión en vivo para cada premio asignado a este sorteo.
            </p>
          </div>

          {finalizado ? (
            <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle className="w-4 h-4" />
              <span>Sorteo Finalizado</span>
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
              <AlertTriangle className="w-4 h-4" />
              <span>Sorteo en Marcha</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorteoSeleccionado.premios?.map(p => {
            const input = ganadoresInput[p.id] || { ticket: '', nombre: '', dni: '' };
            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-700">
                    {p.esMayor ? '⭐ PREMIO MAYOR' : 'Premio Secundario'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {p.cantidad && p.cantidad > 1 && (
                      <span className="bg-purple-100 text-purple-800 font-black text-[10px] px-1.5 py-0.5 rounded">
                        x{p.cantidad}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">
                      {p.nombre}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      N° Ticket Ganador:
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 10425"
                      value={input.ticket || (p.ganadorTicket ? String(p.ganadorTicket) : '')}
                      onChange={e => handleInputChange(p.id, 'ticket', e.target.value)}
                      disabled={finalizado}
                      className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      Nombre del Ganador:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={input.nombre || p.ganadorNombre || ''}
                      onChange={e => handleInputChange(p.id, 'nombre', e.target.value)}
                      disabled={finalizado}
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                      DNI Ganador:
                    </label>
                    <input
                      type="text"
                      placeholder="DNI del ganador"
                      value={input.dni || p.ganadorDni || ''}
                      onChange={e => handleInputChange(p.id, 'dni', e.target.value)}
                      disabled={finalizado}
                      className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón de Finalización Oficial */}
        {!finalizado && (
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Al finalizar, el sorteo cambiará a estado "FINALIZADO" y se archivará con sus ganadores definitivos.
            </p>
            <button
              onClick={handleFinalizarSorteo}
              disabled={cerrando}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>{cerrando ? 'Finalizando...' : 'Finalizar y Cerrar Sorteo'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
