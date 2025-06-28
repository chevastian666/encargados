/**
 * React Hook for Self-Improvement Protocol
 * 
 * Provides easy integration of self-improvement features in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import selfImprovement from '../utils/selfImprovement.js';

export const useSelfImprovement = (componentName = 'Unknown') => {
  const [improvements, setImprovements] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const errorCountRef = useRef(0);
  const lastErrorRef = useRef(null);

  // Error boundary integration
  const handleError = useCallback(async (error, errorInfo = {}) => {
    console.error(`Error in ${componentName}:`, error);
    
    // Track consecutive errors
    if (lastErrorRef.current && Date.now() - lastErrorRef.current < 5000) {
      errorCountRef.current++;
    } else {
      errorCountRef.current = 1;
    }
    lastErrorRef.current = Date.now();

    // Trigger self-improvement protocol
    const failure = await selfImprovement.handleMCPFailure(
      componentName,
      error,
      { errorInfo, consecutiveErrors: errorCountRef.current }
    );

    // Update improvements state
    setImprovements(prev => [...prev, failure]);

    return failure;
  }, [componentName]);

  // Tool discovery helper
  const discoverTool = useCallback(async (toolName, requirements) => {
    return await selfImprovement.discoverMissingTool(toolName, requirements);
  }, []);

  // Run evaluation tests
  const runTests = useCallback(async () => {
    return await selfImprovement.runEvaluationTests();
  }, []);

  // Get improvement report
  const getReport = useCallback(() => {
    return selfImprovement.generateImprovementReport();
  }, []);

  // Monitor performance
  useEffect(() => {
    if (!isMonitoring) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          selfImprovement.documentFindings('performance', {
            component: componentName,
            operation: entry.name,
            duration: entry.duration,
            slow: true
          });
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, [componentName, isMonitoring]);

  return {
    handleError,
    discoverTool,
    runTests,
    getReport,
    improvements,
    isMonitoring,
    setIsMonitoring
  };
};

/**
 * Higher-order component for self-improvement
 */
export const withSelfImprovement = (Component, componentName) => {
  return function SelfImprovingComponent(props) {
    const selfImprove = useSelfImprovement(componentName || Component.name);

    // Error boundary behavior
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (hasError && error) {
        selfImprove.handleError(error);
      }
    }, [hasError, error, selfImprove]);

    // Wrap component with error handling
    try {
      if (hasError) {
        return (
          <div className="p-4 bg-danger/10 border border-danger rounded-lg">
            <h3 className="text-danger font-semibold mb-2">
              Error en {componentName || Component.name}
            </h3>
            <p className="text-sm text-secondary">{error?.message}</p>
            <button
              onClick={() => {
                setHasError(false);
                setError(null);
              }}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        );
      }

      return <Component {...props} selfImprove={selfImprove} />;
    } catch (error) {
      setHasError(true);
      setError(error);
      return null;
    }
  };
};