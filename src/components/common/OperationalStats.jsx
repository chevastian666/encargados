import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Package, 
  Truck, Clock, Activity, BarChart3, Target,
  CheckCircle, XCircle
} from 'lucide-react';
import statisticsService from '../../services/statistics.service';

/**
 * Panel de estadísticas operativas en tiempo real
 * Muestra métricas dinámicas con tendencias y comparaciones
 */
const OperationalStats = ({ 
  darkMode = false, 
  position = 'sidebar', // 'sidebar' | 'footer' | 'floating'
  compact = false 
}) => {
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [animateValue, setAnimateValue] = useState(false);

  useEffect(() => {
    // Suscribirse a actualizaciones de estadísticas
    const unsubscribe = statisticsService.subscribe((newStats) => {
      setStats(newStats);
      setLastUpdate(new Date());
      
      // Animar cuando cambian los valores
      setAnimateValue(true);
      setTimeout(() => setAnimateValue(false), 600);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!stats) {
    return (
      <div className={`
        animate-pulse
        ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
        ${position === 'sidebar' ? 'h-full' : 'h-32'}
        rounded-lg
      `} />
    );
  }

  // Componente de métrica individual
  const MetricCard = ({ 
    title, 
    value, 
    comparison, 
    trend, 
    icon: Icon, 
    color = 'blue',
    suffix = '',
    subtitle = null 
  }) => {
    const trendIcons = {
      up: { icon: TrendingUp, emoji: '🔺', class: 'text-green-500' },
      down: { icon: TrendingDown, emoji: '🔻', class: 'text-red-500' },
      equal: { icon: Minus, emoji: '➖', class: 'text-gray-400' }
    };

    const TrendIcon = trendIcons[trend]?.icon || Minus;
    const trendEmoji = trendIcons[trend]?.emoji || '➖';
    const trendClass = trendIcons[trend]?.class || 'text-gray-400';

    const colorClasses = {
      blue: {
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        text: darkMode ? 'text-blue-400' : 'text-blue-600',
        border: 'border-blue-500/20'
      },
      green: {
        bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
        text: darkMode ? 'text-green-400' : 'text-green-600',
        border: 'border-green-500/20'
      },
      amber: {
        bg: darkMode ? 'bg-amber-900/20' : 'bg-amber-50',
        text: darkMode ? 'text-amber-400' : 'text-amber-600',
        border: 'border-amber-500/20'
      },
      purple: {
        bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        text: darkMode ? 'text-purple-400' : 'text-purple-600',
        border: 'border-purple-500/20'
      }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div className={`
        ${compact ? 'p-3' : 'p-4'}
        rounded-lg border
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        ${animateValue ? 'scale-105' : 'scale-100'}
        transition-all duration-300
      `}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${colors.bg}`}>
              <Icon className={`w-4 h-4 ${colors.text}`} />
            </div>
            <h4 className={`
              ${compact ? 'text-xs' : 'text-sm'} 
              font-medium
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}
            `}>
              {title}
            </h4>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`text-xs ${trendClass}`}>{trendEmoji}</span>
            <TrendIcon className={`w-3 h-3 ${trendClass}`} />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className={`
              ${compact ? 'text-2xl' : 'text-3xl'}
              font-bold
              ${darkMode ? 'text-white' : 'text-gray-900'}
              ${animateValue ? 'animate-pulse' : ''}
            `}>
              {value}
            </span>
            <span className={`
              ${compact ? 'text-sm' : 'text-base'}
              ml-1
              ${darkMode ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {suffix}
            </span>
          </div>
          
          {comparison && (
            <div className="text-right">
              <p className={`
                ${compact ? 'text-xs' : 'text-sm'}
                font-medium
                ${comparison.value >= 0 ? 'text-green-500' : 'text-red-500'}
              `}>
                {comparison.text}
              </p>
              <p className={`
                text-xs
                ${darkMode ? 'text-gray-500' : 'text-gray-400'}
              `}>
                vs ayer
              </p>
            </div>
          )}
        </div>

        {subtitle && (
          <p className={`
            text-xs mt-2
            ${darkMode ? 'text-gray-500' : 'text-gray-500'}
          `}>
            {subtitle}
          </p>
        )}
      </div>
    );
  };

  // Componente de eficiencia
  const EfficiencyIndicator = () => {
    const efficiency = stats.rendimiento.eficiencia;
    const isGood = efficiency >= 90;
    const isWarning = efficiency >= 70 && efficiency < 90;
    
    return (
      <div className={`
        ${compact ? 'p-3' : 'p-4'}
        rounded-lg border
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`
            ${compact ? 'text-xs' : 'text-sm'} 
            font-medium
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Eficiencia del día
          </h4>
          <Activity className={`
            w-4 h-4
            ${isGood ? 'text-green-500' : isWarning ? 'text-yellow-500' : 'text-red-500'}
          `} />
        </div>

        <div className="relative">
          <div className={`
            w-full h-2 rounded-full
            ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
          `}>
            <div 
              className={`
                h-full rounded-full transition-all duration-500
                ${isGood ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'}
              `}
              style={{ width: `${Math.min(100, efficiency)}%` }}
            />
          </div>
          <p className={`
            text-center mt-2 font-bold
            ${compact ? 'text-lg' : 'text-xl'}
            ${darkMode ? 'text-white' : 'text-gray-900'}
          `}>
            {efficiency}%
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className={`
            text-xs
            ${darkMode ? 'text-gray-500' : 'text-gray-500'}
          `}>
            Por hora: {stats.rendimiento.porHora}
          </p>
          <p className={`
            text-xs
            ${darkMode ? 'text-gray-500' : 'text-gray-500'}
          `}>
            Proyección: {stats.rendimiento.proyeccionDiaria}
          </p>
        </div>
      </div>
    );
  };

  // Vista sidebar (vertical)
  if (position === 'sidebar') {
    return (
      <div className={`
        ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
        p-4 rounded-lg h-full
      `}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`
            text-sm font-semibold
            ${darkMode ? 'text-white' : 'text-gray-900'}
          `}>
            Estadísticas del Día
          </h3>
          <BarChart3 className={`
            w-4 h-4
            ${darkMode ? 'text-gray-400' : 'text-gray-600'}
          `} />
        </div>

        <div className="space-y-3">
          <MetricCard
            title="Precintados"
            value={stats.precintados.hoy}
            comparison={stats.precintados.comparacionAyer}
            trend={stats.precintados.tendenciaAyer}
            icon={Package}
            color="blue"
          />

          <MetricCard
            title="Desprecintados"
            value={stats.desprecintados.hoy}
            comparison={stats.desprecintados.comparacionAyer}
            trend={stats.desprecintados.tendenciaAyer}
            icon={Truck}
            color="green"
          />

          <MetricCard
            title="Tiempo Promedio"
            value={stats.tiempoPromedio.hoy}
            comparison={stats.tiempoPromedio.comparacionAyer}
            trend={stats.tiempoPromedio.tendencia}
            icon={Clock}
            color="amber"
            suffix="min"
          />

          <EfficiencyIndicator />
        </div>

        {lastUpdate && (
          <p className={`
            text-xs text-center mt-4
            ${darkMode ? 'text-gray-600' : 'text-gray-400'}
          `}>
            Actualizado {lastUpdate.toLocaleTimeString('es-UY', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    );
  }

  // Vista footer (horizontal)
  if (position === 'footer') {
    return (
      <div className={`
        ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}
        border-t px-6 py-3
      `}>
        <div className="grid grid-cols-4 gap-4 max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Precintados
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.precintados.hoy}
                </span>
                <span className={`
                  text-xs
                  ${stats.precintados.comparacionAyer.value >= 0 ? 'text-green-500' : 'text-red-500'}
                `}>
                  ({stats.precintados.comparacionAyer.text})
                </span>
                <span className="text-xs">
                  {stats.precintados.tendenciaAyer === 'up' ? '🔺' : 
                   stats.precintados.tendenciaAyer === 'down' ? '🔻' : '➖'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <Truck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Desprecintados
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.desprecintados.hoy}
                </span>
                <span className={`
                  text-xs
                  ${stats.desprecintados.comparacionAyer.value >= 0 ? 'text-green-500' : 'text-red-500'}
                `}>
                  ({stats.desprecintados.comparacionAyer.text})
                </span>
                <span className="text-xs">
                  {stats.desprecintados.tendenciaAyer === 'up' ? '🔺' : 
                   stats.desprecintados.tendenciaAyer === 'down' ? '🔻' : '➖'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tiempo Promedio
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.tiempoPromedio.hoy}m
                </span>
                <span className={`
                  text-xs
                  ${stats.tiempoPromedio.comparacionAyer.value <= 0 ? 'text-green-500' : 'text-red-500'}
                `}>
                  ({stats.tiempoPromedio.comparacionAyer.text})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Eficiencia
              </p>
              <div className="flex items-center space-x-2">
                <span className={`
                  text-xl font-bold
                  ${stats.rendimiento.eficiencia >= 90 ? 'text-green-500' : 
                    stats.rendimiento.eficiencia >= 70 ? 'text-yellow-500' : 'text-red-500'}
                `}>
                  {stats.rendimiento.eficiencia}%
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Proy: {stats.rendimiento.proyeccionDiaria}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista floating (compacta)
  return (
    <div className={`
      fixed bottom-20 left-6 z-30
      ${darkMode ? 'bg-gray-900' : 'bg-white'}
      rounded-lg shadow-lg p-3
      border ${darkMode ? 'border-gray-800' : 'border-gray-200'}
      max-w-xs
    `}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Operaciones Hoy
        </h4>
        <Activity className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Precintados
          </p>
          <div className="flex items-center space-x-1">
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.precintados.hoy}
            </span>
            <span className={`
              text-xs
              ${stats.precintados.comparacionAyer.value >= 0 ? 'text-green-500' : 'text-red-500'}
            `}>
              {stats.precintados.comparacionAyer.text}
            </span>
          </div>
        </div>

        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Eficiencia
          </p>
          <div className="flex items-center space-x-1">
            <span className={`
              text-lg font-bold
              ${stats.rendimiento.eficiencia >= 90 ? 'text-green-500' : 
                stats.rendimiento.eficiencia >= 70 ? 'text-yellow-500' : 'text-red-500'}
            `}>
              {stats.rendimiento.eficiencia}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalStats;