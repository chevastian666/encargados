import { VALIDATIONS } from '../constants/constants';

/**
 * Formatea una fecha a string legible
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  const {
    includeTime = false,
    relative = false,
    format = 'DD/MM/YYYY'
  } = options;

  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  if (relative) {
    return getRelativeTime(dateObj);
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  let formatted = format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);

  if (includeTime) {
    formatted += ` ${hours}:${minutes}`;
  }

  return formatted;
};

/**
 * Obtiene tiempo relativo desde una fecha
 * @param {Date} date - Fecha a comparar
 * @returns {string} - Tiempo relativo
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 30) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  
  return formatDate(date);
};

/**
 * Valida un formato de matrícula
 * @param {string} matricula - Matrícula a validar
 * @returns {boolean} - Si es válida
 */
export const validarMatricula = (matricula) => {
  if (!matricula) return false;
  return VALIDATIONS.MATRICULA_REGEX.test(matricula.toUpperCase());
};

/**
 * Valida un formato de cédula uruguaya
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} - Si es válida
 */
export const validarCedula = (cedula) => {
  if (!cedula) return false;
  return VALIDATIONS.CEDULA_REGEX.test(cedula);
};

/**
 * Valida un formato de teléfono uruguayo
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} - Si es válido
 */
export const validarTelefono = (telefono) => {
  if (!telefono) return false;
  return VALIDATIONS.TELEFONO_REGEX.test(telefono);
};

/**
 * Valida un código de contenedor
 * @param {string} codigo - Código a validar
 * @returns {boolean} - Si es válido
 */
export const validarCodigoContenedor = (codigo) => {
  if (!codigo) return false;
  return VALIDATIONS.CODIGO_CONTENEDOR_REGEX.test(codigo.toUpperCase());
};

/**
 * Formatea un número de teléfono
 * @param {string} telefono - Teléfono a formatear
 * @returns {string} - Teléfono formateado
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  
  // Eliminar todos los caracteres no numéricos excepto el +
  const cleaned = telefono.replace(/[^\d+]/g, '');
  
  // Si empieza con +598, formatear como uruguayo
  if (cleaned.startsWith('+598')) {
    const number = cleaned.substring(4);
    if (number.length === 8) {
      return `+598 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
  }
  
  return telefono;
};

/**
 * Formatea una matrícula
 * @param {string} matricula - Matrícula a formatear
 * @returns {string} - Matrícula formateada
 */
export const formatearMatricula = (matricula) => {
  if (!matricula) return '';
  
  // Convertir a mayúsculas y eliminar espacios
  const cleaned = matricula.toUpperCase().replace(/\s/g, '');
  
  // Insertar espacio entre letras y números
  if (cleaned.length === 7) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }
  
  return matricula.toUpperCase();
};

/**
 * Calcula el porcentaje de stock
 * @param {number} actual - Cantidad actual
 * @param {number} maximo - Cantidad máxima
 * @returns {number} - Porcentaje
 */
export const calcularPorcentajeStock = (actual, maximo) => {
  if (!maximo || maximo === 0) return 0;
  return Math.round((actual / maximo) * 100);
};

/**
 * Determina el color del stock según el nivel
 * @param {number} actual - Cantidad actual
 * @param {number} minimo - Cantidad mínima
 * @returns {string} - Clase de color Tailwind
 */
export const getStockColor = (actual, minimo) => {
  if (actual >= minimo * 2.5) return 'bg-green-500';
  if (actual >= minimo) return 'bg-yellow-500';
  return 'bg-red-500';
};

/**
 * Agrupa elementos por una propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} key - Propiedad por la cual agrupar
 * @returns {Object} - Objeto con grupos
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Ordena un array por múltiples campos
 * @param {Array} array - Array a ordenar
 * @param {Array} keys - Campos por los cuales ordenar
 * @returns {Array} - Array ordenado
 */
export const sortByMultiple = (array, keys) => {
  return array.sort((a, b) => {
    for (let key of keys) {
      const order = key.startsWith('-') ? -1 : 1;
      const prop = key.replace(/^-/, '');
      
      if (a[prop] < b[prop]) return -1 * order;
      if (a[prop] > b[prop]) return 1 * order;
    }
    return 0;
  });
};

/**
 * Debounce para funciones
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} - Función con debounce
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle para funciones
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} - Función con throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Genera un ID único
 * @returns {string} - ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Clona profundamente un objeto
 * @param {*} obj - Objeto a clonar
 * @returns {*} - Copia profunda del objeto
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} - Cadena capitalizada
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Trunca un texto largo
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo a agregar
 * @returns {string} - Texto truncado
 */
export const truncate = (text, length = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

/**
 * Verifica si un objeto está vacío
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} - Si está vacío
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Convierte bytes a formato legible
 * @param {number} bytes - Cantidad de bytes
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} - Tamaño formateado
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} - Iniciales
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - Si es válido
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Genera un color basado en un string (para avatares, etc)
 * @param {string} str - String base
 * @returns {string} - Color hexadecimal
 */
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

export default {
  formatDate,
  getRelativeTime,
  validarMatricula,
  validarCedula,
  validarTelefono,
  validarCodigoContenedor,
  formatearTelefono,
  formatearMatricula,
  calcularPorcentajeStock,
  getStockColor,
  groupBy,
  sortByMultiple,
  debounce,
  throttle,
  generateId,
  deepClone,
  capitalize,
  truncate,
  isEmpty,
  formatBytes,
  getInitials,
  isValidEmail,
  stringToColor
};