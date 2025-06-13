import React, { useState, useEffect } from 'react';
import { 
  Save, AlertTriangle, CheckCircle, Info, 
  Camera, FileText, Clock, Building, Package,
  Phone, MessageSquare, History, TrendingUp
} from 'lucide-react';
import VehicleAutocomplete from './VehicleAutocomplete';
import DriverAutocomplete from './DriverAutocomplete';
import TabletButton from './TabletButton';
import vehicleDatabase from '../../services/vehicleDatabase.service';

/**
 * Formulario mejorado para registro de tránsitos
 * Integra base de datos de vehículos con autocompletado y alertas
 */
const EnhancedTransitForm = ({ 
  onSubmit, 
  initialData = {}, 
  darkMode = false,
  mode = 'create' // 'create' | 'edit'
}) => {
  const [formData, setFormData] = useState({
    matricula: '',
    matriculaSecundaria: '',
    tipo: 'contenedor',
    codigo: '',
    deposito: '',
    salida: '',
    chofer: '',
    telefono: '',
    empresa: '',
    observaciones: '',
    ...initialData
  });

  const [vehicleData, setVehicleData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Tipos de carga disponibles
  const tiposCarga = [
    { value: 'contenedor', label: 'Contenedor', icon: '📦' },
    { value: 'lona', label: 'Lona', icon: '🚛' },
    { value: 'refrigerado', label: 'Refrigerado', icon: '❄️' },
    { value: 'cisterna', label: 'Cisterna', icon: '🛢️' },
    { value: 'carga_general', label: 'Carga General', icon: '📋' }
  ];

  // Depósitos disponibles
  const depositos = [
    'Puerto de Montevideo',
    'Terminal TCP',
    'Zona Franca',
    'Terminal Cuenca',
    'Puerto Seco'
  ];

  // Manejar selección de vehículo
  const handleVehicleSelect = (vehicle) => {
    setVehicleData(vehicle);
    
    // Autocompletar campos con datos del vehículo
    setFormData(prev => ({
      ...prev,
      matricula: vehicle.plate,
      matriculaSecundaria: vehicle.secondaryPlate || prev.matriculaSecundaria,
      tipo: vehicle.type || prev.tipo,
      empresa: vehicle.company?.name || prev.empresa,
      // Si hay un chofer regular, autocompletarlo
      chofer: vehicle.driver?.name || prev.chofer,
      telefono: vehicle.driver?.phoneLocal || prev.telefono
    }));

    // Si hay un chofer, cargar sus datos también
    if (vehicle.driver) {
      setDriverData(vehicle.driver);
    }
  };

  // Manejar selección de chofer
  const handleDriverSelect = (driver) => {
    setDriverData(driver);
    
    setFormData(prev => ({
      ...prev,
      chofer: driver.name,
      telefono: driver.phoneLocal,
      empresa: driver.company?.name || prev.empresa
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.matricula.trim()) {
      errors.matricula = 'La matrícula es requerida';
    }
    
    if (!formData.deposito) {
      errors.deposito = 'El depósito destino es requerido';
    }
    
    if (!formData.salida) {
      errors.salida = 'La hora de salida es requerida';
    }
    
    if (!formData.chofer.trim()) {
      errors.chofer = 'El nombre del chofer es requerido';
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono de contacto es requerido';
    }

    // Validar licencia del chofer si tenemos los datos
    if (driverData?.licenseExpiry) {
      const expiryDate = new Date(driverData.licenseExpiry);
      if (expiryDate < new Date()) {
        errors.chofer = 'La licencia del chofer está vencida';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Agregar información adicional del vehículo si está disponible
      const submitData = {
        ...formData,
        vehicleId: vehicleData?.id,
        driverId: driverData?.id,
        vehicleStats: vehicleData?.stats,
        timestamp: new Date().toISOString()
      };

      await onSubmit(submitData);

      // Si hay observaciones sobre el vehículo, registrar el nuevo tránsito
      if (formData.observaciones) {
        await vehicleDatabase.addObservation(formData.matricula, {
          text: formData.observaciones,
          type: 'info',
          transitId: `TRN-${Date.now()}`
        });
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Componente de alerta
  const AlertBanner = ({ type, message, details }) => {
    const alertStyles = {
      warning: {
        bg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100',
        border: 'border-yellow-500',
        text: darkMode ? 'text-yellow-300' : 'text-yellow-700',
        icon: AlertTriangle
      },
      info: {
        bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
        border: 'border-blue-500',
        text: darkMode ? 'text-blue-300' : 'text-blue-700',
        icon: Info
      },
      success: {
        bg: darkMode ? 'bg-green-900/30' : 'bg-green-100',
        border: 'border-green-500',
        text: darkMode ? 'text-green-300' : 'text-green-700',
        icon: CheckCircle
      }
    };

    const style = alertStyles[type] || alertStyles.info;
    const Icon = style.icon;

    return (
      <div className={`
        p-3 rounded-lg border ${style.bg} ${style.border} ${style.text}
        mb-4
      `}>
        <div className="flex items-start space-x-2">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
            {details && (
              <p className="text-sm mt-1 opacity-90">{details}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alertas del vehículo */}
      {showAlerts && vehicleData && (
        <>
          {vehicleData.hasWarnings && (
            <AlertBanner
              type="warning"
              message="Este vehículo tiene alertas recientes"
              details={vehicleData.history?.find(h => h.type === 'warning')?.text}
            />
          )}
          
          {vehicleData.needsAttention && (
            <AlertBanner
              type="info"
              message="Este vehículo requiere atención"
              details="Verificar documentación o mantenimiento próximo"
            />
          )}
          
          {vehicleData.stats?.problemRate > 5 && (
            <AlertBanner
              type="warning"
              message={`Alta tasa de problemas: ${vehicleData.stats.problemRate}%`}
              details="Prestar especial atención durante el proceso"
            />
          )}
        </>
      )}

      {/* Sección de vehículo */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Package className="w-5 h-5 mr-2" />
          Información del Vehículo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matrícula principal con autocompletado */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Matrícula Principal *
            </label>
            <VehicleAutocomplete
              value={formData.matricula}
              onChange={(value) => setFormData(prev => ({ ...prev, matricula: value }))}
              onVehicleSelect={handleVehicleSelect}
              darkMode={darkMode}
              showHistory={true}
              showActions={true}
            />
            {validationErrors.matricula && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.matricula}</p>
            )}
          </div>

          {/* Matrícula secundaria */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Matrícula Secundaria
            </label>
            <input
              type="text"
              value={formData.matriculaSecundaria}
              onChange={(e) => setFormData(prev => ({ ...prev, matriculaSecundaria: e.target.value }))}
              placeholder="Ej: DEF 5678"
              className={`
                w-full px-4 py-3 rounded-lg border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>

          {/* Tipo de carga */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tipo de Carga *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              {tiposCarga.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.icon} {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Código de contenedor */}
          {formData.tipo === 'contenedor' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Código Contenedor
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ej: MSKU 123456-7"
                className={`
                  w-full px-4 py-3 rounded-lg border
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección de destino y tiempo */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Building className="w-5 h-5 mr-2" />
          Destino y Horario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Depósito destino */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Depósito Destino *
            </label>
            <select
              value={formData.deposito}
              onChange={(e) => setFormData(prev => ({ ...prev, deposito: e.target.value }))}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${validationErrors.deposito ? 'border-red-500' : ''}
              `}
            >
              <option value="">Seleccionar depósito...</option>
              {depositos.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            {validationErrors.deposito && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.deposito}</p>
            )}
          </div>

          {/* Hora de salida */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Hora de Salida *
            </label>
            <input
              type="time"
              value={formData.salida}
              onChange={(e) => setFormData(prev => ({ ...prev, salida: e.target.value }))}
              className={`
                w-full px-4 py-3 rounded-lg border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${validationErrors.salida ? 'border-red-500' : ''}
              `}
            />
            {validationErrors.salida && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.salida}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección de chofer */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <User className="w-5 h-5 mr-2" />
          Información del Chofer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chofer con autocompletado */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre del Chofer *
            </label>
            <DriverAutocomplete
              value={formData.chofer}
              onChange={(value) => setFormData(prev => ({ ...prev, chofer: value }))}
              onDriverSelect={handleDriverSelect}
              darkMode={darkMode}
              showStats={true}
            />
            {validationErrors.chofer && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.chofer}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Teléfono de Contacto *
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+598 99 123 456"
                className={`
                  flex-1 px-4 py-3 rounded-lg border
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${validationErrors.telefono ? 'border-red-500' : ''}
                `}
              />
              {formData.telefono && (
                <TabletButton
                  onClick={() => vehicleDatabase.initiateCall(formData.telefono)}
                  variant="secondary"
                  size="medium"
                  darkMode={darkMode}
                  icon={<Phone className="w-5 h-5" />}
                />
              )}
            </div>
            {validationErrors.telefono && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.telefono}</p>
            )}
          </div>

          {/* Empresa */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Empresa Transportista
            </label>
            <input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
              placeholder="Nombre de la empresa"
              className={`
                w-full px-4 py-3 rounded-lg border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Observaciones Adicionales
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
          rows={3}
          placeholder="Ingrese cualquier observación relevante..."
          className={`
            w-full px-4 py-3 rounded-lg border
            ${darkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500
            resize-none
          `}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <TabletButton
          type="button"
          variant="secondary"
          size="large"
          darkMode={darkMode}
          onClick={() => window.history.back()}
        >
          Cancelar
        </TabletButton>
        
        <TabletButton
          type="submit"
          variant="primary"
          size="large"
          darkMode={darkMode}
          disabled={submitting}
          icon={<Save className="w-5 h-5" />}
        >
          {submitting ? 'Guardando...' : mode === 'create' ? 'Registrar Tránsito' : 'Actualizar Tránsito'}
        </TabletButton>
      </div>
    </form>
  );
};

export default EnhancedTransitForm;