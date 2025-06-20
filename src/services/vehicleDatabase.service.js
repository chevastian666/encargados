import CONFIG from '../constants/config';

/**
 * Servicio de base de datos de vehículos y choferes
 * Gestiona información histórica, fotos, contactos y observaciones
 */
class VehicleDatabaseService {
  constructor() {
    this.vehicles = new Map();
    this.drivers = new Map();
    this.companies = new Map();
    this.observations = [];
    this.initialized = false;
  }

  /**
   * Inicializar la base de datos con datos mock o del servidor
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      if (CONFIG.IS_DEVELOPMENT) {
        await this.loadMockData();
      } else {
        await this.loadFromServer();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error inicializando base de datos de vehículos:', error);
    }
  }

  /**
   * Cargar datos mock para desarrollo
   */
  async loadMockData() {
    // Empresas de transporte
    const mockCompanies = [
      {
        id: 'emp_1',
        name: 'Transportes del Sur',
        country: 'UY',
        phone: '+598 2901 2345',
        email: 'contacto@transportesdelsur.com.uy'
      },
      {
        id: 'emp_2',
        name: 'Logística Oriental',
        country: 'UY',
        phone: '+598 2902 3456',
        email: 'info@logisticaoriental.com.uy'
      },
      {
        id: 'emp_3',
        name: 'Transporte Internacional',
        country: 'BR',
        phone: '+55 11 4567 8901',
        email: 'contato@transporteinternacional.com.br'
      },
      {
        id: 'emp_4',
        name: 'Cargas Express',
        country: 'AR',
        phone: '+54 11 5678 9012',
        email: 'info@cargasexpress.com.ar'
      }
    ];

    // Choferes
    const mockDrivers = [
      {
        id: 'drv_1',
        name: 'Juan Rodríguez',
        dni: '1.234.567-8',
        company: 'emp_1',
        phoneLocal: '+598 99 123 456',
        phoneHome: '+598 99 123 456',
        email: 'jrodriguez@email.com',
        photo: '/photos/drivers/juan_rodriguez.jpg',
        licenseExpiry: '2025-06-15',
        observations: [
          {
            date: '2024-11-15',
            text: 'Chofer muy puntual y colaborador',
            type: 'positive'
          }
        ],
        stats: {
          totalTrips: 156,
          onTimePercentage: 98,
          lastTrip: '2024-12-10'
        }
      },
      {
        id: 'drv_2',
        name: 'María González',
        dni: '2.345.678-9',
        company: 'emp_2',
        phoneLocal: '+598 99 789 012',
        phoneHome: '+598 99 789 012',
        email: 'mgonzalez@email.com',
        photo: '/photos/drivers/maria_gonzalez.jpg',
        licenseExpiry: '2024-08-20',
        observations: [
          {
            date: '2024-10-05',
            text: 'Documentación siempre en orden',
            type: 'positive'
          }
        ],
        stats: {
          totalTrips: 203,
          onTimePercentage: 95,
          lastTrip: '2024-12-12'
        }
      },
      {
        id: 'drv_3',
        name: 'Carlos Pérez',
        dni: '3.456.789-0',
        company: 'emp_3',
        phoneLocal: '+598 99 345 678',
        phoneHome: '+55 11 9876 5432',
        email: 'cperez@email.com',
        photo: '/photos/drivers/carlos_perez.jpg',
        licenseExpiry: '2025-03-10',
        observations: [
          {
            date: '2024-09-20',
            text: 'Problema con documentación DUA',
            type: 'warning'
          },
          {
            date: '2024-10-15',
            text: 'Situación resuelta, documentación al día',
            type: 'positive'
          }
        ],
        stats: {
          totalTrips: 89,
          onTimePercentage: 87,
          lastTrip: '2024-12-11'
        }
      },
      {
        id: 'drv_4',
        name: 'Ana Silva',
        dni: '4.567.890-1',
        company: 'emp_4',
        phoneLocal: '+598 99 901 234',
        phoneHome: '+54 11 8765 4321',
        email: 'asilva@email.com',
        photo: '/photos/drivers/ana_silva.jpg',
        licenseExpiry: '2025-12-31',
        observations: [],
        stats: {
          totalTrips: 67,
          onTimePercentage: 92,
          lastTrip: '2024-12-13'
        }
      }
    ];

    // Vehículos
    const mockVehicles = [
      {
        id: 'veh_1',
        plate: 'ABC 1234',
        secondaryPlate: 'DEF 5678',
        type: 'contenedor',
        brand: 'Scania',
        model: 'R450',
        year: 2020,
        company: 'emp_1',
        regularDriver: 'drv_1',
        photo: '/photos/vehicles/abc1234.jpg',
        observations: [
          {
            date: '2024-11-20',
            text: 'Precinto defectuoso detectado, reemplazado',
            type: 'warning',
            transitId: 'TRN-2024-1120'
          },
          {
            date: '2024-10-15',
            text: 'Mantenimiento preventivo realizado',
            type: 'info'
          }
        ],
        stats: {
          totalTransits: 234,
          averageWaitTime: 25, // minutos
          lastTransit: '2024-12-13',
          problemRate: 2.5 // porcentaje
        },
        documents: {
          insurance: {
            number: 'SEG-123456',
            expiry: '2025-06-30',
            company: 'Seguros del Puerto'
          },
          technicalReview: {
            date: '2024-09-15',
            nextDue: '2025-09-15'
          }
        }
      },
      {
        id: 'veh_2',
        plate: 'GHI 9012',
        secondaryPlate: 'JKL 3456',
        type: 'lona',
        brand: 'Mercedes-Benz',
        model: 'Actros 2546',
        year: 2019,
        company: 'emp_2',
        regularDriver: 'drv_2',
        photo: '/photos/vehicles/ghi9012.jpg',
        observations: [
          {
            date: '2024-12-01',
            text: 'Lona lateral dañada, reparación programada',
            type: 'warning'
          }
        ],
        stats: {
          totalTransits: 189,
          averageWaitTime: 30,
          lastTransit: '2024-12-12',
          problemRate: 4.2
        },
        documents: {
          insurance: {
            number: 'SEG-234567',
            expiry: '2025-04-15',
            company: 'Aseguradora Nacional'
          },
          technicalReview: {
            date: '2024-11-20',
            nextDue: '2025-11-20'
          }
        }
      },
      {
        id: 'veh_3',
        plate: 'MNO 7890',
        secondaryPlate: 'PQR 1234',
        type: 'contenedor',
        brand: 'Volvo',
        model: 'FH16',
        year: 2021,
        company: 'emp_3',
        regularDriver: 'drv_3',
        photo: '/photos/vehicles/mno7890.jpg',
        observations: [],
        stats: {
          totalTransits: 145,
          averageWaitTime: 20,
          lastTransit: '2024-12-11',
          problemRate: 1.8
        },
        documents: {
          insurance: {
            number: 'SEG-345678',
            expiry: '2025-08-20',
            company: 'Seguros Mercosur'
          },
          technicalReview: {
            date: '2024-07-10',
            nextDue: '2025-07-10'
          }
        }
      },
      {
        id: 'veh_4',
        plate: 'STU 5678',
        secondaryPlate: 'VWX 9012',
        type: 'lona',
        brand: 'Iveco',
        model: 'Stralis 460',
        year: 2018,
        company: 'emp_4',
        regularDriver: 'drv_4',
        photo: '/photos/vehicles/stu5678.jpg',
        observations: [
          {
            date: '2024-08-10',
            text: 'Excelente estado de mantenimiento',
            type: 'positive'
          }
        ],
        stats: {
          totalTransits: 312,
          averageWaitTime: 22,
          lastTransit: '2024-12-13',
          problemRate: 0.9
        },
        documents: {
          insurance: {
            number: 'SEG-456789',
            expiry: '2025-10-10',
            company: 'Seguros del Sur'
          },
          technicalReview: {
            date: '2024-12-01',
            nextDue: '2025-12-01'
          }
        }
      },
      {
        id: 'veh_5',
        plate: 'YZA 2345',
        secondaryPlate: 'BCD 6789',
        type: 'refrigerado',
        brand: 'Scania',
        model: 'P410',
        year: 2022,
        company: 'emp_1',
        regularDriver: 'drv_1',
        photo: '/photos/vehicles/yza2345.jpg',
        observations: [
          {
            date: '2024-12-05',
            text: 'Sistema de refrigeración revisado, funcionando correctamente',
            type: 'positive'
          }
        ],
        stats: {
          totalTransits: 98,
          averageWaitTime: 35,
          lastTransit: '2024-12-13',
          problemRate: 3.1
        },
        documents: {
          insurance: {
            number: 'SEG-567890',
            expiry: '2025-12-25',
            company: 'Seguros Especializados'
          },
          technicalReview: {
            date: '2024-10-30',
            nextDue: '2025-10-30'
          },
          refrigerationCert: {
            date: '2024-11-15',
            nextDue: '2025-05-15'
          }
        }
      }
    ];

    // Cargar datos en los mapas
    mockCompanies.forEach(company => {
      this.companies.set(company.id, company);
    });

    mockDrivers.forEach(driver => {
      this.drivers.set(driver.id, driver);
    });

    mockVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.plate, vehicle);
    });

    console.log('Base de datos de vehículos cargada (mock):', {
      companies: this.companies.size,
      drivers: this.drivers.size,
      vehicles: this.vehicles.size
    });
  }

  /**
   * Cargar datos desde el servidor
   */
  async loadFromServer() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/vehicle-database`);
      const data = await response.json();
      
      // Procesar y cargar datos
      data.companies?.forEach(company => {
        this.companies.set(company.id, company);
      });

      data.drivers?.forEach(driver => {
        this.drivers.set(driver.id, driver);
      });

      data.vehicles?.forEach(vehicle => {
        this.vehicles.set(vehicle.plate, vehicle);
      });
    } catch (error) {
      console.error('Error cargando base de datos desde servidor:', error);
      // Fallback a datos mock si falla
      await this.loadMockData();
    }
  }

  /**
   * Buscar vehículo por matrícula
   */
  async searchVehicle(plate) {
    await this.initialize();
    
    const vehicle = this.vehicles.get(plate.toUpperCase());
    if (vehicle) {
      // Enriquecer con información del chofer y empresa
      const driver = this.drivers.get(vehicle.regularDriver);
      const company = this.companies.get(vehicle.company);
      
      return {
        ...vehicle,
        driver,
        company,
        hasWarnings: vehicle.observations.some(obs => obs.type === 'warning'),
        needsAttention: this.checkVehicleNeedsAttention(vehicle)
      };
    }
    
    return null;
  }

  /**
   * Buscar vehículos por término (matrícula parcial, empresa, etc)
   */
  async searchVehicles(searchTerm) {
    await this.initialize();
    
    const term = searchTerm.toLowerCase();
    const results = [];
    
    for (const [plate, vehicle] of this.vehicles) {
      const company = this.companies.get(vehicle.company);
      const driver = this.drivers.get(vehicle.regularDriver);
      
      if (
        plate.toLowerCase().includes(term) ||
        vehicle.secondaryPlate?.toLowerCase().includes(term) ||
        company?.name.toLowerCase().includes(term) ||
        driver?.name.toLowerCase().includes(term) ||
        vehicle.type.toLowerCase().includes(term)
      ) {
        results.push({
          ...vehicle,
          driver,
          company
        });
      }
    }
    
    return results;
  }

  /**
   * Buscar chofer por ID o nombre
   */
  async searchDriver(searchTerm) {
    await this.initialize();
    
    // Buscar por ID exacto
    if (this.drivers.has(searchTerm)) {
      const driver = this.drivers.get(searchTerm);
      const company = this.companies.get(driver.company);
      return { ...driver, company };
    }
    
    // Buscar por nombre
    const term = searchTerm.toLowerCase();
    for (const [id, driver] of this.drivers) {
      if (
        driver.name.toLowerCase().includes(term) ||
        driver.dni.includes(term)
      ) {
        const company = this.companies.get(driver.company);
        return { ...driver, company };
      }
    }
    
    return null;
  }

  /**
   * Obtener historial de observaciones de un vehículo
   */
  async getVehicleHistory(plate) {
    await this.initialize();
    
    const vehicle = this.vehicles.get(plate.toUpperCase());
    if (!vehicle) return [];
    
    // Combinar observaciones del vehículo con el historial general
    const vehicleObs = vehicle.observations || [];
    const generalObs = this.observations.filter(obs => obs.vehiclePlate === plate);
    
    return [...vehicleObs, ...generalObs].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }

  /**
   * Agregar nueva observación
   */
  async addObservation(vehiclePlate, observation) {
    const newObs = {
      id: `obs_${Date.now()}`,
      vehiclePlate,
      date: new Date().toISOString(),
      ...observation
    };
    
    // Agregar a la lista general
    this.observations.push(newObs);
    
    // Agregar al vehículo específico
    const vehicle = this.vehicles.get(vehiclePlate);
    if (vehicle) {
      if (!vehicle.observations) vehicle.observations = [];
      vehicle.observations.push(newObs);
    }
    
    // En producción, sincronizar con el servidor
    if (!CONFIG.IS_DEVELOPMENT) {
      try {
        await fetch(`${CONFIG.API_BASE_URL}/vehicle-observations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newObs)
        });
      } catch (error) {
        console.error('Error guardando observación:', error);
      }
    }
    
    return newObs;
  }

  /**
   * Verificar si un vehículo necesita atención especial
   */
  checkVehicleNeedsAttention(vehicle) {
    const now = new Date();
    
    // Verificar documentos vencidos o próximos a vencer
    if (vehicle.documents) {
      const { insurance, technicalReview } = vehicle.documents;
      
      if (insurance?.expiry) {
        const expiryDate = new Date(insurance.expiry);
        const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry < 30) return true;
      }
      
      if (technicalReview?.nextDue) {
        const dueDate = new Date(technicalReview.nextDue);
        const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
        if (daysUntilDue < 30) return true;
      }
    }
    
    // Verificar observaciones recientes de tipo warning
    const recentWarnings = vehicle.observations?.filter(obs => {
      const obsDate = new Date(obs.date);
      const daysSince = (now - obsDate) / (1000 * 60 * 60 * 24);
      return obs.type === 'warning' && daysSince < 30;
    });
    
    if (recentWarnings?.length > 0) return true;
    
    // Verificar tasa de problemas
    if (vehicle.stats?.problemRate > 5) return true;
    
    return false;
  }

  /**
   * Obtener sugerencias de autocompletado
   */
  async getAutocompleteSuggestions(field, value) {
    await this.initialize();
    
    const suggestions = [];
    const term = value.toLowerCase();
    
    switch (field) {
      case 'plate':
        for (const [plate, vehicle] of this.vehicles) {
          if (plate.toLowerCase().startsWith(term)) {
            const driver = this.drivers.get(vehicle.regularDriver);
            const company = this.companies.get(vehicle.company);
            suggestions.push({
              value: plate,
              label: `${plate} - ${vehicle.type} - ${company?.name || 'Sin empresa'}`,
              data: { vehicle, driver, company }
            });
          }
        }
        break;
        
      case 'driver':
        for (const [id, driver] of this.drivers) {
          if (driver.name.toLowerCase().includes(term)) {
            const company = this.companies.get(driver.company);
            suggestions.push({
              value: driver.name,
              label: `${driver.name} - ${company?.name || 'Sin empresa'}`,
              data: { driver, company }
            });
          }
        }
        break;
        
      case 'company':
        for (const [id, company] of this.companies) {
          if (company.name.toLowerCase().includes(term)) {
            suggestions.push({
              value: company.name,
              label: `${company.name} - ${company.country}`,
              data: { company }
            });
          }
        }
        break;
    }
    
    return suggestions.slice(0, 10); // Limitar a 10 sugerencias
  }

  /**
   * Iniciar llamada telefónica (simulado en desarrollo)
   */
  async initiateCall(phoneNumber) {
    if (CONFIG.IS_DEVELOPMENT) {
      console.log(`Iniciando llamada a: ${phoneNumber}`);
      // En desarrollo, simular la acción
      window.alert(`Simulación: Llamando a ${phoneNumber}`);
      return true;
    }
    
    // En producción, usar la API de telefonía o redirigir
    window.location.href = `tel:${phoneNumber}`;
    return true;
  }

  /**
   * Enviar SMS (simulado en desarrollo)
   */
  async sendSMS(phoneNumber, message) {
    if (CONFIG.IS_DEVELOPMENT) {
      console.log(`Enviando SMS a: ${phoneNumber}`);
      console.log(`Mensaje: ${message}`);
      window.alert(`Simulación: SMS enviado a ${phoneNumber}\nMensaje: ${message}`);
      return true;
    }
    
    // En producción, usar la API de SMS
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, message })
      });
      return response.ok;
    } catch (error) {
      console.error('Error enviando SMS:', error);
      return false;
    }
  }
}

// Instancia única del servicio
const vehicleDatabase = new VehicleDatabaseService();

export default vehicleDatabase;