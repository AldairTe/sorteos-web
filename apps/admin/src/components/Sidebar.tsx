import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Gift,
  MessageCircle,
  FileSpreadsheet,
  Settings,
  X,
  ExternalLink,
  BookOpen,
  Trophy,
} from 'lucide-react';

export type TabAdmin = 'dashboard' | 'verificacion' | 'sorteos' | 'chat' | 'reportes' | 'fama' | 'reclamaciones' | 'configuracion';

interface Props {
  tabActiva: TabAdmin;
  setTabActiva: (tab: TabAdmin) => void;
  pendientesCount: number;
  mensajesNoLeidos: number;
  logoUrl?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  tabActiva,
  setTabActiva,
  pendientesCount,
  mensajesNoLeidos,
  logoUrl,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'verificacion',
      label: 'Verificar Pagos',
      icon: CheckSquare,
      badge: pendientesCount > 0 ? pendientesCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'sorteos', label: 'Gestión Sorteos', icon: Gift },
    {
      id: 'chat',
      label: 'Chat en Vivo',
      icon: MessageCircle,
      badge: mensajesNoLeidos > 0 ? mensajesNoLeidos : undefined,
      badgeColor: 'bg-rose-500 text-white animate-bounce',
    },
    { id: 'reportes', label: 'Cierre y Excel', icon: FileSpreadsheet },
    { id: 'fama', label: 'Salón de la Fama', icon: Trophy },
    { id: 'reclamaciones', label: 'Reclamaciones', icon: BookOpen },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const handleSelectTab = (tab: TabAdmin) => {
    setTabActiva(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-full min-h-screen">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
              ) : (
                <span>🍀</span>
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base leading-tight">Admin Sorteos</h1>
              <span className="text-[11px] text-purple-400 font-semibold block">Panel Oficial</span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5">
          {menu.map(item => {
            const Icon = item.icon;
            const activo = tabActiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as TabAdmin)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activo
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 pt-0">
          <a
            href="http://localhost:5180"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition"
          >
            <span>🌐 Ver Web del Cliente</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <div>
          <span className="block font-semibold text-slate-400">Administrador Oficial</span>
          <span>v2.0 • Sorteos Lorenzo</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
