import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Truck, MapPin, Database, 
  Sun, Moon, RefreshCw, ChevronRight, Clock,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { useDarkMode, useDashboardStats, useNotification, useRealtimeUpdates } from '../../hooks';
import { ConnectionStatus } from '../common';
import AutomaticAlerts from '../common/AutomaticAlerts';
import CMOCommunication from '../common/CMOCommunication';

/**
 * Dashboard con diseño limpio y minimalista
 * Prioriza información crítica sin saturar la interfaz
 */
const DashboardCleanFixed = ({ onModuleClick }) => {
  const [darkMode, setDarkMode, toggleDarkMode] = useDarkMode(true);
  const { stats, loading, refreshStats, updateStats } = useDashboardStats();
  const { showNotification } = useNotification();
  const [activeModule, setActiveModule] = useState(null);
  
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

  // Card de módulo crítico simplificada
  const CriticalCard = ({ module }) => (
    <button
      onClick={() => onModuleClick(module.id)}
      onMouseEnter={() => setActiveModule(module.id)}
      onMouseLeave={() => setActiveModule(null)}
      className={`
        relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-200
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        ${activeModule === module.id ? 'scale-105 shadow-xl' : 'hover:shadow-lg'}
        ${module.id === 'alertas' && module.value > 0 ? 'animate-pulse' : ''}
      `}
    >
      {/* Indicador de prioridad */}
      <div className={`absolute top-0 left-0 w-full h-1 ${module.bgColor}`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {module.title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${module.color}`}>
              {module.value}
            </span>
            {module.trend !== undefined && module.trend !== 0 && (
              <div className="flex items-center space-x-1">
                {module.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {Math.abs(module.trend)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${module.bgColor}`}>
          <module.icon className={`w-6 h-6 ${module.color}`} />
        </div>
      </div>
      
      {/* Acción rápida */}
      <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
        <span>Ver detalles</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </button>
  );

  // Card secundaria minimalista
  const SecondaryCard = ({ module }) => (
    <button
      onClick={() => onModuleClick(module.id)}
      className={`
        p-4 rounded-lg border transition-all duration-200
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        hover:shadow-md flex items-center space-x-3
      `}
    >
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
        <module.icon className={`w-5 h-5 ${module.color}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs text-gray-600 dark:text-gray-400">{module.title}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">{module.value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
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
      {/* Header simplificado */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Panel Encargados
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Puerto Block Tracker
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectionStatus darkMode={darkMode} />
            
            <button
              onClick={refreshStats}
              disabled={loading}
              className={`
                p-2 rounded-lg transition-all duration-200
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} text-gray-600 dark:text-gray-400`} />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? 
                <Sun className="w-5 h-5 text-yellow-400" /> : 
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Sección crítica - Información prioritaria */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
              Información Crítica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalModules.map(module => (
                <CriticalCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Módulos secundarios */}
            <div className="lg:col-span-2">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {secondaryModules.map(module => (
                  <SecondaryCard key={module.id} module={module} />
                ))}
              </div>
            </div>

            {/* Panel de actividad */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
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
    </div>
  );
};

export default DashboardCleanFixed;