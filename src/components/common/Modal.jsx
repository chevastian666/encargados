import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useSystemPreferences } from '../../hooks/useDarkMode';

/**
 * Componente Modal reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} props.title - Título del modal
 * @param {string} props.size - Tamaño del modal (small, medium, large, fullscreen)
 * @param {boolean} props.closeOnOverlayClick - Si se cierra al hacer clic en el overlay
 * @param {boolean} props.showCloseButton - Si se muestra el botón de cerrar
 * @param {string} props.className - Clases CSS adicionales
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const { prefersReducedMotion } = useSystemPreferences();

  // Guardar el elemento activo y enfocar el modal cuando se abre
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = '';
      
      // Restaurar el foco al elemento anterior
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    fullscreen: 'max-w-[95vw] h-[95vh]'
  };

  const animationClass = prefersReducedMotion ? '' : 'animate-scale-up';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          prefersReducedMotion ? 'bg-opacity-50' : 'bg-opacity-0 animate-fade-in'
        }`}
        style={{ animationFillMode: 'forwards', animationDuration: '300ms' }}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
          ${sizeClasses[size]} w-full mx-auto
          ${size === 'fullscreen' ? '' : 'max-h-[90vh]'} 
          overflow-hidden flex flex-col
          ${animationClass} ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
            {title && (
              <h3 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;