/**
 * Automated Test Runner for Self-Improvement Protocol
 * 
 * Runs evaluation tests, regression tests, and verifies improvements
 */

import selfImprovement from './selfImprovement.js';
import mcpIntegration from '../services/mcpIntegration.service.js';

class TestRunner {
  constructor() {
    this.testSuites = new Map();
    this.results = [];
    this.coverage = new Map();
  }

  /**
   * Register a test suite
   */
  registerTestSuite(name, suite) {
    this.testSuites.set(name, {
      name,
      tests: suite.tests || [],
      setup: suite.setup || (() => {}),
      teardown: suite.teardown || (() => {}),
      timeout: suite.timeout || 5000
    });
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    const startTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      duration: 0,
      suites: [],
      totals: {
        tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    for (const [suiteName, suite] of this.testSuites) {
      const suiteResult = await this.runTestSuite(suiteName, suite);
      results.suites.push(suiteResult);
      
      // Update totals
      results.totals.tests += suiteResult.totals.tests;
      results.totals.passed += suiteResult.totals.passed;
      results.totals.failed += suiteResult.totals.failed;
      results.totals.skipped += suiteResult.totals.skipped;
    }

    results.duration = Date.now() - startTime;
    this.results.push(results);
    
    return results;
  }

  /**
   * Run a single test suite
   */
  async runTestSuite(suiteName, suite) {
    const suiteResult = {
      name: suiteName,
      timestamp: new Date().toISOString(),
      tests: [],
      totals: {
        tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    try {
      // Run setup
      await suite.setup();

      // Run each test
      for (const test of suite.tests) {
        const testResult = await this.runTest(test, suite.timeout);
        suiteResult.tests.push(testResult);
        suiteResult.totals.tests++;
        
        switch (testResult.status) {
          case 'passed':
            suiteResult.totals.passed++;
            break;
          case 'failed':
            suiteResult.totals.failed++;
            break;
          case 'skipped':
            suiteResult.totals.skipped++;
            break;
        }
      }

      // Run teardown
      await suite.teardown();
      
    } catch (error) {
      suiteResult.error = error.message;
    }

    return suiteResult;
  }

  /**
   * Run a single test
   */
  async runTest(test, timeout) {
    const testResult = {
      name: test.name,
      status: 'pending',
      duration: 0,
      timestamp: new Date().toISOString()
    };

    if (test.skip) {
      testResult.status = 'skipped';
      return testResult;
    }

    const startTime = Date.now();

    try {
      // Run test with timeout
      const testPromise = test.fn();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), timeout)
      );

      await Promise.race([testPromise, timeoutPromise]);
      
      testResult.status = 'passed';
      testResult.duration = Date.now() - startTime;
      
      // Update coverage if available
      if (test.covers) {
        this.updateCoverage(test.covers, true);
      }
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      testResult.stack = error.stack;
      testResult.duration = Date.now() - startTime;
      
      // Generate regression test from failure
      if (test.generateRegression !== false) {
        await selfImprovement.generateRegressionTest(
          test.component || 'unknown',
          error,
          { testName: test.name }
        );
      }
    }

    return testResult;
  }

  /**
   * Update test coverage
   */
  updateCoverage(component, passed) {
    const current = this.coverage.get(component) || { total: 0, passed: 0 };
    current.total++;
    if (passed) current.passed++;
    this.coverage.set(component, current);
  }

  /**
   * Generate coverage report
   */
  generateCoverageReport() {
    const report = {
      timestamp: new Date().toISOString(),
      components: [],
      overall: {
        total: 0,
        passed: 0,
        percentage: 0
      }
    };

    for (const [component, stats] of this.coverage) {
      const percentage = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;
      report.components.push({
        component,
        ...stats,
        percentage
      });
      
      report.overall.total += stats.total;
      report.overall.passed += stats.passed;
    }

    report.overall.percentage = report.overall.total > 0 
      ? (report.overall.passed / report.overall.total) * 100 
      : 0;

    return report;
  }

  /**
   * Run MCP integration tests
   */
  async runMCPTests() {
    const mcps = mcpIntegration.listMCPs();
    const results = [];

    for (const mcp of mcps) {
      const testSpec = mcpIntegration.generateIntegrationTest(mcp.name);
      const suite = this.convertMCPTestToSuite(testSpec);
      
      this.registerTestSuite(`mcp-${mcp.name}`, suite);
      const result = await this.runTestSuite(`mcp-${mcp.name}`, suite);
      results.push(result);
    }

    return results;
  }

  /**
   * Convert MCP test specification to test suite
   */
  convertMCPTestToSuite(testSpec) {
    const tests = [];

    // Connection test
    tests.push({
      name: testSpec.testSuite.connection.test,
      fn: async () => {
        const status = mcpIntegration.getMCPStatus(testSpec.mcpName);
        if (!status.connection || status.connection.status !== 'connected') {
          throw new Error('MCP not connected');
        }
      }
    });

    // Tool tests
    for (const toolTest of testSpec.testSuite.tools) {
      tests.push({
        name: toolTest.test,
        fn: async () => {
          await mcpIntegration.executeMCPCommand(
            testSpec.mcpName,
            toolTest.test.match(/execute (\w+) command/)[1],
            {}
          );
        }
      });
    }

    // Error handling tests
    tests.push({
      name: testSpec.testSuite.errorHandling.test,
      fn: async () => {
        try {
          await mcpIntegration.executeMCPCommand(
            testSpec.mcpName,
            'invalid-command',
            {}
          );
          throw new Error('Should have thrown error');
        } catch (error) {
          // Expected error
        }
      }
    });

    // Performance test
    tests.push({
      name: testSpec.testSuite.performance.test,
      fn: async () => {
        const status = mcpIntegration.getMCPStatus(testSpec.mcpName);
        const metrics = status.connection?.metrics;
        
        if (!metrics) throw new Error('No metrics available');
        
        if (metrics.avgResponseTime > 1000) {
          throw new Error(`Response time too high: ${metrics.avgResponseTime}ms`);
        }
        
        if (metrics.requests > 0) {
          const errorRate = metrics.errors / metrics.requests;
          if (errorRate > 0.05) {
            throw new Error(`Error rate too high: ${(errorRate * 100).toFixed(1)}%`);
          }
        }
      }
    });

    return { tests };
  }

  /**
   * Run regression tests
   */
  async runRegressionTests() {
    return await selfImprovement.runEvaluationTests();
  }

  /**
   * Verify improvements
   */
  async verifyImprovements() {
    const report = selfImprovement.generateImprovementReport();
    const verification = {
      timestamp: new Date().toISOString(),
      improvements: report.recentImprovements.length,
      fixRate: report.totalFailures > 0 
        ? (report.fixedFailures / report.totalFailures) * 100 
        : 100,
      toolsAdded: report.registeredTools,
      testsGenerated: report.regressionTests,
      status: 'verified'
    };

    // Check if improvements are effective
    if (verification.fixRate < 50) {
      verification.status = 'needs-attention';
      verification.recommendation = 'Low fix rate detected, review failure patterns';
    }

    return verification;
  }

  /**
   * Get test history
   */
  getTestHistory() {
    return this.results;
  }

  /**
   * Get latest test results
   */
  getLatestResults() {
    return this.results[this.results.length - 1] || null;
  }
}

// Create default test suites
const testRunner = new TestRunner();

// Self-improvement tests
testRunner.registerTestSuite('self-improvement', {
  tests: [
    {
      name: 'Should handle MCP failures',
      fn: async () => {
        const error = new Error('Test error');
        const failure = await selfImprovement.handleMCPFailure('test-mcp', error);
        if (!failure || !failure.id) throw new Error('Failure not recorded');
      },
      covers: 'selfImprovement'
    },
    {
      name: 'Should discover missing tools',
      fn: async () => {
        const discovery = await selfImprovement.discoverMissingTool('test-tool');
        if (!discovery || !discovery.toolName) throw new Error('Tool not discovered');
      },
      covers: 'selfImprovement'
    },
    {
      name: 'Should generate regression tests',
      fn: async () => {
        const error = new Error('Regression test error');
        const test = await selfImprovement.generateRegressionTest('test-component', error, {});
        if (!test || !test.id) throw new Error('Regression test not generated');
      },
      covers: 'selfImprovement'
    },
    {
      name: 'Should apply self-healing patterns',
      fn: async () => {
        const pattern = { type: 'auto-retry', config: { maxRetries: 1 } };
        await selfImprovement.applySelfHealing('test-mcp', new Error('Test'), pattern);
      },
      covers: 'selfImprovement'
    }
  ]
});

// MCP integration tests
testRunner.registerTestSuite('mcp-integration', {
  tests: [
    {
      name: 'Should register MCP',
      fn: async () => {
        await mcpIntegration.registerMCP('test-mcp-reg', {
          capabilities: ['test'],
          endpoints: { base: 'http://test' }
        });
        await mcpIntegration.unregisterMCP('test-mcp-reg');
      },
      covers: 'mcpIntegration'
    },
    {
      name: 'Should execute MCP commands',
      fn: async () => {
        const result = await mcpIntegration.executeMCPCommand('context-mcp', 'query', {});
        if (!result || !result.success) throw new Error('Command execution failed');
      },
      covers: 'mcpIntegration'
    },
    {
      name: 'Should monitor MCP health',
      fn: async () => {
        const health = await mcpIntegration.checkMCPHealth('context-mcp');
        if (health === undefined) throw new Error('Health check failed');
      },
      covers: 'mcpIntegration'
    }
  ]
});

export default testRunner;

// Export class for testing
export { TestRunner };