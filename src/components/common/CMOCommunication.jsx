import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Check, CheckCheck, AlertCircle,
  Clock, User, Truck, Package, RefreshCw, Bell,
  ChevronDown, ChevronUp, X, Filter, Search,
  AlertTriangle, Info, ChevronRight, History
} from 'lucide-react';
import { useRealtimeUpdates, useNotification } from '../../hooks';
import wsService from '../../services/websocket.service';
import apiService from '../../services/api.service';

/**
 * Módulo de comunicación directa con el Centro de Monitoreo (CMO)
 * Centraliza todas las comunicaciones operativas en un solo lugar
 */
const CMOCommunication = ({ darkMode = false, position = 'bottom-right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, transit, priority
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { showNotification } = useNotification();
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Tipos de mensajes del CMO
  const messageTypes = {
    instruction: {
      icon: AlertCircle,
      color: 'blue',
      label: 'Instrucción',
      priority: 'normal'
    },
    alert: {
      icon: AlertTriangle,
      color: 'red',
      label: 'Alerta',
      priority: 'high'
    },
    update: {
      icon: Info,
      color: 'green',
      label: 'Actualización',
      priority: 'low'
    },
    correction: {
      icon: RefreshCw,
      color: 'orange',
      label: 'Corrección',
      priority: 'high'
    }
  };

  // Respuestas rápidas predefinidas
  const quickResponses = [
    { id: 'received', text: 'Recibido', icon: Check },
    { id: 'inProgress', text: 'En proceso', icon: Clock },
    { id: 'completed', text: 'Completado', icon: CheckCheck },
    { id: 'needInfo', text: 'Necesito más información', icon: AlertCircle }
  ];

  // Cargar mensajes históricos al montar
  useEffect(() => {
    loadMessages();
    
    // Suscribirse a mensajes en tiempo real
    const unsubscribe = wsService.subscribe('cmo_message', handleNewMessage);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Cargar mensajes históricos
  const loadMessages = async () => {
    try {
      const response = await apiService.getCMOMessages();
      setMessages(response.data || []);
      updateUnreadCount(response.data || []);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  // Manejar nuevo mensaje del CMO
  const handleNewMessage = (message) => {
    const newMessage = {
      ...message,
      id: message.id || `msg_${Date.now()}`,
      timestamp: message.timestamp || Date.now(),
      read: false,
      responses: []
    };

    setMessages(prev => [...prev, newMessage]);
    
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
      // Reproducir sonido de notificación
      playNotificationSound();
      
      // Mostrar notificación del navegador
      showBrowserNotification(newMessage);
      
      // Notificación en la UI
      showNotification(`Nuevo mensaje del CMO: ${message.title || message.content}`, 'info');
    }
  };

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.src = '/sounds/notification.mp3';
      audioRef.current.play().catch(err => console.error('Error reproduciendo sonido:', err));
    }
  };

  // Mostrar notificación del navegador
  const showBrowserNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Mensaje del CMO', {
        body: message.content,
        icon: '/favicon.ico',
        tag: 'cmo-message',
        requireInteraction: message.priority === 'high'
      });
    }
  };

  // Marcar mensaje como leído
  const markAsRead = async (messageId) => {
    try {
      await apiService.markCMOMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      updateUnreadCount();
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
    }
  };

  // Actualizar contador de no leídos
  const updateUnreadCount = (messageList = messages) => {
    const unread = messageList.filter(msg => !msg.read).length;
    setUnreadCount(unread);
  };

  // Enviar respuesta
  const sendResponse = async (messageId, responseText, responseType = 'custom') => {
    try {
      const response = {
        messageId,
        text: responseText,
        type: responseType,
        timestamp: Date.now(),
        user: 'Usuario Actual' // TODO: Obtener del contexto
      };

      await apiService.sendCMOResponse(response);
      
      // Actualizar mensaje localmente
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                responses: [...(msg.responses || []), response],
                status: responseType === 'completed' ? 'resolved' : 'responded'
              }
            : msg
        )
      );

      // Limpiar campo de respuesta
      setReplyText('');
      setSelectedMessage(null);
      
      showNotification('Respuesta enviada', 'success');
    } catch (error) {
      showNotification('Error al enviar respuesta', 'error');
    }
  };

  // Filtrar mensajes
  const filteredMessages = messages.filter(msg => {
    // Filtro por tipo
    if (activeFilter === 'unread' && msg.read) return false;
    if (activeFilter === 'transit' && !msg.transitId) return false;
    if (activeFilter === 'priority' && msg.priority !== 'high') return false;
    
    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        msg.content.toLowerCase().includes(search) ||
        msg.title?.toLowerCase().includes(search) ||
        msg.transitId?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  // Componente de mensaje individual
  const MessageItem = ({ message }) => {
    const type = messageTypes[message.type] || messageTypes.instruction;
    const Icon = type.icon;
    const isExpanded = selectedMessage?.id === message.id;
    
    return (
      <div 
        className={`
          border rounded-lg p-4 mb-3 cursor-pointer
          transition-all duration-200
          ${!message.read ? 'border-l-4' : ''}
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          ${!message.read ? `border-l-${type.color}-500` : ''}
          ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}
        `}
        onClick={() => {
          setSelectedMessage(isExpanded ? null : message);
          if (!message.read) markAsRead(message.id);
        }}
      >
        {/* Header del mensaje */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
              <Icon className={`w-5 h-5 text-${type.color}-500`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {message.title || type.label}
                </h4>
                {!message.read && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                    Nuevo
                  </span>
                )}
                {message.priority === 'high' && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    Urgente
                  </span>
                )}
              </div>
              
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {message.content}
              </p>
              
              {/* Información adicional */}
              <div className="flex items-center space-x-4 mt-2">
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(message.timestamp).toLocaleString('es-UY', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </span>
                
                {message.sender && (
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-3 h-3 inline mr-1" />
                    {message.sender}
                  </span>
                )}
                
                {message.transitId && (
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Truck className="w-3 h-3 inline mr-1" />
                    {message.transitId}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Contenido expandido */}
        {isExpanded && (
          <div className={`
            mt-4 pt-4 border-t
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {/* Respuestas anteriores */}
            {message.responses && message.responses.length > 0 && (
              <div className="mb-4">
                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Respuestas:
                </h5>
                <div className="space-y-2">
                  {message.responses.map((response, idx) => (
                    <div 
                      key={idx}
                      className={`
                        p-2 rounded-lg text-sm
                        ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                      `}
                    >
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {response.text}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {response.user} - {new Date(response.timestamp).toLocaleTimeString('es-UY')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Acciones de respuesta */}
            <div className="space-y-3">
              {/* Respuestas rápidas */}
              <div className="flex flex-wrap gap-2">
                {quickResponses.map(qr => (
                  <button
                    key={qr.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendResponse(message.id, qr.text, qr.id);
                    }}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium
                      flex items-center space-x-2
                      transition-all duration-200
                      ${darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }
                    `}
                  >
                    <qr.icon className="w-4 h-4" />
                    <span>{qr.text}</span>
                  </button>
                ))}
              </div>
              
              {/* Campo de respuesta personalizada */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      sendResponse(message.id, replyText);
                    }
                  }}
                  placeholder="Escribir respuesta..."
                  className={`
                    flex-1 px-3 py-2 rounded-lg border
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (replyText.trim()) {
                      sendResponse(message.id, replyText);
                    }
                  }}
                  disabled={!replyText.trim()}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${replyText.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Posiciones del panel
  const positions = {
    'bottom-right': 'bottom-6 right-24', // Ajustado para no solaparse con alertas
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6'
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed ${positions[position]} z-40
          p-4 rounded-full shadow-lg
          ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
          ${unreadCount > 0 ? 'animate-pulse' : ''}
          transition-all duration-200 hover:scale-110
        `}
      >
        <MessageSquare className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-2 py-1 text-xs rounded-full bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de comunicación */}
      {isOpen && (
        <div className={`
          fixed ${position.includes('bottom') ? 'bottom-20' : 'top-28'} ${position === 'bottom-right' ? 'right-24' : position.includes('right') ? 'right-6' : 'left-6'} z-40
          w-96 h-[600px] rounded-xl shadow-2xl
          ${darkMode ? 'bg-gray-900' : 'bg-white'}
          flex flex-col
          animate-in slide-in-from-bottom-4 fade-in duration-200
        `}>
          {/* Header */}
          <div className={`
            p-4 border-b flex items-center justify-between
            ${darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'}
          `}>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Comunicación CMO
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Centro de Monitoreo Operativo
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadMessages()}
                className={`
                  p-2 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}
                title="Actualizar mensajes"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className={`
            p-3 border-b space-y-3
            ${darkMode ? 'border-gray-800' : 'border-gray-200'}
          `}>
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar mensajes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg border text-sm
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              />
            </div>
            
            {/* Filtros rápidos */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${activeFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${activeFilter === 'unread'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                No leídos ({unreadCount})
              </button>
              <button
                onClick={() => setActiveFilter('priority')}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${activeFilter === 'priority'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                Urgentes
              </button>
            </div>
          </div>

          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredMessages.length === 0 ? (
              <div className={`
                text-center py-8
                ${darkMode ? 'text-gray-400' : 'text-gray-500'}
              `}>
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay mensajes</p>
                <p className="text-sm mt-1">
                  Los mensajes del CMO aparecerán aquí
                </p>
              </div>
            ) : (
              <div>
                {filteredMessages.map(message => (
                  <MessageItem key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer con estadísticas */}
          <div className={`
            p-3 border-t text-center text-sm
            ${darkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}
          `}>
            {messages.length} mensajes • {unreadCount} sin leer
          </div>
        </div>
      )}

      {/* Elemento de audio para notificaciones */}
      <audio ref={audioRef} />
    </>
  );
};

export default CMOCommunication;