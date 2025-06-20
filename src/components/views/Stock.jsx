import React, { useState } from 'react';
import { Settings, Info, Package, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Modal, EditableInput, Tooltip } from '../common';
import { useApiData, useNotification, useConnection } from '../../hooks';
import { getStockColor, calcularPorcentajeStock } from '../../utils/helpers';
import apiService from '../../services/api.service';

/**
 * Vista de Gestión de Stock
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.darkMode - Si está en modo oscuro
 */
const StockModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const { isOnline, addPendingOperation } = useConnection();
  const [showConfig, setShowConfig] = useState(false);
  const [selectedPunto, setSelectedPunto] = useState(null);
  
  // Usar el hook de API con polling automático
  const { data: stockDataResponse, loading, error, refetch } = useApiData(
    () => apiService.getStock(),
    [],
    {
      pollingInterval: 60000, // 1 minuto
      wsEventName: 'stock_update',
      cacheKey: 'stock'
    }
  );

  const stockData = stockDataResponse?.data || [];

  const handleUpdateMin = async (puntoId, tipo, nuevoValor) => {
    const valor = parseInt(nuevoValor);
    
    if (isNaN(valor) || valor < 0) {
      addNotification('error', 'El valor debe ser un número positivo');
      return;
    }

    try {
      if (!isOnline) {
        addPendingOperation({
          type: 'UPDATE_STOCK_MIN',
          data: { puntoId, tipo, valor },
          execute: async () => {
            await apiService.updateStockMinimo(puntoId, tipo, valor);
          }
        });
        
        addNotification('warning', 'Cambio guardado localmente. Se sincronizará cuando vuelva la conexión.');
      } else {
        await apiService.updateStockMinimo(puntoId, tipo, valor);
        addNotification('success', `Stock mínimo actualizado correctamente`);
        refetch();
      }
    } catch (error) {
      addNotification('error', 'Error al actualizar el stock mínimo');
      console.error(error);
    }
  };

  const handleRegistrarMovimiento = (punto) => {
    setSelectedPunto(punto);
    // Aquí se abriría un modal para registrar el movimiento
    addNotification('info', 'Función de registro de movimientos próximamente');
  };

  const calcularEstadoGeneral = () => {
    let critico = 0;
    let bajo = 0;
    let optimo = 0;
    
    stockData.forEach(punto => {
      // Precintos
      if (punto.precintos < punto.precintosMin) critico++;
      else if (punto.precintos < punto.precintosMin * 2.5) bajo++;
      else optimo++;
      
      // Eslingas
      if (punto.eslingas < punto.eslingasMin) critico++;
      else if (punto.eslingas < punto.eslingasMin * 2.5) bajo++;
      else optimo++;
    });
    
    return { critico, bajo, optimo };
  };

  const estadoGeneral = calcularEstadoGeneral();

  const StockBar = ({ actual, max, min, tipo, puntoId, showConfig }) => {
    const porcentaje = calcularPorcentajeStock(actual, max);
    const color = getStockColor(actual, min);
    
    return (
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm capitalize">{tipo}</span>
          <div className="flex items-center gap-2">
            {showConfig && (
              <>
                <span className="text-xs text-gray-500">Mínimo:</span>
                <EditableInput
                  value={min}
                  onSave={(value) => handleUpdateMin(puntoId, tipo, value)}
                  type="number"
                  darkMode={darkMode}
                  showEditIcon={false}
                  className="text-sm"
                />
              </>
            )}
            <span className="font-bold text-sm">
              {actual}/{max}
            </span>
          </div>
        </div>
        <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full overflow-hidden relative`}>
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${porcentaje}%` }}
          />
          {showConfig && (
            <div 
              className="absolute top-0 h-full w-0.5 bg-black opacity-50"
              style={{ left: `${(min / max) * 100}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{porcentaje}%</span>
          {actual < min && (
            <span className="text-xs text-red-500 font-medium">
              ¡Stock crítico!
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Stock - Sistema Semáforo"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Header con leyenda y configuración */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div> 
                Óptimo (&gt;2.5x mínimo)
              </span>
              <span className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div> 
                Bajo (&lt;2.5x mínimo)
              </span>
              <span className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div> 
                Crítico (&lt;mínimo)
              </span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2
                ${showConfig 
                  ? 'bg-blue-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } shadow transition-all duration-200
              `}
            >
              <Settings className="w-4 h-4" />
              {showConfig ? 'Guardar' : 'Configurar'} Mínimos
            </button>
          </div>
          
          {/* Estado general */}
          <div className={`
            mt-4 p-4 rounded-lg flex items-center justify-between
            ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold">Estado General del Stock</h3>
                <p className="text-sm text-gray-500">
                  {stockData.length} puntos de distribución
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{estadoGeneral.optimo}</p>
                <p className="text-xs text-gray-500">Óptimos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{estadoGeneral.bajo}</p>
                <p className="text-xs text-gray-500">Bajos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{estadoGeneral.critico}</p>
                <p className="text-xs text-gray-500">Críticos</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de puntos de stock */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error al cargar el stock</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stockData.map((punto) => {
              const necesitaReposicion = 
                punto.precintos < punto.precintosMin || 
                punto.eslingas < punto.eslingasMin;
              
              return (
                <div 
                  key={punto.id} 
                  className={`
                    p-6 rounded-xl shadow-lg hover:shadow-xl 
                    transition-all duration-300
                    ${darkMode ? 'bg-gray-700' : 'bg-white'}
                    ${necesitaReposicion ? 'ring-2 ring-red-500' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {punto.nombre}
                      </h3>
                      {necesitaReposicion && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-4 h-4" />
                          Requiere reposición urgente
                        </p>
                      )}
                    </div>
                    <Tooltip text="Ver historial">
                      <button className={`
                        p-2 rounded-lg transition-colors
                        ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}
                      `}>
                        <TrendingUp className="w-5 h-5" />
                      </button>
                    </Tooltip>
                  </div>
                  
                  <div className="space-y-4">
                    <StockBar
                      actual={punto.precintos}
                      max={punto.precintosMax}
                      min={punto.precintosMin}
                      tipo="precintos"
                      puntoId={punto.id}
                      showConfig={showConfig}
                    />
                    
                    <StockBar
                      actual={punto.eslingas}
                      max={punto.eslingasMax}
                      min={punto.eslingasMin}
                      tipo="eslingas"
                      puntoId={punto.id}
                      showConfig={showConfig}
                    />
                    
                    {/* Información adicional */}
                    {(punto.ultimaReposicion || punto.proximaReposicion) && (
                      <div className={`
                        pt-4 mt-4 border-t 
                        ${darkMode ? 'border-gray-600' : 'border-gray-300'}
                        flex justify-between text-sm
                      `}>
                        {punto.ultimaReposicion && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">Última:</span>
                            <span>{punto.ultimaReposicion}</span>
                          </div>
                        )}
                        {punto.proximaReposicion && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-500">Próxima:</span>
                            <span className="font-medium">{punto.proximaReposicion}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleRegistrarMovimiento(punto)}
                      className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg"
                    >
                      Registrar Movimiento
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Información adicional */}
        {showConfig && (
          <div className={`
            mt-6 p-4 rounded-lg 
            ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} 
            border ${darkMode ? 'border-gray-600' : 'border-gray-300'}
          `}>
            <p className="text-sm flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <span>
                Ajusta los valores mínimos para cambiar los umbrales de alerta. 
                La línea negra en las barras indica el valor mínimo configurado.
                Los cambios se guardan automáticamente.
              </span>
            </p>
          </div>
        )}
        
        {!isOnline && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Sin conexión - Los cambios se sincronizarán cuando vuelva la conexión
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StockModal;