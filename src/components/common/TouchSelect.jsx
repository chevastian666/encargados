import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select optimizado para interfaces táctiles
 * - Altura mínima de 48px
 * - Área táctil expandida
 * - Ícono de dropdown más grande
 */
const TouchSelect = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  className = '',
  containerClassName = '',
  darkMode = false,
  size = 'medium',
  placeholder = 'Seleccionar...',
  ...props
}, ref) => {
  // Tamaños con altura mínima de 48px
  const sizeClasses = {
    small: 'min-h-[48px] px-4 py-3 pr-12 text-sm',
    medium: 'min-h-[48px] px-4 py-3 pr-12 text-base',
    large: 'min-h-[56px] px-6 py-4 pr-14 text-lg'
  };

  // Clases base del select
  const baseClasses = `
    ${sizeClasses[size]}
    w-full
    rounded-lg border-2
    transition-all duration-200
    appearance-none
    cursor-pointer
    ${error 
      ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
      : darkMode
        ? 'border-gray-600 focus:border-blue-500 hover:border-gray-500'
        : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
    }
    ${darkMode 
      ? 'bg-gray-800 text-white' 
      : 'bg-white text-gray-900'
    }
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${darkMode && 'focus:ring-offset-gray-900'}
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className={`touch-form-group ${containerClassName}`}>
      {label && (
        <label className={`
          block text-sm font-medium mb-2
          ${darkMode ? 'text-gray-200' : 'text-gray-700'}
          ${size === 'large' && 'text-base mb-3'}
        `}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option 
              key={option.value || index} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className={`
          absolute right-0 top-0 h-full
          min-w-[48px] px-3
          flex items-center justify-center
          pointer-events-none
          ${darkMode ? 'text-gray-400' : 'text-gray-500'}
        `}>
          <ChevronDown className={`
            ${size === 'small' && 'w-5 h-5'}
            ${size === 'medium' && 'w-5 h-5'}
            ${size === 'large' && 'w-6 h-6'}
          `} />
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`
          mt-2 text-sm
          ${error 
            ? 'text-red-500' 
            : darkMode 
              ? 'text-gray-400' 
              : 'text-gray-600'
          }
        `}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

TouchSelect.displayName = 'TouchSelect';

export default TouchSelect;