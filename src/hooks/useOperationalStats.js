import { useState, useEffect } from 'react';
import statisticsService from '../services/statistics.service';

/**
 * Hook para acceder a las estadísticas operativas
 * Proporciona datos en tiempo real y métodos de actualización
 */
export const useOperationalStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const initializeStats = async () => {
      try {
        setLoading(true);
        
        // Inicializar el servicio si no está inicializado
        await statisticsService.initialize();
        
        // Suscribirse a actualizaciones
        unsubscribe = statisticsService.subscribe((newStats) => {
          setStats(newStats);
          setLoading(false);
          setError(null);
        });
      } catch (err) {
        console.error('Error inicializando estadísticas:', err);
        setError(err);
        setLoading(false);
      }
    };

    initializeStats();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Métodos para actualizar estadísticas manualmente
  const incrementPrecintados = () => {
    statisticsService.incrementPrecintados();
  };

  const incrementDesprecintados = () => {
    statisticsService.incrementDesprecintados();
  };

  // Obtener estadísticas formateadas para un tipo específico
  const getMetric = (type) => {
    if (!stats) return null;
    
    switch (type) {
      case 'precintados':
        return {
          value: stats.precintados.hoy,
          comparison: stats.precintados.comparacionAyer,
          trend: stats.precintados.tendenciaAyer,
          percentage: stats.precintados.comparacionAyer?.percentage || 0
        };
      
      case 'desprecintados':
        return {
          value: stats.desprecintados.hoy,
          comparison: stats.desprecintados.comparacionAyer,
          trend: stats.desprecintados.tendenciaAyer,
          percentage: stats.desprecintados.comparacionAyer?.percentage || 0
        };
      
      case 'efficiency':
        return {
          value: stats.rendimiento.eficiencia,
          hourlyRate: stats.rendimiento.porHora,
          projection: stats.rendimiento.proyeccionDiaria
        };
      
      case 'avgTime':
        return {
          value: stats.tiempoPromedio.hoy,
          comparison: stats.tiempoPromedio.comparacionAyer,
          trend: stats.tiempoPromedio.tendencia
        };
      
      default:
        return null;
    }
  };

  // Verificar si estamos adelantados o atrasados
  const getPerformanceStatus = () => {
    if (!stats) return 'unknown';
    
    const efficiency = stats.rendimiento.eficiencia;
    
    if (efficiency >= 110) return 'excellent';
    if (efficiency >= 90) return 'good';
    if (efficiency >= 70) return 'warning';
    return 'poor';
  };

  return {
    stats,
    loading,
    error,
    incrementPrecintados,
    incrementDesprecintados,
    getMetric,
    getPerformanceStatus,
    isAheadOfSchedule: stats?.rendimiento?.eficiencia > 100,
    isBehindSchedule: stats?.rendimiento?.eficiencia < 90
  };
};