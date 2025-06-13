import CONFIG from '../constants/config';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants/constants';

class ApiService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.pendingRequests = new Map();
    this.mockData = null; // Para almacenar datos mock persistentes
  }

  /**
 * Agregar observación a un tránsito
 * @param {string} transitoId - ID del tránsito
 * @param {string} observacion - Texto de la observación
 * @returns {Promise<Object>} Respuesta del servidor
 */
async addTransitoObservacion(transitoId, observacion) {
  try {
    // En modo desarrollo, simular la respuesta y actualizar mock data
    if (CONFIG.IS_DEVELOPMENT) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Actualizar el mock data con la nueva observación
          if (this.mockData && this.mockData[API_ENDPOINTS.TRANSITOS_PENDIENTES]) {
            const transitos = this.mockData[API_ENDPOINTS.TRANSITOS_PENDIENTES].data || [];
            const transito = transitos.find(t => t.id === transitoId);
            if (transito) {
              if (!transito.observaciones) {
                transito.observaciones = [];
              }
              transito.observaciones.push({
                id: Date.now(),
                texto: observacion,
                usuario: 'Usuario Actual',
                fecha: new Date().toISOString()
              });
            }
          }
          
          resolve({
            success: true,
            data: {
              id: Date.now(),
              transitoId,
              observacion,
              timestamp: new Date().toISOString(),
              usuario: 'Usuario Actual'
            }
          });
        }, 500);
      });
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/transitos/${transitoId}/observacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ 
        observacion,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en addTransitoObservacion:', error);
    throw error;
  }
}

/**
 * Notifica un problema sin imágenes
 * @param {string} transitoId - ID del tránsito
 * @param {string} problema - Descripción del problema
 * @returns {Promise<Object>} Respuesta del servidor
 */
async notificarProblema(transitoId, problema) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/transitos/${transitoId}/problema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ 
        problema,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en notificarProblema:', error);
    throw error;
  }
}

/**
 * Notifica un problema con imágenes adjuntas
 * @param {FormData} formData - FormData con la información del problema e imágenes
 * @returns {Promise<Object>} Respuesta del servidor
 */
async notificarProblemaConImagenes(formData) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/transitos/problema-con-imagenes`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders() // No pongas 'Content-Type', lo maneja el navegador
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en notificarProblemaConImagenes:', error);
    throw error;
  }
}

/**
 * Verifica si el servidor acepta imágenes
 * @returns {Promise<boolean>}
 */
async checkImageSupport() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/transitos/problema-con-imagenes`, {
      method: 'OPTIONS',
      headers: {
        ...this.getAuthHeaders()
      }
    });

    return response.ok;
  } catch (error) {
    console.warn('El servidor no soporta envío de imágenes:', error);
    return false;
  }
}


  // Método genérico para llamadas API con cache
  async fetchWithCache(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    // Verificar si tenemos datos en cache y si no han expirado
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
      return cached.data;
    }

    // Evitar llamadas duplicadas
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    try {
      const requestPromise = this.makeRequest(endpoint, options);
      this.pendingRequests.set(cacheKey, requestPromise);
      
      const response = await requestPromise;
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
      
      this.pendingRequests.delete(cacheKey);
      return response;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      console.error('Error en API:', error);
      
      // Si hay error, intentar devolver datos del cache aunque estén expirados
      if (cached) {
        console.warn('Usando datos del cache expirado debido a error');
        return cached.data;
      }
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    // En desarrollo, usar mock data
    if (CONFIG.IS_DEVELOPMENT || !CONFIG.API_BASE_URL.startsWith('http')) {
      return this.mockApiCall(endpoint, options);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      throw error;
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Simulación de API mientras no tengamos backend
  async mockApiCall(endpoint, options = {}) {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data según el endpoint
    const mockData = {
      [API_ENDPOINTS.TRANSITOS_PENDIENTES]: {
        data: [
          { 
            id: 1, 
            matricula: 'ABC 1234', 
            secundaria: 'DEF 5678', 
            deposito: 'Zona Franca', 
            tipo: 'contenedor', 
            codigo: 'MSKU 123456-7', 
            salida: '08:30', 
            estado: 'esperando', 
            chofer: 'Juan Rodríguez', 
            telefono: '+598 99 123 456',
            empresa: 'Transportes del Sur',
            observaciones: [
              {
                id: 1,
                texto: 'Carga frágil, manejar con cuidado',
                usuario: 'Juan Pérez',
                fecha: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: 2,
                texto: 'Verificar documentación MGAP antes de salir',
                usuario: 'María Silva',
                fecha: new Date(Date.now() - 1800000).toISOString()
              }
            ]
          },
          { 
            id: 2, 
            matricula: 'GHI 9012', 
            secundaria: 'JKL 3456', 
            deposito: 'Terminal TCP', 
            tipo: 'lona', 
            salida: '09:15', 
            estado: 'pasando_soga', 
            chofer: 'María González', 
            telefono: '+598 99 789 012',
            empresa: 'Logística Oriental',
            observaciones: []
          },
          { 
            id: 3, 
            matricula: 'MNO 7890', 
            secundaria: 'PQR 1234', 
            deposito: 'Terminal Cuenca', 
            tipo: 'contenedor', 
            codigo: 'CSQU 987654-3', 
            salida: '09:45', 
            estado: 'precintando', 
            chofer: 'Carlos Pérez', 
            telefono: '+598 99 345 678',
            empresa: 'Transporte Internacional',
            observaciones: [
              {
                id: 1,
                texto: 'Requiere inspección MGAP',
                usuario: 'Carlos Martínez',
                fecha: new Date(Date.now() - 7200000).toISOString()
              }
            ]
          },
          { 
            id: 4, 
            matricula: 'STU 5678', 
            secundaria: 'VWX 9012', 
            deposito: 'Puerto MVD', 
            tipo: 'lona', 
            salida: '10:00', 
            estado: 'esperando', 
            chofer: 'Ana Silva', 
            telefono: '+598 99 901 234',
            empresa: 'Cargas Express',
            observaciones: []
          },
          { 
            id: 5, 
            matricula: 'YZA 2345', 
            secundaria: 'BCD 6789', 
            deposito: 'Zona Franca', 
            tipo: 'refrigerado', 
            codigo: 'RFSU 543210-8', 
            salida: '10:30', 
            estado: 'esperando', 
            chofer: 'Roberto Díaz', 
            telefono: '+598 99 567 890',
            empresa: 'Frío del Sur',
            observaciones: [
              {
                id: 1,
                texto: 'Mantener cadena de frío en todo momento',
                usuario: 'Ana Rodríguez',
                fecha: new Date(Date.now() - 5400000).toISOString()
              },
              {
                id: 2,
                texto: 'Temperatura debe estar entre -18°C y -20°C',
                usuario: 'Pedro Gómez',
                fecha: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: 3,
                texto: 'Verificar funcionamiento del termo antes de salir',
                usuario: 'Laura Fernández',
                fecha: new Date(Date.now() - 1800000).toISOString()
              }
            ]
          }
        ],
        total: 5,
        lastUpdate: new Date().toISOString()
      },
      [API_ENDPOINTS.TRANSITOS_DESPRECINTAR]: {
        data: [
          { 
            id: 1, 
            matricula: 'BRA 4567', 
            origen: 'São Paulo', 
            destino: 'Montevideo', 
            llegada: '14:30', 
            estado: 'En puerto', 
            precinto: 'AD-123456',
            empresa: 'Transportes Brasil',
            chofer: 'João Silva',
            carga: 'Productos electrónicos'
          },
          { 
            id: 2, 
            matricula: 'ARG 8901', 
            origen: 'Buenos Aires', 
            destino: 'Terminal TCP', 
            llegada: '15:45', 
            estado: 'En aduana', 
            precinto: 'AD-789012',
            empresa: 'Logística Argentina',
            chofer: 'Pedro Martínez',
            carga: 'Autopartes'
          },
          { 
            id: 3, 
            matricula: 'PAR 2345', 
            origen: 'Asunción', 
            destino: 'Zona Franca', 
            llegada: '16:00', 
            estado: 'Esperando', 
            precinto: 'AD-345678',
            empresa: 'Transporte Guaraní',
            chofer: 'Miguel Benítez',
            carga: 'Textiles'
          },
          { 
            id: 4, 
            matricula: 'CHI 6789', 
            origen: 'Santiago', 
            destino: 'Puerto MVD', 
            llegada: '17:30', 
            estado: 'En ruta', 
            precinto: 'AD-901234',
            empresa: 'Cargas Andinas',
            chofer: 'Francisco Valdés',
            carga: 'Vinos y productos gourmet'
          }
        ],
        total: 4,
        lastUpdate: new Date().toISOString()
      },
      [API_ENDPOINTS.STOCK]: {
        data: [
          { 
            id: 1, 
            nombre: 'Puerto de Montevideo', 
            precintos: 250, 
            precintosMax: 500, 
            precintosMin: 100, 
            eslingas: 15, 
            eslingasMax: 50, 
            eslingasMin: 10,
            ultimaReposicion: '2024-01-15',
            proximaReposicion: '2024-02-01'
          },
          { 
            id: 2, 
            nombre: 'Terminal TCP', 
            precintos: 89, 
            precintosMax: 300, 
            precintosMin: 50, 
            eslingas: 22, 
            eslingasMax: 40, 
            eslingasMin: 8,
            ultimaReposicion: '2024-01-10',
            proximaReposicion: '2024-01-25'
          },
          { 
            id: 3, 
            nombre: 'Zona Franca', 
            precintos: 45, 
            precintosMax: 200, 
            precintosMin: 40, 
            eslingas: 5, 
            eslingasMax: 30, 
            eslingasMin: 6,
            ultimaReposicion: '2024-01-12',
            proximaReposicion: '2024-01-20'
          },
          { 
            id: 4, 
            nombre: 'Terminal Cuenca', 
            precintos: 178, 
            precintosMax: 250, 
            precintosMin: 50, 
            eslingas: 35, 
            eslingasMax: 45, 
            eslingasMin: 9,
            ultimaReposicion: '2024-01-18',
            proximaReposicion: '2024-02-05'
          }
        ],
        lastUpdate: new Date().toISOString()
      },
      [API_ENDPOINTS.ALERTAS]: {
        data: [
          { 
            id: 1, 
            tipo: 'Stock Crítico', 
            mensaje: 'Zona Franca: Solo quedan 45 precintos', 
            prioridad: 'alta', 
            tiempo: '15 min', 
            resuelto: false,
            detalles: 'Stock por debajo del mínimo establecido',
            accionRequerida: 'Solicitar reposición urgente'
          },
          { 
            id: 2, 
            tipo: 'Tránsito Demorado', 
            mensaje: 'Camión GHI 9012 demorado +2h', 
            prioridad: 'media', 
            tiempo: '30 min', 
            resuelto: false,
            detalles: 'Problemas mecánicos reportados',
            accionRequerida: 'Contactar al chofer'
          },
          { 
            id: 3, 
            tipo: 'Inspección MGAP', 
            mensaje: 'Contenedor MSKU 123456-7 requiere inspección', 
            prioridad: 'alta', 
            tiempo: '1 hora', 
            resuelto: false,
            detalles: 'Carga de productos agropecuarios',
            accionRequerida: 'Coordinar con inspector MGAP'
          },
          { 
            id: 4, 
            tipo: 'Sistema', 
            mensaje: 'Mantenimiento programado mañana 22:00', 
            prioridad: 'baja', 
            tiempo: '2 horas', 
            resuelto: false,
            detalles: 'Actualización de sistema',
            accionRequerida: 'Informar a los usuarios'
          }
        ],
        total: 4,
        activas: 4,
        resueltas: 0,
        lastUpdate: new Date().toISOString()
      },
      [API_ENDPOINTS.CAMIONES_RUTA]: {
        data: [
          { 
            id: 1, 
            matricula: 'ABC 1234', 
            destino: 'Terminal TCP', 
            eta: '14:30', 
            minutos: 45, 
            estado: 'en_ruta', 
            lat: -34.8, 
            lng: -56.1,
            velocidad: 80,
            distancia: 60
          },
          { 
            id: 2, 
            matricula: 'GHI 9012', 
            destino: 'Zona Franca', 
            eta: '15:45', 
            minutos: 120, 
            estado: 'en_ruta', 
            lat: -34.85, 
            lng: -56.05,
            velocidad: 65,
            distancia: 130
          },
          { 
            id: 3, 
            matricula: 'MNO 7890', 
            destino: 'Terminal Cuenca', 
            eta: '16:00', 
            minutos: 135, 
            estado: 'detenido', 
            lat: -34.82, 
            lng: -56.15,
            velocidad: 0,
            distancia: 145,
            motivoDetencion: 'Control policial'
          },
          { 
            id: 4, 
            matricula: 'BRA 4567', 
            destino: 'Puerto MVD', 
            eta: '14:15', 
            minutos: 30, 
            estado: 'en_ruta', 
            lat: -34.88, 
            lng: -56.12,
            velocidad: 70,
            distancia: 35
          }
        ],
        lastUpdate: new Date().toISOString()
      },
      [API_ENDPOINTS.NOTIFICATIONS]: {
        transitos: Math.floor(Math.random() * 5),
        alertas: Math.floor(Math.random() * 3),
        desprecintar: Math.floor(Math.random() * 4),
        lastUpdate: new Date().toISOString()
      }
    };
    
    // Simular errores ocasionales en desarrollo
    if (CONFIG.IS_DEVELOPMENT && Math.random() < 0.05) {
      throw new Error('Error simulado para testing');
    }
    
    // Si tenemos datos persistentes, usarlos
    if (this.mockData && this.mockData[endpoint]) {
      return {
        success: true,
        ...this.mockData[endpoint]
      };
    }
    
    // Si no, inicializar con los datos por defecto
    this.mockData = mockData;
    
    return {
      success: true,
      ...(mockData[endpoint] || { data: [], error: 'Endpoint no encontrado' })
    };
  }

  // Métodos específicos para cada entidad
  async getTransitosPendientes(filters = {}) {
    return this.fetchWithCache(API_ENDPOINTS.TRANSITOS_PENDIENTES, {
      params: filters
    });
  }

  async getTransitosDesprecintar(filters = {}) {
    return this.fetchWithCache(API_ENDPOINTS.TRANSITOS_DESPRECINTAR, {
      params: filters
    });
  }

  async getStock() {
    return this.fetchWithCache(API_ENDPOINTS.STOCK);
  }

  async getAlertas(filters = {}) {
    return this.fetchWithCache(API_ENDPOINTS.ALERTAS, {
      params: filters
    });
  }

  async getCamionesEnRuta() {
    return this.fetchWithCache(API_ENDPOINTS.CAMIONES_RUTA);
  }

  async getNotifications() {
    return this.fetchWithCache(API_ENDPOINTS.NOTIFICATIONS);
  }

  async updateTransitoEstado(transitoId, nuevoEstado) {
    return this.makeRequest(`/transitos/${transitoId}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
  }

  async updateStockMinimo(puntoId, tipo, nuevoValor) {
    return this.makeRequest(`/stock/${puntoId}/minimo`, {
      method: 'PUT',
      body: JSON.stringify({ tipo, valor: nuevoValor })
    });
  }

  async resolverAlerta(alertaId, userId) {
    return this.makeRequest(`/alertas/${alertaId}/resolver`, {
      method: 'PUT',
      body: JSON.stringify({ resueltoBy: userId, resueltoAt: new Date().toISOString() })
    });
  }

  async buscarCamion(tipo, valor) {
    return this.makeRequest(`/camiones/buscar`, {
      method: 'POST',
      body: JSON.stringify({ tipo, valor })
    });
  }

  async getDashboardStats() {
    // En producción, esto vendría del servidor
    // Por ahora simular datos dinámicos
    const baseStats = {
      precintados: 40 + Math.floor(Math.random() * 20),
      enEspera: 8 + Math.floor(Math.random() * 10),
      porDesprecintar: 3 + Math.floor(Math.random() * 8),
      alertas: Math.floor(Math.random() * 6)
    };

    return {
      ...baseStats,
      precintadosVsPromedio: Math.floor((Math.random() - 0.5) * 10),
      precintadosVsAyer: Math.floor((Math.random() - 0.5) * 5),
      enEsperaVsPromedio: Math.floor((Math.random() - 0.5) * 5),
      enEsperaVsAyer: Math.floor((Math.random() - 0.5) * 3),
      porDesprecintarVsPromedio: Math.floor((Math.random() - 0.5) * 4),
      porDesprecintarVsAyer: Math.floor((Math.random() - 0.5) * 2),
      alertasVsPromedio: Math.floor((Math.random() - 0.5) * 3),
      alertasVsAyer: Math.floor((Math.random() - 0.5) * 2),
      tiempoPromedioEspera: 10 + Math.floor(Math.random() * 20),
      timestamp: new Date().toISOString()
    };
  }

  async getHistoricalStats() {
    // Generar datos históricos simulados
    const generateHourlyData = () => {
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        precintados: 30 + Math.floor(Math.random() * 20),
        enEspera: 5 + Math.floor(Math.random() * 15),
        alertas: Math.floor(Math.random() * 5)
      }));
    };

    const generateDailyData = () => {
      return Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        precintados: 350 + Math.floor(Math.random() * 100),
        enEspera: 100 + Math.floor(Math.random() * 50),
        alertas: 10 + Math.floor(Math.random() * 20)
      }));
    };

    return {
      hourly: generateHourlyData(),
      daily: generateDailyData(),
      weekly: [], // Implementar si es necesario
      timestamp: new Date().toISOString()
    };
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }

  // Limpiar cache específico
  clearCacheForEndpoint(endpoint) {
    for (const [key] of this.cache) {
      if (key.startsWith(endpoint)) {
        this.cache.delete(key);
      }
    }
  }

  // Obtener estadísticas del cache
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp > CONFIG.CACHE_DURATION
      }))
    };
  }
}

// Instancia única del servicio
const apiService = new ApiService();

// Exportar la instancia y la clase
export { ApiService };
export default apiService;