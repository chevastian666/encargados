/**
 * Self-Improvement Dashboard Component
 * 
 * Visualizes the self-improvement protocol status and allows manual interventions
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, 
  TrendingUp, Wrench, TestTube, Shield, RefreshCw,
  Download, Upload, Play, BarChart
} from 'lucide-react';
import selfImprovement from '../../utils/selfImprovement.js';
import mcpIntegration from '../../services/mcpIntegration.service.js';
import testRunner from '../../utils/testRunner.js';
import { useSelfImprovement } from '../../hooks/useSelfImprovement.jsx';

const SelfImprovementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [report, setReport] = useState(null);
  const [mcpList, setMCPList] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverageReport, setCoverageReport] = useState(null);

  const selfImprove = useSelfImprovement('SelfImprovementDashboard');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const improvementReport = selfImprovement.generateImprovementReport();
      setReport(improvementReport);
      
      const mcps = mcpIntegration.listMCPs();
      setMCPList(mcps);
      
      const coverage = testRunner.generateCoverageReport();
      setCoverageReport(coverage);
      
      const latestTests = testRunner.getLatestResults();
      setTestResults(latestTests);
    } catch (error) {
      await selfImprove.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    try {
      const results = await testRunner.runAllTests();
      setTestResults(results);
      
      const coverage = testRunner.generateCoverageReport();
      setCoverageReport(coverage);
      
      await loadData();
    } catch (error) {
      await selfImprove.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const runMCPTests = async () => {
    setLoading(true);
    try {
      await testRunner.runMCPTests();
      await loadData();
    } catch (error) {
      await selfImprove.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyImprovements = async () => {
    setLoading(true);
    try {
      const verification = await testRunner.verifyImprovements();
      console.log('Improvements verified:', verification);
      await loadData();
    } catch (error) {
      await selfImprove.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const data = {
      report,
      mcpList,
      testResults,
      coverageReport,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `self-improvement-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface-primary p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {report?.totalFailures || 0}
            </span>
          </div>
          <p className="text-sm text-secondary">Fallas Totales</p>
          <p className="text-xs text-success mt-1">
            {report?.fixedFailures || 0} corregidas
          </p>
        </div>

        <div className="surface-primary p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <Wrench className="w-5 h-5 text-accent" />
            <span className="text-2xl font-bold text-accent">
              {report?.registeredTools || 0}
            </span>
          </div>
          <p className="text-sm text-secondary">Herramientas</p>
          <p className="text-xs text-tertiary mt-1">Integradas</p>
        </div>

        <div className="surface-primary p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <TestTube className="w-5 h-5 text-info" />
            <span className="text-2xl font-bold text-info">
              {report?.regressionTests || 0}
            </span>
          </div>
          <p className="text-sm text-secondary">Tests</p>
          <p className="text-xs text-tertiary mt-1">Generados</p>
        </div>

        <div className="surface-primary p-4 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-success" />
            <span className="text-2xl font-bold text-success">
              {report?.healingPatterns || 0}
            </span>
          </div>
          <p className="text-sm text-secondary">Patrones</p>
          <p className="text-xs text-tertiary mt-1">Auto-sanación</p>
        </div>
      </div>

      {/* Recent Improvements */}
      <div className="surface-primary p-6 rounded-lg border border-primary/20">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Mejoras Recientes
        </h3>
        <div className="space-y-3">
          {report?.recentImprovements?.slice(0, 5).map((improvement, index) => (
            <div key={improvement.id || index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium text-primary">{improvement.category}</p>
                <p className="text-xs text-secondary">
                  {improvement.findings?.errors?.length || 0} errores encontrados
                </p>
              </div>
              <span className="text-xs text-tertiary">
                {new Date(improvement.timestamp).toLocaleString()}
              </span>
            </div>
          )) || <p className="text-sm text-tertiary">No hay mejoras recientes</p>}
        </div>
      </div>
    </div>
  );

  const renderMCPs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">MCPs Registrados</h3>
        <button
          onClick={runMCPTests}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Ejecutar Tests MCP
        </button>
      </div>

      <div className="grid gap-4">
        {mcpList.map((mcp) => (
          <div key={mcp.name} className="surface-primary p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-primary">{mcp.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                mcp.protocol?.status === 'active' 
                  ? 'bg-success/20 text-success' 
                  : 'bg-danger/20 text-danger'
              }`}>
                {mcp.protocol?.status || 'unknown'}
              </span>
            </div>

            {mcp.connection && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-tertiary">Solicitudes</p>
                  <p className="font-medium">{mcp.connection.metrics.requests}</p>
                </div>
                <div>
                  <p className="text-tertiary">Errores</p>
                  <p className="font-medium text-danger">{mcp.connection.metrics.errors}</p>
                </div>
                <div>
                  <p className="text-tertiary">Tiempo Resp.</p>
                  <p className="font-medium">{mcp.connection.metrics.avgResponseTime.toFixed(0)}ms</p>
                </div>
              </div>
            )}

            {mcp.health && !mcp.health.healthy && (
              <div className="mt-3 p-2 bg-danger/10 rounded-lg">
                <p className="text-sm text-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {mcp.health.reason}
                </p>
              </div>
            )}

            {mcp.tools && mcp.tools.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-tertiary mb-1">Herramientas disponibles:</p>
                <div className="flex flex-wrap gap-1">
                  {mcp.tools.map((tool, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-secondary rounded">
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">Resultados de Tests</h3>
        <div className="flex gap-2">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Ejecutar Tests
          </button>
          <button
            onClick={verifyImprovements}
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Verificar Mejoras
          </button>
        </div>
      </div>

      {/* Test Summary */}
      {testResults && (
        <div className="surface-primary p-6 rounded-lg border border-primary/20">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{testResults.totals.tests}</p>
              <p className="text-sm text-secondary">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{testResults.totals.passed}</p>
              <p className="text-sm text-secondary">Exitosos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{testResults.totals.failed}</p>
              <p className="text-sm text-secondary">Fallidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{testResults.totals.skipped}</p>
              <p className="text-sm text-secondary">Omitidos</p>
            </div>
          </div>

          <div className="text-sm text-tertiary">
            Duración: {testResults.duration}ms | 
            Ejecutado: {new Date(testResults.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Test Suites */}
      {testResults?.suites?.map((suite, index) => (
        <div key={index} className="surface-primary p-4 rounded-lg border border-primary/20">
          <h4 className="font-medium text-primary mb-3">{suite.name}</h4>
          <div className="space-y-2">
            {suite.tests.map((test, testIndex) => (
              <div key={testIndex} className="flex items-center justify-between p-2 bg-secondary rounded">
                <span className="text-sm">{test.name}</span>
                <div className="flex items-center gap-2">
                  {test.status === 'passed' && <CheckCircle className="w-4 h-4 text-success" />}
                  {test.status === 'failed' && <XCircle className="w-4 h-4 text-danger" />}
                  {test.status === 'skipped' && <span className="w-4 h-4 text-warning">⏭</span>}
                  <span className="text-xs text-tertiary">{test.duration}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Coverage Report */}
      {coverageReport && (
        <div className="surface-primary p-6 rounded-lg border border-primary/20">
          <h4 className="font-medium text-primary mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Cobertura de Tests
          </h4>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-secondary">Cobertura Total</span>
              <span className="text-sm font-medium">
                {coverageReport.overall.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${coverageReport.overall.percentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {coverageReport.components.map((comp, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-tertiary">{comp.component}</span>
                <span className={comp.percentage >= 80 ? 'text-success' : 'text-warning'}>
                  {comp.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Activity },
    { id: 'mcps', label: 'MCPs', icon: Tool },
    { id: 'tests', label: 'Tests', icon: TestTube }
  ];

  return (
    <div className="p-6 bg-primary min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Panel de Auto-Mejora
          </h1>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportReport}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-primary/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-secondary hover:text-primary'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="animate-in">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'mcps' && renderMCPs()}
          {activeTab === 'tests' && renderTests()}
        </div>
      </div>
    </div>
  );
};

export default SelfImprovementDashboard;