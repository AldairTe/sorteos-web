import React, { useState, useEffect } from 'react';
import { Sorteo, ConfiguracionWeb } from '@sorteos/shared';
import { getSorteos, getConfiguracion } from './services/api';
import { Navbar } from './components/Navbar';
import { SorteosCards } from './components/SorteosCards';
import { TransmisionesSection } from './components/TransmisionesSection';
import { ComoParticipar } from './components/ComoParticipar';
import { MisTicketsSection } from './components/MisTicketsSection';
import { SalonDeLaFama } from './components/SalonDeLaFama';
import { ChatWidget } from './components/ChatWidget';
import { Footer } from './components/Footer';
import { TerminosPage } from './pages/TerminosPage';
import { PrivacidadPage } from './pages/PrivacidadPage';
import { LibroReclamacionesPage } from './pages/LibroReclamacionesPage';
import { ComprarPage } from './pages/ComprarPage';
import { Loader2 } from 'lucide-react';

type ActivePage = 'home' | 'terminos' | 'privacidad' | 'reclamaciones' | 'comprar';

export const App: React.FC = () => {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState<Sorteo | null>(null);
  const [config, setConfig] = useState<ConfiguracionWeb>({
    nombreNegocio: 'Sorteos El Trébol',
    slogan: '¡Participa, sueña y gana grandes premios!',
    tituloPestana: 'Sorteos El Trébol — Gana Autos, Motos y Dinero en Efectivo',
    ruc: '20609876543',
    razonSocial: 'SORTEOS EL TREBOL S.A.C.',
    direccionLegal: 'Av. Las Palmeras 1234, San Isidro, Lima, Perú',
    emailLegal: 'contacto@sorteoseltrebol.com',
    telefonoLegal: '+51 987 654 321',
    yapeNumero: '987 654 321',
    yapeNombre: 'Juan Lorenzo Perez',
    yapeQr: '/uploads/qr-yape.png',
    plinNumero: '987 654 321',
    plinNombre: 'Juan Lorenzo Perez',
    plinQr: '/uploads/qr-plin.png',
    billeteras: [],
    whatsappNumero: '+51987654321',
    whatsappMensaje: 'Hola, tengo una consulta.',
    facebookUrl: 'https://facebook.com',
    tiktokUrl: 'https://tiktok.com',
    canalTransmisionUrl: 'https://facebook.com/live',
    transmisionesActiva: true,
    transmisionFacebookUrl: 'https://facebook.com',
    transmisionFacebookActivo: true,
    transmisionWhatsappUrl: 'https://whatsapp.com',
    transmisionWhatsappActivo: true,
  });
  const [loading, setLoading] = useState(true);

  // Páginas completas (no modales)
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith('#terminos')) return 'terminos';
    if (hash.startsWith('#privacidad')) return 'privacidad';
    if (hash.startsWith('#libro-reclamaciones') || hash.startsWith('#reclamaciones')) return 'reclamaciones';
    if (hash.startsWith('#comprar')) return 'comprar';
    return 'home';
  });

  // Modo Claro / Oscuro garantizado al 100%
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_sorteos');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme_sorteos', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme_sorteos', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Chat y consulta de tickets
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatDniPrefill, setChatDniPrefill] = useState<string | undefined>();
  const [ticketsDniQuery, setTicketsDniQuery] = useState<string | undefined>();

  useEffect(() => {
    async function init() {
      try {
        const [sorteosData, configData] = await Promise.all([
          getSorteos().catch(() => []),
          getConfiguracion().catch(() => null),
        ]);
        if (sorteosData && sorteosData.length > 0) {
          setSorteos(sorteosData);
          // Si el hash indica un sorteo específico o por defecto el primero
          const hash = window.location.hash;
          if (hash.startsWith('#comprar-')) {
            const id = hash.replace('#comprar-', '');
            const found = sorteosData.find(s => s.id === id);
            setSorteoSeleccionado(found || sorteosData[0]);
          } else {
            setSorteoSeleccionado(sorteosData[0]);
          }
        }
        if (configData) setConfig(configData);
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Escuchar cambios de hash para navegación por URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#terminos')) {
        setActivePage('terminos');
        window.scrollTo(0, 0);
      } else if (hash.startsWith('#privacidad')) {
        setActivePage('privacidad');
        window.scrollTo(0, 0);
      } else if (hash.startsWith('#libro-reclamaciones') || hash.startsWith('#reclamaciones')) {
        setActivePage('reclamaciones');
        window.scrollTo(0, 0);
      } else if (hash.startsWith('#comprar')) {
        const raw = window.location.hash;
        if (raw.startsWith('#comprar-')) {
          const id = raw.replace('#comprar-', '');
          const found = sorteos.find(s => s.id === id);
          if (found) setSorteoSeleccionado(found);
        }
        setActivePage('comprar');
        window.scrollTo(0, 0);
      } else if (hash === '' || hash.startsWith('#sorteos') || hash.startsWith('#como-participar') || hash.startsWith('#mis-tickets') || hash.startsWith('#salon-de-la-fama')) {
        setActivePage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sorteos]);

  // Actualización dinámica de título de pestaña y favicon
  useEffect(() => {
    if (config.tituloPestana) {
      document.title = config.tituloPestana;
    } else if (config.nombreNegocio) {
      document.title = `${config.nombreNegocio} — Gana Autos, Motos y Dinero en Efectivo`;
    }
    if (config.logoUrl) {
      const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
      if (favicon) {
        favicon.href = config.logoUrl;
      }
    }
  }, [config.tituloPestana, config.nombreNegocio, config.logoUrl]);

  const navigateTo = (page: ActivePage, sorteo?: Sorteo) => {
    if (sorteo) {
      setSorteoSeleccionado(sorteo);
    }
    setActivePage(page);
    if (page === 'terminos') {
      window.location.hash = 'terminos';
    } else if (page === 'privacidad') {
      window.location.hash = 'privacidad';
    } else if (page === 'reclamaciones') {
      window.location.hash = 'libro-reclamaciones';
    } else if (page === 'comprar') {
      window.location.hash = sorteo ? `comprar-${sorteo.id}` : 'comprar';
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTickets = (dni?: string) => {
    if (dni) {
      setTicketsDniQuery(dni);
    }
    const elem = document.getElementById('mis-tickets');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAbrirComprarSorteo = (sorteoElegido: Sorteo) => {
    navigateTo('comprar', sorteoElegido);
  };

  const handleCompraCompletada = (dni: string) => {
    navigateTo('home');
    setTimeout(() => {
      scrollToTickets(dni);
    }, 200);
  };

  const handleOpenChat = (dni?: string) => {
    if (dni) setChatDniPrefill(dni);
    setIsChatOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-50 dark:bg-[#0c0817] flex flex-col items-center justify-center transition-colors">
        <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-pastel-lg animate-bounce">
          🍀
        </div>
        <p className="mt-4 text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          Cargando Sorteos Oficiales...
        </p>
      </div>
    );
  }

  const sorteoParaComprar = sorteoSeleccionado || sorteos[0];

  return (
    <div
      data-theme={isDarkMode ? 'dark' : 'light'}
      className="min-h-screen flex flex-col bg-pastel-50 dark:bg-[#0c0817] text-slate-900 dark:text-purple-100 transition-colors selection:bg-purple-300 dark:selection:bg-purple-900"
    >
      {/* 1. Barra de Navegación Oficial: con Botón "Ganadores" y selector de tema a su DERECHA */}
      <Navbar
        config={config}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onScrollToGanadores={() => {
          if (activePage !== 'home') {
            navigateTo('home');
            setTimeout(() => {
              const elem = document.getElementById('salon-de-la-fama');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          } else {
            const elem = document.getElementById('salon-de-la-fama');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onScrollToTickets={() => {
          if (activePage !== 'home') {
            navigateTo('home');
            setTimeout(() => scrollToTickets(), 150);
          } else {
            scrollToTickets();
          }
        }}
      />

      {/* Renderizado de páginas según la ruta activa (NO modales) */}
      {activePage === 'terminos' ? (
        <TerminosPage config={config} onVolver={() => navigateTo('home')} />
      ) : activePage === 'privacidad' ? (
        <PrivacidadPage config={config} onVolver={() => navigateTo('home')} />
      ) : activePage === 'reclamaciones' ? (
        <LibroReclamacionesPage config={config} onVolver={() => navigateTo('home')} />
      ) : activePage === 'comprar' && sorteoParaComprar ? (
        <ComprarPage
          sorteo={sorteoParaComprar}
          config={config}
          onVolver={() => navigateTo('home')}
          onCompraCompletada={handleCompraCompletada}
        />
      ) : (
        <main className="flex-1">
          {/* 2. CATÁLOGO OFICIAL: Elige tu Sorteo */}
          {sorteos.length > 0 && (
            <SorteosCards
              sorteos={sorteos}
              onSeleccionarSorteo={handleAbrirComprarSorteo}
            />
          )}

          {/* 3. SECCIÓN: Nuestras transmisiones en vivo (debajo de sorteos, centrado y vertical) */}
          <TransmisionesSection config={config} />

          {/* 4. Sección Informativa: Cómo Participar con logos oficiales de Yape y Plin */}
          <ComoParticipar />

          {/* 5. Sección "Mis Tickets" con búsqueda por DNI (estricto 8 dígitos) */}
          <MisTicketsSection
            initialDni={ticketsDniQuery}
            onOpenChat={handleOpenChat}
          />

          {/* 6. SECCIÓN: Salón de la Fama (Centrado, carrusel horizontal solo con imágenes) */}
          <SalonDeLaFama />
        </main>
      )}

      {/* 7. Footer Oficial con enlace DevbyteX y páginas legales */}
      <Footer
        config={config}
        onOpenTerminos={() => navigateTo('terminos')}
        onOpenPrivacidad={() => navigateTo('privacidad')}
        onOpenReclamaciones={() => navigateTo('reclamaciones')}
      />

      {/* Chat en Vivo Flotante */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        clienteDniPrefill={chatDniPrefill}
      />
    </div>
  );
};
