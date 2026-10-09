import React, { useState, useEffect } from 'react';
import { Sorteo, Compra, ConfiguracionWeb, Conversacion } from '@sorteos/shared';
import { getSorteos, getCompras, getConfiguracion, getConversaciones } from './services/api';
import { adminSocket } from './services/socket';
import { Sidebar, TabAdmin } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VerificacionView } from './components/VerificacionView';
import { SorteosView } from './components/SorteosView';
import { ChatView } from './components/ChatView';
import { ReportesView } from './components/ReportesView';
import { ConfiguracionView } from './components/ConfiguracionView';
import { SalonDeLaFamaView } from './components/SalonDeLaFamaView';
import { ReclamacionesView } from './components/ReclamacionesView';
import { Loader2, Menu } from 'lucide-react';

export const App: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<TabAdmin>('dashboard');
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [config, setConfig] = useState<ConfiguracionWeb | null>(null);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [sorteosData, comprasData, configData, conversData] = await Promise.all([
          getSorteos().catch(() => []),
          getCompras().catch(() => []),
          getConfiguracion().catch(() => null),
          getConversaciones().catch(() => []),
        ]);
        setSorteos(sorteosData);
        setCompras(comprasData);
        if (configData) setConfig(configData);
        setConversaciones(conversData);
      } catch (err) {
        console.error('Error al inicializar admin:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // WebSockets: Escuchar en tiempo real compras y chats
  useEffect(() => {
    const handleNuevaCompra = (nueva: Compra) => {
      console.log('[Socket Admin] Nueva compra recibida:', nueva);
      setCompras(prev => [nueva, ...prev]);
    };

    const handleCompraActualizada = (act: Compra) => {
      setCompras(prev => prev.map(c => (c.id === act.id ? act : c)));
    };

    adminSocket.on('nueva_compra_registrada', handleNuevaCompra);
    adminSocket.on('compra_actualizada', handleCompraActualizada);

    return () => {
      adminSocket.off('nueva_compra_registrada', handleNuevaCompra);
      adminSocket.off('compra_actualizada', handleCompraActualizada);
    };
  }, []);

  const handleCompraActualizadaLocal = (compraActualizada: Compra) => {
    setCompras(prev => prev.map(c => (c.id === compraActualizada.id ? compraActualizada : c)));
  };

  const handleSorteoActualizadoLocal = (sorteoActualizado: Sorteo) => {
    setSorteos(prev => prev.map(s => (s.id === sorteoActualizado.id ? sorteoActualizado : s)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
        <p className="text-xs font-bold tracking-wider uppercase">Cargando Panel de Administración...</p>
      </div>
    );
  }

  const sorteoActivo = sorteos.find(s => s.estado === 'ACTIVO') || sorteos[0];
  const pendientesCount = compras.filter(c => c.estado === 'PENDIENTE').length;
  const mensajesNoLeidos = conversaciones.reduce((acc, c) => acc + (c.noLeidosAdmin || 0), 0);

  return (
    <div className="min-h-screen flex bg-slate-100 flex-col lg:flex-row">
      {/* Barra Lateral de Navegación (Desktop y Mobile Drawer) */}
      <Sidebar
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
        pendientesCount={pendientesCount}
        mensajesNoLeidos={mensajesNoLeidos}
        logoUrl={config?.logoUrl}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header móvil con botón hamburguesa */}
        <header className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
              aria-label="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-sm">Panel de Administración</span>
          </div>

          <div className="flex items-center gap-2">
            {pendientesCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendientesCount} pend.
              </span>
            )}
            <span className="text-xs font-mono font-bold text-purple-400">v2.0</span>
          </div>
        </header>

        {/* Vistas según Tab Activa */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {tabActiva === 'dashboard' && (
            <DashboardView
              sorteos={sorteos}
              sorteoActivo={sorteoActivo}
              compras={compras}
              setTabActiva={setTabActiva}
            />
          )}

          {tabActiva === 'verificacion' && (
            <VerificacionView
              compras={compras}
              onCompraActualizada={handleCompraActualizadaLocal}
            />
          )}

          {tabActiva === 'sorteos' && (
            <SorteosView
              sorteos={sorteos}
              onSorteoActualizado={handleSorteoActualizadoLocal}
            />
          )}

          {tabActiva === 'chat' && <ChatView />}

          {tabActiva === 'reportes' && (
            <ReportesView
              sorteos={sorteos}
              sorteoInicial={sorteoActivo}
              compras={compras}
              onSorteoFinalizado={handleSorteoActualizadoLocal}
            />
          )}

          {tabActiva === 'fama' && <SalonDeLaFamaView />}

          {tabActiva === 'reclamaciones' && <ReclamacionesView />}

          {tabActiva === 'configuracion' && config && (
            <ConfiguracionView
              config={config}
              onConfigActualizada={setConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
};
