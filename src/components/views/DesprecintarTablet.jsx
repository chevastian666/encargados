import React, { useState } from 'react';
import { 
  Package, Truck, Globe, Clock, CheckCircle,
  FileText, Flag, Building, User, Hash, 
  MapPin, RefreshCw, Filter, Search, X
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { useApiData, useNotification } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal de Por Desprecintar optimizado para tablet
 * - Vista informativa de tránsitos listos para desprecintar
 * - Muestra ubicación y estado de cada vehículo
 * - Sin acciones de desprecintado (proceso automático)
 */
const DesprecintarTablet = ({ isOpen, onClose, darkMode }) => {
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error, warning, info } = useNotification();

  // Cargar camiones por desprecintar
  const { data: camionesData, loading, refetch } = useApiData(
    () => apiService.getTransitosDesprecintar(),
    [],
    { pollingInterval: 30000 }
  );

  const camiones = camionesData?.data || [];

  // Filtrar camiones
  const camionesFiltrados = camiones.filter(camion => {
    const matchEstado = filtroEstado === 'todos' || camion.estado === filtroEstado;
    const matchSearch = searchTerm === '' || 
      camion.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camion.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camion.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  // Estados de camiones
  const estados = {
    'En puerto': { 
      color: 'blue', 
      icon: MapPin,
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      textClass: 'text-blue-800 dark:text-blue-400'
    },
    'En aduana': { 
      color: 'yellow', 
      icon: Building,
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-800 dark:text-yellow-400'
    },
    'Esperando': { 
      color: 'orange', 
      icon: Clock,
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      textClass: 'text-orange-800 dark:text-orange-400'
    },
    'Procesando': { 
      color: 'green', 
      icon: CheckCircle,
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-800 dark:text-green-400'
    }
  };

  // Vista de detalles del camión (solo informativo)
  const DetallesCamion = ({ camion }) => {
    return (
      <div className={`
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-xl p-6 space-y-6
      `}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Detalles del Tránsito
          </h3>
          <button
            onClick={() => setSelectedCamion(null)}
            className={`
              p-3 rounded-lg min-w-[48px] min-h-[48px]
              flex items-center justify-center
              ${darkMode 
                ? 'hover:bg-gray-700 active:bg-gray-600' 
                : 'hover:bg-gray-100 active:bg-gray-200'
              }
              transition-colors duration-150
              touch-manipulation
            `}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Información principal */}
        <div className={`
          p-6 rounded-lg
          ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
        `}>
          <div className="flex items-center space-x-4 mb-6">
            <Truck className="w-10 h-10 text-blue-500" />
            <div>
              <h4 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.matricula}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {camion.estado}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Origen
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {camion.origen}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Destino
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {camion.destino}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Llegada
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {camion.llegada}
                </p>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Empresa
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {camion.empresa}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Chofer
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {camion.chofer}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Carga
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {camion.carga}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del precinto */}
        <div className={`
          p-4 rounded-lg border-2
          ${darkMode ? 'border-blue-800 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Precinto
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.precinto}
              </p>
            </div>
            <Hash className={`w-8 h-8 ${darkMode ? 'text-blue-500' : 'text-blue-600'}`} />
          </div>
        </div>

        {/* Estado e información adicional */}
        <div className={`
          p-4 rounded-lg
          ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}
        `}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className={`${darkMode ? 'text-green-400' : 'text-green-800'}`}>
              Este tránsito está listo para ser desprecintado
            </p>
          </div>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            El desprecintado se realizará automáticamente cuando el vehículo llegue al punto de control
          </p>
        </div>
      </div>
    );
  };

  // Card de camión
  const CamionCard = ({ camion }) => {
    const estado = estados[camion.estado] || estados['Esperando'];
    const EstadoIcon = estado.icon;

    return (
      <div className={`
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-xl p-6
        hover:shadow-lg transition-all duration-200
      `}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Información principal */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vehículo y origen */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Vehículo
                </span>
              </div>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.matricula}
              </p>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4 text-gray-400" />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {camion.origen}
                </p>
              </div>
            </div>

            {/* Empresa y chofer */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Empresa
                </span>
              </div>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.empresa}
              </p>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4 text-gray-400" />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {camion.chofer}
                </p>
              </div>
            </div>

            {/* Precinto y carga */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Precinto
                </span>
              </div>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.precinto}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {camion.carga}
              </p>
            </div>

            {/* Estado y llegada */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <EstadoIcon className="w-5 h-5 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Estado
                </span>
              </div>
              <span className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${estado.bgClass} ${estado.textClass}
              `}>
                {camion.estado}
              </span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Llegada: {camion.llegada}
                </p>
              </div>
            </div>
          </div>

          {/* Acción de ver detalles */}
          <div className="flex pt-4 lg:pt-0">
            <TabletButton
              onClick={() => setSelectedCamion(camion)}
              variant="primary"
              size="medium"
              darkMode={darkMode}
              icon={<FileText className="w-5 h-5" />}
            >
              Ver Detalles
            </TabletButton>
          </div>
        </div>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
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
    <>
      <TabletModal
        isOpen={isOpen && !selectedCamion}
        onClose={onClose}
        title={`Por Desprecintar (${camionesFiltrados.length})`}
        darkMode={darkMode}
        headerActions={headerActions}
      >
        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por matrícula, origen o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full pl-12 pr-4 py-4 rounded-lg border
                min-h-[48px] text-base font-medium
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 hover:bg-gray-750 active:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 hover:bg-gray-50 active:bg-gray-100'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-150
                touch-manipulation
              `}
            />
          </div>

          {/* Filtros por estado */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {['todos', ...Object.keys(estados)].map((estado) => (
              <TabletButton
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                variant={filtroEstado === estado ? 'primary' : 'secondary'}
                size="small"
                darkMode={darkMode}
                className="flex-shrink-0"
              >
                {estado === 'todos' ? 'Todos' : estado}
                {estado !== 'todos' && (
                  <span className="ml-2">
                    ({camionesFiltrados.filter(c => c.estado === estado).length})
                  </span>
                )}
              </TabletButton>
            ))}
          </div>
        </div>

        {/* Lista de camiones */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : camionesFiltrados.length === 0 ? (
            <div className={`
              text-center py-12 rounded-lg border-2 border-dashed
              ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
            `}>
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay camiones por desprecintar</p>
              <p className="text-sm mt-2">Los nuevos arribos aparecerán aquí</p>
            </div>
          ) : (
            camionesFiltrados.map((camion) => (
              <CamionCard key={camion.id} camion={camion} />
            ))
          )}
        </div>

        {/* Resumen por país */}
        {camiones.length > 0 && (
          <div className={`
            mt-6 p-4 rounded-lg
            ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Por País de Origen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {['Brasil', 'Argentina', 'Paraguay', 'Chile'].map((pais) => {
                const count = camiones.filter(c => c.origen.includes(pais)).length;
                return (
                  <div key={pais}>
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Flag className="w-4 h-4 text-gray-400" />
                      <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {count}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pais}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </TabletModal>

      {/* Modal de detalles del camión */}
      {selectedCamion && (
        <TabletModal
          isOpen={true}
          onClose={() => setSelectedCamion(null)}
          title=""
          darkMode={darkMode}
          showMaximize={false}
        >
          <DetallesCamion camion={selectedCamion} />
        </TabletModal>
      )}
    </>
  );
};

export default DesprecintarTablet;