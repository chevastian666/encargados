import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useConnection } from '../contexts/ConnectionContext';

const ConnectionStatus = ({ darkMode }) => {
  const { isOnline, wsConnected, lastSync, sync } = useConnection();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await sync();
    setTimeout(() => setSyncing(false), 1000);
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm">En línea</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-sm">Sin conexión</span>
        </>
      )}
      {isOnline && (
        <button
          onClick={handleSync}
          className={`p-1 rounded hover:bg-gray-600 transition-colors ${syncing ? 'animate-spin' : ''}`}
          disabled={syncing}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
      <span className="text-xs opacity-60">Última sync: {lastSync.toLocaleTimeString()}</span>
    </div>
  );
};

export default ConnectionStatus;
