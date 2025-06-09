import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wsService from '../services/websocket.service';
import apiService from '../services/api.service';
import CONFIG from '../constants/config';

// Crear el contexto
const ConnectionContext = createContext();

// Provider del contexto
export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [pendingOperations, setPendingOperations] = useState([]);

  // Manejar cambios en la conexión de red
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexión restaurada');
      
      // Sincronizar automáticamente cuando vuelve la conexión
      if (pendingOperations.length > 0) {
        sync();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Sin conexión');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar el estado inicial
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingOperations.length]);

  // Conectar WebSocket
  useEffect(() => {
    if (CONFIG.ENABLE_WEBSOCKETS && isOnline) {
      wsService.connect();
      
      const unsubscribe = wsService.subscribe('connection', (data) => {
        setWsConnected(data.status === 'connected');
      });
      
      return () => {
        unsubscribe();
        if (!isOnline) {
          wsService.disconnect();
        }
      };
    }
  }, [isOnline]);

  // Función para sincronizar con el servidor
  const sync = useCallback(async () => {
    if (!isOnline) {
      console.warn('No se puede sincronizar sin conexión');
      return false;
    }
    
    setSyncStatus('syncing');
    
    try {
      // Limpiar cache para forzar datos frescos
      apiService.clearCache();
      
      // Procesar operaciones pendientes
      if (pendingOperations.length > 0) {
        console.log(`Procesando ${pendingOperations.length} operaciones pendientes`);
        
        for (const operation of pendingOperations) {
          try {
            await operation.execute();
          } catch (error) {
            console.error('Error procesando operación pendiente:', error);
          }
        }
        
        setPendingOperations([]);
      }
      
      setLastSync(new Date());
      setSyncStatus('success');
      
      // Resetear estado después de mostrar éxito
      setTimeout(() => setSyncStatus('idle'), 3000);
      
      return true;
    } catch (error) {
      console.error('Error durante sincronización:', error);
      setSyncStatus('error');
      
      // Resetear estado después de mostrar error
      setTimeout(() => setSyncStatus('idle'), 3000);
      
      return false;
    }
  }, [isOnline, pendingOperations]);

  // Agregar operación pendiente para sincronizar más tarde
  const addPendingOperation = useCallback((operation) => {
    setPendingOperations(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date(),
      ...operation
    }]);
  }, []);

  // Eliminar operación pendiente
  const removePendingOperation = useCallback((operationId) => {
    setPendingOperations(prev => prev.filter(op => op.id !== operationId));
  }, []);

  // Verificar conectividad con el servidor
  const checkServerConnection = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos de timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Auto-sincronización periódica
  useEffect(() => {
    if (!isOnline || CONFIG.IS_DEVELOPMENT) return;
    
    const interval = setInterval(() => {
      if (pendingOperations.length > 0) {
        sync();
      }
    }, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, [isOnline, pendingOperations.length, sync]);

  // Valor del contexto
  const value = {
    isOnline,
    wsConnected,
    lastSync,
    syncStatus,
    sync,
    pendingOperations,
    addPendingOperation,
    removePendingOperation,
    checkServerConnection,
    connectionStatus: {
      network: isOnline,
      websocket: wsConnected,
      api: isOnline // Podría mejorarse con un health check real
    }
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

// Hook para usar el contexto
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection debe ser usado dentro de ConnectionProvider');
  }
  return context;
};

// HOC para componentes que requieren conexión
export const withConnection = (Component) => {
  return function WithConnectionComponent(props) {
    const connection = useConnection();
    return <Component {...props} connection={connection} />;
  };
};

export default ConnectionContext;