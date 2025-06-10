import React, { useState, useEffect, useRef } from 'react';
import { Clock, Phone, Truck, Package, User, Building, FileText, AlertCircle, AlertTriangle, X, Camera, Image, Trash2, Maximize2, Upload, Calendar, CheckCircle } from 'lucide-react';
import { useConnection, useNotification } from '../hooks';
import { ESTADOS } from '../constants/constants';
import apiService from '../services/api.service';

// Problemas comunes predefinidos
const PROBLEMAS_COMUNES = [
  { id: 'demora', label: 'Demora', icon: Clock },
  { id: 'carga_incorrecta', label: 'Carga incorrecta', icon: Package },
  { id: 'documentacion', label: 'Documentación faltante', icon: FileText },
  { id: 'vehiculo_danado', label: 'Vehículo dañado', icon: Truck },
  { id: 'conductor_ausente', label: 'Conductor ausente', icon: User },
  { id: 'otro', label: 'Otro problema', icon: AlertCircle }
];

// Función helper para obtener el ícono del problema
const getProblemaIcon = (tipoProblema) => {
  const problema = PROBLEMAS_COMUNES.find(p => 
    tipoProblema.toLowerCase().includes(p.label.toLowerCase()) || 
    tipoProblema.toLowerCase().includes(p.id)
  );
  return problema ? problema.icon : AlertCircle;
};

// Función helper para formatear fecha
const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  const ahora = new Date();
  const diffTime = Math.abs(ahora - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Hoy a las ${date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Ayer a las ${date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {
    return date.toLocaleDateString('es-UY', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

/**
 * Función para comprimir imágenes
 * @param {File} file - Archivo de imagen a comprimir
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @param {number} quality - Calidad de compresión (0-1)
 * @returns {Promise<Blob>} Imagen comprimida
 */
const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo la proporción
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Componente TransitoDetails - Detalles de un tránsito
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.transito - Datos del tránsito
 * @param {boolean} props.darkMode - Si está en modo oscuro
 * @param {Function} props.onUpdate - Función callback al actualizar
 */
const TransitoDetails = ({ transito, darkMode = false, onUpdate }) => {
  const { addNotification } = useNotification();
  const { isOnline, addPendingOperation } = useConnection();
  const [updating, setUpdating] = useState(false);
  const [localTransito, setLocalTransito] = useState(transito);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemDetails, setProblemDetails] = useState('');
  const [isLate, setIsLate] = useState(false);
  const [problemImages, setProblemImages] = useState([]);
  const [uploadingProblem, setUploadingProblem] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [compressingImages, setCompressingImages] = useState(false);
  const [historialProblemas, setHistorialProblemas] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Cargar historial de problemas
  useEffect(() => {
    const cargarHistorialProblemas = async () => {
      setLoadingHistorial(true);
      try {
        // Simulando datos del historial - En producción vendría del API
        // await apiService.getHistorialProblemas(transito.id);
        const historialSimulado = [
          {
            id: 1,
            fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            tipo: 'Demora',
            descripcion: 'Retraso de 45 minutos por tráfico en acceso al puerto',
            reportadoPor: 'Juan Pérez',
            imagenes: []
          },
          {
            id: 2,
            fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            tipo: 'Documentación faltante',
            descripcion: 'Faltaba el remito de la carga',
            reportadoPor: 'María García',
            imagenes: ['https://via.placeholder.com/150']
          },
          {
            id: 3,
            fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            tipo: 'Carga incorrecta',
            descripcion: 'El contenedor no coincidía con el número de precinto indicado en la documentación',
            reportadoPor: 'Carlos López',
            imagenes: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150']
          }
        ];
        
        setHistorialProblemas(historialSimulado);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        // No mostrar error al usuario, simplemente no mostrar historial
      } finally {
        setLoadingHistorial(false);
      }
    };

    cargarHistorialProblemas();
  }, [transito.id]);

  // Verificar si el tránsito está retrasado
  useEffect(() => {
    const checkIfLate = () => {
      if (localTransito.salida) {
        const now = new Date();
        const [hours, minutes] = localTransito.salida.split(':').map(Number);
        const salidaTime = new Date();
        salidaTime.setHours(hours, minutes, 0, 0);
        
        setIsLate(now > salidaTime && localTransito.estado !== 'precintado');
      }
    };

    checkIfLate();
    const interval = setInterval(checkIfLate, 60000); // Verificar cada minuto
    
    return () => clearInterval(interval);
  }, [localTransito.salida, localTransito.estado]);

  const handleMarcarPrecintado = async () => {
    setUpdating(true);

    try {
      if (!isOnline) {
        // Guardar operación para sincronizar después
        addPendingOperation({
          type: 'UPDATE_TRANSITO_ESTADO',
          data: { transitoId: transito.id, estado: 'precintado' },
          execute: async () => {
            await apiService.updateTransitoEstado(transito.id, 'precintado');
          }
        });
        
        // Actualización optimista
        setLocalTransito(prev => ({ ...prev, estado: 'precintado' }));
        addNotification('warning', 'Cambio guardado localmente. Se sincronizará cuando vuelva la conexión.');
      } else {
        await apiService.updateTransitoEstado(transito.id, 'precintado');
        setLocalTransito(prev => ({ ...prev, estado: 'precintado' }));
        addNotification('success', `Tránsito ${transito.matricula} marcado como precintado`);
      }
      
      onUpdate?.();
    } catch (error) {
      addNotification('error', 'Error al actualizar el estado del tránsito');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const processImage = async (file) => {
    setCompressingImages(true);
    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        addNotification('error', `${file.name} no es una imagen válida`);
        return null;
      }

      let processedFile = file;
      let compressedBlob = file;

      // Comprimir si la imagen es mayor a 1MB
      if (file.size > 1024 * 1024) {
        try {
          compressedBlob = await compressImage(file);
          const compressedSize = compressedBlob.size;
          const originalSize = file.size;
          const reduction = Math.round((1 - compressedSize / originalSize) * 100);
          
          // Crear un nuevo archivo con el blob comprimido
          processedFile = new File([compressedBlob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });

          console.log(`Imagen comprimida: ${file.name} - Reducción: ${reduction}%`);
        } catch (error) {
          console.error('Error al comprimir imagen:', error);
          // Si falla la compresión, usar la imagen original
        }
      }

      // Validar tamaño final (máximo 5MB)
      if (processedFile.size > 5 * 1024 * 1024) {
        addNotification('error', `${file.name} es demasiado grande (máximo 5MB después de comprimir)`);
        return null;
      }

      // Crear preview URL
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            id: Date.now() + Math.random(),
            file: processedFile,
            originalFile: file,
            preview: e.target.result,
            name: file.name,
            compressed: file.size !== processedFile.size
          });
        };
        reader.readAsDataURL(processedFile);
      });
    } finally {
      setCompressingImages(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - problemImages.length;
    
    if (remainingSlots <= 0) {
      addNotification('warning', 'Ya has alcanzado el límite de 5 imágenes');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      addNotification('warning', `Solo se procesarán las primeras ${remainingSlots} imágenes`);
    }

    setCompressingImages(true);
    const processedImages = [];

    for (const file of filesToProcess) {
      const processedImage = await processImage(file);
      if (processedImage) {
        processedImages.push(processedImage);
      }
    }

    setProblemImages(prev => [...prev, ...processedImages]);
    setCompressingImages(false);

    // Limpiar el input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = (imageId) => {
    setProblemImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleNotificarProblema = async () => {
    if (!selectedProblem) {
      addNotification('error', 'Por favor selecciona un tipo de problema');
      return;
    }

    if (selectedProblem.id === 'otro' && !problemDetails.trim()) {
      addNotification('error', 'Por favor describe el problema');
      return;
    }

    setUploadingProblem(true);
    const problemText = selectedProblem.id === 'otro' 
      ? problemDetails 
      : `${selectedProblem.label}${problemDetails ? ': ' + problemDetails : ''}`;

    try {
      if (!isOnline) {
        // Para operaciones offline, convertir imágenes a base64
        const imagesData = await Promise.all(
          problemImages.map(async (img) => ({
            name: img.name,
            data: img.preview,
            compressed: img.compressed
          }))
        );

        addPendingOperation({
          type: 'NOTIFICAR_PROBLEMA',
          data: { 
            transitoId: transito.id, 
            problema: problemText,
            timestamp: new Date().toISOString(),
            images: imagesData
          },
          execute: async () => {
            // Intentar con el método que soporte imágenes si existe
            if (problemImages.length > 0 && apiService.notificarProblemaConImagenes) {
              const formData = new FormData();
              formData.append('transitoId', transito.id);
              formData.append('problema', problemText);
              formData.append('timestamp', new Date().toISOString());
              
              problemImages.forEach((image, index) => {
                formData.append(`imagen_${index}`, image.file);
              });
              
              await apiService.notificarProblemaConImagenes(formData);
            } else {
              // Fallback al método original sin imágenes
              await apiService.notificarProblema(transito.id, problemText);
            }
          }
        });
        
        // Agregar al historial local inmediatamente
        const nuevoProblema = {
          id: Date.now(),
          fecha: new Date().toISOString(),
          tipo: selectedProblem.label,
          descripcion: problemDetails || problemText,
          reportadoPor: 'Usuario actual',
          imagenes: problemImages.map(img => img.preview)
        };
        setHistorialProblemas(prev => [nuevoProblema, ...prev]);
        
        addNotification('warning', 'Problema registrado localmente. Se notificará cuando vuelva la conexión.');
      } else {
        // Si hay imágenes y el método existe, usar el nuevo método
        if (problemImages.length > 0 && typeof apiService.notificarProblemaConImagenes === 'function') {
          const formData = new FormData();
          formData.append('transitoId', transito.id);
          formData.append('problema', problemText);
          formData.append('timestamp', new Date().toISOString());
          
          // Agregar imágenes al FormData
          problemImages.forEach((image, index) => {
            formData.append(`imagen_${index}`, image.file);
          });

          await apiService.notificarProblemaConImagenes(formData);
        } else {
          // Si no hay imágenes o el método no existe, usar el método original
          await apiService.notificarProblema(transito.id, problemText);
          
          // Si había imágenes pero no se pudieron enviar, notificar al usuario
          if (problemImages.length > 0 && typeof apiService.notificarProblemaConImagenes !== 'function') {
            console.warn('El método para enviar imágenes no está disponible en el servicio API');
            addNotification('warning', 'Problema notificado sin las imágenes. El servicio de imágenes no está disponible.');
          }
        }
        
        // Agregar al historial local
        const nuevoProblema = {
          id: Date.now(),
          fecha: new Date().toISOString(),
          tipo: selectedProblem.label,
          descripcion: problemDetails || problemText,
          reportadoPor: 'Usuario actual',
          imagenes: problemImages.map(img => img.preview)
        };
        setHistorialProblemas(prev => [nuevoProblema, ...prev]);
        
        addNotification('success', 'Problema notificado correctamente');
      }
      
      // Limpiar y cerrar modal
      setShowProblemModal(false);
      setSelectedProblem(null);
      setProblemDetails('');
      setProblemImages([]);
      onUpdate?.();
    } catch (error) {
      // Mensaje de error más descriptivo
      const errorMessage = error.message || 'Error desconocido';
      addNotification('error', `Error al notificar el problema: ${errorMessage}`);
      console.error('Error detallado:', error);
      
      // Si el error es por el método que no existe, intentar sin imágenes
      if (error.message && error.message.includes('notificarProblemaConImagenes') && problemImages.length === 0) {
        try {
          await apiService.notificarProblema(transito.id, problemText);
          addNotification('success', 'Problema notificado correctamente (sin imágenes)');
          
          // Limpiar y cerrar modal
          setShowProblemModal(false);
          setSelectedProblem(null);
          setProblemDetails('');
          setProblemImages([]);
          onUpdate?.();
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError);
        }
      }
    } finally {
      setUploadingProblem(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </p>
        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value || '-'}
        </p>
      </div>
    </div>
  );

  // Componente para el timeline de problemas
  const ProblemaTimeline = ({ problema, isFirst, isLast }) => {
    const Icon = getProblemaIcon(problema.tipo);
    const [showImages, setShowImages] = useState(false);
    
    return (
      <div className="flex gap-4">
        {/* Línea vertical */}
        <div className="flex flex-col items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${darkMode ? 'bg-yellow-900/30 border-2 border-yellow-600' : 'bg-yellow-100 border-2 border-yellow-500'}
          `}>
            <Icon className="w-5 h-5 text-yellow-600" />
          </div>
          {!isLast && (
            <div className={`w-0.5 flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          )}
        </div>

        {/* Contenido del problema */}
        <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
          <div className={`
            p-4 rounded-lg
            ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}
          `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {problema.tipo}
                </h5>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatearFecha(problema.fecha)}
                </p>
              </div>
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}
              `}>
                {problema.reportadoPor}
              </span>
            </div>

            {/* Descripción */}
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {problema.descripcion}
            </p>

            {/* Imágenes */}
            {problema.imagenes && problema.imagenes.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowImages(!showImages)}
                  className={`
                    text-sm font-medium flex items-center gap-2
                    ${darkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}
                  `}
                >
                  <Image className="w-4 h-4" />
                  {showImages ? 'Ocultar' : 'Ver'} {problema.imagenes.length} {problema.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                </button>
                
                {showImages && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {problema.imagenes.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Evidencia ${idx + 1}`}
                        onClick={() => setPreviewImage({ preview: img, name: `Evidencia ${idx + 1}` })}
                        className={`
                          w-full h-20 object-cover rounded cursor-pointer
                          ${darkMode ? 'border border-gray-600' : 'border border-gray-300'}
                          hover:opacity-90 transition-opacity
                        `}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Estado y tiempo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`
              px-3 py-1 rounded-full text-xs font-semibold text-white 
              ${ESTADOS[localTransito.estado].color}
            `}>
              {ESTADOS[localTransito.estado].label}
            </span>
            <div className="flex items-center gap-2 text-sm">
              <Clock className={`w-4 h-4 ${isLate ? 'text-red-500' : ''}`} />
              <span className={`
                ${darkMode ? (isLate ? 'text-red-400' : 'text-gray-300') : (isLate ? 'text-red-500' : 'text-gray-700')}
                ${isLate ? 'font-semibold' : ''}
              `}>
                Salida: {localTransito.salida}
                {isLate && <span className="ml-1">(RETRASADO)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de retraso */}
        {isLate && localTransito.estado !== 'precintado' && (
          <div className={`
            p-3 rounded-lg border flex items-start gap-3
            ${darkMode 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-700'}
          `}>
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Tránsito retrasado</p>
              <p className="text-sm">Este tránsito debió salir a las {localTransito.salida}</p>
            </div>
          </div>
        )}

        {/* Información del vehículo */}
        <div className={`
          p-4 rounded-lg border
          ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
        `}>
          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Información del Vehículo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow 
              icon={Truck} 
              label="Matrícula Primaria" 
              value={localTransito.matricula} 
            />
            <InfoRow 
              icon={Truck} 
              label="Matrícula Secundaria" 
              value={localTransito.secundaria} 
            />
          </div>
        </div>

        {/* Información de la carga */}
        <div className={`
          p-4 rounded-lg border
          ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
        `}>
          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Información de la Carga
          </h4>
          <div className="space-y-3">
            <InfoRow 
              icon={Package} 
              label="Tipo de Carga" 
              value={localTransito.tipo === 'contenedor' ? 'Contenedor' : 'Carga con Lona'} 
            />
            {localTransito.tipo === 'contenedor' && localTransito.codigo && (
              <InfoRow 
                icon={FileText} 
                label="Código de Contenedor" 
                value={localTransito.codigo} 
              />
            )}
            <InfoRow 
              icon={Building} 
              label="Depósito" 
              value={localTransito.deposito} 
            />
          </div>
        </div>

        {/* Información del conductor */}
        <div className={`
          p-4 rounded-lg border
          ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
        `}>
          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Información del Conductor
          </h4>
          <div className="space-y-3">
            <InfoRow 
              icon={User} 
              label="Nombre del Chofer" 
              value={localTransito.chofer} 
            />
            <InfoRow 
              icon={Phone} 
              label="Teléfono de Contacto" 
              value={localTransito.telefono} 
            />
            {localTransito.empresa && (
              <InfoRow 
                icon={Building} 
                label="Empresa Transportista" 
                value={localTransito.empresa} 
              />
            )}
          </div>
        </div>

        {/* Observaciones */}
        {localTransito.observaciones && (
          <div className={`
            p-4 rounded-lg border
            ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}
          `}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Observaciones
                </h4>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {localTransito.observaciones}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Historial de problemas reportados */}
        {(historialProblemas.length > 0 || loadingHistorial) && (
          <div className={`
            p-4 rounded-lg border
            ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
          `}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Historial de Problemas Reportados
              </h4>
            </div>

            {loadingHistorial ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : historialProblemas.length > 0 ? (
              <div className="space-y-0">
                {historialProblemas.map((problema, index) => (
                  <ProblemaTimeline
                    key={problema.id}
                    problema={problema}
                    isFirst={index === 0}
                    isLast={index === historialProblemas.length - 1}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay problemas reportados para este tránsito</p>
              </div>
            )}
          </div>
        )}

        {/* Acciones - Optimizado para tablets */}
        {localTransito.estado !== 'precintado' && (
          <div className="pt-6 pb-2 border-t dark:border-gray-700">
            <div className="space-y-4">
              {/* Botones de acción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botón Marcar como Precintado */}
                <button 
                  onClick={handleMarcarPrecintado}
                  disabled={updating || (!isOnline && localTransito.estado === 'precintado')}
                  className={`
                    w-full px-6 py-4 rounded-2xl font-medium text-lg
                    transition-all duration-200 transform
                    ${updating 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
                    }
                    text-white min-h-[3.5rem]
                    sm:text-base sm:py-4
                    md:text-lg md:py-5
                    ${!updating && 'active:shadow-md'}
                  `}
                >
                  {updating ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </span>
                  ) : (
                    'Marcar como Precintado'
                  )}
                </button>

                {/* Botón Notificar Problema */}
                <button 
                  onClick={() => setShowProblemModal(true)}
                  className={`
                    w-full px-6 py-4 rounded-2xl font-medium text-lg
                    transition-all duration-200 transform
                    ${darkMode 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }
                    active:scale-95 shadow-lg hover:shadow-xl
                    min-h-[3.5rem]
                    sm:text-base sm:py-4
                    md:text-lg md:py-5
                    active:shadow-md
                    flex items-center justify-center gap-2
                  `}
                >
                  <AlertTriangle className="w-5 h-5" />
                  Notificar Problema
                </button>
              </div>
              
              {/* Mensaje de estado offline */}
              {!isOnline && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-xl p-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center font-medium">
                    ⚠️ Sin conexión - Los cambios se guardarán localmente
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Notificar Problema */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`
            w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
          `}>
            {/* Header del modal */}
            <div className={`
              sticky top-0 z-10 flex items-center justify-between p-5 border-b
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <h3 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Notificar Problema
              </h3>
              <button
                onClick={() => {
                  setShowProblemModal(false);
                  setSelectedProblem(null);
                  setProblemDetails('');
                  setProblemImages([]);
                }}
                className={`
                  p-2 rounded-lg transition-colors
                  ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-5 space-y-4">
              {/* Información del tránsito */}
              <div className={`
                p-3 rounded-lg text-sm
                ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}
              `}>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  <span className="font-medium">Vehículo:</span> {localTransito.matricula}
                </p>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  <span className="font-medium">Chofer:</span> {localTransito.chofer}
                </p>
              </div>

              {/* Tipos de problemas */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Tipo de problema:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROBLEMAS_COMUNES.map((problema) => {
                    const Icon = problema.icon;
                    return (
                      <button
                        key={problema.id}
                        onClick={() => setSelectedProblem(problema)}
                        className={`
                          p-3 rounded-lg border transition-all text-left
                          flex items-center gap-2
                          ${selectedProblem?.id === problema.id
                            ? darkMode 
                              ? 'bg-yellow-900/30 border-yellow-600 text-yellow-400'
                              : 'bg-yellow-50 border-yellow-500 text-yellow-700'
                            : darkMode
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'
                              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{problema.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detalles adicionales */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Detalles adicionales {selectedProblem?.id === 'otro' && '(requerido)'}:
                </label>
                <textarea
                  value={problemDetails}
                  onChange={(e) => setProblemDetails(e.target.value)}
                  placeholder={
                    selectedProblem?.id === 'otro' 
                      ? "Describe el problema..." 
                      : "Información adicional (opcional)"
                  }
                  rows={3}
                  className={`
                    w-full px-3 py-2 rounded-lg border resize-none
                    ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50
                  `}
                />
              </div>

              {/* Sección de imágenes */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Evidencia fotográfica (opcional):
                </label>
                
                {/* Inputs de archivo ocultos */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Botones para cargar imágenes */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Botón para tomar foto */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={problemImages.length >= 5 || compressingImages}
                    className={`
                      p-4 rounded-lg border-2 border-dashed transition-all
                      flex flex-col items-center justify-center gap-2
                      ${problemImages.length >= 5 || compressingImages
                        ? darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-yellow-600 text-gray-300'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-yellow-500 text-gray-700'
                      }
                    `}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm font-medium">Tomar Foto</span>
                  </button>

                  {/* Botón para cargar desde galería */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={problemImages.length >= 5 || compressingImages}
                    className={`
                      p-4 rounded-lg border-2 border-dashed transition-all
                      flex flex-col items-center justify-center gap-2
                      ${problemImages.length >= 5 || compressingImages
                        ? darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : darkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-yellow-600 text-gray-300'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-yellow-500 text-gray-700'
                      }
                    `}
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Cargar Imágenes</span>
                  </button>
                </div>

                {/* Indicador de carga */}
                {compressingImages && (
                  <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Comprimiendo imágenes...
                      </span>
                    </div>
                  </div>
                )}

                {/* Contador de imágenes */}
                <p className={`mt-2 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {problemImages.length}/5 imágenes cargadas
                </p>

                {/* Preview de imágenes */}
                {problemImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {problemImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={image.name}
                          onClick={() => setPreviewImage(image)}
                          className={`
                            w-full h-24 object-cover rounded-lg cursor-pointer
                            ${darkMode ? 'border border-gray-600' : 'border border-gray-300'}
                            hover:opacity-90 transition-opacity
                          `}
                        />
                        {/* Indicador de compresión */}
                        {image.compressed && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                            ✓
                          </div>
                        )}
                        {/* Botón de eliminar */}
                        <button
                          onClick={() => removeImage(image.id)}
                          className={`
                            absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                            ${darkMode 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-red-500 hover:bg-red-600'
                            }
                            text-white
                          `}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {/* Botón de ampliar */}
                        <button
                          onClick={() => setPreviewImage(image)}
                          className={`
                            absolute bottom-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                            ${darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600' 
                              : 'bg-gray-800 hover:bg-gray-700'
                            }
                            text-white
                          `}
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        {/* Nombre del archivo */}
                        <div className={`
                          absolute bottom-0 left-0 right-0 p-1 text-xs truncate
                          rounded-b-lg
                          ${darkMode ? 'bg-gray-900/80 text-gray-300' : 'bg-black/70 text-white'}
                        `}>
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mensaje informativo */}
                <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Image className="w-3 h-3 inline mr-1" />
                  Las imágenes se comprimen automáticamente. Máximo 5MB por imagen.
                </p>
              </div>
            </div>

            {/* Footer del modal */}
            <div className={`
              sticky bottom-0 flex gap-3 p-5 border-t
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <button
                onClick={() => {
                  setShowProblemModal(false);
                  setSelectedProblem(null);
                  setProblemDetails('');
                  setProblemImages([]);
                }}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }
                `}
              >
                Cancelar
              </button>
              <button
                onClick={handleNotificarProblema}
                disabled={
                  uploadingProblem || 
                  compressingImages ||
                  !selectedProblem || 
                  (selectedProblem.id === 'otro' && !problemDetails.trim())
                }
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  flex items-center justify-center gap-2
                  ${(uploadingProblem || compressingImages || !selectedProblem || (selectedProblem.id === 'otro' && !problemDetails.trim()))
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }
                `}
              >
                {uploadingProblem ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Notificar
                    {problemImages.length > 0 && (
                      <span className="text-xs">({problemImages.length} foto{problemImages.length !== 1 ? 's' : ''})</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Modal de preview de imagen */}
          {previewImage && (
            <div 
              className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center p-4"
              onClick={() => setPreviewImage(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <img
                  src={previewImage.preview}
                  alt={previewImage.name}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-black bg-opacity-50 rounded-lg text-white">
                  <p className="text-sm font-medium">{previewImage.name}</p>
                  {previewImage.compressed && (
                    <p className="text-xs text-green-400 mt-1">✓ Imagen comprimida</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TransitoDetails;