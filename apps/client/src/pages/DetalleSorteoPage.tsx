import React, { useState, useEffect } from 'react';
import { Sorteo, Premio, ConfiguracionWeb } from '@sorteos/shared';
import { ArrowLeft, Clock, Calendar, Ticket, Gift, Sparkles, Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import { ConfettiLoop } from '../components/ConfettiLoop';

interface Props {
  sorteo: Sorteo;
  config: ConfiguracionWeb;
  onVolver: () => void;
  onComprar: (sorteo: Sorteo) => void;
}

export const DetalleSorteoPage: React.FC<Props> = ({
  sorteo,
  config,
  onVolver,
  onComprar,
}) => {
  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    const targetDate = new Date(`${sorteo.fechaCierre}T${sorteo.horaCierre || '20:00:00'}`).getTime();

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
  }, [sorteo.fechaCierre, sorteo.horaCierre]);

  const premios = sorteo.premios || [];
  const precioUnitario = Number(sorteo.precioTicket);
  const premioMayor = premios.find(p => p.esMayor) || premios[0];

  const formatearFechaHora = (fechaStr: string, horaStr?: string) => {
    try {
      const d = new Date(`${fechaStr}T${horaStr || '20:00:00'}`);
      return d.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return `${fechaStr} ${horaStr || ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-pastel-50 dark:bg-[#0c0817] text-slate-900 dark:text-purple-100 py-8 sm:py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onVolver}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white bg-white dark:bg-[#160e2b] border border-purple-200 dark:border-purple-800/80 px-4 py-2.5 rounded-2xl shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo de Sorteos</span>
          </button>

          <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            {sorteo.codigo || 'SORTEO OFICIAL'}
          </span>
        </div>

        {/* HERO: Cabecera Detallada del Sorteo */}
        <div className="relative bg-gradient-to-br from-[#2a0e4e] via-[#1c0836] to-[#0d031b] rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-12 text-white overflow-hidden shadow-2xl border border-purple-800/50">
          {/* Confeti ambiental en el hero */}
          <ConfettiLoop />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Información Principal */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-purple-300">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Detalle Completo del Sorteo</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {sorteo.titulo}
              </h1>

              <p className="text-sm sm:text-base text-purple-200/90 max-w-2xl leading-relaxed">
                {sorteo.descripcion || 'Participa en este gran sorteo adquiriendo tus boletos y sé uno de los afortunados ganadores con entrega 100% legal y verificada.'}
              </p>

              {/* Datos clave del sorteo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider block font-bold">
                      Fecha de Transmisión
                    </span>
                    <span className="text-xs sm:text-sm font-black capitalize">
                      {formatearFechaHora(sorteo.fechaSorteo, sorteo.horaSorteo)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 uppercase tracking-wider block font-bold">
                      Precio Oficial por Boleto
                    </span>
                    <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                      S/ {precioUnitario.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de Contador y Botón de Compra Directo */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/15 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-200 mb-3">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>El sorteo inicia en:</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-black/30 rounded-2xl p-2.5 text-center border border-white/10">
                    <span className="block text-2xl font-black font-mono text-white">
                      {String(timeLeft.dias).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Días</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-2.5 text-center border border-white/10">
                    <span className="block text-2xl font-black font-mono text-white">
                      {String(timeLeft.horas).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Hrs</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-2.5 text-center border border-white/10">
                    <span className="block text-2xl font-black font-mono text-white">
                      {String(timeLeft.minutos).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Min</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-2.5 text-center border border-white/10">
                    <span className="block text-2xl font-black font-mono text-amber-300">
                      {String(timeLeft.segundos).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Seg</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onComprar(sorteo)}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Ticket className="w-5 h-5 stroke-[2.5]" />
                <span>COMPRAR BOLETOS AHORA</span>
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-purple-300/80 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Validación antifraude y entrega notarial garantizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PREMIOS EN CARDS GRANDES */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-purple-200/80 dark:border-purple-900/60 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4" />
                <span>Catálogo Exclusivo</span>
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-1">
                Todos los Premios en Juego ({premios.length})
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300/80">
              Imágenes en alta definición y especificaciones de cada producto
            </p>
          </div>

          {/* Grid de Cards Grandes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {premios.map((premio, idx) => {
              const esMayor = premio.esMayor || idx === 0;
              return (
                <div
                  key={premio.id || idx}
                  className={`relative rounded-3xl overflow-hidden border transition-all duration-300 group flex flex-col justify-between ${
                    esMayor
                      ? 'bg-gradient-to-b from-purple-50 via-white to-purple-50/50 dark:from-[#1b0f33] dark:via-[#150b28] dark:to-[#100820] border-amber-400/80 dark:border-amber-400/60 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30'
                      : 'bg-white dark:bg-[#130d24] border-purple-200/90 dark:border-purple-900/70 shadow-lg shadow-purple-500/5 hover:border-purple-400 dark:hover:border-purple-700'
                  }`}
                >
                  {/* Contenedor de Imagen Grande */}
                  <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-purple-100/50 to-purple-200/30 dark:from-[#1e1338] dark:to-[#120924] overflow-hidden p-4 flex items-center justify-center">
                    {premio.imagenUrl ? (
                      <img
                        src={premio.imagenUrl}
                        alt={premio.nombre}
                        draggable={false}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 animate-prize-breathing"
                      />
                    ) : (
                      <div className="text-6xl">🎁</div>
                    )}

                    {/* Badge Premio Mayor */}
                    {esMayor && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>PREMIO MAYOR</span>
                      </div>
                    )}

                    {/* Badge de Cantidad formato "x3", "x5" */}
                    {premio.cantidad && premio.cantidad > 1 && (
                      <div className="absolute top-4 right-4 bg-purple-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider">
                        x{premio.cantidad}
                      </div>
                    )}

                    {/* Sombra difuminada interior para bordes suaves */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-purple-900/10 dark:ring-purple-200/10 pointer-events-none" />
                  </div>

                  {/* Datos del Premio */}
                  <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {premio.categoria && (
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
                          {premio.categoria}
                        </span>
                      )}

                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                        {premio.nombre}
                      </h3>

                      {premio.modelo && (
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
                          Modelo: {premio.modelo}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/80 leading-relaxed mt-2">
                        {premio.descripcion || 'Premio oficial verificado ante notario público para este sorteo.'}
                      </p>
                    </div>

                    {premio.valorEstimado && (
                      <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500 dark:text-purple-300">Valor comercial aprox:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                          S/ {Number(premio.valorEstimado).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BANNER INFERIOR DE ACCIÓN */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black">
            ¿Listo para llevarte alguno de estos premios?
          </h3>
          <p className="text-sm sm:text-base text-purple-100 max-w-xl mx-auto">
            Elige tu cantidad de tickets, realiza tu pago por Yape o Plin y participa inmediatamente en la transmisión en vivo.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onComprar(sorteo)}
              className="inline-flex items-center gap-2 bg-white text-purple-900 hover:bg-purple-50 font-black text-sm sm:text-base py-4 px-8 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Ticket className="w-5 h-5 text-purple-600 stroke-[2.5]" />
              <span>COMPRAR BOLETOS (S/ {precioUnitario.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
