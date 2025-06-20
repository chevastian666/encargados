import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, Clock, User, Phone, Building, 
  CheckCircle, AlertCircle, Timer, Filter,
  ChevronRight, Search, RefreshCw, FileText,
  Camera, AlertTriangle, Grid, List, LayoutGrid,
  MessageSquare, X, Info, Eye, MapPin, Calendar,
  FileCheck, Briefcase
} from 'lucide-react';
import TabletModal from '../common/TabletModal';
import TabletButton from '../common/TabletButton';
import ConfirmDialog from '../common/ConfirmDialog';
import SuccessAnimation from '../common/SuccessAnimation';
import QuickStatusChange from '../common/QuickStatusChange';
import TransitCMOMessages from '../common/TransitCMOMessages';
import { useApiData, useNotification, useRealtimeUpdates } from '../../hooks';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';
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
  const [tableroActivo, setTableroActivo] = useState('pendientes'); // 'listos', 'pendientes', 'completados'
  const [showDetalleRapido, setShowDetalleRapido] = useState(false);
  const [transitoDetalleRapido, setTransitoDetalleRapido] = useState(null);
  const [hoveredTransitoId, setHoveredTransitoId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [animatingTransitoId, setAnimatingTransitoId] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); // Para navegación con teclado
  const { showNotification } = useNotification();

  // Cargar datos con polling
  const { data: transitos, loading, refetch, updateData } = useApiData(
    () => apiService.getTransitosPendientes(),
    [],
    { pollingInterval: 15000 }
  );

  // Configurar actualizaciones en tiempo real
  const { connected } = useRealtimeUpdates({
    onTransitUpdate: (update) => {
      // Actualizar datos localmente sin hacer nueva petición
      if (update.transitId && update.newState) {
        updateData(prevData => {
          if (!prevData?.data) return prevData;
          
          return {
            ...prevData,
            data: prevData.data.map(transito => 
              transito.id === update.transitId 
                ? { ...transito, estado: update.newState, ...update.additionalData }
                : transito
            )
          };
        });
        
        // Animación visual para el cambio
        setAnimatingTransitoId(update.transitId);
        setTimeout(() => setAnimatingTransitoId(null), 1000);
      }
    },
    showNotifications: false // Las notificaciones las maneja AutomaticAlerts
  });

  // Filtrar tránsitos
  const transitosFiltrados = transitos?.data?.filter(transito => {
    const matchEstado = filtroEstado === 'todos' || transito.estado === filtroEstado;
    const matchSearch = searchTerm === '' || 
      transito.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transito.chofer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transito.deposito.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  }) || [];

  // Organizar tránsitos por tableros/categorías
  const transitosPorTablero = {
    listos: transitosFiltrados.filter(t => t.estado === 'listo' || t.estado === 'precintando'),
    pendientes: transitosFiltrados.filter(t => 
      t.estado === 'esperando' || 
      t.estado === 'pasando_soga' || 
      t.estado === 'con_problema' ||
      t.estado === 'no_sale_hoy'
    ),
    completados: transitosFiltrados.filter(t => t.estado === 'completado')
  };

  // Obtener tránsitos del tablero activo
  const transitosTableroActivo = transitosPorTablero[tableroActivo] || [];

  // Configurar shortcuts de teclado
  const shortcuts = [
    {
      key: 'escape',
      action: () => {
        if (showObservacionModal) {
          setShowObservacionModal(false);
        } else if (showDetalleRapido) {
          setShowDetalleRapido(false);
        } else {
          onClose();
        }
      },
      description: 'Cerrar'
    },
    {
      key: '/',
      action: () => {
        document.querySelector('input[type="text"]')?.focus();
      },
      description: 'Buscar'
    },
    {
      key: 'r',
      ctrl: true,
      action: (e) => {
        e.preventDefault();
        refetch();
        showNotification('Datos actualizados', 'info');
      },
      description: 'Actualizar'
    },
    {
      key: 'arrowdown',
      action: () => {
        setSelectedIndex(prev => 
          Math.min(prev + 1, transitosTableroActivo.length - 1)
        );
      },
      description: 'Siguiente'
    },
    {
      key: 'arrowup',
      action: () => {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      },
      description: 'Anterior'
    },
    {
      key: '1',
      action: () => {
        const transito = transitosTableroActivo[selectedIndex];
        if (transito && transito.estado === 'esperando') {
          handleQuickStatusChange({
            transitoId: transito.id,
            oldState: transito.estado,
            newState: 'listo',
            usuario: 'Usuario Actual',
            timestamp: new Date().toISOString()
          });
        }
      },
      description: 'Marcar como listo'
    },
    {
      key: 'o',
      action: () => {
        const transito = transitosTableroActivo[selectedIndex];
        if (transito) {
          handleAccionRapida(transito.id, 'observacion');
        }
      },
      description: 'Agregar observación'
    },
    {
      key: 'v',
      action: () => {
        const vistas = ['normal', 'miniatura', 'compacta'];
        const currentIndex = vistas.indexOf(vistaActual);
        const nextIndex = (currentIndex + 1) % vistas.length;
        setVistaActual(vistas[nextIndex]);
      },
      description: 'Cambiar vista'
    },
    {
      key: 'tab',
      action: (e) => {
        e.preventDefault();
        const tableros = ['listos', 'pendientes', 'completados'];
        const currentIndex = tableros.indexOf(tableroActivo);
        const nextIndex = (currentIndex + 1) % tableros.length;
        setTableroActivo(tableros[nextIndex]);
      },
      description: 'Cambiar tablero'
    }
  ];

  useKeyboardShortcuts(shortcuts, [
    showObservacionModal, 
    showDetalleRapido, 
    selectedIndex, 
    transitosTableroActivo,
    vistaActual,
    tableroActivo
  ]);

  // Estados con colores mejorados y prioridad visual
  const estados = {
    listo: { 
      label: 'Listo para precintar', 
      shortLabel: 'Listo',
      color: 'green', 
      icon: CheckCircle,
      emoji: '✅',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      borderClass: 'border-green-500',
      textClass: 'text-green-800 dark:text-green-300',
      iconClass: 'text-green-600 dark:text-green-400',
      priority: 1
    },
    esperando: { 
      label: 'En espera', 
      shortLabel: 'Esperando',
      color: 'yellow', 
      icon: Clock,
      emoji: '⚠️',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderClass: 'border-yellow-500',
      textClass: 'text-yellow-800 dark:text-yellow-300',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      priority: 2
    },
    pasando_soga: { 
      label: 'Pasando Soga', 
      shortLabel: 'En proceso',
      color: 'blue', 
      icon: Package,
      emoji: '🔄',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      borderClass: 'border-blue-500',
      textClass: 'text-blue-800 dark:text-blue-300',
      iconClass: 'text-blue-600 dark:text-blue-400',
      priority: 3
    },
    precintando: { 
      label: 'Precintando', 
      shortLabel: 'Precintando',
      color: 'green', 
      icon: CheckCircle,
      emoji: '🔒',
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-800 dark:text-emerald-300',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      priority: 3
    },
    con_problema: { 
      label: 'Con problema', 
      shortLabel: 'Problema',
      color: 'red', 
      icon: AlertTriangle,
      emoji: '❌',
      bgClass: 'bg-red-100 dark:bg-red-900/30',
      borderClass: 'border-red-500',
      textClass: 'text-red-800 dark:text-red-300',
      iconClass: 'text-red-600 dark:text-red-400',
      priority: 0
    },
    no_sale_hoy: { 
      label: 'No sale hoy', 
      shortLabel: 'No sale',
      color: 'gray', 
      icon: Timer,
      emoji: '📋',
      bgClass: 'bg-gray-100 dark:bg-gray-900/30',
      borderClass: 'border-gray-400',
      textClass: 'text-gray-600 dark:text-gray-400',
      iconClass: 'text-gray-500 dark:text-gray-500',
      priority: 4
    },
    completado: { 
      label: 'Completado', 
      shortLabel: 'Completado',
      color: 'gray', 
      icon: CheckCircle,
      emoji: '✓',
      bgClass: 'bg-gray-100 dark:bg-gray-900/30',
      borderClass: 'border-gray-400',
      textClass: 'text-gray-600 dark:text-gray-400',
      iconClass: 'text-gray-500 dark:text-gray-500',
      priority: 5
    }
  };

  // Acciones rápidas con confirmación
  const handleAccionRapida = async (transitoId, accion) => {
    const transito = transitosFiltrados.find(t => t.id === transitoId);
    
    switch (accion) {
      case 'observacion':
        setTransitoObservacion(transito);
        setShowObservacionModal(true);
        setObservacionText('');
        break;
        
      case 'completar':
        setConfirmAction({
          type: 'completar',
          transitoId,
          transito,
          title: 'Completar Tránsito',
          message: `¿Está seguro de marcar como completado el tránsito ${transito.matricula}?`,
          confirmText: 'Completar',
          confirmType: 'success'
        });
        setShowConfirmDialog(true);
        break;
        
      case 'precintar':
        setConfirmAction({
          type: 'precintar',
          transitoId,
          transito,
          title: 'Iniciar Precintado',
          message: `¿Está seguro de iniciar el precintado del tránsito ${transito.matricula}?`,
          confirmText: 'Iniciar Precintado',
          confirmType: 'success'
        });
        setShowConfirmDialog(true);
        break;
        
      case 'marcar_listo':
        setConfirmAction({
          type: 'marcar_listo',
          transitoId,
          transito,
          title: 'Marcar como Listo',
          message: `¿Está seguro de marcar como listo el tránsito ${transito.matricula}?`,
          confirmText: 'Marcar Listo',
          confirmType: 'success'
        });
        setShowConfirmDialog(true);
        break;
    }
  };

  // Ejecutar acción confirmada
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    
    setProcessingAction(true);
    try {
      const { type, transitoId, transito } = confirmAction;
      
      // Animación previa
      setAnimatingTransitoId(transitoId);
      
      switch (type) {
        case 'completar':
          await apiService.updateTransitoEstado(transitoId, 'completado');
          setSuccessMessage(`✅ Tránsito ${transito.matricula} completado`);
          setShowSuccessAnimation(true);
          showNotification(`Tránsito ${transito.matricula} completado exitosamente`, 'success');
          break;
          
        case 'precintar':
          await apiService.updateTransitoEstado(transitoId, 'precintando');
          setSuccessMessage(`🔒 Iniciando precintado de ${transito.matricula}`);
          setShowSuccessAnimation(true);
          showNotification(`Iniciado precintado de ${transito.matricula}`, 'success');
          break;
          
        case 'marcar_listo':
          await apiService.updateTransitoEstado(transitoId, 'listo');
          setSuccessMessage(`✅ ${transito.matricula} listo para precintar`);
          setShowSuccessAnimation(true);
          showNotification(`Tránsito ${transito.matricula} marcado como listo`, 'success');
          break;
      }
      
      // Esperar un momento para la animación
      setTimeout(() => {
        setAnimatingTransitoId(null);
        refetch();
      }, 500);
      
    } catch (error) {
      showNotification('Error al procesar acción', 'error');
      setAnimatingTransitoId(null);
    } finally {
      setProcessingAction(false);
      setShowConfirmDialog(false);
      setConfirmAction(null);
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
      setSuccessMessage(`💬 Observación agregada a ${transitoObservacion.matricula}`);
      setShowSuccessAnimation(true);
      showNotification('Observación agregada correctamente', 'success');
      setShowObservacionModal(false);
      setObservacionText('');
      setTransitoObservacion(null);
      refetch();
    } catch (error) {
      showNotification('Error al guardar observación', 'error');
    }
  };

  // Función para mostrar detalle rápido
  const handleShowDetalleRapido = (transito) => {
    setTransitoDetalleRapido(transito);
    setShowDetalleRapido(true);
  };

  // Manejar cambio rápido de estado
  const handleQuickStatusChange = async (data) => {
    const { transitoId, oldState, newState, reason, usuario, timestamp } = data;
    
    try {
      // Animación visual
      setAnimatingTransitoId(transitoId);
      
      // Actualizar estado
      await apiService.updateTransitoEstado(transitoId, newState);
      
      // Si hay razón, agregarla como observación
      if (reason) {
        const observationText = `${reason.text} - Cambio de estado: ${oldState} → ${newState}`;
        await apiService.addTransitoObservacion(transitoId, observationText);
      }
      
      // Registrar cambio (en producción esto iría al servidor)
      console.log('Cambio de estado registrado:', {
        transitoId,
        oldState,
        newState,
        reason: reason?.text,
        usuario,
        timestamp
      });
      
      // Mostrar notificación de éxito
      const transito = transitosFiltrados.find(t => t.id === transitoId);
      setSuccessMessage(`✓ Estado actualizado: ${transito?.matricula}`);
      setShowSuccessAnimation(true);
      
      // Refrescar datos
      setTimeout(() => {
        setAnimatingTransitoId(null);
        refetch();
      }, 500);
      
    } catch (error) {
      showNotification('Error al cambiar estado', 'error');
      setAnimatingTransitoId(null);
    }
  };

  // Card de tránsito optimizada para tablet
  const TransitoCard = ({ transito }) => {
    const estado = estados[transito.estado] || estados.esperando;
    const EstadoIcon = estado.icon;
    
    // Prioridad visual según estado
    const isUrgent = transito.estado === 'listo' || transito.estado === 'con_problema';
    const isLowPriority = transito.estado === 'no_sale_hoy';
    const isHovered = hoveredTransitoId === transito.id;
    const isAnimating = animatingTransitoId === transito.id;
    
    return (
      <div 
        className={`
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
          border-2 rounded-xl p-6 
          hover:shadow-lg transition-all duration-300
          ${isUrgent ? estado.borderClass + ' border-2' : darkMode ? 'border-gray-700' : 'border-gray-200'}
          ${isLowPriority ? 'opacity-60' : ''}
          ${isHovered ? 'shadow-xl scale-[1.02]' : ''}
          ${isAnimating ? 'animate-pulse scale-[1.05] shadow-2xl' : ''}
          relative overflow-hidden cursor-pointer
        `}
        onMouseEnter={() => setHoveredTransitoId(transito.id)}
        onMouseLeave={() => setHoveredTransitoId(null)}
        onClick={() => handleShowDetalleRapido(transito)}
      >
        {/* Indicador visual de prioridad */}
        <div className={`absolute top-0 left-0 w-full h-1 ${estado.bgClass}`} />
        
        {/* Badge de estado prominente */}
        <div className="absolute top-4 right-4">
          <div className={`
            inline-flex items-center space-x-2 px-4 py-2 rounded-full
            ${estado.bgClass} ${estado.textClass}
            font-semibold text-sm
          `}>
            <span className="text-lg">{estado.emoji}</span>
            <span>{estado.shortLabel}</span>
          </div>
        </div>
        
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

          {/* Tiempo de salida con indicador visual */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tiempo
              </span>
            </div>
            <div className="space-y-2">
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {transito.salida}
              </p>
              {/* Indicador de urgencia temporal */}
              {transito.tiempoRestante && (
                <div className={`
                  text-xs px-2 py-1 rounded-full inline-flex items-center
                  ${transito.tiempoRestante < 30 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : transito.tiempoRestante < 60
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                  }
                `}>
                  <Clock className="w-3 h-3 mr-1" />
                  {transito.tiempoRestante < 60 
                    ? `${transito.tiempoRestante}min` 
                    : `${Math.floor(transito.tiempoRestante / 60)}h`
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones con cambio rápido de estado */}
        <div className="flex flex-col space-y-3 lg:ml-4">
          {/* Cambio rápido de estado */}
          <div onClick={(e) => e.stopPropagation()}>
            <QuickStatusChange
              transito={transito}
              onStatusChange={handleQuickStatusChange}
              darkMode={darkMode}
              compact={false}
            />
          </div>
          
          {/* Otras acciones */}
          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
            <TabletButton
              onClick={(e) => {
                e.stopPropagation();
                handleShowDetalleRapido(transito);
              }}
              variant="secondary"
              size="medium"
              darkMode={darkMode}
              icon={<Eye className="w-5 h-5" />}
            >
              Ver más
            </TabletButton>
            
            <TabletButton
              onClick={(e) => {
                e.stopPropagation();
                handleAccionRapida(transito.id, 'observacion');
              }}
              variant="primary"
              size="medium"
              darkMode={darkMode}
              icon={<MessageSquare className="w-5 h-5" />}
            >
              Observaciones
            </TabletButton>
          </div>
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
        
        {/* Mensajes del CMO asociados al tránsito */}
        <div className="mt-4">
          <TransitCMOMessages 
            transitId={transito.matricula}
            darkMode={darkMode}
            compact={true}
            showBadge={true}
          />
        </div>
      </div>
    );
  };

  // Vista Miniatura - Cards pequeñas para ver muchos tránsitos
  const TransitoMiniatura = ({ transito }) => {
    const estado = estados[transito.estado] || estados.esperando;
    const EstadoIcon = estado.icon;
    const isHovered = hoveredTransitoId === transito.id;
    
    return (
      <button
        onClick={() => handleShowDetalleRapido(transito)}
        onMouseEnter={() => setHoveredTransitoId(transito.id)}
        onMouseLeave={() => setHoveredTransitoId(null)}
        className={`
          ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}
          border rounded-lg p-3 w-full
          hover:shadow-md transition-all duration-200
          text-left relative
          ${isHovered ? 'shadow-lg scale-105 z-10' : ''}
        `}
      >
        {/* Indicador visual de hover */}
        {isHovered && (
          <div className="absolute top-2 right-2">
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
        )}
        {/* Header con matrícula y estado */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {transito.matricula}
            </span>
            {/* Mini badge de estado */}
            <div className={`
              inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs
              ${estado.bgClass} ${estado.textClass}
            `}>
              {estado.emoji} {estado.shortLabel}
            </div>
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
        
        {/* Acciones rápidas con cambio de estado */}
        <div className="flex items-center space-x-2">
          {/* Cambio rápido de estado (compacto) */}
          <QuickStatusChange
            transito={transito}
            onStatusChange={handleQuickStatusChange}
            darkMode={darkMode}
            compact={true}
          />
          
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

  // Tableros/Categorías
  const tableros = [
    { 
      id: 'listos', 
      label: 'Listos para precintar', 
      count: transitosPorTablero.listos.length,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: CheckCircle
    },
    { 
      id: 'pendientes', 
      label: 'Pendientes', 
      count: transitosPorTablero.pendientes.length,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: Clock
    },
    { 
      id: 'completados', 
      label: 'Completados hoy', 
      count: transitosPorTablero.completados.length,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      icon: CheckCircle
    }
  ];

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
      title={`Tránsitos - ${tableros.find(t => t.id === tableroActivo)?.label || 'Todos'} (${transitosTableroActivo.length})`}
      darkMode={darkMode}
      headerActions={headerActions}
    >
      {/* Barra de filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        {/* Tableros/Categorías */}
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          {tableros.map((tablero) => {
            const Icon = tablero.icon;
            const isActive = tableroActivo === tablero.id;
            return (
              <button
                key={tablero.id}
                onClick={() => setTableroActivo(tablero.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? `${tablero.bgColor} ${tablero.color} font-semibold shadow-md` 
                    : darkMode 
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }
                  border-2 ${isActive ? 'border-current' : 'border-transparent'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{tablero.label}</span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${isActive 
                    ? darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {tablero.count}
                </span>
              </button>
            );
          })}
        </div>

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

      {/* Lista de tránsitos con scroll container */}
      <div className="overflow-y-auto max-h-[70vh] -mx-6 px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : transitosTableroActivo.length === 0 ? (
          <div className={`
            text-center py-12 rounded-lg border-2 border-dashed
            ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
          `}>
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {tableroActivo === 'listos' && 'No hay tránsitos listos para precintar'}
              {tableroActivo === 'pendientes' && 'No hay tránsitos pendientes'}
              {tableroActivo === 'completados' && 'No hay tránsitos completados hoy'}
            </p>
            <p className="text-sm mt-2">
              {tableroActivo === 'listos' && 'Los tránsitos listos aparecerán aquí'}
              {tableroActivo === 'pendientes' && 'Los tránsitos en espera aparecerán aquí'}
              {tableroActivo === 'completados' && 'Los tránsitos completados aparecerán aquí'}
            </p>
          </div>
        ) : (
          <>
            {/* Vista Normal - Cards completas con grid responsivo */}
            {vistaActual === 'normal' && (
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {transitosTableroActivo.map((transito) => (
                  <TransitoCard key={transito.id} transito={transito} />
                ))}
              </div>
            )}
            
            {/* Vista Miniatura - Grid responsivo para tablets */}
            {vistaActual === 'miniatura' && (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 tablet-portrait:grid-cols-2 tablet-landscape:grid-cols-3">
                {transitosTableroActivo.map((transito) => (
                  <TransitoMiniatura key={transito.id} transito={transito} />
                ))}
              </div>
            )}
            
            {/* Vista Compacta - Lista con scroll */}
            {vistaActual === 'compacta' && (
              <div className="space-y-2">
                {transitosTableroActivo.map((transito) => (
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
      {/* Panel lateral de detalle rápido */}
      {showDetalleRapido && transitoDetalleRapido && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setShowDetalleRapido(false);
              setTransitoDetalleRapido(null);
            }}
          />
          
          {/* Panel lateral */}
          <div className={`
            absolute right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px]
            ${darkMode ? 'bg-gray-900' : 'bg-white'}
            shadow-2xl transform transition-transform duration-300
            ${showDetalleRapido ? 'translate-x-0' : 'translate-x-full'}
            overflow-y-auto
          `}>
            {/* Header del panel */}
            <div className={`
              sticky top-0 z-10 p-4 border-b
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${estados[transitoDetalleRapido.estado]?.bgClass}
                  `}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transitoDetalleRapido.matricula}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`
                        text-sm px-2 py-1 rounded-full
                        ${estados[transitoDetalleRapido.estado]?.bgClass}
                        ${estados[transitoDetalleRapido.estado]?.textClass}
                      `}>
                        {estados[transitoDetalleRapido.estado]?.emoji} {estados[transitoDetalleRapido.estado]?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetalleRapido(false);
                    setTransitoDetalleRapido(null);
                  }}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                  `}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Contenido del panel */}
            <div className="p-6 space-y-6">
              {/* Foto del camión (simulada) */}
              <div className={`
                rounded-lg overflow-hidden
                ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}
                h-48 flex items-center justify-center
              `}>
                <div className="text-center">
                  <Camera className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Foto del camión
                  </p>
                </div>
              </div>
              
              {/* Información detallada en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información del vehículo */}
                <div className={`
                  p-4 rounded-lg border
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Truck className="w-5 h-5 mr-2" />
                    Vehículo
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Matrícula principal</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.matricula}
                      </p>
                    </div>
                    {transitoDetalleRapido.secundaria && (
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Matrícula secundaria</p>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {transitoDetalleRapido.secundaria}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo de carga</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.tipo}
                        {transitoDetalleRapido.codigo && ` - ${transitoDetalleRapido.codigo}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Información del chofer */}
                <div className={`
                  p-4 rounded-lg border
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-5 h-5 mr-2" />
                    Chofer
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nombre completo</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.chofer}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.telefono}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Empresa</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.empresa}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Información del destino */}
                <div className={`
                  p-4 rounded-lg border
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <MapPin className="w-5 h-5 mr-2" />
                    Destino y Tiempo
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Depósito destino</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.deposito}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hora de salida</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {transitoDetalleRapido.salida}
                      </p>
                    </div>
                    {transitoDetalleRapido.tiempoRestante && (
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tiempo restante</p>
                        <p className={`font-semibold ${
                          transitoDetalleRapido.tiempoRestante < 30 ? 'text-red-500' : 
                          transitoDetalleRapido.tiempoRestante < 60 ? 'text-yellow-500' : 
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {transitoDetalleRapido.tiempoRestante} minutos
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Documentación */}
                <div className={`
                  p-4 rounded-lg border
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <FileCheck className="w-5 h-5 mr-2" />
                    Documentación
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>DUA</span>
                      <span className="text-sm text-green-500 font-medium">Completo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Manifiesto</span>
                      <span className="text-sm text-green-500 font-medium">Completo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Factura</span>
                      <span className="text-sm text-green-500 font-medium">Completo</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Observaciones */}
              {transitoDetalleRapido.observaciones && transitoDetalleRapido.observaciones.length > 0 && (
                <div className={`
                  p-4 rounded-lg border
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                `}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Observaciones ({transitoDetalleRapido.observaciones.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {transitoDetalleRapido.observaciones.map((obs, index) => (
                      <div key={obs.id || index} className={`
                        p-3 rounded-lg
                        ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                      `}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {obs.texto}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {obs.usuario} - {new Date(obs.fecha).toLocaleString('es-UY', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Acciones rápidas */}
              <div className="flex flex-col space-y-3 pt-4">
                <TabletButton
                  onClick={() => {
                    setShowDetalleRapido(false);
                    handleAccionRapida(transitoDetalleRapido.id, 'observacion');
                  }}
                  variant="primary"
                  size="large"
                  fullWidth
                  darkMode={darkMode}
                  icon={<MessageSquare className="w-5 h-5" />}
                >
                  Agregar Observación
                </TabletButton>
                
                {transitoDetalleRapido.estado === 'listo' && (
                  <TabletButton
                    onClick={() => {
                      setShowDetalleRapido(false);
                      handleAccionRapida(transitoDetalleRapido.id, 'precintar');
                    }}
                    variant="success"
                    size="large"
                    fullWidth
                    darkMode={darkMode}
                    icon={<CheckCircle className="w-5 h-5" />}
                  >
                    Iniciar Precintado
                  </TabletButton>
                )}
              </div>
            </div>
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

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText={confirmAction?.confirmText || 'Confirmar'}
        type={confirmAction?.confirmType || 'warning'}
        darkMode={darkMode}
        loading={processingAction}
      />

      {/* Animación de éxito */}
      <SuccessAnimation
        show={showSuccessAnimation}
        message={successMessage}
        onComplete={() => setShowSuccessAnimation(false)}
        darkMode={darkMode}
      />
    </TabletModal>
  );
};

export default TransitosPendientesTablet;