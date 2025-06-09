import { useState, useEffect, useCallback, useRef } from 'react';
import { useConnection } from '../contexts/ConnectionContext';
import wsService from '../services/websocket.service';
import CONFIG from '../constants/config';
import { usePolling } from './usePolling';

/**
 * Hook personalizado para manejar datos de API con actualización automática
 * @param {Function} apiMethod - Método de la API a llamar
 * @param {Array} dependencies - Dependencias que disparan una nueva llamada
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApiData = (apiMethod, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useConnection();
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(null);
  
  const {
    pollingInterval = CONFIG.POLLING_INTERVAL,
    enablePolling = true,
    enableWebSocket = CONFIG.ENABLE_WEBSOCKETS,
    wsEventName = null,
    transform = null,
    onSuccess = null,
    onError = null,
    retryAttempts = CONFIG.MAX_RETRY_ATTEMPTS,
    retryDelay = CONFIG.RETRY_DELAY,
    cacheKey = null,
    initialData = null
  } = options;

  // Función para guardar en localStorage si se especifica cacheKey
  const saveToLocalStorage = useCallback((data) => {
    if (cacheKey) {
      try {
        localStorage.setItem(
          `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${cacheKey}`,
          JSON.stringify({
            data,
            timestamp: Date.now()
          })
        );
      } catch (error) {
        console.error('Error guardando en localStorage:', error);
      }
    }
  }, [cacheKey]);

  // Función para cargar de localStorage
  const loadFromLocalStorage = useCallback(() => {
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(`${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${cacheKey}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CONFIG.CACHE_DURATION;
          if (!isExpired) {
            return data;
          }
        }
      } catch (error) {
        console.error('Error cargando de localStorage:', error);
      }
    }
    return null;
  }, [cacheKey]);

  const fetchData = useCallback(async (attempt = 0) => {
    // Evitar llamadas duplicadas muy cercanas
    const now = Date.now();
    if (lastFetchRef.current && now - lastFetchRef.current < 100) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiMethod();
      
      if (!mountedRef.current) return;
      
      // Transformar datos si se especifica
      const transformedData = transform ? transform(result) : result;
      
      setData(transformedData);
      saveToLocalStorage(transformedData);
      
      // Callback de éxito
      if (onSuccess) {
        onSuccess(transformedData);
      }
      
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Error fetching data:', err);
      
      // Reintentar si es necesario
      if (attempt < retryAttempts && isOnline) {
        setTimeout(() => {
          fetchData(attempt + 1);
        }, retryDelay * Math.pow(2, attempt)); // Backoff exponencial
        return;
      }
      
      setError(err);
      
      // Intentar cargar datos del cache local si hay error
      const cachedData = loadFromLocalStorage();
      if (cachedData) {
        setData(cachedData);
        console.warn('Usando datos del cache local debido a error');
      }
      
      // Callback de error
      if (onError) {
        onError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiMethod, isOnline, transform, onSuccess, onError, retryAttempts, retryDelay, saveToLocalStorage, loadFromLocalStorage]);

  // Cargar datos iniciales o del cache
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    } else {
      // Intentar cargar del cache primero
      const cachedData = loadFromLocalStorage();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      }
    }
  }, [initialData, loadFromLocalStorage]);

  // Efecto principal para cargar datos
  useEffect(() => {
    mountedRef.current = true;
    
    if (isOnline) {
      fetchData();
    } else {
      // Si no hay conexión, usar datos del cache
      const cachedData = loadFromLocalStorage();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      }
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [...dependencies, isOnline]);

  // Polling automático
  usePolling(() => {
    if (enablePolling && isOnline && !loading) {
      fetchData();
    }
  }, pollingInterval);

  // Suscripción a WebSocket si está disponible
  useEffect(() => {
    if (!enableWebSocket || !wsEventName) return;

    const unsubscribe = wsService.subscribe(wsEventName, (eventData) => {
      if (!mountedRef.current) return;
      
      // Si el evento incluye datos completos, usarlos
      if (eventData.data) {
        const transformedData = transform ? transform(eventData.data) : eventData.data;
        setData(transformedData);
        saveToLocalStorage(transformedData);
      } else {
        // Si no, recargar los datos
        fetchData();
      }
    });

    return unsubscribe;
  }, [enableWebSocket, wsEventName, fetchData, transform, saveToLocalStorage]);

  // Función para refrescar manualmente
  const refetch = useCallback(() => {
    lastFetchRef.current = null; // Resetear el timestamp para permitir refetch inmediato
    return fetchData();
  }, [fetchData]);

  // Función para actualizar datos localmente (optimistic update)
  const updateData = useCallback((updater) => {
    setData(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      saveToLocalStorage(newData);
      return newData;
    });
  }, [saveToLocalStorage]);

  // Función para limpiar el cache
  const clearCache = useCallback(() => {
    if (cacheKey) {
      localStorage.removeItem(`${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${cacheKey}`);
    }
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refetch,
    updateData,
    clearCache,
    isOnline,
    isCached: !!loadFromLocalStorage()
  };
};

export default useApiData;