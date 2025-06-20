import React, { useState, useMemo } from 'react';
import { Package, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Modal, SearchBar, FilterPanel } from '../common';
import { useApiData, useNotification, useConnection } from '../../hooks';
import { COUNTRY_FLAGS } from '../../constants/constants';
import apiService from '../../services/api.service';

/**
 * Vista de Tránsitos por Desprecintar
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.darkMode - Si está en modo oscuro
 */
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
  const { isOnline, addPendingOperation } = useConnection();
  
  // Usar el hook de API con polling automático
  const { data: transitosData, loading, error, refetch } = useApiData(
    () => apiService.getTransitosDesprecintar(),
    [],
    {
      pollingInterval: 30000,
      wsEventName: 'desprecinto_update',
      cacheKey: 'transitos_desprecintar'
    }
  );

  const transitosDesprecintar = transitosData?.data || [];

  const handleDesprecintar = (transito) => {
    setSelectedTransito(transito);
    setShowConfirmModal(true);
  };

  const handleConfirmDesprecintar = async () => {
    if (!selectedTransito) return;

    try {
      if (!isOnline) {
        // Guardar operación para sincronizar después
        addPendingOperation({
          type: 'DESPRECINTAR',
          data: { transitoId: selectedTransito.id, precinto: selectedTransito.precinto },
          execute: async () => {
            await apiService.desprecintar(selectedTransito.id);
          }
        });
        
        addNotification('warning', 'Operación guardada. Se procesará cuando vuelva la conexión.');
      } else {
        await apiService.desprecintar(selectedTransito.id);
        addNotification('success', `Precinto ${selectedTransito.precinto} removido exitosamente`);
        refetch();
      }
      
      setShowConfirmModal(false);
      setSelectedTransito(null);
    } catch (error) {
      addNotification('error', 'Error al procesar el desprecintado');
      console.error(error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Obtener opciones únicas para filtros
  const filterOptions = useMemo(() => {
    const origenes = [...new Set(transitosDesprecintar.map(t => t.origen))];
    const destinos = [...new Set(transitosDesprecintar.map(t => t.destino))];
    
    return { origenes, destinos };
  }, [transitosDesprecintar]);

  // Filtrado
  const filteredTransitos = useMemo(() => {
    return transitosDesprecintar.filter(transito => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        transito.matricula.toLowerCase().includes(searchLower) ||
        transito.precinto.toLowerCase().includes(searchLower) ||
        (transito.chofer && transito.chofer.toLowerCase().includes(searchLower));
      
      if (!matchSearch) return false;
      
      if (filters.origen && transito.origen !== filters.origen) return false;
      if (filters.destino && transito.destino !== filters.destino) return false;
      if (filters.estado && transito.estado !== filters.estado) return false;
      
      return true;
    });
  }, [transitosDesprecintar, searchTerm, filters]);

  const filterConfig = [
    {
      name: 'origen',
      label: 'Origen',
      type: 'select',
      value: filters.origen,
      options: filterOptions.origenes.map(origen => ({
        value: origen,
        label: `${COUNTRY_FLAGS[origen] || '🌍'} ${origen}`
      }))
    },
    {
      name: 'destino',
      label: 'Destino',
      type: 'select',
      value: filters.destino,
      options: filterOptions.destinos.map(destino => ({
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
        { value: 'Esperando', label: 'Esperando' },
        { value: 'En ruta', label: 'En ruta' }
      ]
    }
  ];

  // Modal de confirmación
  const ConfirmModal = () => (
    <Modal
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      title="Confirmar Desprecintado"
      size="small"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                ¿Confirmar desprecintado del vehículo {selectedTransito?.matricula}?
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </div>
        
        <div className={`space-y-2 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Precinto:</span>
            <span className="text-sm font-mono">{selectedTransito?.precinto}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Origen:</span>
            <span className="text-sm">{selectedTransito?.origen}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Chofer:</span>
            <span className="text-sm">{selectedTransito?.chofer || 'No especificado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Carga:</span>
            <span className="text-sm">{selectedTransito?.carga || 'No especificada'}</span>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            onClick={handleConfirmDesprecintar}
            disabled={!isOnline && !selectedTransito}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            Confirmar Desprecintado
          </button>
          <button 
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
        
        {!isOnline && (
          <p className="text-xs text-yellow-500 text-center">
            Sin conexión - La operación se procesará cuando vuelva la conexión
          </p>
        )}
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
        {/* Header con búsqueda y contador */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por matrícula o precinto..."
              darkMode={darkMode}
            />
          </div>
          <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow`}>
            <span className="text-2xl font-bold text-red-500">{filteredTransitos.length}</span>
            <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>pendientes</span>
          </div>
        </div>
        
        {/* Filtros */}
        <FilterPanel
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          darkMode={darkMode}
          onReset={() => {
            setFilters({ origen: '', destino: '', estado: '' });
            setSearchTerm('');
          }}
        />
        
        {/* Lista de tránsitos */}
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
        ) : filteredTransitos.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No se encontraron tránsitos con los filtros aplicados</p>
          </div>
        ) : (
          <div className="grid gap-4 mt-6">
            {filteredTransitos.map((transito) => (
              <div 
                key={transito.id} 
                className={`
                  p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl 
                  transition-all duration-300 transform hover:-translate-y-1
                  ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                `}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-1">
                      {COUNTRY_FLAGS[transito.origen] || '🌍'}
                    </span>
                    <div>
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transito.matricula}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
                        <span>{transito.origen}</span>
                        <span>→</span>
                        <span>{transito.destino}</span>
                        <span className="text-xl ml-1">
                          {COUNTRY_FLAGS[transito.destino] || '🌍'}
                        </span>
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Precinto: <span className="font-mono font-semibold">{transito.precinto}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Información de llegada */}
                  <div className="text-center sm:text-right">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Llegada estimada
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                      <Clock className="w-5 h-5" />
                      {transito.llegada}
                    </p>
                  </div>
                  
                  {/* Estado y acción */}
                  <div className="flex flex-col sm:items-end gap-3">
                    <span className={`
                      px-4 py-2 rounded-full text-sm font-semibold text-center
                      ${transito.estado === 'En puerto' ? 'bg-green-500 text-white' :
                        transito.estado === 'En aduana' ? 'bg-blue-500 text-white' :
                        transito.estado === 'En ruta' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-gray-900'}
                    `}>
                      {transito.estado}
                    </span>
                    
                    <button 
                      onClick={() => handleDesprecintar(transito)}
                      disabled={transito.estado === 'En ruta'}
                      className={`
                        px-6 py-3 rounded-lg font-semibold 
                        transition-all duration-200 hover:shadow-lg
                        ${transito.estado === 'En ruta' 
                          ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                          : 'bg-red-500 hover:bg-red-600 text-white active:scale-95'
                        }
                      `}
                    >
                      Desprecintar
                    </button>
                  </div>
                </div>
                
                {/* Información adicional */}
                {(transito.chofer || transito.empresa || transito.carga) && (
                  <div className={`
                    mt-4 pt-4 border-t 
                    ${darkMode ? 'border-gray-600' : 'border-gray-300'}
                    grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm
                  `}>
                    {transito.chofer && (
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Chofer:
                        </span>
                        <span className="ml-2 font-medium">{transito.chofer}</span>
                      </div>
                    )}
                    {transito.empresa && (
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Empresa:
                        </span>
                        <span className="ml-2 font-medium">{transito.empresa}</span>
                      </div>
                    )}
                    {transito.carga && (
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Carga:
                        </span>
                        <span className="ml-2 font-medium">{transito.carga}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal de confirmación */}
      <ConfirmModal />
    </Modal>
  );
};

export default DesprecintarModal;