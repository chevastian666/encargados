import React, { useState, useMemo, useEffect } from 'react';
import { Package, MapPin, Clock, ChevronRight, AlertCircle, Truck, Link, Loader2, Sun, Eye, Type, AlertTriangle, ChevronDown, CheckCircle, FileText, Building, User, MessageSquare } from 'lucide-react';
import { Modal, SidePanel } from '../common';
import TransitoDetails from '../TransitoDetails';
import { useApiData, useNotification } from '../../hooks';
import { ESTADOS, DEPOSITOS } from '../../constants/constants';
import apiService from '../../services/api.service';
import TransitoMiniCard from '../cards/TransitoMiniCard';

// Configuración de items por página
const ITEMS_POR_PAGINA_ESTADO = 10;
const ITEMS_POR_PAGINA_MINIATURA = 20;

/**
 * Vista de Tránsitos Pendientes de Precintar - Con Carga Progresiva
 * Ahora con lazy loading para mejor performance con muchos tránsitos
 */
const TransitosPendientesModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [loadingTransitoId, setLoadingTransitoId] = useState(null);
  const [vistaMiniatura, setVistaMiniatura] = useState(() => {
    const saved = localStorage.getItem('vistaMiniatura');
    return saved === 'true';
  });
  
  // Estados para carga progresiva
  const [itemsMostradosPorEstado, setItemsMostradosPorEstado] = useState({
    esperando: ITEMS_POR_PAGINA_ESTADO,
    pasando_soga: ITEMS_POR_PAGINA_ESTADO,
    precintando: ITEMS_POR_PAGINA_ESTADO
  });
  const [itemsMostradosMiniatura, setItemsMostradosMiniatura] = useState(ITEMS_POR_PAGINA_MINIATURA);
  
  // Estados para accesibilidad
  const [altoContraste, setAltoContraste] = useState(() => {
    const saved = localStorage.getItem('altoContraste');
    return saved === 'true';
  });
  
  const [tamanoTexto, setTamanoTexto] = useState(() => {
    const saved = localStorage.getItem('tamanoTexto');
    return saved || 'normal';
  });

  // Reiniciar contadores cuando cambia la vista o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setItemsMostradosPorEstado({
        esperando: ITEMS_POR_PAGINA_ESTADO,
        pasando_soga: ITEMS_POR_PAGINA_ESTADO,
        precintando: ITEMS_POR_PAGINA_ESTADO
      });
      setItemsMostradosMiniatura(ITEMS_POR_PAGINA_MINIATURA);
    }
  }, [isOpen, vistaMiniatura]);

  // Guardar preferencias de accesibilidad
  useEffect(() => {
    localStorage.setItem('vistaMiniatura', vistaMiniatura);
  }, [vistaMiniatura]);

  useEffect(() => {
    localStorage.setItem('altoContraste', altoContraste);
  }, [altoContraste]);

  useEffect(() => {
    localStorage.setItem('tamanoTexto', tamanoTexto);
  }, [tamanoTexto]);

  // Usar el hook de API con polling automático
  const { data: transitosData, loading, error, refetch } = useApiData(
    () => apiService.getTransitosPendientes(),
    [],
    {
      pollingInterval: 30000, // 30 segundos
      wsEventName: 'transit_update',
      cacheKey: 'transitos_pendientes'
    }
  );

  const transitosPendientes = transitosData?.data || [];

  const handleVerDetalles = async (transito) => {
    setLoadingTransitoId(transito.id);
    
    // Simular un pequeño delay mínimo para asegurar que el feedback sea visible
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setSelectedTransito(transito);
    setShowSidePanel(true);
    setLoadingTransitoId(null);
  };

  // Función para mostrar más items en un estado específico
  const mostrarMasItems = (estado) => {
    setItemsMostradosPorEstado(prev => ({
      ...prev,
      [estado]: prev[estado] + ITEMS_POR_PAGINA_ESTADO
    }));
  };

  // Función para mostrar más miniaturas
  const mostrarMasMiniaturas = () => {
    setItemsMostradosMiniatura(prev => prev + ITEMS_POR_PAGINA_MINIATURA);
  };

  // Configuración de tamaños de texto
  const textSizes = {
    pequeno: {
      titulo: 'text-lg',
      subtitulo: 'text-xs',
      texto: 'text-xs',
      boton: 'text-sm py-2',
      icono: 'w-4 h-4',
      badge: 'text-xs px-2 py-1'
    },
    normal: {
      titulo: 'text-xl',
      subtitulo: 'text-sm',
      texto: 'text-sm',
      boton: 'text-base py-3',
      icono: 'w-5 h-5',
      badge: 'text-xs px-3 py-1.5'
    },
    grande: {
      titulo: 'text-2xl',
      subtitulo: 'text-base',
      texto: 'text-base',
      boton: 'text-lg py-3',
      icono: 'w-6 h-6',
      badge: 'text-sm px-3 py-2'
    },
    extragrande: {
      titulo: 'text-3xl',
      subtitulo: 'text-lg',
      texto: 'text-lg',
      boton: 'text-xl py-4',
      icono: 'w-7 h-7',
      badge: 'text-base px-4 py-2'
    }
  };

  const currentSize = textSizes[tamanoTexto] || textSizes.normal;

  // Cambiar tamaño de texto
  const cambiarTamanoTexto = (direccion) => {
    const tamaños = ['pequeno', 'normal', 'grande', 'extragrande'];
    const indexActual = tamaños.indexOf(tamanoTexto);
    let nuevoIndex;
    
    if (direccion === 'aumentar') {
      nuevoIndex = Math.min(indexActual + 1, tamaños.length - 1);
    } else {
      nuevoIndex = Math.max(indexActual - 1, 0);
    }
    
    setTamanoTexto(tamaños[nuevoIndex]);
  };

  // Función para calcular minutos hasta la salida
  const calcularMinutosHastaSalida = (horaSalida) => {
    const ahora = new Date();
    const [horas, minutos] = horaSalida.split(':').map(Number);
    const salida = new Date();
    salida.setHours(horas, minutos, 0, 0);
    
    // Si la hora de salida ya pasó hoy, asumimos que es para mañana
    if (salida < ahora) {
      salida.setDate(salida.getDate() + 1);
    }
    
    const diferencia = salida - ahora;
    return Math.floor(diferencia / 60000); // Convertir a minutos
  };

  // Función para determinar el nivel de urgencia
  const getNivelUrgencia = (minutos) => {
    if (minutos <= 30) return 'critico';
    if (minutos <= 60) return 'urgente';
    if (minutos <= 120) return 'proximo';
    return 'normal';
  };

  // Agrupar por estado y ordenar por hora de salida
  const transitosPorEstado = useMemo(() => {
    const grupos = {
      esperando: [],
      pasando_soga: [],
      precintando: []
    };
    
    // Agregar información de urgencia a cada tránsito
    const transitosConUrgencia = transitosPendientes.map(transito => ({
      ...transito,
      minutosHastaSalida: calcularMinutosHastaSalida(transito.salida),
      nivelUrgencia: getNivelUrgencia(calcularMinutosHastaSalida(transito.salida))
    }));
    
    // Agrupar por estado
    transitosConUrgencia.forEach(transito => {
      if (grupos[transito.estado]) {
        grupos[transito.estado].push(transito);
      }
    });
    
    // Ordenar cada grupo por hora de salida (más próxima primero)
    Object.keys(grupos).forEach(estado => {
      grupos[estado].sort((a, b) => a.minutosHastaSalida - b.minutosHastaSalida);
    });
    
    return grupos;
  }, [transitosPendientes]);

  // Preparar tránsitos para vista miniatura con ordenamiento
  const transitosMiniaturaOrdenados = useMemo(() => {
    return transitosPendientes
      .map(transito => ({
        ...transito,
        minutosHastaSalida: calcularMinutosHastaSalida(transito.salida),
        nivelUrgencia: getNivelUrgencia(calcularMinutosHastaSalida(transito.salida))
      }))
      .sort((a, b) => a.minutosHastaSalida - b.minutosHastaSalida);
  }, [transitosPendientes]);

  // Calcular estadísticas de urgencia
  const estadisticasUrgencia = useMemo(() => {
    const stats = {
      criticos: 0,
      urgentes: 0,
      proximos: 0,
      normales: 0
    };
    
    transitosPendientes.forEach(transito => {
      const minutos = calcularMinutosHastaSalida(transito.salida);
      const nivel = getNivelUrgencia(minutos);
      
      switch(nivel) {
        case 'critico': stats.criticos++; break;
        case 'urgente': stats.urgentes++; break;
        case 'proximo': stats.proximos++; break;
        default: stats.normales++;
      }
    });
    
    return stats;
  }, [transitosPendientes]);

  // Calcular contadores por estado
  const contadoresPorEstado = useMemo(() => {
    return {
      esperando: transitosPorEstado.esperando.length,
      pasando_soga: transitosPorEstado.pasando_soga.length,
      precintando: transitosPorEstado.precintando.length
    };
  }, [transitosPorEstado]);

  // Configuración mejorada de estados con iconos
  const estadosConfig = {
    esperando: {
      icon: Clock,
      gradient: altoContraste ? 'from-white to-gray-200 text-black' : 'from-yellow-500 to-amber-600',
      lightBg: altoContraste ? 'bg-white' : 'bg-yellow-50',
      darkBg: altoContraste ? 'bg-white' : 'bg-yellow-900/20',
      borderColor: altoContraste ? 'border-l-black' : 'border-l-yellow-500',
      badgeColor: altoContraste ? 'bg-gray-200 text-black border-black' : darkMode ? 'bg-yellow-900/50 text-yellow-400 border-yellow-600' : 'bg-yellow-100 text-yellow-700 border-yellow-300'
    },
    pasando_soga: {
      icon: Link,
      gradient: altoContraste ? 'from-white to-gray-200 text-black' : 'from-blue-500 to-blue-600',
      lightBg: altoContraste ? 'bg-white' : 'bg-blue-50',
      darkBg: altoContraste ? 'bg-white' : 'bg-blue-900/20',
      borderColor: altoContraste ? 'border-l-black' : 'border-l-blue-500',
      badgeColor: altoContraste ? 'bg-gray-300 text-black border-black' : darkMode ? 'bg-blue-900/50 text-blue-400 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-300'
    },
    precintando: {
      icon: AlertCircle,
      gradient: altoContraste ? 'from-black to-gray-800 text-white' : 'from-red-500 to-red-600',
      lightBg: altoContraste ? 'bg-gray-100' : 'bg-red-50',
      darkBg: altoContraste ? 'bg-gray-100' : 'bg-red-900/20',
      borderColor: altoContraste ? 'border-l-black' : 'border-l-red-500',
      badgeColor: altoContraste ? 'bg-black text-white border-black' : darkMode ? 'bg-red-900/50 text-red-400 border-red-600' : 'bg-red-100 text-red-700 border-red-300'
    }
  };

  const renderTransitoCard = (transito) => {
    const config = estadosConfig[transito.estado];
    const isLoading = loadingTransitoId === transito.id;
    const minutosHastaSalida = calcularMinutosHastaSalida(transito.salida);
    const nivelUrgencia = getNivelUrgencia(minutosHastaSalida);
    
    return (
      <div 
        key={transito.id}
        className={`
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border rounded-lg shadow-sm
          ${config.borderColor} border-l-4
          ${isLoading ? 'opacity-50' : ''}
          transition-all duration-200 hover:shadow-md
        `}
      >
        <div className="p-4">
          {/* Header con estado actual y urgencia */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {transito.matricula}
                </h3>
                {transito.secundaria && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({transito.secundaria})
                  </span>
                )}
              </div>
              
              {/* Estado actual con icono */}
              <div className="flex items-center gap-2">
                <config.icon className={`w-4 h-4 text-${config.gradient.includes('yellow') ? 'yellow' : config.gradient.includes('blue') ? 'blue' : 'red'}-500`} />
                <span className={`
                  px-2 py-0.5 text-xs rounded font-medium
                  ${config.badgeColor}
                `}>
                  {ESTADOS[transito.estado].label}
                </span>
                
                {/* Indicador de urgencia */}
                {nivelUrgencia !== 'normal' && (
                  <span className={`
                    px-2 py-0.5 text-xs rounded font-medium animate-pulse
                    ${
                      nivelUrgencia === 'critico' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                        : nivelUrgencia === 'urgente'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                    }
                  `}>
                    {nivelUrgencia === 'critico' ? '¡Crítico!' : nivelUrgencia === 'urgente' ? 'Urgente' : 'Próximo'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información del tránsito */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Building className="w-4 h-4" />
              <span className="font-medium">{transito.deposito}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>{transito.chofer}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Salida: {transito.salida}</span>
              {minutosHastaSalida > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (en {Math.floor(minutosHastaSalida / 60)}h {minutosHastaSalida % 60}m)
                </span>
              )}
            </div>
            
            {transito.observaciones && (
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-4 h-4 mt-0.5" />
                <span className="italic">{transito.observaciones}</span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            {/* Acciones rápidas de estado */}
            {transito.estado !== 'precintado' && (
              <div className="grid grid-cols-2 gap-2">
                {/* Botón Listo para precintar */}
                <button
                  onClick={async () => {
                    setLoadingTransitoId(transito.id);
                    try {
                      await apiService.updateTransitoEstado(transito.id, 'listo');
                      addNotification('success', `${transito.matricula} marcado como listo`);
                      refetch();
                    } catch (error) {
                      addNotification('error', 'Error al actualizar estado');
                    } finally {
                      setLoadingTransitoId(null);
                    }
                  }}
                  disabled={isLoading || transito.estado === 'listo'}
                  className={`
                    px-3 py-2 rounded font-medium text-sm
                    transition-all duration-200 flex items-center justify-center gap-1
                    ${
                      transito.estado === 'listo'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
                    }
                    disabled:opacity-50
                  `}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Listo</span>
                </button>
                
                {/* Botón Pasando soga */}
                <button
                  onClick={async () => {
                    setLoadingTransitoId(transito.id);
                    try {
                      await apiService.updateTransitoEstado(transito.id, 'pasando_soga');
                      addNotification('info', `${transito.matricula} pasando soga`);
                      refetch();
                    } catch (error) {
                      addNotification('error', 'Error al actualizar estado');
                    } finally {
                      setLoadingTransitoId(null);
                    }
                  }}
                  disabled={isLoading || transito.estado === 'pasando_soga'}
                  className={`
                    px-3 py-2 rounded font-medium text-sm
                    transition-all duration-200 flex items-center justify-center gap-1
                    ${
                      transito.estado === 'pasando_soga'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                    }
                    disabled:opacity-50
                  `}
                >
                  <Link className="w-4 h-4" />
                  <span>Pasando soga</span>
                </button>
              </div>
            )}
            
            {/* Botones secundarios */}
            <div className="flex gap-2">
              {/* Botón de problema */}
              <button
                onClick={() => {
                  // Aquí iría la lógica para marcar con problema
                  addNotification('warning', 'Función en desarrollo');
                }}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium text-sm transition-all duration-200 active:scale-95"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
              
              {/* Botón Ver más */}
              <button
                onClick={() => handleVerDetalles(transito)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
              >
                <Eye className="w-4 h-4" />
                <span>Ver detalles</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente botón "Ver más"
  const BotonVerMas = ({ onClick, itemsRestantes, isLastButton }) => (
    <button
      onClick={onClick}
      className={`
        w-full py-4 px-6
        ${altoContraste 
          ? 'bg-white border-2 border-black text-black hover:bg-gray-100' 
          : darkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }
        rounded-lg
        font-medium
        transition-all duration-200
        flex items-center justify-center gap-2
        touch-manipulation
        select-none
        active:scale-95
        shadow-md hover:shadow-lg
        ${isLastButton ? 'mb-0' : 'mb-4'}
      `}
    >
      <span>Ver {Math.min(itemsRestantes, ITEMS_POR_PAGINA_ESTADO)} más</span>
      <ChevronDown className="w-5 h-5" />
      <span className="text-sm opacity-75">({itemsRestantes} restantes)</span>
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tránsitos Pendientes de Precintar"
      size="large"
    >
      <div className={`${altoContraste ? 'bg-white text-black' : darkMode ? 'text-white' : 'text-gray-900'} select-none`}>
        {/* Header con controles mejorados */}
        <div className="mb-6 space-y-4">
          {/* Indicador de urgencia general */}
          {(estadisticasUrgencia.criticos > 0 || estadisticasUrgencia.urgentes > 0) && (
            <div className={`
              p-4 rounded-lg 
              ${estadisticasUrgencia.criticos > 0 
                ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' 
                : 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500'
              }
              ${estadisticasUrgencia.criticos > 0 ? 'animate-pulse' : ''}
            `}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`
                  ${currentSize.icono} 
                  ${estadisticasUrgencia.criticos > 0 ? 'text-red-600' : 'text-orange-600'}
                `} />
                <div className="flex-1">
                  <p className={`${currentSize.texto} font-bold ${estadisticasUrgencia.criticos > 0 ? 'text-red-700' : 'text-orange-700'}`}>
                    {estadisticasUrgencia.criticos > 0 
                      ? `¡${estadisticasUrgencia.criticos} tránsito${estadisticasUrgencia.criticos > 1 ? 's' : ''} crítico${estadisticasUrgencia.criticos > 1 ? 's' : ''} por salir!`
                      : `${estadisticasUrgencia.urgentes} tránsito${estadisticasUrgencia.urgentes > 1 ? 's' : ''} urgente${estadisticasUrgencia.urgentes > 1 ? 's' : ''}`
                    }
                  </p>
                  {estadisticasUrgencia.criticos > 0 && estadisticasUrgencia.urgentes > 0 && (
                    <p className={`${currentSize.subtitulo} text-orange-600`}>
                      + {estadisticasUrgencia.urgentes} tránsito{estadisticasUrgencia.urgentes > 1 ? 's' : ''} urgente{estadisticasUrgencia.urgentes > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Controles de accesibilidad */}
          <div className="space-y-4">
            {/* Fila de controles de accesibilidad */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Toggle Alto Contraste */}
              <button
                onClick={() => setAltoContraste(!altoContraste)}
                className={`
                  px-4 py-2 rounded-lg font-medium flex items-center gap-2
                  ${altoContraste 
                    ? 'bg-black text-white border-2 border-black' 
                    : darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }
                  transition-colors
                  touch-manipulation
                  select-none
                  active:scale-95
                `}
                title="Activar/Desactivar modo alto contraste"
              >
                {altoContraste ? <Eye className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span className="hidden sm:inline">{altoContraste ? 'Contraste Normal' : 'Alto Contraste'}</span>
              </button>
              
              {/* Controles de tamaño de texto */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => cambiarTamanoTexto('disminuir')}
                  disabled={tamanoTexto === 'pequeno'}
                  className={`
                    px-2 sm:px-3 py-2 rounded font-bold flex items-center
                    ${tamanoTexto === 'pequeno' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                    }
                    transition-all
                    select-none
                  `}
                  title="Disminuir tamaño de texto"
                >
                  <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs ml-1">A-</span>
                </button>
                
                <span className="px-2 text-xs sm:text-sm font-medium min-w-[70px] sm:min-w-[90px] text-center">
                  {tamanoTexto === 'pequeno' && 'Pequeño'}
                  {tamanoTexto === 'normal' && 'Normal'}
                  {tamanoTexto === 'grande' && 'Grande'}
                  {tamanoTexto === 'extragrande' && 'XL'}
                </span>
                
                <button
                  onClick={() => cambiarTamanoTexto('aumentar')}
                  disabled={tamanoTexto === 'extragrande'}
                  className={`
                    px-2 sm:px-3 py-2 rounded font-bold flex items-center
                    ${tamanoTexto === 'extragrande' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                    }
                    transition-all
                    select-none
                  `}
                  title="Aumentar tamaño de texto"
                >
                  <Type className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm ml-1">A+</span>
                </button>
              </div>
            </div>
            
            {/* Fila de contadores */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* Contador total */}
              <div className={`
                px-5 py-3 rounded-lg 
                ${altoContraste ? 'bg-black text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-100'} 
                shadow-md select-none
              `}>
                <div className="flex items-center gap-4">
                  <div>
                    <span className={`text-2xl font-bold ${altoContraste ? 'text-white' : 'text-blue-500'}`}>
                      {transitosPendientes.length}
                    </span>
                    <span className={`ml-2 ${altoContraste ? 'text-white' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      activos
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Desglose por estado */}
              <div className="flex gap-2">
                {/* Esperando */}
                {contadoresPorEstado.esperando > 0 && (
                  <div className={`
                    px-3 py-2 rounded-lg border-2 flex items-center gap-2
                    ${estadosConfig.esperando.badgeColor}
                    select-none shadow-sm
                  `}>
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{contadoresPorEstado.esperando}</span>
                    <span className="text-xs hidden sm:inline">Esperando</span>
                  </div>
                )}
                
                {/* Pasando Soga */}
                {contadoresPorEstado.pasando_soga > 0 && (
                  <div className={`
                    px-3 py-2 rounded-lg border-2 flex items-center gap-2
                    ${estadosConfig.pasando_soga.badgeColor}
                    select-none shadow-sm
                  `}>
                    <Link className="w-4 h-4" />
                    <span className="font-semibold">{contadoresPorEstado.pasando_soga}</span>
                    <span className="text-xs hidden sm:inline">Pasando</span>
                  </div>
                )}
                
                {/* Precintando */}
                {contadoresPorEstado.precintando > 0 && (
                  <div className={`
                    px-3 py-2 rounded-lg border-2 flex items-center gap-2
                    ${estadosConfig.precintando.badgeColor}
                    select-none shadow-sm
                    ${!altoContraste && 'animate-pulse'}
                  `}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">{contadoresPorEstado.precintando}</span>
                    <span className="text-xs hidden sm:inline">Precintando</span>
                  </div>
                )}
              </div>
              
              {/* Toggle vista miniatura */}
              <button
                onClick={() => setVistaMiniatura(!vistaMiniatura)}
                className={`
                  px-4 py-2 rounded-lg font-medium
                  ${altoContraste 
                    ? 'bg-black text-white border-2 border-black' 
                    : darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-black'
                  }
                  transition-colors
                  touch-manipulation
                  select-none
                  active:scale-95
                `}
              >
                {vistaMiniatura ? "Ver por estado" : "Vista miniatura"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenido principal con scroll optimizado */}
        <div className="touch-manipulation">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${altoContraste ? 'border-black' : 'border-blue-500'}`}></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error al cargar los tránsitos</p>
              <button 
                onClick={refetch}
                className={`
                  px-5 py-3 
                  ${altoContraste 
                    ? 'bg-black text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
                  }
                  font-medium
                  rounded-lg
                  touch-manipulation
                  select-none
                  active:scale-95
                `}
              >
                Reintentar
              </button>
            </div>
          ) : transitosPendientes.length === 0 ? (
            <div className={`text-center py-12 ${altoContraste ? 'text-black' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Package className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className={currentSize.texto}>No hay tránsitos pendientes de precintar</p>
            </div>
          ) : vistaMiniatura ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto overscroll-contain">
                {transitosMiniaturaOrdenados
                  .slice(0, itemsMostradosMiniatura)
                  .map((transito) => (
                    <TransitoMiniCard
                      key={transito.id}
                      transito={transito}
                      darkMode={darkMode}
                      altoContraste={altoContraste}
                      tamanoTexto={tamanoTexto}
                      onClick={() => handleVerDetalles(transito)}
                      className="touch-manipulation"
                      isLoading={loadingTransitoId === transito.id}
                      urgencia={transito.nivelUrgencia}
                      minutosHastaSalida={transito.minutosHastaSalida}
                    />
                  ))}
              </div>
              
              {/* Botón "Ver más" para miniaturas */}
              {itemsMostradosMiniatura < transitosMiniaturaOrdenados.length && (
                <div className="mt-6">
                  <button
                    onClick={mostrarMasMiniaturas}
                    className={`
                      w-full py-4 px-6
                      ${altoContraste 
                        ? 'bg-white border-2 border-black text-black hover:bg-gray-100' 
                        : darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }
                      rounded-lg
                      font-medium
                      transition-all duration-200
                      flex items-center justify-center gap-2
                      touch-manipulation
                      select-none
                      active:scale-95
                      shadow-md hover:shadow-lg
                    `}
                  >
                    <span>Ver {Math.min(transitosMiniaturaOrdenados.length - itemsMostradosMiniatura, ITEMS_POR_PAGINA_MINIATURA)} más</span>
                    <ChevronDown className="w-5 h-5" />
                    <span className="text-sm opacity-75">({transitosMiniaturaOrdenados.length - itemsMostradosMiniatura} restantes)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 overflow-y-auto overscroll-contain">
              {Object.entries(transitosPorEstado).map(([estado, transitos], index) => {
                if (transitos.length === 0) return null;
                
                const config = estadosConfig[estado];
                const Icon = config.icon;
                const itemsMostrados = itemsMostradosPorEstado[estado];
                const transitosMostrados = transitos.slice(0, itemsMostrados);
                const tienesMas = transitos.length > itemsMostrados;

                return (
                  <div key={estado} className="group">
                    {/* Barra de estado ancha y coloreada */}
                    <div className={`
                      relative overflow-hidden
                      ${altoContraste 
                        ? estado === 'precintando' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-black border-4 border-t-4 border-l-4 border-r-4 border-black'
                        : `bg-gradient-to-r ${config.gradient}`
                      }
                      rounded-t-xl
                      p-4
                      shadow-lg
                      transform transition-transform duration-300
                      ${!altoContraste && 'group-hover:scale-[1.01]'}
                    `}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Icono del estado */}
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            ${altoContraste 
                              ? estado === 'precintando' 
                                ? 'bg-white/20' 
                                : 'bg-black text-white' 
                              : 'bg-white/20 backdrop-blur-sm'
                            }
                          `}>
                            <Icon className={`w-7 h-7 ${altoContraste && estado !== 'precintando' ? 'text-white' : 'text-white'}`} />
                          </div>
                          
                          <div>
                            <h3 className={`${currentSize.titulo} font-bold ${altoContraste ? (estado === 'precintando' ? 'text-white' : 'text-black') : 'text-white drop-shadow-md'}`}>
                              {ESTADOS[estado].label}
                            </h3>
                            <p className={`${currentSize.subtitulo} ${altoContraste ? (estado === 'precintando' ? 'text-white' : 'text-black') : 'text-white/90'}`}>
                              {transitos.length} {transitos.length === 1 ? 'tránsito' : 'tránsitos'} en este estado
                            </p>
                          </div>
                        </div>
                        
                        {/* Badge con contador animado */}
                        <div className={`
                          px-4 py-2 rounded-full
                          ${altoContraste 
                            ? estado === 'precintando' 
                              ? 'bg-white text-black' 
                              : 'bg-black text-white' 
                            : 'bg-white/20 backdrop-blur-sm'
                          }
                        `}>
                          <span className={`text-3xl font-bold ${altoContraste ? '' : 'text-white drop-shadow-md'}`}>
                            {transitos.length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Patrón decorativo (solo si no está en alto contraste) */}
                      {!altoContraste && (
                        <>
                          <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                          <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        </>
                      )}
                    </div>
                    
                    {/* Contenedor de tarjetas con fondo sutil */}
                    <div className={`
                      ${altoContraste 
                        ? 'bg-gray-100 border-4 border-t-0 border-black' 
                        : darkMode ? config.darkBg : config.lightBg
                      }
                      rounded-b-xl
                      p-6
                      -mt-1
                      ${!altoContraste && `border-x-2 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    `}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {transitosMostrados.map(renderTransitoCard)}
                      </div>
                      
                      {/* Botón "Ver más" por estado */}
                      {tienesMas && (
                        <div className="mt-6">
                          <BotonVerMas 
                            onClick={() => mostrarMasItems(estado)}
                            itemsRestantes={transitos.length - itemsMostrados}
                            isLastButton={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Panel lateral con detalles */}
      <SidePanel
        isOpen={showSidePanel && selectedTransito}
        onClose={() => {
          setShowSidePanel(false);
          setSelectedTransito(null);
        }}
        title={`Detalles - ${selectedTransito?.matricula}`}
      >
        {selectedTransito && (
          <TransitoDetails 
            transito={selectedTransito} 
            darkMode={darkMode}
            altoContraste={altoContraste}
            tamanoTexto={tamanoTexto}
            onUpdate={() => {
              refetch();
              setShowSidePanel(false);
            }}
          />
        )}
      </SidePanel>
    </Modal>
  );
};

export default TransitosPendientesModal;