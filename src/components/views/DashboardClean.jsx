import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Package, AlertTriangle, Truck, MapPin, Database, 
  Sun, Moon, RefreshCw, ChevronRight, Clock,
  TrendingUp, TrendingDown, Minus, Activity
} from 'lucide-react';
import { useDarkMode, useDashboardStats, useNotification } from '../../hooks';
import { ConnectionStatus } from '../common';

/**
 * Dashboard con diseño limpio y minimalista
 * Prioriza información crítica sin saturar la interfaz
 */
const DashboardClean = ({ onModuleClick }) => {
  const [darkMode, setDarkMode, toggleDarkMode] = useDarkMode(true); // Usar el array completo del hook
  const { stats, loading, refreshStats } = useDashboardStats();
  const { success, error, warning, info } = useNotification();
  const [activeModule, setActiveModule] = useState(null);
  
  // Asegurar que el dark mode esté aplicado al montar
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Estilos principales simplificados
  const styles = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    text: {
      primary: darkMode ? 'text-white' : 'text-gray-900',
      secondary: darkMode ? 'text-gray-400' : 'text-gray-600',
      muted: darkMode ? 'text-gray-500' : 'text-gray-400'
    }
  };

  // Módulos críticos (solo los esenciales)
  const criticalModules = [
    {
      id: 'transitos',
      title: 'Tránsitos Pendientes',
      value: stats.enEspera.valor,
      trend: stats.enEspera.vsAyer,
      icon: Package,
      color: 'text-blue-500',
      bgColor: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
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
        ? (darkMode ? 'bg-red-900/20' : 'bg-red-50')
        : (darkMode ? 'bg-green-900/20' : 'bg-green-50'),
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
        ${styles.card} ${styles.border}
        ${activeModule === module.id ? 'scale-105 shadow-xl' : 'hover:shadow-lg'}
        ${module.id === 'alertas' && module.value > 0 ? 'animate-pulse' : ''}
      `}
    >
      {/* Indicador de prioridad */}
      <div className={`absolute top-0 left-0 w-full h-1 ${module.bgColor}`} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${styles.text.secondary} mb-1`}>
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
                <span className={`text-xs ${styles.text.muted}`}>
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
      <div className={`mt-4 flex items-center text-sm ${styles.text.secondary}`}>
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
        ${styles.card} ${styles.border}
        hover:shadow-md flex items-center space-x-3
      `}
    >
      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <module.icon className={`w-5 h-5 ${module.color}`} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-xs ${styles.text.secondary}`}>{module.title}</p>
        <p className={`text-lg font-semibold ${styles.text.primary}`}>{module.value}</p>
      </div>
      <ChevronRight className={`w-4 h-4 ${styles.text.muted}`} />
    </button>
  );

  // Indicador de actividad del sistema
  const SystemActivity = () => (
    <div className={`rounded-lg p-4 ${styles.card} ${styles.border} border`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${styles.text.secondary}`}>
          Actividad del Sistema
        </h3>
        <Activity className={`w-4 h-4 ${styles.text.muted}`} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-xs ${styles.text.secondary}`}>Precintados hoy</span>
          <span className={`text-sm font-semibold ${styles.text.primary}`}>
            {stats.precintados.valor}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${styles.text.secondary}`}>Tiempo promedio</span>
          <span className={`text-sm font-semibold text-green-500`}>
            {stats.tiempoPromedioEspera || 15}m
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${styles.text.secondary}`}>Última actualización</span>
          <span className={`text-xs ${styles.text.muted}`}>
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
    <div className={`min-h-screen ${styles.bg} transition-colors duration-300`}>
      {/* Header simplificado */}
      <header className={`${styles.card} border-b ${styles.border} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${styles.text.primary}`}>
              Panel Encargados
            </h1>
            <p className={`text-sm ${styles.text.secondary}`}>
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
                ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${styles.text.secondary}`} />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              `}
              aria-label={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? 
                <Sun className="w-5 h-5 text-yellow-400" /> : 
                <Moon className={`w-5 h-5 ${styles.text.secondary}`} />
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
            <h2 className={`text-sm font-medium ${styles.text.secondary} mb-4 uppercase tracking-wider`}>
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
              <h2 className={`text-sm font-medium ${styles.text.secondary} mb-4 uppercase tracking-wider`}>
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
              <h2 className={`text-sm font-medium ${styles.text.secondary} mb-4 uppercase tracking-wider`}>
                Resumen
              </h2>
              <SystemActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClean;