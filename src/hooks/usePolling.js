import { useEffect, useRef, useState, useCallback } from 'react';
import { useConnection } from '../contexts/ConnectionContext';

/**
 * Hook personalizado para ejecutar una función a intervalos regulares (polling)
 * @param {Function} callback - Función a ejecutar en cada intervalo
 * @param {number} interval - Intervalo en milisegundos
 * @param {boolean} enabled - Si el polling está habilitado
 * @returns {void}
 */
export const usePolling = (callback, interval, enabled = true) => {
  const savedCallback = useRef();
  const intervalIdRef = useRef();
  const { isOnline } = useConnection();

  // Guardar la última versión del callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar el intervalo
  useEffect(() => {
    // No hacer polling si no está habilitado o no hay conexión
    if (!enabled || !isOnline) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    // Función que ejecuta el callback
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    // Configurar el intervalo
    intervalIdRef.current = setInterval(tick, interval);

    // Limpiar al desmontar o cuando cambien las dependencias
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [interval, enabled, isOnline]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);
};

/**
 * Hook para ejecutar polling con control manual
 * @param {Function} callback - Función a ejecutar
 * @param {number} interval - Intervalo en milisegundos
 * @returns {Object} - { start, stop, isRunning }
 */
export const useControlledPolling = (callback, interval) => {
  const [isRunning, setIsRunning] = useState(false);
  const intervalIdRef = useRef();
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (isRunning) return;

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    // Ejecutar inmediatamente
    tick();

    // Configurar intervalo
    intervalIdRef.current = setInterval(tick, interval);
    setIsRunning(true);
  }, [interval, isRunning]);

  const stop = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return { start, stop, isRunning };
};

/**
 * Hook para ejecutar polling con backoff exponencial en caso de error
 * @param {Function} callback - Función async a ejecutar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - { start, stop, isRunning, error, retryCount }
 */
export const useSmartPolling = (callback, options = {}) => {
  const {
    interval = 30000,
    maxInterval = 300000, // 5 minutos máximo
    backoffMultiplier = 2,
    maxRetries = Infinity,
    onError = null,
    onSuccess = null,
    enabled = true
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const currentIntervalRef = useRef(interval);
  const timeoutIdRef = useRef();
  const savedCallback = useRef();
  const { isOnline } = useConnection();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const executeCallback = useCallback(async () => {
    if (!savedCallback.current) return;

    try {
      await savedCallback.current();
      
      // Resetear en caso de éxito
      setError(null);
      setRetryCount(0);
      currentIntervalRef.current = interval;
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error en polling:', err);
      setError(err);
      setRetryCount(prev => prev + 1);
      
      // Aplicar backoff exponencial
      currentIntervalRef.current = Math.min(
        currentIntervalRef.current * backoffMultiplier,
        maxInterval
      );
      
      if (onError) {
        onError(err, retryCount + 1);
      }
      
      // Detener si se alcanzó el máximo de reintentos
      if (retryCount + 1 >= maxRetries) {
        stop();
      }
    }
  }, [interval, maxInterval, backoffMultiplier, maxRetries, onError, onSuccess, retryCount]);

  const scheduleNext = useCallback(() => {
    if (!isRunning || !enabled || !isOnline) return;

    timeoutIdRef.current = setTimeout(() => {
      executeCallback().then(() => {
        if (isRunning) {
          scheduleNext();
        }
      });
    }, currentIntervalRef.current);
  }, [isRunning, enabled, isOnline, executeCallback]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setRetryCount(0);
    currentIntervalRef.current = interval;

    // Ejecutar inmediatamente
    executeCallback().then(() => {
      scheduleNext();
    });
  }, [interval, isRunning, executeCallback, scheduleNext]);

  const stop = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setError(null);
    setRetryCount(0);
    currentIntervalRef.current = interval;
  }, [interval, stop]);

  // Auto-start/stop basado en enabled y isOnline
  useEffect(() => {
    if (enabled && isOnline && !isRunning) {
      start();
    } else if ((!enabled || !isOnline) && isRunning) {
      stop();
    }
  }, [enabled, isOnline, isRunning, start, stop]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return {
    start,
    stop,
    reset,
    isRunning,
    error,
    retryCount,
    currentInterval: currentIntervalRef.current
  };
};

export default usePolling;