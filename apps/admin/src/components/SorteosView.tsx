import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Save, Calendar, Clock, DollarSign, Star, Sparkles } from 'lucide-react';
import { Sorteo, Premio } from '@sorteos/shared';
import { crearSorteo, actualizarSorteo } from '../services/api';

interface Props {
  sorteos: Sorteo[];
  onSorteoActualizado: (sorteo: Sorteo) => void;
}

export const SorteosView: React.FC<Props> = ({ sorteos, onSorteoActualizado }) => {
  const [sorteoIdSeleccionado, setSorteoIdSeleccionado] = useState<string>(sorteos[0]?.id || '');

  const sorteoSeleccionado = sorteos.find(s => s.id === sorteoIdSeleccionado) || sorteos[0];

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioTicket, setPrecioTicket] = useState(5.00);
  const [fechaSorteo, setFechaSorteo] = useState('2026-10-25');
  const [horaSorteo, setHoraSorteo] = useState('20:00');
  const [fechaCierre, setFechaCierre] = useState('2026-10-25');
  const [horaCierre, setHoraCierre] = useState('18:00');
  const [estado, setEstado] = useState<'ACTIVO' | 'BORRADOR' | 'FINALIZADO'>('ACTIVO');
  const [premios, setPremios] = useState<Premio[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Cargar datos del sorteo seleccionado
  useEffect(() => {
    if (sorteoSeleccionado) {
      setTitulo(sorteoSeleccionado.titulo);
      setDescripcion(sorteoSeleccionado.descripcion || '');
      setPrecioTicket(Number(sorteoSeleccionado.precioTicket) || 5.00);
      setFechaSorteo(sorteoSeleccionado.fechaSorteo);
      setHoraSorteo(sorteoSeleccionado.horaSorteo);
      setFechaCierre(sorteoSeleccionado.fechaCierre);
      setHoraCierre(sorteoSeleccionado.horaCierre);
      setEstado(sorteoSeleccionado.estado);
      setPremios(sorteoSeleccionado.premios || []);
    }
  }, [sorteoIdSeleccionado, sorteos]);

  // Crear nuevo sorteo
  const handleCrearNuevoSorteo = async () => {
    const nuevo: Partial<Sorteo> = {
      titulo: 'Nuevo Sorteo Oficial',
      descripcion: 'Participa por increíbles premios. Compra tus tickets con Yape o Plin.',
      precioTicket: 5.00,
      fechaSorteo: '2026-11-20',
      horaSorteo: '20:00',
      fechaCierre: '2026-11-20',
      horaCierre: '18:00',
      estado: 'ACTIVO',
      premios: [
        {
          id: `premio-${Date.now()}-1`,
          sorteoId: '',
          nombre: 'Premio Mayor a Definir',
          descripcion: 'Descripción del premio mayor',
          esMayor: true,
          orden: 1,
          imagenUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
        }
      ]
    };

    try {
      const creado = await crearSorteo(nuevo);
      onSorteoActualizado(creado);
      setSorteoIdSeleccionado(creado.id);
      alert('¡Nuevo sorteo creado con éxito!');
    } catch (err) {
      alert('Error al crear sorteo');
    }
  };

  const handleAgregarPremio = () => {
    const nuevo: Premio = {
      id: `premio-${Date.now()}`,
      sorteoId: sorteoSeleccionado?.id || '',
      nombre: 'Nuevo Premio Secundario',
      descripcion: '',
      categoria: 'Premio Especial',
      modelo: 'Edición Oficial',
      cantidad: 1,
      esMayor: false,
      orden: premios.length + 1,
      imagenUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80',
    };
    setPremios([...premios, nuevo]);
  };

  const handleEliminarPremio = (id: string) => {
    setPremios(premios.filter(p => p.id !== id));
  };

  const handleUpdatePremio = (id: string, updates: Partial<Premio>) => {
    setPremios(premios.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sorteoSeleccionado) return;

    setGuardando(true);
    setMensajeExito(false);
    try {
      const dataToUpdate: Partial<Sorteo> = {
        titulo,
        descripcion,
        precioTicket: Number(precioTicket),
        fechaSorteo,
        horaSorteo,
        fechaCierre,
        horaCierre,
        estado,
        premios,
      };

      const res = await actualizarSorteo(sorteoSeleccionado.id, dataToUpdate);
      onSorteoActualizado(res);
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
    } catch (err) {
      alert('Error al guardar el sorteo');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Sorteos y Premios
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administra múltiples sorteos simultáneos o programados, con su propio carrusel de premios y boletos.
          </p>
        </div>

        <button
          onClick={handleCrearNuevoSorteo}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Sorteo</span>
        </button>
      </div>

      {/* Selector de Sorteo */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {sorteos.map(s => (
          <button
            key={s.id}
            onClick={() => setSorteoIdSeleccionado(s.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              s.id === (sorteoSeleccionado?.id)
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{s.estado === 'ACTIVO' ? '🟢' : '⚪'}</span>
            <span className="truncate max-w-[200px]">{s.titulo}</span>
            <span className="text-[10px] opacity-80">(S/ {Number(s.precioTicket).toFixed(2)})</span>
          </button>
        ))}
      </div>

      {mensajeExito && (
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl block">
          ✓ ¡Cambios guardados con éxito en este sorteo!
        </span>
      )}

      {sorteoSeleccionado ? (
        <form onSubmit={handleGuardar} className="space-y-8">
          {/* Parámetros Generales */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <span>Configuración del Sorteo Seleccionado</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">Título del Sorteo:</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">Descripción / Subtítulo:</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Precio por Ticket (S/.):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={precioTicket}
                  onChange={e => setPrecioTicket(parseFloat(e.target.value))}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Estado del Sorteo:</label>
                <select
                  value={estado}
                  onChange={e => setEstado(e.target.value as any)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                >
                  <option value="ACTIVO">🟢 ACTIVO (Visible y vendiendo boletos)</option>
                  <option value="BORRADOR">⚪ BORRADOR (Oculto)</option>
                  <option value="FINALIZADO">🔒 FINALIZADO (Sorteo concluido)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Fecha del Sorteo Oficial:</label>
                <input
                  type="date"
                  required
                  value={fechaSorteo}
                  onChange={e => setFechaSorteo(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Hora del Sorteo:</label>
                <input
                  type="time"
                  required
                  value={horaSorteo}
                  onChange={e => setHoraSorteo(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Fecha de Cierre de Ventas:</label>
                <input
                  type="date"
                  required
                  value={fechaCierre}
                  onChange={e => setFechaCierre(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Hora de Cierre:</label>
                <input
                  type="time"
                  required
                  value={horaCierre}
                  onChange={e => setHoraCierre(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de Premios del Sorteo */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span>Carrusel de Premios de este Sorteo</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Estos premios se mostrarán en el carrusel deslizable dentro de la tarjeta del sorteo.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAgregarPremio}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Premio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premios.map((premio, idx) => (
                <div
                  key={premio.id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-700">Premio #{idx + 1}</span>
                        {premio.cantidad && premio.cantidad > 1 && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            x{premio.cantidad} unids
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={premio.esMayor}
                            onChange={e => handleUpdatePremio(premio.id, { esMayor: e.target.checked })}
                            className="rounded text-purple-600"
                          />
                          <span>Mayor</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleEliminarPremio(premio.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nombre Completo del Premio:</label>
                      <input
                        type="text"
                        value={premio.nombre}
                        onChange={e => handleUpdatePremio(premio.id, { nombre: e.target.value })}
                        placeholder="Ej. Laptop MacBook Air M3"
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Categoría / Título:</label>
                        <input
                          type="text"
                          value={premio.categoria || ''}
                          onChange={e => handleUpdatePremio(premio.id, { categoria: e.target.value })}
                          placeholder="Ej. Laptop"
                          className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Modelo / Subtítulo:</label>
                        <input
                          type="text"
                          value={premio.modelo || ''}
                          onChange={e => handleUpdatePremio(premio.id, { modelo: e.target.value })}
                          placeholder="Ej. MacBook Air"
                          className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-purple-700 uppercase block mb-1">
                        Cantidad de Unidades (Ej. 4 productos iguales):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={premio.cantidad || 1}
                        onChange={e => handleUpdatePremio(premio.id, { cantidad: Math.max(1, parseInt(e.target.value) || 1) })}
                        placeholder="1"
                        className="w-full text-xs font-bold p-2 rounded-xl border border-purple-200 bg-purple-50/50 outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Detalles / Descripción:</label>
                      <input
                        type="text"
                        value={premio.descripcion || ''}
                        onChange={e => handleUpdatePremio(premio.id, { descripcion: e.target.value })}
                        placeholder="Color, accesorios incluidos, garantía..."
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">URL de la Imagen:</label>
                      <input
                        type="text"
                        value={premio.imagenUrl || ''}
                        onChange={e => handleUpdatePremio(premio.id, { imagenUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {premio.imagenUrl && (
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-white border border-slate-200 mt-2">
                      <img src={premio.imagenUrl} alt={premio.nombre} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardando}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : 'Guardar y Publicar Cambios'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 text-center text-slate-500">No hay sorteos disponibles. Crea uno para comenzar.</div>
      )}
    </div>
  );
};
