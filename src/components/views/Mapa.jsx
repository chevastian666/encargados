import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, Clock, Navigation, AlertTriangle, Phone, Info } from 'lucide-react';
import { Modal, Tooltip } from '../common';
import { useApiData } from '../../hooks';
import { ESTADO_CAMION } from '../../constants/constants';
import { getRelativeTime } from '../../utils/helpers';
import apiService from '../../services/api.service';
import wsService from '../../services/websocket.service';
import CONFIG from '../../constants/config';

/**
 * Vista de Mapa en Vivo
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.darkMode - Si está en modo oscuro
 */
const MapaModal = ({ isOpen, onClose, darkMode }) => {
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [showList, setShowList] = useState(true);
  const [centerOnCamion, setCenterOnCamion] = useState(null);
  const mapRef = useRef(null);
  
  // Usar el hook de API con polling automático
  const { data: camionesData, loading, error, refetch } = useApiData(
    () => apiService.getCamionesEnRuta(),
    [],
    {
      pollingInterval: 15000, // 15 segundos para actualizaciones más frecuentes
      wsEventName: 'position_update',
      cacheKey: 'camiones_ruta'
    }
  );

  const camionesEnRuta = camionesData?.data || [];

  // Suscribirse a actualizaciones de posición en tiempo real
  useEffect(() => {
    if (!isOpen || !CONFIG.ENABLE_WEBSOCKETS) return;

    const unsubscribe = wsService.subscribeToPositionUpdates((data) => {
      console.log('Nueva posición recibida:', data);
      // Aquí actualizarías las posiciones en el mapa
      // En una implementación real, actualizarías el estado local con las nuevas posiciones
    });

    return unsubscribe;
  }, [isOpen]);

  const handleCenterOnCamion = (camion) => {
    setCenterOnCamion(camion);
    setSelectedCamion(camion);
    // En una implementación real, aquí centrarías el mapa en las coordenadas del camión
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'en_ruta':
        return 'text-green-500';
      case 'detenido':
        return 'text-yellow-500';
      case 'llegado':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPositionStyle = (index, total) => {
    // Distribuir los camiones en el mapa de forma visual
    const angle = (index / total) * 2 * Math.PI;
    const radius = 35; // Porcentaje del radio
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    
    return {
      top: `${y}%`,
      left: `${x}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  const CamionMarker = ({ camion, index, total }) => {
    const isSelected = selectedCamion?.id === camion.id;
    
    return (
      <div 
        className="absolute cursor-pointer"
        style={getPositionStyle(index, total)}
        onClick={() => setSelectedCamion(camion)}
      >
        <Tooltip text={`${camion.matricula} - ${camion.destino}`}>
          <div className={`
            relative p-3 rounded-full transition-all duration-300
            ${isSelected ? 'scale-125 z-10' : 'hover:scale-110'}
            ${camion.estado === 'detenido' 
              ? 'bg-yellow-500' 
              : camion.estado === 'llegado'
              ? 'bg-blue-500'
              : 'bg-green-500 animate-pulse'
            }
          `}>
            <Truck className="w-6 h-6 text-white" />
            {camion.motivoDetencion && (
              <div className="absolute -top-1 -right-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>
        </Tooltip>
        <span className={`
          absolute top-full left-1/2 transform -translate-x-1/2 mt-1
          text-xs font-medium whitespace-nowrap
          ${darkMode ? 'text-gray-300' : 'text-gray-700'}
        `}>
          {camion.matricula}
        </span>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mapa en Vivo - Tránsitos a Montevideo"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header con leyenda y controles */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> 
              En ruta
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div> 
              Detenido
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div> 
              Llegado
            </span>
          </div>
          
          <button
            onClick={() => setShowList(!showList)}
            className={`
              px-4 py-2 rounded-lg transition-colors
              ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
            `}
          >
            {showList ? 'Ocultar' : 'Mostrar'} Lista
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error al cargar el mapa</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Mapa visual */}
            <div 
              ref={mapRef}
              className={`
                relative h-64 sm:h-96 rounded-xl mb-8 overflow-hidden
                ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `}
              style={{
                backgroundImage: `radial-gradient(circle at center, 
                  ${darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 0%, 
                  transparent 70%)`
              }}
            >
              {/* Centro - Montevideo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className={`
                  px-4 py-2 rounded-lg shadow-lg
                  ${darkMode ? 'bg-gray-800' : 'bg-white'}
                `}>
                  <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <span className="text-sm font-bold">Montevideo</span>
                </div>
              </div>
              
              {/* Círculos de distancia */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`
                  absolute w-32 h-32 rounded-full border-2 border-dashed
                  ${darkMode ? 'border-gray-600' : 'border-gray-400'}
                `} />
                <div className={`
                  absolute w-64 h-64 rounded-full border-2 border-dashed
                  ${darkMode ? 'border-gray-600' : 'border-gray-400'}
                `} />
                <div className={`
                  absolute w-96 h-96 rounded-full border-2 border-dashed
                  ${darkMode ? 'border-gray-600' : 'border-gray-400'}
                `} />
              </div>
              
              {/* Marcadores de camiones */}
              {camionesEnRuta.map((camion, idx) => (
                <CamionMarker 
                  key={camion.id} 
                  camion={camion} 
                  index={idx}
                  total={camionesEnRuta.length}
                />
              ))}
            </div>
            
            {/* Panel de información del camión seleccionado */}
            {selectedCamion && (
              <div className={`
                mb-6 p-4 rounded-lg
                ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
              `}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{selectedCamion.matricula}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>Destino: {selectedCamion.destino}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>ETA: {selectedCamion.eta}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-500" />
                        <span>Distancia: {selectedCamion.distancia} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span>Velocidad: {selectedCamion.velocidad} km/h</span>
                      </div>
                    </div>
                    {selectedCamion.motivoDetencion && (
                      <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          Detenido: {selectedCamion.motivoDetencion}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCamion(null)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}
                    `}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {/* Lista de camiones */}
            {showList && (
              <div className={`grid ${window.innerWidth < 640 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                {camionesEnRuta.map((camion) => (
                  <div 
                    key={camion.id} 
                    className={`
                      p-4 rounded-xl shadow-lg hover:shadow-xl 
                      transition-all duration-300 cursor-pointer
                      ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}
                      ${selectedCamion?.id === camion.id ? 'ring-2 ring-blue-500' : ''}
                    `}
                    onClick={() => handleCenterOnCamion(camion)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {camion.matricula}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          → {camion.destino}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ETA</p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {camion.eta}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {camion.minutos} min
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`
                          w-3 h-3 rounded-full ml-3
                          ${camion.estado === 'detenido' 
                            ? 'bg-yellow-500' 
                            : camion.estado === 'llegado'
                            ? 'bg-blue-500'
                            : 'bg-green-500 animate-pulse'
                          }
                        `} />
                      </div>
                    </div>
                    
                    {camion.motivoDetencion && (
                      <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {camion.motivoDetencion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Información adicional */}
            <div className={`
              mt-6 p-4 rounded-lg flex items-center gap-3
              ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
            `}>
              <Info className="w-5 h-5 text-blue-500" />
              <p className="text-sm">
                {camionesEnRuta.length} camiones en seguimiento • 
                Actualización automática cada 15 segundos
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default MapaModal;