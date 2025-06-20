import React, { forwardRef } from 'react';

/**
 * Input optimizado para interfaces táctiles
 * - Altura mínima de 48px para fácil interacción
 * - Padding interno de 12px mínimo
 * - Estados hover y focus distintivos
 */
const TouchInput = forwardRef(({
  type = 'text',
  label,
  error,
  helperText,
  icon,
  rightIcon,
  className = '',
  containerClassName = '',
  darkMode = false,
  size = 'medium', // small, medium, large
  ...props
}, ref) => {
  // Tamaños con altura mínima de 48px
  const sizeClasses = {
    small: 'min-h-[48px] px-4 py-3 text-sm',
    medium: 'min-h-[48px] px-4 py-3 text-base',
    large: 'min-h-[56px] px-6 py-4 text-lg'
  };

  // Clases base del input
  const baseClasses = `
    ${sizeClasses[size]}
    w-full
    rounded-lg border-2
    transition-all duration-200
    ${error 
      ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
      : darkMode
        ? 'border-gray-600 focus:border-blue-500 hover:border-gray-500'
        : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
    }
    ${darkMode 
      ? 'bg-gray-800 text-white placeholder-gray-400' 
      : 'bg-white text-gray-900 placeholder-gray-500'
    }
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${darkMode && 'focus:ring-offset-gray-900'}
    disabled:opacity-50 disabled:cursor-not-allowed
    ${icon && 'pl-12'}
    ${rightIcon && 'pr-12'}
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
        {icon && (
          <div className={`
            absolute left-0 top-0 h-full
            min-w-[48px] px-3
            flex items-center justify-center
            pointer-events-none
            ${darkMode ? 'text-gray-400' : 'text-gray-500'}
          `}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`${baseClasses} ${className}`}
          {...props}
        />
        
        {rightIcon && (
          <div className={`
            absolute right-0 top-0 h-full
            min-w-[48px] px-3
            flex items-center justify-center
            ${darkMode ? 'text-gray-400' : 'text-gray-500'}
          `}>
            {rightIcon}
          </div>
        )}
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

TouchInput.displayName = 'TouchInput';

export default TouchInput;