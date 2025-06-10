import React, { useState, useMemo, useEffect } from 'react';
import { Package, MapPin, Clock, ChevronRight, AlertCircle, Truck, Link, Loader2, Sun, Eye, Type, AlertTriangle } from 'lucide-react';
import { Modal, SidePanel } from '../common';
import TransitoDetails from '../TransitoDetails';
import { useApiData } from '../../hooks';
import { ESTADOS, DEPOSITOS } from '../../constants/constants';
import apiService from '../../services/api.service';
import TransitoMiniCard from '../cards/TransitoMiniCard';

/**
 * Vista de Tránsitos Pendientes de Precintar - Optimizada para Touch y Accesibilidad
 * Con mejoras visuales para separación por estado y modo alto contraste
 * NUEVO: Priorización visual por hora de salida y alertas de urgencia
 */
const TransitosPendientesModal = ({ isOpen, onClose, darkMode }) => {
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [loadingTransitoId, setLoadingTransitoId] = useState(null);
  const [vistaMiniatura, setVistaMiniatura] = useState(() => {
    const saved = localStorage.getItem('vistaMiniatura');
    return saved === 'true';
  });
  
  // Estados para accesibilidad
  const [altoContraste, setAltoContraste] = useState(() => {
    const saved = localStorage.getItem('altoContraste');
    return saved === 'true';
  });
  
  const [tamanoTexto, setTamanoTexto] = useState(() => {
    const saved = localStorage.getItem('tamanoTexto');
    return saved || 'normal';
  });

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

  // Configuración mejorada de estados con iconos
  const estadosConfig = {
    esperando: {
      icon: Clock,
      gradient: altoContraste ? 'from-white to-gray-200 text-black' : 'from-yellow-500 to-amber-600',
      lightBg: altoContraste ? 'bg-white' : 'bg-yellow-50',
      darkBg: altoContraste ? 'bg-white' : 'bg-yellow-900/20',
      borderColor: altoContraste ? 'border-l-black' : 'border-l-yellow-500'
    },
    pasando_soga: {
      icon: Link,
      gradient: altoContraste ? 'from-white to-gray-200 text-black' : 'from-blue-500 to-blue-600',
      lightBg: altoContraste ? 'bg-white' : 'bg-blue-50',
      darkBg: altoContraste ? 'bg-white' : 'bg-blue-900/20',
      borderColor: altoContraste ? 'border-l-black' : 'border-l-blue-500'
    },
    precintando: {
      icon: AlertCircle,
      gradient: altoContraste ? 'from-black to-gray-800 text-white' : 'from-red-500 to-red-600',
      lightBg: altoContraste ? 'bg-gray-100' : 'bg-red-50',
      darkBg: altoContraste ? 'bg-gray-100' : 'bg-red-900/20',
      borderColor: altoContraste ? 'border-l-black' : 'border-l-red-500'
    }
  };

  const renderTransitoCard = (transito) => {
    const config = estadosConfig[transito.estado];
    const isLoading = loadingTransitoId === transito.id;
    
    // Configuración de urgencia
    const urgenciaConfig = {
      critico: {
        bg: 'bg-red-500',
        text: 'text-white',
        icon: '🚨',
        pulse: true,
        label: `¡Sale en ${transito.minutosHastaSalida} min!`
      },
      urgente: {
        bg: 'bg-orange-500',
        text: 'text-white',
        icon: '⚠️',
        pulse: true,
        label: `Sale en ${transito.minutosHastaSalida} min`
      },
      proximo: {
        bg: 'bg-yellow-500',
        text: 'text-white',
        icon: '⏰',
        pulse: false,
        label: `Sale en ${Math.floor(transito.minutosHastaSalida / 60)}h ${transito.minutosHastaSalida % 60}min`
      },
      normal: {
        bg: null,
        text: null,
        icon: null,
        pulse: false,
        label: null
      }
    };
    
    const urgencia = urgenciaConfig[transito.nivelUrgencia];
    
    return (
      <div 
        key={transito.id}
        className={`
          relative
          ${altoContraste 
            ? 'bg-white border-4 border-black' 
            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
          }
          rounded-xl
          ${config.borderColor} border-l-8
          ${!altoContraste && 'hover:border-blue-400 dark:hover:border-blue-500'}
          shadow-sm hover:shadow-xl
          transition-all duration-300
          overflow-hidden
          p-5 sm:p-6
          touch-manipulation
          select-none
          transform hover:scale-[1.02]
          ${isLoading ? 'opacity-75' : ''}
          ${transito.nivelUrgencia === 'critico' ? 'ring-2 ring-red-500 ring-offset-2' : ''}
        `}
      >
        {/* Badge de urgencia en la parte superior */}
        {urgencia.label && (
          <div className={`
            absolute -top-3 left-1/2 transform -translate-x-1/2
            ${urgencia.bg} ${urgencia.text}
            px-3 py-1 rounded-full text-xs font-bold
            shadow-lg z-10
            ${urgencia.pulse ? 'animate-pulse' : ''}
            ${altoContraste ? 'border-2 border-black' : ''}
          `}>
            {urgencia.icon} {urgencia.label}
          </div>
        )}

        {/* Badge flotante mejorado para estado crítico */}
        {transito.estado === 'precintando' && !altoContraste && (
          <>
            <div className="absolute -top-2 -right-2">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
              </span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 animate-pulse" />
          </>
        )}

        <div className="flex justify-between mb-4 mt-2">
          <div>
            <h3 className={`${currentSize.titulo} font-bold ${altoContraste ? 'text-black' : darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.matricula}
            </h3>
            <p className={`${currentSize.subtitulo} ${altoContraste ? 'text-black' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {transito.secundaria}
            </p>
          </div>
          <span className={`
            ${currentSize.badge} rounded-full font-semibold text-white 
            bg-gradient-to-r ${config.gradient}
            ${transito.estado === 'precintando' && !altoContraste ? 'animate-pulse' : ''}
            select-none shadow-md
            ${altoContraste ? 'border-2 border-black' : ''}
          `}>
            {ESTADOS[transito.estado].label}
          </span>
        </div>

        <div className={`space-y-3 ${altoContraste ? 'text-black' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <p className={`${currentSize.texto} flex items-center gap-2`}>
            <MapPin className={`${currentSize.icono} flex-shrink-0 ${altoContraste ? 'text-black' : 'text-gray-500'}`} />
            <span className="truncate font-medium">{transito.deposito}</span>
          </p>
          <p className={`${currentSize.texto} flex items-center gap-2`}>
            <Package className={`${currentSize.icono} flex-shrink-0 ${altoContraste ? 'text-black' : 'text-gray-500'}`} />
            <span className="truncate">
              {transito.tipo === 'contenedor' ? `Contenedor: ${transito.codigo}` : 'Carga con Lona'}
            </span>
          </p>
          <p className={`${currentSize.texto} font-semibold flex items-center gap-2
            ${transito.nivelUrgencia === 'critico' ? 'text-red-600 animate-pulse' : ''}
            ${transito.nivelUrgencia === 'urgente' ? 'text-orange-600' : ''}
          `}>
            <Clock className={`${currentSize.icono} flex-shrink-0 
              ${transito.nivelUrgencia === 'critico' ? 'text-red-600' : ''}
              ${transito.nivelUrgencia === 'urgente' ? 'text-orange-600' : ''}
              ${altoContraste ? 'text-black' : 'text-gray-500'}
            `} />
            <span className={`${tamanoTexto === 'extragrande' ? 'text-xl' : 'text-base'}`}>
              Salida: {transito.salida}
            </span>
          </p>
        </div>

        <button 
          onClick={() => handleVerDetalles(transito)}
          disabled={isLoading}
          className={`
            w-full mt-5 px-5 ${currentSize.boton}
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : transito.nivelUrgencia === 'critico' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse'
                : transito.nivelUrgencia === 'urgente'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  : altoContraste
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white'
            }
            font-medium
            rounded-lg 
            transition-all duration-200 
            flex items-center justify-center gap-2
            touch-manipulation
            select-none
            ${!isLoading && 'active:scale-95'}
            shadow-md hover:shadow-lg
            ${altoContraste ? 'border-2 border-black' : ''}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className={`${currentSize.icono} animate-spin`} />
              Cargando...
            </>
          ) : (
            <>
              Ver Detalles
              <ChevronRight className={currentSize.icono} />
            </>
          )}
        </button>
      </div>
    );
  };

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
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
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
                {altoContraste ? 'Contraste Normal' : 'Alto Contraste'}
              </button>
              
              {/* Controles de tamaño de texto */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => cambiarTamanoTexto('disminuir')}
                  disabled={tamanoTexto === 'pequeno'}
                  className={`
                    px-3 py-2 rounded font-bold
                    ${tamanoTexto === 'pequeno' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                    }
                    transition-all
                    select-none
                  `}
                  title="Disminuir tamaño de texto"
                >
                  <Type className="w-4 h-4" />
                  <span className="text-xs">A-</span>
                </button>
                
                <span className="px-2 text-sm font-medium">
                  {tamanoTexto === 'pequeno' && 'Pequeño'}
                  {tamanoTexto === 'normal' && 'Normal'}
                  {tamanoTexto === 'grande' && 'Grande'}
                  {tamanoTexto === 'extragrande' && 'Extra Grande'}
                </span>
                
                <button
                  onClick={() => cambiarTamanoTexto('aumentar')}
                  disabled={tamanoTexto === 'extragrande'}
                  className={`
                    px-3 py-2 rounded font-bold
                    ${tamanoTexto === 'extragrande' 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                    }
                    transition-all
                    select-none
                  `}
                  title="Aumentar tamaño de texto"
                >
                  <Type className="w-5 h-5" />
                  <span className="text-sm">A+</span>
                </button>
              </div>
            </div>
            
            {/* Contador de tránsitos con indicadores de urgencia */}
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
                {/* Mini indicadores de urgencia */}
                <div className="flex gap-2 text-xs">
                  {estadisticasUrgencia.criticos > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full font-bold animate-pulse">
                      {estadisticasUrgencia.criticos} 🚨
                    </span>
                  )}
                  {estadisticasUrgencia.urgentes > 0 && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full font-bold">
                      {estadisticasUrgencia.urgentes} ⚠️
                    </span>
                  )}
                  {estadisticasUrgencia.proximos > 0 && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full font-bold">
                      {estadisticasUrgencia.proximos} ⏰
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Toggle vista miniatura */}
          <button
            onClick={() => setVistaMiniatura(!vistaMiniatura)}
            className={`
              px-5 py-3 rounded-lg font-medium
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto overscroll-contain">
              {transitosPendientes
                .map(transito => ({
                  ...transito,
                  minutosHastaSalida: calcularMinutosHastaSalida(transito.salida),
                  nivelUrgencia: getNivelUrgencia(calcularMinutosHastaSalida(transito.salida))
                }))
                .sort((a, b) => a.minutosHastaSalida - b.minutosHastaSalida)
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
          ) : (
            <div className="space-y-8 overflow-y-auto overscroll-contain">
              {Object.entries(transitosPorEstado).map(([estado, transitos], index) => {
                if (transitos.length === 0) return null;
                
                const config = estadosConfig[estado];
                const Icon = config.icon;

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
                        {transitos.map(renderTransitoCard)}
                      </div>
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