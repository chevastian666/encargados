import React, { useState, useEffect } from 'react';
import { 
  X, Save, RotateCcw, Download, Upload, 
  Palette, Type, Square, Frame, Eye
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import TabletModal from './TabletModal';
import TabletButton from './TabletButton';

/**
 * Editor de temas personalizado con preview en vivo
 */
const ThemeEditor = () => {
  const {
    customTheme,
    tempCustomTheme,
    isEditing,
    startEditingTheme,
    cancelEditingTheme,
    saveCustomTheme,
    updateTempTheme,
    resetCustomTheme,
    exportCustomTheme,
    importCustomTheme,
    changeTheme,
    currentTheme
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [showPreview, setShowPreview] = useState(true);

  // Escuchar evento para abrir el editor
  useEffect(() => {
    const handleOpenEditor = () => {
      setIsOpen(true);
      startEditingTheme();
      if (currentTheme !== 'custom') {
        changeTheme('custom');
      }
    };

    window.addEventListener('openThemeEditor', handleOpenEditor);
    return () => window.removeEventListener('openThemeEditor', handleOpenEditor);
  }, [startEditingTheme, changeTheme, currentTheme]);

  const handleClose = () => {
    setIsOpen(false);
    cancelEditingTheme();
  };

  const handleSave = () => {
    saveCustomTheme();
    setIsOpen(false);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importCustomTheme(file);
    }
  };

  const tabs = [
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'backgrounds', label: 'Fondos', icon: Square },
    { id: 'texts', label: 'Textos', icon: Type },
    { id: 'borders', label: 'Bordes', icon: Frame }
  ];

  return (
    <TabletModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editor de Temas"
      className="max-w-6xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <TabletButton
              onClick={resetCustomTheme}
              variant="secondary"
              size="medium"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Resetear
            </TabletButton>
            
            <TabletButton
              onClick={exportCustomTheme}
              variant="secondary"
              size="medium"
              icon={<Download className="w-4 h-4" />}
            >
              Exportar
            </TabletButton>
            
            <label className="cursor-pointer">
              <TabletButton
                as="span"
                variant="secondary"
                size="medium"
                icon={<Upload className="w-4 h-4" />}
              >
                Importar
              </TabletButton>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <TabletButton
              onClick={handleClose}
              variant="secondary"
              size="medium"
            >
              Cancelar
            </TabletButton>
            
            <TabletButton
              onClick={handleSave}
              variant="primary"
              size="medium"
              icon={<Save className="w-4 h-4" />}
            >
              Guardar Tema
            </TabletButton>
          </div>
        </div>
      }
    >
      <div className="flex gap-6 h-full">
        {/* Panel de edición */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-primary">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-3 flex items-center gap-2
                    border-b-2 transition-all duration-200
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-secondary hover:text-primary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de cada tab */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {activeTab === 'colors' && (
              <ColorEditor
                colors={tempCustomTheme.colors}
                onChange={(colors) => updateTempTheme({ colors })}
              />
            )}
            
            {activeTab === 'backgrounds' && (
              <ColorEditor
                colors={tempCustomTheme.backgrounds}
                onChange={(backgrounds) => updateTempTheme({ backgrounds })}
                label="Fondos"
              />
            )}
            
            {activeTab === 'texts' && (
              <ColorEditor
                colors={tempCustomTheme.texts}
                onChange={(texts) => updateTempTheme({ texts })}
                label="Colores de Texto"
              />
            )}
            
            {activeTab === 'borders' && (
              <ColorEditor
                colors={tempCustomTheme.borders}
                onChange={(borders) => updateTempTheme({ borders })}
                label="Bordes"
              />
            )}
          </div>

          {/* Información del tema */}
          <div className="mt-6 pt-6 border-t border-primary">
            <input
              type="text"
              value={tempCustomTheme.name}
              onChange={(e) => updateTempTheme({ name: e.target.value })}
              placeholder="Nombre del tema"
              className="w-full px-4 py-3 rounded-lg border border-primary
                         bg-surface-primary text-primary
                         focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={tempCustomTheme.description}
              onChange={(e) => updateTempTheme({ description: e.target.value })}
              placeholder="Descripción del tema"
              rows={2}
              className="w-full mt-3 px-4 py-3 rounded-lg border border-primary
                         bg-surface-primary text-primary
                         focus:outline-none focus:ring-2 focus:ring-primary
                         resize-none"
            />
          </div>
        </div>

        {/* Panel de preview */}
        {showPreview && (
          <div className="w-96 border-l border-primary pl-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg hover:bg-surface-secondary
                           transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <ThemePreview theme={tempCustomTheme} />
          </div>
        )}
      </div>
    </TabletModal>
  );
};

// Editor de colores
const ColorEditor = ({ colors, onChange, label = "Colores" }) => {
  const handleColorChange = (key, value) => {
    // Convertir hex a RGB
    const hex = value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    onChange({
      ...colors,
      [key]: `${r} ${g} ${b}`
    });
  };

  const rgbToHex = (rgb) => {
    const [r, g, b] = rgb.split(' ').map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-secondary uppercase tracking-wider">
        {label}
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-primary capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={rgbToHex(value)}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-2 border-primary"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-primary
                           bg-surface-primary text-primary text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="R G B"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vista previa del tema
const ThemePreview = ({ theme }) => {
  return (
    <div className="space-y-4 p-6 rounded-xl bg-surface-primary border border-primary">
      {/* Preview de colores */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-secondary">Colores Principales</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="w-full h-12 rounded-lg border border-primary"
                style={{ backgroundColor: `rgb(${value})` }}
              />
              <span className="text-xs text-tertiary mt-1">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview de componentes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-secondary">Componentes</h4>
        
        {/* Botones */}
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-lg bg-primary text-inverse">
            Primario
          </button>
          <button className="px-4 py-2 rounded-lg bg-secondary text-inverse">
            Secundario
          </button>
          <button className="px-4 py-2 rounded-lg bg-surface-secondary text-primary border border-primary">
            Outline
          </button>
        </div>

        {/* Cards */}
        <div className="p-4 rounded-lg bg-surface-secondary border border-primary">
          <h5 className="font-medium text-primary mb-1">Card de Ejemplo</h5>
          <p className="text-sm text-secondary">
            Este es un ejemplo de cómo se verá el contenido con tu tema.
          </p>
        </div>

        {/* Inputs */}
        <input
          type="text"
          placeholder="Campo de entrada"
          className="w-full px-3 py-2 rounded-lg border border-primary
                     bg-surface-primary text-primary
                     focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Alertas */}
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-success/10 text-success border border-success/20">
            <span className="text-sm font-medium">Mensaje de éxito</span>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 text-warning border border-warning/20">
            <span className="text-sm font-medium">Mensaje de advertencia</span>
          </div>
          <div className="p-3 rounded-lg bg-danger/10 text-danger border border-danger/20">
            <span className="text-sm font-medium">Mensaje de error</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;