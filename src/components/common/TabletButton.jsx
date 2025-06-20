import React from 'react';

/**
 * Botón optimizado para uso en tablets industriales
 * - Tamaño mínimo de 48px para uso con guantes
 * - Estados visuales claros
 * - Feedback táctil mejorado
 */
const TabletButton = ({
  children,
  onClick,
  variant = 'primary', // primary, secondary, danger, success, warning
  size = 'medium', // small, medium, large
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  darkMode = false,
  ...props
}) => {
  // Tamaños optimizados para tablet - garantizando mínimo 48px
  const sizeClasses = {
    small: 'px-4 py-3 text-sm min-h-touch min-w-touch tablet-portrait:text-base tablet-landscape:text-sm',
    medium: 'px-6 py-3 text-base min-h-touch-lg min-w-touch-lg tablet-portrait:text-lg tablet-landscape:text-base',
    large: 'px-8 py-4 text-lg min-h-touch-xl min-w-touch-xl tablet-portrait:text-xl tablet-landscape:text-lg'
  };

  // Variantes de color
  const getVariantClasses = () => {
    if (disabled) {
      return darkMode
        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }

    const variants = {
      primary: darkMode
        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
        : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
      
      secondary: darkMode
        ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 border border-gray-600'
        : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300',
      
      danger: darkMode
        ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
        : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
      
      success: darkMode
        ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
        : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white',
      
      warning: darkMode
        ? 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white'
        : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white'
    };

    return variants[variant] || variants.primary;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${fullWidth ? 'w-full' : ''}
        min-h-[48px] min-w-[48px] p-3
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        transform active:scale-95 hover:scale-[1.02]
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variant === 'primary' && 'focus:ring-blue-500 hover:shadow-lg active:shadow-sm'}
        ${variant === 'secondary' && 'focus:ring-gray-500 hover:shadow-md active:shadow-sm'}
        ${variant === 'danger' && 'focus:ring-red-500 hover:shadow-lg active:shadow-sm'}
        ${variant === 'success' && 'focus:ring-green-500 hover:shadow-lg active:shadow-sm'}
        ${variant === 'warning' && 'focus:ring-yellow-500 hover:shadow-lg active:shadow-sm'}
        select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        tablet-portrait:rounded-xl tablet-landscape:rounded-lg
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default TabletButton;