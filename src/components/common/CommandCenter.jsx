import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Download, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Activity
} from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * Centro de comando con acciones rápidas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.darkMode - Modo oscuro activo
 * @param {Function} props.onAction - Callback para manejar acciones
 * @param {Object} props.systemStatus - Estado del sistema
 */
const CommandCenter = ({ darkMode, onAction, systemStatus = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeProcesses, setActiveProcesses] = useState({
    autoProcess: true,
    notifications: true,
    monitoring: true
  });

  const quickActions = [
    {
      id: 'refresh',
      icon: RefreshCw,
      label: 'Actualizar datos',
      color: 'blue',
      action: () => onAction('refresh'),
      tooltip: 'Forzar actualización de todos los datos'
    },
    {
      id: 'export',
      icon: Download,
      label: 'Exportar reporte',
      color: 'green',
      action: () => onAction('export'),
      tooltip: 'Descargar reporte del día'
    },
    {
      id: 'alerts',
      icon: Bell,
      label: 'Gestionar alertas',
      color: 'orange',
      badge: systemStatus.activeAlerts || 0,
      action: () => onAction('alerts'),
      tooltip: 'Ver todas las alertas activas'
    },
    {
      id: 'emergency',
      icon: AlertTriangle,
      label: 'Modo emergencia',
      color: 'red',
      action: () => onAction('emergency'),
      tooltip: 'Activar protocolo de emergencia'
    }
  ];

  const systemProcesses = [
    {
      id: 'autoProcess',
      icon: Zap,
      label: 'Procesamiento automático',
      description: 'Precintado automático de tránsitos',
      active: activeProcesses.autoProcess
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notificaciones',
      description: 'Alertas en tiempo real',
      active: activeProcesses.notifications
    },
    {
      id: 'monitoring',
      icon: Activity,
      label: 'Monitoreo activo',
      description: 'Supervisión del sistema',
      active: activeProcesses.monitoring
    }
  ];

  const toggleProcess = (processId) => {
    setActiveProcesses(prev => ({
      ...prev,
      [processId]: !prev[processId]
    }));
    onAction('toggleProcess', { processId, active: !activeProcesses[processId] });
  };

  const getStatusColor = () => {
    if (systemStatus.critical) return 'red';
    if (systemStatus.warning) return 'yellow';
    return 'green';
  };

  const getStatusIcon = () => {
    if (systemStatus.critical) return XCircle;
    if (systemStatus.warning) return AlertTriangle;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <div className={`
      fixed bottom-6 right-6 z-50
      ${isExpanded ? 'w-80' : 'w-auto'}
      transition-all duration-300
    `}>
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          absolute bottom-0 right-0 w-14 h-14 rounded-full
          ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
          text-white shadow-lg hover:shadow-xl
          transition-all duration-200
          flex items-center justify-center
          ${isExpanded ? 'rotate-45' : ''}
        `}
      >
        <Zap className="w-6 h-6" />
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <div className={`
          absolute bottom-20 right-0 w-80
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          rounded-lg shadow-2xl
          border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          p-4
          animate-in slide-in-from-bottom-5 duration-300
        `}>
          {/* Estado del sistema */}
          <div className={`
            flex items-center justify-between mb-4 p-3 rounded-lg
            ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}>
            <div className="flex items-center space-x-3">
              <StatusIcon className={`w-5 h-5 text-${statusColor}-500`} />
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Estado del Sistema
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {systemStatus.message || 'Operando normalmente'}
                </p>
              </div>
            </div>
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${statusColor === 'green' && 'bg-green-500'}
              ${statusColor === 'yellow' && 'bg-yellow-500'}
              ${statusColor === 'red' && 'bg-red-500'}
            `} />
          </div>

          {/* Acciones rápidas */}
          <div className="mb-4">
            <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Tooltip key={action.id} text={action.tooltip}>
                    <button
                      onClick={action.action}
                      className={`
                        relative p-3 rounded-lg text-center
                        ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                        transition-colors duration-200
                      `}
                    >
                      {action.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {action.badge}
                        </span>
                      )}
                      <Icon className={`w-5 h-5 text-${action.color}-500 mx-auto mb-1`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {action.label}
                      </span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Procesos del sistema */}
          <div>
            <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Procesos del Sistema
            </h3>
            <div className="space-y-2">
              {systemProcesses.map((process) => {
                const Icon = process.icon;
                return (
                  <div
                    key={process.id}
                    className={`
                      flex items-center justify-between p-2 rounded-lg
                      ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${
                        process.active ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {process.label}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {process.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleProcess(process.id)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors duration-200
                        ${process.active 
                          ? 'bg-green-500' 
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }
                      `}
                    >
                      <span className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                        transition-transform duration-200
                        ${process.active ? 'translate-x-6' : ''}
                      `} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;