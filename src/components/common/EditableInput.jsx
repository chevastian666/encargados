import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

/**
 * Componente EditableInput - Input editable inline
 * @param {Object} props - Propiedades del componente
 * @param {string|number} props.value - Valor actual
 * @param {Function} props.onSave - Función al guardar el valor
 * @param {string} props.type - Tipo de input (text, number, email, etc)
 * @param {boolean} props.darkMode - Si está en modo oscuro
 * @param {Function} props.validator - Función de validación
 * @param {string} props.placeholder - Placeholder cuando está vacío
 * @param {boolean} props.required - Si el campo es requerido
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.showEditIcon - Si muestra el ícono de editar
 * @param {Function} props.formatter - Función para formatear el valor mostrado
 */
const EditableInput = ({ 
  value,
  onSave,
  type = "text",
  darkMode = false,
  validator,
  placeholder = "Click para editar",
  required = false,
  className = "",
  showEditIcon = true,
  formatter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    // Validación requerida
    if (required && !editValue) {
      setError('Este campo es requerido');
      return;
    }

    // Validación personalizada
    if (validator) {
      const validationResult = validator(editValue);
      if (validationResult !== true) {
        setError(validationResult || 'Valor inválido');
        return;
      }
    }

    try {
      await onSave(editValue);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
    if (error) setError(''); // Limpiar error al escribir
  };

  const displayValue = formatter ? formatter(value) : value;

  if (!isEditing) {
    return (
      <div 
        className={`
          flex items-center gap-2 group cursor-pointer
          ${className}
        `}
        onClick={() => setIsEditing(true)}
      >
        <span className={`
          ${!value ? 'text-gray-400 italic' : ''}
          ${darkMode ? 'text-white' : 'text-gray-900'}
        `}>
          {displayValue || placeholder}
        </span>
        {showEditIcon && (
          <button
            className={`
              p-1 rounded opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            aria-label="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className="flex-1">
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`
            w-full px-2 py-1 rounded border
            ${darkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-900 border-gray-300'
            }
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2
          `}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : undefined}
        />
        {error && (
          <p 
            id="error-message"
            className="text-red-500 text-xs mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          className={`
            p-1 rounded transition-colors
            ${darkMode 
              ? 'text-green-400 hover:bg-green-900' 
              : 'text-green-600 hover:bg-green-100'
            }
          `}
          aria-label="Guardar"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className={`
            p-1 rounded transition-colors
            ${darkMode 
              ? 'text-red-400 hover:bg-red-900' 
              : 'text-red-600 hover:bg-red-100'
            }
          `}
          aria-label="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EditableInput;