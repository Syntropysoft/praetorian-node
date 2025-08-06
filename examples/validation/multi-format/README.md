# Multi-Format Configuration Examples

This directory demonstrates Praetorian's support for multiple configuration file formats through its modular adapter system.

## 📁 Supported Formats

| Format | Extensions | Description |
|--------|------------|-------------|
| **YAML** | `.yaml`, `.yml` | Human-readable configuration format |
| **JSON** | `.json` | Standard JavaScript object notation |
| **ENV** | `.env`, `env.*` | Environment variable files |
| **TOML** | `.toml` | Tom's Obvious, Minimal Language |
| **INI** | `.ini`, `.cfg`, `.conf` | Classic configuration format |
| **XML** | `.xml` | Extensible Markup Language |
| **Properties** | `.properties` | Java Properties format |
| **HCL** | `.hcl`, `.tf`, `.tfvars` | HashiCorp Configuration Language |
| **PLIST** | `.plist` | Apple Property List format |

## 🚀 Quick Start

### Validate Multiple Formats

```bash
cd examples/validation/multi-format
praetorian validate config.yaml config.json config.toml config.ini config.xml config.properties config.hcl config.plist
```

### Validate Specific Format

```bash
# YAML files
praetorian validate config.yaml config-dev.yaml

# JSON files  
praetorian validate config.json config-dev.json

# TOML files
praetorian validate config.toml config-dev.toml

# INI files
praetorian validate config.ini config-dev.ini

# XML files
praetorian validate config.xml config-dev.xml

# Properties files
praetorian validate config.properties config-dev.properties

# HCL files
praetorian validate config.hcl config-dev.hcl

# PLIST files
praetorian validate config.plist config-dev.plist
```

## 📋 File Examples

All configuration files in this directory contain the same configuration structure in different formats:

- **Database settings**: host, port, name, ssl
- **API settings**: host, port, timeout, debug  
- **Redis settings**: host, port, password
- **Logging settings**: level, format, output

## 🔧 Configuration

Use `praetorian-multi-format.yaml` to define which files to validate:

```yaml
files:
  - config.yaml
  - config.json
  - config.toml
  - config.ini
  - config.xml
  - config.env
  - config.properties
  - config.hcl
  - config.plist

ignore_keys:
  - debug
  - temp
  - password

required_keys:
  - database.host
  - database.port
  - api.host
  - api.port
  - logging.level

environments:
  dev: config-dev.yaml
  prod: config-prod.yaml
  staging: config-staging.yaml
```

## 🎯 Expected Results

When validating files with the same structure, you should see:

```
📊 Validation Results:
✅ All files have consistent keys!

📈 Summary:
  • Files compared: 9
  • Total keys: 12
  • Duration: Xms
```

## 🔍 Adapter Architecture

This demonstrates Praetorian's modular adapter system:

1. **FileAdapterFactory** - Automatically selects the correct adapter
2. **FileReaderService** - Coordinates file reading and validation
3. **Format-specific adapters** - Handle parsing for each format
4. **Unified output** - All formats produce the same ConfigFile structure 