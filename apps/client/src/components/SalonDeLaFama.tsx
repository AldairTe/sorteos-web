import React, { useEffect, useState, useRef } from 'react';
import { GanadorFama } from '@sorteos/shared';
import { getGanadoresFama } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SalonDeLaFama: React.FC = () => {
  const [ganadores, setGanadores] = useState<GanadorFama[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStartLeft = useRef(0);
  const isHovered = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGanadoresFama();
        if (data && data.length > 0) {
          setGanadores(data);
        }
      } catch (e) {
        console.error('Error cargando ganadores del salón de la fama:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Multiplicamos la lista si hay al menos 2 elementos para efecto continuo infinito
  const items = ganadores.length > 1 ? [...ganadores, ...ganadores, ...ganadores] : ganadores;

  // Auto-scroll continuo lineal
  useEffect(() => {
    if (ganadores.length <= 1) return;
    let animId: number;
    const speed = 1.1; // Desplazamiento continuo agradable

    const step = () => {
      const container = scrollRef.current;
      if (container && !isDragging.current && !isHovered.current) {
        const oneThird = container.scrollWidth / 3;
        let nextLeft = container.scrollLeft + speed;
        if (oneThird > 0 && nextLeft >= oneThird * 2) {
          nextLeft -= oneThird;
        }
        container.scrollLeft = nextLeft;
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [ganadores]);

  // Manejo de arrastre (drag con mouse / swipe táctil)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStartLeft.current = container.scrollLeft;
    container.classList.add('cursor-grabbing');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const diff = e.pageX - startX.current;
    container.scrollLeft = scrollStartLeft.current - diff;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    const container = scrollRef.current;
    if (container) {
      container.classList.remove('cursor-grabbing');
    }
  };

  const handleScrollDir = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 360;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!loading && ganadores.length === 0) {
    return null;
  }

  return (
    <section id="salon-de-la-fama" className="py-16 sm:py-24 bg-pastel-50 dark:bg-[#0a0614] transition-colors relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Centrado */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/50 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Ellos ya ganaron
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            Salón de la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500">
              fama
            </span>
          </h2>
          <p className="mt-2 text-slate-600 dark:text-purple-200/80 text-sm sm:text-base font-medium">
            Nuestros afortunados ganadores con entrega verificada ante notario público y transmisiones en vivo.
          </p>

          {/* Flechas de navegación centradas */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleScrollDir('left')}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-[#160f2b] border border-purple-200 dark:border-purple-900 text-slate-700 dark:text-white flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950 transition cursor-pointer shadow-xs active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScrollDir('right')}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-[#160f2b] border border-purple-200 dark:border-purple-900 text-slate-700 dark:text-white flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-950 transition cursor-pointer shadow-xs active:scale-95"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carrusel Centrado: Cards SOLO con imágenes, en formato horizontal */}
        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => { isHovered.current = true; }}
          onMouseLeave={() => {
            isHovered.current = false;
            handlePointerUp();
          }}
          className="flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar py-4 select-none cursor-grab"
        >
          {items.map((g, idx) => (
            <div
              key={`${g.id}-${idx}`}
              className="shrink-0 w-[300px] sm:w-[380px] md:w-[420px] h-[190px] sm:h-[240px] md:h-[260px] rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10 border border-purple-200/90 dark:border-purple-900/70 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group bg-slate-900"
            >
              {/* Tarjeta contiene ÚNICAMENTE la imagen en horizontal que ocupa el 100% del card */}
              <img
                src={g.fotoUrl}
                alt={g.nombre || 'Ganador'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
