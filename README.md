# SyntropySoft Praetorian 🛡️

> **Guardian of configurations and security** - Universal validation framework for DevSecOps

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Philosophy

**Praetorian** embodies the spirit of the elite Roman guard - protecting, validating, and ensuring the integrity of your systems. Built with **complete transparency** and **exceptional developer experience**, Praetorian is designed to be:

- **🔍 Fully Auditable** - Every line of code is open for inspection
- **🔌 Plug-and-Play** - Extensible architecture with community plugins
- **⚡ Developer-First** - Incredible DX with self-descriptive APIs
- **🛡️ Security-Focused** - Built for DevSecOps and compliance teams

## 🚀 Quick Start

### Installation

```bash
npm install @syntropysoft/praetorian
```

### Basic Usage

```typescript
import { Validator, AuditEngine } from '@syntropysoft/praetorian';

// Create a validator
const validator = new Validator();

// Validate a configuration
const result = await validator.validate({
  config: { /* your config */ },
  plugins: ['security', 'compliance']
});

console.log(result.success ? '✅ Valid' : '❌ Invalid');
```

### CLI Usage

```bash
# Validate a configuration file
praetorian validate config.yaml

# Run a security audit
praetorian audit --security

# Initialize a new project
praetorian init --rules
```

## 🏗️ Architecture

### Core Components

- **Validator** - Main validation engine
- **AuditEngine** - Comprehensive auditing system
- **PluginManager** - Plugin system for extensibility
- **BasePlugin** - Foundation for custom plugins

### Plugin System

```typescript
import { BasePlugin } from '@syntropysoft/praetorian';

class SecurityPlugin extends BasePlugin {
  protected initializeRules() {
    this.addRule({
      id: 'no-secrets-in-code',
      name: 'No Secrets in Code',
      description: 'Detect hardcoded secrets',
      category: 'security',
      severity: 'error',
      enabled: true
    });
  }

  protected async executeRule(rule, config, context) {
    // Your validation logic here
  }
}
```

## 🔌 Available Plugins

### Built-in Plugins
- **Security** - Security best practices and vulnerability detection
- **Compliance** - Regulatory compliance checks
- **Performance** - Performance optimization rules
- **Best Practices** - General development best practices

### Community Plugins
- `@syntropylog/praetorian-plugin-aws` - AWS-specific validations
- `@syntropylog/praetorian-plugin-kubernetes` - Kubernetes configurations
- `@syntropylog/praetorian-plugin-redis` - Redis security and performance

## 🎨 Developer Experience

### Autocomplete Support
```typescript
// Full TypeScript support with autocomplete
const validator = new Validator({
  plugins: ['security'], // ← Autocomplete here
  rules: {
    'no-secrets': true, // ← Autocomplete here
    'ssl-required': false
  }
});
```

### Self-Descriptive APIs
```typescript
// Clear, readable validation results
const result = await validator.validate(config);

if (!result.success) {
  result.errors.forEach(error => {
    console.log(`❌ ${error.message} at ${error.path}`);
  });
}
```

## 🔧 Configuration

### Basic Configuration
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
  ssl-required: true
  password-complexity: true
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

**Praetorian** - Protecting your systems with the vigilance of the elite guard. 🛡️ 