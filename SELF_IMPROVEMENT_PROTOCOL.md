# Self-Improvement Protocol

This document describes the self-improvement protocol implementation for the Sistema de Precintado Aduanero.

## Overview

The self-improvement protocol is a comprehensive system that enables the application to:
- Automatically detect and fix failures
- Discover and integrate missing tools
- Generate regression tests from failures
- Apply self-healing patterns
- Verify improvements through multi-agent validation

## Core Components

### 1. Self-Improvement Protocol (`src/utils/selfImprovement.js`)

The main engine that handles:
- **MCP Failure Handling**: Debugs and fixes issues rather than working around them
- **Tool Discovery**: Researches and integrates missing tools automatically
- **Regression Test Generation**: Creates tests from failures to prevent recurrence
- **Self-Healing Patterns**: Applies patterns like circuit breakers, auto-retry, and fallbacks
- **Multi-Agent Verification**: Validates changes through multiple verification agents

### 2. MCP Integration Service (`src/services/mcpIntegration.service.js`)

Manages Model Context Protocol integrations:
- Registers and initializes MCPs
- Monitors health and performance
- Executes commands with automatic failure handling
- Discovers available tools within MCPs

### 3. Test Runner (`src/utils/testRunner.js`)

Automated testing framework:
- Runs test suites with timeout support
- Generates coverage reports
- Executes MCP integration tests
- Verifies improvements effectiveness

### 4. React Hook (`src/hooks/useSelfImprovement.js`)

Easy integration for React components:
- Error boundary integration
- Performance monitoring
- Tool discovery helpers
- Improvement tracking

### 5. Dashboard Component (`src/components/views/SelfImprovementDashboard.jsx`)

Visual interface for monitoring and control:
- Real-time status overview
- MCP health monitoring
- Test execution and results
- Export/import capabilities

## Self-Healing Patterns

### Auto-Retry Pattern
```javascript
{
  type: 'auto-retry',
  config: {
    maxRetries: 5,
    initialDelay: 1000  // Exponential backoff
  }
}
```

### Circuit Breaker Pattern
```javascript
{
  type: 'circuit-breaker',
  config: {
    threshold: 5,      // Failures before opening
    timeout: 60000     // Reset timeout in ms
  }
}
```

### Fallback Pattern
```javascript
{
  type: 'fallback',
  config: {
    fallbackMethod: async () => { /* ... */ },
    fallbackData: { cached: true }
  }
}
```

### Cache Recovery Pattern
```javascript
{
  type: 'cache-recovery',
  config: {
    cacheKey: 'data-key',
    ttl: 3600000  // Time to live in ms
  }
}
```

## Usage Examples

### In React Components

```javascript
import { useSelfImprovement } from './hooks/useSelfImprovement';

const MyComponent = () => {
  const selfImprove = useSelfImprovement('MyComponent');

  const handleAction = async () => {
    try {
      // Your code here
    } catch (error) {
      // Automatically handles failure and attempts fixes
      await selfImprove.handleError(error);
    }
  };

  // Discover missing tool
  const addTool = async () => {
    const discovery = await selfImprove.discoverTool('new-tool', {
      type: 'function',
      requirements: { version: '>=1.0.0' }
    });
  };
};
```

### With Higher-Order Component

```javascript
import { withSelfImprovement } from './hooks/useSelfImprovement';

const MyComponent = ({ selfImprove }) => {
  // Component has automatic error handling
};

export default withSelfImprovement(MyComponent, 'MyComponent');
```

### Direct Protocol Usage

```javascript
import selfImprovement from './utils/selfImprovement';

// Handle MCP failure
const failure = await selfImprovement.handleMCPFailure(
  'api-mcp',
  error,
  { context: 'data-fetch' }
);

// Generate improvement report
const report = selfImprovement.generateImprovementReport();
```

## Testing

Run the test suite:
```bash
npm test selfImprovement.test.js
```

Use the test runner programmatically:
```javascript
import testRunner from './utils/testRunner';

// Run all tests
const results = await testRunner.runAllTests();

// Run MCP tests
const mcpResults = await testRunner.runMCPTests();

// Get coverage report
const coverage = testRunner.generateCoverageReport();
```

## Configuration

The protocol initializes with default self-healing patterns for common MCP types:
- `api-mcp`: Circuit breaker pattern
- `websocket-mcp`: Auto-retry pattern
- `database-mcp`: Fallback pattern
- `cache-mcp`: Cache recovery pattern

## Monitoring

Access the Self-Improvement Dashboard by adding it to your application:

```javascript
import SelfImprovementDashboard from './components/views/SelfImprovementDashboard';

// Add to your app
<SelfImprovementDashboard />
```

The dashboard provides:
- Real-time failure tracking
- MCP health status
- Test execution interface
- Coverage reports
- Export/import functionality

## Best Practices

1. **Proactive Failure Handling**: Always use the self-improvement protocol for error handling
2. **Tool Discovery**: When a tool is missing, use discovery rather than manual integration
3. **Test Generation**: Let the system generate regression tests from real failures
4. **Multi-Agent Verification**: Use for critical changes to ensure quality
5. **Monitor Continuously**: Keep the dashboard open during development

## Future Enhancements

- Machine learning for pattern recognition
- Predictive failure prevention
- Automated code generation for fixes
- Integration with external monitoring services
- Advanced visualization of improvement trends