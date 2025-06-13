// Exportar todos los hooks personalizados
export { useApiData } from './useApiData';
export { usePolling, useControlledPolling, useSmartPolling } from './usePolling';
export { useDarkMode, useSystemPreferences } from './useDarkMode';
export { useDashboardStats } from './useDashboardStats';

// Re-exportar hooks de contextos para conveniencia
export { useConnection } from '../contexts/ConnectionContext';
export { useNotification } from '../contexts/NotificationContext';