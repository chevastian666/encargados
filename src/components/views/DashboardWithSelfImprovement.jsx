/**
 * Example Dashboard with Self-Improvement Integration
 * 
 * Shows how to integrate self-improvement features into existing components
 */

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSelfImprovement } from '../../hooks/useSelfImprovement.jsx';
import selfImprovement from '../../utils/selfImprovement.js';

const DashboardWithSelfImprovement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize self-improvement hook
  const selfImprove = useSelfImprovement('DashboardWithSelfImprovement');

  // Simulated data fetch with error handling
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call that might fail
      const random = Math.random();
      if (random < 0.3) {
        throw new Error('Network timeout while fetching dashboard data');
      }
      
      // Simulate successful data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({
        totalTransits: 142,
        pendingSeals: 23,
        alerts: 5,
        lastUpdate: new Date().toISOString()
      });
      
    } catch (err) {
      setError(err.message);
      
      // Use self-improvement to handle the error
      const failure = await selfImprove.handleError(err, {
        action: 'fetch-dashboard-data',
        retryable: true
      });
      
      // If the self-improvement protocol fixed the issue, retry
      if (failure.status === 'fixed') {
        console.log('Self-improvement fixed the issue, retrying...');
        return fetchDashboardData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Check for missing tools
  const checkForTools = async () => {
    const requiredTools = ['data-visualizer', 'export-handler'];
    
    for (const tool of requiredTools) {
      const discovery = await selfImprove.discoverTool(tool, {
        purpose: 'dashboard-enhancement',
        priority: 'medium'
      });
      
      if (discovery.status === 'integrated') {
        console.log(`Tool ${tool} successfully integrated`);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    checkForTools();
  }, []);

  // Generate improvement report
  const showImprovementReport = () => {
    const report = selfImprovement.generateImprovementReport();
    console.log('Self-Improvement Report:', report);
    alert(`Self-Improvement Status:
- Total Failures: ${report.totalFailures}
- Fixed: ${report.fixedFailures}
- Tools Added: ${report.registeredTools}
- Tests Generated: ${report.regressionTests}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Dashboard con Auto-Mejora
        </h1>
        <p className="text-secondary">
          Este dashboard incluye capacidades de auto-mejora y recuperación de errores
        </p>
      </div>

      {/* Self-Improvement Status */}
      <div className="mb-6 p-4 surface-primary rounded-lg border border-primary border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-medium">Estado de Auto-Mejora</span>
          </div>
          <button
            onClick={showImprovementReport}
            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary hover:bg-opacity-90"
          >
            Ver Reporte
          </button>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-tertiary">Mejoras:</span>
            <span className="ml-2 font-medium">{selfImprove.improvements.length}</span>
          </div>
          <div>
            <span className="text-tertiary">Monitoreo:</span>
            <span className="ml-2 font-medium text-success">Activo</span>
          </div>
          <div>
            <span className="text-tertiary">Última acción:</span>
            <span className="ml-2 font-medium">
              {selfImprove.improvements.length > 0 
                ? new Date(selfImprove.improvements[selfImprove.improvements.length - 1].timestamp).toLocaleTimeString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-secondary">Cargando datos...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger bg-opacity-10 border border-danger rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="font-medium">Error detectado</span>
          </div>
          <p className="mt-1 text-sm text-secondary">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary hover:bg-opacity-90"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="surface-primary p-4 rounded-lg border border-primary border-opacity-20">
            <div className="text-2xl font-bold text-primary">{data.totalTransits}</div>
            <div className="text-sm text-secondary">Tránsitos Totales</div>
          </div>
          
          <div className="surface-primary p-4 rounded-lg border border-primary border-opacity-20">
            <div className="text-2xl font-bold text-warning">{data.pendingSeals}</div>
            <div className="text-sm text-secondary">Precintos Pendientes</div>
          </div>
          
          <div className="surface-primary p-4 rounded-lg border border-primary border-opacity-20">
            <div className="text-2xl font-bold text-danger">{data.alerts}</div>
            <div className="text-sm text-secondary">Alertas Activas</div>
          </div>
          
          <div className="surface-primary p-4 rounded-lg border border-primary border-opacity-20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm text-success">Actualizado</span>
            </div>
            <div className="text-xs text-tertiary mt-1">
              {new Date(data.lastUpdate).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => selfImprove.runTests()}
          className="px-4 py-2 bg-secondary text-primary rounded hover:bg-tertiary"
        >
          Ejecutar Tests
        </button>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary hover:bg-opacity-90"
        >
          Actualizar Datos
        </button>
      </div>
    </div>
  );
};

export default DashboardWithSelfImprovement;