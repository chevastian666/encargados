import React, { useState } from 'react';
import { 
  Package, AlertTriangle, TrendingDown, TrendingUp, 
  Edit2, Save, X, RefreshCw, Download, Plus,
  Building, BarChart3, AlertCircle, CheckCircle
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { MiniChart } from '../common';
import { useApiData, useNotification } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal de Gestión de Stock optimizado para tablet
 * - Visualización clara del inventario
 * - Edición inline con touch grande
 * - Gráficos de tendencias
 */
const StockTablet = ({ isOpen, onClose, darkMode }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const { success, error, warning, info } = useNotification();

  // Cargar datos de stock
  const { data: stockData, loading, refetch } = useApiData(
    () => apiService.getStock(),
    [],
    { pollingInterval: 30000 }
  );

  const stock = stockData?.puntos || [];

  // Calcular totales
  const totales = stock.reduce((acc, punto) => ({
    lona: acc.lona + punto.stock.lona,
    contenedor: acc.contenedor + punto.stock.contenedor,
    refrigerado: acc.refrigerado + punto.stock.refrigerado
  }), { lona: 0, contenedor: 0, refrigerado: 0 });

  // Determinar nivel de alerta
  const getAlertLevel = (actual, minimo, critico) => {
    if (actual <= critico) return 'critical';
    if (actual <= minimo) return 'low';
    return 'normal';
  };

  // Colores según nivel
  const alertColors = {
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: 'text-red-500' },
    low: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: 'text-yellow-500' },
    normal: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: 'text-green-500' }
  };

  // Manejar edición
  const handleEdit = (puntoId, tipo) => {
    const punto = stock.find(p => p.id === puntoId);
    setEditingItem(`${puntoId}-${tipo}`);
    setTempValues({
      [`${puntoId}-${tipo}-minimo`]: punto.minimos[tipo],
      [`${puntoId}-${tipo}-critico`]: punto.criticos[tipo]
    });
  };

  const handleSave = async (puntoId, tipo) => {
    try {
      const minimoKey = `${puntoId}-${tipo}-minimo`;
      const criticoKey = `${puntoId}-${tipo}-critico`;
      
      await apiService.updateStockMinimo(puntoId, tipo, {
        minimo: parseInt(tempValues[minimoKey]),
        critico: parseInt(tempValues[criticoKey])
      });
      
      success('Valores actualizados correctamente');
      setEditingItem(null);
      refetch();
    } catch (error) {
      error('Error al actualizar valores');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setTempValues({});
  };

  // Card de punto de stock
  const PuntoStockCard = ({ punto }) => (
    <div className={`
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      border rounded-xl p-6 space-y-4
    `}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="w-6 h-6 text-blue-500" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {punto.nombre}
          </h3>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
          {punto.responsable}
        </span>
      </div>

      {/* Tipos de precinto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['lona', 'contenedor', 'refrigerado'].map((tipo) => {
          const actual = punto.stock[tipo];
          const minimo = punto.minimos[tipo];
          const critico = punto.criticos[tipo];
          const tendencia = punto.tendencias?.[tipo] || [];
          const nivel = getAlertLevel(actual, minimo, critico);
          const colors = alertColors[nivel];
          const isEditing = editingItem === `${punto.id}-${tipo}`;
          
          return (
            <div key={tipo} className={`
              ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
              rounded-lg p-4 space-y-3
            `}>
              {/* Tipo y estado */}
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tipo}
                </h4>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${colors.bg}`}>
                  {nivel === 'critical' && <AlertTriangle className={`w-4 h-4 ${colors.icon}`} />}
                  {nivel === 'low' && <AlertCircle className={`w-4 h-4 ${colors.icon}`} />}
                  {nivel === 'normal' && <CheckCircle className={`w-4 h-4 ${colors.icon}`} />}
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {nivel === 'critical' ? 'Crítico' : nivel === 'low' ? 'Bajo' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Stock actual */}
              <div className="text-center py-2">
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {actual}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  unidades
                </p>
              </div>

              {/* Mini gráfico */}
              {tendencia.length > 0 && (
                <div className="h-12">
                  <MiniChart 
                    data={tendencia} 
                    color={nivel === 'critical' ? 'red' : nivel === 'low' ? 'orange' : 'green'}
                    height={48}
                    filled={true}
                  />
                </div>
              )}

              {/* Valores mínimos */}
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      value={tempValues[`${punto.id}-${tipo}-minimo`] || ''}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        [`${punto.id}-${tipo}-minimo`]: e.target.value
                      })}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-center
                        ${darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                      `}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Stock Crítico
                    </label>
                    <input
                      type="number"
                      value={tempValues[`${punto.id}-${tipo}-critico`] || ''}
                      onChange={(e) => setTempValues({
                        ...tempValues,
                        [`${punto.id}-${tipo}-critico`]: e.target.value
                      })}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-center
                        ${darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                        }
                      `}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <TabletButton
                      onClick={() => handleSave(punto.id, tipo)}
                      variant="success"
                      size="small"
                      fullWidth
                      darkMode={darkMode}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Guardar
                    </TabletButton>
                    <TabletButton
                      onClick={handleCancel}
                      variant="secondary"
                      size="small"
                      fullWidth
                      darkMode={darkMode}
                      icon={<X className="w-4 h-4" />}
                    >
                      Cancelar
                    </TabletButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Mínimo: {minimo}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Crítico: {critico}
                    </span>
                  </div>
                  <TabletButton
                    onClick={() => handleEdit(punto.id, tipo)}
                    variant="secondary"
                    size="small"
                    fullWidth
                    darkMode={darkMode}
                    icon={<Edit2 className="w-4 h-4" />}
                  >
                    Editar
                  </TabletButton>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

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
      <TabletButton
        onClick={() => info('Exportando inventario...')}
        variant="secondary"
        size="small"
        darkMode={darkMode}
        icon={<Download className="w-5 h-5" />}
      >
        Exportar
      </TabletButton>
    </div>
  );

  return (
    <TabletModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Stock"
      darkMode={darkMode}
      headerActions={headerActions}
    >
      {/* Resumen general */}
      <div className={`
        ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
        rounded-xl p-6 mb-6
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Inventario Total
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(totales).map(([tipo, cantidad]) => (
            <div key={tipo} className="text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {cantidad}
              </p>
              <p className={`text-sm capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {tipo}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de puntos */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : stock.length === 0 ? (
          <div className={`
            text-center py-12 rounded-lg border-2 border-dashed
            ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
          `}>
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay datos de stock disponibles</p>
          </div>
        ) : (
          stock.map((punto) => (
            <PuntoStockCard key={punto.id} punto={punto} />
          ))
        )}
      </div>

      {/* Alertas activas */}
      {stock.some(p => ['lona', 'contenedor', 'refrigerado'].some(t => 
        getAlertLevel(p.stock[t], p.minimos[t], p.criticos[t]) !== 'normal'
      )) && (
        <div className={`
          mt-6 p-4 rounded-lg border
          ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}
        `}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
              Atención: Hay niveles de stock que requieren reposición
            </p>
          </div>
        </div>
      )}
    </TabletModal>
  );
};

export default StockTablet;