import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Truck, User, Building, AlertTriangle, 
  CheckCircle, Info, Camera, Phone, MessageSquare,
  Calendar, FileText, AlertCircle, Clock, TrendingUp
} from 'lucide-react';
import vehicleDatabase from '../../services/vehicleDatabase.service';

/**
 * Componente de autocompletado inteligente para vehículos
 * Muestra historial, alertas y permite acciones rápidas
 */
const VehicleAutocomplete = ({ 
  value, 
  onChange, 
  onVehicleSelect, 
  placeholder = "Ingrese matrícula del camión...",
  darkMode = false,
  showHistory = true,
  showActions = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Buscar sugerencias cuando cambia el valor
  useEffect(() => {
    if (value.length >= 2) {
      searchVehicles(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar vehículos
  const searchVehicles = async (searchTerm) => {
    setLoading(true);
    try {
      const results = await vehicleDatabase.getAutocompleteSuggestions('plate', searchTerm);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error buscando vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar vehículo
  const handleSelectVehicle = async (suggestion) => {
    const { vehicle, driver, company } = suggestion.data;
    
    // Obtener historial completo
    const history = await vehicleDatabase.getVehicleHistory(vehicle.plate);
    
    const vehicleData = {
      ...vehicle,
      driver,
      company,
      history
    };
    
    setSelectedVehicle(vehicleData);
    onChange(vehicle.plate);
    setShowSuggestions(false);
    setShowDetails(true);
    
    if (onVehicleSelect) {
      onVehicleSelect(vehicleData);
    }
  };

  // Iniciar llamada
  const handleCall = (phoneNumber) => {
    vehicleDatabase.initiateCall(phoneNumber);
  };

  // Enviar SMS
  const handleSMS = (phoneNumber) => {
    const message = `Hola, le contactamos desde el Puerto de Montevideo respecto al tránsito de su vehículo ${selectedVehicle?.plate}.`;
    vehicleDatabase.sendSMS(phoneNumber, message);
  };

  // Componente de sugerencia
  const SuggestionItem = ({ suggestion }) => {
    const { vehicle, company } = suggestion.data;
    const hasWarnings = vehicle.observations?.some(obs => obs.type === 'warning');
    
    return (
      <button
        onClick={() => handleSelectVehicle(suggestion)}
        className={`
          w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150 border-b last:border-b-0
          ${darkMode ? 'border-gray-700' : 'border-gray-100'}
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {vehicle.plate}
              </span>
              {vehicle.secondaryPlate && (
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  / {vehicle.secondaryPlate}
                </span>
              )}
              {hasWarnings && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {vehicle.type}
              </span>
              {company && (
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Building className="w-3 h-3 inline mr-1" />
                  {company.name}
                </span>
              )}
              {vehicle.stats && (
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {vehicle.stats.totalTransits} tránsitos
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  // Panel de detalles del vehículo
  const VehicleDetailsPanel = () => {
    if (!selectedVehicle) return null;
    
    const { vehicle, driver, company, history } = selectedVehicle;
    const recentWarnings = history?.filter(h => h.type === 'warning' && 
      (Date.now() - new Date(h.date)) < 30 * 24 * 60 * 60 * 1000
    );
    
    return (
      <div className={`
        mt-4 p-4 rounded-lg border-2
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
        ${recentWarnings?.length > 0 ? 'border-yellow-500' : ''}
      `}>
        {/* Alertas importantes */}
        {recentWarnings?.length > 0 && (
          <div className={`
            mb-4 p-3 rounded-lg flex items-start space-x-2
            ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}
          `}>
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                Alertas recientes
              </h4>
              {recentWarnings.map((warning, idx) => (
                <p key={idx} className={`text-sm mt-1 ${darkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>
                  {warning.text} ({new Date(warning.date).toLocaleDateString()})
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información del vehículo */}
          <div className="space-y-3">
            <div>
              <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Truck className="w-5 h-5 mr-2" />
                Vehículo
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {vehicle.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Marca/Modelo:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Año:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {vehicle.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Foto del vehículo */}
            {vehicle.photo && (
              <div className={`
                rounded-lg overflow-hidden border
                ${darkMode ? 'border-gray-700' : 'border-gray-300'}
              `}>
                <img 
                  src={vehicle.photo} 
                  alt={`Vehículo ${vehicle.plate}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Estadísticas */}
            {vehicle.stats && (
              <div>
                <h5 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estadísticas
                </h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total tránsitos:
                    </span>
                    <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vehicle.stats.totalTransits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tiempo promedio:
                    </span>
                    <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {vehicle.stats.averageWaitTime} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tasa problemas:
                    </span>
                    <span className={`
                      text-xs font-medium
                      ${vehicle.stats.problemRate > 5 ? 'text-red-500' : 
                        vehicle.stats.problemRate > 3 ? 'text-yellow-500' : 'text-green-500'}
                    `}>
                      {vehicle.stats.problemRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del chofer */}
          <div className="space-y-3">
            {driver && (
              <>
                <div>
                  <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5 mr-2" />
                    Chofer
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nombre:</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {driver.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>DNI:</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {driver.dni}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Licencia:</span>
                      <span className={`
                        text-sm font-medium
                        ${new Date(driver.licenseExpiry) < new Date() ? 'text-red-500' : 
                          darkMode ? 'text-white' : 'text-gray-900'}
                      `}>
                        {new Date(driver.licenseExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Foto del chofer */}
                {driver.photo && (
                  <div className={`
                    rounded-lg overflow-hidden border
                    ${darkMode ? 'border-gray-700' : 'border-gray-300'}
                  `}>
                    <img 
                      src={driver.photo} 
                      alt={`Chofer ${driver.name}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Acciones de contacto */}
                {showActions && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCall(driver.phoneLocal)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm font-medium
                        flex items-center justify-center space-x-2
                        transition-colors duration-200
                        ${darkMode 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                        }
                      `}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Llamar ({driver.phoneLocal})</span>
                    </button>
                    
                    {driver.phoneHome !== driver.phoneLocal && (
                      <button
                        onClick={() => handleCall(driver.phoneHome)}
                        className={`
                          w-full px-3 py-2 rounded-lg text-sm font-medium
                          flex items-center justify-center space-x-2
                          transition-colors duration-200
                          ${darkMode 
                            ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                          }
                        `}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Llamar país origen</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleSMS(driver.phoneLocal)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm font-medium
                        flex items-center justify-center space-x-2
                        transition-colors duration-200
                        ${darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                      `}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Enviar SMS</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Información de la empresa */}
            {company && (
              <div>
                <h5 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Empresa
                </h5>
                <div className="space-y-1">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {company.name}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Phone className="w-3 h-3 inline mr-1" />
                    {company.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Historial de observaciones */}
        {showHistory && history?.length > 0 && (
          <div className="mt-4">
            <h4 className={`font-semibold mb-2 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5 mr-2" />
              Historial reciente
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.slice(0, 5).map((entry, idx) => (
                <div 
                  key={idx}
                  className={`
                    p-2 rounded text-sm
                    ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {entry.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                      {entry.type === 'positive' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                      {entry.type === 'info' && <Info className="w-4 h-4 text-blue-500 mt-0.5" />}
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {entry.text}
                      </p>
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Input con ícono */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-4 py-3 rounded-lg border
            ${darkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${selectedVehicle?.hasWarnings ? 'border-yellow-500' : ''}
          `}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-1 rounded-lg shadow-lg border
            ${darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
            max-h-64 overflow-y-auto
          `}
        >
          {suggestions.map((suggestion, idx) => (
            <SuggestionItem key={idx} suggestion={suggestion} />
          ))}
        </div>
      )}

      {/* Panel de detalles */}
      {showDetails && selectedVehicle && (
        <VehicleDetailsPanel />
      )}
    </div>
  );
};

export default VehicleAutocomplete;