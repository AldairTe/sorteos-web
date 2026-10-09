import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Ticket, ShieldCheck, Video, ArrowRight } from 'lucide-react';
import { Sorteo } from '@sorteos/shared';

interface Props {
  sorteo: Sorteo;
  onOpenComprar: () => void;
  onScrollToTickets: () => void;
}

export const Hero: React.FC<Props> = ({ sorteo, onOpenComprar, onScrollToTickets }) => {
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const targetDate = new Date(`${sorteo.fechaCierre}T${sorteo.horaCierre || '20:00:00'}`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
      } else {
        const dias = Math.floor(difference / (1000 * 60 * 60 * 24));
        const horas = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ dias, horas, minutos, segundos });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sorteo.fechaCierre, sorteo.horaCierre]);

  const premioPrincipal = sorteo.premios.find(p => p.esMayor) || sorteo.premios[0];

  return (
    <section id="sorteo" className="relative overflow-hidden pt-8 pb-16 sm:py-20">
      {/* Círculos de luz pastel en el fondo */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-pastel-200/40 via-pastel-300/30 to-pastel-100/20 blur-3xl rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Badge en vivo */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pastel-100 border border-pastel-300 text-pastel-700 text-xs sm:text-sm font-bold shadow-sm mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>SORTEO OFICIAL ACTIVO</span>
            <span className="text-pastel-400">|</span>
            <span className="flex items-center gap-1 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verificado por DNI
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {sorteo.titulo}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium">
            {sorteo.descripcion}
          </p>

          {/* Precio llamativo */}
          <div className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-pastel-600 to-pastel-700 text-white px-6 py-2.5 rounded-2xl shadow-pastel text-lg sm:text-xl font-black">
            <Ticket className="w-6 h-6 text-pastel-200" />
            <span>POR SOLO S/ {Number(sorteo.precioTicket).toFixed(2)} EL TICKET</span>
          </div>
        </div>

        {/* Tarjeta Central Destacada con Imagen y Contador */}
        <div className="max-w-5xl mx-auto glow-card rounded-3xl p-4 sm:p-8 shadow-pastel-lg border border-pastel-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Imagen del premio mayor */}
            <div className="lg:col-span-7 relative group overflow-hidden rounded-2xl bg-gradient-to-br from-pastel-100 to-pastel-200 aspect-video flex items-center justify-center">
              {premioPrincipal?.imagenUrl ? (
                <img
                  src={premioPrincipal.imagenUrl}
                  alt={premioPrincipal.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-6xl">🎁</div>
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl font-bold text-xs text-pastel-700 shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>PREMIO MAYOR</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl text-white">
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  {premioPrincipal?.nombre}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  {premioPrincipal?.descripcion}
                </p>
              </div>
            </div>

            {/* Contador de tiempo y Call to action */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center gap-2 text-pastel-700 font-bold text-xs uppercase tracking-wider mb-3">
                  <Clock className="w-4 h-4" />
                  <span>El sorteo finaliza en:</span>
                </div>

                {/* Grid del Contador */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-3 rounded-2xl border border-pastel-200 shadow-sm">
                    <span className="block text-2xl sm:text-3xl font-black text-pastel-800">
                      {String(timeLeft.dias).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Días</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-pastel-200 shadow-sm">
                    <span className="block text-2xl sm:text-3xl font-black text-pastel-800">
                      {String(timeLeft.horas).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Horas</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-pastel-200 shadow-sm">
                    <span className="block text-2xl sm:text-3xl font-black text-pastel-800">
                      {String(timeLeft.minutos).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Min</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-pastel-200 shadow-sm">
                    <span className="block text-2xl sm:text-3xl font-black text-pastel-800">
                      {String(timeLeft.segundos).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Seg</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center mt-3">
                  Fecha oficial: <strong>{sorteo.fechaSorteo}</strong> a las <strong>{sorteo.horaSorteo}</strong>
                </p>
              </div>

              {/* Botones de acción principales */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={onOpenComprar}
                  className="w-full bg-gradient-to-r from-pastel-600 to-pastel-500 hover:from-pastel-700 hover:to-pastel-600 text-white font-black py-4 px-6 rounded-2xl shadow-pastel hover:shadow-pastel-lg transition-all flex items-center justify-center gap-3 text-base sm:text-lg group"
                >
                  <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>¡COMPRAR TICKETS AHORA!</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onScrollToTickets}
                  className="w-full bg-pastel-100 hover:bg-pastel-200 text-pastel-800 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>¿Ya compraste? Consulta tu DNI en "Mis Tickets"</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
