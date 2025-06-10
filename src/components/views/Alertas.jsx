import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, Check, X, Clock, Info, Filter, AlertCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Modal, FilterPanel, Tooltip } from '../common';
import { useApiData, useNotification, useConnection } from '../../hooks';
import { PRIORIDAD_ALERTA, TIPO_ALERTA } from '../../constants/constants';
import { getRelativeTime } from '../../utils/helpers';
import apiService from '../../services/api.service';

/**
 * Hook para detectar gestos de swipe
 */
const useSwipeGesture = (onSwipeLeft, onSwipeRight, enabled = true) => {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const elementRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    if (!enabled) return;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!enabled || !isSwiping) return;
    touchEndX.current = e.targetTouches[0].clientX;
    const offset = touchEndX.current - touchStartX.current;
    
    // Limitar el swipe a un rango razonable
    const limitedOffset = Math.max(-150, Math.min(150, offset));
    setSwipeOffset(limitedOffset);
  };

  const handleTouchEnd = () => {
    if (!enabled || !isSwiping) return;
    
    const swipeThreshold = 75; // píxeles mínimos para activar el swipe
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
        // Vibración háptica si está disponible
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
        // Vibración háptica si está disponible
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }
    
    // Reset
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return {
    elementRef,
    swipeOffset,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    }
  };
};

/**
 * Vista de Centro de Alertas Operativas con Swipe
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.darkMode - Si está en modo oscuro
 */
const AlertasModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const { isOnline, addPendingOperation } = useConnection();
  const [userName] = useState('Juan Pérez'); // Simulación del usuario actual
  const [showFilters, setShowFilters] = useState(false);
  const [showResueltas, setShowResueltas] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [quickResolveMode, setQuickResolveMode] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [filters, setFilters] = useState({
    tipo: '',
    prioridad: '',
    tiempo: ''
  });
  
  // Detectar si es un dispositivo táctil
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Usar el hook de API con polling automático
  const { data: alertasData, loading, error, refetch } = useApiData(
    () => apiService.getAlertas(),
    [],
    {
      pollingInterval: 20000, // 20 segundos - más frecuente para alertas
      wsEventName: 'alert_update',
      cacheKey: 'alertas'
    }
  );

  const alertas = alertasData?.data || [];

  const handleResolverAlerta = async (alertaId, isQuickResolve = false) => {
    try {
      // Animación de resolución
      setResolvingAlert(alertaId);
      
      // Vibración háptica para confirmación
      if (navigator.vibrate && isQuickResolve) {
        navigator.vibrate([50, 30, 50]); // Patrón de vibración
      }
      
      if (!isOnline) {
        addPendingOperation({
          type: 'RESOLVER_ALERTA',
          data: { alertaId, userId: userName },
          execute: async () => {
            await apiService.resolverAlerta(alertaId, userName);
          }
        });
        
        addNotification('warning', 'Alerta marcada como resuelta localmente. Se sincronizará cuando vuelva la conexión.');
      } else {
        await apiService.resolverAlerta(alertaId, userName);
        addNotification('success', isQuickResolve ? '✅ Alerta resuelta rápidamente' : 'Alerta marcada como resuelta');
        refetch();
      }
      
      setTimeout(() => {
        setResolvingAlert(null);
      }, 500);
    } catch (error) {
      addNotification('error', 'Error al resolver la alerta');
      console.error(error);
      setResolvingAlert(null);
    }
  };

  const handleIgnorarAlerta = async (alertaId) => {
    // Vibración háptica
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    addNotification('info', 'Alerta ignorada temporalmente');
    // En producción, esto también debería actualizar el estado en el backend
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Separar alertas activas y resueltas
  const { alertasActivas, alertasResueltas } = useMemo(() => {
    const activas = [];
    const resueltas = [];
    
    alertas.forEach(alerta => {
      if (alerta.resuelto) {
        resueltas.push(alerta);
      } else {
        activas.push(alerta);
      }
    });
    
    return { alertasActivas: activas, alertasResueltas: resueltas };
  }, [alertas]);

  // Filtrar alertas activas
  const alertasFiltradas = useMemo(() => {
    return alertasActivas.filter(alerta => {
      if (filters.tipo && alerta.tipo !== filters.tipo) return false;
      if (filters.prioridad && alerta.prioridad !== filters.prioridad) return false;
      
      // Filtro por tiempo (últimas X horas)
      if (filters.tiempo) {
        const horasAtras = parseInt(filters.tiempo);
        const tiempoAlerta = new Date(alerta.timestamp || Date.now() - 60 * 60 * 1000);
        const ahora = new Date();
        const diferencia = (ahora - tiempoAlerta) / (1000 * 60 * 60);
        if (diferencia > horasAtras) return false;
      }
      
      return true;
    });
  }, [alertasActivas, filters]);

  const filterConfig = [
    {
      name: 'tipo',
      label: 'Tipo de Alerta',
      type: 'select',
      value: filters.tipo,
      options: Object.values(TIPO_ALERTA).map(tipo => ({
        value: tipo,
        label: tipo
      }))
    },
    {
      name: 'prioridad',
      label: 'Prioridad',
      type: 'select',
      value: filters.prioridad,
      options: Object.keys(PRIORIDAD_ALERTA).map(key => ({
        value: key,
        label: PRIORIDAD_ALERTA[key].label
      }))
    },
    {
      name: 'tiempo',
      label: 'Tiempo',
      type: 'select',
      value: filters.tiempo,
      options: [
        { value: '1', label: 'Última hora' },
        { value: '6', label: 'Últimas 6 horas' },
        { value: '24', label: 'Último día' },
        { value: '168', label: 'Última semana' }
      ]
    }
  ];

  const AlertaCard = ({ alerta, resuelto = false }) => {
    const isExpanded = expandedAlert === alerta.id;
    const prioridad = PRIORIDAD_ALERTA[alerta.prioridad];
    const isResolving = resolvingAlert === alerta.id;
    
    // Hook de swipe para resolver alertas
    const { elementRef, swipeOffset, isSwiping, handlers } = useSwipeGesture(
      null, // swipe left
      () => handleResolverAlerta(alerta.id, true), // swipe right para resolver
      !resuelto && isTouchDevice && quickResolveMode
    );
    
    return (
      <div 
        ref={elementRef}
        className={`
          relative overflow-hidden
          ${isSwiping ? '' : 'transition-all duration-300'}
          ${isResolving ? 'scale-95 opacity-50' : ''}
        `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        {...(quickResolveMode && !resuelto ? handlers : {})}
      >
        {/* Indicador de swipe */}
        {swipeOffset > 0 && !resuelto && (
          <div className={`
            absolute inset-y-0 left-0 flex items-center justify-center
            bg-green-500 text-white px-4
            transition-all duration-300
          `}
          style={{ 
            width: Math.min(swipeOffset, 150) + 'px',
            opacity: Math.min(swipeOffset / 75, 1)
          }}>
            <Check className="w-6 h-6" />
            {swipeOffset > 75 && <span className="ml-2">Resolver</span>}
          </div>
        )}
        
        <div className={`
          relative p-6 rounded-xl shadow-lg
          ${darkMode ? 'bg-gray-700' : 'bg-white'}
          ${!resuelto ? 'hover:shadow-xl transform hover:-translate-y-1' : 'opacity-75'}
          ${!resuelto ? `border-l-4 ${prioridad.borderColor}` : ''}
          ${isResolving ? 'bg-green-100 dark:bg-green-900' : ''}
        `}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {!resuelto && (
                  <div className={`p-2 rounded-lg ${prioridad.bgLight} dark:bg-opacity-20`}>
                    <AlertTriangle className={`w-5 h-5 ${prioridad.textColor}`} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${resuelto 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300' 
                        : `${prioridad.color} text-white`
                      }
                    `}>
                      {alerta.tipo}
                    </span>
                    {!resuelto && (
                      <span className={`text-xs font-medium ${prioridad.textColor}`}>
                        Prioridad {prioridad.label}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {alerta.mensaje}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock className="w-4 h-4" />
                      {alerta.tiempo}
                    </span>
                    {resuelto && alerta.resueltoBy && (
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Check className="w-4 h-4 text-green-500" />
                        Resuelto por {alerta.resueltoBy}
                      </span>
                    )}
                  </div>
                  
                  {/* Detalles expandibles */}
                  {(alerta.detalles || alerta.accionRequerida) && (
                    <button
                      onClick={() => setExpandedAlert(isExpanded ? null : alerta.id)}
                      className={`
                        mt-2 text-sm flex items-center gap-1
                        ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
                      `}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? 'Ver menos' : 'Ver más detalles'}
                    </button>
                  )}
                  
                  {isExpanded && (
                    <div className={`
                      mt-3 p-3 rounded-lg
                      ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
                    `}>
                      {alerta.detalles && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Detalles:</p>
                          <p className="text-sm">{alerta.detalles}</p>
                        </div>
                      )}
                      {alerta.accionRequerida && (
                        <div>
                          <p className="text-sm font-medium mb-1">Acción requerida:</p>
                          <p className="text-sm">{alerta.accionRequerida}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {!resuelto && (
              <div className="flex gap-2">
                {/* Botón de resolución rápida para tablets */}
                {isTouchDevice && !quickResolveMode && (
                  <button 
                    onClick={() => handleResolverAlerta(alerta.id, true)}
                    className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:shadow-lg flex items-center justify-center transform hover:scale-110"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                )}
                
                {/* Botones tradicionales */}
                <div className={`flex gap-2 ${isTouchDevice && quickResolveMode ? 'opacity-50' : ''}`}>
                  <Tooltip text="Marcar como resuelta">
                    <button 
                      onClick={() => handleResolverAlerta(alerta.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Resolver</span>
                    </button>
                  </Tooltip>
                  
                  <Tooltip text="Ignorar temporalmente">
                    <button 
                      onClick={() => handleIgnorarAlerta(alerta.id)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Ignorar</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
          
          {/* Indicador de resolución */}
          {isResolving && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Alertas Operativas"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header con estadísticas */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
            <p className="text-3xl font-bold text-orange-500">{alertasActivas.length}</p>
            <p className="text-sm">Alertas Activas</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
            <p className="text-3xl font-bold text-red-500">
              {alertasActivas.filter(a => a.prioridad === 'alta').length}
            </p>
            <p className="text-sm">Prioridad Alta</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
            <p className="text-3xl font-bold text-green-500">{alertasResueltas.length}</p>
            <p className="text-sm">Resueltas Hoy</p>
          </div>
        </div>
        
        {/* Botones de control */}
        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2
                ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                transition-colors
              `}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
            
            {/* Modo de resolución rápida para tablets */}
            {isTouchDevice && (
              <button
                onClick={() => setQuickResolveMode(!quickResolveMode)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2
                  ${quickResolveMode 
                    ? 'bg-green-500 text-white' 
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }
                  transition-colors
                `}
              >
                <CheckCircle className="w-4 h-4" />
                Modo Swipe
              </button>
            )}
          </div>
          
          {alertasResueltas.length > 0 && (
            <button
              onClick={() => setShowResueltas(!showResueltas)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {showResueltas ? 'Ocultar' : 'Mostrar'} resueltas ({alertasResueltas.length})
            </button>
          )}
        </div>
        
        {/* Instrucciones del modo swipe */}
        {isTouchDevice && quickResolveMode && (
          <div className={`
            mb-4 p-3 rounded-lg flex items-center gap-2
            ${darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-100 text-blue-700'}
          `}>
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Desliza una alerta hacia la derecha para resolverla rápidamente ➡️
            </p>
          </div>
        )}
        
        {/* Panel de filtros */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel
              filters={filterConfig}
              onFilterChange={handleFilterChange}
              darkMode={darkMode}
              onReset={() => setFilters({ tipo: '', prioridad: '', tiempo: '' })}
            />
          </div>
        )}
        
        {/* Lista de alertas */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error al cargar las alertas</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alertas Activas */}
            <div>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Alertas Activas
              </h2>
              
              {alertasFiltradas.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No hay alertas activas con los filtros aplicados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertasFiltradas.map(alerta => (
                    <AlertaCard key={alerta.id} alerta={alerta} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Alertas Resueltas */}
            {showResueltas && alertasResueltas.length > 0 && (
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Alertas Resueltas
                </h2>
                
                <div className="space-y-4">
                  {alertasResueltas.map(alerta => (
                    <AlertaCard key={alerta.id} alerta={alerta} resuelto />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isOnline && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Sin conexión - Las acciones se sincronizarán cuando vuelva la conexión
            </p>
          </div>
        )}
        
        {/* Botón flotante de resolución rápida global */}
        {isTouchDevice && alertasFiltradas.length > 0 && !quickResolveMode && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setQuickResolveMode(true)}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
            >
              <CheckCircle className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AlertasModal;