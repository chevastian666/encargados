import React, { useMemo } from 'react';

/**
 * Componente de mini gráfico para mostrar tendencias
 * @param {Object} props - Propiedades del componente
 * @param {Array<number>} props.data - Array de datos para el gráfico
 * @param {string} props.color - Color del gráfico (green, blue, red, orange)
 * @param {number} props.height - Altura del gráfico en píxeles
 * @param {boolean} props.showAxis - Mostrar línea de eje
 * @param {boolean} props.filled - Rellenar el área bajo la línea
 */
const MiniChart = ({ 
  data = [], 
  color = 'blue', 
  height = 40, 
  showAxis = false,
  filled = true 
}) => {
  const { path, fillPath, viewBox, min, max } = useMemo(() => {
    if (!data.length) return { path: '', fillPath: '', viewBox: '0 0 100 40', min: 0, max: 0 };

    const width = 100;
    const padding = 2;
    const chartHeight = height - (padding * 2);
    
    // Encontrar min y max para escalar
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;
    
    // Calcular puntos
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
      return { x, y };
    });
    
    // Crear path para la línea
    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    
    // Crear path para el relleno
    const areaPath = filled ? 
      `${linePath} L ${width} ${height} L 0 ${height} Z` : 
      '';

    return {
      path: linePath,
      fillPath: areaPath,
      viewBox: `0 0 ${width} ${height}`,
      min: minValue,
      max: maxValue
    };
  }, [data, height, filled]);

  const colorClasses = {
    green: { stroke: 'stroke-green-500', fill: 'fill-green-500' },
    blue: { stroke: 'stroke-blue-500', fill: 'fill-blue-500' },
    red: { stroke: 'stroke-red-500', fill: 'fill-red-500' },
    orange: { stroke: 'stroke-orange-500', fill: 'fill-orange-500' },
    purple: { stroke: 'stroke-purple-500', fill: 'fill-purple-500' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg 
        viewBox={viewBox} 
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Línea de eje central opcional */}
        {showAxis && (
          <line
            x1="0"
            y1={height / 2}
            x2="100"
            y2={height / 2}
            className="stroke-gray-300 dark:stroke-gray-600"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        )}
        
        {/* Área rellena */}
        {filled && fillPath && (
          <path
            d={fillPath}
            className={`${colors.fill} opacity-20`}
          />
        )}
        
        {/* Línea del gráfico */}
        <path
          d={path}
          fill="none"
          className={colors.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Punto final (actual) */}
        {data.length > 0 && (
          <circle
            cx="100"
            cy={path.split(' ').slice(-1)[0]}
            r="3"
            className={`${colors.fill} ${colors.stroke}`}
            strokeWidth="1"
            fill="white"
          />
        )}
      </svg>
      
      {/* Valores min/max opcionales */}
      {showAxis && (
        <>
          <span className="absolute top-0 left-0 text-xs text-gray-500 dark:text-gray-400">
            {max.toFixed(0)}
          </span>
          <span className="absolute bottom-0 left-0 text-xs text-gray-500 dark:text-gray-400">
            {min.toFixed(0)}
          </span>
        </>
      )}
    </div>
  );
};

export default MiniChart;