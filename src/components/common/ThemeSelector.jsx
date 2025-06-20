import React, { useState } from 'react';
import { 
  Palette, Check, Settings, Download, Upload, 
  Sun, Moon, Eye, Paintbrush, Monitor
} from 'lucide-react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
import TabletButton from './TabletButton';

/**
 * Selector de temas con preview
 * Permite cambiar entre temas predefinidos y acceder al editor
 */
const ThemeSelector = ({ className = '' }) => {
  const { 
    currentTheme, 
    changeTheme, 
    toggleTheme,
    isDark,
    isColorblind 
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showColorblind, setShowColorblind] = useState(false);

  // Agrupar temas por categoría
  const standardThemes = Object.values(THEMES).filter(t => !t.colorblind);
  const colorblindThemes = Object.values(THEMES).filter(t => t.colorblind);

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[48px] min-w-[48px] p-3 rounded-lg 
                   bg-surface-primary border border-primary
                   hover:bg-surface-secondary active:scale-95
                   transition-all duration-200
                   flex items-center justify-center gap-2"
        aria-label="Selector de temas"
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-primary" />
        ) : (
          <Sun className="w-5 h-5 text-primary" />
        )}
        <span className="text-sm font-medium text-primary hidden sm:inline">
          Tema
        </span>
      </button>

      {/* Dropdown de temas */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de temas */}
          <div className="absolute right-0 mt-2 w-80 max-h-[70vh] 
                          bg-elevated rounded-xl shadow-xl 
                          border border-primary
                          overflow-hidden z-50
                          animate-in fade-in slide-in-from-top-2">
            
            {/* Header */}
            <div className="p-4 border-b border-primary bg-surface-secondary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Temas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface-tertiary
                             transition-colors duration-200"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
              
              {/* Toggle rápido claro/oscuro */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-secondary">Modo rápido</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full
                             bg-surface-tertiary border border-primary
                             transition-colors duration-200"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full
                                bg-primary transition-transform duration-200
                                ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>

            {/* Lista de temas */}
            <div className="overflow-y-auto max-h-[50vh] p-2">
              {/* Temas estándar */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-tertiary uppercase 
                               tracking-wider px-2 py-1">
                  Temas Estándar
                </h4>
                <div className="grid gap-2">
                  {standardThemes.map((theme) => (
                    <ThemeOption
                      key={theme.id}
                      theme={theme}
                      isActive={currentTheme === theme.id}
                      onClick={() => {
                        changeTheme(theme.id);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Botón para mostrar temas de accesibilidad */}
              <button
                onClick={() => setShowColorblind(!showColorblind)}
                className="w-full px-3 py-2 mb-2 rounded-lg
                           bg-surface-secondary hover:bg-surface-tertiary
                           transition-colors duration-200
                           flex items-center justify-between
                           text-sm text-secondary"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Temas de Accesibilidad
                </span>
                <span className="text-xs">
                  {showColorblind ? '−' : '+'}
                </span>
              </button>

              {/* Temas para daltónicos */}
              {showColorblind && (
                <div className="mb-4">
                  <div className="grid gap-2">
                    {colorblindThemes.map((theme) => (
                      <ThemeOption
                        key={theme.id}
                        theme={theme}
                        isActive={currentTheme === theme.id}
                        onClick={() => {
                          changeTheme(theme.id);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tema personalizado */}
              <div className="border-t border-primary pt-4 mt-4">
                <ThemeOption
                  theme={{
                    id: 'custom',
                    name: 'Personalizado',
                    description: 'Crea tu propio tema',
                    icon: '⚙️'
                  }}
                  isActive={currentTheme === 'custom'}
                  onClick={() => {
                    changeTheme('custom');
                    setIsOpen(false);
                  }}
                  showEditButton
                />
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="border-t border-primary p-3 
                            bg-surface-secondary flex justify-between">
              <button
                onClick={() => {
                  // Abrir editor de temas
                  window.dispatchEvent(new CustomEvent('openThemeEditor'));
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 
                           text-sm text-secondary hover:text-primary
                           transition-colors duration-200"
              >
                <Paintbrush className="w-4 h-4" />
                Editor de Temas
              </button>
              
              <button
                onClick={() => {
                  // Detectar tema del sistema
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  changeTheme(prefersDark ? 'dark' : 'light');
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 
                           text-sm text-secondary hover:text-primary
                           transition-colors duration-200"
              >
                <Monitor className="w-4 h-4" />
                Auto
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Componente para cada opción de tema
const ThemeOption = ({ theme, isActive, onClick, showEditButton }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-3 py-3 rounded-lg
        flex items-center gap-3
        transition-all duration-200
        ${isActive 
          ? 'bg-primary/10 border-2 border-primary' 
          : 'hover:bg-surface-secondary border-2 border-transparent'
        }
      `}
    >
      {/* Icono del tema */}
      <span className="text-2xl" role="img" aria-label={theme.name}>
        {theme.icon}
      </span>
      
      {/* Info del tema */}
      <div className="flex-1 text-left">
        <div className="font-medium text-primary flex items-center gap-2">
          {theme.name}
          {isActive && <Check className="w-4 h-4 text-success" />}
        </div>
        <div className="text-xs text-secondary">
          {theme.description}
        </div>
      </div>
      
      {/* Botón de editar para tema personalizado */}
      {showEditButton && (
        <Settings 
          className="w-4 h-4 text-secondary hover:text-primary
                     transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('openThemeEditor'));
          }}
        />
      )}
    </button>
  );
};

export default ThemeSelector;