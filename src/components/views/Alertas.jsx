import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, Check, X, Clock, Info, Filter, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Truck, Package, Layers, Users, MessageCircle, Send, User } from 'lucide-react';

// Simulación de datos de alertas con campos adicionales incluyendo comentarios
const mockAlertas = [
  // Alertas de tránsito - Camión AB123CD
  { 
    id: 1, 
    tipo: 'Camión sin chófer', 
    mensaje: 'Camión AB123CD sin chófer asignado', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 30 * 60 * 1000), 
    transitoId: 'AB123CD', 
    deposito: null, 
    resuelto: false, 
    detalles: 'El camión está en la puerta principal esperando asignación. Tiempo estimado de espera: 45 minutos.', 
    accionRequerida: 'Asignar chófer disponible urgentemente',
    comentarios: [
      {
        id: 1,
        autor: 'María García',
        texto: 'Contactando con chóferes disponibles',
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        id: 2,
        autor: 'Carlos Rodríguez',
        texto: 'Pedro López confirmó disponibilidad, llegará en 15 minutos',
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
      }
    ]
  },
  { 
    id: 2, 
    tipo: 'Camión sin documentación', 
    mensaje: 'Camión AB123CD falta documentación', 
    prioridad: 'media', 
    timestamp: new Date(Date.now() - 45 * 60 * 1000), 
    transitoId: 'AB123CD', 
    deposito: null, 
    resuelto: false, 
    detalles: 'Faltan: Remito, Carta de porte', 
    accionRequerida: 'Solicitar documentación al transportista',
    comentarios: []
  },
  { 
    id: 3, 
    tipo: 'Camión demorado', 
    mensaje: 'Camión AB123CD con demora de 2 horas', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 60 * 60 * 1000), 
    transitoId: 'AB123CD', 
    deposito: null, 
    resuelto: false, 
    detalles: 'Demora causada por congestión en acceso principal',
    comentarios: [
      {
        id: 1,
        autor: 'Juan Pérez',
        texto: 'Redirigiendo a puerta secundaria',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      }
    ]
  },
  
  // Alertas de depósito - Depósito Norte
  { 
    id: 4, 
    tipo: 'Capacidad máxima', 
    mensaje: 'Depósito Norte al 95% de capacidad', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 20 * 60 * 1000), 
    transitoId: null, 
    deposito: 'Depósito Norte', 
    resuelto: false, 
    detalles: 'Espacios disponibles: 5 de 100', 
    accionRequerida: 'Coordinar con operaciones para liberar espacio',
    comentarios: []
  },
  { 
    id: 5, 
    tipo: 'Falta de personal', 
    mensaje: 'Depósito Norte - 3 operarios faltantes', 
    prioridad: 'media', 
    timestamp: new Date(Date.now() - 15 * 60 * 1000), 
    transitoId: null, 
    deposito: 'Depósito Norte', 
    resuelto: false, 
    detalles: 'Turnos afectados: 14:00 - 22:00',
    comentarios: []
  },
  { 
    id: 6, 
    tipo: 'Equipamiento dañado', 
    mensaje: 'Depósito Norte - Montacargas #3 fuera de servicio', 
    prioridad: 'media', 
    timestamp: new Date(Date.now() - 25 * 60 * 1000), 
    transitoId: null, 
    deposito: 'Depósito Norte', 
    resuelto: false,
    comentarios: []
  },
  
  // Más alertas de tránsito - Camión XY789ZW
  { 
    id: 7, 
    tipo: 'Camión sin chófer', 
    mensaje: 'Camión XY789ZW sin chófer asignado', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 10 * 60 * 1000), 
    transitoId: 'XY789ZW', 
    deposito: null, 
    resuelto: false,
    comentarios: []
  },
  { 
    id: 8, 
    tipo: 'Camión demorado', 
    mensaje: 'Camión XY789ZW con demora de 1 hora', 
    prioridad: 'media', 
    timestamp: new Date(Date.now() - 5 * 60 * 1000), 
    transitoId: 'XY789ZW', 
    deposito: null, 
    resuelto: false,
    comentarios: []
  },
  { 
    id: 9, 
    tipo: 'Carga incompleta', 
    mensaje: 'Camión XY789ZW - Faltan 2 pallets', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 8 * 60 * 1000), 
    transitoId: 'XY789ZW', 
    deposito: null, 
    resuelto: false,
    comentarios: []
  },
  
  // Alertas de Depósito Sur
  { 
    id: 10, 
    tipo: 'Capacidad máxima', 
    mensaje: 'Depósito Sur al 85% de capacidad', 
    prioridad: 'media', 
    timestamp: new Date(Date.now() - 40 * 60 * 1000), 
    transitoId: null, 
    deposito: 'Depósito Sur', 
    resuelto: false,
    comentarios: []
  },
  { 
    id: 11, 
    tipo: 'Control de temperatura', 
    mensaje: 'Depósito Sur - Sector frío con temperatura elevada', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 15 * 60 * 1000), 
    transitoId: null, 
    deposito: 'Depósito Sur', 
    resuelto: false, 
    detalles: 'Temperatura actual: 8°C (debe ser < 5°C)', 
    accionRequerida: 'Verificar sistema de refrigeración inmediatamente',
    comentarios: [
      {
        id: 1,
        autor: 'Ana Martínez',
        texto: 'Técnico en camino, llegada estimada en 20 minutos',
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
      }
    ]
  },
  
  // Alertas resueltas
  { 
    id: 12, 
    tipo: 'Capacidad máxima', 
    mensaje: 'Depósito Este al 90% de capacidad', 
    prioridad: 'media', 
    timestamp: new Date(Date.now() - 120 * 60 * 1000), 
    transitoId: null, 
    deposito: 'Depósito Este', 
    resuelto: true, 
    resueltoBy: 'María García',
    comentarios: [
      {
        id: 1,
        autor: 'María García',
        texto: 'Se liberaron 15 espacios tras despacho programado',
        timestamp: new Date(Date.now() - 110 * 60 * 1000)
      }
    ]
  },
  { 
    id: 13, 
    tipo: 'Camión sin chófer', 
    mensaje: 'Camión CD456EF sin chófer asignado', 
    prioridad: 'alta', 
    timestamp: new Date(Date.now() - 180 * 60 * 1000), 
    transitoId: 'CD456EF', 
    deposito: null, 
    resuelto: true, 
    resueltoBy: 'Carlos Rodríguez',
    comentarios: []
  },
];

// Constantes
const PRIORIDAD_ALERTA = {
  alta: {
    label: 'Alta',
    color: 'bg-red-500',
    bgLight: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-500'
  },
  media: {
    label: 'Media',
    color: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500'
  },
  baja: {
    label: 'Baja',
    color: 'bg-yellow-500',
    bgLight: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-500'
  }
};

const TIPO_ALERTA = {
  CAMION_SIN_CHOFER: 'Camión sin chófer',
  CAMION_SIN_DOC: 'Camión sin documentación',
  CAMION_DEMORADO: 'Camión demorado',
  CAPACIDAD_MAXIMA: 'Capacidad máxima',
  FALTA_PERSONAL: 'Falta de personal',
  EQUIPAMIENTO_DANADO: 'Equipamiento dañado',
  CARGA_INCOMPLETA: 'Carga incompleta',
  CONTROL_TEMPERATURA: 'Control de temperatura'
};

// Hook para detectar gestos de swipe
const useSwipeGesture = (onSwipeLeft, onSwipeRight, enabled = true) => {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const elementRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    if (!enabled) return;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!enabled || !isSwiping) return;
    touchEndX.current = e.targetTouches[0].clientX;
    const offset = touchEndX.current - touchStartX.current;
    
    const limitedOffset = Math.max(-150, Math.min(150, offset));
    setSwipeOffset(limitedOffset);
  };

  const handleTouchEnd = () => {
    if (!enabled || !isSwiping) return;
    
    const swipeThreshold = 75;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }
    
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return {
    elementRef,
    swipeOffset,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd
    }
  };
};

// Componentes auxiliares
const Modal = ({ isOpen, onClose, title, size = 'medium', children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-gray-800 rounded-lg shadow-xl ${size === 'large' ? 'max-w-6xl' : 'max-w-2xl'} w-full max-h-[90vh] overflow-hidden`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, onFilterChange, darkMode, onReset }) => {
  return (
    <div className="p-4 rounded-lg bg-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filters.map(filter => (
          <div key={filter.name}>
            <label className="block text-sm font-medium mb-1 text-gray-300">{filter.label}</label>
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button
        onClick={onReset}
        className="mt-4 text-sm text-blue-400 hover:text-blue-300"
      >
        Limpiar filtros
      </button>
    </div>
  );
};

const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap shadow-lg">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para tiempo relativo
const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
};

// Componente de Comentarios
const ComentariosSection = ({ comentarios, onAddComment, alertaId }) => {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [mostrandoComentarios, setMostrandoComentarios] = useState(false);
  
  const handleSubmit = () => {
    if (nuevoComentario.trim()) {
      onAddComment(alertaId, nuevoComentario.trim());
      setNuevoComentario('');
    }
  };
  
  return (
    <div className="mt-4 border-t border-gray-600 pt-4">
      <button
        onClick={() => setMostrandoComentarios(!mostrandoComentarios)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Comentarios ({comentarios.length})</span>
        {mostrandoComentarios ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {mostrandoComentarios && (
        <div className="mt-3 space-y-3">
          {/* Lista de comentarios */}
          {comentarios.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comentarios.map(comentario => (
                <div key={comentario.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-blue-400">{comentario.autor}</span>
                        <span className="text-gray-500">{getRelativeTime(comentario.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{comentario.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No hay comentarios aún</p>
          )}
          
          {/* Formulario para nuevo comentario */}
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              placeholder="Agregar un comentario..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
            <button
              onClick={handleSubmit}
              disabled={!nuevoComentario.trim()}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal
const AlertasModal = ({ isOpen = true, onClose = () => {}, darkMode = true }) => {
  const [userName] = useState('Juan Pérez');
  const [showFilters, setShowFilters] = useState(false);
  const [showResueltas, setShowResueltas] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState({});
  const [quickResolveMode, setQuickResolveMode] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [groupBy, setGroupBy] = useState('smart'); // 'smart', 'transito', 'deposito', 'tipo', 'none'
  const [filters, setFilters] = useState({
    tipo: '',
    prioridad: '',
    tiempo: ''
  });
  
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Simulación de datos
  const [alertas, setAlertas] = useState(mockAlertas);

  const handleResolverAlerta = async (alertaId, isQuickResolve = false) => {
    setResolvingAlert(alertaId);
    
    if (navigator.vibrate && isQuickResolve) {
      navigator.vibrate([50, 30, 50]);
    }
    
    setTimeout(() => {
      setAlertas(prev => prev.map(a => 
        a.id === alertaId ? { ...a, resuelto: true, resueltoBy: userName } : a
      ));
      setResolvingAlert(null);
    }, 500);
  };

  const handleResolverGrupo = async (alertIds) => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    
    setAlertas(prev => prev.map(a => 
      alertIds.includes(a.id) ? { ...a, resuelto: true, resueltoBy: userName } : a
    ));
  };

  const handleIgnorarAlerta = async (alertaId) => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    console.log('Alerta ignorada:', alertaId);
  };

  const handleAddComment = (alertaId, texto) => {
    const nuevoComentario = {
      id: Date.now(),
      autor: userName,
      texto: texto,
      timestamp: new Date()
    };
    
    setAlertas(prev => prev.map(a => 
      a.id === alertaId 
        ? { ...a, comentarios: [...(a.comentarios || []), nuevoComentario] }
        : a
    ));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Separar alertas activas y resueltas
  const { alertasActivas, alertasResueltas } = useMemo(() => {
    const activas = [];
    const resueltas = [];
    
    alertas.forEach(alerta => {
      // Agregar tiempo relativo
      alerta.tiempo = getRelativeTime(new Date(alerta.timestamp));
      
      if (alerta.resuelto) {
        resueltas.push(alerta);
      } else {
        activas.push(alerta);
      }
    });
    
    return { alertasActivas: activas, alertasResueltas: resueltas };
  }, [alertas]);

  // Filtrar alertas activas
  const alertasFiltradas = useMemo(() => {
    return alertasActivas.filter(alerta => {
      if (filters.tipo && alerta.tipo !== filters.tipo) return false;
      if (filters.prioridad && alerta.prioridad !== filters.prioridad) return false;
      
      if (filters.tiempo) {
        const horasAtras = parseInt(filters.tiempo);
        const tiempoAlerta = new Date(alerta.timestamp);
        const ahora = new Date();
        const diferencia = (ahora - tiempoAlerta) / (1000 * 60 * 60);
        if (diferencia > horasAtras) return false;
      }
      
      return true;
    });
  }, [alertasActivas, filters]);

  // Agrupar alertas
  const alertasAgrupadas = useMemo(() => {
    if (groupBy === 'none') {
      return null;
    }

    const grupos = {};
    
    alertasFiltradas.forEach(alerta => {
      let key = null;
      let tipo = null;
      
      if (groupBy === 'smart') {
        // Agrupamiento inteligente: prioriza tránsito, luego depósito, luego tipo
        if (alerta.transitoId) {
          key = `transito-${alerta.transitoId}`;
          tipo = 'transito';
        } else if (alerta.deposito) {
          key = `deposito-${alerta.deposito}`;
          tipo = 'deposito';
        } else {
          key = `tipo-${alerta.tipo}`;
          tipo = 'tipo';
        }
      } else if (groupBy === 'transito' && alerta.transitoId) {
        key = alerta.transitoId;
        tipo = 'transito';
      } else if (groupBy === 'deposito' && alerta.deposito) {
        key = alerta.deposito;
        tipo = 'deposito';
      } else if (groupBy === 'tipo') {
        key = alerta.tipo;
        tipo = 'tipo';
      }
      
      if (key) {
        if (!grupos[key]) {
          grupos[key] = {
            id: key,
            tipo: tipo,
            nombre: key.replace('transito-', '').replace('deposito-', '').replace('tipo-', ''),
            alertas: [],
            prioridadMaxima: 'baja'
          };
        }
        
        grupos[key].alertas.push(alerta);
        
        // Actualizar prioridad máxima del grupo
        if (alerta.prioridad === 'alta' || grupos[key].prioridadMaxima !== 'alta') {
          if (alerta.prioridad === 'alta') {
            grupos[key].prioridadMaxima = 'alta';
          } else if (alerta.prioridad === 'media' && grupos[key].prioridadMaxima === 'baja') {
            grupos[key].prioridadMaxima = 'media';
          }
        }
      }
    });
    
    // Convertir a array y ordenar por prioridad y cantidad de alertas
    return Object.values(grupos).sort((a, b) => {
      const prioridadOrden = { alta: 0, media: 1, baja: 2 };
      if (a.prioridadMaxima !== b.prioridadMaxima) {
        return prioridadOrden[a.prioridadMaxima] - prioridadOrden[b.prioridadMaxima];
      }
      return b.alertas.length - a.alertas.length;
    });
  }, [alertasFiltradas, groupBy]);

  const filterConfig = [
    {
      name: 'tipo',
      label: 'Tipo de Alerta',
      type: 'select',
      value: filters.tipo,
      options: Object.values(TIPO_ALERTA).map(tipo => ({
        value: tipo,
        label: tipo
      }))
    },
    {
      name: 'prioridad',
      label: 'Prioridad',
      type: 'select',
      value: filters.prioridad,
      options: Object.keys(PRIORIDAD_ALERTA).map(key => ({
        value: key,
        label: PRIORIDAD_ALERTA[key].label
      }))
    },
    {
      name: 'tiempo',
      label: 'Tiempo',
      type: 'select',
      value: filters.tiempo,
      options: [
        { value: '1', label: 'Última hora' },
        { value: '6', label: 'Últimas 6 horas' },
        { value: '24', label: 'Último día' },
        { value: '168', label: 'Última semana' }
      ]
    }
  ];

  const AlertaCard = ({ alerta, resuelto = false, isInGroup = false }) => {
    const isExpanded = expandedAlert === alerta.id;
    const prioridad = PRIORIDAD_ALERTA[alerta.prioridad];
    const isResolving = resolvingAlert === alerta.id;
    
    const { elementRef, swipeOffset, isSwiping, handlers } = useSwipeGesture(
      null,
      () => handleResolverAlerta(alerta.id, true),
      !resuelto && isTouchDevice && quickResolveMode && !isInGroup
    );
    
    return (
      <div 
        ref={elementRef}
        className={`
          relative overflow-hidden
          ${isSwiping ? '' : 'transition-all duration-300'}
          ${isResolving ? 'scale-95 opacity-50' : ''}
          ${isInGroup ? 'ml-4' : ''}
        `}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        {...(quickResolveMode && !resuelto && !isInGroup ? handlers : {})}
      >
        {swipeOffset > 0 && !resuelto && (
          <div className={`
            absolute inset-y-0 left-0 flex items-center justify-center
            bg-green-500 text-white px-4
            transition-all duration-300
          `}
          style={{ 
            width: Math.min(swipeOffset, 150) + 'px',
            opacity: Math.min(swipeOffset / 75, 1)
          }}>
            <Check className="w-6 h-6" />
            {swipeOffset > 75 && <span className="ml-2">Resolver</span>}
          </div>
        )}
        
        <div className={`
          relative p-6 rounded-xl shadow-lg
          bg-gray-700
          ${!resuelto ? 'hover:shadow-xl transform hover:-translate-y-1' : 'opacity-75'}
          ${!resuelto ? `border-l-4 ${prioridad.borderColor}` : ''}
          ${isResolving ? 'bg-green-900' : ''}
        `}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {!resuelto && (
                  <div className={`p-2 rounded-lg ${prioridad.bgLight} bg-opacity-20`}>
                    <AlertTriangle className={`w-5 h-5 text-white`} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${resuelto 
                        ? 'bg-gray-600 text-gray-300' 
                        : `${prioridad.color} text-white`
                      }
                    `}>
                      {alerta.tipo}
                    </span>
                    {!resuelto && (
                      <span className={`text-xs font-medium ${prioridad.textColor}`}>
                        Prioridad {prioridad.label}
                      </span>
                    )}
                    {alerta.comentarios && alerta.comentarios.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <MessageCircle className="w-3 h-3" />
                        {alerta.comentarios.length}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-lg text-white">
                    {alerta.mensaje}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {alerta.tiempo}
                    </span>
                    {resuelto && alerta.resueltoBy && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Check className="w-4 h-4 text-green-500" />
                        Resuelto por {alerta.resueltoBy}
                      </span>
                    )}
                  </div>
                  
                  {/* Ver más detalles */}
                  {(alerta.detalles || alerta.accionRequerida) && (
                    <button
                      onClick={() => setExpandedAlert(isExpanded ? null : alerta.id)}
                      className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Ver {isExpanded ? 'menos' : 'más'} detalles
                    </button>
                  )}
                  
                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 text-sm">
                      {alerta.detalles && (
                        <div className="p-3 bg-gray-600 rounded-lg">
                          <p className="text-gray-300">{alerta.detalles}</p>
                        </div>
                      )}
                      {alerta.accionRequerida && (
                        <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                          <p className="text-blue-300">
                            <strong>Acción requerida:</strong> {alerta.accionRequerida}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {!resuelto && !isInGroup && (
              <div className="flex gap-2">
                {isTouchDevice && !quickResolveMode && (
                  <button 
                    onClick={() => handleResolverAlerta(alerta.id, true)}
                    className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:shadow-lg flex items-center justify-center transform hover:scale-110"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                )}
                
                <div className={`flex gap-2 ${isTouchDevice && quickResolveMode ? 'opacity-50' : ''}`}>
                  <Tooltip text="Marcar como resuelta">
                    <button 
                      onClick={() => handleResolverAlerta(alerta.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Resolver</span>
                    </button>
                  </Tooltip>
                  
                  <Tooltip text="Ignorar temporalmente">
                    <button 
                      onClick={() => handleIgnorarAlerta(alerta.id)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Ignorar</span>
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
          
          {/* Sección de comentarios */}
          <ComentariosSection 
            comentarios={alerta.comentarios || []}
            onAddComment={handleAddComment}
            alertaId={alerta.id}
          />
          
          {isResolving && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const GrupoAlertasCard = ({ grupo }) => {
    const isExpanded = expandedGroup[grupo.id];
    const prioridad = PRIORIDAD_ALERTA[grupo.prioridadMaxima];
    
    // Contar alertas por prioridad dentro del grupo
    const contadorPrioridades = {
      alta: grupo.alertas.filter(a => a.prioridad === 'alta').length,
      media: grupo.alertas.filter(a => a.prioridad === 'media').length,
      baja: grupo.alertas.filter(a => a.prioridad === 'baja').length
    };
    
    // Contar total de comentarios en el grupo
    const totalComentarios = grupo.alertas.reduce((sum, alerta) => 
      sum + (alerta.comentarios ? alerta.comentarios.length : 0), 0
    );
    
    const getIcon = () => {
      const iconClass = "w-5 h-5 text-white";
      switch (grupo.tipo) {
        case 'transito':
          return <Truck className={iconClass} />;
        case 'deposito':
          return <Package className={iconClass} />;
        case 'tipo':
          return <Layers className={iconClass} />;
        default:
          return <AlertTriangle className={iconClass} />;
      }
    };
    
    const getLabel = () => {
      switch (grupo.tipo) {
        case 'transito':
          return `🚛 Camión ${grupo.nombre}`;
        case 'deposito':
          return `📦 ${grupo.nombre}`;
        case 'tipo':
          return `⚠️ ${grupo.nombre}`;
        default:
          return grupo.nombre;
      }
    };
    
    return (
      <div className={`
        p-6 rounded-xl shadow-lg
        bg-gray-700
        hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300
        border-l-4 ${prioridad.borderColor}
      `}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${prioridad.bgLight} bg-opacity-20`}>
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {getLabel()}
                </h3>
                <p className="text-sm text-gray-400">
                  {grupo.alertas.length} alerta{grupo.alertas.length > 1 ? 's' : ''} pendiente{grupo.alertas.length > 1 ? 's' : ''}
                  {totalComentarios > 0 && (
                    <span className="ml-2">
                      • {totalComentarios} comentario{totalComentarios > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                {/* Indicadores de prioridad */}
                <div className="flex items-center gap-2 mt-1">
                  {contadorPrioridades.alta > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                      {contadorPrioridades.alta} alta{contadorPrioridades.alta > 1 ? 's' : ''}
                    </span>
                  )}
                  {contadorPrioridades.media > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                      {contadorPrioridades.media} media{contadorPrioridades.media > 1 ? 's' : ''}
                    </span>
                  )}
                  {contadorPrioridades.baja > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                      {contadorPrioridades.baja} baja{contadorPrioridades.baja > 1 ? 's' : ''}
                    </span>
                  )}
                  {totalComentarios > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {totalComentarios}
                    </span>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prioridad.color} text-white`}>
                Prioridad {prioridad.label}
              </span>
            </div>
            
            {/* Resumen de tipos de alertas */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[...new Set(grupo.alertas.map(a => a.tipo))].map(tipo => {
                const count = grupo.alertas.filter(a => a.tipo === tipo).length;
                return (
                  <span key={tipo} className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300">
                    {tipo} ({count})
                  </span>
                );
              })}
            </div>
            
            <button
              onClick={() => setExpandedGroup(prev => ({ ...prev, [grupo.id]: !prev[grupo.id] }))}
              className="text-sm flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'Ocultar' : 'Ver'} alertas individuales
            </button>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Tooltip text="Resolver todas las alertas del grupo">
              <button 
                onClick={() => handleResolverGrupo(grupo.alertas.map(a => a.id))}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Resolver todas</span>
              </button>
            </Tooltip>
          </div>
        </div>
        
        {/* Alertas expandidas */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {grupo.alertas.map(alerta => (
              <AlertaCard key={alerta.id} alerta={alerta} isInGroup={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Centro de Alertas Operativas"
      size="large"
    >
      <div className="text-white">
        {/* Header con estadísticas */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-700 text-center">
            <p className="text-3xl font-bold text-orange-500">{alertasActivas.length}</p>
            <p className="text-sm text-gray-300">Alertas Activas</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-700 text-center">
            <p className="text-3xl font-bold text-red-500">
              {alertasActivas.filter(a => a.prioridad === 'alta').length}
            </p>
            <p className="text-sm text-gray-300">Prioridad Alta</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-700 text-center">
            <p className="text-3xl font-bold text-green-500">{alertasResueltas.length}</p>
            <p className="text-sm text-gray-300">Resueltas Hoy</p>
          </div>
        </div>
        
        {/* Botones de control */}
        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
            
            {/* Selector de agrupamiento */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="smart">Agrupamiento inteligente</option>
              <option value="transito">Por tránsito</option>
              <option value="deposito">Por depósito</option>
              <option value="tipo">Por tipo</option>
              <option value="none">Sin agrupar</option>
            </select>
            
            {isTouchDevice && (
              <button
                onClick={() => setQuickResolveMode(!quickResolveMode)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${quickResolveMode 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }
                `}
              >
                <CheckCircle className="w-4 h-4" />
                Modo Swipe
              </button>
            )}
          </div>
          
          {alertasResueltas.length > 0 && (
            <button
              onClick={() => setShowResueltas(!showResueltas)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showResueltas ? 'Ocultar' : 'Mostrar'} resueltas ({alertasResueltas.length})
            </button>
          )}
        </div>
        
        {/* Instrucciones del modo swipe */}
        {isTouchDevice && quickResolveMode && groupBy === 'none' && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-blue-900/20 text-blue-300 border border-blue-800">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Desliza una alerta hacia la derecha para resolverla rápidamente ➡️
            </p>
          </div>
        )}
        
        {/* Panel de filtros */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel
              filters={filterConfig}
              onFilterChange={handleFilterChange}
              darkMode={darkMode}
              onReset={() => setFilters({ tipo: '', prioridad: '', tiempo: '' })}
            />
          </div>
        )}
        
        {/* Lista de alertas */}
        <div className="space-y-6">
          {/* Alertas Activas */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Alertas Activas
            </h2>
            
            {alertasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay alertas activas con los filtros aplicados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupBy !== 'none' && alertasAgrupadas ? (
                  // Vista agrupada
                  <>
                    {alertasAgrupadas.map(grupo => (
                      <GrupoAlertasCard key={grupo.id} grupo={grupo} />
                    ))}
                    
                    {/* Alertas sin agrupar (si las hay) */}
                    {alertasFiltradas.filter(alerta => {
                      if (groupBy === 'smart') return false; // El agrupamiento inteligente cubre todo
                      if (groupBy === 'transito') return !alerta.transitoId;
                      if (groupBy === 'deposito') return !alerta.deposito;
                      return false;
                    }).map(alerta => (
                      <AlertaCard key={alerta.id} alerta={alerta} />
                    ))}
                  </>
                ) : (
                  // Vista sin agrupar
                  alertasFiltradas.map(alerta => (
                    <AlertaCard key={alerta.id} alerta={alerta} />
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Alertas Resueltas */}
          {showResueltas && alertasResueltas.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Alertas Resueltas
              </h2>
              
              <div className="space-y-4">
                {alertasResueltas.map(alerta => (
                  <AlertaCard key={alerta.id} alerta={alerta} resuelto />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AlertasModal;