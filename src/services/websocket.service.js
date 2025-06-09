import CONFIG from '../constants/config';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectInterval = CONFIG.WEBSOCKET_RECONNECT_INTERVAL;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.messageQueue = [];
    this.isConnected = false;
  }

  connect() {
    if (!CONFIG.ENABLE_WEBSOCKETS) {
      console.log('WebSocket deshabilitado por configuración');
      return;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya está conectado');
      return;
    }
    
    try {
      console.log('Intentando conectar WebSocket...');
      this.ws = new WebSocket(CONFIG.WEBSOCKET_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
        
        // Enviar mensajes en cola
        this.flushMessageQueue();
        
        // Autenticarse si hay token
        const token = localStorage.getItem('auth_token');
        if (token) {
          this.send('auth', { token });
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket desconectado', event);
        this.isConnected = false;
        this.notifyListeners('connection', { status: 'disconnected', code: event.code });
        
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', { error });
      };
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 segundos
    );
    
    console.log(`Reconectando en ${delay}ms... (intento ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    console.log('Desconectando WebSocket...');
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close(1000, 'Desconexión manual');
      this.ws = null;
    }
    this.isConnected = false;
    this.messageQueue = [];
    this.listeners.clear();
  }

  handleMessage(data) {
    const { type, payload, id } = data;
    
    // Manejar tipos especiales de mensajes
    switch (type) {
      case 'ping':
        this.send('pong', { timestamp: Date.now() });
        break;
      
      case 'auth_success':
        console.log('Autenticación WebSocket exitosa');
        this.notifyListeners('auth', { status: 'authenticated' });
        break;
      
      case 'auth_error':
        console.error('Error de autenticación WebSocket');
        this.notifyListeners('auth', { status: 'error', error: payload.error });
        break;
      
      default:
        // Notificar a los listeners del tipo específico
        this.notifyListeners(type, payload);
        
        // Notificar a los listeners globales
        this.notifyListeners('*', { type, payload });
    }
    
    // Si el mensaje tiene un ID, podría ser una respuesta a una solicitud
    if (id) {
      this.notifyListeners(`response_${id}`, payload);
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    // Si no está conectado, intentar conectar
    if (!this.isConnected && CONFIG.ENABLE_WEBSOCKETS) {
      this.connect();
    }
    
    // Retornar función para desuscribirse
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  notifyListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${eventType}:`, error);
        }
      });
    }
  }

  send(type, payload = {}, options = {}) {
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      id: options.id || this.generateId()
    };
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return message.id;
      } catch (error) {
        console.error('Error enviando mensaje WebSocket:', error);
        this.queueMessage(message);
      }
    } else {
      // Si no está conectado, encolar el mensaje
      this.queueMessage(message);
      
      // Intentar reconectar
      if (CONFIG.ENABLE_WEBSOCKETS && !this.isConnected) {
        this.connect();
      }
    }
    
    return message.id;
  }

  queueMessage(message) {
    this.messageQueue.push(message);
    
    // Limitar el tamaño de la cola
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift(); // Eliminar el mensaje más antiguo
    }
  }

  flushMessageQueue() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const queue = [...this.messageQueue];
      this.messageQueue = [];
      
      queue.forEach(message => {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error enviando mensaje encolado:', error);
        }
      });
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de utilidad para eventos específicos
  subscribeToTransitUpdates(callback) {
    return this.subscribe('transit_update', callback);
  }

  subscribeToStockUpdates(callback) {
    return this.subscribe('stock_update', callback);
  }

  subscribeToAlertUpdates(callback) {
    return this.subscribe('alert_update', callback);
  }

  subscribeToPositionUpdates(callback) {
    return this.subscribe('position_update', callback);
  }

  // Métodos para enviar actualizaciones
  updateTransitStatus(transitId, status) {
    return this.send('update_transit_status', { transitId, status });
  }

  updateStockLevel(locationId, itemType, quantity) {
    return this.send('update_stock_level', { locationId, itemType, quantity });
  }

  resolveAlert(alertId, userId) {
    return this.send('resolve_alert', { alertId, userId });
  }

  // Estado de conexión
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : null,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }

  // Reconectar manualmente
  reconnect() {
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.disconnect();
    this.connect();
  }
}

// Instancia única del servicio
const wsService = new WebSocketService();

// En desarrollo, exponer el servicio globalmente para debugging
if (CONFIG.IS_DEVELOPMENT) {
  window.wsService = wsService;
}

export { WebSocketService };
export default wsService;