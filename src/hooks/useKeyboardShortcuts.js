import { useEffect, useCallback } from 'react';

/**
 * Hook para manejar shortcuts de teclado
 * Optimizado para uso con tablets con teclado externo
 */
export const useKeyboardShortcuts = (shortcuts, dependencies = []) => {
  // Manejar evento de teclado
  const handleKeyDown = useCallback((event) => {
    // Ignorar si se está escribiendo en un input
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return;
    }

    // Construir la combinación de teclas
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    
    // Buscar shortcut que coincida
    shortcuts.forEach(shortcut => {
      const matches = 
        shortcut.key === key &&
        (shortcut.ctrl === undefined || shortcut.ctrl === ctrl) &&
        (shortcut.shift === undefined || shortcut.shift === shift) &&
        (shortcut.alt === undefined || shortcut.alt === alt);
        
      if (matches && shortcut.action) {
        event.preventDefault();
        shortcut.action(event);
      }
    });
  }, [shortcuts, ...dependencies]);

  useEffect(() => {
    // Agregar listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Función helper para obtener el texto del shortcut
  const getShortcutText = useCallback((shortcut) => {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
  }, []);

  return { getShortcutText };
};

// Shortcuts comunes predefinidos
export const COMMON_SHORTCUTS = {
  SEARCH: { key: '/', description: 'Buscar' },
  NEW: { key: 'n', ctrl: true, description: 'Nuevo' },
  SAVE: { key: 's', ctrl: true, description: 'Guardar' },
  REFRESH: { key: 'r', ctrl: true, description: 'Actualizar' },
  CLOSE: { key: 'escape', description: 'Cerrar/Cancelar' },
  CONFIRM: { key: 'enter', ctrl: true, description: 'Confirmar' },
  DELETE: { key: 'delete', description: 'Eliminar' },
  
  // Navegación
  NEXT: { key: 'arrowdown', description: 'Siguiente' },
  PREVIOUS: { key: 'arrowup', description: 'Anterior' },
  
  // Estados de tránsito
  MARK_READY: { key: '1', description: 'Marcar como listo' },
  MARK_PROBLEM: { key: '2', description: 'Marcar con problema' },
  MARK_NOT_TODAY: { key: '3', description: 'No sale hoy' },
  ADD_OBSERVATION: { key: 'o', description: 'Agregar observación' },
  
  // Vistas
  TOGGLE_VIEW: { key: 'v', description: 'Cambiar vista' },
  TOGGLE_DARK_MODE: { key: 'd', ctrl: true, description: 'Modo oscuro' }
};

export default useKeyboardShortcuts;