import React, { useState } from 'react';
import { Clock, Phone, Truck, Package, User, Building, FileText, AlertCircle } from 'lucide-react';
import { useConnection, useNotification } from '../hooks';
import { ESTADOS } from '../constants/constants';
import apiService from '../services/api.service';

/**
 * Componente TransitoDetails - Detalles de un tránsito
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.transito - Datos del tránsito
 * @param {boolean} props.darkMode - Si está en modo oscuro
 * @param {Function} props.onUpdate - Función callback al actualizar
 */
const TransitoDetails = ({ transito, darkMode = false, onUpdate }) => {
  const { addNotification } = useNotification();
  const { isOnline, addPendingOperation } = useConnection();
  const [updating, setUpdating] = useState(false);
  const [localTransito, setLocalTransito] = useState(transito);

  const handleMarcarPrecintado = async () => {
    setUpdating(true);

    try {
      if (!isOnline) {
        // Guardar operación para sincronizar después
        addPendingOperation({
          type: 'UPDATE_TRANSITO_ESTADO',
          data: { transitoId: transito.id, estado: 'precintado' },
          execute: async () => {
            await apiService.updateTransitoEstado(transito.id, 'precintado');
          }
        });
        
        // Actualización optimista
        setLocalTransito(prev => ({ ...prev, estado: 'precintado' }));
        addNotification('warning', 'Cambio guardado localmente. Se sincronizará cuando vuelva la conexión.');
      } else {
        await apiService.updateTransitoEstado(transito.id, 'precintado');
        setLocalTransito(prev => ({ ...prev, estado: 'precintado' }));
        addNotification('success', `Tránsito ${transito.matricula} marcado como precintado`);
      }
      
      onUpdate?.();
    } catch (error) {
      addNotification('error', 'Error al actualizar el estado del tránsito');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </p>
        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value || '-'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Estado y tiempo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold text-white 
            ${ESTADOS[localTransito.estado].color}
          `}>
            {ESTADOS[localTransito.estado].label}
          </span>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Salida: {localTransito.salida}
            </span>
          </div>
        </div>
      </div>

      {/* Información del vehículo */}
      <div className={`
        p-4 rounded-lg border
        ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
      `}>
        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Información del Vehículo
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            icon={Truck} 
            label="Matrícula Primaria" 
            value={localTransito.matricula} 
          />
          <InfoRow 
            icon={Truck} 
            label="Matrícula Secundaria" 
            value={localTransito.secundaria} 
          />
        </div>
      </div>

      {/* Información de la carga */}
      <div className={`
        p-4 rounded-lg border
        ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
      `}>
        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Información de la Carga
        </h4>
        <div className="space-y-3">
          <InfoRow 
            icon={Package} 
            label="Tipo de Carga" 
            value={localTransito.tipo === 'contenedor' ? 'Contenedor' : 'Carga con Lona'} 
          />
          {localTransito.tipo === 'contenedor' && localTransito.codigo && (
            <InfoRow 
              icon={FileText} 
              label="Código de Contenedor" 
              value={localTransito.codigo} 
            />
          )}
          <InfoRow 
            icon={Building} 
            label="Depósito" 
            value={localTransito.deposito} 
          />
        </div>
      </div>

      {/* Información del conductor */}
      <div className={`
        p-4 rounded-lg border
        ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
      `}>
        <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Información del Conductor
        </h4>
        <div className="space-y-3">
          <InfoRow 
            icon={User} 
            label="Nombre del Chofer" 
            value={localTransito.chofer} 
          />
          <InfoRow 
            icon={Phone} 
            label="Teléfono de Contacto" 
            value={localTransito.telefono} 
          />
          {localTransito.empresa && (
            <InfoRow 
              icon={Building} 
              label="Empresa Transportista" 
              value={localTransito.empresa} 
            />
          )}
        </div>
      </div>

      {/* Observaciones */}
      {localTransito.observaciones && (
        <div className={`
          p-4 rounded-lg border
          ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}
        `}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Observaciones
              </h4>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {localTransito.observaciones}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Acciones - Optimizado para tablets */}
      {localTransito.estado !== 'precintado' && (
        <div className="pt-6 pb-2 border-t dark:border-gray-700">
          {/* Espacio adicional para mejor área táctil */}
          <div className="space-y-4">
            {/* Botón principal con mejoras para tablet */}
            <button 
              onClick={handleMarcarPrecintado}
              disabled={updating || (!isOnline && localTransito.estado === 'precintado')}
              className={`
                w-full px-6 py-4 rounded-2xl font-medium text-lg
                transition-all duration-200 transform
                ${updating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
                }
                text-white
                /* Área táctil mínima de 48x48px para accesibilidad */
                min-h-[3.5rem]
                /* Mejora visual en tablets */
                sm:text-base sm:py-4
                md:text-lg md:py-5
                /* Efecto de elevación para mejor feedback visual */
                ${!updating && 'active:shadow-md'}
              `}
            >
              {updating ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : (
                'Marcar como Precintado'
              )}
            </button>
            
            {/* Mensaje de estado offline con mejor espaciado */}
            {!isOnline && (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-3 mt-2">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center font-medium">
                  ⚠️ Sin conexión - Los cambios se guardarán localmente
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransitoDetails;