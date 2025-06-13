import React, { useState } from 'react';
import { 
  Package, Truck, Globe, Clock, CheckCircle,
  AlertCircle, FileText, Camera, Flag,
  Building, User, Hash, Calendar, MapPin,
  ScanLine, RefreshCw, Filter, Search, X
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { useApiData, useNotification } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal de Por Desprecintar optimizado para tablet
 * - Verificación rápida de precintos
 * - Captura de fotos integrada
 * - Proceso paso a paso
 */
const DesprecintarTablet = ({ isOpen, onClose, darkMode }) => {
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const { showNotification } = useNotification();

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

  // Proceso de desprecintado
  const ProcesoDesprecintar = ({ camion }) => {
    const pasos = [
      { id: 1, titulo: 'Verificar Datos', icon: FileText },
      { id: 2, titulo: 'Escanear Precinto', icon: ScanLine },
      { id: 3, titulo: 'Capturar Evidencia', icon: Camera },
      { id: 4, titulo: 'Confirmar Retiro', icon: CheckCircle }
    ];

    const handleProcesar = async () => {
      setProcesando(true);
      // Simular proceso
      setTimeout(() => {
        if (pasoActual < 4) {
          setPasoActual(pasoActual + 1);
        } else {
          showNotification('Precinto retirado correctamente', 'success');
          setSelectedCamion(null);
          setPasoActual(1);
          refetch();
        }
        setProcesando(false);
      }, 1000);
    };

    return (
      <div className={`
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-xl p-6 space-y-6
      `}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Proceso de Desprecintado
          </h3>
          <button
            onClick={() => {
              setSelectedCamion(null);
              setPasoActual(1);
            }}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Información del camión */}
        <div className={`
          p-4 rounded-lg
          ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
        `}>
          <div className="flex items-center space-x-3 mb-3">
            <Truck className="w-6 h-6 text-blue-500" />
            <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.matricula}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Origen:</span>
              <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.origen}
              </span>
            </div>
            <div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Precinto:</span>
              <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.precinto}
              </span>
            </div>
          </div>
        </div>

        {/* Pasos del proceso */}
        <div className="flex items-center justify-between mb-6">
          {pasos.map((paso, index) => {
            const Icon = paso.icon;
            const isActive = paso.id === pasoActual;
            const isCompleted = paso.id < pasoActual;
            
            return (
              <React.Fragment key={paso.id}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isCompleted 
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : darkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`
                    text-xs mt-2 text-center
                    ${isActive || isCompleted
                      ? darkMode ? 'text-white' : 'text-gray-900'
                      : darkMode ? 'text-gray-500' : 'text-gray-500'
                    }
                  `}>
                    {paso.titulo}
                  </span>
                </div>
                {index < pasos.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${isCompleted
                      ? 'bg-green-500'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Contenido del paso actual */}
        <div className={`
          p-6 rounded-lg border-2 border-dashed
          ${darkMode ? 'border-gray-700' : 'border-gray-300'}
          min-h-[200px]
        `}>
          {pasoActual === 1 && (
            <div className="space-y-4">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Verificar Información del Tránsito
              </h4>
              <div className="space-y-2">
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  • Matrícula: {camion.matricula}
                </p>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  • Empresa: {camion.empresa}
                </p>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  • Chofer: {camion.chofer}
                </p>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  • Carga: {camion.carga}
                </p>
              </div>
            </div>
          )}

          {pasoActual === 2 && (
            <div className="flex flex-col items-center justify-center h-full">
              <ScanLine className="w-16 h-16 text-blue-500 mb-4 animate-pulse" />
              <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Escanea el código del precinto
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Precinto esperado: {camion.precinto}
              </p>
            </div>
          )}

          {pasoActual === 3 && (
            <div className="flex flex-col items-center justify-center h-full">
              <Camera className="w-16 h-16 text-blue-500 mb-4" />
              <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Captura foto del precinto antes de retirarlo
              </p>
              <TabletButton
                onClick={() => showNotification('Abriendo cámara...', 'info')}
                variant="primary"
                size="medium"
                darkMode={darkMode}
                icon={<Camera className="w-5 h-5" />}
                className="mt-4"
              >
                Tomar Foto
              </TabletButton>
            </div>
          )}

          {pasoActual === 4 && (
            <div className="space-y-4">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Confirmar Retiro del Precinto
              </h4>
              <div className={`
                p-3 rounded-lg
                ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}
              `}>
                <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  ⚠️ Al confirmar, se registrará el retiro del precinto y se habilitará el camión para salir.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          {pasoActual > 1 && (
            <TabletButton
              onClick={() => setPasoActual(pasoActual - 1)}
              variant="secondary"
              size="medium"
              darkMode={darkMode}
              disabled={procesando}
            >
              Anterior
            </TabletButton>
          )}
          <TabletButton
            onClick={handleProcesar}
            variant="primary"
            size="medium"
            fullWidth
            darkMode={darkMode}
            loading={procesando}
            icon={pasoActual === 4 ? <CheckCircle className="w-5 h-5" /> : null}
          >
            {pasoActual === 4 ? 'Confirmar Retiro' : 'Siguiente'}
          </TabletButton>
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

          {/* Acciones */}
          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 pt-4 lg:pt-0">
            <TabletButton
              onClick={() => setSelectedCamion(camion)}
              variant="primary"
              size="medium"
              darkMode={darkMode}
              icon={<Package className="w-5 h-5" />}
            >
              Desprecintar
            </TabletButton>
            <TabletButton
              onClick={() => showNotification('Ver detalles completos', 'info')}
              variant="secondary"
              size="medium"
              darkMode={darkMode}
              icon={<FileText className="w-5 h-5" />}
            >
              Detalles
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
                w-full pl-10 pr-4 py-3 rounded-lg border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
                text-base
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

      {/* Modal de proceso de desprecintado */}
      {selectedCamion && (
        <TabletModal
          isOpen={true}
          onClose={() => {
            setSelectedCamion(null);
            setPasoActual(1);
          }}
          title=""
          darkMode={darkMode}
          showMaximize={false}
        >
          <ProcesoDesprecintar camion={selectedCamion} />
        </TabletModal>
      )}
    </>
  );
};

export default DesprecintarTablet;