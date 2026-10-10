import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Eye, CheckCircle2, Clock, AlertTriangle, Send, Loader2, X, RefreshCw } from 'lucide-react';
import { getReclamaciones, actualizarEstadoReclamacion } from '../services/api';

export const ReclamacionesView: React.FC = () => {
  const [reclamaciones, setReclamaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState<any | null>(null);

  // Formulario de respuesta
  const [nuevoEstado, setNuevoEstado] = useState<'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO'>('PENDIENTE');
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarReclamaciones = async () => {
    setLoading(true);
    try {
      const data = await getReclamaciones();
      setReclamaciones(data);
    } catch (err) {
      console.error('Error cargando reclamaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReclamaciones();
  }, []);

  const handleAbrirModal = (rec: any) => {
    setSeleccionada(rec);
    setNuevoEstado(rec.estado || 'PENDIENTE');
    setTextoRespuesta(rec.respuesta || '');
  };

  const handleActualizarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seleccionada) return;

    setGuardando(true);
    try {
      const updated = await actualizarEstadoReclamacion(seleccionada.id, nuevoEstado, textoRespuesta.trim());
      setReclamaciones(prev => prev.map(r => r.id === seleccionada.id ? { ...r, ...updated } : r));
      setSeleccionada({ ...seleccionada, ...updated });
      alert('¡Estado y respuesta de la reclamación actualizados!');
    } catch (err) {
      alert('Error al actualizar el estado de la reclamación');
    } finally {
      setGuardando(false);
    }
  };

  const [pagina, setPagina] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  const filtradas = reclamaciones.filter(r => {
    if (filtroTipo !== 'TODOS' && r.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'TODOS' && r.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchCod = r.codigo?.toLowerCase().includes(q);
      const matchNom = `${r.nombres} ${r.apellidos}`.toLowerCase().includes(q);
      const matchDni = r.numeroDocumento?.toLowerCase().includes(q);
      return matchCod || matchNom || matchDni;
    }
    return true;
  });

  const totalPaginas = Math.ceil(filtradas.length / ITEMS_POR_PAGINA) || 1;
  const reclamacionesPaginadas = filtradas.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span>Libro de Reclamaciones Virtual</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Revisa y gestiona todas las quejas y reclamos ingresados por los consumidores conforme al código de INDECOPI.
          </p>
        </div>

        <button
          onClick={cargarReclamaciones}
          className="self-start sm:self-auto p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por código, nombres o DNI..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>Tipo:</span>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="RECLAMO">Reclamos</option>
              <option value="QUEJA">Quejas</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>Estado:</span>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resueltos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Reclamaciones */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Cargando reclamaciones...</span>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No se encontraron registros de reclamaciones con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Consumidor</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reclamacionesPaginadas.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {r.codigo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(r.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                        r.tipo === 'RECLAMO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.nombres} {r.apellidos}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {r.tipoDocumento}: {r.numeroDocumento}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{r.telefono}</div>
                      <div className="text-[10px] text-slate-400">{r.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.estado === 'RESUELTO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.estado === 'EN_PROCESO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.estado === 'RESUELTO' && <CheckCircle2 className="w-3 h-3" />}
                        {r.estado === 'EN_PROCESO' && <Clock className="w-3 h-3" />}
                        {r.estado === 'PENDIENTE' && <AlertTriangle className="w-3 h-3" />}
                        <span>{r.estado}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleAbrirModal(r)}
                        className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        title="Ver detalle y responder"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Hoja</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-600">
            <span>
              Mostrando {((pagina - 1) * ITEMS_POR_PAGINA) + 1} - {Math.min(pagina * ITEMS_POR_PAGINA, filtradas.length)} de {filtradas.length} hojas
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

      {/* Modal de Detalle y Respuesta */}
      {seleccionada && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] font-mono font-bold text-purple-600 block">
                  Hoja Oficial de Reclamación · {seleccionada.codigo}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Detalle del {seleccionada.tipo}: {seleccionada.nombres} {seleccionada.apellidos}
                </h3>
              </div>
              <button
                onClick={() => setSeleccionada(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido Scroll */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Bloque 1: Consumidor */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                  1. Datos del Consumidor
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Nombres:</strong> {seleccionada.nombres} {seleccionada.apellidos}</div>
                  <div><strong>Documento:</strong> {seleccionada.tipoDocumento} {seleccionada.numeroDocumento}</div>
                  <div><strong>Teléfono:</strong> {seleccionada.telefono}</div>
                  <div><strong>Email:</strong> {seleccionada.email}</div>
                  <div className="col-span-2"><strong>Domicilio:</strong> {seleccionada.domicilio || 'No especificado'}</div>
                </div>
              </div>

              {/* Bloque 2: Bien Contratado */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                  2. Bien Contratado
                </h4>
                <div><strong>Descripción:</strong> {seleccionada.descripcionBien}</div>
                {seleccionada.montoReclamado && (
                  <div><strong>Monto Reclamado:</strong> S/ {Number(seleccionada.montoReclamado).toFixed(2)}</div>
                )}
              </div>

              {/* Bloque 3: Detalle y Pedido */}
              <div className="space-y-3">
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                  <h4 className="font-bold text-amber-950 uppercase text-[10px] tracking-wider mb-1">
                    Detalle de la Afectación ({seleccionada.tipo})
                  </h4>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                    {seleccionada.detalle}
                  </p>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80">
                  <h4 className="font-bold text-purple-950 uppercase text-[10px] tracking-wider mb-1">
                    Pedido Concreto del Consumidor
                  </h4>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                    {seleccionada.pedido}
                  </p>
                </div>
              </div>

              {/* Bloque 4: Gestión y Respuesta del Administrador */}
              <form onSubmit={handleActualizarEstado} className="pt-3 border-t border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                  3. Gestión del Caso y Respuesta
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Cambiar Estado:</label>
                    <select
                      value={nuevoEstado}
                      onChange={e => setNuevoEstado(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EN_PROCESO">EN PROCESO</option>
                      <option value="RESUELTO">RESUELTO</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Fecha de Registro:</label>
                    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 font-mono">
                      {new Date(seleccionada.fecha).toLocaleString('es-PE')}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">
                    Respuesta Notificada al Consumidor:
                  </label>
                  <textarea
                    rows={3}
                    value={textoRespuesta}
                    onChange={e => setTextoRespuesta(e.target.value)}
                    placeholder="Escribe la respuesta formal o resolución del caso..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                  {seleccionada.fechaRespuesta && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Última respuesta guardada: {new Date(seleccionada.fechaRespuesta).toLocaleString('es-PE')}
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSeleccionada(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 transition"
                  >
                    {guardando ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
