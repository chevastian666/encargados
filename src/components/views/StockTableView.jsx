import React from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import ResponsiveTable from '../common/ResponsiveTable';
import TabletButton from '../common/TabletButton';

/**
 * Vista de tabla para el stock con headers pegajosos
 * Demuestra el uso de tablas responsivas con scroll y sticky headers
 */
const StockTableView = ({ stock, darkMode, onEdit }) => {
  // Configuración de columnas de la tabla
  const columns = [
    {
      key: 'punto',
      header: 'Punto de Stock',
      width: '200px',
      render: (_, row) => (
        <div>
          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {row.nombre}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {row.responsable}
          </div>
        </div>
      )
    },
    {
      key: 'lona',
      header: 'Lona',
      render: (_, row) => {
        const nivel = getAlertLevel(row.stock.lona, row.minimos.lona, row.criticos.lona);
        return (
          <div className="text-center">
            <div className={`text-lg font-bold ${getStockColor(nivel, darkMode)}`}>
              {row.stock.lona}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Min: {row.minimos.lona} / Crít: {row.criticos.lona}
            </div>
          </div>
        );
      }
    },
    {
      key: 'contenedor',
      header: 'Contenedor',
      render: (_, row) => {
        const nivel = getAlertLevel(row.stock.contenedor, row.minimos.contenedor, row.criticos.contenedor);
        return (
          <div className="text-center">
            <div className={`text-lg font-bold ${getStockColor(nivel, darkMode)}`}>
              {row.stock.contenedor}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Min: {row.minimos.contenedor} / Crít: {row.criticos.contenedor}
            </div>
          </div>
        );
      }
    },
    {
      key: 'refrigerado',
      header: 'Refrigerado',
      render: (_, row) => {
        const nivel = getAlertLevel(row.stock.refrigerado, row.minimos.refrigerado, row.criticos.refrigerado);
        return (
          <div className="text-center">
            <div className={`text-lg font-bold ${getStockColor(nivel, darkMode)}`}>
              {row.stock.refrigerado}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Min: {row.minimos.refrigerado} / Crít: {row.criticos.refrigerado}
            </div>
          </div>
        );
      }
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_, row) => {
        const estados = ['lona', 'contenedor', 'refrigerado'].map(tipo => 
          getAlertLevel(row.stock[tipo], row.minimos[tipo], row.criticos[tipo])
        );
        const peorEstado = estados.includes('critical') ? 'critical' : 
                           estados.includes('low') ? 'low' : 'normal';
        
        return (
          <div className="flex items-center justify-center">
            {peorEstado === 'critical' && (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Crítico</span>
              </div>
            )}
            {peorEstado === 'low' && (
              <div className="flex items-center text-yellow-500">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Bajo</span>
              </div>
            )}
            {peorEstado === 'normal' && (
              <div className="flex items-center text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Normal</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex justify-center">
          <TabletButton
            onClick={() => onEdit(row)}
            variant="secondary"
            size="small"
            darkMode={darkMode}
            icon={<Edit2 className="w-4 h-4" />}
          >
            Editar
          </TabletButton>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <ResponsiveTable
        columns={columns}
        data={stock}
        darkMode={darkMode}
        maxHeight="70vh"
        stickyHeader={true}
        className="shadow-lg"
        emptyMessage="No hay datos de stock disponibles"
      />
    </div>
  );
};

// Funciones auxiliares
const getAlertLevel = (actual, minimo, critico) => {
  if (actual <= critico) return 'critical';
  if (actual <= minimo) return 'low';
  return 'normal';
};

const getStockColor = (nivel, darkMode) => {
  switch (nivel) {
    case 'critical':
      return 'text-red-500';
    case 'low':
      return 'text-yellow-500';
    default:
      return darkMode ? 'text-white' : 'text-gray-900';
  }
};

export default StockTableView;