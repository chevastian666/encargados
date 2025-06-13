import { useState, useEffect } from 'react';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { 
  Dashboard, 
  DashboardFixed,
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
import CONFIG from './constants/config';

/**
 * Componente principal de la aplicación
 */
const App = () => {
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
        {/* Vista principal del Dashboard */}
        <DashboardFixed onModuleClick={handleModuleClick} />
        
        {/* Modales para cada módulo - Versiones optimizadas para tablet */}
        <TransitosPendientesTablet 
          isOpen={modals.transitos} 
          onClose={() => handleCloseModal('transitos')} 
          darkMode={true} 
        />
        
        <DesprecintarTablet 
          isOpen={modals.desprecintar} 
          onClose={() => handleCloseModal('desprecintar')} 
          darkMode={true} 
        />
        
        <StockTablet 
          isOpen={modals.stock} 
          onClose={() => handleCloseModal('stock')} 
          darkMode={true} 
        />
        
        <AlertasFixed 
          isOpen={modals.alertas} 
          onClose={() => handleCloseModal('alertas')} 
          darkMode={true} 
        />
        
        <MapaTablet 
          isOpen={modals.mapa} 
          onClose={() => handleCloseModal('mapa')} 
          darkMode={true} 
        />
        
        <CamionesTablet 
          isOpen={modals.camiones} 
          onClose={() => handleCloseModal('camiones')} 
          darkMode={true} 
        />
      </NotificationProvider>
    </ConnectionProvider>
  );
};

export default App;