import React, { useState, useMemo, useEffect } from 'react';
import { Package, MapPin, Clock, ChevronRight, AlertCircle, Truck, Link, Loader2 } from 'lucide-react';
import { Modal, SidePanel } from '../common';
import TransitoDetails from '../TransitoDetails';
import { useApiData } from '../../hooks';
import { ESTADOS, DEPOSITOS } from '../../constants/constants';
import apiService from '../../services/api.service';
import TransitoMiniCard from '../cards/TransitoMiniCard';

/**
 * Vista de Tránsitos Pendientes de Precintar - Optimizada para Touch
 * Con mejoras visuales para separación por estado
 */
const TransitosPendientesModal = ({ isOpen, onClose, darkMode }) => {
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [loadingTransitoId, setLoadingTransitoId] = useState(null); // Nuevo estado para controlar loading
  const [vistaMiniatura, setVistaMiniatura] = useState(() => {
    const saved = localStorage.getItem('vistaMiniatura');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vistaMiniatura', vistaMiniatura);
  }, [vistaMiniatura]);

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

  // Agrupar por estado
  const transitosPorEstado = useMemo(() => {
    const grupos = {
      esperando: [],
      pasando_soga: [],
      precintando: []
    };
    
    transitosPendientes.forEach(transito => {
      if (grupos[transito.estado]) {
        grupos[transito.estado].push(transito);
      }
    });
    
    return grupos;
  }, [transitosPendientes]);

  // Configuración mejorada de estados con iconos
  const estadosConfig = {
    esperando: {
      icon: Clock,
      gradient: 'from-yellow-500 to-amber-600',
      lightBg: 'bg-yellow-50',
      darkBg: 'bg-yellow-900/20',
      borderColor: 'border-l-yellow-500'
    },
    pasando_soga: {
      icon: Link,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      darkBg: 'bg-blue-900/20',
      borderColor: 'border-l-blue-500'
    },
    precintando: {
      icon: AlertCircle,
      gradient: 'from-red-500 to-red-600',
      lightBg: 'bg-red-50',
      darkBg: 'bg-red-900/20',
      borderColor: 'border-l-red-500'
    }
  };

  const renderTransitoCard = (transito) => {
    const config = estadosConfig[transito.estado];
    const isLoading = loadingTransitoId === transito.id;
    
    return (
      <div 
        key={transito.id}
        className={`
          relative
          bg-white dark:bg-gray-800
          rounded-xl
          border-2 border-gray-200 dark:border-gray-700
          ${config.borderColor} border-l-4
          hover:border-blue-400 dark:hover:border-blue-500
          shadow-sm hover:shadow-xl
          transition-all duration-300
          overflow-hidden
          p-5 sm:p-6
          touch-manipulation
          select-none
          transform hover:scale-[1.02]
          ${isLoading ? 'opacity-75' : ''}
        `}
      >
        {/* Badge flotante mejorado para estado crítico */}
        {transito.estado === 'precintando' && (
          <>
            <div className="absolute -top-2 -right-2">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
              </span>
            </div>
            {/* Banda superior de urgencia */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 animate-pulse" />
          </>
        )}

        <div className="flex justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.matricula}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {transito.secundaria}
            </p>
          </div>
          <span className={`
            px-3 py-1.5 rounded-full text-xs font-semibold text-white 
            bg-gradient-to-r ${config.gradient}
            ${transito.estado === 'precintando' ? 'animate-pulse' : ''}
            select-none shadow-md
          `}>
            {ESTADOS[transito.estado].label}
          </span>
        </div>

        <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <p className="text-sm flex items-center gap-2">
            <MapPin className="w-5 h-5 flex-shrink-0 text-gray-500" />
            <span className="truncate font-medium">{transito.deposito}</span>
          </p>
          <p className="text-sm flex items-center gap-2">
            <Package className="w-5 h-5 flex-shrink-0 text-gray-500" />
            <span className="truncate">
              {transito.tipo === 'contenedor' ? `Contenedor: ${transito.codigo}` : 'Carga con Lona'}
            </span>
          </p>
          <p className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 flex-shrink-0 text-gray-500" />
            <span className="text-base">Salida: {transito.salida}</span>
          </p>
        </div>

        {/* OPCIÓN 1: Botón con texto "Cargando..." */}
        <button 
          onClick={() => handleVerDetalles(transito)}
          disabled={isLoading}
          className={`
            w-full mt-5 px-5 py-3 
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800'
            }
            text-white font-medium
            rounded-lg 
            transition-all duration-200 
            flex items-center justify-center gap-2
            touch-manipulation
            select-none
            ${!isLoading && 'active:scale-95'}
            shadow-md hover:shadow-lg
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              Ver Detalles
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* OPCIÓN 2 (Alternativa): Botón con spinner a la derecha */}
        {/* Descomentar esta opción y comentar la anterior si prefieres esta versión */}
        {/*
        <button 
          onClick={() => handleVerDetalles(transito)}
          disabled={isLoading}
          className={`
            w-full mt-5 px-5 py-3 
            bg-gradient-to-r from-blue-500 to-blue-600
            hover:from-blue-600 hover:to-blue-700
            active:from-blue-700 active:to-blue-800
            ${isLoading ? 'cursor-wait' : ''}
            text-white font-medium
            rounded-lg 
            transition-all duration-200 
            flex items-center justify-center gap-2
            touch-manipulation
            select-none
            active:scale-95
            shadow-md hover:shadow-lg
          `}
        >
          Ver Detalles
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
        */}
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
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'} select-none`}>
        {/* Header con controles */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <button
            onClick={() => setVistaMiniatura(!vistaMiniatura)}
            className={`
              px-5 py-3 rounded-lg font-medium
              ${darkMode ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-black'}
              transition-colors
              touch-manipulation
              select-none
              active:scale-95
            `}
          >
            {vistaMiniatura ? "Ver por estado" : "Vista miniatura"}
          </button>

          <div className={`
            px-5 py-3 rounded-lg 
            ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} 
            shadow-md select-none
          `}>
            <span className="text-2xl font-bold text-blue-500">{transitosPendientes.length}</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>activos</span>
          </div>
        </div>
        
        {/* Contenido principal con scroll optimizado */}
        <div className="touch-manipulation">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error al cargar los tránsitos</p>
              <button 
                onClick={refetch}
                className={`
                  px-5 py-3 
                  bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                  text-white font-medium
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
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Package className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay tránsitos pendientes de precintar</p>
            </div>
          ) : vistaMiniatura ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto overscroll-contain">
              {transitosPendientes.map((transito) => (
                <TransitoMiniCard
                  key={transito.id}
                  transito={transito}
                  darkMode={darkMode}
                  onClick={() => handleVerDetalles(transito)}
                  className="touch-manipulation"
                  isLoading={loadingTransitoId === transito.id}
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
                      bg-gradient-to-r ${config.gradient}
                      rounded-t-xl
                      p-4
                      shadow-lg
                      transform transition-transform duration-300
                      group-hover:scale-[1.01]
                    `}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Icono del estado */}
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold text-white drop-shadow-md">
                              {ESTADOS[estado].label}
                            </h3>
                            <p className="text-white/90 text-sm">
                              {transitos.length} {transitos.length === 1 ? 'tránsito' : 'tránsitos'} en este estado
                            </p>
                          </div>
                        </div>
                        
                        {/* Badge con contador animado */}
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <span className="text-3xl font-bold text-white drop-shadow-md">
                            {transitos.length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Patrón decorativo */}
                      <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                      <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>
                    
                    {/* Contenedor de tarjetas con fondo sutil */}
                    <div className={`
                      ${darkMode ? config.darkBg : config.lightBg}
                      rounded-b-xl
                      p-6
                      -mt-1
                      border-x-2 border-b-2
                      ${darkMode ? 'border-gray-700' : 'border-gray-200'}
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