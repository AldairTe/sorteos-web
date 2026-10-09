import React from 'react';
import { Trophy, Search, Sun, Moon } from 'lucide-react';
import { ConfiguracionWeb } from '@sorteos/shared';

interface Props {
  config: ConfiguracionWeb;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onScrollToGanadores: () => void;
  onScrollToTickets: () => void;
}

export const Navbar: React.FC<Props> = ({
  config,
  isDarkMode,
  onToggleDarkMode,
  onScrollToGanadores,
  onScrollToTickets,
}) => {
  return (
    <header className="sticky top-0 z-40">
      {/* Fondo desvanecido suave hacia abajo sin borde inferior */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/10 dark:from-[#0c0817]/95 dark:via-[#0c0817]/85 dark:to-[#0c0817]/10 backdrop-blur-md pointer-events-none [mask-image:linear-gradient(to_bottom,black_80%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent)]" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo oficial sin recuadro morado */}
        <div className="flex items-center gap-3.5">
          {config.logoUrl ? (
            <div className="h-11 max-w-[180px] flex items-center shrink-0">
              <img
                src={config.logoUrl}
                alt={config.nombreNegocio || 'Logo'}
                className="max-h-11 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-pastel shrink-0">
              🍀
            </div>
          )}
          <div>
            <span className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight text-slate-900 dark:text-white block leading-tight">
              {config.nombreNegocio || 'Sorteos El Trébol'}
            </span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block tracking-tight">
              100% Transparentes y Seguros
            </span>
          </div>
        </div>

        {/* Links desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-purple-200/80">
          <a
            href="#sorteos-disponibles"
            className="hover:text-purple-600 dark:hover:text-white transition-colors"
          >
            Sorteos Activos
          </a>
          <a
            href="#como-participar"
            className="hover:text-purple-600 dark:hover:text-white transition-colors"
          >
            ¿Cómo participar?
          </a>
          <button
            onClick={onScrollToTickets}
            className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/70 border border-purple-200/60 dark:border-purple-800/50 px-3.5 py-1.5 rounded-full transition-colors font-bold cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Mis Tickets
          </button>
        </nav>

        {/* Action Buttons: Botón Ganadores a la izquierda, y Botón de Tema a su DERECHA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Botón Ganadores (reemplazando el botón de comprar) */}
          <button
            type="button"
            onClick={onScrollToGanadores}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 sm:px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Ganadores</span>
          </button>

          {/* Botón de Alternancia Modo Claro / Oscuro situado a la DERECHA de Ganadores */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-2xl bg-purple-100/80 dark:bg-[#1c1236] text-purple-900 dark:text-amber-300 hover:bg-purple-200 dark:hover:bg-[#281a4e] border border-purple-200 dark:border-purple-800/70 transition-all cursor-pointer flex items-center justify-center shadow-xs"
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            ) : (
              <Moon className="w-5 h-5 text-purple-700 stroke-[2.2]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
