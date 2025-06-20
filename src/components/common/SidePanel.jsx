import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useSystemPreferences } from '../../hooks/useDarkMode';

/**
 * Componente SidePanel - Panel lateral deslizante
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el panel está abierto
 * @param {Function} props.onClose - Función para cerrar el panel
 * @param {React.ReactNode} props.children - Contenido del panel
 * @param {string} props.title - Título del panel
 * @param {string} props.position - Posición del panel (left, right)
 * @param {string} props.size - Ancho del panel (small, medium, large)
 * @param {boolean} props.closeOnOverlayClick - Si se cierra al hacer clic en el overlay
 * @param {boolean} props.showOverlay - Si se muestra el overlay
 */
const SidePanel = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  position = 'right',
  size = 'medium',
  closeOnOverlayClick = true,
  showOverlay = true
}) => {
  const panelRef = useRef(null);
  const previousActiveElement = useRef(null);
  const { prefersReducedMotion } = useSystemPreferences();

  // Manejar foco y scroll del body
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      panelRef.current?.focus();
      
      if (showOverlay) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (showOverlay) {
        document.body.style.overflow = '';
      }
      
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      if (showOverlay) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, showOverlay]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    small: 'w-80',
    medium: 'w-96',
    large: 'w-[32rem]'
  };

  const positionClasses = {
    left: {
      panel: 'left-0',
      transform: isOpen ? 'translate-x-0' : '-translate-x-full'
    },
    right: {
      panel: 'right-0',
      transform: isOpen ? 'translate-x-0' : 'translate-x-full'
    }
  };

  const transitionDuration = prefersReducedMotion ? 'duration-0' : 'duration-300';

  return (
    <>
      {/* Overlay */}
      {showOverlay && isOpen && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${transitionDuration}`}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}
      
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`
          fixed inset-y-0 ${positionClasses[position].panel} z-50 
          ${sizeClasses[size]} max-w-full
          transform transition-transform ${transitionDuration}
          ${positionClasses[position].transform}
          bg-white dark:bg-gray-800 shadow-2xl
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sidepanel-title' : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          {title && (
            <h3 id="sidepanel-title" className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className={`${!title ? 'ml-auto' : ''} p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default SidePanel;