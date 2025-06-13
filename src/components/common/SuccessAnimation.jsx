import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Animación de éxito que aparece temporalmente
 * cuando se completa una acción exitosamente
 */
const SuccessAnimation = ({ 
  show, 
  message = 'Acción completada',
  onComplete,
  duration = 2000,
  darkMode = false
}) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className={`
        transform transition-all duration-500
        ${show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}>
        <div className={`
          p-6 rounded-2xl shadow-2xl
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          flex flex-col items-center space-y-4
          animate-in zoom-in-50 fade-in duration-300
        `}>
          {/* Icono animado */}
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className={`
              relative w-20 h-20 rounded-full
              bg-green-500 flex items-center justify-center
              animate-in zoom-in-75 duration-500
            `}>
              <CheckCircle className="w-12 h-12 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200" />
            </div>
          </div>
          
          {/* Mensaje */}
          <p className={`
            text-lg font-semibold
            ${darkMode ? 'text-white' : 'text-gray-900'}
            animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300
          `}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;