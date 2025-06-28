import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Truck, MapPin, Database, 
  Sun, Moon, RefreshCw, ChevronRight, Clock,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { useDarkMode, useDashboardStats, useNotification, useRealtimeUpdates } from '../../hooks';
import { ConnectionStatus, ThemeSelector, ThemeEditor } from '../common';
import AutomaticAlerts from '../common/AutomaticAlerts';
import CMOCommunication from '../common/CMOCommunication';
import OperationalStats from '../common/OperationalStats';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Dashboard con diseño limpio y minimalista
 * Prioriza información crítica sin saturar la interfaz
 */
const DashboardCleanFixed = ({ onModuleClick }) => {
  const { isDark } = useTheme();
  const { stats, loading, refreshStats, updateStats } = useDashboardStats();
  const { success, error, warning, info } = useNotification();
  const [activeModule, setActiveModule] = useState(null);
  const darkMode = isDark; // Compatibilidad con código existente
  
  // Configurar actualizaciones en tiempo real
  const { connected } = useRealtimeUpdates({
    onTransitUpdate: (update) => {
      // Actualizar estadísticas cuando cambia un tránsito
      if (update.oldState && update.newState) {
        refreshStats(); // Por ahora refrescar todo, luego optimizar
      }
    },
    onAlertUpdate: (alert) => {
      // Actualizar contador de alertas
      if (alert.type === 'new_alert') {
        updateStats(prev => ({
          ...prev,
          alertas: {
            ...prev.alertas,
            valor: prev.alertas.valor + 1
          }
        }));
      }
    }
  });

  // Módulos críticos (solo los esenciales)
  const criticalModules = [
    {
      id: 'transitos',
      title: 'Tránsitos Pendientes',
      value: stats.enEspera.valor,
      trend: stats.enEspera.vsAyer,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      priority: 1
    },
    {
      id: 'alertas',
      title: 'Alertas Activas',
      value: stats.alertas.valor,
      trend: stats.alertas.vsAyer,
      icon: AlertTriangle,
      color: stats.alertas.valor > 0 ? 'text-red-500' : 'text-green-500',
      bgColor: stats.alertas.valor > 0 
        ? 'bg-red-50 dark:bg-red-900/20'
        : 'bg-green-50 dark:bg-green-900/20',
      priority: 2
    }
  ];

  // Módulos secundarios
  const secondaryModules = [
    {
      id: 'desprecintar',
      title: 'Por Desprecintar',
      value: stats.porDesprecintar.valor,
      icon: Truck,
      color: 'text-amber-500'
    },
    {
      id: 'mapa',
      title: 'En Ruta',
      value: '4',
      icon: MapPin,
      color: 'text-green-500'
    },
    {
      id: 'stock',
      title: 'Stock',
      value: 'OK',
      icon: Database,
      color: 'text-purple-500'
    }
  ];

  // Card de módulo crítico con táctil optimizado
  const CriticalCard = ({ module }) => (
    <button
      onClick={() => onModuleClick(module.id)}
      onMouseEnter={() => setActiveModule(module.id)}
      onMouseLeave={() => setActiveModule(null)}
      className={`
        relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-200
        tablet-portrait:p-8 tablet-landscape:p-6
        tablet-portrait:rounded-2xl tablet-landscape:rounded-xl
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        ${activeModule === module.id ? 'scale-[1.02] shadow-2xl' : 'hover:shadow-xl'}
        ${module.id === 'alertas' && module.value > 0 ? 'animate-pulse' : ''}
        min-h-[80px] tablet-portrait:min-h-[120px] tablet-landscape:min-h-[80px]
        transform active:scale-[0.98] hover:scale-[1.01]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        select-none cursor-pointer
      `}
    >
      {/* Indicador de prioridad */}
      <div className={`absolute top-0 left-0 w-full h-1 ${module.bgColor}`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 tablet-portrait:text-base tablet-landscape:text-sm">
            {module.title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${module.color} tablet-portrait:text-4xl tablet-landscape:text-3xl`}>
              {module.value}
            </span>
            {module.trend !== undefined && module.trend !== 0 && (
              <div className="flex items-center space-x-1">
                {module.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-4 tablet-landscape:h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-4 tablet-landscape:h-4" />
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500 tablet-portrait:text-sm tablet-landscape:text-xs">
                  {Math.abs(module.trend)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${module.bgColor} tablet-portrait:p-4 tablet-landscape:p-3`}>
          <module.icon className={`w-6 h-6 ${module.color} tablet-portrait:w-8 tablet-portrait:h-8 tablet-landscape:w-6 tablet-landscape:h-6`} />
        </div>
      </div>
      
      {/* Acción rápida con área táctil expandida */}
      <div className="mt-4 -m-2 p-2 flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
        <span>Ver detalles</span>
        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );

  // Card secundaria optimizada para tablet
  const SecondaryCard = ({ module }) => (
    <button
      onClick={() => onModuleClick(module.id)}
      className={`
        p-4 rounded-lg border transition-all duration-200
        tablet-portrait:p-6 tablet-landscape:p-4
        tablet-portrait:rounded-xl tablet-landscape:rounded-lg
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        hover:shadow-md flex items-center space-x-3
        tablet-portrait:space-x-4 tablet-landscape:space-x-3
        min-h-touch-lg tablet-portrait:min-h-[80px] tablet-landscape:min-h-touch-lg
        touch-button
      `}
    >
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 tablet-portrait:p-3 tablet-landscape:p-2">
        <module.icon className={`w-5 h-5 ${module.color} tablet-portrait:w-6 tablet-portrait:h-6 tablet-landscape:w-5 tablet-landscape:h-5`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs text-gray-600 dark:text-gray-400 tablet-portrait:text-sm tablet-landscape:text-xs">{module.title}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white tablet-portrait:text-xl tablet-landscape:text-lg">{module.value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 tablet-portrait:w-5 tablet-portrait:h-5 tablet-landscape:w-4 tablet-landscape:h-4" />
    </button>
  );

  // Indicador de actividad del sistema
  const SystemActivity = () => (
    <div className="rounded-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Actividad del Sistema
        </h3>
        <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Precintados hoy</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {stats.precintados.valor}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Tiempo promedio</span>
          <span className="text-sm font-semibold text-green-500">
            {stats.tiempoPromedioEspera || 15}m
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Última actualización</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date().toLocaleTimeString('es-UY', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header optimizado para tablet */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 tablet-portrait:px-8 tablet-portrait:py-6 tablet-landscape:px-6 tablet-landscape:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tablet-portrait:text-3xl tablet-landscape:text-2xl">
              Panel Encargados
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 tablet-portrait:text-base tablet-landscape:text-sm">
              Puerto Block Tracker
            </p>
          </div>
          
          <div className="flex items-center gap-2 tablet-portrait:gap-3 tablet-landscape:gap-2">
            <ConnectionStatus darkMode={darkMode} />
            
            <button
              onClick={refreshStats}
              disabled={loading}
              className={`
                min-h-[48px] min-w-[48px] p-3
                rounded-lg transition-all duration-200
                hover:bg-gray-100 dark:hover:bg-gray-700
                active:bg-gray-200 dark:active:bg-gray-600
                transform active:scale-95 hover:scale-[1.02]
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                ${loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                tablet-portrait:p-4 tablet-landscape:p-3
              `}
              aria-label="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} text-gray-600 dark:text-gray-400 tablet-portrait:w-6 tablet-portrait:h-6 tablet-landscape:w-5 tablet-landscape:h-5`} />
            </button>
            
            {/* <ThemeSelector className="tablet-portrait:scale-110 tablet-landscape:scale-100" /> */}
          </div>
        </div>
      </header>

      {/* Contenido principal optimizado para tablet */}
      <main className="p-6 tablet-portrait:p-8 tablet-landscape:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Sección crítica - Información prioritaria */}
          <div className="mb-8 tablet-portrait:mb-10 tablet-landscape:mb-8">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider tablet-portrait:text-base tablet-landscape:text-sm tablet-portrait:mb-6 tablet-landscape:mb-4">
              Información Crítica
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 tablet-portrait:grid-cols-1 tablet-landscape:grid-cols-2">
              {criticalModules.map(module => (
                <CriticalCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          {/* Grid principal adaptado para tablet */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 tablet-portrait:grid-cols-1 tablet-portrait:gap-8 tablet-landscape:grid-cols-3 tablet-landscape:gap-6">
            {/* Módulos secundarios */}
            <div className="lg:col-span-2 tablet-portrait:col-span-1 tablet-landscape:col-span-2">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider tablet-portrait:text-base tablet-landscape:text-sm tablet-portrait:mb-6 tablet-landscape:mb-4">
                Acciones Rápidas
              </h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 tablet-portrait:grid-cols-1 tablet-landscape:grid-cols-3">
                {secondaryModules.map(module => (
                  <SecondaryCard key={module.id} module={module} />
                ))}
              </div>
            </div>

            {/* Panel de actividad */}
            <div className="lg:col-span-1 tablet-portrait:col-span-1 tablet-landscape:col-span-1">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider tablet-portrait:text-base tablet-landscape:text-sm tablet-portrait:mb-6 tablet-landscape:mb-4">
                Resumen
              </h2>
              <SystemActivity />
            </div>
          </div>
        </div>
      </main>
      
      {/* Sistema de alertas automáticas */}
      <AutomaticAlerts darkMode={darkMode} />
      
      {/* Módulo de comunicación con CMO */}
      <CMOCommunication darkMode={darkMode} position="bottom-right" />
      
      {/* Estadísticas operativas en tiempo real */}
      <OperationalStats darkMode={darkMode} position="floating" compact={true} />
      
      {/* Editor de temas */}
      <ThemeEditor />
    </div>
  );
};

export default DashboardCleanFixed;