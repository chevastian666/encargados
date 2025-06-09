// ==================== SERVICIO API ====================
class ApiService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  // Método genérico para llamadas API con cache
  async fetchWithCache(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);

    // Verificar si tenemos datos en cache y si no han expirado
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Simular llamada API mientras no tengamos el backend real
      const response = await this.mockApiCall(endpoint, options);

      // En producción sería:
      // const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      //   ...options,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...options.headers,
      //   },
      // });
      // const data = await response.json();

      // Guardar en cache
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return response;
    } catch (error) {
      console.error('Error en API:', error);
      // Si hay error, intentar devolver datos del cache aunque estén expirados
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  // Simulación de API mientras no tengamos backend
  async mockApiCall(endpoint, options = {}) {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data según el endpoint
    const mockData = {
      '/transitos/pendientes': {
        data: [
          { id: 1, matricula: 'ABC 1234', secundaria: 'DEF 5678', deposito: 'Zona Franca', tipo: 'contenedor', codigo: 'MSKU 123456-7', salida: '08:30', estado: 'esperando', chofer: 'Juan Rodríguez', telefono: '+598 99 123 456' },
          { id: 2, matricula: 'GHI 9012', secundaria: 'JKL 3456', deposito: 'Terminal TCP', tipo: 'lona', salida: '09:15', estado: 'pasando_soga', chofer: 'María González', telefono: '+598 99 789 012' },
          { id: 3, matricula: 'MNO 7890', secundaria: 'PQR 1234', deposito: 'Terminal Cuenca', tipo: 'contenedor', codigo: 'CSQU 987654-3', salida: '09:45', estado: 'precintando', chofer: 'Carlos Pérez', telefono: '+598 99 345 678' },
          { id: 4, matricula: 'STU 5678', secundaria: 'VWX 9012', deposito: 'Puerto MVD', tipo: 'lona', salida: '10:00', estado: 'esperando', chofer: 'Ana Silva', telefono: '+598 99 901 234' }
        ],
        total: 4,
        lastUpdate: new Date().toISOString()
      },
      '/transitos/desprecintar': {
        data: [
          { id: 1, matricula: 'BRA 4567', origen: 'São Paulo', destino: 'Montevideo', llegada: '14:30', estado: 'En puerto', precinto: 'AD-123456' },
          { id: 2, matricula: 'ARG 8901', origen: 'Buenos Aires', destino: 'Terminal TCP', llegada: '15:45', estado: 'En aduana', precinto: 'AD-789012' },
          { id: 3, matricula: 'PAR 2345', origen: 'Asunción', destino: 'Zona Franca', llegada: '16:00', estado: 'Esperando', precinto: 'AD-345678' },
        ],
        total: 3,
        lastUpdate: new Date().toISOString()
      },
      '/stock': {
        data: [
          { id: 1, nombre: 'Puerto de Montevideo', precintos: 250, precintosMax: 500, precintosMin: 100, eslingas: 15, eslingasMax: 50, eslingasMin: 10 },
          { id: 2, nombre: 'Terminal TCP', precintos: 89, precintosMax: 300, precintosMin: 50, eslingas: 22, eslingasMax: 40, eslingasMin: 8 },
          { id: 3, nombre: 'Zona Franca', precintos: 45, precintosMax: 200, precintosMin: 40, eslingas: 5, eslingasMax: 30, eslingasMin: 6 },
          { id: 4, nombre: 'Terminal Cuenca', precintos: 178, precintosMax: 250, precintosMin: 50, eslingas: 35, eslingasMax: 45, eslingasMin: 9 }
        ],
        lastUpdate: new Date().toISOString()
      },
      '/alertas': {
        data: [
          { id: 1, tipo: 'Stock Crítico', mensaje: 'Zona Franca: Solo quedan 45 precintos', prioridad: 'alta', tiempo: '15 min', resuelto: false },
          { id: 2, tipo: 'Tránsito Demorado', mensaje: 'Camión GHI 9012 demorado +2h', prioridad: 'media', tiempo: '30 min', resuelto: false },
          { id: 3, tipo: 'Inspección MGAP', mensaje: 'Contenedor MSKU 123456-7 requiere inspección', prioridad: 'alta', tiempo: '1 hora', resuelto: false }
        ],
        total: 3,
        lastUpdate: new Date().toISOString()
      },
      '/camiones/ruta': {
        data: [
          { id: 1, matricula: 'ABC 1234', destino: 'Terminal TCP', eta: '14:30', minutos: 45, estado: 'en_ruta', lat: -34.8, lng: -56.1 },
          { id: 2, matricula: 'GHI 9012', destino: 'Zona Franca', eta: '15:45', minutos: 120, estado: 'en_ruta', lat: -34.85, lng: -56.05 },
          { id: 3, matricula: 'MNO 7890', destino: 'Terminal Cuenca', eta: '16:00', minutos: 135, estado: 'detenido', lat: -34.82, lng: -56.15 },
        ],
        total: 3,
        lastUpdate: new Date().toISOString()
      },
    };

    return mockData[endpoint];
  }

  async getTransitosPendientes() {
    return this.fetchWithCache('/transitos/pendientes');
  }

  async getTransitosDesprecintar() {
    return this.fetchWithCache('/transitos/desprecintar');
  }

  async getStock() {
    return this.fetchWithCache('/stock');
  }

  async getAlertas() {
    return this.fetchWithCache('/alertas');
  }

  async getCamionesEnRuta() {
    return this.fetchWithCache('/camiones/ruta');
  }

  async getNotifications() {
    return this.fetchWithCache('/notifications');
  }

  async updateTransitoEstado(transitoId, nuevoEstado) {
    // En producción sería una llamada POST/PUT
    return this.mockApiCall(`/transitos/${transitoId}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
  }

  async updateStockMinimo(puntoId, tipo, nuevoValor) {
    return this.mockApiCall(`/stock/${puntoId}/minimo`, {
      method: 'PUT',
      body: JSON.stringify({ tipo, valor: nuevoValor })
    });
  }

  async resolverAlerta(alertaId, userId) {
    return this.mockApiCall(`/alertas/${alertaId}/resolver`, {
      method: 'PUT',
      body: JSON.stringify({ resueltoBy: userId })
    });
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }
}

// Instancia única del servicio
const apiService = new ApiService();
export default apiService;
