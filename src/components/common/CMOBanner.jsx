import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, X, ChevronRight, MessageSquare,
  AlertTriangle, Info, Clock, CheckCircle
} from 'lucide-react';
import { useNotification } from '../../hooks';

/**
 * Banner de notificaciones destacadas del CMO
 * Muestra mensajes importantes en la parte superior de la pantalla
 */
const CMOBanner = ({ darkMode = false, onMessageClick }) => {
  const [activeBanners, setActiveBanners] = useState([]);
  const [dismissedBanners, setDismissedBanners] = useState(new Set());
  
  // Tipos de banner según prioridad
  const bannerTypes = {
    critical: {
      bgClass: darkMode ? 'bg-red-900' : 'bg-red-600',
      borderClass: 'border-red-700',
      textClass: 'text-white',
      icon: AlertTriangle,
      duration: null // No se auto-cierra
    },
    warning: {
      bgClass: darkMode ? 'bg-orange-900' : 'bg-orange-500',
      borderClass: 'border-orange-600',
      textClass: 'text-white',
      icon: AlertCircle,
      duration: 30000 // 30 segundos
    },
    info: {
      bgClass: darkMode ? 'bg-blue-900' : 'bg-blue-600',
      borderClass: 'border-blue-700',
      textClass: 'text-white',
      icon: Info,
      duration: 15000 // 15 segundos
    },
    success: {
      bgClass: darkMode ? 'bg-green-900' : 'bg-green-600',
      borderClass: 'border-green-700',
      textClass: 'text-white',
      icon: CheckCircle,
      duration: 10000 // 10 segundos
    }
  };

  // Agregar nuevo banner
  const addBanner = (message) => {
    // No mostrar si ya fue descartado
    if (dismissedBanners.has(message.id)) return;
    
    // No duplicar banners activos
    if (activeBanners.some(b => b.id === message.id)) return;
    
    const banner = {
      ...message,
      id: message.id || `banner_${Date.now()}`,
      type: message.priority === 'high' ? 'critical' : 'warning',
      timestamp: Date.now()
    };
    
    setActiveBanners(prev => [...prev, banner]);
    
    // Auto-cerrar según el tipo
    const config = bannerTypes[banner.type];
    if (config.duration) {
      setTimeout(() => {
        removeBanner(banner.id);
      }, config.duration);
    }
  };

  // Remover banner
  const removeBanner = (bannerId) => {
    setActiveBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  // Descartar banner (no volver a mostrar)
  const dismissBanner = (bannerId) => {
    setDismissedBanners(prev => new Set([...prev, bannerId]));
    removeBanner(bannerId);
  };

  // Escuchar mensajes del CMO
  useEffect(() => {
    const handleCMOMessage = (message) => {
      // Solo mostrar banner para mensajes de alta prioridad o con bannerRequired
      if (message.priority === 'high' || message.showBanner) {
        addBanner(message);
      }
    };

    // Suscribirse a eventos
    window.addEventListener('cmo_message', handleCMOMessage);
    
    return () => {
      window.removeEventListener('cmo_message', handleCMOMessage);
    };
  }, [activeBanners, dismissedBanners]);

  if (activeBanners.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-2">
      {activeBanners.map(banner => {
        const config = bannerTypes[banner.type] || bannerTypes.info;
        const Icon = config.icon;
        
        return (
          <div
            key={banner.id}
            className={`
              ${config.bgClass} ${config.borderClass} ${config.textClass}
              border-b-2 shadow-lg
              animate-in slide-in-from-top-2 fade-in duration-300
            `}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {banner.title || 'Mensaje del CMO'}
                      </span>
                      {banner.transitId && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                          Tránsito: {banner.transitId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 opacity-90">
                      {banner.content}
                    </p>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="flex items-center space-x-4 text-sm opacity-75">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(banner.timestamp).toLocaleTimeString('es-UY', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </span>
                    
                    {banner.sender && (
                      <span>{banner.sender}</span>
                    )}
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      if (onMessageClick) {
                        onMessageClick(banner);
                      }
                    }}
                    className={`
                      px-3 py-1 rounded-lg text-sm font-medium
                      bg-white/20 hover:bg-white/30
                      transition-colors duration-200
                      flex items-center space-x-1
                    `}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Responder</span>
                  </button>
                  
                  <button
                    onClick={() => dismissBanner(banner.id)}
                    className={`
                      p-1 rounded-lg
                      hover:bg-white/20
                      transition-colors duration-200
                    `}
                    title="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Barra de progreso para auto-cerrado */}
              {config.duration && (
                <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/40 animate-progress"
                    style={{
                      animationDuration: `${config.duration}ms`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CMOBanner;