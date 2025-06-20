import React from 'react';
import { Package, MapPin, Clock, Loader2 } from 'lucide-react';
import { ESTADOS } from '../../constants/constants';

const TransitoMiniCard = ({ 
  transito, 
  darkMode, 
  onClick, 
  className = '', 
  isLoading = false,
  altoContraste = false,
  tamanoTexto = 'normal' 
}) => {
  // Configuración de tamaños de texto
  const textSizes = {
    pequeno: {
      matricula: 'text-sm',
      secundaria: 'text-xs',
      info: 'text-xs',
      badge: 'text-xs px-1 py-0.5',
      icono: 'w-3 h-3'
    },
    normal: {
      matricula: 'text-base',
      secundaria: 'text-xs',
      info: 'text-xs',
      badge: 'text-xs px-2 py-1',
      icono: 'w-4 h-4'
    },
    grande: {
      matricula: 'text-lg',
      secundaria: 'text-sm',
      info: 'text-sm',
      badge: 'text-sm px-2 py-1',
      icono: 'w-5 h-5'
    },
    extragrande: {
      matricula: 'text-xl',
      secundaria: 'text-base',
      info: 'text-base',
      badge: 'text-base px-3 py-1.5',
      icono: 'w-6 h-6'
    }
  };

  const currentSize = textSizes[tamanoTexto] || textSizes.normal;

  // Configuración de colores según el estado y modo
  const getEstadoStyles = () => {
    if (altoContraste) {
      switch (transito.estado) {
        case 'esperando':
          return {
            bg: 'bg-white',
            badge: 'bg-gray-700 text-white',
            border: 'border-gray-700'
          };
        case 'pasando_soga':
          return {
            bg: 'bg-white',
            badge: 'bg-gray-500 text-white',
            border: 'border-gray-500'
          };
        case 'precintando':
          return {
            bg: 'bg-gray-100',
            badge: 'bg-black text-white',
            border: 'border-black border-2'
          };
        default:
          return {
            bg: 'bg-white',
            badge: 'bg-gray-600 text-white',
            border: 'border-gray-600'
          };
      }
    } else {
      switch (transito.estado) {
        case 'esperando':
          return {
            bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
            badge: 'bg-yellow-500 text-white',
            border: 'border-yellow-500'
          };
        case 'pasando_soga':
          return {
            bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
            badge: 'bg-blue-500 text-white',
            border: 'border-blue-500'
          };
        case 'precintando':
          return {
            bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
            badge: 'bg-red-500 text-white animate-pulse',
            border: 'border-red-500'
          };
        default:
          return {
            bg: darkMode ? 'bg-gray-800' : 'bg-gray-50',
            badge: 'bg-gray-500 text-white',
            border: 'border-gray-500'
          };
      }
    }
  };

  const styles = getEstadoStyles();

  return (
    <div
      onClick={onClick}
      className={`
        relative
        ${altoContraste ? 'bg-white border-2 border-black' : `${styles.bg} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        ${styles.border} border-l-4
        rounded-lg
        p-3
        cursor-pointer
        hover:shadow-lg
        transition-all duration-200
        hover:scale-105
        touch-manipulation
        select-none
        ${isLoading ? 'opacity-75' : ''}
        ${className}
      `}
    >
      {/* Indicador de estado crítico */}
      {transito.estado === 'precintando' && !altoContraste && (
        <div className="absolute -top-1 -right-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}

      {/* Spinner de carga */}
      {isLoading && (
        <div className="absolute top-2 right-2">
          <Loader2 className={`${currentSize.icono} animate-spin ${altoContraste ? 'text-black' : 'text-gray-500'}`} />
        </div>
      )}

      {/* Contenido de la tarjeta */}
      <div className="space-y-2">
        {/* Matrícula */}
        <h4 className={`${currentSize.matricula} font-bold ${altoContraste ? 'text-black' : darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
          {transito.matricula}
        </h4>

        {/* Secundaria */}
        <p className={`${currentSize.secundaria} ${altoContraste ? 'text-black' : darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
          {transito.secundaria}
        </p>

        {/* Badge de estado */}
        <span className={`
          inline-block
          ${currentSize.badge}
          rounded-full
          font-semibold
          ${styles.badge}
          ${altoContraste && transito.estado === 'precintando' ? 'border border-white' : ''}
        `}>
          {ESTADOS[transito.estado].label}
        </span>

        {/* Información adicional */}
        <div className={`space-y-1 mt-2 ${altoContraste ? 'text-black' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div className={`${currentSize.info} flex items-center gap-1`}>
            <MapPin className={currentSize.icono} />
            <span className="truncate">{transito.deposito}</span>
          </div>
          
          {transito.tipo === 'contenedor' && (
            <div className={`${currentSize.info} flex items-center gap-1`}>
              <Package className={currentSize.icono} />
              <span className="truncate">{transito.codigo}</span>
            </div>
          )}
          
          <div className={`${currentSize.info} flex items-center gap-1 font-semibold`}>
            <Clock className={currentSize.icono} />
            <span>{transito.salida}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitoMiniCard;
