import { useState, useEffect } from 'react';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { 
  Dashboard, 
  DashboardFixed,
  DashboardCleanFixed,
  TransitosPendientes, 
  Desprecintar, 
  Stock, 
  Alertas, 
  Mapa, 
  Camiones,
  TransitosPendientesTablet,
  StockTablet,
  AlertasTablet,
  AlertasFixed,
  MapaTablet,
  CamionesTablet,
  DesprecintarTablet
} from './components/views';
import DashboardSimple from './components/views/DashboardSimple';
import DashboardClean from './components/views/DashboardClean';
import CMOBanner from './components/common/CMOBanner';
import CONFIG from './constants/config';

/**
 * Componente interno de la aplicación que usa el tema
 */
const AppContent = () => {
  const { isDark } = useTheme();
  // Estado para controlar qué modales están abiertos
  const [modals, setModals] = useState({
    transitos: false,
    desprecintar: false,
    stock: false,
    alertas: false,
    mapa: false,
    camiones: false
  });

  // Configuración inicial
  useEffect(() => {
    // Log de configuración en desarrollo
    if (CONFIG.IS_DEVELOPMENT) {
      console.log('🚀 Sistema de Precintado Aduanero iniciado');
      console.log('📋 Configuración:', CONFIG);
    }

    // Solicitar permisos de notificación si están habilitadas
    if (CONFIG.NOTIFICATION_SETTINGS.ENABLE_DESKTOP && 'Notification' in window) {
      Notification.requestPermission();
    }

    // Registrar Service Worker para PWA (si tienes uno)
    if ('serviceWorker' in navigator && CONFIG.IS_PRODUCTION) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registrado:', registration))
        .catch(error => console.error('Error registrando Service Worker:', error));
    }
  }, []);

  // Manejar apertura de módulos desde el dashboard
  const handleModuleClick = (moduleId) => {
    setModals(prev => ({ ...prev, [moduleId]: true }));
  };

  // Manejar cierre de modales
  const handleCloseModal = (moduleId) => {
    setModals(prev => ({ ...prev, [moduleId]: false }));
  };

  return (
    <ConnectionProvider>
      <NotificationProvider>
        {/* Banner de notificaciones destacadas del CMO */}
        <CMOBanner darkMode={isDark} onMessageClick={(message) => {
          // Abrir el módulo de comunicación del CMO cuando se hace clic en un mensaje
          console.log('CMO message clicked:', message);
        }} />
        
        {/* Vista principal del Dashboard */}
        <DashboardCleanFixed onModuleClick={handleModuleClick} darkMode={isDark} />
        
        {/* Modales para cada módulo - Versiones optimizadas para tablet */}
        <TransitosPendientesTablet 
          isOpen={modals.transitos} 
          onClose={() => handleCloseModal('transitos')}
          darkMode={isDark}
        />
        
        <DesprecintarTablet 
          isOpen={modals.desprecintar} 
          onClose={() => handleCloseModal('desprecintar')}
          darkMode={isDark}
        />
        
        <StockTablet 
          isOpen={modals.stock} 
          onClose={() => handleCloseModal('stock')}
          darkMode={isDark}
        />
        
        <AlertasFixed 
          isOpen={modals.alertas} 
          onClose={() => handleCloseModal('alertas')}
          darkMode={isDark}
        />
        
        <MapaTablet 
          isOpen={modals.mapa} 
          onClose={() => handleCloseModal('mapa')}
          darkMode={isDark}
        />
        
        <CamionesTablet 
          isOpen={modals.camiones} 
          onClose={() => handleCloseModal('camiones')}
          darkMode={isDark}
        />
        </NotificationProvider>
      </ConnectionProvider>
  );
};

/**
 * Componente principal que envuelve toda la aplicación con los providers
 */
const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;