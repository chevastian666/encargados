import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package, MapPin, Database, AlertTriangle, Truck, Sun, Moon, ArrowDown, X, ChevronRight, Clock, Info, Check, Filter, Search, Settings, Save, Edit2, AlertCircle } from 'lucide-react';
import apiService from './services/apiService';
import wsService from './services/websocketService';
import CONFIG from './config';
import { ConnectionProvider, useConnection } from './contexts/ConnectionContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import ConnectionStatus from './components/ConnectionStatus';
// ==================== SERVICIO API ====================

// ==================== CONSTANTES ====================
const ESTADOS = {
  esperando: { label: 'Esperando', color: 'bg-yellow-500' },
  pasando_soga: { label: 'Pasando soga', color: 'bg-blue-500' },
  precintando: { label: 'Precintando', color: 'bg-green-500' }
};

const ESTADO_CAMION = {
  en_ruta: { label: 'En ruta', color: 'bg-green-500' },
  detenido: { label: 'Detenido', color: 'bg-yellow-500' }
};

const PRIORIDAD_ALERTA = {
  alta: { label: 'Alta', color: 'bg-red-500' },
  media: { label: 'Media', color: 'bg-yellow-500' },
  baja: { label: 'Baja', color: 'bg-blue-500' }
};

const COUNTRY_FLAGS = {
  'São Paulo': '🇧🇷',
  'Buenos Aires': '🇦🇷',
  'Asunción': '🇵🇾',
  'Santiago': '🇨🇱',
  'Porto Alegre': '🇧🇷',
  'Rivera': '🇺🇾',
  'Córdoba': '🇦🇷',
  'Montevideo': '🇺🇾'
};

// ==================== COMPONENTES REUTILIZABLES ====================
const Modal = ({ isOpen, onClose, children, title, size = 'medium' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'max-w-2xl',
    medium: 'max-w-4xl',
    large: 'max-w-6xl',
    fullscreen: 'max-w-[95vw]'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-auto transform transition-all duration-300 scale-100`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const SidePanel = ({ isOpen, onClose, children, title }) => {
  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full bg-white dark:bg-gray-800 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      <div className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap transition-all duration-200 ${
        show ? 'opacity-100 visible' : 'opacity-0 invisible'
      } bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2`}>
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </div>
  );
};

// ==================== COMPONENTE DE FILTROS ====================
const FilterPanel = ({ filters, onFilterChange, darkMode }) => {
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5" />
        <h3 className="font-semibold">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.name}>
            <label className="block text-sm font-medium mb-1">{filter.label}</label>
            {filter.type === 'select' ? (
              <select
                value={filter.value}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.name, e.target.value)}
                placeholder={filter.placeholder}
                className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== COMPONENTE DE BÚSQUEDA ====================
const SearchBar = ({ value, onChange, placeholder, darkMode }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
      />
    </div>
  );
};

// ==================== COMPONENTE DE INPUT EDITABLE ====================
const EditableInput = ({ value, onSave, type = "number", darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`w-20 px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
      />
      <button
        onClick={handleSave}
        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={handleCancel}
        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ==================== HOOKS PERSONALIZADOS ====================
const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(true);
  return darkMode;
};

// Hook para polling de datos
const usePolling = (callback, interval = CONFIG.POLLING_INTERVAL) => {
  const savedCallback = useRef();
  const { isOnline } = useConnection();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isOnline) return;

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, isOnline]);
};

// Hook para datos con actualización automática
const useApiData = (apiMethod, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useConnection();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiMethod();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiMethod]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, isOnline]);

  // Polling automático
  usePolling(fetchData);

  // Suscripción a WebSocket si está disponible
  useEffect(() => {
    if (!CONFIG.ENABLE_WEBSOCKETS) return;

    const unsubscribe = wsService.subscribe('dataUpdate', (event) => {
      if (event.endpoint === apiMethod.name) {
        setData(event.data);
      }
    });

    return unsubscribe;
  }, [apiMethod]);

  return { data, loading, error, refetch: fetchData };
};

// ==================== COMPONENTE: DETALLE DE TRANSITO ====================
const TransitoDetails = ({ transito, darkMode }) => {
  const { addNotification } = useNotification();
  const { isOnline } = useConnection();
  
  const handleMarcarPrecintado = async () => {
    if (!isOnline) {
      addNotification('warning', 'No hay conexión. Los cambios se sincronizarán cuando vuelva la conexión.');
    }
    
    try {
      await apiService.updateTransitoEstado(transito.id, 'precintado');
      addNotification('success', `Tránsito ${transito.matricula} marcado como precintado`);
    } catch (error) {
      addNotification('error', 'Error al actualizar el estado del tránsito');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${ESTADOS[transito.estado].color}`}>
          {ESTADOS[transito.estado].label}
        </span>
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Salida: {transito.salida}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vehículo</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Primaria: {transito.matricula}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Secundaria: {transito.secundaria}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Carga</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transito.tipo === 'contenedor' ? `Contenedor: ${transito.codigo}` : 'Carga con Lona'}
          </p>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chofer</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{transito.chofer}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{transito.telefono}</p>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Depósito</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{transito.deposito}</p>
      </div>
      
      <div className="pt-4 border-t dark:border-gray-700">
        <button 
          onClick={handleMarcarPrecintado}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          disabled={!isOnline && transito.estado === 'precintado'}
        >
          Marcar como Precintado
        </button>
      </div>
    </div>
  );
};

// ==================== VISTA: TRANSITOS PENDIENTES ====================
const TransitosPendientesModal = ({ isOpen, onClose, darkMode }) => {
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    deposito: '',
    estado: '',
    tipo: '',
    horario: ''
  });
  const [isMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  
  // Usar el hook de API con polling automático
  const { data: transitosData, loading, error } = useApiData(() => apiService.getTransitosPendientes());
  const transitosPendientes = transitosData?.data || [];

  const handleVerDetalles = (transito) => {
    setSelectedTransito(transito);
    setShowSidePanel(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filtrado de tránsitos
  const filteredTransitos = transitosPendientes.filter(transito => {
    const matchSearch = transito.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transito.secundaria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transito.chofer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDeposito = !filters.deposito || transito.deposito === filters.deposito;
    const matchEstado = !filters.estado || transito.estado === filters.estado;
    const matchTipo = !filters.tipo || transito.tipo === filters.tipo;
    
    return matchSearch && matchDeposito && matchEstado && matchTipo;
  });

  const filterConfig = [
    {
      name: 'deposito',
      label: 'Depósito',
      type: 'select',
      value: filters.deposito,
      options: [
        { value: 'Zona Franca', label: 'Zona Franca' },
        { value: 'Terminal TCP', label: 'Terminal TCP' },
        { value: 'Terminal Cuenca', label: 'Terminal Cuenca' },
        { value: 'Puerto MVD', label: 'Puerto MVD' }
      ]
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      value: filters.estado,
      options: Object.entries(ESTADOS).map(([key, value]) => ({ 
        value: key, 
        label: value.label 
      }))
    },
    {
      name: 'tipo',
      label: 'Tipo de carga',
      type: 'select',
      value: filters.tipo,
      options: [
        { value: 'contenedor', label: 'Contenedor' },
        { value: 'lona', label: 'Lona' }
      ]
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tránsitos Pendientes de Precintar"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-6 flex justify-between items-center">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por matrícula o chofer..."
            darkMode={darkMode}
          />
          <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow ml-4`}>
            <span className="text-2xl font-bold text-blue-500">{filteredTransitos.length}</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>activos</span>
          </div>
        </div>
        
        <FilterPanel
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          darkMode={darkMode}
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {filteredTransitos.map((transito) => (
              <div key={transito.id} className={`p-4 sm:p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transito.matricula}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {transito.secundaria}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${ESTADOS[transito.estado].color} animate-pulse`}>
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
            ))}
          </div>
        )}
        
        {filteredTransitos.length === 0 && !loading && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No se encontraron tránsitos con los filtros aplicados</p>
          </div>
        )}
      </div>
      
      <SidePanel
        isOpen={showSidePanel && selectedTransito}
        onClose={() => {
          setShowSidePanel(false);
          setSelectedTransito(null);
        }}
        title={`Detalles - ${selectedTransito?.matricula}`}
      >
        {selectedTransito && <TransitoDetails transito={selectedTransito} darkMode={darkMode} />}
      </SidePanel>
    </Modal>
  );
};

// ==================== VISTA: DESPRECINTAR ====================
const DesprecintarModal = ({ isOpen, onClose, darkMode }) => {
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    origen: '',
    destino: '',
    estado: ''
  });
  const { addNotification } = useNotification();
  const { isOnline } = useConnection();
  
  // Usar el hook de API con polling automático
  const { data: transitosData, loading } = useApiData(() => apiService.getTransitosDesprecintar());
  const transitosDesprecintar = transitosData?.data || [];

  const handleDesprecintar = (transito) => {
    setSelectedTransito(transito);
    setShowConfirmModal(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filtrado
  const filteredTransitos = transitosDesprecintar.filter(transito => {
    const matchSearch = transito.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transito.precinto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchOrigen = !filters.origen || transito.origen === filters.origen;
    const matchDestino = !filters.destino || transito.destino === filters.destino;
    const matchEstado = !filters.estado || transito.estado === filters.estado;
    
    return matchSearch && matchOrigen && matchDestino && matchEstado;
  });

  const filterConfig = [
    {
      name: 'origen',
      label: 'Origen',
      type: 'select',
      value: filters.origen,
      options: [...new Set(transitosDesprecintar.map(t => t.origen))].map(origen => ({
        value: origen,
        label: origen
      }))
    },
    {
      name: 'destino',
      label: 'Destino',
      type: 'select',
      value: filters.destino,
      options: [...new Set(transitosDesprecintar.map(t => t.destino))].map(destino => ({
        value: destino,
        label: destino
      }))
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      value: filters.estado,
      options: [
        { value: 'En puerto', label: 'En puerto' },
        { value: 'En aduana', label: 'En aduana' },
        { value: 'Esperando', label: 'Esperando' }
      ]
    }
  ];

  const DesprecintarConfirmModal = ({ transito }) => (
    <Modal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      title="Confirmar Desprecintado"
      size="small"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Confirmar desprecintado del vehículo {transito.matricula}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm"><strong>Precinto:</strong> {transito.precinto}</p>
          <p className="text-sm"><strong>Origen:</strong> {transito.origen}</p>
          <p className="text-sm"><strong>Destino:</strong> {transito.destino}</p>
          <p className="text-sm"><strong>Estado:</strong> {transito.estado}</p>
        </div>
        
        <div className="pt-4 space-y-2">
          <button 
            onClick={async () => {
              if (!isOnline) {
                addNotification('warning', 'No hay conexión. La operación se realizará cuando vuelva la conexión.');
              }
              addNotification('success', `Precinto ${transito.precinto} removido exitosamente`);
              setShowConfirmModal(false);
            }}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Confirmar Desprecintado
          </button>
          <button 
            onClick={() => setShowConfirmModal(false)}
            className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tránsitos por Desprecintar"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-6 flex justify-between items-center">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por matrícula o precinto..."
            darkMode={darkMode}
          />
          <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow ml-4`}>
            <span className="text-2xl font-bold text-red-500">{filteredTransitos.length}</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>pendientes</span>
          </div>
        </div>
        
        <FilterPanel
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          darkMode={darkMode}
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTransitos.map((transito) => (
              <div key={transito.id} className={`p-4 sm:p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <div className={`flex ${window.innerWidth < 640 ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{COUNTRY_FLAGS[transito.origen] || '🌍'}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transito.matricula}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
                        {transito.origen} → {transito.destino}
                        <span className="text-2xl">{COUNTRY_FLAGS[transito.destino] || '🌍'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Llegada estimada</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transito.llegada}
                    </p>
                  </div>
                  
                  <div className={`flex ${window.innerWidth < 640 ? 'flex-col' : 'items-center'} gap-4`}>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${
                      transito.estado === 'En puerto' ? 'bg-green-500 text-white' :
                      transito.estado === 'En aduana' ? 'bg-blue-500 text-white' :
                      'bg-yellow-500 text-gray-900'
                    }`}>
                      {transito.estado}
                    </span>
                    
                    <button 
                      onClick={() => handleDesprecintar(transito)}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                    >
                      Desprecintar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredTransitos.length === 0 && !loading && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No se encontraron tránsitos con los filtros aplicados</p>
          </div>
        )}
      </div>
      
      {selectedTransito && <DesprecintarConfirmModal transito={selectedTransito} />}
    </Modal>
  );
};

// ==================== VISTA: STOCK ====================
const StockModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const { isOnline } = useConnection();
  const [showConfig, setShowConfig] = useState(false);
  
  // Usar el hook de API con polling automático
  const { data: stockDataResponse, loading, refetch } = useApiData(() => apiService.getStock());
  const stockData = stockDataResponse?.data || [];

  const getStockColor = (actual, min) => {
    if (actual >= min * 2.5) return 'bg-green-500';
    if (actual >= min) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleUpdateMin = async (puntoId, tipo, nuevoValor) => {
    if (!isOnline) {
      addNotification('warning', 'No hay conexión. Los cambios se sincronizarán cuando vuelva la conexión.');
      return;
    }
    
    try {
      await apiService.updateStockMinimo(puntoId, tipo, nuevoValor);
      addNotification('success', `Stock mínimo actualizado correctamente`);
      refetch(); // Recargar datos
    } catch (error) {
      addNotification('error', 'Error al actualizar el stock mínimo');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Stock - Sistema Semáforo"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div> OK
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div> Bajo
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div> Crítico
            </span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showConfig 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
            } shadow transition-all duration-200`}
          >
            <Settings className="w-4 h-4" />
            Configurar Mínimos
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className={`grid ${window.innerWidth < 640 ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            {stockData.map((punto) => (
              <div key={punto.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {punto.nombre}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Precintos</span>
                      <div className="flex items-center gap-2">
                        {showConfig ? (
                          <>
                            <span className="text-sm text-gray-500">Mínimo:</span>
                            <EditableInput
                              value={punto.precintosMin}
                              onSave={(value) => handleUpdateMin(punto.id, 'precintos', value)}
                              darkMode={darkMode}
                            />
                          </>
                        ) : null}
                        <span className="font-bold">{punto.precintos}/{punto.precintosMax}</span>
                      </div>
                    </div>
                    <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full overflow-hidden relative`}>
                      <div 
                        className={`h-full ${getStockColor(punto.precintos, punto.precintosMin)} transition-all duration-500`}
                        style={{ width: `${(punto.precintos / punto.precintosMax) * 100}%` }}
                      />
                      {showConfig && (
                        <div 
                          className="absolute top-0 h-full w-1 bg-black opacity-50"
                          style={{ left: `${(punto.precintosMin / punto.precintosMax) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Eslingas</span>
                      <div className="flex items-center gap-2">
                        {showConfig ? (
                          <>
                            <span className="text-sm text-gray-500">Mínimo:</span>
                            <EditableInput
                              value={punto.eslingasMin}
                              onSave={(value) => handleUpdateMin(punto.id, 'eslingas', value)}
                              darkMode={darkMode}
                            />
                          </>
                        ) : null}
                        <span className="font-bold">{punto.eslingas}/{punto.eslingasMax}</span>
                      </div>
                    </div>
                    <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full overflow-hidden relative`}>
                      <div 
                        className={`h-full ${getStockColor(punto.eslingas, punto.eslingasMin)} transition-all duration-500`}
                        style={{ width: `${(punto.eslingas / punto.eslingasMax) * 100}%` }}
                      />
                      {showConfig && (
                        <div 
                          className="absolute top-0 h-full w-1 bg-black opacity-50"
                          style={{ left: `${(punto.eslingasMin / punto.eslingasMax) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg">
                    Registrar Encomienda
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showConfig && (
          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            <p className="text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              Ajusta los valores mínimos para cambiar los umbrales de alerta. La línea negra en las barras indica el valor mínimo configurado.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ==================== VISTA: ALERTAS ====================
const AlertasModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const { isOnline } = useConnection();
  const [userName] = useState('Juan Pérez'); // Simulación del usuario actual
  
  // Usar el hook de API con polling automático
  const { data: alertasData, loading, refetch } = useApiData(() => apiService.getAlertas());
  const alertas = alertasData?.data || [];

  const handleResolverAlerta = async (alertaId) => {
    if (!isOnline) {
      addNotification('warning', 'No hay conexión. Los cambios se sincronizarán cuando vuelva la conexión.');
      return;
    }
    
    try {
      await apiService.resolverAlerta(alertaId, userName);
      addNotification('success', 'Alerta marcada como resuelta');
      refetch(); // Recargar datos
    } catch (error) {
      addNotification('error', 'Error al resolver la alerta');
    }
  };

  const handleIgnorarAlerta = async (alertaId) => {
    // Aquí podrías agregar la lógica para ignorar
    addNotification('info', 'Alerta ignorada');
    refetch();
  };

  const alertasActivas = alertas.filter(a => !a.resuelto);
  const alertasResueltas = alertas.filter(a => a.resuelto);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Alertas Operativas"
      size="medium"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-6">
          <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow inline-block`}>
            <span className="text-2xl font-bold text-orange-500">{alertasActivas.length}</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>activas</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Alertas Activas
            </h2>
            
            {alertasActivas.map((alerta) => (
              <div key={alerta.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                alerta.prioridad === 'alta' ? 'border-red-500' : 'border-yellow-500'
              }`}>
                <div className={`flex ${window.innerWidth < 640 ? 'flex-col gap-4' : 'justify-between items-start'}`}>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${PRIORIDAD_ALERTA[alerta.prioridad].color}`}>
                      {alerta.tipo}
                    </span>
                    <p className={`mt-2 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {alerta.mensaje}
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Hace {alerta.tiempo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolverAlerta(alerta.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
                    >
                      Resolver
                    </button>
                    <button 
                      onClick={() => handleIgnorarAlerta(alerta.id)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {alertasActivas.length === 0 && (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay alertas activas</p>
              </div>
            )}
            
            {alertasResueltas.length > 0 && (
              <>
                <h2 className={`text-xl font-semibold mt-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Alertas Resueltas
                </h2>
                
                {alertasResueltas.map((alerta) => (
                  <div key={alerta.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-200'} opacity-75`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {alerta.mensaje}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Resuelto por {alerta.resueltoBy} - {alerta.resueltoAt}
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ==================== VISTA: MAPA ====================
const MapaModal = ({ isOpen, onClose, darkMode }) => {
  // Usar el hook de API con polling automático
  const { data: camionesData, loading } = useApiData(() => apiService.getCamionesEnRuta());
  const camionesEnRuta = camionesData?.data || [];
  
  useEffect(() => {
    // Aquí podrías suscribirte a actualizaciones de posición en tiempo real via WebSocket
    if (CONFIG.ENABLE_WEBSOCKETS) {
      const unsubscribe = wsService.subscribe('positionUpdate', (data) => {
        console.log('Nueva posición recibida:', data);
        // Actualizar las posiciones en el mapa
      });
      
      return unsubscribe;
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mapa en Vivo - Tránsitos a Montevideo"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> En ruta
            </span>
            <span className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Detenido
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className={`relative h-64 sm:h-96 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-8 overflow-hidden`}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <span className="text-sm font-bold">Montevideo</span>
                </div>
              </div>
              
              {camionesEnRuta.map((camion, idx) => {
                const positions = ['top-1/4 left-1/4', 'top-1/3 right-1/4', 'bottom-1/4 left-1/3', 'top-1/2 right-1/3', 'bottom-1/3 right-1/2'];
                return (
                  <div key={camion.id} className={`absolute ${positions[idx % positions.length]}`}>
                    <Tooltip text={`${camion.matricula} - ETA: ${camion.eta}`}>
                      <div className={`p-2 rounded-lg ${camion.estado === 'detenido' ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse cursor-pointer hover:scale-110 transition-transform`}>
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                    </Tooltip>
                    <span className={`text-xs mt-1 block text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {camion.destino}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className={`grid ${window.innerWidth < 640 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {camionesEnRuta.map((camion) => (
                <div key={camion.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300 flex justify-between items-center`}>
                  <div>
                    <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {camion.matricula}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      → {camion.destino}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ETA</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{camion.eta}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{camion.minutos} min</p>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${camion.estado === 'detenido' ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

// ==================== VISTA: BASE DE DATOS ====================
const CamionesModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const [searchType, setSearchType] = useState('matricula');
  const [searchValue, setSearchValue] = useState('');
  
  const handleSearch = () => {
    if (searchValue) {
      addNotification('info', `Buscando por ${searchType}: ${searchValue}`);
      // Aquí iría la lógica de búsqueda real
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Base de Datos de Camiones"
      size="medium"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg mb-6`}>
          <div className={`flex ${window.innerWidth < 640 ? 'flex-col' : 'flex-row'} gap-4 mb-4`}>
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}
            >
              <option value="matricula">Por Matrícula</option>
              <option value="cedula">Por Cédula</option>
            </select>
            
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar..."
              className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}`}
            />
            
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              Buscar
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg hover:shadow-xl transition-all duration-300`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Camión ABC 1234
            </h3>
            <div className={`grid ${window.innerWidth < 640 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choferes asignados:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Juan Rodríguez - CI: 4.123.456-7</li>
                  <li>• María González - CI: 3.987.654-3</li>
                </ul>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Observaciones:</p>
                <p className="mt-2">Camión con caja refrigerada. Mantenimiento frecuente.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ==================== VISTA: DASHBOARD ====================
const DashboardView = ({ darkMode, setDarkMode, onModuleClick }) => {
  // Usar el hook de API con polling automático para notificaciones
  const { data: notificationsData } = useApiData(() => apiService.getNotifications());
  const notifications = notificationsData || { transitos: 0, alertas: 0, desprecintar: 0 };

  const modules = [
    { id: 'transitos', title: 'Tránsitos Pendientes', icon: Package, color: 'bg-blue-600', count: 12, notification: notifications.transitos },
    { id: 'mapa', title: 'Mapa en Vivo', icon: MapPin, color: 'bg-green-600', count: 8 },
    { id: 'stock', title: 'Gestión de Stock', icon: Database, color: 'bg-purple-600', alert: true },
    { id: 'alertas', title: 'Alertas Operativas', icon: AlertTriangle, color: 'bg-orange-600', count: 3, notification: notifications.alertas },
    { id: 'camiones', title: 'Base de Datos', icon: Truck, color: 'bg-teal-600', count: 1247 },
    { id: 'desprecintar', title: 'Por Desprecintar', subtitle: 'Llegadas pendientes', icon: Package, color: 'bg-red-600', count: 7, importante: true, notification: notifications.desprecintar }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg px-4 sm:px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sistema de Precintado Aduanero
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Puerto de Montevideo
            </p>
          </div>
          
          <ConnectionStatus darkMode={darkMode} />
          
          <Tooltip text={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`ml-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-200`}
            >
              {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
            </button>
          </Tooltip>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <div className={`grid ${window.innerWidth < 640 ? 'grid-cols-1' : 'grid-cols-3'} gap-4 sm:gap-6 max-w-6xl mx-auto`}>
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onModuleClick(module.id)}
                className={`
                  relative
                  ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
                  p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                  ${module.importante ? 'border-2 border-yellow-500 animate-pulse-border' : 'border-2 border-transparent'} 
                  hover:border-blue-500 transform hover:-translate-y-1
                `}
              >
                {module.notification > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                    {module.notification}
                  </div>
                )}
                
                <div className={`${module.color} p-4 rounded-xl inline-block mb-4 transform transition-transform hover:scale-110`}>
                  <Icon className="w-8 sm:w-12 h-8 sm:h-12 text-white" />
                </div>
                
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {module.title}
                </h3>
                
                {module.subtitle && (
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {module.subtitle}
                  </p>
                )}
                
                {module.count && (
                  <p className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {module.count}
                  </p>
                )}
                
                {module.alert && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    Stock bajo
                  </span>
                )}
                
                {module.id === 'desprecintar' && (
                  <div className="absolute top-4 right-4">
                    <ArrowDown className="w-5 h-5 text-yellow-500 animate-bounce" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className={`mt-8 max-w-6xl mx-auto p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Resumen del Día
          </h2>
          <div className={`grid ${window.innerWidth < 640 ? 'grid-cols-2' : 'grid-cols-5'} gap-4`}>
            <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-green-500">47</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Precintados</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-blue-500">12</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>En Espera</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-red-500">7</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por Desprecintar</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-orange-500">3</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alertas</p>
            </div>
            <div className={`text-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${window.innerWidth < 640 ? 'col-span-2' : ''}`}>
              <p className="text-2xl sm:text-3xl font-bold text-purple-500">98%</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Eficiencia</p>
            </div>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: rgb(234 179 8);
            box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4);
          }
          50% {
            border-color: rgb(250 204 21);
            box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.2);
          }
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [modals, setModals] = useState({
    transitos: false,
    desprecintar: false,
    stock: false,
    alertas: false,
    mapa: false,
    camiones: false
  });

  const handleModuleClick = (moduleId) => {
    setModals(prev => ({ ...prev, [moduleId]: true }));
  };

  const handleCloseModal = (moduleId) => {
    setModals(prev => ({ ...prev, [moduleId]: false }));
  };

  return (
    <ConnectionProvider>
      <NotificationProvider>
        <DashboardView 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          onModuleClick={handleModuleClick} 
        />
        
        {/* Modales para cada módulo */}
        <TransitosPendientesModal 
          isOpen={modals.transitos} 
          onClose={() => handleCloseModal('transitos')} 
          darkMode={darkMode} 
        />
        
        <DesprecintarModal 
          isOpen={modals.desprecintar} 
          onClose={() => handleCloseModal('desprecintar')} 
          darkMode={darkMode} 
        />
        
        <StockModal 
          isOpen={modals.stock} 
          onClose={() => handleCloseModal('stock')} 
          darkMode={darkMode} 
        />
        
        <AlertasModal 
          isOpen={modals.alertas} 
          onClose={() => handleCloseModal('alertas')} 
          darkMode={darkMode} 
        />
        
        <MapaModal 
          isOpen={modals.mapa} 
          onClose={() => handleCloseModal('mapa')} 
          darkMode={darkMode} 
        />
        
        <CamionesModal 
          isOpen={modals.camiones} 
          onClose={() => handleCloseModal('camiones')} 
          darkMode={darkMode} 
        />
      </NotificationProvider>
    </ConnectionProvider>
  );
};

export default App; 
