import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, User, Phone, Building, Calendar,
  Award, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import vehicleDatabase from '../../services/vehicleDatabase.service';

/**
 * Componente de autocompletado para choferes
 * Muestra información de contacto y estadísticas
 */
const DriverAutocomplete = ({ 
  value, 
  onChange, 
  onDriverSelect, 
  placeholder = "Buscar chofer por nombre...",
  darkMode = false,
  showStats = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Buscar sugerencias cuando cambia el valor
  useEffect(() => {
    if (value.length >= 2) {
      searchDrivers(value);
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

  // Buscar choferes
  const searchDrivers = async (searchTerm) => {
    setLoading(true);
    try {
      const results = await vehicleDatabase.getAutocompleteSuggestions('driver', searchTerm);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error buscando choferes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar chofer
  const handleSelectDriver = (suggestion) => {
    const { driver, company } = suggestion.data;
    
    const driverData = {
      ...driver,
      company
    };
    
    setSelectedDriver(driverData);
    onChange(driver.name);
    setShowSuggestions(false);
    
    if (onDriverSelect) {
      onDriverSelect(driverData);
    }
  };

  // Verificar estado de la licencia
  const getLicenseStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', text: 'Vencida' };
    } else if (daysUntilExpiry < 30) {
      return { status: 'warning', color: 'yellow', text: 'Por vencer' };
    } else {
      return { status: 'valid', color: 'green', text: 'Vigente' };
    }
  };

  // Componente de sugerencia
  const SuggestionItem = ({ suggestion }) => {
    const { driver, company } = suggestion.data;
    const licenseStatus = getLicenseStatus(driver.licenseExpiry);
    
    return (
      <button
        onClick={() => handleSelectDriver(suggestion)}
        className={`
          w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150 border-b last:border-b-0
          ${darkMode ? 'border-gray-700' : 'border-gray-100'}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {driver.photo ? (
              <img 
                src={driver.photo} 
                alt={driver.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>`;
                }}
              />
            ) : (
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}
              `}>
                <User className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            )}
            
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {driver.name}
                </span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${licenseStatus.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    licenseStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}
                `}>
                  Lic. {licenseStatus.text}
                </span>
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  DNI: {driver.dni}
                </span>
                {company && (
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Building className="w-3 h-3 inline mr-1" />
                    {company.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {driver.stats && (
            <div className="text-right">
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {driver.stats.onTimePercentage}%
              </span>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                puntualidad
              </p>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="relative">
      {/* Input con ícono */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

      {/* Información del chofer seleccionado */}
      {selectedDriver && (
        <div className={`
          mt-4 p-4 rounded-lg border
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
        `}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información personal */}
            <div>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Información del Chofer
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Local: {selectedDriver.phoneLocal}
                  </span>
                </div>
                {selectedDriver.phoneHome !== selectedDriver.phoneLocal && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Origen: {selectedDriver.phoneHome}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Licencia: {new Date(selectedDriver.licenseExpiry).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            {showStats && selectedDriver.stats && (
              <div>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Estadísticas
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total viajes:
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDriver.stats.totalTrips}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Puntualidad:
                    </span>
                    <span className={`
                      text-sm font-medium
                      ${selectedDriver.stats.onTimePercentage >= 95 ? 'text-green-500' :
                        selectedDriver.stats.onTimePercentage >= 85 ? 'text-yellow-500' : 'text-red-500'}
                    `}>
                      {selectedDriver.stats.onTimePercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Último viaje:
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedDriver.stats.lastTrip).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {selectedDriver.observations?.length > 0 && (
            <div className="mt-4">
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Observaciones
              </h4>
              <div className="space-y-2">
                {selectedDriver.observations.map((obs, idx) => (
                  <div 
                    key={idx}
                    className={`
                      p-2 rounded text-sm flex items-start space-x-2
                      ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    `}
                  >
                    {obs.type === 'positive' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                    {obs.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {obs.text}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(obs.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverAutocomplete;