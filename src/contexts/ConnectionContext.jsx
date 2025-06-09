import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import apiService from '../services/apiService';
import wsService from '../services/websocketService';

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    wsService.connect();

    const unsubscribe = wsService.subscribe('connection', (data) => {
      setWsConnected(data.status === 'connected');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  const sync = useCallback(async () => {
    if (isOnline) {
      apiService.clearCache();
      setLastSync(new Date());
    }
  }, [isOnline]);

  return (
    <ConnectionContext.Provider value={{ isOnline, wsConnected, lastSync, sync }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider');
  }
  return context;
};
