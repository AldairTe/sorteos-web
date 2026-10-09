import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  Ticket,
  Users,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Gift,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { Compra, Sorteo } from '@sorteos/shared';
import { TabAdmin } from './Sidebar';

interface Props {
  sorteos: Sorteo[];
  sorteoActivo?: Sorteo;
  compras: Compra[];
  setTabActiva: (tab: TabAdmin) => void;
}

export const DashboardView: React.FC<Props> = ({
  sorteos,
  sorteoActivo,
  compras,
  setTabActiva,
}) => {
  const [filtroSorteoId, setFiltroSorteoId] = useState<string>('TODOS');

  // Compras globales
  const comprasAprobadas = compras.filter(c => c.estado === 'PARTICIPANDO');
  const comprasPendientes = compras.filter(c => c.estado === 'PENDIENTE');
  const comprasRechazadas = compras.filter(c => c.estado === 'RECHAZADO');

  const totalRecaudadoGlobal = comprasAprobadas.reduce((acc, c) => acc + Number(c.montoTotal), 0);
  const totalTicketsParticipandoGlobal = comprasAprobadas.reduce((acc, c) => acc + c.cantidadTickets, 0);

  // Filtrado de compras si el admin elige un sorteo específico
  const comprasFiltradas = filtroSorteoId === 'TODOS'
    ? compras
    : compras.filter(c => c.sorteoId === filtroSorteoId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Panel de Control y Resumen de Sorteos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisa en tiempo real las compras, validaciones de pagos y el estado de cada sorteo configurado.
          </p>
        </div>

        {/* Selector de filtro rápido */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Filtrar:</span>
          <select
            value={filtroSorteoId}
            onChange={e => setFiltroSorteoId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los Sorteos ({sorteos.length})</option>
            {sorteos.map(s => (
              <option key={s.id} value={s.id}>
                {s.codigo || s.titulo.substring(0, 30)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta si hay pagos pendientes */}
      {comprasPendientes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                ¡Tienes {comprasPendientes.length} comprobante(s) pendiente(s) de verificación!
              </h4>
              <p className="text-xs text-amber-700">
                Revisa las capturas de Yape/Plin y aprueba para que a los clientes les aparezcan sus tickets.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTabActiva('verificacion')}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shrink-0"
          >
            Verificar Ahora
          </button>
        </div>
      )}

      {/* Cards Métricas Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Recaudado Total */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Recaudado
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              S/ {totalRecaudadoGlobal.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">
              ✓ De {comprasAprobadas.length} compras verificadas
            </span>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Por Verificar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-600">
              {comprasPendientes.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-1">
              Comprobantes en cola de espera
            </span>
          </div>
        </div>

        {/* Tickets Participando */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tickets Activos
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-purple-700">
              {totalTicketsParticipandoGlobal}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-1">
              Boletos aprobados en el bombo
            </span>
          </div>
        </div>

        {/* Total Personas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Compras
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">
              {compras.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-1">
              {comprasRechazadas.length} comprobante(s) rechazados
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          TABLA / CARDS DETALLADAS DE CADA SORTEO (Multi-Sorteo Support)
          ================================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <span>Rendimiento y Métricas por Cada Sorteo</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado de ventas, recaudación y verificación individual para cada concurso.
            </p>
          </div>

          <button
            onClick={() => setTabActiva('sorteos')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Gestionar Sorteos</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid de Tarjetas de Cada Sorteo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorteos.map((sorteo, idx) => {
            const sCompras = compras.filter(c => c.sorteoId === sorteo.id);
            const sAprobadas = sCompras.filter(c => c.estado === 'PARTICIPANDO');
            const sPendientes = sCompras.filter(c => c.estado === 'PENDIENTE');
            const sRechazadas = sCompras.filter(c => c.estado === 'RECHAZADO');

            const sRecaudado = sAprobadas.reduce((acc, c) => acc + Number(c.montoTotal), 0);
            const sTickets = sAprobadas.reduce((acc, c) => acc + c.cantidadTickets, 0);

            const meta = sorteo.metaTickets || 1000;
            const porcentajeMeta = Math.min(100, Math.round((sTickets / meta) * 100));

            return (
              <div
                key={sorteo.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between hover:border-purple-300 hover:bg-slate-50 transition shadow-2xs"
              >
                <div>
                  {/* Header tarjeta */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-purple-700 uppercase">
                      {sorteo.codigo || `SORTEO #${String(idx + 1).padStart(3, '0')}`}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sorteo.estado === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sorteo.estado === 'FINALIZADO'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sorteo.estado}
                    </span>
                  </div>

                  {/* Título */}
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                    {sorteo.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Precio Ticket: <strong className="text-slate-700">S/ {Number(sorteo.precioTicket).toFixed(2)}</strong> · Cierre: {sorteo.fechaCierre}
                  </p>

                  {/* Métricas del Sorteo */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/70">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Recaudado
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        S/ {sRecaudado.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Tickets Vendidos
                      </span>
                      <span className="text-base font-black text-purple-700">
                        {sTickets}
                      </span>
                    </div>
                  </div>

                  {/* Mini barra de progreso hacia meta */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>Progreso ({sTickets}/{meta})</span>
                      <span>{porcentajeMeta}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${porcentajeMeta}%` }}
                      />
                    </div>
                  </div>

                  {/* Estados de verificación de este sorteo */}
                  <div className="flex items-center justify-between gap-1 text-[11px] mt-4 pt-3 border-t border-slate-200/70 text-slate-600">
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" /> {sAprobadas.length} Verif.
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Clock className="w-3.5 h-3.5" /> {sPendientes.length} Pend.
                    </span>
                    <span className="flex items-center gap-1 font-bold text-rose-500">
                      <XCircle className="w-3.5 h-3.5" /> {sRechazadas.length} Rech.
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setFiltroSorteoId(sorteo.id);
                      setTabActiva('verificacion');
                    }}
                    className="text-[11px] font-bold text-purple-700 hover:underline"
                  >
                    Ver Comprobantes
                  </button>
                  <button
                    onClick={() => setTabActiva('reportes')}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sorteo Activo y Tabla de Últimas Compras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Sorteo Activo */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Sorteo Activo Principal
              </span>
              <button
                onClick={() => setTabActiva('sorteos')}
                className="text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1"
              >
                Editar <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
              {sorteoActivo?.titulo || 'Sin Sorteo Activo'}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Precio del Ticket: <strong>S/ {Number(sorteoActivo?.precioTicket || 0).toFixed(2)}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Cierre: <strong>{sorteoActivo?.fechaCierre} a las {sorteoActivo?.horaCierre}</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Premios configurados: <strong>{sorteoActivo?.premios?.length || 0}</strong>
            </span>
            <button
              onClick={() => setTabActiva('reportes')}
              className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Tabla Últimas Compras */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Últimas Compras Recibidas</h3>
              <p className="text-xs text-slate-400">
                {filtroSorteoId === 'TODOS'
                  ? 'Mostrando compras de todos los sorteos'
                  : 'Filtrado por sorteo seleccionado'}
              </p>
            </div>
            <button
              onClick={() => setTabActiva('verificacion')}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              Ver Todas ({comprasFiltradas.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Comprador</th>
                  <th className="pb-3">DNI</th>
                  <th className="pb-3">Tickets</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {comprasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No hay compras registradas para este filtro.
                    </td>
                  </tr>
                ) : (
                  comprasFiltradas.slice(0, 6).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-bold text-slate-800">
                        {c.nombreCompleto}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {c.sorteoTitulo || 'Sorteo'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 font-mono">{c.dni}</td>
                      <td className="py-3 font-semibold text-slate-700">{c.cantidadTickets}</td>
                      <td className="py-3 font-bold text-purple-700">S/ {Number(c.montoTotal).toFixed(2)}</td>
                      <td className="py-3">
                        {c.estado === 'PARTICIPANDO' ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            PARTICIPANDO
                          </span>
                        ) : c.estado === 'PENDIENTE' ? (
                          <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            PENDIENTE
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                            RECHAZADO
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
