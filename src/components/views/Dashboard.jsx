import React, { useState, useEffect } from 'react';
import { Package, MapPin, Database, AlertTriangle, Truck, Sun, Moon, ArrowDown, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
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

  // Estado para la actividad reciente
  const [recentActivity, setRecentActivity] = useState([]);

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

    // Simular actividad reciente
    setRecentActivity([
      {
        id: 1,
        type: 'precintado',
        message: 'Tránsito #4523 precintado',
        camion: 'ABC-123',
        time: '12:45',
        status: 'completed'
      },
      {
        id: 2,
        type: 'alerta',
        message: 'Alerta de stock resuelta',
        detail: 'Precintos tipo A',
        time: '12:38',
        status: 'resolved'
      },
      {
        id: 3,
        type: 'desprecintado',
        message: 'Camión internacional procesado',
        camion: 'BR-456XY',
        time: '12:30',
        status: 'completed'
      },
      {
        id: 4,
        type: 'precintado',
        message: 'Tránsito #4522 precintado',
        camion: 'DEF-789',
        time: '12:22',
        status: 'completed'
      },
      {
        id: 5,
        type: 'alerta',
        message: 'Nueva alerta operativa',
        detail: 'Demora en puesto 3',
        time: '12:15',
        status: 'pending'
      }
    ]);
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

  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'precintado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'desprecintado':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'alerta':
        return status === 'resolved' ? 
          <CheckCircle className="w-5 h-5 text-green-500" /> : 
          <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Función para obtener el estilo del tipo de actividad
  const getActivityStyle = (type, status) => {
    if (type === 'alerta' && status === 'pending') {
      return darkMode ? 'border-orange-500/50 bg-orange-500/10' : 'border-orange-300 bg-orange-50';
    }
    return darkMode ? 'border-gray-700' : 'border-gray-200';
  };

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
        <div className="max-w-7xl mx-auto">
          {/* Grid principal con Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Módulos Grid - 3 columnas en desktop */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

            {/* Timeline de Actividad Reciente - 1 columna en desktop */}
            <div className={`lg:col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Actividad Reciente
                </h2>
                <Tooltip text="Últimos 30 minutos">
                  <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </Tooltip>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`
                      relative flex items-start space-x-3 p-3 rounded-lg border
                      ${getActivityStyle(activity.type, activity.status)}
                      transition-all duration-200 hover:shadow-md
                    `}
                  >
                    {/* Timeline line */}
                    {index < recentActivity.length - 1 && (
                      <div className={`absolute left-7 top-12 bottom-0 w-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    )}
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.message}
                      </p>
                      {(activity.camion || activity.detail) && (
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.camion || activity.detail}
                        </p>
                      )}
                    </div>
                    
                    {/* Time */}
                    <div className="flex-shrink-0">
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className={`
                w-full mt-4 py-2 text-sm font-medium rounded-lg
                ${darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
                transition-colors duration-200
              `}>
                Ver todo el historial
              </button>
            </div>
          </div>
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