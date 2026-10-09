import React from 'react';
import { Trophy, Gift, Sparkles, Star } from 'lucide-react';
import { Premio } from '@sorteos/shared';

interface Props {
  premios: Premio[];
  onOpenComprar: () => void;
}

export const PremiosPodium: React.FC<Props> = ({ premios, onOpenComprar }) => {
  return (
    <section id="premios" className="py-16 bg-white/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pastel-100 text-pastel-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Lista de Premios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Grandes Premios que Puedes Ganar
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Todos los premios se entregan con documentación y transmisión en vivo ante escribano / público.
          </p>
        </div>

        {/* Grid de Premios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {premios.map((premio, idx) => (
            <div
              key={premio.id || idx}
              className={`glow-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ${
                premio.esMayor
                  ? 'border-2 border-pastel-500 shadow-pastel-lg md:-translate-y-2 ring-4 ring-pastel-200/50'
                  : 'border border-pastel-200 shadow-sm'
              }`}
            >
              <div>
                {/* Badge de tipo de premio */}
                <div className="flex items-center justify-between mb-4">
                  {premio.esMayor ? (
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      PREMIO MAYOR #1
                    </span>
                  ) : (
                    <span className="bg-pastel-100 text-pastel-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-pastel-600" />
                      PREMIO #{idx + 1}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-400">0 Km / Nuevo</span>
                </div>

                {/* Imagen del premio */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-pastel-100 mb-5 relative group">
                  {premio.imagenUrl ? (
                    <img
                      src={premio.imagenUrl}
                      alt={premio.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🎁
                    </div>
                  )}
                </div>

                {/* Título y descripción */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {premio.nombre}
                </h3>
                {premio.descripcion && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {premio.descripcion}
                  </p>
                )}
              </div>

              {/* Botón de acción */}
              <div className="mt-6 pt-4 border-t border-pastel-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-pastel-700 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500" /> ¡Participa hoy!
                </span>
                <button
                  onClick={onOpenComprar}
                  className="text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
                >
                  Comprar Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
