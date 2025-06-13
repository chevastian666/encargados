import CONFIG from '../constants/config';
import wsService from './websocket.service';

/**
 * Servicio de estadísticas operativas en tiempo real
 * Gestiona métricas, comparaciones y tendencias
 */
class StatisticsService {
  constructor() {
    this.currentStats = {
      precintados: {
        hoy: 0,
        ayer: 0,
        semanaAnterior: 0,
        horaInicio: null,
        ultimaActualizacion: null
      },
      desprecintados: {
        hoy: 0,
        ayer: 0,
        semanaAnterior: 0,
        horaInicio: null,
        ultimaActualizacion: null
      },
      tiempoPromedio: {
        hoy: 0,
        ayer: 0,
        semanaAnterior: 0
      },
      rendimiento: {
        porHora: 0,
        proyeccionDiaria: 0,
        eficiencia: 100
      }
    };
    
    this.historicalData = new Map();
    this.listeners = new Set();
    this.updateInterval = null;
  }

  /**
   * Inicializar el servicio de estadísticas
   */
  async initialize() {
    // Cargar datos históricos
    await this.loadHistoricalData();
    
    // Suscribirse a actualizaciones de tránsitos
    this.subscribeToTransitUpdates();
    
    // Iniciar actualización periódica de métricas
    this.startPeriodicUpdate();
    
    // Simular estadísticas iniciales en desarrollo
    if (CONFIG.IS_DEVELOPMENT) {
      this.simulateInitialStats();
    }
  }

  /**
   * Cargar datos históricos
   */
  async loadHistoricalData() {
    try {
      if (CONFIG.IS_DEVELOPMENT) {
        // Datos mock para desarrollo
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        this.currentStats.precintados.ayer = 42 + Math.floor(Math.random() * 10);
        this.currentStats.precintados.semanaAnterior = 38 + Math.floor(Math.random() * 10);
        this.currentStats.desprecintados.ayer = 35 + Math.floor(Math.random() * 10);
        this.currentStats.desprecintados.semanaAnterior = 32 + Math.floor(Math.random() * 10);
        
        // Generar datos por hora para el día actual
        const currentHour = new Date().getHours();
        if (currentHour >= 6) { // Asumiendo que empiezan a las 6 AM
          const hoursWorked = currentHour - 6;
          this.currentStats.precintados.hoy = Math.floor(hoursWorked * (4 + Math.random() * 2));
          this.currentStats.desprecintados.hoy = Math.floor(hoursWorked * (3 + Math.random() * 2));
        }
        
        // Calcular tiempos promedio
        this.currentStats.tiempoPromedio.hoy = 15 + Math.floor(Math.random() * 10);
        this.currentStats.tiempoPromedio.ayer = 18 + Math.floor(Math.random() * 10);
        this.currentStats.tiempoPromedio.semanaAnterior = 20 + Math.floor(Math.random() * 10);
        
      } else {
        // En producción, cargar desde la API
        const response = await fetch(`${CONFIG.API_BASE_URL}/statistics/operational`);
        const data = await response.json();
        this.currentStats = { ...this.currentStats, ...data };
      }
      
      this.calculatePerformanceMetrics();
      this.notifyListeners();
    } catch (error) {
      console.error('Error cargando datos históricos:', error);
    }
  }

  /**
   * Simular estadísticas iniciales para desarrollo
   */
  simulateInitialStats() {
    // Simular incrementos aleatorios cada 10-30 segundos
    setInterval(() => {
      if (Math.random() > 0.5) {
        this.incrementPrecintados();
      }
      if (Math.random() > 0.6) {
        this.incrementDesprecintados();
      }
    }, 15000 + Math.random() * 15000);
  }

  /**
   * Suscribirse a actualizaciones de tránsitos
   */
  subscribeToTransitUpdates() {
    wsService.subscribe('transit_update', (update) => {
      if (update.newState === 'completado' && update.oldState === 'precintando') {
        this.incrementPrecintados();
      }
    });
    
    wsService.subscribe('desprecintado_complete', (update) => {
      this.incrementDesprecintados();
    });
  }

  /**
   * Iniciar actualización periódica
   */
  startPeriodicUpdate() {
    // Actualizar métricas cada minuto
    this.updateInterval = setInterval(() => {
      this.calculatePerformanceMetrics();
      this.notifyListeners();
    }, 60000);
  }

  /**
   * Incrementar contador de precintados
   */
  incrementPrecintados() {
    this.currentStats.precintados.hoy++;
    this.currentStats.precintados.ultimaActualizacion = Date.now();
    
    if (!this.currentStats.precintados.horaInicio) {
      this.currentStats.precintados.horaInicio = Date.now();
    }
    
    this.calculatePerformanceMetrics();
    this.notifyListeners();
    
    // Emitir evento para otros componentes
    window.dispatchEvent(new CustomEvent('stats_update', {
      detail: { type: 'precintado', stats: this.currentStats }
    }));
  }

  /**
   * Incrementar contador de desprecintados
   */
  incrementDesprecintados() {
    this.currentStats.desprecintados.hoy++;
    this.currentStats.desprecintados.ultimaActualizacion = Date.now();
    
    if (!this.currentStats.desprecintados.horaInicio) {
      this.currentStats.desprecintados.horaInicio = Date.now();
    }
    
    this.calculatePerformanceMetrics();
    this.notifyListeners();
    
    // Emitir evento para otros componentes
    window.dispatchEvent(new CustomEvent('stats_update', {
      detail: { type: 'desprecintado', stats: this.currentStats }
    }));
  }

  /**
   * Calcular métricas de rendimiento
   */
  calculatePerformanceMetrics() {
    const now = Date.now();
    const workStartTime = new Date();
    workStartTime.setHours(6, 0, 0, 0); // 6 AM
    
    const hoursWorked = Math.max(0, (now - workStartTime.getTime()) / (1000 * 60 * 60));
    
    if (hoursWorked > 0) {
      // Calcular rendimiento por hora
      this.currentStats.rendimiento.porHora = Math.round(
        this.currentStats.precintados.hoy / hoursWorked * 10
      ) / 10;
      
      // Proyección para el día completo (asumiendo 12 horas de trabajo)
      const hoursRemaining = Math.max(0, 12 - hoursWorked);
      this.currentStats.rendimiento.proyeccionDiaria = Math.round(
        this.currentStats.precintados.hoy + (this.currentStats.rendimiento.porHora * hoursRemaining)
      );
      
      // Calcular eficiencia comparando con el promedio histórico
      if (this.currentStats.precintados.ayer > 0) {
        const expectedAtThisTime = (this.currentStats.precintados.ayer / 12) * hoursWorked;
        this.currentStats.rendimiento.eficiencia = Math.round(
          (this.currentStats.precintados.hoy / expectedAtThisTime) * 100
        );
      }
    }
  }

  /**
   * Obtener tendencia (arriba, abajo, igual)
   */
  getTrend(current, previous) {
    if (!previous || previous === 0) return 'equal';
    
    const difference = ((current - previous) / previous) * 100;
    
    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'equal';
  }

  /**
   * Obtener comparación con período anterior
   */
  getComparison(current, previous) {
    if (!previous || previous === 0) return { value: 0, percentage: 0 };
    
    const difference = current - previous;
    const percentage = Math.round(((current - previous) / previous) * 100);
    
    return {
      value: difference,
      percentage,
      text: difference >= 0 ? `+${difference}` : `${difference}`
    };
  }

  /**
   * Obtener estadísticas formateadas
   */
  getFormattedStats() {
    const stats = {
      precintados: {
        hoy: this.currentStats.precintados.hoy,
        ayer: this.currentStats.precintados.ayer,
        semanaAnterior: this.currentStats.precintados.semanaAnterior,
        comparacionAyer: this.getComparison(
          this.currentStats.precintados.hoy,
          this.currentStats.precintados.ayer
        ),
        comparacionSemana: this.getComparison(
          this.currentStats.precintados.hoy,
          this.currentStats.precintados.semanaAnterior
        ),
        tendenciaAyer: this.getTrend(
          this.currentStats.precintados.hoy,
          this.currentStats.precintados.ayer
        ),
        tendenciaSemana: this.getTrend(
          this.currentStats.precintados.hoy,
          this.currentStats.precintados.semanaAnterior
        )
      },
      desprecintados: {
        hoy: this.currentStats.desprecintados.hoy,
        ayer: this.currentStats.desprecintados.ayer,
        semanaAnterior: this.currentStats.desprecintados.semanaAnterior,
        comparacionAyer: this.getComparison(
          this.currentStats.desprecintados.hoy,
          this.currentStats.desprecintados.ayer
        ),
        comparacionSemana: this.getComparison(
          this.currentStats.desprecintados.hoy,
          this.currentStats.desprecintados.semanaAnterior
        ),
        tendenciaAyer: this.getTrend(
          this.currentStats.desprecintados.hoy,
          this.currentStats.desprecintados.ayer
        ),
        tendenciaSemana: this.getTrend(
          this.currentStats.desprecintados.hoy,
          this.currentStats.desprecintados.semanaAnterior
        )
      },
      tiempoPromedio: {
        hoy: this.currentStats.tiempoPromedio.hoy,
        comparacionAyer: this.getComparison(
          this.currentStats.tiempoPromedio.hoy,
          this.currentStats.tiempoPromedio.ayer
        ),
        tendencia: this.getTrend(
          this.currentStats.tiempoPromedio.ayer, // Invertido porque menos tiempo es mejor
          this.currentStats.tiempoPromedio.hoy
        )
      },
      rendimiento: this.currentStats.rendimiento,
      ultimaActualizacion: Math.max(
        this.currentStats.precintados.ultimaActualizacion || 0,
        this.currentStats.desprecintados.ultimaActualizacion || 0
      )
    };
    
    return stats;
  }

  /**
   * Suscribirse a actualizaciones de estadísticas
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Enviar estado actual inmediatamente
    callback(this.getFormattedStats());
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  notifyListeners() {
    const stats = this.getFormattedStats();
    this.listeners.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        console.error('Error notificando listener:', error);
      }
    });
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.listeners.clear();
  }
}

// Instancia única del servicio
const statisticsService = new StatisticsService();

// Inicializar automáticamente
if (CONFIG.IS_DEVELOPMENT) {
  setTimeout(() => {
    statisticsService.initialize();
  }, 1000);
}

export default statisticsService;