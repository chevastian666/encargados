import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../../utils/helpers';

/**
 * Componente SearchBar - Barra de búsqueda
 * @param {Object} props - Propiedades del componente
 * @param {string} props.value - Valor actual de búsqueda
 * @param {Function} props.onChange - Función al cambiar el valor
 * @param {string} props.placeholder - Placeholder del input
 * @param {boolean} props.darkMode - Si está en modo oscuro
 * @param {Function} props.onClear - Función al limpiar la búsqueda
 * @param {boolean} props.autoFocus - Si debe tener focus automático
 * @param {number} props.debounceTime - Tiempo de debounce en ms
 * @param {boolean} props.showClearButton - Si muestra el botón de limpiar
 * @param {string} props.className - Clases CSS adicionales
 * @param {Function} props.onFocus - Función al enfocar
 * @param {Function} props.onBlur - Función al desenfocar
 */
const SearchBar = ({ 
  value = '', 
  onChange, 
  placeholder = 'Buscar...',
  darkMode = false,
  onClear,
  autoFocus = false,
  debounceTime = 300,
  showClearButton = true,
  className = '',
  onFocus,
  onBlur
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const debouncedOnChange = useRef(null);

  // Crear función debounced
  useEffect(() => {
    if (debounceTime > 0) {
      debouncedOnChange.current = debounce((value) => {
        onChange?.(value);
      }, debounceTime);
    }
  }, [onChange, debounceTime]);

  // Sincronizar valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (debounceTime > 0 && debouncedOnChange.current) {
      debouncedOnChange.current(newValue);
    } else {
      onChange?.(newValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && localValue) {
      handleClear();
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const baseClasses = darkMode 
    ? 'bg-gray-700 text-white placeholder-gray-400' 
    : 'bg-gray-100 text-gray-900 placeholder-gray-500';

  const focusClasses = isFocused
    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
    : '';

  return (
    <div className={`relative ${className}`}>
      <Search className={`
        absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 
        ${darkMode ? 'text-gray-400' : 'text-gray-500'}
        pointer-events-none
      `} />
      
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-10 py-2 rounded-lg
          ${baseClasses} ${focusClasses}
          transition-all duration-200
          focus:outline-none
        `}
        aria-label="Buscar"
      />
      
      {showClearButton && localValue && (
        <button
          onClick={handleClear}
          className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600
            transition-colors
          `}
          aria-label="Limpiar búsqueda"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;