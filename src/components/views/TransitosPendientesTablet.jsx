import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Clock, User, Phone, Building, 
  CheckCircle, AlertCircle, Timer, Filter,
  ChevronRight, Search, RefreshCw, FileText,
  Camera, AlertTriangle, Grid, List, LayoutGrid,
  MessageSquare, X
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { useApiData, useNotification } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal de Tránsitos Pendientes optimizado para tablet
 * - Diseño en cards grandes para mejor touch
 * - Acciones rápidas con botones grandes
 * - Información clara y legible
 */
const TransitosPendientesTablet = ({ isOpen, onClose, darkMode }) => {
  const [selectedTransito, setSelectedTransito] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [vistaActual, setVistaActual] = useState('normal'); // 'normal', 'miniatura', 'compacta'
  const [showObservacionModal, setShowObservacionModal] = useState(false);
  const [transitoObservacion, setTransitoObservacion] = useState(null);
  const [observacionText, setObservacionText] = useState('');
  const { showNotification } = useNotification();

  // Cargar datos con polling
  const { data: transitos, loading, refetch } = useApiData(
    () => apiService.getTransitosPendientes(),
    [],
    { pollingInterval: 15000 }
  );

  // Filtrar tránsitos
  const transitosFiltrados = transitos?.data?.filter(transito => {
    const matchEstado = filtroEstado === 'todos' || transito.estado === filtroEstado;
    const matchSearch = searchTerm === '' || 
      transito.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transito.chofer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transito.deposito.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  }) || [];

  // Estados con colores
  const estados = {
    esperando: { label: 'Esperando', color: 'yellow', icon: Clock },
    pasando_soga: { label: 'Pasando Soga', color: 'blue', icon: Package },
    precintando: { label: 'Precintando', color: 'green', icon: CheckCircle },
    con_problema: { label: 'Con Problema', color: 'red', icon: AlertTriangle }
  };

  // Acciones rápidas
  const handleAccionRapida = async (transitoId, accion) => {
    try {
      switch (accion) {
        case 'observacion':
          const transito = transitosFiltrados.find(t => t.id === transitoId);
          setTransitoObservacion(transito);
          setShowObservacionModal(true);
          setObservacionText('');
          break;
        case 'problema':
          setSelectedTransito(transitosFiltrados.find(t => t.id === transitoId));
          // Abrir modal de problema
          break;
        case 'completar':
          await apiService.updateTransitoEstado(transitoId, 'completado');
          showNotification('Tránsito completado', 'success');
          break;
      }
      refetch();
    } catch (error) {
      showNotification('Error al procesar acción', 'error');
    }
  };

  // Guardar observación
  const handleGuardarObservacion = async () => {
    if (!observacionText.trim()) {
      showNotification('La observación no puede estar vacía', 'warning');
      return;
    }

    try {
      // Aquí iría la llamada a la API para guardar la observación
      await apiService.addTransitoObservacion(transitoObservacion.id, observacionText);
      showNotification('Observación agregada correctamente', 'success');
      setShowObservacionModal(false);
      setObservacionText('');
      setTransitoObservacion(null);
      refetch();
    } catch (error) {
      showNotification('Error al guardar observación', 'error');
    }
  };

  // Card de tránsito optimizada para tablet
  const TransitoCard = ({ transito }) => {
    const estado = estados[transito.estado] || estados.esperando;
    const EstadoIcon = estado.icon;
    
    return (
      <div className={`
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-xl p-6 
        hover:shadow-lg transition-all duration-200
      `}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        {/* Información principal */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vehículo */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Vehículo
              </span>
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.matricula}
            </p>
            {transito.secundaria && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Semi: {transito.secundaria}
              </p>
            )}
          </div>

          {/* Depósito y tipo */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Destino
              </span>
            </div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.deposito}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tipo: {transito.tipo}
              {transito.codigo && ` - ${transito.codigo}`}
            </p>
          </div>

          {/* Chofer */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Chofer
              </span>
            </div>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.chofer}
            </p>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {transito.telefono}
              </p>
            </div>
          </div>

          {/* Estado y tiempo */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <EstadoIcon className="w-5 h-5 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Estado
              </span>
            </div>
            <div className={`
              inline-flex items-center space-x-2 px-3 py-1 rounded-full
              ${estado.color === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
              ${estado.color === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
              ${estado.color === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}
              ${estado.color === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
            `}>
              <EstadoIcon className="w-4 h-4" />
              <span className="font-medium">{estado.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-gray-400" />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Salida: {transito.salida}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-4">
          <TabletButton
            onClick={() => handleAccionRapida(transito.id, 'observacion')}
            variant="primary"
            size="medium"
            darkMode={darkMode}
            icon={<MessageSquare className="w-5 h-5" />}
          >
            Observaciones
          </TabletButton>
          
          {transito.estado === 'precintando' && (
            <TabletButton
              onClick={() => handleAccionRapida(transito.id, 'completar')}
              variant="success"
              size="medium"
              darkMode={darkMode}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Completar
            </TabletButton>
          )}
          
          <TabletButton
            onClick={() => handleAccionRapida(transito.id, 'problema')}
            variant="secondary"
            size="medium"
            darkMode={darkMode}
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            Reportar
          </TabletButton>
        </div>
        </div>

        {/* Observaciones si existen */}
        {transito.observaciones && transito.observaciones.length > 0 && (
          <div className={`w-full mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Observaciones:
                </span>
                <div className="mt-2 space-y-2">
                  {transito.observaciones.slice(-2).map((obs, index) => (
                    <div key={obs.id || index} className={`
                      p-3 rounded-lg text-sm break-words
                      ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                    `}>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap break-words`}>
                        {obs.texto}
                      </p>
                      <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {obs.usuario} - {new Date(obs.fecha).toLocaleString('es-UY', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                  {transito.observaciones.length > 2 && (
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      +{transito.observaciones.length - 2} observaciones más
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Vista Miniatura - Cards pequeñas para ver muchos tránsitos
  const TransitoMiniatura = ({ transito }) => {
    const estado = estados[transito.estado] || estados.esperando;
    const EstadoIcon = estado.icon;
    
    return (
      <button
        onClick={() => setSelectedTransito(transito)}
        className={`
          ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}
          border rounded-lg p-3 w-full
          hover:shadow-md transition-all duration-200
          text-left
        `}
      >
        {/* Header con matrícula y estado */}
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {transito.matricula}
          </span>
          <div className={`
            p-1 rounded
            ${estado.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/30'}
            ${estado.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30'}
            ${estado.color === 'green' && 'bg-green-100 dark:bg-green-900/30'}
            ${estado.color === 'red' && 'bg-red-100 dark:bg-red-900/30'}
          `}>
            <EstadoIcon className="w-4 h-4" />
          </div>
        </div>
        
        {/* Info compacta */}
        <div className="space-y-1">
          <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">Dep:</span> {transito.deposito}
          </p>
          <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">Tipo:</span> {transito.tipo}
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Clock className="w-3 h-3 inline mr-1" />
            {transito.salida}
          </p>
          {/* Indicador de observaciones */}
          {transito.observaciones && transito.observaciones.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-500 font-medium">
                {transito.observaciones.length} obs.
              </span>
            </div>
          )}
        </div>
      </button>
    );
  };

  // Vista Compacta - Lista simple con información esencial
  const TransitoCompacto = ({ transito }) => {
    const estado = estados[transito.estado] || estados.esperando;
    const EstadoIcon = estado.icon;
    
    return (
      <div className={`
        ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
        flex items-center justify-between p-3 rounded-lg
        border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        hover:shadow-sm transition-all duration-200
      `}>
        {/* Info principal */}
        <div className="flex items-center space-x-4 flex-1">
          <div className={`
            p-1.5 rounded
            ${estado.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/30'}
            ${estado.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30'}
            ${estado.color === 'green' && 'bg-green-100 dark:bg-green-900/30'}
            ${estado.color === 'red' && 'bg-red-100 dark:bg-red-900/30'}
          `}>
            <EstadoIcon className="w-4 h-4" />
          </div>
          
          <div className="flex items-center space-x-6 flex-1">
            <span className={`font-bold text-sm w-24 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.matricula}
            </span>
            <span className={`text-sm w-32 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {transito.deposito}
            </span>
            <span className={`text-sm w-24 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {transito.tipo}
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {transito.salida}
            </span>
            {/* Indicador de observaciones */}
            {transito.observaciones && transito.observaciones.length > 0 && (
              <div className="flex items-center space-x-1 ml-4">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">
                  {transito.observaciones.length}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Acciones rápidas */}
        <div className="flex items-center space-x-1">
          <TabletButton
            onClick={() => handleAccionRapida(transito.id, 'observacion')}
            variant="primary"
            size="small"
            darkMode={darkMode}
            className="!px-3 !py-1"
          >
            <MessageSquare className="w-4 h-4" />
          </TabletButton>
          <TabletButton
            onClick={() => setSelectedTransito(transito)}
            variant="secondary"
            size="small"
            darkMode={darkMode}
            className="!px-3 !py-1"
          >
            <ChevronRight className="w-4 h-4" />
          </TabletButton>
        </div>
      </div>
    );
  };

  // Modal de detalle para vista miniatura
  const TransitoDetalleModal = () => {
    if (!selectedTransito) return null;
    
    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setSelectedTransito(null)}
        />
        <div className={`
          relative w-full max-w-2xl
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          rounded-xl shadow-2xl p-6
        `}>
          <TransitoCard transito={selectedTransito} />
          <TabletButton
            onClick={() => setSelectedTransito(null)}
            variant="secondary"
            size="medium"
            fullWidth
            darkMode={darkMode}
            className="mt-4"
          >
            Cerrar
          </TabletButton>
        </div>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
      {/* Selector de vista */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <TabletButton
          onClick={() => setVistaActual('normal')}
          variant={vistaActual === 'normal' ? 'primary' : 'secondary'}
          size="small"
          darkMode={darkMode}
          className="!px-3"
          icon={<List className="w-4 h-4" />}
        />
        <TabletButton
          onClick={() => setVistaActual('miniatura')}
          variant={vistaActual === 'miniatura' ? 'primary' : 'secondary'}
          size="small"
          darkMode={darkMode}
          className="!px-3"
          icon={<Grid className="w-4 h-4" />}
        />
        <TabletButton
          onClick={() => setVistaActual('compacta')}
          variant={vistaActual === 'compacta' ? 'primary' : 'secondary'}
          size="small"
          darkMode={darkMode}
          className="!px-3"
          icon={<LayoutGrid className="w-4 h-4" />}
        />
      </div>
      
      <TabletButton
        onClick={refetch}
        variant="secondary"
        size="small"
        darkMode={darkMode}
        icon={<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />}
        disabled={loading}
      >
        Actualizar
      </TabletButton>
    </div>
  );

  return (
    <TabletModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tránsitos Pendientes (${transitosFiltrados.length})`}
      darkMode={darkMode}
      headerActions={headerActions}
    >
      {/* Barra de filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por matrícula, chofer o depósito..."
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

        {/* Filtros de estado */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {['todos', ...Object.keys(estados)].map((estado) => (
            <TabletButton
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              variant={filtroEstado === estado ? 'primary' : 'secondary'}
              size="small"
              darkMode={darkMode}
              className="flex-shrink-0"
            >
              {estado === 'todos' ? 'Todos' : estados[estado].label}
              {estado !== 'todos' && (
                <span className="ml-2">
                  ({transitosFiltrados.filter(t => t.estado === estado).length})
                </span>
              )}
            </TabletButton>
          ))}
        </div>
      </div>

      {/* Lista de tránsitos */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : transitosFiltrados.length === 0 ? (
          <div className={`
            text-center py-12 rounded-lg border-2 border-dashed
            ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
          `}>
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay tránsitos pendientes</p>
            <p className="text-sm mt-2">Los nuevos tránsitos aparecerán aquí</p>
          </div>
        ) : (
          <>
            {/* Vista Normal - Cards completas */}
            {vistaActual === 'normal' && (
              <div className="space-y-4">
                {transitosFiltrados.map((transito) => (
                  <TransitoCard key={transito.id} transito={transito} />
                ))}
              </div>
            )}
            
            {/* Vista Miniatura - Grid de cards pequeñas */}
            {vistaActual === 'miniatura' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {transitosFiltrados.map((transito) => (
                  <TransitoMiniatura key={transito.id} transito={transito} />
                ))}
              </div>
            )}
            
            {/* Vista Compacta - Lista simplificada */}
            {vistaActual === 'compacta' && (
              <div className="space-y-2">
                {transitosFiltrados.map((transito) => (
                  <TransitoCompacto key={transito.id} transito={transito} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Resumen */}
      {transitosFiltrados.length > 0 && (
        <div className={`
          mt-6 p-4 rounded-lg
          ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
        `}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {Object.entries(estados).map(([key, value]) => {
              const count = transitosFiltrados.filter(t => t.estado === key).length;
              const Icon = value.icon;
              return (
                <div key={key}>
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {count}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {value.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Modal de detalle para vista miniatura */}
      {selectedTransito && vistaActual === 'miniatura' && (
        <TransitoDetalleModal />
      )}

      {/* Modal de Observaciones */}
      {showObservacionModal && transitoObservacion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowObservacionModal(false);
              setObservacionText('');
              setTransitoObservacion(null);
            }}
          />
          <div className={`
            relative w-full max-w-2xl
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
            rounded-xl shadow-2xl p-6
          `}>
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Agregar Observación
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tránsito: {transitoObservacion.matricula} - {transitoObservacion.deposito}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowObservacionModal(false);
                  setObservacionText('');
                  setTransitoObservacion(null);
                }}
                className={`
                  p-2 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Información del tránsito */}
            <div className={`
              p-4 rounded-lg mb-6
              ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chofer</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transitoObservacion.chofer}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transitoObservacion.tipo}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hora Salida</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {transitoObservacion.salida}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {estados[transitoObservacion.estado]?.label || 'Esperando'}
                  </p>
                </div>
              </div>
            </div>

            {/* Campo de observación */}
            <div className="mb-6">
              <label className={`
                block text-sm font-medium mb-2
                ${darkMode ? 'text-gray-300' : 'text-gray-700'}
              `}>
                Observación
              </label>
              <textarea
                value={observacionText}
                onChange={(e) => setObservacionText(e.target.value)}
                placeholder="Escriba aquí la observación sobre este tránsito..."
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-lg border
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-base resize-none
                `}
              />
              <p className={`
                text-sm mt-2
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                {observacionText.length}/500 caracteres
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3">
              <TabletButton
                onClick={() => {
                  setShowObservacionModal(false);
                  setObservacionText('');
                  setTransitoObservacion(null);
                }}
                variant="secondary"
                size="medium"
                darkMode={darkMode}
              >
                Cancelar
              </TabletButton>
              <TabletButton
                onClick={handleGuardarObservacion}
                variant="primary"
                size="medium"
                darkMode={darkMode}
                disabled={!observacionText.trim()}
                icon={<CheckCircle className="w-5 h-5" />}
              >
                Guardar Observación
              </TabletButton>
            </div>
          </div>
        </div>
      )}
    </TabletModal>
  );
};

export default TransitosPendientesTablet;