export const CONFIG = {
  API_BASE_URL: 'http://localhost:3001/api',
  POLLING_INTERVAL: 30000, // 30 segundos
  WEBSOCKET_URL: 'ws://localhost:3001',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  ENABLE_WEBSOCKETS: false // Cambiar a true cuando esté disponible el servidor WS
};

export default CONFIG;
