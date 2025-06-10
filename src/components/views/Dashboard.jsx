import React, { useState, useEffect } from 'react';
import { Package, MapPin, Database, AlertTriangle, Truck, Sun, Moon, ArrowDown } from 'lucide-react';
import { useApiData, useDarkMode } from '../../hooks';
import { ConnectionStatus, Tooltip } from '../common';
import apiService from '../../services/api.service';

/**
 * Vista principal del Dashboard
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onModuleClick - Función al hacer clic en un módulo
 */
const DashboardView = ({ onModuleClick }) => {
  const [darkMode, setDarkMode, toggleDarkMode] = useDarkMode();
  const [stats, setStats] = useState({
    precintados: 0,
    enEspera: 0,
    porDesprecintar: 0,
    alertas: 0,
    eficiencia: 0
  });

  // Usar el hook de API con polling automático para notificaciones
  const { data: notificationsData } = useApiData(
    () => apiService.getNotifications(),
    [],
    { pollingInterval: 10000 } // Polling más frecuente para notificaciones
  );

  const notifications = notificationsData || { transitos: 0, alertas: 0, desprecintar: 0 };

  // Cargar estadísticas del día
  useEffect(() => {
    // Simular carga de estadísticas
    // En producción, esto vendría de una API
    setStats({
      precintados: 47,
      enEspera: 12,
      porDesprecintar: 7,
      alertas: 3,
      eficiencia: 98
    });
  }, []);

  const modules = [
    { 
      id: 'transitos', 
      title: 'Tránsitos Pendientes', 
      icon: Package, 
      color: 'bg-blue-600', 
      count: stats.enEspera, 
      notification: notifications.transitos,
      description: 'Vehículos esperando precintado'
    },
    { 
      id: 'mapa', 
      title: 'Mapa en Vivo', 
      icon: MapPin, 
      color: 'bg-green-600', 
      count: 8,
      description: 'Camiones en ruta'
    },
    { 
      id: 'stock', 
      title: 'Gestión de Stock', 
      icon: Database, 
      color: 'bg-purple-600', 
      alert: true,
      description: 'Control de inventario'
    },
    { 
      id: 'alertas', 
      title: 'Alertas Operativas', 
      icon: AlertTriangle, 
      color: 'bg-orange-600', 
      count: stats.alertas, 
      notification: notifications.alertas,
      description: 'Requieren atención'
    },
    { 
      id: 'camiones', 
      title: 'Base de Datos', 
      icon: Truck, 
      color: 'bg-teal-600', 
      count: 1247,
      description: 'Vehículos registrados'
    },
    { 
      id: 'desprecintar', 
      title: 'Por Desprecintar', 
      subtitle: 'Llegadas pendientes', 
      icon: Package, 
      color: 'bg-red-600', 
      count: stats.porDesprecintar, 
      importante: true, 
      notification: notifications.desprecintar,
      description: 'Camiones internacionales'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg px-4 sm:px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sistema de Precintado Aduanero
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Puerto de Montevideo
            </p>
          </div>
          
          <ConnectionStatus darkMode={darkMode} />
          
          <Tooltip text={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            <button
              onClick={toggleDarkMode}
              className={`ml-4 p-3 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-all duration-200`}
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Módulos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
  {modules.map((module) => {
    const Icon = module.icon;
    return (
      <button
        key={module.id}
        onClick={() => onModuleClick(module.id)}
        className={`
          relative overflow-hidden
          bg-gradient-to-br from-blue-500/10 to-purple-500/10
          backdrop-blur-sm
          border border-white/20
          hover:border-white/40
          group
          p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
          text-left w-full
        `}
      >
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                        -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-0" />

        {/* Notificación Badge */}
        {module.notification > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce z-10">
            {module.notification}
          </div>
        )}

        {/* Icono */}
        <div className={`${module.color} p-4 rounded-xl inline-block mb-4 z-10 relative`}>
          <Icon className="w-8 sm:w-12 h-8 sm:h-12 text-white" />
        </div>

        {/* Título */}
        <h3 className={`text-lg sm:text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'} z-10 relative`}>
          {module.title}
        </h3>

        {/* Subtítulo o descripción */}
        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'} z-10 relative`}>
          {module.subtitle || module.description}
        </p>

        {/* Contador */}
        {module.count !== undefined && (
          <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} z-10 relative`}>
            {module.count}
          </p>
        )}

        {/* Alerta de stock */}
        {module.alert && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse z-10">
            Stock bajo
          </span>
        )}

        {/* Indicador de importancia */}
        {module.id === 'desprecintar' && (
          <div className="absolute top-4 right-4 z-10">
            <ArrowDown className="w-5 h-5 text-yellow-500 animate-bounce" />
          </div>
        )}
      </button>
    );
  })}
</div>


        {/* Resumen del día */}
        <div className={`mt-8 max-w-7xl mx-auto p-6 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Resumen del Día
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Tooltip text="Tránsitos completados hoy">
              <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-help">
                <p className="text-2xl sm:text-3xl font-bold text-green-500">{stats.precintados}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Precintados</p>
              </div>
            </Tooltip>
            
            <Tooltip text="Vehículos esperando en cola">
              <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-help">
                <p className="text-2xl sm:text-3xl font-bold text-blue-500">{stats.enEspera}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Espera</p>
              </div>
            </Tooltip>
            
            <Tooltip text="Camiones internacionales por procesar">
              <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-help">
                <p className="text-2xl sm:text-3xl font-bold text-red-500">{stats.porDesprecintar}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por Desprecintar</p>
              </div>
            </Tooltip>
            
            <Tooltip text="Alertas activas del sistema">
              <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-help">
                <p className="text-2xl sm:text-3xl font-bold text-orange-500">{stats.alertas}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alertas</p>
              </div>
            </Tooltip>
            
            <Tooltip text="Porcentaje de tránsitos completados a tiempo">
              <div className={`text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-help ${
                window.innerWidth < 768 ? 'col-span-2' : ''
              }`}>
                <p className="text-2xl sm:text-3xl font-bold text-purple-500">{stats.eficiencia}%</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Eficiencia</p>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Tiempo Promedio
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              12 min
            </p>
            <p className="text-xs text-green-500 mt-1">↓ 3 min vs ayer</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Próximo Turno
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              14:00
            </p>
            <p className="text-xs text-gray-500 mt-1">5 operarios</p>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Inspecciones MGAP
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              3
            </p>
            <p className="text-xs text-yellow-500 mt-1">Pendientes hoy</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardView;