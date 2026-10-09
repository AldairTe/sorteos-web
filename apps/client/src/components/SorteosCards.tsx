import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Ticket,
  Calendar,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { Sorteo, Premio } from '@sorteos/shared';
import { ConfettiLoop } from './ConfettiLoop';

interface Props {
  sorteos: Sorteo[];
  onSeleccionarSorteo: (sorteo: Sorteo) => void;
}

// Subcomponente de cuenta regresiva individual con paleta morada/pastel
const SorteoReloj: React.FC<{ fechaCierre: string; horaCierre: string }> = ({ fechaCierre, horaCierre }) => {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    const targetDate = new Date(`${fechaCierre}T${horaCierre || '20:00:00'}`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
      } else {
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ dias, horas, minutos, segundos });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fechaCierre, horaCierre]);

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-purple-50/90 dark:bg-[#1a1230] border border-purple-200/80 dark:border-purple-800/60 rounded-2xl py-2 px-1 text-center shadow-2xs">
        <span className="block text-lg sm:text-xl font-black text-purple-950 dark:text-purple-100 leading-none">
          {String(timeLeft.dias).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-1 block">
          Días
        </span>
      </div>
      <div className="bg-purple-50/90 dark:bg-[#1a1230] border border-purple-200/80 dark:border-purple-800/60 rounded-2xl py-2 px-1 text-center shadow-2xs">
        <span className="block text-lg sm:text-xl font-black text-purple-950 dark:text-purple-100 leading-none">
          {String(timeLeft.horas).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-1 block">
          Hrs
        </span>
      </div>
      <div className="bg-purple-50/90 dark:bg-[#1a1230] border border-purple-200/80 dark:border-purple-800/60 rounded-2xl py-2 px-1 text-center shadow-2xs">
        <span className="block text-lg sm:text-xl font-black text-purple-950 dark:text-purple-100 leading-none">
          {String(timeLeft.minutos).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-1 block">
          Min
        </span>
      </div>
      <div className="bg-purple-50/90 dark:bg-[#1a1230] border border-purple-200/80 dark:border-purple-800/60 rounded-2xl py-2 px-1 text-center shadow-2xs">
        <span className="block text-lg sm:text-xl font-black text-purple-600 dark:text-purple-300 leading-none">
          {String(timeLeft.segundos).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-1 block">
          Seg
        </span>
      </div>
    </div>
  );
};

// Formatea fecha en español estilo: 20 oct. 2026 · 8:00 p. m.
function formatearFechaHora(fecha: string, hora: string): string {
  try {
    const d = new Date(`${fecha}T${hora || '20:00:00'}`);
    const fechaStr = d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    const horaStr = d.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${fechaStr} · ${horaStr}`;
  } catch {
    return `${fecha} · ${hora}`;
  }
}

// Carrusel interactivo y lineal continuo arrastrable
const CarruselPremiosInteractivo: React.FC<{
  premios: Premio[];
}> = ({ premios }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isHovered = useRef(false);

  // Triplicar lista para desplazamiento infinito continuo
  const items = premios.length > 1 ? [...premios, ...premios, ...premios] : premios;

  useEffect(() => {
    if (premios.length <= 1) return;
    let animId: number;
    // Velocidad optimizada más dinámica: 1.4 px por fotograma
    const speed = 1.4;

    const tick = () => {
      const container = containerRef.current;
      if (container && !isDragging.current && !isHovered.current) {
        const segWidth = container.scrollWidth / 3;
        let next = container.scrollLeft + speed;
        if (segWidth > 0 && next >= segWidth * 2) {
          next -= segWidth;
        }
        container.scrollLeft = next;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [premios]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeftStart.current = container.scrollLeft;
    container.classList.add('cursor-grabbing');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const container = containerRef.current;
    if (!container) return;
    const diff = e.pageX - startX.current;
    container.scrollLeft = scrollLeftStart.current - diff;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    const container = containerRef.current;
    if (container) {
      container.classList.remove('cursor-grabbing');
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => {
        isHovered.current = false;
        handlePointerUp();
      }}
      className="flex items-stretch gap-3.5 overflow-x-auto no-scrollbar py-1 select-none cursor-grab"
    >
      {items.map((premio, idx) => (
        <div
          key={`${premio.id}-${idx}`}
          className="shrink-0 w-[140px] sm:w-[155px] bg-purple-50/70 dark:bg-[#1a1230] border border-purple-200/80 dark:border-purple-800/60 rounded-2xl p-2.5 flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-2xs group"
        >
          {/* Imagen del premio: Con animación de pulso/respiración suave y bordes difuminados */}
          <div className="w-full h-28 rounded-xl overflow-hidden relative mb-2 bg-purple-100/60 dark:bg-[#251b44] shadow-inner">
            {premio.imagenUrl ? (
              <img
                src={premio.imagenUrl}
                alt={premio.nombre}
                draggable={false}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl animate-prize-breathing"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
            )}

            {/* Sombra difuminada interior para suavizar bordes */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-purple-900/10 pointer-events-none" />

            {/* Badge de cantidad si es > 1 */}
            {premio.cantidad && premio.cantidad > 1 && (
              <span className="absolute top-1.5 right-1.5 bg-purple-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
                {premio.cantidad}x
              </span>
            )}
          </div>

          <div className="text-left px-0.5">
            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
              {premio.categoria || premio.nombre}
            </span>
            <span className="text-[11px] text-purple-700/80 dark:text-purple-300/80 block truncate mt-0.5">
              {premio.modelo || premio.descripcion || 'Premio oficial'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Tarjeta individual con la paleta morada/pastel y carrusel arrastrable
const SorteoCardHorizontal: React.FC<{
  sorteo: Sorteo;
  index: number;
  onComprar: () => void;
}> = ({ sorteo, index, onComprar }) => {
  const [modalTodosPremios, setModalTodosPremios] = useState(false);

  // Identificar el Premio Mayor y secundarios
  const premioMayor =
    sorteo.premios?.find(p => p.esMayor) ||
    sorteo.premios?.[0] || {
      id: 'default-mayor',
      sorteoId: sorteo.id,
      nombre: 'Gran Premio Mayor',
      descripcion: 'El premio principal de la jornada',
      esMayor: true,
      orden: 1,
      imagenUrl: sorteo.imagenPrincipal,
    };

  // Carrusel muestra TODOS los premios
  const todosLosPremios = sorteo.premios && sorteo.premios.length > 0 ? sorteo.premios : [premioMayor];
  const codigoSorteo = sorteo.codigo || `SORTEO #${String(index + 1).padStart(3, '0')}`;

  return (
    <>
      <div className="relative bg-white dark:bg-[#130d24] text-slate-900 dark:text-white rounded-[32px] border border-purple-200/90 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 hover:border-purple-400/80 dark:hover:border-purple-700/80 transition-all duration-300 overflow-hidden">
        {/* Contenedor Grid Responsive: 1 columna en móvil, 12 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
          {/* ========================================================
              ZONA IZQUIERDA: PREMIO MAYOR (Fondo que ocupa todo el espacio, difuminado y confeti)
              ======================================================== */}
          <div className="lg:col-span-4 relative bg-gradient-to-b from-[#2e1052] via-[#200b3b] to-[#120422] p-6 sm:p-7 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-purple-900/40 text-white min-h-[300px] sm:min-h-[360px]">
            {/* Imagen del premio mayor ocupando todo el fondo con bordes difuminados */}
            {premioMayor.imagenUrl && (
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={premioMayor.imagenUrl}
                  alt={premioMayor.nombre}
                  className="w-full h-full object-cover object-center scale-105 animate-prize-breathing opacity-85 transition-transform duration-700"
                />
                {/* Overlay degradado morado con viñeta difuminada para fundir los bordes suavemente */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140626] via-[#1c0834]/60 to-[#280c48]/70 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1c0834]/50 via-transparent to-[#120422]" />
              </div>
            )}

            {/* Confeti en bucle continuo dentro de la tarjeta */}
            <ConfettiLoop />

            {/* Header del Premio Mayor: Badge Corona en Oro / Morado */}
            <div className="relative z-20 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-amber-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-amber-500/20 tracking-wide uppercase">
                <span className="text-sm">👑</span>
                <span>PREMIO MAYOR</span>
              </span>

              {premioMayor.cantidad && premioMayor.cantidad > 1 && (
                <span className="bg-white/20 backdrop-blur-md text-amber-300 text-xs font-black px-2.5 py-1 rounded-full border border-amber-300/40">
                  {premioMayor.cantidad}x UNIDADES
                </span>
              )}
            </div>

            {/* Espaciador flexible para centrar el fondo */}
            <div className="relative z-20 flex-1 min-h-[100px]" />

            {/* Textos del Premio Mayor con sombra y halo de legibilidad */}
            <div className="relative z-20 pt-4">
              <div className="inline-block bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                  {premioMayor.nombre}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 font-medium mt-0.5 drop-shadow-sm">
                  {premioMayor.descripcion || 'El gran premio del sorteo'}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              ZONA CENTRAL: TÍTULO Y CARRUSEL ARRASTRABLE LINEAL
              ======================================================== */}
          <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-purple-100 dark:border-purple-900/40">
            <div>
              {/* Código Sorteo en Paleta Morada */}
              <span className="font-mono font-bold text-xs tracking-wider text-purple-600 dark:text-purple-400 uppercase block mb-1">
                {codigoSorteo}
              </span>

              {/* Título y Descripción */}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {sorteo.titulo}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/70 mt-1 line-clamp-2">
                {sorteo.descripcion || 'Tu oportunidad de ganar grandes premios con total transparencia.'}
              </p>
            </div>

            {/* Sección "Todos los premios en juego" con Carrusel Arrastrable */}
            <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Todos los premios en juego ({todosLosPremios.length})</span>
                </span>

                <button
                  type="button"
                  onClick={() => setModalTodosPremios(true)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer transition"
                >
                  <span>Ver todos</span>
                  <span>&gt;</span>
                </button>
              </div>

              {/* Contenedor del Carrusel Arrastrable con Scrollbar oculta */}
              <div className="relative rounded-2xl">
                <CarruselPremiosInteractivo premios={todosLosPremios} />
              </div>
            </div>
          </div>

          {/* ========================================================
              ZONA DERECHA: RELOJ, FECHA, PRECIO Y CTA EN PALETA MORADA
              ======================================================== */}
          <div className="lg:col-span-3 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-purple-50/40 dark:bg-[#100a20]/60">
            {/* Countdown Reloj */}
            <div>
              <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 text-xs font-semibold mb-2.5">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>El sorteo comienza en</span>
              </div>

              <SorteoReloj fechaCierre={sorteo.fechaCierre} horaCierre={sorteo.horaCierre} />
            </div>

            {/* Fecha del Sorteo */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-purple-300/70 block">
                  Fecha del sorteo
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formatearFechaHora(sorteo.fechaSorteo, sorteo.horaSorteo)}
                </span>
              </div>
            </div>

            {/* Precio por Ticket */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 mt-0.5">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-purple-300/70 block">
                  Precio por ticket
                </span>
                <span className="text-2xl font-black text-purple-700 dark:text-purple-300 block tracking-tight mt-0.5">
                  S/ {Number(sorteo.precioTicket).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón CTA Morado / Índigo con Sombra */}
            <button
              onClick={onComprar}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm py-4 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/45 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span>COMPRAR TICKETS</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal para ver lista completa de premios del sorteo */}
      {modalTodosPremios && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#130d24] text-slate-900 dark:text-white rounded-3xl max-w-2xl w-full border border-purple-200 dark:border-purple-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
                  {codigoSorteo}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  Lista Completa de Premios: {sorteo.titulo}
                </h3>
              </div>
              <button
                onClick={() => setModalTodosPremios(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-900/50 hover:bg-slate-200 dark:hover:bg-purple-900 text-slate-700 dark:text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todosLosPremios.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className={`p-4 rounded-2xl border flex items-center gap-4 ${
                    p.esMayor
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700'
                      : 'bg-slate-50 dark:bg-[#1a1230] border-slate-200 dark:border-purple-900/60'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                    {p.imagenUrl ? (
                      <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-2xl">🎁</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.nombre}</span>
                      {p.cantidad && p.cantidad > 1 && (
                        <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded shrink-0">
                          {p.cantidad}x
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-purple-300 truncate mt-0.5">
                      {p.descripcion || 'Premio oficial'}
                    </p>
                    {p.esMayor && (
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block mt-1">
                        ★ PREMIO MAYOR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setModalTodosPremios(false);
                  onComprar();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Participar en este Sorteo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const SorteosCards: React.FC<Props> = ({ sorteos, onSeleccionarSorteo }) => {
  return (
    <section id="sorteos-disponibles" className="py-12 sm:py-16 bg-pastel-50 dark:bg-[#0c0817] transition-colors relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Oficial: "Elige tu sorteo" con "sorteo" en degradado */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/50 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Catálogo Oficial
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            Elige tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500">
              sorteo
            </span>
          </h2>
          <p className="mt-3 text-slate-600 dark:text-purple-200/80 text-sm sm:text-base font-medium">
            Elige el sorteo en el que deseas participar. Cada sorteo cuenta con su propia lista exclusiva de premios.
          </p>
        </div>

        {/* Lista de Sorteos en Paleta Morada con Carrusel Continuo */}
        <div className="space-y-8 max-w-6xl mx-auto">
          {sorteos.map((sorteo, idx) => (
            <SorteoCardHorizontal
              key={sorteo.id}
              sorteo={sorteo}
              index={idx}
              onComprar={() => onSeleccionarSorteo(sorteo)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
