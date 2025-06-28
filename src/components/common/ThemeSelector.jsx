import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Palette, Monitor, Sun, Moon, Briefcase, Sparkles, Eye, Settings, Check, X, Download, Upload, MonitorSmartphone, Keyboard } from 'lucide-react';

const ThemeSelector = ({ className = '' }) => {
  const {
    themes,
    currentTheme,
    changeTheme,
    toggleTheme,
    customTheme,
    startEditingTheme,
    cancelEditingTheme,
    saveCustomTheme,
    updateTempTheme,
    resetCustomTheme,
    exportCustomTheme,
    importCustomTheme,
    isEditing,
    tempCustomTheme,
    followSystemTheme,
    toggleFollowSystemTheme,
    enableTransitions,
    toggleTransitions,
    isDark,
    getContrastRatio
  } = useTheme();

  const [showSettings, setShowSettings] = useState(false);
  const [showCustomEditor, setShowCustomEditor] = useState(false);

  const getThemeIcon = (themeId) => {
    switch (themeId) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'professional':
        return <Briefcase className="w-4 h-4" />;
      case 'colorful':
        return <Sparkles className="w-4 h-4" />;
      case 'high-contrast':
      case 'high-contrast-dark':
        return <Monitor className="w-4 h-4" />;
      case 'protanopia':
      case 'deuteranopia':
      case 'tritanopia':
        return <Eye className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  const themeGroups = {
    standard: ['light', 'dark', 'professional', 'colorful'],
    accessibility: ['high-contrast', 'high-contrast-dark'],
    colorblind: ['protanopia', 'deuteranopia', 'tritanopia']
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-primary">Selector de Temas</h3>
      </div>

      <div className="space-y-4">
        {/* Temas Estándar */}
        <div>
          <h4 className="text-sm font-medium text-secondary mb-2">Temas Estándar</h4>
          <div className="grid grid-cols-2 gap-2">
            {themeGroups.standard.map((themeId) => {
              const theme = themes[themeId];
              return (
                <button
                  key={themeId}
                  onClick={() => changeTheme(themeId)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${currentTheme === themeId 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-primary/20 hover:border-primary/40 hover:bg-secondary'}
                  `}
                >
                  <div className={`
                    p-2 rounded-md
                    ${currentTheme === themeId ? 'bg-primary text-white' : 'bg-tertiary'}
                  `}>
                    {getThemeIcon(themeId)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-primary">{theme.name}</div>
                    <div className="text-xs text-tertiary">{theme.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temas de Accesibilidad */}
        <div>
          <h4 className="text-sm font-medium text-secondary mb-2">Alta Accesibilidad</h4>
          <div className="grid grid-cols-1 gap-2">
            {themeGroups.accessibility.map((themeId) => {
              const theme = themes[themeId];
              return (
                <button
                  key={themeId}
                  onClick={() => changeTheme(themeId)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${currentTheme === themeId 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-primary/20 hover:border-primary/40 hover:bg-secondary'}
                  `}
                >
                  <div className={`
                    p-2 rounded-md
                    ${currentTheme === themeId ? 'bg-primary text-white' : 'bg-tertiary'}
                  `}>
                    {getThemeIcon(themeId)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-primary">{theme.name}</div>
                    <div className="text-xs text-tertiary">{theme.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temas para Daltonismo */}
        <div>
          <h4 className="text-sm font-medium text-secondary mb-2">Daltonismo</h4>
          <div className="grid grid-cols-1 gap-2">
            {themeGroups.colorblind.map((themeId) => {
              const theme = themes[themeId];
              return (
                <button
                  key={themeId}
                  onClick={() => changeTheme(themeId)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                    ${currentTheme === themeId 
                      ? 'border-primary bg-primary/10 shadow-md' 
                      : 'border-primary/20 hover:border-primary/40 hover:bg-secondary'}
                  `}
                >
                  <div className={`
                    p-2 rounded-md
                    ${currentTheme === themeId ? 'bg-primary text-white' : 'bg-tertiary'}
                  `}>
                    {getThemeIcon(themeId)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-primary">{theme.name}</div>
                    <div className="text-xs text-tertiary">{theme.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuración Avanzada */}
        <div className="mt-4 pt-4 border-t border-primary/20">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configuración Avanzada
          </button>

          {showSettings && (
            <div className="mt-4 space-y-3 p-3 bg-secondary rounded-lg">
              {/* Seguir tema del sistema */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-secondary" />
                  <span className="text-sm">Seguir tema del sistema</span>
                </div>
                <input
                  type="checkbox"
                  checked={followSystemTheme}
                  onChange={toggleFollowSystemTheme}
                  className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary"
                />
              </label>

              {/* Transiciones suaves */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-sm">Transiciones suaves</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableTransitions}
                  onChange={toggleTransitions}
                  className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary"
                />
              </label>

              {/* Atajo de teclado */}
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Keyboard className="w-4 h-4" />
                <span>Atajo: Ctrl+Shift+D para alternar modo oscuro</span>
              </div>

              {/* Editor de tema personalizado */}
              <button
                onClick={() => {
                  setShowCustomEditor(true);
                  startEditingTheme();
                }}
                className="w-full mt-3 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Editar Tema Personalizado
              </button>
            </div>
          )}
        </div>

        {/* Botón de tema personalizado si existe */}
        <div className="mt-4">
          <button
            onClick={() => changeTheme('custom')}
            className={`
              w-full flex items-center gap-2 p-3 rounded-lg border-2 transition-all
              ${currentTheme === 'custom'
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-primary/20 hover:border-primary/40 hover:bg-secondary'}
            `}
          >
            <div className={`
              p-2 rounded-md
              ${currentTheme === 'custom' ? 'bg-primary text-white' : 'bg-tertiary'}
            `}>
              <Settings className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-primary">{customTheme.name}</div>
              <div className="text-xs text-tertiary">{customTheme.description}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de editor de tema personalizado */}
      {showCustomEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary">Editor de Tema Personalizado</h3>
                <button
                  onClick={() => {
                    setShowCustomEditor(false);
                    cancelEditingTheme();
                  }}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Información básica */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Nombre del tema</label>
                  <input
                    type="text"
                    value={tempCustomTheme.name}
                    onChange={(e) => updateTempTheme({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Descripción</label>
                  <input
                    type="text"
                    value={tempCustomTheme.description}
                    onChange={(e) => updateTempTheme({ description: e.target.value })}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Tipo de tema</label>
                  <select
                    value={tempCustomTheme.type}
                    onChange={(e) => updateTempTheme({ type: e.target.value })}
                    className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </div>
              </div>

              {/* Editor de colores */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-secondary mb-3">Colores del tema</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(tempCustomTheme.colors || {}).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs text-tertiary capitalize">{key}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={`#${value.split(' ').map(n => parseInt(n).toString(16).padStart(2, '0')).join('')}`}
                            onChange={(e) => {
                              const hex = e.target.value;
                              const r = parseInt(hex.slice(1, 3), 16);
                              const g = parseInt(hex.slice(3, 5), 16);
                              const b = parseInt(hex.slice(5, 7), 16);
                              updateTempTheme({
                                colors: {
                                  ...tempCustomTheme.colors,
                                  [key]: `${r} ${g} ${b}`
                                }
                              });
                            }}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            readOnly
                            className="flex-1 px-2 py-1 text-xs border border-primary/20 rounded bg-secondary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vista previa del contraste */}
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Prueba de contraste</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Texto primario sobre fondo primario:</span>
                      <span className="font-mono">
                        {getContrastRatio(tempCustomTheme.texts.primary, tempCustomTheme.backgrounds.primary).toFixed(2)}:1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Texto secundario sobre fondo secundario:</span>
                      <span className="font-mono">
                        {getContrastRatio(tempCustomTheme.texts.secondary, tempCustomTheme.backgrounds.secondary).toFixed(2)}:1
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-primary/20">
                <div className="flex gap-2">
                  <button
                    onClick={resetCustomTheme}
                    className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Restablecer
                  </button>
                  <button
                    onClick={exportCustomTheme}
                    className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <label className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Importar
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          importCustomTheme(file);
                          setShowCustomEditor(false);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCustomEditor(false);
                      cancelEditingTheme();
                    }}
                    className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      saveCustomTheme();
                      setShowCustomEditor(false);
                    }}
                    className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;