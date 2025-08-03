# Praetorian Validation Examples

This directory contains practical examples of how to use Praetorian CLI to validate configuration files across different formats and environments.

## 📁 Structure

```
validation/
├── yaml/          # YAML configuration examples
├── json/          # JSON configuration examples
├── env/           # Environment file examples
├── dotnet/        # .NET appsettings.json examples
└── README.md      # This file
```

## 🚀 Quick Start

### 1. YAML Validation

```bash
cd examples/validation/yaml
praetorian validate
```

**Expected Output:**
```
❌ Key inconsistencies found:
  • Key 'database.url' is missing in config-dev.yaml
  • Key 'security' is missing in config-dev.yaml
  • Key 'security' is missing in config-staging.yaml
  • Key 'monitoring' is missing in config-dev.yaml
  • Key 'monitoring' is missing in config-prod.yaml

⚠️  8 warning(s):
  • Key 'app.debug' is only present in config-dev.yaml
  • Key 'logging.file_path' is only present in config-prod.yaml
  • Key 'security.cors' is only present in config-prod.yaml
  • Key 'monitoring.metrics' is only present in config-staging.yaml
```

### 2. JSON Validation

```bash
cd examples/validation/json
praetorian validate
```

**Expected Output:**
```
❌ Key inconsistencies found:
  • Key 'database.url' is missing in config-dev.json
  • Key 'security' is missing in config-dev.json
  • Key 'security' is missing in config-staging.json
  • Key 'monitoring' is missing in config-dev.json
  • Key 'monitoring' is missing in config-prod.json

⚠️  8 warning(s):
  • Key 'app.debug' is only present in config-dev.json
  • Key 'logging.file_path' is only present in config-prod.json
  • Key 'security.cors' is only present in config-prod.json
  • Key 'monitoring.metrics' is only present in config-staging.json
```

### 3. ENV Validation

```bash
cd examples/validation/env
praetorian validate
```

**Expected Output:**
```
❌ Key inconsistencies found:
  • Key 'DB_URL' is missing in env.dev
  • Key 'SECURITY_ENABLED' is missing in env.dev
  • Key 'SECURITY_ENABLED' is missing in env.staging
  • Key 'MONITORING_ENABLED' is missing in env.dev
  • Key 'MONITORING_ENABLED' is missing in env.prod

⚠️  8 warning(s):
  • Key 'APP_DEBUG' is only present in env.dev
  • Key 'LOG_FILE_PATH' is only present in env.prod
  • Key 'CORS_ORIGIN' is only present in env.prod
  • Key 'METRICS_PORT' is only present in env.staging
```

### 4. .NET Validation

```bash
cd examples/validation/dotnet
praetorian validate
```

**Expected Output:**
```
❌ Key inconsistencies found:
  • Key 'app' is missing in apps/web/appsettings.json
  • Key 'api' is missing in apps/web/appsettings.json
  • Key 'database' is missing in apps/web/appsettings.json
  • Key 'Logging' is missing in configs/frontend/app.config.json
  • Key 'ConnectionStrings' is missing in configs/frontend/app.config.json
  • Key 'AppSettings' is missing in configs/frontend/app.config.json

⚠️  105 warning(s):
  • Key 'app' is only present in configs/frontend/app.config.json
  • Key 'api' is only present in configs/frontend/app.config.json
  • Key 'database' is only present in configs/frontend/app.config.json
  • Key 'Logging' is only present in apps/web/appsettings.json
  • Key 'ConnectionStrings' is only present in apps/web/appsettings.json
  • Key 'AppSettings' is only present in apps/web/appsettings.json
```

**Features demonstrated:**
- **Multi-folder structure** - Files in different directories
- **C# appsettings.json** - .NET configuration files
- **Mixed formats** - JSON configs and appsettings.json
- **Complex nested keys** - Logging.LogLevel.Default, etc.

## 📋 Configuration Files

Each directory contains:

- **3 environment files** (dev, prod, staging)
- **1 praetorian.yaml** configuration file
- **Different key structures** to demonstrate validation

## 🎯 What You'll Learn

1. **Key comparison** across multiple environments
2. **Missing key detection** in different files
3. **Extra key warnings** for environment-specific settings
4. **Configuration setup** with `praetorian.yaml`
5. **Real-world scenarios** with actual configuration patterns
6. **Multi-folder validation** with files in different directories
7. **Framework compatibility** (.NET, Node.js, Python, etc.)
8. **Complex nested structures** (Logging.LogLevel.Default, etc.)

## 🔧 Customization

Feel free to modify the configuration files to test different scenarios:

- Add new keys to some environments
- Remove required keys from others
- Change the `ignore_keys` in `praetorian.yaml`
- Test with your own configuration patterns

## 📊 Expected Results

All examples are designed to show **validation failures** to demonstrate Praetorian's detection capabilities. In a real scenario, you would fix these inconsistencies to make all environments consistent. 