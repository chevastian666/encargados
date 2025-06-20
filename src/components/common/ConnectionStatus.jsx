import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Check, X } from 'lucide-react';
import { useConnection } from '../../contexts/ConnectionContext';
import { getRelativeTime } from '../../utils/helpers';
import Tooltip from './Tooltip';

/**
 * Componente ConnectionStatus - Muestra el estado de conexión
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.darkMode - Si está en modo oscuro
 * @param {boolean} props.showDetails - Si muestra detalles expandidos
 * @param {boolean} props.compact - Si usa diseño compacto
 */
const ConnectionStatus = ({ 
  darkMode = false,
  showDetails = true,
  compact = false
}) => {
  const { 
    isOnline, 
    wsConnected, 
    lastSync, 
    sync, 
    syncStatus,
    pendingOperations,
    connectionStatus 
  } = useConnection();
  
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await sync();
    setTimeout(() => setSyncing(false), 1000);
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Sincronizando...';
      case 'success':
        return 'Sincronizado';
      case 'error':
        return 'Error al sincronizar';
      default:
        return `Última sync: ${lastSync ? getRelativeTime(lastSync) : 'Nunca'}`;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip text={isOnline ? 'Conectado' : 'Sin conexión'}>
          <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {isOnline ? (
              <Wifi className={`w-4 h-4 ${wsConnected ? 'text-green-600' : 'text-green-500'}`} />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </Tooltip>
        
        {isOnline && (
          <Tooltip text={getSyncStatusText()}>
            <button
              onClick={handleSync}
              disabled={syncing || syncStatus === 'syncing'}
              className={`
                p-2 rounded-full transition-colors
                ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                ${syncing || syncStatus === 'syncing' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {getSyncStatusIcon()}
            </button>
          </Tooltip>
        )}
        
        {pendingOperations.length > 0 && (
          <Tooltip text={`${pendingOperations.length} operaciones pendientes`}>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {pendingOperations.length}
            </span>
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div className={`
      flex items-center gap-3 px-4 py-2 rounded-lg
      ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}
    `}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className={`w-4 h-4 ${wsConnected ? 'text-green-500' : 'text-green-400'}`} />
            <span className="text-sm font-medium">En línea</span>
            {wsConnected && showDetails && (
              <span className="text-xs text-green-500">(WS activo)</span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Sin conexión</span>
          </>
        )}
      </div>

      {showDetails && (
        <>
          <div className="h-4 w-px bg-gray-400" />
          
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">
              {getSyncStatusText()}
            </span>
            
            {isOnline && (
              <button
                onClick={handleSync}
                disabled={syncing || syncStatus === 'syncing'}
                className={`
                  p-1 rounded transition-all duration-200
                  ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}
                  ${syncing || syncStatus === 'syncing' ? 'animate-spin opacity-50' : ''}
                `}
                aria-label="Sincronizar datos"
              >
                {getSyncStatusIcon()}
              </button>
            )}
          </div>
          
          {pendingOperations.length > 0 && (
            <>
              <div className="h-4 w-px bg-gray-400" />
              <Tooltip text="Operaciones pendientes de sincronización">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-yellow-600">
                    {pendingOperations.length} pendiente{pendingOperations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Tooltip>
            </>
          )}
        </>
      )}

      {!isOnline && pendingOperations.length > 0 && (
        <div className="ml-2">
          <Tooltip text="Los cambios se sincronizarán cuando vuelva la conexión">
            <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
              Modo offline
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;