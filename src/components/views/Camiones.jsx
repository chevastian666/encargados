import React, { useState } from 'react';
import { Search, Truck, User, Building, FileText, Calendar, Edit, Plus, History } from 'lucide-react';
import { Modal, SearchBar, Tooltip } from '../common';
import { useNotification } from '../../hooks';
import { validarMatricula, validarCedula, formatearMatricula, formatearTelefono } from '../../utils/helpers';
import apiService from '../../services/api.service';

/**
 * Vista de Base de Datos de Camiones
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.darkMode - Si está en modo oscuro
 */
const CamionesModal = ({ isOpen, onClose, darkMode }) => {
  const { addNotification } = useNotification();
  const [searchType, setSearchType] = useState('matricula');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCamion, setSelectedCamion] = useState(null);
  
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      addNotification('warning', 'Por favor ingrese un valor de búsqueda');
      return;
    }

    // Validaciones según tipo de búsqueda
    if (searchType === 'matricula') {
      const matriculaFormateada = formatearMatricula(searchValue);
      if (!validarMatricula(matriculaFormateada)) {
        addNotification('error', 'Formato de matrícula inválido (Ej: ABC 1234)');
        return;
      }
    } else if (searchType === 'cedula') {
      if (!validarCedula(searchValue)) {
        addNotification('error', 'Formato de cédula inválido (Ej: 1.234.567-8)');
        return;
      }
    }

    setLoading(true);
    try {
      // Simular búsqueda - en producción sería una llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      const mockResults = {
        camion: {
          id: 1,
          matricula: 'ABC 1234',
          secundaria: 'DEF 5678',
          empresa: 'Transportes del Sur S.A.',
          tipo: 'Camión con semirremolque',
          modelo: 'Mercedes-Benz Actros',
          año: 2020,
          ultimaInspeccion: '2024-01-15',
          proximaInspeccion: '2024-07-15',
          estado: 'Activo',
          observaciones: 'Unidad con caja refrigerada. Requiere mantenimiento frecuente del sistema de refrigeración.',
          historial: [
            { fecha: '2024-01-20', evento: 'Precintado', deposito: 'Zona Franca' },
            { fecha: '2024-01-18', evento: 'Precintado', deposito: 'Terminal TCP' },
            { fecha: '2024-01-15', evento: 'Inspección técnica', resultado: 'Aprobado' }
          ]
        },
        choferes: [
          {
            id: 1,
            nombre: 'Juan Rodríguez',
            cedula: '4.123.456-7',
            telefono: '+598 99 123 456',
            licencia: 'CAT E',
            vencimientoLicencia: '2025-03-15',
            empresa: 'Transportes del Sur S.A.',
            estado: 'Activo'
          },
          {
            id: 2,
            nombre: 'María González',
            cedula: '3.987.654-3',
            telefono: '+598 99 789 012',
            licencia: 'CAT E',
            vencimientoLicencia: '2024-11-20',
            empresa: 'Transportes del Sur S.A.',
            estado: 'Activo'
          }
        ]
      };
      
      setSearchResults(mockResults);
      addNotification('success', `Búsqueda completada`);
    } catch (error) {
      addNotification('error', 'Error al realizar la búsqueda');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const CamionInfo = ({ camion }) => (
    <div className={`
      p-6 rounded-xl shadow-lg
      ${darkMode ? 'bg-gray-700' : 'bg-white'}
    `}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {camion.matricula}
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Secundaria: {camion.secundaria}
          </p>
        </div>
        <span className={`
          px-3 py-1 rounded-full text-sm font-semibold
          ${camion.estado === 'Activo' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }
        `}>
          {camion.estado}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Empresa</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {camion.empresa}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Tipo de Vehículo</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {camion.tipo}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Modelo</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {camion.modelo} ({camion.año})
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Última Inspección</p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {camion.ultimaInspeccion}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Próxima Inspección</p>
              <p className={`font-semibold ${
                new Date(camion.proximaInspeccion) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  ? 'text-yellow-600'
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {camion.proximaInspeccion}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {camion.observaciones && (
        <div className={`
          p-4 rounded-lg mb-4
          ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
        `}>
          <p className="text-sm font-medium mb-1">Observaciones</p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {camion.observaciones}
          </p>
        </div>
      )}
      
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
          <History className="w-4 h-4" />
          Ver Historial
        </button>
      </div>
    </div>
  );

  const ChoferCard = ({ chofer }) => (
    <div className={`
      p-4 rounded-lg border
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
    `}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold">{chofer.nombre}</h4>
          <p className="text-sm text-gray-500">CI: {chofer.cedula}</p>
        </div>
        <span className={`
          px-2 py-1 rounded text-xs font-semibold
          ${chofer.estado === 'Activo' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }
        `}>
          {chofer.estado}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Teléfono:</span>
          <span>{formatearTelefono(chofer.telefono)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Licencia:</span>
          <span>{chofer.licencia}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Vencimiento:</span>
          <span className={
            new Date(chofer.vencimientoLicencia) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              ? 'text-yellow-600 font-semibold'
              : ''
          }>
            {chofer.vencimientoLicencia}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Base de Datos de Camiones"
      size="large"
    >
      <div className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {/* Panel de búsqueda */}
        <div className={`
          p-6 rounded-xl shadow-lg mb-6
          ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
        `}>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className={`
                px-4 py-2 rounded-lg
                ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'}
              `}
            >
              <option value="matricula">Por Matrícula</option>
              <option value="cedula">Por Cédula del Chofer</option>
              <option value="empresa">Por Empresa</option>
            </select>
            
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                searchType === 'matricula' ? 'Ej: ABC 1234' :
                searchType === 'cedula' ? 'Ej: 1.234.567-8' :
                'Nombre de la empresa'
              }
              className={`
                flex-1 px-4 py-2 rounded-lg
                ${darkMode ? 'bg-gray-600 text-white placeholder-gray-400' : 'bg-white'}
              `}
            />
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Registrar Nuevo
            </button>
          </div>
        </div>
        
        {/* Resultados de búsqueda */}
        {searchResults && (
          <div className="space-y-6">
            {/* Información del camión */}
            {searchResults.camion && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Información del Vehículo</h3>
                <CamionInfo camion={searchResults.camion} />
              </div>
            )}
            
            {/* Choferes asignados */}
            {searchResults.choferes && searchResults.choferes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Choferes Asignados ({searchResults.choferes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.choferes.map(chofer => (
                    <ChoferCard key={chofer.id} chofer={chofer} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Historial reciente */}
            {searchResults.camion?.historial && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Historial Reciente</h3>
                <div className={`
                  rounded-lg overflow-hidden
                  ${darkMode ? 'bg-gray-700' : 'bg-white'}
                `}>
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Evento</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.camion.historial.map((evento, idx) => (
                        <tr 
                          key={idx} 
                          className={`
                            border-t
                            ${darkMode ? 'border-gray-600' : 'border-gray-200'}
                          `}
                        >
                          <td className="px-4 py-3 text-sm">{evento.fecha}</td>
                          <td className="px-4 py-3 text-sm font-medium">{evento.evento}</td>
                          <td className="px-4 py-3 text-sm">
                            {evento.deposito || evento.resultado || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Estado inicial */}
        {!searchResults && !loading && (
          <div className="text-center py-12">
            <Truck className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Ingrese una matrícula o cédula para buscar
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Total de vehículos registrados: 1,247
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CamionesModal;