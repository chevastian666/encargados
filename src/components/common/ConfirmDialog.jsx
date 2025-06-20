import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import TabletButton from './TabletButton';

/**
 * Diálogo de confirmación optimizado para tablets
 * Usado para confirmar acciones críticas
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning', 'danger', 'success'
  darkMode = false,
  loading = false 
}) => {
  if (!isOpen) return null;

  // Estilos según el tipo
  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-500',
      buttonVariant: 'warning'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-500',
      buttonVariant: 'danger'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-500',
      buttonVariant: 'success'
    }
  };

  const currentType = typeStyles[type] || typeStyles.warning;
  const Icon = currentType.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={`
        relative w-full max-w-md
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-xl shadow-2xl
        transform transition-all duration-200 scale-100
        animate-in fade-in slide-in-from-bottom-4
      `}>
        {/* Header */}
        <div className={`
          p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-start space-x-4">
            <div className={`
              p-3 rounded-full ${currentType.bgColor}
            `}>
              <Icon className={`w-6 h-6 ${currentType.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className={`
                text-lg font-semibold
                ${darkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h3>
              <p className={`
                mt-2 text-sm
                ${darkMode ? 'text-gray-300' : 'text-gray-600'}
              `}>
                {message}
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className={`
          p-6 flex justify-end space-x-3
          ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}
          rounded-b-xl
        `}>
          <TabletButton
            onClick={onClose}
            variant="secondary"
            size="medium"
            darkMode={darkMode}
            disabled={loading}
          >
            {cancelText}
          </TabletButton>
          <TabletButton
            onClick={onConfirm}
            variant={currentType.buttonVariant}
            size="medium"
            darkMode={darkMode}
            loading={loading}
            icon={<CheckCircle className="w-5 h-5" />}
          >
            {confirmText}
          </TabletButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;