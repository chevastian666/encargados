import { useState, useEffect, useCallback } from 'react';
import CONFIG from '../constants/config';

/**
 * Hook personalizado para manejar el modo oscuro
 * @param {boolean} defaultValue - Valor por defecto del modo oscuro
 * @returns {Array} - [darkMode, setDarkMode, toggleDarkMode]
 */
export const useDarkMode = (defaultValue = CONFIG.DEFAULT_THEME === 'dark') => {
  // Obtener el valor inicial del localStorage o usar el default
  const getInitialValue = () => {
    try {
      const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
      
      // Si no hay tema guardado, detectar preferencia del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
      
      return defaultValue;
    } catch (error) {
      console.error('Error leyendo tema del localStorage:', error);
      return defaultValue;
    }
  };

  const [darkMode, setDarkModeState] = useState(getInitialValue);

  // Actualizar el DOM y localStorage cuando cambie el modo
  useEffect(() => {
    try {
      // Actualizar clase en el elemento root
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Guardar en localStorage
      localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
      
      // Actualizar meta theme-color para móviles
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.content = darkMode ? '#1f2937' : '#ffffff';
      }
    } catch (error) {
      console.error('Error actualizando tema:', error);
    }
  }, [darkMode]);

  // Escuchar cambios en las preferencias del sistema
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Solo actualizar si el usuario no ha establecido una preferencia manual
      const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
      if (!savedTheme) {
        setDarkModeState(e.matches);
      }
    };

    // Compatibilidad con diferentes navegadores
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Función para cambiar el tema
  const setDarkMode = useCallback((value) => {
    setDarkModeState(value);
  }, []);

  // Función para alternar el tema
  const toggleDarkMode = useCallback(() => {
    setDarkModeState(prev => !prev);
  }, []);

  return [darkMode, setDarkMode, toggleDarkMode];
};

/**
 * Hook para detectar preferencias del sistema
 * @returns {Object} - { prefersDark, prefersReducedMotion, prefersHighContrast }
 */
export const useSystemPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersDark: false,
    prefersReducedMotion: false,
    prefersHighContrast: false
  });

  useEffect(() => {
    if (!window.matchMedia) return;

    const queries = {
      prefersDark: '(prefers-color-scheme: dark)',
      prefersReducedMotion: '(prefers-reduced-motion: reduce)',
      prefersHighContrast: '(prefers-contrast: high)'
    };

    const updatePreferences = () => {
      setPreferences({
        prefersDark: window.matchMedia(queries.prefersDark).matches,
        prefersReducedMotion: window.matchMedia(queries.prefersReducedMotion).matches,
        prefersHighContrast: window.matchMedia(queries.prefersHighContrast).matches
      });
    };

    // Actualizar inicialmente
    updatePreferences();

    // Escuchar cambios
    const mediaQueries = Object.entries(queries).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const handler = () => updatePreferences();
      
      if (mq.addEventListener) {
        mq.addEventListener('change', handler);
      } else if (mq.addListener) {
        mq.addListener(handler);
      }
      
      return { mq, handler };
    });

    return () => {
      mediaQueries.forEach(({ mq, handler }) => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handler);
        } else if (mq.removeListener) {
          mq.removeListener(handler);
        }
      });
    };
  }, []);

  return preferences;
};

export default useDarkMode;