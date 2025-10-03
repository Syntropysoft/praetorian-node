
# Praetorian CLI 🏛️

**Guardian of Configurations** – Universal Validation Framework for DevSecOps  

![npm version](https://img.shields.io/npm/v/@syntropysoft/praetorian)  
![build status](https://img.shields.io/github/actions/workflow/status/Syntropysoft/praetorian/ci.yml)  
![license](https://img.shields.io/npm/l/@syntropysoft/praetorian?color=blue)

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

## 🎉 **ALPHA-3 RELEASE HIGHLIGHTS**

> **🚀 Praetorian CLI v0.0.3-alpha.1 - MAJOR FEATURE RELEASE!**
> 
> **✅ NEW FEATURES & IMPROVEMENTS:**
> - **🏗️ Clean Architecture** - Complete codebase reorganization with SOLID principles
> - **🧪 Robust Testing** - 442 tests passing with comprehensive coverage (100% success rate)
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
> - Schema validation, pattern matching, security rules
> - Advanced plugin system, custom rules, audit engine
> - Advanced validation features mentioned in examples
> 
> **For production use, wait for stable releases (1.0.0+)**

---

## 🚀 Description

Praetorian CLI is a multi-environment configuration validation tool designed for **DevSecOps** teams.  
It ensures that your configuration files remain **consistent across environments** and detects critical differences before production deployments.

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

# Generate empty keys report
praetorian empty-keys [FILES] [OPTIONS]

# Initialize a new configuration file
praetorian init [OPTIONS]

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

### Empty Keys Report

Generate a detailed report of empty keys in your configuration files:

```bash
# Basic empty keys report
praetorian empty-keys

# Environment-specific report
praetorian empty-keys --env dev

# Include actual empty values
praetorian empty-keys --include-values

# Group by file for better organization
praetorian empty-keys --group-by-file

# JSON output for automation
praetorian empty-keys --output json

# CSV output for spreadsheet analysis
praetorian empty-keys --output csv
```

**Output example:**
```
🔍 Empty Keys Report:

📊 Summary:
  • Files analyzed: 9
  • Total empty keys: 5
  • Files with empty keys: 5

📋 Empty Keys List:
  • redis.password [config.yaml]
  • redis.password [config.json]
  • redis.password [config.toml]
  • REDIS_PASSWORD [config.env]
  • redis.password [config.properties]

💡 Recommendations:
  • Review empty keys to ensure they are intentional
  • Consider using environment-specific values for empty keys
  • Add empty keys to ignore list if they are expected
  • Use --include-values to see actual empty values
```

**JSON Output:**
```json
{
  "summary": {
    "totalFiles": 9,
    "totalEmptyKeys": 5,
    "filesWithEmptyKeys": 5
  },
  "emptyKeys": [
    {
      "key": "redis.password",
      "file": "config.yaml",
      "value": "",
      "valueType": "string",
      "message": "Key 'redis.password' has empty value in config.yaml"
    }
  ]
}
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
# Detect API keys, passwords, and other secrets
praetorian validate --security-secrets
```

**Supported Secret Types:**
- **API Keys**: `sk-`, `pk_`, `ak_`, `api_key`
- **JWT Tokens**: `eyJ...`
- **Passwords**: `password: "mypassword123"`
- **Database URLs**: `mysql://user:pass@host/db`

### **🔍 Vulnerability Scanning**
Scan for security vulnerabilities:

```bash
# Scan for weak encryption and insecure protocols
praetorian validate --security-vulnerabilities
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
# Check PCI DSS, GDPR, HIPAA compliance
praetorian validate --security-compliance
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
# Check file permissions
praetorian validate --security-permissions
```

**Permission Rules:**
- **Environment Files**: `.env` → 600 permissions
- **Config Files**: `config.*` → 644 permissions
- **Secret Files**: `*secret*` → 600 permissions
- **Key Files**: `*.key` → 600 permissions

---

## 🧪 Testing & Quality

### **Comprehensive Test Suite**
- **✅ 442 tests passing** across 27 test suites (100% success rate)
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
    praetorian validate
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

## 🧬 **Testing & Quality Improvements v0.0.3-alpha.1**

### **Enhanced Test Coverage**
- **+194 new tests** added (from 248 to 442 total tests)
- **+7 new test suites** for comprehensive validator coverage
- **Permission validation tests** - File permission security validation
- **Enhanced schema validation tests** - Complex nested object and array validation
- **Improved pattern matching tests** - Advanced regex and format validation
- **Extended security tests** - Secret detection and vulnerability scanning

### **Mutation Testing Enhancements**
- **22.40% overall mutation score** (improved from 20.96%)
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

- [x] **Schema validation** - Type checking and pattern matching ✅ **COMPLETED v0.0.3-alpha.1**
- [x] **Security rules** - Detect sensitive data exposure ✅ **COMPLETED v0.0.3-alpha.1**
- [x] **Pattern matching** - Advanced regex and format validation ✅ **COMPLETED v0.0.3-alpha.1**
- [x] **Enhanced testing** - Comprehensive test coverage and mutation testing ✅ **COMPLETED v0.0.3-alpha.1**
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