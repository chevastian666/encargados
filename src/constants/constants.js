// Estados de tránsito
export const ESTADOS = {
  esperando: { 
    label: 'Esperando', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: 'Clock'
  },
  pasando_soga: { 
    label: 'Pasando soga', 
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: 'Link'
  },
  precintando: { 
    label: 'Precintando', 
    color: 'bg-green-500',
    textColor: 'text-green-500',
    icon: 'Lock'
  },
  precintado: { 
    label: 'Precintado', 
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    icon: 'Check'
  }
};

// Estados de camión
export const ESTADO_CAMION = {
  en_ruta: { 
    label: 'En ruta', 
    color: 'bg-green-500',
    textColor: 'text-green-500',
    icon: 'Truck'
  },
  detenido: { 
    label: 'Detenido', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: 'AlertTriangle'
  },
  llegado: { 
    label: 'Llegado', 
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: 'MapPin'
  }
};

// Prioridades de alerta
export const PRIORIDAD_ALERTA = {
  alta: { 
    label: 'Alta', 
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgLight: 'bg-red-100',
    borderColor: 'border-red-500'
  },
  media: { 
    label: 'Media', 
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgLight: 'bg-yellow-100',
    borderColor: 'border-yellow-500'
  },
  baja: { 
    label: 'Baja', 
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgLight: 'bg-blue-100',
    borderColor: 'border-blue-500'
  }
};

// Tipos de alerta
export const TIPO_ALERTA = {
  STOCK_CRITICO: 'Stock Crítico',
  TRANSITO_DEMORADO: 'Tránsito Demorado',
  INSPECCION_REQUERIDA: 'Inspección Requerida',
  SISTEMA: 'Sistema',
  MANTENIMIENTO: 'Mantenimiento'
};

// Banderas de países
export const COUNTRY_FLAGS = {
  'São Paulo': '🇧🇷',
  'Rio de Janeiro': '🇧🇷',
  'Porto Alegre': '🇧🇷',
  'Buenos Aires': '🇦🇷',
  'Córdoba': '🇦🇷',
  'Rosario': '🇦🇷',
  'Asunción': '🇵🇾',
  'Ciudad del Este': '🇵🇾',
  'Santiago': '🇨🇱',
  'Valparaíso': '🇨🇱',
  'Montevideo': '🇺🇾',
  'Rivera': '🇺🇾',
  'Salto': '🇺🇾',
  'Paysandú': '🇺🇾'
};

// Tipos de carga
export const TIPO_CARGA = {
  contenedor: {
    label: 'Contenedor',
    icon: 'Package',
    color: 'text-blue-600'
  },
  lona: {
    label: 'Lona',
    icon: 'Truck',
    color: 'text-green-600'
  },
  refrigerado: {
    label: 'Refrigerado',
    icon: 'Snowflake',
    color: 'text-cyan-600'
  },
  peligroso: {
    label: 'Peligroso',
    icon: 'AlertTriangle',
    color: 'text-red-600'
  }
};

// Depósitos
export const DEPOSITOS = [
  { id: 'zona_franca', nombre: 'Zona Franca', codigo: 'ZF' },
  { id: 'terminal_tcp', nombre: 'Terminal TCP', codigo: 'TCP' },
  { id: 'terminal_cuenca', nombre: 'Terminal Cuenca', codigo: 'TC' },
  { id: 'puerto_mvd', nombre: 'Puerto MVD', codigo: 'PM' }
];

// Estados de stock
export const ESTADO_STOCK = {
  OPTIMO: { label: 'Óptimo', color: 'bg-green-500', min: 2.5 },
  BAJO: { label: 'Bajo', color: 'bg-yellow-500', min: 1.0 },
  CRITICO: { label: 'Crítico', color: 'bg-red-500', min: 0 }
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERARIO: 'operario',
  VISOR: 'visor'
};

// Permisos
export const PERMISSIONS = {
  PRECINTAR: 'precintar',
  DESPRECINTAR: 'desprecintar',
  GESTIONAR_STOCK: 'gestionar_stock',
  VER_ALERTAS: 'ver_alertas',
  RESOLVER_ALERTAS: 'resolver_alertas',
  VER_MAPA: 'ver_mapa',
  GESTIONAR_USUARIOS: 'gestionar_usuarios',
  VER_REPORTES: 'ver_reportes',
  EXPORTAR_DATOS: 'exportar_datos'
};

// API Endpoints
export const API_ENDPOINTS = {
  TRANSITOS_PENDIENTES: '/transitos/pendientes',
  TRANSITOS_DESPRECINTAR: '/transitos/desprecintar',
  STOCK: '/stock',
  ALERTAS: '/alertas',
  CAMIONES_RUTA: '/camiones/ruta',
  NOTIFICATIONS: '/notifications',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  }
};

// Mensajes de error
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
  AUTH_ERROR: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  PERMISSION_DENIED: 'No tienes permisos para realizar esta acción.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  TRANSITO_PRECINTADO: 'Tránsito precintado exitosamente',
  TRANSITO_DESPRECINTADO: 'Precinto removido exitosamente',
  STOCK_ACTUALIZADO: 'Stock actualizado correctamente',
  ALERTA_RESUELTA: 'Alerta marcada como resuelta',
  DATOS_GUARDADOS: 'Datos guardados correctamente',
  SINCRONIZADO: 'Datos sincronizados con el servidor'
};

// Validaciones
export const VALIDATIONS = {
  MATRICULA_REGEX: /^[A-Z]{3}\s?\d{4}$/,
  CEDULA_REGEX: /^\d{1}\.\d{3}\.\d{3}-\d{1}$/,
  TELEFONO_REGEX: /^\+598\s?\d{2}\s?\d{3}\s?\d{3}$/,
  CODIGO_CONTENEDOR_REGEX: /^[A-Z]{4}\s?\d{6}-\d{1}$/
};

// Configuración de gráficos
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#6366f1',
  success: '#22c55e',
  dark: '#1f2937',
  light: '#f3f4f6'
};

export default {
  ESTADOS,
  ESTADO_CAMION,
  PRIORIDAD_ALERTA,
  TIPO_ALERTA,
  COUNTRY_FLAGS,
  TIPO_CARGA,
  DEPOSITOS,
  ESTADO_STOCK,
  NOTIFICATION_TYPES,
  USER_ROLES,
  PERMISSIONS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATIONS,
  CHART_COLORS
};