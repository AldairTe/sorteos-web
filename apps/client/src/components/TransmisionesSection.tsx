import React from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { ExternalLink } from 'lucide-react';

interface Props {
  config: ConfiguracionWeb;
}

export const TransmisionesSection: React.FC<Props> = ({ config }) => {
  // Si la sección completa está desactivada por el administrador, no renderizar
  if (config.transmisionesActiva === false) {
    return null;
  }

  const fbActivo = config.transmisionFacebookActivo !== false;
  const ytActivo = Boolean(config.transmisionYoutubeActivo && config.transmisionYoutubeUrl);
  const waActivo = config.transmisionWhatsappActivo !== false;

  if (!fbActivo && !ytActivo && !waActivo) {
    return null;
  }

  const facebookUrl = config.transmisionFacebookUrl || config.facebookUrl || 'https://facebook.com';
  const youtubeUrl = config.transmisionYoutubeUrl || 'https://youtube.com';
  const whatsappUrl = config.transmisionWhatsappUrl || (config.whatsappNumero ? `https://wa.me/${config.whatsappNumero.replace(/\D/g, '')}` : 'https://whatsapp.com');

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-[#0c0817] border-y border-purple-100 dark:border-purple-900/40 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Centrado */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-4 py-1.5 rounded-full mb-3 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Transmisiones Oficiales
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Nuestras transmisiones <span className="text-rose-600 font-extrabold">EN VIVO</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/80 mt-2 font-medium">
            Sigue los sorteos en vivo y los avisos oficiales de ganadores a través de nuestros canales oficiales.
          </p>
        </div>

        {/* Cards Apilados y Centrados con mayor tonalidad y contraste */}
        <div className="max-w-xl mx-auto flex flex-col gap-4 sm:gap-5">
          {/* Card Facebook Apilado */}
          {fbActivo && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-100/90 via-blue-50/80 to-indigo-50/70 dark:from-[#0d1c38] dark:via-[#0b162c] dark:to-[#081020] border-2 border-blue-300 dark:border-blue-700/80 hover:border-[#1877F2] dark:hover:border-[#1877F2] rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#1877F2]/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                {/* Contenedor del logo con color de marca azul para resaltar el icono blanco */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1877F2] border border-[#1877F2] p-2.5 flex items-center justify-center shrink-0 shadow-md shadow-[#1877F2]/30 group-hover:scale-105 transition-transform">
                  <img
                    src="/icons/facebook (1).png"
                    alt="Facebook"
                    className="w-full h-full object-contain filter brightness-100"
                  />
                </div>

                <div className="min-w-0">
                  <span className="inline-block bg-[#1877F2] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-xs">
                    🏆 Transmisión Principal
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Facebook Live
                  </h4>
                  <p className="text-xs text-[#125ec2] dark:text-[#64a2ff] font-bold truncate mt-0.5">
                    Transmisión oficial del sorteo en directo
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ml-3 shadow-sm">
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </div>
            </a>
          )}

          {/* Card YouTube Apilado (Debajo de Facebook) */}
          {ytActivo && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-gradient-to-r from-red-100/90 via-red-50/80 to-rose-50/70 dark:from-[#350a0a] dark:via-[#260808] dark:to-[#180505] border-2 border-red-300 dark:border-red-700/80 hover:border-[#FF0000] dark:hover:border-[#FF0000] rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF0000]/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FF0000] border border-[#FF0000] p-3 flex items-center justify-center shrink-0 shadow-md shadow-[#FF0000]/30 group-hover:scale-105 transition-transform">
                  <img
                    src="/icons/youtube.svg"
                    alt="YouTube"
                    className="w-full h-full object-contain filter brightness-100"
                  />
                </div>

                <div className="min-w-0">
                  <span className="inline-block bg-[#FF0000] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-xs">
                    🔴 Canal Oficial
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    YouTube Transmisión
                  </h4>
                  <p className="text-xs text-[#cc0000] dark:text-[#ff6666] font-bold truncate mt-0.5">
                    Sigue la transmisión y repeticiones en directo
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#FF0000] text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ml-3 shadow-sm">
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </div>
            </a>
          )}

          {/* Card WhatsApp Apilado */}
          {waActivo && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-100/90 via-emerald-50/80 to-teal-50/70 dark:from-[#092518] dark:via-[#071c12] dark:to-[#05140d] border-2 border-emerald-300 dark:border-emerald-700/80 hover:border-[#25D366] dark:hover:border-[#25D366] rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#25D366]/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                {/* Contenedor del logo con color de marca verde para resaltar el icono blanco */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#25D366] border border-[#25D366] p-2.5 flex items-center justify-center shrink-0 shadow-md shadow-[#25D366]/30 group-hover:scale-105 transition-transform">
                  <img
                    src="/icons/whatsapp (1).png"
                    alt="WhatsApp"
                    className="w-full h-full object-contain filter brightness-100"
                  />
                </div>

                <div className="min-w-0">
                  <span className="inline-block bg-[#25D366] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-xs">
                    💬 Comunidad Oficial
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Comunidad de WhatsApp
                  </h4>
                  <p className="text-xs text-[#139443] dark:text-[#52e78b] font-bold truncate mt-0.5">
                    Resultados, listas de tickets y alertas
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ml-3 shadow-sm">
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
