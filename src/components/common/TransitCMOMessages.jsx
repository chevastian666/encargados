import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, AlertCircle, CheckCircle, Clock,
  User, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import apiService from '../../services/api.service';

/**
 * Componente para mostrar mensajes del CMO asociados a un tránsito específico
 * Se puede integrar en las cards de tránsito o en el panel de detalles
 */
const TransitCMOMessages = ({ 
  transitId, 
  darkMode = false, 
  compact = false,
  showBadge = true 
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Cargar mensajes del tránsito
  useEffect(() => {
    if (transitId) {
      loadTransitMessages();
    }
  }, [transitId]);

  const loadTransitMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCMOMessages({ transitId });
      const transitMessages = response.data?.filter(msg => msg.transitId === transitId) || [];
      setMessages(transitMessages);
    } catch (error) {
      console.error('Error cargando mensajes del CMO:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enviar respuesta rápida
  const sendQuickReply = async (messageId, replyType) => {
    const quickReplies = {
      received: 'Recibido',
      inProgress: 'En proceso',
      completed: 'Completado'
    };

    try {
      await apiService.sendCMOResponse({
        messageId,
        text: quickReplies[replyType],
        type: replyType,
        timestamp: Date.now(),
        user: 'Usuario Actual'
      });
      
      // Actualizar mensaje localmente
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              responses: [...(msg.responses || []), {
                text: quickReplies[replyType],
                type: replyType,
                timestamp: Date.now(),
                user: 'Usuario Actual'
              }]
            }
          : msg
      ));
    } catch (error) {
      console.error('Error enviando respuesta:', error);
    }
  };

  // Contar mensajes no leídos
  const unreadCount = messages.filter(msg => !msg.read).length;
  const hasUrgent = messages.some(msg => msg.priority === 'high');

  if (loading) {
    return (
      <div className={`animate-pulse ${compact ? 'h-8' : 'h-20'}`}>
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded h-full`} />
      </div>
    );
  }

  if (messages.length === 0) {
    return null; // No mostrar nada si no hay mensajes
  }

  // Vista compacta (badge)
  if (compact && showBadge) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          inline-flex items-center space-x-2 px-3 py-1 rounded-full
          transition-all duration-200
          ${hasUrgent 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          }
          hover:shadow-md
        `}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium">
          {messages.length} CMO
        </span>
        {unreadCount > 0 && (
          <span className={`
            px-1.5 py-0.5 text-xs rounded-full
            ${hasUrgent 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
            }
          `}>
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Vista expandida
  return (
    <div className={`
      rounded-lg border
      ${darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
      ${compact ? 'p-3' : 'p-4'}
    `}>
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => compact && setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className={`w-5 h-5 ${hasUrgent ? 'text-red-500' : 'text-blue-500'}`} />
          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Mensajes CMO ({messages.length})
          </h4>
          {unreadCount > 0 && (
            <span className={`
              px-2 py-0.5 text-xs rounded-full
              ${hasUrgent 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }
            `}>
              {unreadCount} sin leer
            </span>
          )}
        </div>
        {compact && (
          <button className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Lista de mensajes */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`
                p-3 rounded-lg border
                ${!message.read ? 'border-l-4' : ''}
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
                }
                ${!message.read && message.priority === 'high'
                  ? 'border-l-red-500'
                  : !message.read 
                    ? 'border-l-blue-500'
                    : ''
                }
              `}
            >
              {/* Contenido del mensaje */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {message.title || 'Mensaje del CMO'}
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {message.content}
                    </p>
                  </div>
                  {message.priority === 'high' && (
                    <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                  )}
                </div>

                {/* Metadata */}
                <div className={`
                  flex items-center space-x-3 text-xs
                  ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(message.timestamp).toLocaleString('es-UY', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </span>
                  {message.sender && (
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{message.sender}</span>
                    </span>
                  )}
                </div>

                {/* Respuestas */}
                {message.responses && message.responses.length > 0 && (
                  <div className={`
                    mt-2 pt-2 border-t
                    ${darkMode ? 'border-gray-600' : 'border-gray-300'}
                  `}>
                    {message.responses.map((response, idx) => (
                      <div 
                        key={idx}
                        className={`
                          text-xs flex items-center space-x-2
                          ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                        `}
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{response.text}</span>
                        <span>• {response.user}</span>
                        <span>
                          {new Date(response.timestamp).toLocaleTimeString('es-UY', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Acciones rápidas */}
                {!message.responses?.length && (
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => sendQuickReply(message.id, 'received')}
                      className={`
                        px-2 py-1 rounded text-xs font-medium
                        transition-colors duration-200
                        ${darkMode 
                          ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }
                      `}
                    >
                      Recibido
                    </button>
                    {message.priority === 'high' && (
                      <>
                        <button
                          onClick={() => sendQuickReply(message.id, 'inProgress')}
                          className={`
                            px-2 py-1 rounded text-xs font-medium
                            transition-colors duration-200
                            ${darkMode 
                              ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }
                          `}
                        >
                          En proceso
                        </button>
                        <button
                          onClick={() => sendQuickReply(message.id, 'completed')}
                          className={`
                            px-2 py-1 rounded text-xs font-medium
                            transition-colors duration-200
                            ${darkMode 
                              ? 'bg-green-600 hover:bg-green-500 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                            }
                          `}
                        >
                          Completado
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransitCMOMessages;