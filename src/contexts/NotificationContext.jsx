import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, X, AlertTriangle, AlertCircle } from 'lucide-react';
import CONFIG from '../constants/config';
import { NOTIFICATION_TYPES } from '../constants/constants';

// Crear el contexto
const NotificationContext = createContext();

// Componente Toast individual
const Toast = ({ notification, onClose }) => {
  const { id, type, message, duration = CONFIG.TOAST_DURATION, actions } = notification;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    [NOTIFICATION_TYPES.SUCCESS]: <Check className="w-5 h-5" />,
    [NOTIFICATION_TYPES.ERROR]: <X className="w-5 h-5" />,
    [NOTIFICATION_TYPES.WARNING]: <AlertTriangle className="w-5 h-5" />,
    [NOTIFICATION_TYPES.INFO]: <AlertCircle className="w-5 h-5" />
  };

  const colors = {
    [NOTIFICATION_TYPES.SUCCESS]: 'bg-green-500',
    [NOTIFICATION_TYPES.ERROR]: 'bg-red-500',
    [NOTIFICATION_TYPES.WARNING]: 'bg-yellow-500',
    [NOTIFICATION_TYPES.INFO]: 'bg-blue-500'
  };

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${colors[type]} animate-slide-in min-w-[300px] max-w-[500px]`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {actions && (
          <div className="mt-2 flex gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose(id);
                }}
                className="text-sm underline hover:no-underline"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Contenedor de notificaciones
const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Provider del contexto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Procesar cola de notificaciones
  useEffect(() => {
    if (notificationQueue.length > 0 && !isProcessing) {
      setIsProcessing(true);
      const [next, ...rest] = notificationQueue;
      
      setNotifications(prev => [...prev, next]);
      setNotificationQueue(rest);
      
      setTimeout(() => {
        setIsProcessing(false);
      }, 100); // Pequeño delay entre notificaciones
    }
  }, [notificationQueue, isProcessing]);

  // Agregar notificación
  const addNotification = useCallback((type, message, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(), // ID único
      type,
      message,
      timestamp: new Date(),
      ...options
    };

    // Si hay muchas notificaciones, agregar a la cola
    if (notifications.length >= 5) {
      setNotificationQueue(prev => [...prev, notification]);
    } else {
      setNotifications(prev => [...prev, notification]);
    }

    // Reproducir sonido si está habilitado
    if (CONFIG.NOTIFICATION_SETTINGS.ENABLE_SOUND && options.playSound !== false) {
      playNotificationSound(type);
    }

    // Mostrar notificación del navegador si está habilitado
    if (CONFIG.NOTIFICATION_SETTINGS.ENABLE_DESKTOP && options.showDesktop !== false) {
      showDesktopNotification(type, message);
    }

    return notification.id;
  }, [notifications.length]);

  // Eliminar notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setNotificationQueue([]);
  }, []);

  // Métodos de conveniencia
  const success = useCallback((message, options) => {
    return addNotification(NOTIFICATION_TYPES.SUCCESS, message, options);
  }, [addNotification]);

  const error = useCallback((message, options) => {
    return addNotification(NOTIFICATION_TYPES.ERROR, message, options);
  }, [addNotification]);

  const warning = useCallback((message, options) => {
    return addNotification(NOTIFICATION_TYPES.WARNING, message, options);
  }, [addNotification]);

  const info = useCallback((message, options) => {
    return addNotification(NOTIFICATION_TYPES.INFO, message, options);
  }, [addNotification]);

  // Reproducir sonido de notificación
  const playNotificationSound = (type) => {
    try {
      const audio = new Audio(CONFIG.NOTIFICATION_SETTINGS.SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('No se pudo reproducir el sonido:', e));
    } catch (error) {
      console.warn('Error reproduciendo sonido de notificación:', error);
    }
  };

  // Mostrar notificación del navegador
  const showDesktopNotification = async (type, message) => {
    if (!('Notification' in window)) return;

    try {
      if (Notification.permission === 'granted') {
        new Notification('Sistema de Precintado Aduanero', {
          body: message,
          icon: '/favicon.ico',
          tag: type,
          requireInteraction: type === NOTIFICATION_TYPES.ERROR
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showDesktopNotification(type, message);
        }
      }
    } catch (error) {
      console.warn('Error mostrando notificación del navegador:', error);
    }
  };

  // Valor del contexto
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
    notificationCount: notifications.length,
    hasNotifications: notifications.length > 0
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Hook para usar el contexto
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

// HOC para componentes que necesitan notificaciones
export const withNotification = (Component) => {
  return function WithNotificationComponent(props) {
    const notification = useNotification();
    return <Component {...props} notification={notification} />;
  };
};

export default NotificationContext;