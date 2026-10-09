import React from 'react';
import { ScanLine, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

export const ComoParticipar: React.FC = () => {
  return (
    <section id="como-participar" className="py-16 sm:py-24 bg-white dark:bg-[#0c0817] transition-colors relative border-b border-purple-100 dark:border-purple-900/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/50 px-4 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Pasos sencillos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            ¿Cómo Participar en el Sorteo?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-purple-200/80 text-sm sm:text-base font-medium">
            Todo el proceso está digitalizado para que tengas total tranquilidad, rapidez y respaldo de tu dinero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 sm:gap-8">
          {/* PASO 01: Logos oficiales de Yape y Plin usando las imágenes del usuario */}
          <div className="relative bg-purple-50/50 dark:bg-[#130d24] rounded-[32px] p-8 border border-purple-200/80 dark:border-purple-900/60 shadow-lg shadow-purple-500/5 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-purple-300 dark:text-purple-900/80">
                  01
                </span>
                <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  Rápido y Seguro
                </span>
              </div>

              {/* Imágenes oficiales de los logos de Yape y Plin */}
              <div className="h-16 flex items-center gap-3 mb-6">
                {/* Logo Imagen Yape */}
                <div className="h-16 flex-1 bg-white dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/80 p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src="/icons/Logo-yape-cerberus.webp"
                    alt="Yape"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Logo Imagen Plin */}
                <div className="h-16 flex-1 bg-white dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800/80 p-2 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src="/icons/plin-logo-png_seeklogo-386806.png"
                    alt="Plin"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Paga con Yape o Plin
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/70 leading-relaxed font-medium">
                Yapea o plinea el importe deseado al número o escaneando el QR oficial. Aceptamos pagos directos las 24 horas del día.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cuentas 100% verificadas</span>
            </div>
          </div>

          {/* PASO 02: Lector OCR Inteligente */}
          <div className="relative bg-purple-50/50 dark:bg-[#130d24] rounded-[32px] p-8 border border-purple-200/80 dark:border-purple-900/60 shadow-lg shadow-purple-500/5 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-purple-300 dark:text-purple-900/80">
                  02
                </span>
                <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  Sin Esperas
                </span>
              </div>

              {/* Gráfico Lector OCR */}
              <div className="h-16 flex items-center mb-6">
                <div className="w-full h-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-between px-5 text-white shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2.5">
                    <ScanLine className="w-6 h-6 text-amber-300 animate-pulse" />
                    <span className="font-mono font-black text-xs tracking-wider">ESCÁNER OCR INTELIGENTE</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Validación OCR Automática
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/70 leading-relaxed font-medium">
                Adjunta la captura de tu comprobante. Nuestro lector digital extrae tu código de operación al instante y previene comprobantes duplicados.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Detección antifraude instantánea</span>
            </div>
          </div>

          {/* PASO 03: Ícono de Tickets Dorado / Morado */}
          <div className="relative bg-purple-50/50 dark:bg-[#130d24] rounded-[32px] p-8 border border-purple-200/80 dark:border-purple-900/60 shadow-lg shadow-purple-500/5 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-purple-300 dark:text-purple-900/80">
                  03
                </span>
                <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  100% Transparente
                </span>
              </div>

              {/* Gráfico Icono de Tickets Dorado */}
              <div className="h-16 flex items-center mb-6">
                <div className="w-full h-16 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl flex items-center justify-between px-5 text-amber-950 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎟️</span>
                    <div>
                      <span className="font-mono font-black text-xs block leading-none">#010423 · #010424</span>
                      <span className="text-[10px] font-bold text-amber-900 uppercase">TICKETS OFICIALES</span>
                    </div>
                  </div>
                  <span className="text-lg">⭐</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Tus Tickets Garantizados
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/70 leading-relaxed font-medium">
                Consulta en "Mis Tickets" con tu DNI. Verás tu compra registrada como "Pendiente" y luego "Participando" con tus números asignados.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sorteo transmitido en vivo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
