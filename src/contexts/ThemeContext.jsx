import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de temas disponibles
export const THEMES = {
  light: {
    id: 'light',
    name: 'Claro',
    description: 'Tema claro por defecto',
    icon: '☀️',
    type: 'light'
  },
  dark: {
    id: 'dark',
    name: 'Oscuro',
    description: 'Tema oscuro para reducir fatiga visual',
    icon: '🌙',
    type: 'dark'
  },
  professional: {
    id: 'professional',
    name: 'Profesional',
    description: 'Colores sobrios y profesionales',
    icon: '💼',
    type: 'light'
  },
  colorful: {
    id: 'colorful',
    name: 'Colorido',
    description: 'Tema vibrante y alegre',
    icon: '🎨',
    type: 'light'
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'Alto Contraste',
    description: 'Máximo contraste para mejor legibilidad',
    icon: '🔲',
    type: 'light'
  },
  'high-contrast-dark': {
    id: 'high-contrast-dark',
    name: 'Alto Contraste Oscuro',
    description: 'Alto contraste en modo oscuro',
    icon: '⬛',
    type: 'dark'
  },
  protanopia: {
    id: 'protanopia',
    name: 'Protanopia',
    description: 'Optimizado para daltonismo rojo-verde',
    icon: '👁️',
    type: 'light',
    colorblind: true
  },
  deuteranopia: {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    description: 'Optimizado para daltonismo rojo-verde común',
    icon: '👁️',
    type: 'light',
    colorblind: true
  },
  tritanopia: {
    id: 'tritanopia',
    name: 'Tritanopia',
    description: 'Optimizado para daltonismo azul-amarillo',
    icon: '👁️',
    type: 'light',
    colorblind: true
  }
};

// Valores por defecto para temas personalizados
const DEFAULT_CUSTOM_THEME = {
  id: 'custom',
  name: 'Personalizado',
  description: 'Tu tema personalizado',
  icon: '⚙️',
  type: 'light',
  colors: {
    primary: '59 130 246',
    secondary: '16 185 129',
    accent: '139 92 246',
    success: '34 197 94',
    warning: '245 158 11',
    danger: '239 68 68',
    info: '14 165 233'
  },
  backgrounds: {
    primary: '255 255 255',
    secondary: '249 250 251',
    tertiary: '243 244 246',
    elevated: '255 255 255'
  },
  surfaces: {
    primary: '255 255 255',
    secondary: '249 250 251',
    tertiary: '243 244 246'
  },
  texts: {
    primary: '17 24 39',
    secondary: '75 85 99',
    tertiary: '156 163 175',
    inverse: '255 255 255'
  },
  borders: {
    primary: '229 231 235',
    secondary: '209 213 219',
    focus: '59 130 246'
  }
};

// Contexto
const ThemeContext = createContext();

// Hook para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

// Provider del tema
export const ThemeProvider = ({ children }) => {
  // Estado del tema actual
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  // Estado del tema personalizado
  const [customTheme, setCustomTheme] = useState(() => {
    const saved = localStorage.getItem('customTheme');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_THEME;
  });

  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false);
  const [tempCustomTheme, setTempCustomTheme] = useState(customTheme);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Remover todas las clases de tema anteriores
    Object.keys(THEMES).forEach(themeId => {
      root.removeAttribute(`data-theme`);
    });
    
    // Aplicar el tema actual
    root.setAttribute('data-theme', currentTheme);
    
    // Si es un tema personalizado, aplicar las variables CSS
    if (currentTheme === 'custom') {
      applyCustomTheme(customTheme);
    }
    
    // Guardar en localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme, customTheme]);

  // Función para aplicar tema personalizado
  const applyCustomTheme = (theme) => {
    const root = document.documentElement;
    
    // Aplicar colores
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Aplicar fondos
    Object.entries(theme.backgrounds).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });
    
    // Aplicar superficies
    Object.entries(theme.surfaces).forEach(([key, value]) => {
      root.style.setProperty(`--surface-${key}`, value);
    });
    
    // Aplicar textos
    Object.entries(theme.texts).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });
    
    // Aplicar bordes
    Object.entries(theme.borders).forEach(([key, value]) => {
      root.style.setProperty(`--border-${key}`, value);
    });
  };

  // Cambiar tema
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  // Alternar entre claro y oscuro
  const toggleTheme = () => {
    const isDark = currentTheme === 'dark' || 
                   currentTheme === 'high-contrast-dark' ||
                   (currentTheme === 'custom' && customTheme.type === 'dark');
    
    setCurrentTheme(isDark ? 'light' : 'dark');
  };

  // Iniciar edición de tema personalizado
  const startEditingTheme = () => {
    setTempCustomTheme(customTheme);
    setIsEditing(true);
  };

  // Cancelar edición
  const cancelEditingTheme = () => {
    setTempCustomTheme(customTheme);
    setIsEditing(false);
  };

  // Guardar tema personalizado
  const saveCustomTheme = () => {
    setCustomTheme(tempCustomTheme);
    localStorage.setItem('customTheme', JSON.stringify(tempCustomTheme));
    setIsEditing(false);
    if (currentTheme === 'custom') {
      applyCustomTheme(tempCustomTheme);
    }
  };

  // Actualizar tema temporal (preview)
  const updateTempTheme = (updates) => {
    const newTheme = { ...tempCustomTheme, ...updates };
    setTempCustomTheme(newTheme);
    
    // Aplicar preview si estamos en modo custom
    if (currentTheme === 'custom' && isEditing) {
      applyCustomTheme(newTheme);
    }
  };

  // Resetear tema personalizado
  const resetCustomTheme = () => {
    setTempCustomTheme(DEFAULT_CUSTOM_THEME);
    if (currentTheme === 'custom' && isEditing) {
      applyCustomTheme(DEFAULT_CUSTOM_THEME);
    }
  };

  // Exportar tema personalizado
  const exportCustomTheme = () => {
    const dataStr = JSON.stringify(customTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `theme-${customTheme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Importar tema personalizado
  const importCustomTheme = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target.result);
        setCustomTheme(theme);
        localStorage.setItem('customTheme', JSON.stringify(theme));
        if (currentTheme === 'custom') {
          applyCustomTheme(theme);
        }
      } catch (error) {
        console.error('Error al importar tema:', error);
      }
    };
    reader.readAsText(file);
  };

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (localStorage.getItem('theme') === null) {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    // Estado
    currentTheme,
    customTheme,
    tempCustomTheme,
    isEditing,
    themes: THEMES,
    
    // Acciones
    changeTheme,
    toggleTheme,
    startEditingTheme,
    cancelEditingTheme,
    saveCustomTheme,
    updateTempTheme,
    resetCustomTheme,
    exportCustomTheme,
    importCustomTheme,
    
    // Helpers
    isDark: currentTheme === 'dark' || 
            currentTheme === 'high-contrast-dark' ||
            (currentTheme === 'custom' && customTheme.type === 'dark'),
    isHighContrast: currentTheme === 'high-contrast' || 
                    currentTheme === 'high-contrast-dark',
    isColorblind: THEMES[currentTheme]?.colorblind || false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;