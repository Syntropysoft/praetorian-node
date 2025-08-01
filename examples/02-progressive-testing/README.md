# 🚀 Progressive Testing - Praetorian Examples

**Demonstrates how Praetorian "blows up spectacularly" in a progressive and educational way.**

## 🎯 Objective

This example shows progressive validation by environment:
- **DEV** → ✅ Everything perfect (demonstrates it works)
- **STAGING** → ⚠️ Some warnings (minor problems)
- **PRODUCTION** → ❌ Critical errors (serious problems)

## 📁 Structure

```
02-progressive-testing/
├── README.md              # This file
├── setup.sh              # Setup script
├── environments.yaml     # Environment configuration
├── configs/
│   ├── dev.yaml          # ✅ Perfect configuration
│   ├── staging.yaml      # ⚠️  Some minor problems
│   └── production.yaml   # ❌ Many critical problems
├── fixes/
│   ├── staging-fixes.md  # How to fix staging
│   └── production-fixes.md # How to fix production
└── run-tests.sh          # Script that runs the tests
```

## 🚀 Quick Start

### 1. Prepare environment
```bash
./setup.sh
```

### 2. Run progressive tests
```bash
./run-tests.sh
```

### 3. See results by environment
```bash
# DEV - Everything perfect
praetorian validate configs/dev.yaml --env dev

# STAGING - Some warnings
praetorian validate configs/staging.yaml --env staging

# PRODUCTION - Critical errors
praetorian validate configs/production.yaml --env production
```

## 📋 Configurations by Environment

### ✅ **DEV - Perfect Configuration**
```yaml
app:
  name: "my-application"
  version: "1.0.0"
  environment: "development"

database:
  host: "localhost"
  port: 5432
  name: "myapp_dev"
  credentials:
    username: "dev_user"
    password: "${DB_PASSWORD}"

security:
  cors:
    origin: ["http://localhost:3000"]
    credentials: true
  headers:
    x-frame-options: "DENY"
    x-content-type-options: "nosniff"
    x-xss-protection: "1; mode=block"

logging:
  level: "debug"
  format: "json"
  output: "stdout"
```

### ⚠️ **STAGING - Minor Problems**
```yaml
app:
  name: "my-application"
  version: "1.0.0"
  environment: "staging"

database:
  host: "staging-db.example.com"
  port: 5432
  name: "myapp_staging"
  credentials:
    username: "staging_user"
    password: "staging_password"  # ⚠️ Hardcoded secret

security:
  cors:
    origin: "*"  # ⚠️ Too permissive CORS
    credentials: true
  headers:
    x-frame-options: "DENY"
    # ⚠️ Missing security headers

logging:
  level: "info"
  format: "json"
  output: "stdout"
```

### ❌ **PRODUCTION - Critical Errors**
```yaml
app:
  name: "my-application"
  version: "1.0.0"
  environment: "production"

database:
  host: "prod-db.example.com"
  port: "5432"  # ❌ Should be number
  name: "myapp_prod"
  credentials:
    username: "admin"
    password: "super_secret_prod_password"  # ❌ Hardcoded secret

security:
  cors:
    origin: "*"  # ❌ Dangerous CORS in production
    credentials: "true"  # ❌ Should be boolean
  headers:
    # ❌ Missing ALL security headers

logging:
  level: "invalid_level"  # ❌ Invalid level
  format: "json"
  output: "stdout"
```

## 🎯 Problem Progression

### **DEV → STAGING → PRODUCTION**

1. **DEV**: ✅ Everything perfect
   - Secure configuration
   - Environment variables
   - Complete security headers

2. **STAGING**: ⚠️ Minor problems
   - 1 hardcoded secret
   - Permissive CORS
   - Incomplete security headers

3. **PRODUCTION**: ❌ Critical errors
   - Multiple hardcoded secrets
   - Dangerous CORS
   - Incorrect data types
   - Missing security headers
   - Invalid logging configuration

## 🔧 How to Fix

### **Staging Fixes**
See `fixes/staging-fixes.md` for:
- Replace hardcoded secrets with environment variables
- Configure CORS appropriately
- Add missing security headers

### **Production Fixes**
See `fixes/production-fixes.md` for:
- Fix all data types
- Implement complete security
- Configure logging appropriately
- Validate all configurations

## 🎯 What You'll Learn

1. **Progressive Validation**: How problems escalate
2. **Error Detection**: Different types of problems
3. **Prioritization**: What to fix first
4. **Best Practices**: How to configure correctly
5. **Debugging**: How to interpret errors

## 🚀 Advanced Commands

```bash
# Validate with strict mode
praetorian validate config.yaml --strict

# Validate with verbose
praetorian validate config.yaml --verbose

# Validate multiple environments
praetorian validate --env dev,staging,production

# Complete audit
praetorian audit --security --compliance
```

## 📚 Next Steps

After completing this example:
- **[03-security-audit](../03-security-audit/)** - Security audits
- **[04-compliance-check](../04-compliance-check/)** - Compliance verifications

---

**Learn how Praetorian detects problems progressively!** 🛡️ 