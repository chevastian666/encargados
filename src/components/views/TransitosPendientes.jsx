import React, { useState, useMemo, useEffect } from 'react';
import { Package, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Modal, SidePanel } from '../common';
import TransitoDetails from '../TransitoDetails';
import { useApiData } from '../../hooks';
import { ESTADOS, DEPOSITOS } from '../../constants/constants';
import apiService from '../../services/api.service';
import TransitoMiniCard from '../cards/TransitoMiniCard';

/**
 * Vista de Tránsitos Pendientes de Precintar
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.darkMode - Si está en modo oscuro
 */
const TransitosPendientesModal = ({ isOpen, onClose, darkMode }) => {
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
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

  const handleVerDetalles = (transito) => {
    setSelectedTransito(transito);
    setShowSidePanel(true);
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

  const renderTransitoCard = (transito) => (
    <div 
      key={transito.id}
      className={`
        relative
        bg-white dark:bg-gray-800
        rounded-2xl
        border border-gray-200 dark:border-gray-700
        hover:border-blue-400 dark:hover:border-blue-500
        shadow-sm hover:shadow-xl
        transition-all duration-300
        overflow-hidden
        p-4 sm:p-6
      `}
    >
      {/* Indicador lateral de estado */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${ESTADOS[transito.estado].color}`} />

      {/* Badge flotante si estado es crítico */}
      {transito.estado === 'precintando' && (
        <div className="absolute -top-2 -right-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
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
          px-3 py-1 rounded-full text-xs font-semibold text-white 
          ${ESTADOS[transito.estado].color} animate-pulse
        `}>
          {ESTADOS[transito.estado].label}
        </span>
      </div>

      <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <p className="text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {transito.deposito}
        </p>
        <p className="text-sm flex items-center gap-2">
          <Package className="w-4 h-4" />
          {transito.tipo === 'contenedor' ? `Contenedor: ${transito.codigo}` : 'Carga con Lona'}
        </p>
        <p className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Salida: {transito.salida}
        </p>
      </div>

      <button 
        onClick={() => handleVerDetalles(transito)}
        className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        Ver Detalles
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tránsitos Pendientes de Precintar"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header con controles */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setVistaMiniatura(!vistaMiniatura)}
            className={`
              px-4 py-2 rounded-lg 
              ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}
              transition-colors
            `}
          >
            {vistaMiniatura ? "Ver por estado" : "Vista miniatura"}
          </button>

          <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow`}>
            <span className="text-2xl font-bold text-blue-500">{transitosPendientes.length}</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>activos</span>
          </div>
        </div>
        
        {/* Contenido principal */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error al cargar los tránsitos</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : transitosPendientes.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay tránsitos pendientes de precintar</p>
          </div>
        ) : vistaMiniatura ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {transitosPendientes.map((transito) => (
              <TransitoMiniCard
                key={transito.id}
                transito={transito}
                darkMode={darkMode}
                onClick={() => handleVerDetalles(transito)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(transitosPorEstado).map(([estado, transitos]) => {
              if (transitos.length === 0) return null;

              return (
                <div key={estado}>
                  <h3 className={`
                    text-lg font-semibold mb-3 flex items-center gap-2
                    ${darkMode ? 'text-white' : 'text-gray-900'}
                  `}>
                    <span className={`w-3 h-3 rounded-full ${ESTADOS[estado].color}`} />
                    {ESTADOS[estado].label} ({transitos.length})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {transitos.map(renderTransitoCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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