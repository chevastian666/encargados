import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

/**
 * Componente FilterPanel - Panel de filtros
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.filters - Array de configuración de filtros
 * @param {Function} props.onFilterChange - Función al cambiar un filtro
 * @param {boolean} props.darkMode - Si está en modo oscuro
 * @param {boolean} props.collapsible - Si el panel es colapsable
 * @param {boolean} props.defaultCollapsed - Estado inicial colapsado
 * @param {Function} props.onReset - Función para resetear filtros
 * @param {boolean} props.showAppliedCount - Si muestra contador de filtros aplicados
 */
const FilterPanel = ({ 
  filters = [], 
  onFilterChange,
  darkMode = false,
  collapsible = false,
  defaultCollapsed = false,
  onReset,
  showAppliedCount = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  // Contar filtros aplicados
  const appliedFiltersCount = filters.filter(filter => {
    if (filter.type === 'select' || filter.type === 'radio') {
      return filter.value && filter.value !== '';
    }
    if (filter.type === 'checkbox') {
      return filter.value === true;
    }
    if (filter.type === 'range') {
      return filter.value[0] !== filter.min || filter.value[1] !== filter.max;
    }
    return filter.value && filter.value !== '';
  }).length;

  const handleReset = () => {
    filters.forEach(filter => {
      if (filter.type === 'select' || filter.type === 'radio' || filter.type === 'text') {
        onFilterChange(filter.name, '');
      } else if (filter.type === 'checkbox') {
        onFilterChange(filter.name, false);
      } else if (filter.type === 'range') {
        onFilterChange(filter.name, [filter.min, filter.max]);
      }
    });
    onReset?.();
  };

  const renderFilter = (filter) => {
    const baseInputClasses = `
      w-full px-3 py-2 rounded-lg transition-colors
      ${darkMode 
        ? 'bg-gray-700 text-white border-gray-600' 
        : 'bg-white text-gray-900 border-gray-300'
      }
      border focus:outline-none focus:ring-2 focus:ring-blue-500
    `;

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">{filter.placeholder || 'Todos'}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'text':
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            placeholder={filter.placeholder}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            className={baseInputClasses}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm">{filter.placeholder || filter.label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {filter.options.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={filter.name}
                  value={option.value}
                  checked={filter.value === option.value}
                  onChange={(e) => onFilterChange(filter.name, e.target.value)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{filter.value[0]}</span>
              <span>{filter.value[1]}</span>
            </div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={filter.value[0]}
              onChange={(e) => onFilterChange(filter.name, [e.target.value, filter.value[1]])}
              className="w-full"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const panelClasses = `
    p-4 rounded-lg shadow-lg
    ${darkMode ? 'bg-gray-800' : 'bg-white'}
    ${collapsible && isCollapsed ? 'pb-0' : ''}
  `;

  return (
    <div className={panelClasses}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Filtros</h3>
          {showAppliedCount && appliedFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
              {appliedFiltersCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {appliedFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className={`
                text-sm px-3 py-1 rounded transition-colors
                ${darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Limpiar
            </button>
          )}
          
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                p-1 rounded transition-colors
                ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              `}
              aria-label={isCollapsed ? 'Expandir filtros' : 'Colapsar filtros'}
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
      
      {(!collapsible || !isCollapsed) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.name}>
              {filter.type !== 'checkbox' && (
                <label className="block text-sm font-medium mb-1">
                  {filter.label}
                </label>
              )}
              {renderFilter(filter)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;