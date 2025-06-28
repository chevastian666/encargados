import { useEffect, useCallback, useRef } from 'react';
import wsService from '../services/websocket.service';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook para manejar actualizaciones en tiempo real
 * Conecta automáticamente con WebSocket y gestiona las actualizaciones
 */
export const useRealtimeUpdates = (options = {}) => {
  const {
    onTransitUpdate,
    onStockUpdate,
    onAlertUpdate,
    onPositionUpdate,
    autoConnect = true,
    showNotifications = true
  } = options;
  
  const { success, error, warning, info } = useNotification();
  const subscriptionsRef = useRef([]);
  const isConnectedRef = useRef(false);

  // Conectar WebSocket
  const connect = useCallback(() => {
    if (!isConnectedRef.current && autoConnect) {
      wsService.connect();
      isConnectedRef.current = true;
    }
  }, [autoConnect]);

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    wsService.disconnect();
    isConnectedRef.current = false;
  }, []);

  // Manejar actualización de tránsito
  const handleTransitUpdate = useCallback((data) => {
    if (onTransitUpdate) {
      onTransitUpdate(data);
    }
    
    if (showNotifications && data.showNotification) {
      info(
        `Tránsito ${data.matricula} actualizado`
      );
    }
  }, [onTransitUpdate, showNotifications, info]);

  // Manejar actualización de stock
  const handleStockUpdate = useCallback((data) => {
    if (onStockUpdate) {
      onStockUpdate(data);
    }
    
    if (showNotifications && data.critical) {
      warning(
        `Stock crítico: ${data.itemType} en ${data.location}`
      );
    }
  }, [onStockUpdate, showNotifications, warning]);

  // Manejar nueva alerta
  const handleAlertUpdate = useCallback((data) => {
    if (onAlertUpdate) {
      onAlertUpdate(data);
    }
  }, [onAlertUpdate]);

  // Manejar actualización de posición
  const handlePositionUpdate = useCallback((data) => {
    if (onPositionUpdate) {
      onPositionUpdate(data);
    }
  }, [onPositionUpdate]);

  useEffect(() => {
    // Conectar al montar
    connect();

    // Suscribirse a eventos
    const unsubscribers = [];

    if (onTransitUpdate) {
      unsubscribers.push(
        wsService.subscribeToTransitUpdates(handleTransitUpdate)
      );
    }

    if (onStockUpdate) {
      unsubscribers.push(
        wsService.subscribeToStockUpdates(handleStockUpdate)
      );
    }

    if (onAlertUpdate) {
      unsubscribers.push(
        wsService.subscribeToAlertUpdates(handleAlertUpdate)
      );
    }

    if (onPositionUpdate) {
      unsubscribers.push(
        wsService.subscribeToPositionUpdates(handlePositionUpdate)
      );
    }

    // Suscribirse a eventos de conexión
    const connectionUnsubscriber = wsService.subscribe('connection', (data) => {
      if (data.status === 'connected') {
        success('Conectado al servidor en tiempo real');
      } else if (data.status === 'disconnected') {
        warning('Conexión perdida. Reconectando...');
      }
    });

    unsubscribers.push(connectionUnsubscriber);
    subscriptionsRef.current = unsubscribers;

    // Limpiar al desmontar
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      if (autoConnect) {
        disconnect();
      }
    };
  }, []);

  // Enviar actualización manual
  const sendUpdate = useCallback((type, payload) => {
    return wsService.send(type, payload);
  }, []);

  // Obtener estado de conexión
  const getConnectionStatus = useCallback(() => {
    return wsService.getConnectionStatus();
  }, []);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    wsService.reconnect();
  }, []);

  return {
    connected: isConnectedRef.current,
    sendUpdate,
    getConnectionStatus,
    reconnect,
    connect,
    disconnect
  };
};