import React from 'react';
import { X, Truck } from 'lucide-react';
import TabletModal from '../common/TabletModal';
import EnhancedTransitForm from '../common/EnhancedTransitForm';
import { useNotification } from '../../hooks';
import apiService from '../../services/api.service';

/**
 * Modal para registrar un nuevo tránsito
 * Integra la base de datos de vehículos y choferes
 */
const NuevoTransitoModal = ({ isOpen, onClose, darkMode, onTransitCreated }) => {
  const { success, error, warning, info } = useNotification();

  const handleSubmit = async (formData) => {
    try {
      // Aquí iría la llamada a la API para crear el tránsito
      const response = await apiService.createTransito(formData);
      
      success('Tránsito registrado exitosamente');
      
      if (onTransitCreated) {
        onTransitCreated(response);
      }
      
      onClose();
    } catch (error) {
      error('Error al registrar el tránsito');
      console.error('Error:', error);
    }
  };

  return (
    <TabletModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Tránsito"
      darkMode={darkMode}
      size="large"
    >
      <div className="p-6">
        <EnhancedTransitForm
          onSubmit={handleSubmit}
          darkMode={darkMode}
          mode="create"
        />
      </div>
    </TabletModal>
  );
};

export default NuevoTransitoModal;