import React, { useState, useCallback } from 'react';
import { 
  Truck, Search, Filter, Plus, Edit, Trash2,
  Phone, Building, Calendar, User, Hash,
  ChevronRight, Download, Upload, RefreshCw,
  ScanLine, FileText, History
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { useApiData, useNotification } from '../../hooks';
import apiService from '../../services/api.service';
import { debounce } from '../../utils/helpers';

/**
 * Modal de Base de Datos (Camiones) optimizado para tablet
 * - Búsqueda rápida con scanner
 * - Vista de detalles expandida
 * - Edición inline
 */
const CamionesTablet = ({ isOpen, onClose, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('matricula'); // matricula, empresa, chofer
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const { showNotification } = useNotification();

  // Buscar camiones con debounce
  const searchCamiones = useCallback(
    debounce(async (tipo, valor) => {
      if (valor.length < 3) return;
      try {
        const result = await apiService.buscarCamion(tipo, valor);
        return result;
      } catch (error) {
        showNotification('Error en la búsqueda', 'error');
        return [];
      }
    }, 500),
    []
  );

  // Mock de datos para demostración
  const mockCamiones = [
    {
      id: 1,
      matricula: 'ABC 1234',
      empresa: 'Transportes del Este',
      chofer: {
        nombre: 'Juan Pérez',
        telefono: '+598 99 123 456',
        documento: '1.234.567-8'
      },
      tipo: 'Camión con semi',
      ultimoTransito: '15/01/2025 14:30',
      totalTransitos: 156,
      estado: 'activo'
    },
    {
      id: 2,
      matricula: 'BRA 5678',
      empresa: 'Logística Internacional',
      chofer: {
        nombre: 'Pedro Silva',
        telefono: '+55 11 98765 4321',
        documento: 'BR-123456789'
      },
      tipo: 'Camión internacional',
      ultimoTransito: '14/01/2025 09:15',
      totalTransitos: 89,
      estado: 'activo'
    },
    {
      id: 3,
      matricula: 'DEF 9012',
      empresa: 'Cargas Express',
      chofer: {
        nombre: 'María González',
        telefono: '+598 99 789 012',
        documento: '2.345.678-9'
      },
      tipo: 'Camión refrigerado',
      ultimoTransito: '13/01/2025 16:45',
      totalTransitos: 234,
      estado: 'activo'
    }
  ];

  // Resultados de búsqueda filtrados
  const resultadosBusqueda = mockCamiones.filter(camion => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    switch (searchType) {
      case 'matricula':
        return camion.matricula.toLowerCase().includes(term);
      case 'empresa':
        return camion.empresa.toLowerCase().includes(term);
      case 'chofer':
        return camion.chofer.nombre.toLowerCase().includes(term);
      default:
        return true;
    }
  });

  // Panel de detalles del camión
  const CamionDetails = ({ camion }) => {
    return (
      <div className={`
        ${darkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-xl p-6 space-y-6
      `}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.matricula}
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {camion.tipo}
            </p>
          </div>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${camion.estado === 'activo' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }
          `}>
            {camion.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa */}
          <div className={`
            p-4 rounded-lg
            ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}>
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-5 h-5 text-gray-400" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Empresa
              </span>
            </div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.empresa}
            </p>
          </div>

          {/* Chofer */}
          <div className={`
            p-4 rounded-lg
            ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}>
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Chofer Principal
              </span>
            </div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.chofer.nombre}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {camion.chofer.telefono}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Doc: {camion.chofer.documento}
                </span>
              </div>
            </div>
          </div>

          {/* Último tránsito */}
          <div className={`
            p-4 rounded-lg
            ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Último Tránsito
              </span>
            </div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.ultimoTransito}
            </p>
          </div>

          {/* Total de tránsitos */}
          <div className={`
            p-4 rounded-lg
            ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}>
            <div className="flex items-center space-x-2 mb-2">
              <History className="w-5 h-5 text-gray-400" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Total de Tránsitos
              </span>
            </div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {camion.totalTransitos}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700 dark:border-gray-200">
          <TabletButton
            onClick={() => showNotification('Ver historial completo', 'info')}
            variant="primary"
            size="medium"
            darkMode={darkMode}
            icon={<History className="w-5 h-5" />}
          >
            Ver Historial
          </TabletButton>
          <TabletButton
            onClick={() => showNotification('Editar información', 'info')}
            variant="secondary"
            size="medium"
            darkMode={darkMode}
            icon={<Edit className="w-5 h-5" />}
          >
            Editar
          </TabletButton>
          <TabletButton
            onClick={() => showNotification('Generar reporte', 'info')}
            variant="secondary"
            size="medium"
            darkMode={darkMode}
            icon={<FileText className="w-5 h-5" />}
          >
            Reporte
          </TabletButton>
        </div>
      </div>
    );
  };

  // Card de resultado de búsqueda
  const CamionCard = ({ camion }) => {
    const isSelected = selectedCamion?.id === camion.id;

    return (
      <button
        onClick={() => setSelectedCamion(camion)}
        className={`
          w-full p-4 rounded-lg border transition-all duration-200 text-left
          ${isSelected
            ? darkMode
              ? 'bg-blue-900/30 border-blue-500'
              : 'bg-blue-50 border-blue-500'
            : darkMode
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`
              p-3 rounded-lg
              ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <Truck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {camion.matricula}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {camion.empresa}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Chofer: {camion.chofer.nombre}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </button>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
      <TabletButton
        onClick={() => showNotification('Importar datos', 'info')}
        variant="secondary"
        size="small"
        darkMode={darkMode}
        icon={<Upload className="w-5 h-5" />}
      >
        Importar
      </TabletButton>
      <TabletButton
        onClick={() => showNotification('Exportar base de datos', 'info')}
        variant="secondary"
        size="small"
        darkMode={darkMode}
        icon={<Download className="w-5 h-5" />}
      >
        Exportar
      </TabletButton>
    </div>
  );

  return (
    <TabletModal
      isOpen={isOpen}
      onClose={onClose}
      title="Base de Datos - Camiones"
      darkMode={darkMode}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de búsqueda y resultados */}
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar por ${searchType === 'matricula' ? 'matrícula' : searchType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    text-base
                  `}
                />
              </div>
              <TabletButton
                onClick={() => setShowScanner(true)}
                variant="secondary"
                size="medium"
                darkMode={darkMode}
                className="!px-4"
                icon={<ScanLine className="w-5 h-5" />}
              >
                Escanear
              </TabletButton>
            </div>

            {/* Tipo de búsqueda */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Buscar por:
              </span>
              {['matricula', 'empresa', 'chofer'].map((tipo) => (
                <TabletButton
                  key={tipo}
                  onClick={() => setSearchType(tipo)}
                  variant={searchType === tipo ? 'primary' : 'secondary'}
                  size="small"
                  darkMode={darkMode}
                >
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </TabletButton>
              ))}
            </div>
          </div>

          {/* Resultados de búsqueda */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Resultados ({resultadosBusqueda.length})
              </h3>
              <TabletButton
                onClick={() => showNotification('Agregar nuevo camión', 'info')}
                variant="primary"
                size="small"
                darkMode={darkMode}
                icon={<Plus className="w-4 h-4" />}
              >
                Nuevo
              </TabletButton>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {resultadosBusqueda.length === 0 ? (
                <div className={`
                  text-center py-12 rounded-lg border-2 border-dashed
                  ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
                `}>
                  <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron resultados</p>
                  <p className="text-sm mt-2">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                resultadosBusqueda.map((camion) => (
                  <CamionCard key={camion.id} camion={camion} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel de detalles */}
        <div>
          {selectedCamion ? (
            <CamionDetails camion={selectedCamion} />
          ) : (
            <div className={`
              h-full flex items-center justify-center rounded-lg border-2 border-dashed
              ${darkMode ? 'border-gray-700' : 'border-gray-300'}
            `}>
              <div className="text-center">
                <Truck className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selecciona un camión para ver detalles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de scanner (simulado) */}
      {showScanner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowScanner(false)}
          />
          <div className={`
            relative w-full max-w-md
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
            rounded-xl shadow-2xl p-6
          `}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Escanear Código
            </h3>
            <div className={`
              h-64 rounded-lg flex items-center justify-center
              ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}
            `}>
              <ScanLine className="w-16 h-16 text-gray-400 animate-pulse" />
            </div>
            <p className={`text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coloca el código QR o de barras frente a la cámara
            </p>
            <TabletButton
              onClick={() => setShowScanner(false)}
              variant="secondary"
              size="medium"
              fullWidth
              darkMode={darkMode}
              className="mt-4"
            >
              Cancelar
            </TabletButton>
          </div>
        </div>
      )}
    </TabletModal>
  );
};

export default CamionesTablet;