import React, { useState } from 'react';
import { 
  AlertTriangle, Package, Truck, Timer, Database,
  CheckCircle, XCircle, Clock, Filter, RefreshCw,
  MessageSquare, User, Calendar, Bell, BellOff
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import { useApiData, useNotification } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal de Alertas Operativas optimizado para tablet
 * - Cards grandes con toda la información visible
 * - Acciones rápidas para resolver/ignorar
 * - Filtros por tipo y prioridad
 */
const AlertasTablet = ({ isOpen, onClose, darkMode }) => {
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [comentario, setComentario] = useState('');
  const { showNotification } = useNotification();

  // Cargar alertas
  const { data: alertasData, loading, refetch } = useApiData(
    () => apiService.getAlertas(),
    [],
    { pollingInterval: 10000 }
  );

  const alertas = alertasData?.data || [];

  // Filtrar alertas
  const alertasFiltradas = alertas.filter(alerta => {
    const matchTipo = filtroTipo === 'todas' || alerta.tipo === filtroTipo;
    const matchPrioridad = filtroPrioridad === 'todas' || alerta.prioridad === filtroPrioridad;
    return matchTipo && matchPrioridad && !alerta.resuelta;
  });

  // Configuración de tipos
  const tiposAlerta = {
    operativa: { icon: AlertTriangle, color: 'yellow', label: 'Operativa' },
    stock: { icon: Package, color: 'orange', label: 'Stock' },
    transito: { icon: Truck, color: 'blue', label: 'Tránsito' },
    sistema: { icon: Database, color: 'purple', label: 'Sistema' }
  };

  // Configuración de prioridades
  const prioridades = {
    alta: { color: 'red', label: 'Alta' },
    media: { color: 'yellow', label: 'Media' },
    baja: { color: 'green', label: 'Baja' }
  };

  // Resolver alerta
  const handleResolver = async (alertaId) => {
    try {
      await apiService.resolverAlerta(alertaId, 'usuario-actual');
      showNotification('Alerta resuelta correctamente', 'success');
      setAlertaSeleccionada(null);
      setComentario('');
      refetch();
    } catch (error) {
      showNotification('Error al resolver alerta', 'error');
    }
  };

  // Card de alerta
  const AlertaCard = ({ alerta }) => {
    const tipo = tiposAlerta[alerta.tipo];
    const prioridad = prioridades[alerta.prioridad];
    const TipoIcon = tipo.icon;
    
    return (
      <div className={`
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-xl p-6
        ${alerta.prioridad === 'alta' ? 'border-l-4 border-l-red-500' : ''}
        hover:shadow-lg transition-all duration-200
      `}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          {/* Contenido principal */}
          <div className="flex-1 space-y-3">
            {/* Header con tipo y prioridad */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`
                  p-3 rounded-lg
                  ${tipo.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/30'}
                  ${tipo.color === 'orange' && 'bg-orange-100 dark:bg-orange-900/30'}
                  ${tipo.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30'}
                  ${tipo.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/30'}
                `}>
                  <TipoIcon className={`w-6 h-6 text-${tipo.color}-500`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {alerta.titulo}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${prioridad.color === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
                      ${prioridad.color === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
                      ${prioridad.color === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}
                    `}>
                      Prioridad {prioridad.label}
                    </span>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                    `}>
                      {tipo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {alerta.descripcion}
            </p>

            {/* Detalles adicionales */}
            {alerta.detalles && (
              <div className={`
                p-3 rounded-lg
                ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
              `}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {alerta.detalles}
                </p>
              </div>
            )}

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {alerta.hora}
                </span>
              </div>
              {alerta.ubicacion && (
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {alerta.ubicacion}
                  </span>
                </div>
              )}
              {alerta.usuario && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {alerta.usuario}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-4">
            <TabletButton
              onClick={() => setAlertaSeleccionada(alerta)}
              variant="primary"
              size="medium"
              darkMode={darkMode}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Resolver
            </TabletButton>
            <TabletButton
              onClick={() => showNotification('Alerta silenciada por 1 hora', 'info')}
              variant="secondary"
              size="medium"
              darkMode={darkMode}
              icon={<BellOff className="w-5 h-5" />}
            >
              Silenciar
            </TabletButton>
          </div>
        </div>
      </div>
    );
  };

  // Modal de resolución
  const ResolverModal = () => {
    if (!alertaSeleccionada) return null;

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setAlertaSeleccionada(null)}
        />
        <div className={`
          relative w-full max-w-lg
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          rounded-xl shadow-2xl p-6
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Resolver Alerta
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {alertaSeleccionada.titulo}
          </p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Añadir comentario de resolución (opcional)..."
            className={`
              w-full p-3 rounded-lg border mb-4
              ${darkMode 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }
              min-h-[100px]
            `}
          />
          <div className="flex space-x-2">
            <TabletButton
              onClick={() => handleResolver(alertaSeleccionada.id)}
              variant="success"
              size="medium"
              fullWidth
              darkMode={darkMode}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              Confirmar Resolución
            </TabletButton>
            <TabletButton
              onClick={() => {
                setAlertaSeleccionada(null);
                setComentario('');
              }}
              variant="secondary"
              size="medium"
              fullWidth
              darkMode={darkMode}
            >
              Cancelar
            </TabletButton>
          </div>
        </div>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex items-center space-x-2">
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
    <>
      <TabletModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Alertas Operativas (${alertasFiltradas.length})`}
        darkMode={darkMode}
        headerActions={headerActions}
      >
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Filtros por tipo */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex-shrink-0`}>
              Tipo:
            </span>
            {['todas', ...Object.keys(tiposAlerta)].map((tipo) => (
              <TabletButton
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                variant={filtroTipo === tipo ? 'primary' : 'secondary'}
                size="small"
                darkMode={darkMode}
                className="flex-shrink-0"
              >
                {tipo === 'todas' ? 'Todas' : tiposAlerta[tipo].label}
              </TabletButton>
            ))}
          </div>

          {/* Filtros por prioridad */}
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex-shrink-0`}>
              Prioridad:
            </span>
            {['todas', ...Object.keys(prioridades)].map((prioridad) => (
              <TabletButton
                key={prioridad}
                onClick={() => setFiltroPrioridad(prioridad)}
                variant={filtroPrioridad === prioridad ? 'primary' : 'secondary'}
                size="small"
                darkMode={darkMode}
              >
                {prioridad === 'todas' ? 'Todas' : prioridades[prioridad].label}
              </TabletButton>
            ))}
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : alertasFiltradas.length === 0 ? (
            <div className={`
              text-center py-12 rounded-lg border-2 border-dashed
              ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
            `}>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-lg">No hay alertas activas</p>
              <p className="text-sm mt-2">El sistema está funcionando normalmente</p>
            </div>
          ) : (
            alertasFiltradas.map((alerta) => (
              <AlertaCard key={alerta.id} alerta={alerta} />
            ))
          )}
        </div>

        {/* Resumen */}
        {alertas.length > 0 && (
          <div className={`
            mt-6 p-4 rounded-lg
            ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className={`text-2xl font-bold text-red-500`}>
                  {alertas.filter(a => a.prioridad === 'alta' && !a.resuelta).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Alta Prioridad
                </p>
              </div>
              <div>
                <p className={`text-2xl font-bold text-yellow-500`}>
                  {alertas.filter(a => a.prioridad === 'media' && !a.resuelta).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Media Prioridad
                </p>
              </div>
              <div>
                <p className={`text-2xl font-bold text-green-500`}>
                  {alertas.filter(a => a.prioridad === 'baja' && !a.resuelta).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Baja Prioridad
                </p>
              </div>
              <div>
                <p className={`text-2xl font-bold text-gray-500`}>
                  {alertas.filter(a => a.resuelta).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Resueltas Hoy
                </p>
              </div>
            </div>
          </div>
        )}
      </TabletModal>

      {/* Modal de resolución */}
      <ResolverModal />
    </>
  );
};

export default AlertasTablet;