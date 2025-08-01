# 🔍 Basic Validation - Praetorian Examples

**Learn the fundamentals of configuration validation with Praetorian.**

## 🎯 Objective

This example teaches you how to validate basic configuration files:
- **YAML** - Application configurations
- **JSON** - API configurations
- **ENV** - Environment variables

## 📁 Structure

```
01-basic-validation/
├── README.md              # This file
├── setup.sh              # Setup script
├── configs/
│   ├── app.yaml          # ✅ Correct configuration
│   ├── api.json          # ✅ Correct configuration
│   └── .env              # ✅ Correct environment variables
├── invalid/
│   ├── app-broken.yaml   # ❌ YAML with errors
│   ├── api-broken.json   # ❌ JSON with errors
│   └── .env-broken       # ❌ ENV with errors
└── run-tests.sh          # Test script
```

## 🚀 Quick Start

### 1. Prepare environment
```bash
./setup.sh
```

### 2. Validate correct configurations
```bash
praetorian validate configs/app.yaml
praetorian validate configs/api.json
praetorian validate configs/.env
```

### 3. See errors in incorrect configurations
```bash
praetorian validate invalid/app-broken.yaml
praetorian validate invalid/api-broken.json
praetorian validate invalid/.env-broken
```

### 4. Run all tests
```bash
./run-tests.sh
```

## 📋 Example Configurations

### ✅ **app.yaml - Correct Configuration**
```yaml
app:
  name: "my-application"
  version: "1.0.0"
  environment: "development"

database:
  host: "localhost"
  port: 5432
  name: "myapp"
  credentials:
    username: "admin"
    password: "${DB_PASSWORD}"  # ✅ Using environment variable

security:
  cors:
    origin: ["https://myapp.com"]
    credentials: true
  headers:
    x-frame-options: "DENY"
    x-content-type-options: "nosniff"

logging:
  level: "info"
  format: "json"
  output: "stdout"
```

### ✅ **api.json - Correct Configuration**
```json
{
  "api": {
    "name": "my-api",
    "version": "1.0.0",
    "port": 3000
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

### ✅ **.env - Correct Variables**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
DB_PASSWORD=secure_password_123

# API
API_KEY=${API_KEY_SECRET}
JWT_SECRET=super_secret_jwt_key

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

## ❌ **Configurations with Errors**

### **app-broken.yaml**
- ❌ Incorrect YAML syntax
- ❌ Incorrect data types
- ❌ Malformed structure

### **api-broken.json**
- ❌ Incorrect JSON syntax
- ❌ Missing required fields
- ❌ Invalid values

### **.env-broken**
- ❌ Variables without values
- ❌ Incorrect format
- ❌ Duplicate variables

## 🎯 What You'll Learn

1. **Syntax Validation**: Detect format errors
2. **Structure Validation**: Verify required fields
3. **Type Validation**: Ensure correct data types
4. **Security Validation**: Detect hardcoded secrets
5. **Variable Validation**: Verify environment variable usage

## 🔧 Useful Commands

```bash
# Validate with verbose
praetorian validate config.yaml --verbose

# Validate with strict mode
praetorian validate config.yaml --strict

# Validate multiple files
praetorian validate config.yaml api.json .env

# Show help
praetorian --help
```

## 📚 Next Steps

After completing this example, continue with:
- **[02-progressive-testing](../02-progressive-testing/)** - Environment-based tests
- **[03-security-audit](../03-security-audit/)** - Security audits
- **[04-compliance-check](../04-compliance-check/)** - Compliance verifications

---

**Learn the fundamentals of validation with Praetorian!** 🛡️ 