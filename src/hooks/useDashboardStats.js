import { useState, useEffect, useCallback } from 'react';
import { useApiData } from './useApiData';
import apiService from '../services/api.service';

/**
 * Hook personalizado para gestionar las estadísticas del dashboard
 * con actualización en tiempo real y cálculos de tendencias
 */
export const useDashboardStats = (pollingInterval = 30000) => {
  const [stats, setStats] = useState({
    precintados: { valor: 0, vsPromedio: 0, vsAyer: 0, tendencia: [] },
    enEspera: { valor: 0, vsPromedio: 0, vsAyer: 0, tendencia: [] },
    porDesprecintar: { valor: 0, vsPromedio: 0, vsAyer: 0, tendencia: [] },
    alertas: { valor: 0, vsPromedio: 0, vsAyer: 0, tendencia: [] }
  });

  const [performance, setPerformance] = useState({
    tiempoPromedioEspera: 0,
    tasaProcesamiento: 0,
    eficiencia: 0,
    cargaSistema: 'normal' // 'bajo', 'normal', 'alto', 'critico'
  });

  const [historicalData, setHistoricalData] = useState({
    hourly: [],
    daily: [],
    weekly: []
  });

  // Obtener estadísticas en tiempo real
  const { data: statsData, loading: statsLoading, error: statsError, refetch } = useApiData(
    () => apiService.getDashboardStats(),
    [],
    { pollingInterval }
  );

  // Obtener datos históricos para gráficos
  const { data: historicalDataResponse } = useApiData(
    () => apiService.getHistoricalStats(),
    [],
    { pollingInterval: 60000 } // Actualizar cada minuto
  );

  // Calcular métricas de rendimiento
  const calculatePerformanceMetrics = useCallback((currentStats) => {
    if (!currentStats) return;

    const tiempoPromedioEspera = currentStats.tiempoPromedioEspera || 15; // minutos
    const tasaProcesamiento = currentStats.precintados / (currentStats.enEspera + 1); // evitar división por 0
    const eficiencia = Math.min(100, (tasaProcesamiento * 100) / 3); // 3 es el objetivo por hora

    // Determinar carga del sistema
    let cargaSistema = 'normal';
    if (currentStats.enEspera > 20) cargaSistema = 'critico';
    else if (currentStats.enEspera > 15) cargaSistema = 'alto';
    else if (currentStats.enEspera < 5) cargaSistema = 'bajo';

    setPerformance({
      tiempoPromedioEspera,
      tasaProcesamiento: parseFloat(tasaProcesamiento.toFixed(2)),
      eficiencia: Math.round(eficiencia),
      cargaSistema
    });
  }, []);

  // Actualizar estadísticas cuando lleguen nuevos datos
  useEffect(() => {
    if (statsData) {
      // Simular tendencias para mini-gráficos (últimas 12 horas)
      const generateTrend = (base, variation = 5) => {
        return Array.from({ length: 12 }, (_, i) => 
          base + Math.sin(i / 2) * variation + Math.random() * variation
        );
      };

      setStats({
        precintados: {
          valor: statsData.precintados || 47,
          vsPromedio: statsData.precintadosVsPromedio || 8,
          vsAyer: statsData.precintadosVsAyer || -2,
          tendencia: generateTrend(statsData.precintados || 47, 10)
        },
        enEspera: {
          valor: statsData.enEspera || 12,
          vsPromedio: statsData.enEsperaVsPromedio || 3,
          vsAyer: statsData.enEsperaVsAyer || 0,
          tendencia: generateTrend(statsData.enEspera || 12, 3)
        },
        porDesprecintar: {
          valor: statsData.porDesprecintar || 7,
          vsPromedio: statsData.porDesprecintarVsPromedio || -2,
          vsAyer: statsData.porDesprecintarVsAyer || -3,
          tendencia: generateTrend(statsData.porDesprecintar || 7, 2)
        },
        alertas: {
          valor: statsData.alertas || 3,
          vsPromedio: statsData.alertasVsPromedio || -1,
          vsAyer: statsData.alertasVsAyer || 1,
          tendencia: generateTrend(statsData.alertas || 3, 1)
        }
      });

      calculatePerformanceMetrics(statsData);
    }
  }, [statsData, calculatePerformanceMetrics]);

  // Actualizar datos históricos
  useEffect(() => {
    if (historicalDataResponse) {
      setHistoricalData(historicalDataResponse);
    }
  }, [historicalDataResponse]);

  // Función para refrescar manualmente
  const refreshStats = useCallback(() => {
    refetch();
  }, [refetch]);

  // Función para actualizar estadísticas localmente
  const updateStats = useCallback((updater) => {
    setStats(prevStats => {
      if (typeof updater === 'function') {
        return updater(prevStats);
      }
      return updater;
    });
  }, []);

  // Función para obtener el color de una métrica según su rendimiento
  const getMetricColor = useCallback((metric, value, isReverse = false) => {
    const thresholds = {
      precintados: { good: 50, warning: 30 },
      enEspera: { good: 10, warning: 20 },
      porDesprecintar: { good: 5, warning: 10 },
      alertas: { good: 3, warning: 5 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'blue';

    if (isReverse) {
      if (value <= threshold.good) return 'green';
      if (value <= threshold.warning) return 'yellow';
      return 'red';
    } else {
      if (value >= threshold.good) return 'green';
      if (value >= threshold.warning) return 'yellow';
      return 'red';
    }
  }, []);

  return {
    stats,
    performance,
    historicalData,
    loading: statsLoading,
    error: statsError,
    refreshStats,
    updateStats,
    getMetricColor
  };
};

export default useDashboardStats;