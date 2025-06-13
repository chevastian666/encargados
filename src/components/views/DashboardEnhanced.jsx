import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Package, MapPin, Database, AlertTriangle, Truck, Sun, Moon, 
  ArrowDown, Clock, CheckCircle, AlertCircle, XCircle, Search,
  TrendingUp, TrendingDown, Minus, Filter, RefreshCw
} from 'lucide-react';
import { useDarkMode, useDashboardStats, useNotification } from '../../hooks';
import { ConnectionStatus, Tooltip, MiniChart, CommandCenter, SearchBar } from '../common';

/**
 * Card de módulo optimizada con React.memo
 */
const ModuleCard = memo(({ module, darkMode, onClick, stats }) => {
  const Icon = module.icon;
  const stat = stats[module.statKey];
  
  return (
    <button
      onClick={() => onClick(module.id)}
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-blue-500/10 to-purple-500/10
        backdrop-blur-sm
        border border-white/20
        hover:border-white/40
        group
        p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
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

      {/* Header con icono y tendencia */}
      <div className="flex items-start justify-between mb-4 z-10 relative">
        <div className={`${module.color} p-3 rounded-xl`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        {/* Indicador de tendencia */}
        {stat && (
          <div className="flex items-center space-x-1">
            {stat.vsAyer > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : stat.vsAyer < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4 text-gray-500" />
            )}
            <span className={`text-xs font-medium ${
              stat.vsAyer > 0 ? 'text-green-500' : 
              stat.vsAyer < 0 ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {stat.vsAyer > 0 && '+'}{stat.vsAyer}
            </span>
          </div>
        )}
      </div>

      {/* Título y descripción */}
      <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'} z-10 relative`}>
        {module.title}
      </h3>
      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'} z-10 relative`}>
        {module.description}
      </p>

      {/* Valor principal con mini-gráfico */}
      <div className="flex items-end justify-between z-10 relative">
        <p className={`text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {module.count || (stat && stat.valor) || 0}
        </p>
        
        {/* Mini gráfico de tendencia */}
        {stat && stat.tendencia && (
          <div className="w-24 h-12">
            <MiniChart 
              data={stat.tendencia} 
              color={module.chartColor || 'blue'} 
              height={48}
              filled={true}
            />
          </div>
        )}
      </div>

      {/* Alertas especiales */}
      {module.alert && (
        <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse z-10">
          Stock bajo
        </span>
      )}
    </button>
  );
});

ModuleCard.displayName = 'ModuleCard';

/**
 * Item de actividad con memo
 */
const ActivityItem = memo(({ activity, index, totalItems, darkMode }) => {
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

  const getActivityStyle = (type, status) => {
    if (type === 'alerta' && status === 'pending') {
      return darkMode ? 'border-orange-500/50 bg-orange-500/10' : 'border-orange-300 bg-orange-50';
    }
    return darkMode ? 'border-gray-700' : 'border-gray-200';
  };

  return (
    <div 
      className={`
        relative flex items-start space-x-3 p-3 rounded-lg border
        ${getActivityStyle(activity.type, activity.status)}
        transition-all duration-200 hover:shadow-md
      `}
    >
      {/* Timeline line */}
      {index < totalItems - 1 && (
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
  );
});

ActivityItem.displayName = 'ActivityItem';

/**
 * Vista mejorada del Dashboard con todas las nuevas características
 */
const DashboardEnhanced = ({ onModuleClick }) => {
  const [darkMode, setDarkMode, toggleDarkMode] = useDarkMode();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Usar el nuevo hook de estadísticas
  const { 
    stats, 
    performance, 
    historicalData, 
    loading, 
    error, 
    refreshStats,
    getMetricColor 
  } = useDashboardStats(10000); // Actualizar cada 10 segundos

  // Estado para la actividad reciente
  const [recentActivity, setRecentActivity] = useState([
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

  // Filtrar actividades
  const filteredActivity = recentActivity.filter(activity => {
    const matchesSearch = 
      activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.camion && activity.camion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.detail && activity.detail.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activityFilter === 'all' || activity.type === activityFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Configuración de módulos con estadísticas
  const modules = [
    { 
      id: 'transitos', 
      title: 'Tránsitos Pendientes', 
      icon: Package, 
      color: 'bg-blue-600',
      chartColor: 'blue',
      statKey: 'enEspera',
      notification: stats.enEspera.valor > 15 ? 1 : 0,
      description: 'Vehículos esperando precintado'
    },
    { 
      id: 'mapa', 
      title: 'Mapa en Vivo', 
      icon: MapPin, 
      color: 'bg-green-600',
      chartColor: 'green',
      count: 8,
      description: 'Camiones en ruta'
    },
    { 
      id: 'stock', 
      title: 'Gestión de Stock', 
      icon: Database, 
      color: 'bg-purple-600',
      chartColor: 'purple',
      alert: true,
      description: 'Control de inventario'
    },
    { 
      id: 'alertas', 
      title: 'Alertas Operativas', 
      icon: AlertTriangle, 
      color: 'bg-orange-600',
      chartColor: 'orange',
      statKey: 'alertas',
      notification: stats.alertas.valor,
      description: 'Requieren atención'
    },
    { 
      id: 'camiones', 
      title: 'Base de Datos', 
      icon: Truck, 
      color: 'bg-teal-600',
      chartColor: 'blue',
      count: 1247,
      description: 'Vehículos registrados'
    },
    { 
      id: 'desprecintar', 
      title: 'Por Desprecintar', 
      icon: Package, 
      color: 'bg-red-600',
      chartColor: 'red',
      statKey: 'porDesprecintar',
      notification: stats.porDesprecintar.valor > 5 ? 1 : 0,
      description: 'Camiones internacionales'
    }
  ];

  // Manejar acciones del Command Center
  const handleCommandAction = useCallback((action, data) => {
    switch (action) {
      case 'refresh':
        refreshStats();
        showNotification('Datos actualizados', 'success');
        break;
      case 'export':
        showNotification('Generando reporte...', 'info');
        // Implementar exportación
        break;
      case 'alerts':
        onModuleClick('alertas');
        break;
      case 'emergency':
        showNotification('Protocolo de emergencia activado', 'warning');
        break;
      case 'toggleProcess':
        showNotification(
          `${data.processId} ${data.active ? 'activado' : 'desactivado'}`,
          'info'
        );
        break;
      default:
        break;
    }
  }, [refreshStats, showNotification, onModuleClick]);

  // Estado del sistema para el Command Center
  const systemStatus = {
    critical: performance.cargaSistema === 'critico',
    warning: performance.cargaSistema === 'alto',
    activeAlerts: stats.alertas.valor,
    message: performance.cargaSistema === 'critico' ? 
      'Sistema sobrecargado' : 
      performance.cargaSistema === 'alto' ? 
      'Carga elevada' : 
      'Operando normalmente'
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Header mejorado */}
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
          
          {/* Indicadores de rendimiento */}
          <div className="hidden md:flex items-center space-x-4 mr-4">
            <Tooltip text="Tiempo promedio de espera">
              <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-2xl font-bold text-blue-500">{performance.tiempoPromedioEspera}m</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tiempo espera</p>
              </div>
            </Tooltip>
            
            <Tooltip text="Eficiencia del sistema">
              <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-2xl font-bold text-green-500">{performance.eficiencia}%</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Eficiencia</p>
              </div>
            </Tooltip>
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
          {/* Botón de actualización manual */}
          <div className="flex justify-end mb-4">
            <button
              onClick={refreshStats}
              disabled={loading}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-white hover:bg-gray-50 text-gray-700'
                }
                transition-colors duration-200 shadow-md
              `}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Actualizar</span>
            </button>
          </div>

          {/* Grid principal con Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Módulos Grid - 3 columnas en desktop */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  darkMode={darkMode}
                  onClick={onModuleClick}
                  stats={stats}
                />
              ))}
            </div>

            {/* Timeline de Actividad Reciente mejorado */}
            <div className={`lg:col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Actividad Reciente
                </h2>
                <div className="flex items-center space-x-2">
                  <Tooltip text="Filtrar actividades">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-lg ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors`}
                    >
                      <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Últimos 30 minutos">
                    <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </Tooltip>
                </div>
              </div>

              {/* Búsqueda y filtros */}
              {showFilters && (
                <div className="mb-4 space-y-2">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar en actividades..."
                    darkMode={darkMode}
                  />
                  <div className="flex space-x-2">
                    {['all', 'precintado', 'desprecintado', 'alerta'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActivityFilter(filter)}
                        className={`
                          px-3 py-1 text-xs rounded-full transition-colors
                          ${activityFilter === filter
                            ? darkMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-500 text-white'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {filter === 'all' ? 'Todos' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredActivity.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                    totalItems={filteredActivity.length}
                    darkMode={darkMode}
                  />
                ))}
              </div>

              {filteredActivity.length === 0 && (
                <p className={`text-center py-8 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No se encontraron actividades
                </p>
              )}

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

        {/* Resumen del día mejorado con métricas de rendimiento */}
        <div className={`mt-8 max-w-7xl mx-auto p-6 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Resumen del Día
            </h2>
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${performance.cargaSistema === 'critico' 
                ? 'bg-red-500/20 text-red-500'
                : performance.cargaSistema === 'alto'
                ? 'bg-yellow-500/20 text-yellow-500'
                : performance.cargaSistema === 'bajo'
                ? 'bg-blue-500/20 text-blue-500'
                : 'bg-green-500/20 text-green-500'
              }
            `}>
              Carga: {performance.cargaSistema}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, stat]) => {
              const titles = {
                precintados: 'Precintados',
                enEspera: 'En Espera',
                porDesprecintar: 'Por Desprecintar',
                alertas: 'Alertas'
              };
              
              const isReverse = key === 'enEspera' || key === 'porDesprecintar' || key === 'alertas';
              const color = getMetricColor(key, stat.valor, isReverse);
              
              return (
                <Tooltip key={key} text={`${titles[key]} hoy`}>
                  <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-help">
                    <p className={`text-2xl sm:text-3xl font-bold text-${color}-500`}>
                      {stat.valor}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {titles[key]}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className={`text-xs flex items-center justify-center ${
                        isReverse 
                          ? (stat.vsPromedio <= 0 ? 'text-green-400' : 'text-red-400')
                          : (stat.vsPromedio >= 0 ? 'text-green-400' : 'text-red-400')
                      }`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.vsPromedio > 0 && '+'}{stat.vsPromedio} vs promedio
                      </p>
                      <p className={`text-xs flex items-center justify-center ${
                        stat.vsAyer === 0 ? 'text-gray-400' : 
                        isReverse
                          ? (stat.vsAyer < 0 ? 'text-green-400' : 'text-red-400')
                          : (stat.vsAyer > 0 ? 'text-green-400' : 'text-red-400')
                      }`}>
                        {stat.vsAyer === 0 ? (
                          <Minus className="w-3 h-3 mr-1" />
                        ) : stat.vsAyer > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {stat.vsAyer === 0 ? 'igual que ayer' : 
                         `${stat.vsAyer > 0 ? '+' : ''}${stat.vsAyer} vs ayer`}
                      </p>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </main>

      {/* Command Center flotante */}
      <CommandCenter 
        darkMode={darkMode}
        onAction={handleCommandAction}
        systemStatus={systemStatus}
      />
    </div>
  );
};

export default DashboardEnhanced;