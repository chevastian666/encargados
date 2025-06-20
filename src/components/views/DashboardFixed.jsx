import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Package, MapPin, Database, AlertTriangle, Truck, Sun, Moon, 
  Clock, CheckCircle, AlertCircle, 
  TrendingUp, TrendingDown, Minus, RefreshCw
} from 'lucide-react';
import { useDarkMode, useDashboardStats, useNotification } from '../../hooks';
import { ConnectionStatus, Tooltip, MiniChart, CommandCenter } from '../common';

/**
 * Card de módulo optimizada con React.memo
 */
const ModuleCard = memo(({ module, darkMode, onClick, stats }) => {
  const Icon = module.icon;
  const stat = stats[module.statKey];
  
  // Estilos base más explícitos
  const cardStyles = darkMode 
    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
    : 'bg-white border-gray-200 hover:border-gray-300';
    
  const textStyles = {
    title: darkMode ? 'text-white' : 'text-gray-900',
    subtitle: darkMode ? 'text-gray-400' : 'text-gray-600',
    value: darkMode ? 'text-gray-300' : 'text-gray-700'
  };
  
  return (
    <button
      onClick={() => onClick(module.id)}
      className={`
        relative overflow-hidden
        ${cardStyles}
        border
        group
        p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
        text-left w-full
      `}
    >
      {/* Notificación Badge */}
      {module.notification > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce z-10">
          {module.notification}
        </div>
      )}

      {/* Header con icono y tendencia */}
      <div className="flex items-start justify-between mb-4">
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
      <h3 className={`text-lg font-bold mb-1 ${textStyles.title}`}>
        {module.title}
      </h3>
      <p className={`text-sm mb-3 ${textStyles.subtitle}`}>
        {module.description}
      </p>

      {/* Valor principal con mini-gráfico */}
      <div className="flex items-end justify-between">
        <p className={`text-3xl font-bold ${textStyles.value}`}>
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
 * Vista mejorada del Dashboard con todas las nuevas características
 */
const DashboardFixed = ({ onModuleClick }) => {
  const [darkMode, , toggleDarkMode] = useDarkMode();
  const { showNotification } = useNotification();
  
  // Usar el nuevo hook de estadísticas
  const { 
    stats, 
    performance, 
    historicalData, 
    loading, 
    error, 
    refreshStats,
    getMetricColor 
  } = useDashboardStats(10000);

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

  // Estilos principales
  const mainStyles = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-100',
    header: darkMode ? 'bg-gray-800' : 'bg-white',
    text: {
      primary: darkMode ? 'text-white' : 'text-gray-900',
      secondary: darkMode ? 'text-gray-400' : 'text-gray-600'
    },
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    button: {
      primary: darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
      secondary: darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }
  };

  // Manejar acciones del Command Center
  const handleCommandAction = useCallback((action, data) => {
    switch (action) {
      case 'refresh':
        refreshStats();
        showNotification('Datos actualizados', 'success');
        break;
      case 'export':
        showNotification('Generando reporte...', 'info');
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
    <div className={`min-h-screen ${mainStyles.background} transition-colors duration-300`}>
      {/* Header mejorado */}
      <header className={`${mainStyles.header} shadow-lg px-4 sm:px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className={`text-xl sm:text-2xl font-bold ${mainStyles.text.primary}`}>
              Panel Encargados Puerto Block Tracker
            </h1>
            <p className={`text-sm ${mainStyles.text.secondary}`}>
              Puerto de Montevideo
            </p>
          </div>
          
          {/* Indicadores de rendimiento */}
          <div className="hidden md:flex items-center space-x-4 mr-4">
            <Tooltip text="Tiempo promedio de espera">
              <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-2xl font-bold text-blue-500">{performance.tiempoPromedioEspera}m</p>
                <p className={`text-xs ${mainStyles.text.secondary}`}>Tiempo espera</p>
              </div>
            </Tooltip>
            
            <Tooltip text="Eficiencia del sistema">
              <div className={`text-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-2xl font-bold text-green-500">{performance.eficiencia}%</p>
                <p className={`text-xs ${mainStyles.text.secondary}`}>Eficiencia</p>
              </div>
            </Tooltip>
          </div>
          
          <ConnectionStatus darkMode={darkMode} />
          
          <Tooltip text={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            <button
              onClick={toggleDarkMode}
              className={`ml-4 p-3 rounded-lg ${mainStyles.button.primary} transition-all duration-200`}
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
                ${mainStyles.button.secondary}
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

            {/* Timeline de Actividad Reciente */}
            <div className={`lg:col-span-1 ${mainStyles.card} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${mainStyles.text.primary}`}>
                  Actividad Reciente
                </h2>
                <Clock className={`w-5 h-5 ${mainStyles.text.secondary}`} />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`
                      relative flex items-start space-x-3 p-3 rounded-lg border
                      ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                      transition-all duration-200 hover:shadow-md
                    `}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'precintado' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {activity.type === 'alerta' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                      {activity.type === 'desprecintado' && <Package className="w-5 h-5 text-blue-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${mainStyles.text.primary}`}>
                        {activity.message}
                      </p>
                      {(activity.camion || activity.detail) && (
                        <p className={`text-xs mt-0.5 ${mainStyles.text.secondary}`}>
                          {activity.camion || activity.detail}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className={`
                w-full mt-4 py-2 text-sm font-medium rounded-lg
                ${mainStyles.button.secondary}
                transition-colors duration-200
              `}>
                Ver todo el historial
              </button>
            </div>
          </div>
        </div>

        {/* Resumen del día */}
        <div className={`mt-8 max-w-7xl mx-auto p-6 rounded-xl ${mainStyles.card} shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 ${mainStyles.text.primary}`}>
            Resumen del Día
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, stat]) => {
              const titles = {
                precintados: 'Precintados',
                enEspera: 'En Espera',
                porDesprecintar: 'Por Desprecintar',
                alertas: 'Alertas'
              };
              
              return (
                <div key={key} className={`text-center p-4 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-500">
                    {stat.valor}
                  </p>
                  <p className={`text-sm ${mainStyles.text.secondary}`}>
                    {titles[key]}
                  </p>
                  <div className="mt-2">
                    <p className={`text-xs ${stat.vsPromedio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.vsPromedio > 0 && '+'}{stat.vsPromedio} vs promedio
                    </p>
                  </div>
                </div>
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

export default DashboardFixed;