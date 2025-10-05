
# Praetorian CLI 🏛️

**Guardian of Configurations** – Universal Validation Framework for DevSecOps

> ⚠️ **NOTICE**: This is an **ALPHA** release. While thoroughly tested with 991+ tests and 38.32% mutation score, it's still under active development. Use in production with caution.

> 🚀 **LATEST**: v0.0.4-alpha with **Pipeline Mode** support for CI/CD integration!  

![npm version](https://img.shields.io/npm/v/@syntropysoft/praetorian)  
![license](https://img.shields.io/npm/l/@syntropysoft/praetorian?color=blue)  
![build status](https://img.shields.io/github/actions/workflow/status/Syntropysoft/praetorian/ci.yml)  
![CodeQL](https://github.com/Syntropysoft/praetorian/workflows/CodeQL/badge.svg)  
![Dependabot](https://api.dependabot.com/badges/status?dependency-manager=npm&package-manager=npm)  
![Mutation Score](https://img.shields.io/badge/mutation%20score-38.32%25-brightgreen)  
![Test Coverage](https://img.shields.io/badge/test%20coverage-1201%20tests-brightgreen)  
![Bundle Size](https://img.shields.io/bundlephobia/min/@syntropysoft/praetorian)  
![Production Ready](https://img.shields.io/badge/production%20ready-alpha-orange)

---

```text
  ____                 _             _                ____ _     ___ 
 |  _ \ _ __ __ _  ___| |_ ___  _ __(_) __ _ _ __    / ___| |   |_ _|
 | |_) | '__/ _` |/ _ \ __/ _ \| '__| |/ _` | '_ \  | |   | |    | | 
 |  __/| | | (_| |  __/ || (_) | |  | | (_| | | | | | |___| |___ | | 
 |_|   |_|  \__,_|\___|\__\___/|_|  |_|\__,_|_| |_|  \____|_____|___|
                                                                     
🛡️  Guardian of Configurations & Security
```

---

## 🎉 **ALPHA-4 RELEASE HIGHLIGHTS**

> **🚀 Praetorian CLI v0.0.4-alpha - PIPELINE MODE RELEASE!**
> 
> **✅ NEW FEATURES & IMPROVEMENTS:**
> - **🏗️ Clean Architecture** - Complete codebase reorganization with SOLID principles
> - **🧪 Robust Testing** - 557 tests passing with comprehensive coverage (100% success rate)
> - **🧬 Mutation Testing** - 22.40% mutation score with improved test quality
> - **📦 Optimized Dependencies** - 36 unnecessary packages removed (66% reduction)
> - **🔧 Enhanced Build System** - Improved TypeScript compilation and error handling
> - **📚 Professional Documentation** - Complete English documentation with working examples
> - **🎯 Perfect Example** - Ready-to-use example that demonstrates best practices
> - **🛡️ Plugin System** - Functional plugin architecture for extensibility
> - **⚡ Performance Improvements** - Faster validation and better error handling
> - **🧹 Automatic Cleanup** - Smart temporary file management
> - **🔍 Advanced Validation** - Improved key comparison and structure validation
> - **🎨 Declarative Programming** - Functional patterns with 100% mutation score
> - **🔧 Multi-Format Support** - 9 file formats supported with clean adapters
> - **🔒 Schema Validation** - NEW! JSON Schema validation with type checking and pattern matching
> - **🎯 Pattern Matching** - NEW! Advanced pattern validation (email, URL, UUID, regex)
> - **🛡️ Security Rules** - NEW! Secret detection, vulnerability scanning, and compliance checking
> - **🔐 Secret Detection** - NEW! Detect exposed API keys, passwords, and sensitive data
> - **🔍 Vulnerability Scanning** - NEW! Scan for weak encryption, SQL injection, XSS vulnerabilities
> - **📋 Compliance Checking** - NEW! PCI-DSS, GDPR, HIPAA, SOX, ISO 27001 compliance validation
> - **🚀 Pipeline Mode** - NEW! CI/CD friendly output with --pipeline flag for automated workflows
> - **📊 Dual Output Modes** - User-friendly detailed output + concise pipeline output
> - **🔧 DevSecOps Integration** - Ready for Jenkins, GitHub Actions, Dockerfile, and Makefile integration
> - **🔧 Permission Validation** - NEW! File permission validation for security-sensitive files
> 
> **✅ CORE FEATURES (All Working):**
> - **CLI with professional banner** - Beautiful ASCII art with security colors
> - **Key comparison** - Compare keys across multiple configuration files (JSON/YAML/ENV/TOML/INI/XML/Properties/HCL/PLIST)
> - **Multi-folder support** - Works with files in different directories
> - **C# compatibility** - Supports appsettings.json and other .NET configurations
> - **Configuration file** - `praetorian.yaml` for defining files to compare
> - **Exit codes** - Proper exit codes for CI/CD integration
> - **Missing file detection** - Automatically create empty structure files for missing configurations
> - **Required keys validation** - Ensure mandatory configuration keys are present
> - **Environment mapping** - Support for environment-specific configuration files
> 
> **🚧 COMING IN FUTURE RELEASES:**
> - JSON/HTML reports for CI/CD
> - Improved mutation score (50%+ target)
> - Custom rule plugins & audit engine
> - Secret management integrations (AWS/Azure/GCP)
> - Performance optimizations (parallel processing)
> 
> **For production use, wait for stable releases (1.0.0+)**

---

## ✅ Feature Checklist (At a Glance)

### Available
- [x] Multi-format adapters: JSON, YAML, .env, TOML, INI, XML, Properties, HCL, PLIST
- [x] Key comparison and required keys validation
- [x] Environment mapping and auto-create for missing files
- [x] Declarative Rule System: core/local/custom ruleSets, overrides, and customRules
- [x] DevSecOps template (`praetorian init --devsecops`) with environment-specific sources
- [x] Security features: secret detection, vulnerability scanning, compliance checks
- [x] Permission validation for security-sensitive files
- [x] Functional validation engine (pure functions, guard clauses)
- [x] Plugin system (loader, manager, health checks)
- [x] CLI commands: `init`, `validate`
- [x] 557 tests across 34 suites; mutation testing configured (22.40%)

### Planned
- [ ] JSON/HTML reports for CI/CD
- [ ] Improved mutation score (50%+ target)
- [ ] Custom rule plugins & audit engine
- [ ] Secret management integrations (AWS/Azure/GCP)
- [ ] Performance optimizations (parallel processing)

---

## 🚀 Description

### Concept Overview

- **Schema Validation**: Validates objects against a JSON-like schema (types, required fields, ranges, nested structures). Designed for fast, pure-functional checks with clear error codes.
- **Pattern Matching**: Validates strings using known formats (email, URL, UUID, semver) and custom regex patterns; supports warnings or errors via rule severity.
- **Security Rules**: Detects secrets, weak constructs and compliance issues via rule sets; configurable by environment with guard-clause based evaluators.
- **Permission Validation**: Checks file permissions by file type and provides recommended secure modes (e.g., .env → 600, config.* → 644).
- **Rule Loader & Dictionary**: Loads rules from core/local/remote sources, deduplicates by unique ID, supports overrides and user-defined custom rules.
- **DevSecOps Rule Connector**: Declarative source selection per environment; merges, overrides and disables rules deterministically; CI/CD friendly.

Praetorian CLI is a multi-environment configuration validation tool designed for **DevSecOps** teams.
It ensures that your configuration files remain **consistent across environments**, enables **declarative rule sets**, and integrates seamlessly with **CI/CD pipelines**.

**Perfect for:**
- 🏗️ **Microservices architectures** with multiple config files
- 🔄 **Multi-environment deployments** (dev, staging, prod)
- 🛡️ **Security compliance** and configuration drift detection
- 🚀 **CI/CD pipelines** requiring config validation
- 📝 **Development workflow** - Auto-create missing configuration structures

---

## ✨ Features

- 🛡️ **Multi-file, multi-environment validation** (`dev`, `staging`, `prod`)
- 🔍 **Detects missing keys or inconsistent values** across files
- 📁 **Multi-folder support** - Compare files in different directories
- 🔧 **Framework agnostic** - Works with any tech stack
- 📝 **Simple setup** with `praetorian.yaml`
- 📦 **CI/CD friendly** with proper exit codes
- 🔑 **Supports ignored keys** and required keys validation
- 🆕 **Auto-create missing files** - Generate empty structure files for missing configurations
- 🌍 **Environment mapping** - Validate specific environments or all environments

---

## 🔧 Compatible With

- **Configuration Formats**: JSON, YAML, .env, TOML, INI, XML files
- **Frameworks**: Node.js, .NET (appsettings.json), Python, Java, Go, Rust
- **Environments**: Development, Staging, Production, Testing
- **Architectures**: Monoliths, Microservices, Serverless
- **Platforms**: Docker, Kubernetes, Cloud (AWS, Azure, GCP)

---

## 📁 Supported File Formats

Praetorian supports multiple configuration file formats through its modular adapter system:

| Format | Extensions | Status | Notes |
|--------|------------|--------|-------|
| **JSON** | `.json` | ✅ Full Support | Native support with nested object validation |
| **YAML** | `.yaml`, `.yml` | ✅ Full Support | Supports anchors, aliases, and complex structures |
| **Environment** | `.env`, `env.*` | ✅ Full Support | Key-value pairs with type inference |
| **TOML** | `.toml` | ✅ Full Support | Table-based configuration format |
| **INI** | `.ini`, `.cfg`, `.conf` | ✅ Full Support | Section-based configuration |
| **XML** | `.xml` | ✅ Full Support | Nested element validation |
| **Properties** | `.properties` | ✅ Full Support | Java-style properties with multiple separators |
| **HCL** | `.hcl`, `.tf`, `.tfvars` | ✅ Full Support | HashiCorp Configuration Language |
| **PLIST** | `.plist` | ✅ Full Support | Apple Property List format |

## ✅ Recent Fixes

### PLIST File Adapter - Bug Fixed! 🎉

**Issue:** Complex nested structures with arrays containing objects were not fully supported.

**Status:** ✅ **FIXED** - The `PlistFileAdapterV2` now correctly handles complex array structures.

**What was fixed:**
- ✅ **Simple arrays** work correctly: `<array><string>item1</string><string>item2</string></array>`
- ✅ **Nested dictionaries** work correctly: `<dict><key>nested</key><dict>...</dict></dict>`
- ✅ **Arrays with objects** now work perfectly: `<array><dict>...</dict><dict>...</dict></array>`

**Example of now-working structure:**
```xml
<dict>
    <key>configs</key>
    <array>
        <dict>
            <key>debug</key>
            <true/>
            <key>env</key>
            <string>dev</string>
        </dict>
        <dict>
            <key>debug</key>
            <false/>
            <key>env</key>
            <string>prod</string>
        </dict>
    </array>
</dict>
```

**Result:** `{ configs: [{ debug: true, env: 'dev' }, { debug: false, env: 'prod' }] }` ✅

**Technical Details:** The fix involved properly handling the `currentKey` storage in the `PlistStateManager` when processing arrays, ensuring that arrays are correctly associated with their parent dictionary keys.

---

## 🚀 Quick Start

```yaml
# config.yaml
database:
  host: localhost
  port: 5432
```

### DevSecOps Quick Start (NEW)

```bash
# Generate DevSecOps template
praetorian init --devsecops --config praetorian.yaml

# Validate by environment
praetorian validate --env dev --config praetorian.yaml
praetorian validate --env prod --config praetorian.yaml
```

```json
// config.json
{
  "database": {
    "host": "localhost",
    "port": 5432
  }
}
```

```toml
# config.toml
[database]
host = "localhost"
port = 5432
```

```ini
# config.ini
[database]
host=localhost
port=5432
```

```xml
<!-- config.xml -->
<config>
  <database>
    <host>localhost</host>
    <port>5432</port>
  </database>
</config>
```

---

## 📦 Installation

```bash
npm install -g @syntropysoft/praetorian
```

**Prerequisites:**
- Node.js 18+ (recommended: use [NVM](https://github.com/nvm-sh/nvm))
- npm or yarn

---

## ⚙️ Basic Configuration

Create a `praetorian.yaml` file:

```yaml
files:
  - config-dev.yaml
  - config-prod.yaml
  - config-staging.yaml

ignore_keys:
  - debug
  - temp

required_keys:
  - database.host
  - database.port
  - api.version
  - api.port

environments:
  dev: config-dev.yaml
  prod: config-prod.yaml
  staging: config-staging.yaml
```

---

## 🛠️ Usage

### Available Commands

```bash
# Validate configuration files for key consistency
praetorian validate [FILES] [OPTIONS]

# Initialize a new configuration file
praetorian init [OPTIONS]

# Generate DevSecOps configuration template
praetorian init --devsecops [--config devsecops.yaml]

```

### Basic Validation

Validate that all configuration files have matching keys:

```bash
praetorian validate
```

**Output example:**
```
📊 Validation Results:
✅ All configuration files are consistent!
📈 Summary:
  • Files compared: 3
  • Total keys: 15
  • Duration: 2ms
```

**In case of differences:**
```
❌ Key inconsistencies found:
  • Key 'database.url' is missing in config-staging.yaml
  • Key 'api.timeout' is missing in config-dev.yaml
```

### Environment-Specific Validation

Validate a specific environment:

```bash
praetorian validate --env dev
```

Validate all environments:

```bash
praetorian validate --all
```

### Missing File Detection

When files are missing, Praetorian automatically creates empty structure files:

```
⚠️  Missing files detected: config-staging.yaml
💡 Creating empty structure files...
✅ Created 1 empty structure file(s)
```

The created file will have the structure based on `required_keys`:

```yaml
# config-staging.yaml (auto-created)
database:
  host: null
  port: null
api:
  version: null
  port: null
```

### Rule System (NEW)

Praetorian uses a declarative, unified, and extensible rule system.

Concepts:
- **ruleSets**: list of rule sources to load (core/local/remote)
- **overrideRules**: override properties by `id` (e.g., `severity`)
- **customRules**: additional user-defined rules

Minimal `praetorian.yaml` example:

```yaml
ruleSets:
  - "@praetorian/core/all"
  - "./rules/structure.yaml"
  - "./rules/security.yaml"

overrideRules:
  - id: "version-format"
    severity: "warning"

customRules:
  - id: "team-tag-required"
    name: "Team Tag Required"
    description: "Every config must include team tag"
    type: "structure"
    severity: "error"
    enabled: true
    category: "governance"
    requiredProperties: ["metadata.team"]
```

---

## 📋 Examples

### 🎯 **Quick Examples**

#### Example 1: Basic Configuration Files

```yaml
# config-dev.yaml
app:
  name: my-app
  debug: true
  port: 3000

database:
  host: localhost
  port: 5432
```

```yaml
# config-prod.yaml
app:
  name: my-app
  port: 80

database:
  host: prod-db.example.com
  port: 5432
  url: postgresql://user:pass@prod-db.example.com:5432/db
```

#### Example 2: C# appsettings.json

```json
// apps/web/appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=WebApp;"
  },
  "AppSettings": {
    "ApiKey": "web-api-key-12345",
    "BaseUrl": "https://web.example.com"
  }
}
```

#### Example 3: Multi-folder Structure

```yaml
# praetorian.yaml
files:
  - configs/frontend/app.config.json
  - configs/backend/app.config.json
  - apps/web/appsettings.json
  - apps/api/appsettings.json

ignore_keys:
  - debug
  - Logging
  - AllowedHosts

required_keys:
  - database.host
  - api.port
  - logging.level
```

#### Example 4: Environment Mapping

```yaml
# environments.yaml
dev: config-dev.yaml
staging: config-staging.yaml
production: config-prod.yaml
```

```bash
# Validate specific environment
praetorian validate --environments environments.yaml --env dev

# Validate all environments
praetorian validate --environments environments.yaml --all
```

### 📚 **Complete Examples**

Check out our **[examples directory](./examples/validation/)** for comprehensive examples:

- **[Perfect Example](./examples/validation/perfect-example/)** - **NEW!** Complete working example with consistent structure
- **[Missing Files Demo](./examples/validation/missing-files-demo/)** - **NEW!** Automatic file creation demonstration
- **[YAML Examples](./examples/validation/yaml/)** - Basic YAML configuration validation
- **[JSON Examples](./examples/validation/json/)** - JSON configuration files
- **[ENV Examples](./examples/validation/env/)** - Environment file validation
- **[.NET Examples](./examples/validation/dotnet/)** - C# appsettings.json and multi-folder validation

Each example includes:

---

## 🔒 **NEW: Advanced Security Features**

### **🛡️ Secret Detection**
Detect exposed sensitive data in configuration files:

```bash
# Run validation (secrets detection is enabled via ruleSets)
praetorian validate --config praetorian.yaml
```

**Supported Secret Types:**
- **API Keys**: `sk-`, `pk_`, `ak_`, `api_key`
- **JWT Tokens**: `eyJ...`
- **Passwords**: `password: "mypassword123"`
- **Database URLs**: `mysql://user:pass@host/db`

### **🔍 Vulnerability Scanning**
Scan for security vulnerabilities:

```bash
# Run validation (vulnerability checks are enabled via ruleSets)
praetorian validate --config praetorian.yaml
```

**Detected Vulnerabilities:**
- **Weak Encryption**: MD5, SHA1, DES, RC4
- **Insecure Protocols**: HTTP, FTP, Telnet
- **Weak Credentials**: Default passwords, short passwords
- **SQL Injection**: String interpolation in queries
- **XSS**: innerHTML with interpolation

### **📋 Compliance Checking**
Verify compliance with security standards:

```bash
# Run validation (compliance checks are enabled via ruleSets)
praetorian validate --config praetorian.yaml
```

**Supported Standards:**
- **PCI DSS**: Credit card data encryption
- **GDPR**: Personal data protection
- **HIPAA**: Health information access control
- **SOX**: Financial data controls
- **ISO 27001**: Information security management

### **🔧 Permission Validation**
Validate file permissions for security:

```bash
# Run validation (permission checks are enabled via ruleSets)
praetorian validate --config praetorian.yaml
```

**Permission Rules:**
- **Environment Files**: `.env` → 600 permissions
- **Config Files**: `config.*` → 644 permissions
- **Secret Files**: `*secret*` → 600 permissions
- **Key Files**: `*.key` → 600 permissions

---

## 🧪 Testing & Quality

### **Comprehensive Test Suite**
- **✅ 557 tests passing** across 34 test suites (100% success rate)
- **✅ Unit tests** for all core functionality
- **✅ Integration tests** for end-to-end validation
- **✅ Mutation testing** configured with Stryker (22.40% mutation score)
- **✅ Coverage reporting** for quality assurance
- **✅ Schema validation tests** for new JSON Schema functionality
- **✅ Pattern matching tests** for regex and format validation
- **✅ Security validation tests** for secret detection and vulnerability scanning
- **✅ Permission validation tests** for file security and access control

### **Test Coverage Highlights**
- **100% coverage** on core validation logic
- **100% coverage** on plugin management
- **100% coverage** on environment management
- **97% coverage** on utility functions
- **86% coverage** on validation rules
- **100% mutation score** on declarative programming patterns

### **Mutation Testing Improvements**
- **FormatValidator**: 72.00% mutation score (improved from 61.14%)
- **PermissionValidator**: 39.16% mutation score (improved from 0%)
- **SchemaValidator**: 25.74% mutation score (improved from 23.53%)
- **SecretDetector**: 22.66% mutation score (improved from 12.32%)
- **Overall Project**: 22.40% mutation score (improved from 20.96%)

### **Running Tests**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run mutation tests
npm run test:mutation

# Run integration tests only
npm run test:integration

# Run mutation tests
npm run test:mutation
```

### **Quality Metrics**
- **Clean Architecture** - SOLID principles applied
- **Functional Programming** - Pure functions and immutability
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Comprehensive error management
- **Performance** - Optimized for speed and efficiency
- Sample configuration files
- `praetorian.yaml` setup
- Expected validation results
- Common use cases

---

## 🧩 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Validate Configurations
  run: |
    npm install -g @syntropysoft/praetorian
    praetorian validate --config praetorian.yaml
```

### GitLab CI Example

```yaml
validate_configs:
  stage: test
  script:
    - npm install -g @syntropysoft/praetorian
    - praetorian validate
```

---

## 🧬 **Testing & Quality Improvements v0.0.4-alpha**

### **Enhanced Test Coverage**
- **+315 new tests** added (from 242 to 557 total tests)
- **+7 new test suites** → **34 suites** en total
- **Permission validation tests** - File permission security validation
- **Enhanced schema validation tests** - Complex nested object and array validation
- **Improved pattern matching tests** - Advanced regex and format validation
- **Extended security tests** - Secret detection and vulnerability scanning

### **Mutation Testing Enhancements**
- **22.40% overall mutation score**
- **FormatValidator**: 72.00% mutation score (+10.86% improvement)
- **PermissionValidator**: 39.16% mutation score (new coverage from 0%)
- **SchemaValidator**: 25.74% mutation score (+2.21% improvement)
- **SecretDetector**: 22.66% mutation score (+10.34% improvement)

### **Test Organization**
- **Hierarchical test structure** - Tests organized by architectural layers
- **Domain tests** - Core business logic validation
- **Application tests** - Service and orchestrator validation
- **Infrastructure tests** - Adapter and plugin validation
- **Integration tests** - End-to-end workflow validation

---

## 🗺️ Roadmap

- [x] **Schema validation** - Type checking and pattern matching ✅ **COMPLETED v0.0.4-alpha**
- [x] **Security rules** - Detect sensitive data exposure ✅ **COMPLETED v0.0.4-alpha**
- [x] **Pattern matching** - Advanced regex and format validation ✅ **COMPLETED v0.0.4-alpha**
- [x] **Enhanced testing** - Comprehensive test coverage and mutation testing ✅ **COMPLETED v0.0.4-alpha**
- [x] **Pipeline Mode** - CI/CD friendly output with --pipeline flag ✅ **COMPLETED v0.0.4-alpha**
- [ ] **JSON/HTML reports** - Detailed validation reports
- [ ] **Improved mutation score** - Target 50%+ mutation score for production readiness
- [ ] **Custom rule plugins** - Extensible validation system
- [ ] **Secret management integration** - AWS Secrets Manager, Azure Key Vault
- [ ] **Performance optimization** - Parallel processing for large configs

---

## 🏢 About SyntropySoft

**Praetorian CLI** is proudly developed by **[SyntropySoft](https://syntropysoft.com)** - Your trusted partner in DevSecOps solutions.

### Our Products

- 🔍 **[SyntropyLog](https://github.com/Syntropysoft/syntropylog)** - Advanced logging and monitoring platform
- 🎨 **[SyntropyFront](https://github.com/Syntropysoft/syntropyfront)** - Modern frontend development framework
- 🛡️ **[Praetorian CLI](https://github.com/Syntropysoft/praetorian)** - Configuration validation framework *(you are here)*

### Connect With Us

- 🌐 **[Website](https://syntropysoft.com)**
- 📧 **[Contact](mailto:gabriel70@gmail.com)**
- 💼 **[LinkedIn](https://www.linkedin.com/in/gabriel-alejandro-gomez-652a5111/)**

---

## 📜 License

Apache 2.0 © [SyntropySoft](https://syntropysoft.com)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Star us on GitHub** ⭐ - It helps a lot!