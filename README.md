<p align="center">
  <img src="assets/pretorian2.png" alt="Praetorian Logo" width="170"/>
</p>

# SyntropySoft Praetorian 🛡️

> **Guardian of configurations and security** - Universal validation framework for DevSecOps

## ⚠️ **ALPHA VERSION WARNING**

> **🚨 This is an ALPHA version (0.0.1-alpha.1) - Use at your own risk!**
> 
> - **Not production ready** - This version is for testing and feedback only
> - **API may change** - Breaking changes are expected in future releases
> - **Limited features** - Core functionality is implemented but may have bugs
> - **Testing phase** - Please report issues and provide feedback
> 
> **For production use, wait for stable releases (1.0.0+)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Philosophy

**Praetorian** embodies the spirit of the elite Roman guard - protecting, validating, and ensuring the integrity of your configuration files. Built with **complete transparency** and **exceptional developer experience**, Praetorian is designed to be:

- **🔍 Configuration Validator** - Validate YAML, JSON, and ENV files with custom rules
- **🔌 Rule-Based System** - Create and share validation rules for your infrastructure
- **⚡ Developer-First** - Simple APIs for configuration validation
- **🛡️ Security-Focused** - Built for DevSecOps and compliance teams

## 🚀 Quick Start

### Installation

```bash
npm install @syntropysoft/praetorian
```

### Basic Usage

```typescript
import { Validator } from '@syntropysoft/praetorian';

// Create a validator with custom rules
const validator = new Validator({
  plugins: ['security', 'compliance'],
  rules: {
    'no-secrets': true,
    'required-fields': true,
    'format-validation': true
  }
});

// Validate a YAML configuration file
const result = await validator.validate({
  config: { /* your config object */ },
  context: {
    config: { /* config object */ },
    environment: 'production',
    project: 'my-app',
    timestamp: new Date(),
    metadata: {}
  }
});

console.log(result.success ? '✅ Configuration Valid' : '❌ Configuration Invalid');
```

### CLI Usage

```bash
# Validate a configuration file
praetorian validate config.yaml

# Validate with specific rules
praetorian validate config.yaml --rules security,compliance

# Run a comprehensive audit
praetorian audit --security --compliance

# Check specific configuration aspects
praetorian check --env --yaml --json
```

## 🏗️ Configuration Validation Framework

### Supported File Types

- **YAML** - Configuration files, Kubernetes manifests, Docker Compose
- **JSON** - Package.json, configuration objects, API specs
- **ENV** - Environment variables, .env files
- **Custom** - Extensible for any configuration format

### Core Components

- **Validator** - Main validation engine for configuration files
- **AuditEngine** - Comprehensive configuration auditing
- **PluginManager** - Rule-based plugin system
- **BasePlugin** - Foundation for custom validation rules

## 🔌 Rule-Based Validation System

### Built-in Rules

```typescript
// Security Rules
const securityRules = {
  'no-secrets-in-code': {
    description: 'Detect hardcoded secrets in configuration',
    severity: 'error',
    validate: (config) => {
      // Check for API keys, passwords, tokens
    }
  },
  'required-security-headers': {
    description: 'Ensure security headers are configured',
    severity: 'warning',
    validate: (config) => {
      // Validate security headers
    }
  }
};

// Compliance Rules
const complianceRules = {
  'required-fields': {
    description: 'Ensure all required fields are present',
    severity: 'error',
    validate: (config) => {
      // Check required fields
    }
  },
  'format-validation': {
    description: 'Validate configuration format',
    severity: 'warning',
    validate: (config) => {
      // Validate format
    }
  }
};
```

### Custom Rules

```typescript
import { BasePlugin } from '@syntropysoft/praetorian';

class CustomValidationPlugin extends BasePlugin {
  protected initializeRules() {
    this.addRule({
      id: 'custom-yaml-structure',
      name: 'Custom YAML Structure Validation',
      description: 'Validate specific YAML structure for your project',
      category: 'custom',
      severity: 'error',
      enabled: true
    });
  }

  protected async executeRule(rule, config, context) {
    // Your custom validation logic here
    if (rule.id === 'custom-yaml-structure') {
      // Validate your specific YAML structure
      return this.validateYamlStructure(config);
    }
  }

  private validateYamlStructure(config) {
    // Custom validation logic
    const errors = [];
    
    // Example: Check if required sections exist
    if (!config.database) {
      errors.push({
        code: 'MISSING_DATABASE_SECTION',
        message: 'Database configuration section is required',
        severity: 'error'
      });
    }

    return {
      success: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
```

## 📋 Configuration Examples

### YAML Configuration Validation

```yaml
# config.yaml
database:
  host: localhost
  port: 5432
  name: myapp
  credentials:
    username: admin
    password: ${DB_PASSWORD}  # ✅ Good: Using environment variable

security:
  cors:
    origin: ["https://myapp.com"]
    credentials: true
  headers:
    x-frame-options: DENY
    x-content-type-options: nosniff

logging:
  level: info
  format: json
  output: stdout
```

### Validation Rules for YAML

```typescript
const yamlRules = {
  'database-credentials': {
    description: 'Database credentials must use environment variables',
    validate: (config) => {
      const errors = [];
      if (config.database?.credentials?.password && 
          !config.database.credentials.password.startsWith('${')) {
        errors.push({
          code: 'HARDCODED_PASSWORD',
          message: 'Database password should use environment variable',
          path: 'database.credentials.password'
        });
      }
      return { success: errors.length === 0, errors };
    }
  },
  'security-headers': {
    description: 'Required security headers must be present',
    validate: (config) => {
      const requiredHeaders = ['x-frame-options', 'x-content-type-options'];
      const errors = [];
      
      requiredHeaders.forEach(header => {
        if (!config.security?.headers?.[header]) {
          errors.push({
            code: 'MISSING_SECURITY_HEADER',
            message: `Missing required security header: ${header}`,
            path: `security.headers.${header}`
          });
        }
      });
      
      return { success: errors.length === 0, errors };
    }
  }
};
```

### ENV File Validation

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=${API_KEY_SECRET}
NODE_ENV=production
PORT=3000
```

### JSON Configuration Validation

```json
{
  "app": {
    "name": "my-application",
    "version": "1.0.0",
    "environment": "production"
  },
  "database": {
    "url": "${DATABASE_URL}",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "security": {
    "jwt": {
      "secret": "${JWT_SECRET}",
      "expiresIn": "24h"
    }
  }
}
```

## 🎯 Integration Examples

### CI/CD Pipeline Integration

```yaml
# .github/workflows/validate-config.yml
name: Validate Configuration
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Praetorian
        run: npm install @syntropysoft/praetorian
      
      - name: Validate Configuration
        run: |
          praetorian validate config.yaml --rules security,compliance
          praetorian validate .env --rules env-validation
          praetorian validate package.json --rules json-structure
```

### Local Development

```bash
# Pre-commit validation
praetorian validate config.yaml --strict

# Development environment check
praetorian check --env dev --yaml config-dev.yaml

# Production readiness audit
praetorian audit --security --compliance --performance
```

## 🔧 Configuration

### Praetorian Configuration File

```yaml
# praetorian.yaml
plugins:
  - name: security
    enabled: true
    config:
      max-severity: error
  - name: compliance
    enabled: true
    config:
      standards: [SOC2, ISO27001]

rules:
  no-secrets-in-code: true
  required-fields: true
  format-validation: true
  custom-yaml-structure: true

validation:
  strict: false
  fail-fast: false
  output-format: pretty
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in development mode
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/syntropysoft/praetorian.git
cd praetorian
npm install
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🏛️ Part of the SyntropySoft Ecosystem

- **[SyntropyLog](https://github.com/syntropysoft/syntropylog)** - Backend observability framework
- **[SyntropyFront](https://github.com/syntropysoft/syntropyfront)** - Frontend observability
- **[Praetorian](https://github.com/syntropysoft/praetorian)** - Configuration validation and security

---

**Praetorian** - Protecting your configurations with the vigilance of the elite guard. 🛡️ 