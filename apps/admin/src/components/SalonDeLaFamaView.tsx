import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Upload, CheckCircle2, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getGanadoresFama, crearGanadorFama, eliminarGanadorFama, subirFotoGanador } from '../services/api';
import { comprimirImagen } from '../utils/compressImage';

export const SalonDeLaFamaView: React.FC = () => {
  const [ganadores, setGanadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario nuevo ganador
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nombre, setNombre] = useState('');
  const [premio, setPremio] = useState('');
  const [sorteoTitulo, setSorteoTitulo] = useState('');
  const [ticketNumero, setTicketNumero] = useState('');
  const [ciudad, setCiudad] = useState('Lima, Perú');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [orden, setOrden] = useState(1);

  // Foto y compresión
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [infoCompresion, setInfoCompresion] = useState<{ originalKb: number; finalKb: number; ahorro: number } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarGanadores = async () => {
    setLoading(true);
    try {
      const data = await getGanadoresFama();
      setGanadores(data);
    } catch (err) {
      console.error('Error cargando salón de la fama:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGanadores();
  }, []);

  const handleSeleccionarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Super compresión con Canvas
      const { file: compressed, pesoOriginalKb, pesoFinalKb, ahorroPorcentaje } = await comprimirImagen(file, 1200, 0.70);
      setFotoFile(compressed);
      setFotoPreview(URL.createObjectURL(compressed));
      setInfoCompresion({
        originalKb: pesoOriginalKb,
        finalKb: pesoFinalKb,
        ahorro: ahorroPorcentaje,
      });
    } catch (err) {
      console.error('Error al comprimir foto:', err);
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCrearGanador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !premio.trim()) {
      alert('Nombre y premio son obligatorios');
      return;
    }

    if (!fotoFile) {
      alert('Debes adjuntar la fotografía del ganador con su premio');
      return;
    }

    setGuardando(true);
    try {
      // 1. Subir foto comprimida
      const fotoUrl = await subirFotoGanador(fotoFile);

      // 2. Guardar registro
      const nuevo = await crearGanadorFama({
        nombre: nombre.trim(),
        premio: premio.trim(),
        sorteoTitulo: sorteoTitulo.trim(),
        ticketNumero: ticketNumero.trim(),
        ciudad: ciudad.trim(),
        fecha,
        orden: Number(orden) || 1,
        fotoUrl,
      });

      setGanadores(prev => [nuevo, ...prev]);
      setModalNuevo(false);

      // Reset
      setNombre('');
      setPremio('');
      setSorteoTitulo('');
      setTicketNumero('');
      setFotoFile(null);
      setFotoPreview(null);
      setInfoCompresion(null);

      alert('¡Ganador publicado con éxito en el Salón de la Fama!');
    } catch (err) {
      alert('Error al publicar el ganador');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este ganador del Salón de la Fama?')) return;
    try {
      await eliminarGanadorFama(id);
      setGanadores(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Salón de la Fama (Galería de Ganadores)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administra las fotos y testimonios de clientes que ganaron en sorteos pasados. Se muestran en el carrusel principal.
          </p>
        </div>

        <button
          onClick={() => setModalNuevo(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ganador</span>
        </button>
      </div>

      {/* Grid de Ganadores */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Cargando ganadores...</span>
        </div>
      ) : ganadores.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
          Aún no hay ganadores en el Salón de la Fama. ¡Haz clic en "Agregar Ganador" para publicar el primero!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ganadores.map(g => (
            <div
              key={g.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              {/* Foto con overlay */}
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                <img
                  src={g.fotoUrl}
                  alt={g.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleEliminar(g.id)}
                  className="absolute top-3 right-3 p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full transition shadow-md cursor-pointer"
                  title="Eliminar ganador"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase shadow-xs">
                    {g.ticketNumero || 'Ganador'}
                  </span>
                </div>
              </div>

              {/* Textos */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-black text-sm text-slate-900 leading-tight">
                    {g.nombre}
                  </h4>
                  <p className="font-extrabold text-xs text-purple-700 mt-1 line-clamp-1">
                    {g.premio}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {g.sorteoTitulo}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>{g.ciudad}</span>
                  <span>{g.fecha}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Agregar Ganador */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Registrar Ganador en la Galería</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                La fotografía se optimizará automáticamente con super compresión para carga ultrarrápida.
              </p>
            </div>

            <form onSubmit={handleCrearGanador} className="space-y-4">
              {/* Subida de Foto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Fotografía del Ganador con el Premio *
                </label>
                <div className="p-4 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl text-center bg-purple-50/40 relative">
                  {fotoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={fotoPreview}
                        alt="Preview"
                        className="w-full h-44 object-cover rounded-xl shadow-xs mx-auto"
                      />
                      {infoCompresion && (
                        <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
                          ⚡ Super Compresión: {infoCompresion.originalKb} KB → {infoCompresion.finalKb} KB ({infoCompresion.ahorro}% más ligero)
                        </div>
                      )}
                      <label className="text-xs font-bold text-purple-600 hover:underline cursor-pointer block">
                        Cambiar fotografía
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSeleccionarFoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-4">
                      <ImageIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <span className="text-xs font-bold text-purple-700 block">
                        Haz clic aquí para seleccionar foto
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG o WEBP (Cualquier tamaño)</span>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleSeleccionarFoto}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Sánchez"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Premio Ganado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toyota RAV4 0 Km"
                    value={premio}
                    onChange={e => setPremio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Título del Sorteo</label>
                  <input
                    type="text"
                    placeholder="Ej. Gran Sorteo #001"
                    value={sorteoTitulo}
                    onChange={e => setSorteoTitulo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">N° de Ticket Premiado</label>
                  <input
                    type="text"
                    placeholder="Ej. #004521"
                    value={ticketNumero}
                    onChange={e => setTicketNumero(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Ciudad / Región</label>
                  <input
                    type="text"
                    placeholder="Ej. Lima, Perú"
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subiendo Foto y Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Publicar Ganador</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
