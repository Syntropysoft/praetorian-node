# Praetorian CLI 🏛️  
**Guardian of Configurations** – Universal Validation Framework for DevSecOps  

[![Go Version](https://img.shields.io/github/go-mod/go-version/syntropysoft/praetorian)](https://golang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Syntropysoft/praetorian/build.yml)](https://github.com/syntropysoft/praetorian/actions)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

---

```
  ____                 _             _                ____ _     ___ 
 |  _ \ _ __ __ _  ___| |_ ___  _ __(_) __ _ _ __    / ___| |   |_ _|
 | |_) | '__/ _` |/ _ \ __/ _ \| '__| |/ _` | '_ \  | |   | |    | | 
 |  __/| | | (_| |  __/ || (_) | |  | | (_| | | | | | |___| |___ | | 
 |_|   |_|  \__,_|\___|\__\___/|_|  |_|\__,_|_| |_|  \____|_____|___|
                                                                     
🛡️  Guardian of Configurations & Security
```

---

## ⚠️ **GO VERSION - ALPHA DEVELOPMENT**

> **🚨 This is the Go version of Praetorian - Currently in development!**
> 
> **✅ CURRENTLY IMPLEMENTED:**
> - **Project structure** - Following Go best practices and SOLID principles
> - **Dependencies setup** - Core libraries for CLI and validation
> - **Modular architecture** - SRP-compliant components (config, parser, auditors)
> - **Core validation engine** - Key comparison logic from Node.js
> - **CLI commands** - Audit command with full functionality
> - **Configuration parsing** - YAML/JSON support
> - **File comparison** - Missing keys and extra keys detection
> 
> **🚧 IN DEVELOPMENT:**
> - Security and compliance auditors (placeholders ready)
> - Performance auditors
> - Additional output formats (JSON/YAML)
> - Plugin system
> 
> **For production use, wait for stable releases (1.0.0+)**

---

## 🚀 Description

Praetorian CLI is a multi-environment configuration validation tool designed for **DevSecOps** teams, now rewritten in **Go** for maximum portability and performance.

**Perfect for:**
- 🏗️ **Microservices architectures** with multiple config files
- 🔄 **Multi-environment deployments** (dev, staging, prod)
- 🛡️ **Security compliance** and configuration drift detection
- 🚀 **CI/CD pipelines** requiring config validation
- 🔧 **Any environment** - Single binary, no dependencies

---

## ✨ Features

- 🛡️ **Multi-file, multi-environment validation** (`dev`, `staging`, `prod`) ✅
- 🔍 **Detects missing keys or inconsistent values** across files ✅
- 📁 **Multi-folder support** - Compare files in different directories ✅
- 🔧 **Framework agnostic** - Works with any tech stack ✅
- 📝 **Simple setup** with `praetorian.yaml` ✅
- 📦 **CI/CD friendly** with proper exit codes ✅
- 🔑 **Supports ignored keys** and future advanced rules ✅
- ⚡ **Single binary** - No dependencies, runs anywhere ✅
- 🏗️ **SOLID architecture** - Modular, testable, extensible ✅

---

## 🔧 Compatible With

- **Configuration Formats**: JSON, YAML, TOML, Properties, INI, HCL, HOCON, XML, .env files
- **Frameworks**: Node.js, .NET (appsettings.json), Python, Java, Go, Rust, Terraform, Consul
- **Environments**: Development, Staging, Production, Testing
- **Architectures**: Monoliths, Microservices, Serverless
- **Platforms**: Docker, Kubernetes, Cloud (AWS, Azure, GCP)

---

## 📦 Installation

### From Source (Development)
```bash
git clone https://github.com/syntropysoft/praetorian.git
cd praetorian/praetorian-go
go build ./cmd/praetorian
./praetorian --version
```

### From Binary (Future Releases)
```bash
# Download for your platform
curl -L https://github.com/syntropysoft/praetorian/releases/latest/download/praetorian-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m) -o praetorian
chmod +x praetorian
./praetorian --version
```

### Via Go Install (Future)
```bash
go install github.com/syntropysoft/praetorian@latest
praetorian --version
```

---

## 🚀 Quick Start

### 1. Create Configuration
Create a `praetorian.yaml` file:
```yaml
files:
  - config-dev.yaml
  - config-prod.yaml
  - config-staging.yaml

ignore_keys:
  - app.debug
  - app.port
  - database.host
```

### 2. Run Audit
```bash
# Basic audit
./praetorian audit

# With specific config and path
./praetorian audit --config praetorian.yaml --path ./configs

# Security audit only
./praetorian audit --type security
```

### 3. Example Output
```
🔒 Starting Praetorian Audit...
✅ Audit completed successfully!
📊 Duration: 1.58625ms
🎯 Success: false
❌ Errors: 22
   • Key 'security.cors' is missing in config-dev.toml
   • Key 'database.url' is missing in config-dev.properties
⚠️  Warnings: 11
   • Key 'database.url' is only present in config-prod.toml
📁 Files compared: 3
🔑 Total keys: 31
```

### 4. Supported Formats

Praetorian supports multiple configuration formats:

- **YAML** (`.yaml`, `.yml`) - Human-readable, hierarchical
- **JSON** (`.json`) - Standard, widely supported
- **TOML** (`.toml`) - Simple, readable (Rust projects)
- **Properties** (`.properties`) - Java-style key-value pairs
- **INI** (`.ini`) - Simple sections and key-value pairs (Windows)
- **HCL** (`.hcl`) - HashiCorp Configuration Language (Terraform, Consul)
- **HOCON** (`.conf`) - Human-Optimized Config Object Notation (Akka, Play)
- **XML** (`.xml`) - Structured markup (legacy systems)
- **Environment** (`.env`) - Simple key-value pairs

---

## ⚙️ Basic Configuration

Create a `praetorian.yaml` file:

```yaml
files:
  - config-dev.yaml
  - config-prod.yaml
  - config-staging.yaml
```

---

## 🏗️ Project Structure

```
praetorian-go/
├── cmd/praetorian/          # Main CLI entry point
├── internal/                # Private application code
│   ├── core/               # Core components
│   │   ├── config/         # Configuration loading (SRP)
│   │   ├── parser/         # File parsing (SRP)
│   │   └── auditors/       # Audit engines (SRP)
│   └── cli/                # CLI commands and logic
├── pkg/                    # Public APIs and libraries
│   └── types/              # Common types and interfaces
├── examples/               # Usage examples (from Node.js)
├── go.mod                  # Go module definition
└── README.md               # This file
```

### 🏛️ Architecture (SOLID Principles)

- **Single Responsibility**: Each component has one clear purpose
  - `adapters.FileReader`: Abstract file system operations
  - `adapters.ConfigParser`: Parse different file formats (YAML, JSON, TOML, Properties, XML)
  - `adapters.FileFinder`: Find configuration files
  - `services.FileService`: Orchestrate adapters
  - `auditors.KeyAuditor`: Compare keys between configurations
  - `core.Auditor`: Orchestrate the audit process

- **Open/Closed**: Easy to extend with new parsers and auditors
- **Dependency Inversion**: Components depend on interfaces, not concrete implementations
- **Adapter Pattern**: Clean separation between I/O and business logic

---

## 🧪 Development

### Prerequisites
- Go 1.21 or later

### Build
```bash
go build ./cmd/praetorian
```

### Test
```bash
go test ./...
```

### Run
```bash
./praetorian --help
```

---

## 🔄 Migration from Node.js

### Why Go?
- **Portability**: Single binary, no Node.js dependency
- **Performance**: Faster execution, lower memory usage
- **CI/CD Friendly**: Works in any environment
- **SOLID Architecture**: Better maintainability and extensibility

### Compatibility
- ✅ **Same configuration format** (`praetorian.yaml`)
- ✅ **Same validation logic** (key comparison)
- ✅ **Same output format** (errors and warnings)
- ✅ **Same examples** (compatible with Node.js examples)

### Migration Path
```bash
# Old (Node.js)
npm install -g @syntropysoft/praetorian
praetorian validate

# New (Go)
./praetorian audit --config praetorian.yaml
```

**No changes needed to your configuration files!** 🎉

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

- 📧 Email: support@syntropysoft.com
- 🐛 Issues: [GitHub Issues](https://github.com/syntropysoft/praetorian/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/syntropysoft/praetorian/wiki)

---

**Made with ❤️ by [SyntropySoft](https://syntropysoft.com)** 