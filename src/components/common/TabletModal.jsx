import React, { useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Modal optimizado para tablets industriales
 * - Botones más grandes (min 48px) para uso con guantes
 * - Optimizado para pantallas de 10"
 * - Soporte para modo fullscreen
 * - Diseño horizontal (landscape)
 */
const TabletModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  darkMode,
  showMaximize = true,
  className = '',
  headerActions = null,
  footer = null
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      // Focus trap
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalStyles = isFullscreen 
    ? 'fixed inset-0 w-full h-full rounded-none'
    : 'relative w-[95vw] max-w-7xl h-[90vh] rounded-xl';

  const contentBg = darkMode ? 'bg-gray-900' : 'bg-white';
  const headerBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`
          ${modalStyles}
          ${contentBg}
          ${className}
          shadow-2xl
          flex flex-col
          overflow-hidden
          z-10
          animate-in fade-in zoom-in-95 duration-200
        `}
        tabIndex={-1}
      >
        {/* Header - Altura mínima de 64px para mejor touch */}
        <header className={`
          ${headerBg} 
          ${borderColor}
          border-b 
          px-6 py-4 
          flex items-center justify-between
          min-h-[64px]
        `}>
          <h2 className={`text-xl font-bold ${textColor}`}>
            {title}
          </h2>
          
          <div className="flex items-center space-x-2">
            {headerActions}
            
            {showMaximize && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`
                  p-3 rounded-lg min-w-[48px] min-h-[48px]
                  flex items-center justify-center
                  ${darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }
                  transition-colors duration-200
                `}
                aria-label={isFullscreen ? "Restaurar tamaño" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
            
            <button
              onClick={onClose}
              className={`
                p-3 rounded-lg min-w-[48px] min-h-[48px]
                flex items-center justify-center
                ${darkMode 
                  ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                }
                transition-colors duration-200
              `}
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>
        
        {/* Content - Scrollable */}
        <main className={`
          flex-1 
          overflow-y-auto 
          overscroll-contain
          ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}
        `}>
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {/* Footer opcional */}
        {footer && (
          <footer className={`
            ${headerBg} 
            ${borderColor}
            border-t 
            px-6 py-4
            min-h-[72px]
            flex items-center justify-end
          `}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default TabletModal;