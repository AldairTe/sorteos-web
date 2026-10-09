import React from 'react';
import { ShieldCheck, Lock, BookOpen } from 'lucide-react';
import { ConfiguracionWeb } from '@sorteos/shared';

interface Props {
  config: ConfiguracionWeb;
  onOpenTerminos: () => void;
  onOpenPrivacidad: () => void;
  onOpenReclamaciones: () => void;
}

export const Footer: React.FC<Props> = ({
  config,
  onOpenTerminos,
  onOpenPrivacidad,
  onOpenReclamaciones,
}) => {
  return (
    <footer className="bg-white dark:bg-[#0c0817] border-t border-purple-200/60 dark:border-purple-900/40 pt-14 pb-8 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo y descripción */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <div className="h-10 max-w-[160px] flex items-center shrink-0">
                  <img
                    src={config.logoUrl}
                    alt={config.nombreNegocio || 'Logo'}
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
              ) : (
                <span className="text-3xl">🍀</span>
              )}
              <div>
                <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight block">
                  {config.nombreNegocio || 'Sorteos El Trébol'}
                </span>
                {config.ruc && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-purple-300/70">
                    RUC: {config.ruc} {config.razonSocial ? `· ${config.razonSocial}` : ''}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-200/70 max-w-sm leading-relaxed">
              {config.slogan || 'Plataforma oficial para rifas y sorteos transparentes. Validación de tickets mediante DNI y pagos directos con Yape y Plin.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Transmisiones en vivo
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Pagos seguros y antifraude
              </span>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-purple-200/80">
              <li>
                <a href="#sorteos-disponibles" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Elige tu Sorteo
                </a>
              </li>
              <li>
                <a href="#como-participar" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  ¿Cómo participar?
                </a>
              </li>
              <li>
                <a href="#mis-tickets" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Consultar Mis Tickets
                </a>
              </li>
            </ul>
          </div>

          {/* Legal y Transparencia */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Transparencia y Legal
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-purple-200/80">
              <li>
                <button
                  type="button"
                  onClick={onOpenTerminos}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left cursor-pointer"
                >
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacidad}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left cursor-pointer"
                >
                  Políticas de Privacidad
                </button>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={onOpenReclamaciones}
                  className="inline-flex items-center gap-2 text-[11px] font-bold text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/70 border border-purple-200 dark:border-purple-800 px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Libro de Reclamaciones</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Créditos y Copyright */}
        <div className="pt-6 border-t border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-purple-300/70 gap-3">
          <p>© {new Date().getFullYear()} {config.nombreNegocio || 'Sorteos El Trébol'}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 text-xs">
            <span>Desarrollado por</span>
            <a
              href="https://devbytex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-80 transition underline decoration-purple-400 decoration-1 underline-offset-2"
            >
              DevbyteX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
