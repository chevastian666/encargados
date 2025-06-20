import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Clock, Package, 
  Truck, Timer, ChevronDown, User, Calendar,
  Zap, X, AlertCircle
} from 'lucide-react';

/**
 * Componente para cambio rápido de estado con motivos predefinidos
 * Optimizado para tablets con botones grandes y flujo ágil
 */
const QuickStatusChange = ({ 
  transito, 
  onStatusChange, 
  darkMode = false,
  compact = false 
}) => {
  const [showReasons, setShowReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef(null);

  // Motivos predefinidos por categoría
  const reasonsByCategory = {
    no_listo: {
      title: 'Motivos - No está listo',
      icon: AlertTriangle,
      color: 'orange',
      reasons: [
        { id: 'falta_enlonar', text: 'Falta enlonar', icon: Package },
        { id: 'sigue_cargando', text: 'Sigue cargando', icon: Truck },
        { id: 'falta_documentacion', text: 'Falta documentación', icon: AlertCircle },
        { id: 'problema_mecanico', text: 'Problema mecánico', icon: AlertTriangle },
        { id: 'sin_chofer', text: 'Sin chofer asignado', icon: User },
        { id: 'esperando_mercaderia', text: 'Esperando mercadería', icon: Clock }
      ]
    },
    no_sale_hoy: {
      title: 'Motivos - No sale hoy',
      icon: Calendar,
      color: 'gray',
      reasons: [
        { id: 'postergado_cliente', text: 'Postergado por cliente', icon: User },
        { id: 'falta_pago', text: 'Falta pago/autorización', icon: AlertCircle },
        { id: 'cambio_programacion', text: 'Cambio de programación', icon: Calendar },
        { id: 'clima_adverso', text: 'Clima adverso', icon: AlertTriangle },
        { id: 'feriado_destino', text: 'Feriado en destino', icon: Calendar },
        { id: 'orden_judicial', text: 'Orden judicial/fiscal', icon: AlertTriangle }
      ]
    },
    con_problema: {
      title: 'Motivos - Con problema',
      icon: AlertTriangle,
      color: 'red',
      reasons: [
        { id: 'doc_incorrecta', text: 'Documentación incorrecta', icon: AlertCircle },
        { id: 'carga_mal_estibada', text: 'Carga mal estibada', icon: Package },
        { id: 'exceso_peso', text: 'Exceso de peso', icon: AlertTriangle },
        { id: 'problema_aduana', text: 'Problema con aduana', icon: AlertCircle },
        { id: 'mercaderia_prohibida', text: 'Mercadería prohibida', icon: X },
        { id: 'inspeccion_fisica', text: 'Requiere inspección física', icon: AlertTriangle }
      ]
    }
  };

  // Estados rápidos disponibles
  const quickStates = [
    {
      id: 'listo',
      label: 'Listo para precintar',
      icon: CheckCircle,
      color: 'green',
      bgClass: 'bg-green-500 hover:bg-green-600',
      darkBgClass: 'dark:bg-green-600 dark:hover:bg-green-700',
      requiresReason: false
    },
    {
      id: 'pasando_soga',
      label: 'Pasando soga',
      icon: Package,
      color: 'blue',
      bgClass: 'bg-blue-500 hover:bg-blue-600',
      darkBgClass: 'dark:bg-blue-600 dark:hover:bg-blue-700',
      requiresReason: false
    },
    {
      id: 'no_listo',
      label: 'No está listo',
      icon: Clock,
      color: 'orange',
      bgClass: 'bg-orange-500 hover:bg-orange-600',
      darkBgClass: 'dark:bg-orange-600 dark:hover:bg-orange-700',
      requiresReason: true,
      reasonCategory: 'no_listo'
    },
    {
      id: 'no_sale_hoy',
      label: 'No sale hoy',
      icon: Timer,
      color: 'gray',
      bgClass: 'bg-gray-500 hover:bg-gray-600',
      darkBgClass: 'dark:bg-gray-600 dark:hover:bg-gray-700',
      requiresReason: true,
      reasonCategory: 'no_sale_hoy'
    },
    {
      id: 'con_problema',
      label: 'Con problema',
      icon: AlertTriangle,
      color: 'red',
      bgClass: 'bg-red-500 hover:bg-red-600',
      darkBgClass: 'dark:bg-red-600 dark:hover:bg-red-700',
      requiresReason: true,
      reasonCategory: 'con_problema'
    }
  ];

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowReasons(false);
        setSelectedReason(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar cambio de estado
  const handleStateChange = async (newState, reason = null) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Obtener información del usuario (en producción vendría del contexto de auth)
      const userData = {
        usuario: 'Usuario Actual', // TODO: Obtener del contexto
        timestamp: new Date().toISOString()
      };
      
      await onStatusChange({
        transitoId: transito.id,
        oldState: transito.estado,
        newState: newState.id,
        reason: reason,
        ...userData
      });
      
      // Cerrar menú de razones
      setShowReasons(false);
      setSelectedReason(null);
      
    } catch (error) {
      console.error('Error cambiando estado:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar clic en estado que requiere razón
  const handleStateClick = (state) => {
    if (state.requiresReason) {
      setSelectedReason(state);
      setShowReasons(true);
    } else {
      handleStateChange(state);
    }
  };

  // Obtener estado actual
  const currentState = quickStates.find(s => s.id === transito.estado);

  if (compact) {
    // Vista compacta - Solo botones de acción rápida
    return (
      <div className="flex items-center space-x-2">
        {transito.estado === 'esperando' && (
          <button
            onClick={() => handleStateClick(quickStates.find(s => s.id === 'listo'))}
            disabled={isProcessing}
            className={`
              p-2 rounded-lg text-white transition-all duration-200
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              bg-green-500 hover:bg-green-600
              dark:bg-green-600 dark:hover:bg-green-700
            `}
            title="Marcar como listo"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowReasons(!showReasons)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
            title="Más opciones"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          
          {showReasons && (
            <QuickReasonDropdown 
              transito={transito}
              onSelect={handleStateChange}
              darkMode={darkMode}
              quickStates={quickStates}
            />
          )}
        </div>
      </div>
    );
  }

  // Vista completa
  return (
    <div className="space-y-3">
      {/* Estado actual */}
      <div className={`
        p-3 rounded-lg flex items-center justify-between
        ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}
      `}>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Estado actual:
          </span>
          {currentState && (
            <div className="flex items-center space-x-2">
              <currentState.icon className={`w-5 h-5 text-${currentState.color}-500`} />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentState.label}
              </span>
            </div>
          )}
        </div>
        <Zap className="w-4 h-4 text-yellow-500" />
      </div>

      {/* Botones de cambio rápido */}
      <div className="grid grid-cols-2 gap-2">
        {quickStates
          .filter(state => state.id !== transito.estado)
          .map(state => (
            <button
              key={state.id}
              onClick={() => handleStateClick(state)}
              disabled={isProcessing}
              className={`
                p-3 rounded-lg text-white font-medium
                flex items-center justify-center space-x-2
                transition-all duration-200 transform active:scale-95
                ${state.bgClass} ${darkMode ? state.darkBgClass : ''}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                min-h-[48px]
              `}
            >
              <state.icon className="w-5 h-5" />
              <span className="text-sm">{state.label}</span>
            </button>
          ))}
      </div>

      {/* Dropdown de razones */}
      {showReasons && selectedReason && (
        <div 
          ref={dropdownRef}
          className={`
            absolute z-50 mt-2 w-full max-w-sm
            rounded-lg shadow-xl border
            ${darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
            animate-in slide-in-from-top-2 fade-in duration-200
          `}
        >
          <div className={`
            p-4 border-b
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <h4 className={`
              font-semibold flex items-center space-x-2
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}>
              <selectedReason.icon className={`w-5 h-5 text-${selectedReason.color}-500`} />
              <span>{reasonsByCategory[selectedReason.reasonCategory].title}</span>
            </h4>
          </div>
          
          <div className="p-2 max-h-80 overflow-y-auto">
            {reasonsByCategory[selectedReason.reasonCategory].reasons.map(reason => (
              <button
                key={reason.id}
                onClick={() => handleStateChange(selectedReason, reason)}
                className={`
                  w-full p-3 rounded-lg text-left
                  flex items-center space-x-3
                  transition-all duration-200
                  ${darkMode 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <reason.icon className={`w-5 h-5 text-${selectedReason.color}-500`} />
                <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                  {reason.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de dropdown rápido para vista compacta
const QuickReasonDropdown = ({ transito, onSelect, darkMode, quickStates }) => {
  return (
    <div className={`
      absolute right-0 top-full mt-2 w-64
      rounded-lg shadow-xl border z-50
      ${darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
      animate-in slide-in-from-top-2 fade-in duration-200
    `}>
      <div className="p-2">
        {quickStates
          .filter(state => state.id !== transito.estado)
          .map(state => (
            <button
              key={state.id}
              onClick={() => onSelect(state)}
              className={`
                w-full p-3 rounded-lg text-left
                flex items-center space-x-3
                transition-all duration-200
                ${darkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <state.icon className={`w-5 h-5 text-${state.color}-500`} />
              <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                {state.label}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default QuickStatusChange;