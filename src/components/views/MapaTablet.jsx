import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Truck, Navigation, ZoomIn, ZoomOut, 
  Layers, Clock, AlertCircle, RefreshCw,
  Filter, Info, ChevronRight, Target
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { useApiData } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal de Mapa en Vivo optimizado para tablet
 * - Controles de mapa grandes y accesibles
 * - Panel lateral con lista de camiones
 * - Información detallada al tocar
 */
const MapaTablet = ({ isOpen, onClose, darkMode }) => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [mapView, setMapView] = useState('todos');
  const [showList, setShowList] = useState(true);
  const mapRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(12);

  // Cargar datos de camiones
  const { data: camionesData, loading, refetch } = useApiData(
    () => apiService.getCamionesEnRuta(),
    [],
    { pollingInterval: 5000 } // Actualización más frecuente para tiempo real
  );

  const camiones = camionesData?.data || [];

  // Filtrar camiones según vista
  const camionesFiltrados = camiones.filter(camion => {
    if (mapView === 'todos') return true;
    if (mapView === 'enRuta') return camion.estado === 'en_ruta';
    if (mapView === 'proximos') return camion.minutos <= 15;
    if (mapView === 'demorados') return camion.estado === 'demorado';
    return true;
  });

  // Estados de camiones
  const estadosCamion = {
    en_ruta: { color: 'green', label: 'En Ruta', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-800 dark:text-green-400' },
    proximo: { color: 'blue', label: 'Próximo', bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-800 dark:text-blue-400' },
    demorado: { color: 'red', label: 'Demorado', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-800 dark:text-red-400' },
    detenido: { color: 'yellow', label: 'Detenido', bgClass: 'bg-yellow-100 dark:bg-yellow-900/30', textClass: 'text-yellow-800 dark:text-yellow-400' }
  };

  // Simular actualización de posiciones
  useEffect(() => {
    if (!isOpen) return;
    // Aquí iría la integración con el mapa real (Google Maps, Mapbox, etc.)
  }, [isOpen, camionesFiltrados]);

  // Card de camión en lista
  const CamionListItem = ({ camion }) => {
    const estado = estadosCamion[camion.estado] || estadosCamion.en_ruta;
    const isSelected = selectedTruck?.id === camion.id;

    return (
      <button
        onClick={() => setSelectedTruck(camion)}
        className={`
          w-full p-4 rounded-lg border transition-all duration-200
          ${isSelected 
            ? darkMode 
              ? 'bg-blue-900/30 border-blue-500' 
              : 'bg-blue-50 border-blue-500'
            : darkMode
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${estado.bgClass}`}>
              <Truck className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="text-left">
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.matricula}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Destino: {camion.destino}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${estado.bgClass} ${estado.textClass}`}>
                  {estado.label}
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  ETA: {camion.eta}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.minutos}m
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {camion.distancia}km
            </p>
          </div>
        </div>
        
        {camion.velocidad && (
          <div className={`mt-2 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Velocidad: {camion.velocidad} km/h
            </p>
          </div>
        )}
      </button>
    );
  };

  // Panel de información del camión seleccionado
  const TruckInfoPanel = () => {
    if (!selectedTruck) return null;
    const estado = estadosCamion[selectedTruck.estado] || estadosCamion.en_ruta;

    return (
      <div className={`
        absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-xl shadow-2xl p-6 z-20
        animate-in slide-in-from-bottom duration-300
      `}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedTruck.matricula}
            </h3>
            <span className={`text-sm px-2 py-1 rounded-full ${estado.bgClass} ${estado.textClass}`}>
              {estado.label}
            </span>
          </div>
          <button
            onClick={() => setSelectedTruck(null)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Destino</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedTruck.destino}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ETA</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedTruck.eta}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tiempo</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedTruck.minutos} minutos
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distancia</p>
              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedTruck.distancia} km
              </p>
            </div>
          </div>

          {selectedTruck.velocidad && (
            <div className={`pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Velocidad actual: {selectedTruck.velocidad} km/h
              </p>
            </div>
          )}

          <TabletButton
            onClick={() => {
              // Centrar mapa en el camión
              console.log('Centrar en:', selectedTruck);
            }}
            variant="primary"
            size="medium"
            fullWidth
            darkMode={darkMode}
            icon={<Target className="w-5 h-5" />}
          >
            Centrar en Mapa
          </TabletButton>
        </div>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
      <TabletButton
        onClick={() => setShowList(!showList)}
        variant="secondary"
        size="small"
        darkMode={darkMode}
        icon={<Layers className="w-5 h-5" />}
      >
        {showList ? 'Ocultar Lista' : 'Mostrar Lista'}
      </TabletButton>
      <TabletButton
        onClick={refetch}
        variant="secondary"
        size="small"
        darkMode={darkMode}
        icon={<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />}
        disabled={loading}
      >
        Actualizar
      </TabletButton>
    </div>
  );

  return (
    <TabletModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mapa en Vivo - ${camionesFiltrados.length} camiones`}
      darkMode={darkMode}
      headerActions={headerActions}
    >
      <div className="h-full flex">
        {/* Panel lateral con lista de camiones */}
        {showList && (
          <div className={`
            w-full md:w-96 h-full flex flex-col
            ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
            border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {/* Filtros */}
            <div className="p-4 border-b border-gray-700 dark:border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Filtrar por:
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'enRuta', label: 'En Ruta' },
                  { id: 'proximos', label: 'Próximos' },
                  { id: 'demorados', label: 'Demorados' }
                ].map((filtro) => (
                  <TabletButton
                    key={filtro.id}
                    onClick={() => setMapView(filtro.id)}
                    variant={mapView === filtro.id ? 'primary' : 'secondary'}
                    size="small"
                    darkMode={darkMode}
                    className="text-sm"
                  >
                    {filtro.label}
                  </TabletButton>
                ))}
              </div>
            </div>

            {/* Lista de camiones */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : camionesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No hay camiones en ruta
                  </p>
                </div>
              ) : (
                camionesFiltrados.map((camion) => (
                  <CamionListItem key={camion.id} camion={camion} />
                ))
              )}
            </div>

            {/* Resumen */}
            <div className={`
              p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {camiones.filter(c => c.estado === 'en_ruta').length}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    En Ruta
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    {camiones.filter(c => c.minutos <= 15).length}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Próximos
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {camiones.filter(c => c.estado === 'demorado').length}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Demorados
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Área del mapa */}
        <div className="flex-1 relative">
          {/* Placeholder del mapa - En producción sería Google Maps o Mapbox */}
          <div 
            ref={mapRef}
            className={`
              w-full h-full
              ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}
              flex items-center justify-center
            `}
          >
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Área del Mapa
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Integración con servicio de mapas
              </p>
            </div>
          </div>

          {/* Controles del mapa */}
          <div className="absolute top-4 right-4 space-y-2">
            <TabletButton
              onClick={() => setMapZoom(mapZoom + 1)}
              variant="secondary"
              size="small"
              darkMode={darkMode}
              className="!p-3"
              icon={<ZoomIn className="w-5 h-5" />}
            />
            <TabletButton
              onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
              variant="secondary"
              size="small"
              darkMode={darkMode}
              className="!p-3"
              icon={<ZoomOut className="w-5 h-5" />}
            />
          </div>

          {/* Panel de información del camión seleccionado */}
          <TruckInfoPanel />
        </div>
      </div>
    </TabletModal>
  );
};

export default MapaTablet;