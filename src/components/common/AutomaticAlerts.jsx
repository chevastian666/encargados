import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Bell, CheckCircle, X, Clock, 
  Truck, Package, AlertCircle, Volume2, VolumeX,
  ChevronDown, ChevronUp, User, Timer
} from 'lucide-react';
import wsService from '../../services/websocket.service';
import { useNotification } from '../../hooks';

/**
 * Sistema de alertas automáticas en tiempo real
 * Muestra notificaciones proactivas sobre eventos importantes
 */
const AutomaticAlerts = ({ darkMode = false }) => {
  const [alerts, setAlerts] = useState([]);
  const [expandedAlerts, setExpandedAlerts] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { success, error, warning, info } = useNotification();
  const audioRef = useRef(null);

  // Tipos de alerta con configuración
  const alertConfigs = {
    transit_state_change: {
      icon: Package,
      color: 'blue',
      sound: 'notification',
      priority: 2
    },
    truck_delayed: {
      icon: Truck,
      color: 'yellow',
      sound: 'warning',
      priority: 3
    },
    critical_wait: {
      icon: Timer,
      color: 'red',
      sound: 'alert',
      priority: 5
    },
    long_wait: {
      icon: Clock,
      color: 'orange',
      sound: 'warning',
      priority: 4
    },
    system_alert: {
      icon: AlertCircle,
      color: 'purple',
      sound: 'notification',
      priority: 1
    }
  };

  // Sonidos de alerta
  const alertSounds = {
    notification: '/sounds/notification.mp3',
    warning: '/sounds/warning.mp3',
    alert: '/sounds/alert.mp3'
  };

  // Manejar nueva alerta
  const handleNewAlert = (alert) => {
    const newAlert = {
      ...alert,
      id: alert.id || `alert_${Date.now()}_${Math.random()}`,
      read: false,
      acknowledged: false
    };

    setAlerts(prev => {
      // Evitar duplicados
      const exists = prev.some(a => 
        a.type === alert.type && 
        a.transitId === alert.transitId &&
        Date.now() - a.timestamp < 60000 // Dentro del último minuto
      );
      
      if (exists) return prev;
      
      // Agregar nueva alerta al principio
      return [newAlert, ...prev].slice(0, 50); // Mantener máximo 50 alertas
    });

    setUnreadCount(prev => prev + 1);
    
    // Reproducir sonido si está habilitado
    if (soundEnabled) {
      playAlertSound(alert.type);
    }

    // Mostrar notificación del navegador
    showBrowserNotification(alert);
    
    // Mostrar notificación en la UI
    const notificationMethod = getSeverityType(alert.severity);
    switch (notificationMethod) {
      case 'error':
        error(alert.message);
        break;
      case 'warning':
        warning(alert.message);
        break;
      case 'info':
        info(alert.message);
        break;
      default:
        info(alert.message);
    }
    
    // Abrir panel automáticamente para alertas críticas
    if (alert.severity === 'critical') {
      setShowPanel(true);
    }
  };

  useEffect(() => {
    // Suscribirse a alertas automáticas
    const unsubscribe = wsService.subscribe('auto_alert', handleNewAlert);
    
    // Solicitar permisos de notificación del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Reproducir sonido de alerta
  const playAlertSound = (alertType) => {
    const config = alertConfigs[alertType];
    const soundFile = alertSounds[config?.sound || 'notification'];
    
    // Deshabilitado temporalmente hasta que se agreguen los archivos de sonido
    /*
    if (audioRef.current) {
      audioRef.current.src = soundFile;
      audioRef.current.play().catch(err => {
        console.error('Error reproduciendo sonido:', err);
      });
    }
    */
  };

  // Mostrar notificación del navegador
  const showBrowserNotification = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const config = alertConfigs[alert.type];
      const Icon = config?.icon || AlertCircle;
      
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        badge: '/badge.png',
        tag: alert.type,
        requireInteraction: alert.severity === 'critical',
        data: alert
      });
    }
  };

  // Marcar alerta como leída
  const markAsRead = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Reconocer alerta (marcar como resuelta)
  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true, read: true } : alert
      )
    );
    
    const alert = alerts.find(a => a.id === alertId);
    if (alert && !alert.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Enviar confirmación al servidor
    wsService.send('acknowledge_alert', { alertId });
  };

  // Expandir/contraer detalles de alerta
  const toggleAlertExpanded = (alertId) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
        markAsRead(alertId);
      }
      return newSet;
    });
  };

  // Obtener tipo de severidad para notificación
  const getSeverityType = (severity) => {
    const severityMap = {
      critical: 'error',
      warning: 'warning',
      info: 'info'
    };
    return severityMap[severity] || 'info';
  };

  // Obtener clases de estilo según severidad
  const getSeverityClasses = (severity) => {
    const classes = {
      critical: {
        bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
        border: 'border-red-500',
        text: darkMode ? 'text-red-300' : 'text-red-700',
        icon: darkMode ? 'text-red-400' : 'text-red-600'
      },
      warning: {
        bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
        border: 'border-yellow-500',
        text: darkMode ? 'text-yellow-300' : 'text-yellow-700',
        icon: darkMode ? 'text-yellow-400' : 'text-yellow-600'
      },
      info: {
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        border: 'border-blue-500',
        text: darkMode ? 'text-blue-300' : 'text-blue-700',
        icon: darkMode ? 'text-blue-400' : 'text-blue-600'
      }
    };
    return classes[severity] || classes.info;
  };

  // Componente de alerta individual
  const AlertItem = ({ alert }) => {
    const config = alertConfigs[alert.type];
    const Icon = config?.icon || AlertCircle;
    const severityClasses = getSeverityClasses(alert.severity);
    const isExpanded = expandedAlerts.has(alert.id);
    
    return (
      <div className={`
        border rounded-lg p-4 mb-3 transition-all duration-200
        ${severityClasses.bg} ${severityClasses.border}
        ${!alert.read ? 'border-l-4' : ''}
        ${alert.acknowledged ? 'opacity-60' : ''}
        hover:shadow-md cursor-pointer
      `}>
        <div 
          onClick={() => toggleAlertExpanded(alert.id)}
          className="flex items-start justify-between"
        >
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-full ${severityClasses.bg}`}>
              <Icon className={`w-5 h-5 ${severityClasses.icon}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={`font-semibold ${severityClasses.text}`}>
                  {alert.title}
                </h4>
                {!alert.read && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                    Nueva
                  </span>
                )}
                {alert.requiresAction && !alert.acknowledged && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                    Acción requerida
                  </span>
                )}
              </div>
              
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {alert.message}
              </p>
              
              <div className="flex items-center space-x-4 mt-2">
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(alert.timestamp).toLocaleString('es-UY', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
                
                {alert.matricula && (
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Truck className="w-3 h-3 inline mr-1" />
                    {alert.matricula}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Detalles expandidos */}
        {isExpanded && (
          <div className={`
            mt-4 pt-4 border-t
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {alert.suggestedActions && (
              <div className="mb-3">
                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Acciones sugeridas:
                </h5>
                <ul className="space-y-1">
                  {alert.suggestedActions.map((action, idx) => (
                    <li key={idx} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!alert.acknowledged && alert.requiresAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  acknowledgeAlert(alert.id);
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${darkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                  }
                  transition-colors duration-200
                `}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Marcar como resuelta
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Botón flotante de notificaciones */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          fixed bottom-6 right-6 z-40
          p-4 rounded-full shadow-lg
          ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
          ${unreadCount > 0 ? 'animate-pulse' : ''}
          transition-all duration-200 hover:scale-110
        `}
      >
        <Bell className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-2 py-1 text-xs rounded-full bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de alertas */}
      {showPanel && (
        <div className={`
          fixed bottom-20 right-6 z-40
          w-96 max-h-[600px] rounded-xl shadow-2xl
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          flex flex-col
          animate-in slide-in-from-bottom-4 fade-in duration-200
        `}>
          {/* Header */}
          <div className={`
            p-4 border-b
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Alertas Automáticas
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                  `}
                  title={soundEnabled ? 'Silenciar alertas' : 'Activar sonido'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                  `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de alertas */}
          <div className="flex-1 overflow-y-auto p-4">
            {alerts.length === 0 ? (
              <div className={`
                text-center py-8
                ${darkMode ? 'text-gray-400' : 'text-gray-500'}
              `}>
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay alertas activas</p>
                <p className="text-sm mt-1">
                  Las alertas automáticas aparecerán aquí
                </p>
              </div>
            ) : (
              <div>
                {alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {/* Footer con estadísticas */}
          {alerts.length > 0 && (
            <div className={`
              p-3 border-t text-center text-sm
              ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}
            `}>
              {alerts.filter(a => !a.acknowledged).length} alertas activas • 
              {alerts.filter(a => !a.read).length} sin leer
            </div>
          )}
        </div>
      )}

      {/* Elemento de audio para sonidos */}
      <audio ref={audioRef} />
    </>
  );
};

export default AutomaticAlerts;