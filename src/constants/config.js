// Configuración principal de la aplicación
export const CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // WebSocket Configuration
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001',
  ENABLE_WEBSOCKETS: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true' || false,
  
  // Polling & Cache
  POLLING_INTERVAL: 30000, // 30 segundos
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Retry Configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // UI Configuration
  DEFAULT_THEME: 'dark',
  TOAST_DURATION: 3000, // 3 segundos
  ANIMATION_DURATION: 300, // milisegundos
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Feature Flags
  FEATURES: {
    OFFLINE_MODE: true,
    REAL_TIME_UPDATES: true,
    ADVANCED_FILTERS: true,
    EXPORT_DATA: false,
    ANALYTICS: false,
  },
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 segundos
  WEBSOCKET_RECONNECT_INTERVAL: 5000, // 5 segundos
  
  // Storage Keys
  STORAGE_KEYS: {
    THEME: 'precintado_theme',
    USER_PREFERENCES: 'precintado_preferences',
    CACHE_PREFIX: 'precintado_cache_',
  },
  
  // Date Format
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  
  // Map Configuration
  MAP_CENTER: {
    lat: -34.9011,
    lng: -56.1645,
  },
  MAP_ZOOM: 12,
  
  // Stock Thresholds
  STOCK_THRESHOLDS: {
    CRITICAL_MULTIPLIER: 1.0,
    LOW_MULTIPLIER: 2.5,
  },
  
  // Notification Settings
  NOTIFICATION_SETTINGS: {
    ENABLE_SOUND: true,
    ENABLE_DESKTOP: true,
    SOUND_URL: '/sounds/notification.mp3',
  },
  
  // Security
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  INACTIVITY_TIMEOUT: 15 * 60 * 1000, // 15 minutos
  
  // Development
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  ENABLE_LOGS: import.meta.env.DEV,
};

// Validar configuración en desarrollo
if (CONFIG.IS_DEVELOPMENT) {
  console.log('🚀 Configuración cargada:', CONFIG);
}

export default CONFIG;