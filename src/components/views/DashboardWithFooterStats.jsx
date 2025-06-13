import React from 'react';
import DashboardCleanFixed from './DashboardCleanFixed';
import OperationalStats from '../common/OperationalStats';

/**
 * Dashboard alternativo con estadísticas en el footer
 * Muestra las métricas operativas en la parte inferior
 */
const DashboardWithFooterStats = ({ onModuleClick }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard principal ocupa el espacio disponible */}
      <div className="flex-1">
        <DashboardCleanFixed onModuleClick={onModuleClick} />
      </div>
      
      {/* Estadísticas operativas en el footer */}
      <OperationalStats darkMode={true} position="footer" />
    </div>
  );
};

export default DashboardWithFooterStats;