# 🛠️ How to Create New Examples - Praetorian Examples

**Complete guide to creating new examples using the modular template system.**

## 🎯 Overview

This guide shows you how to create new Praetorian examples that follow the same structure and patterns as the existing ones. The system is designed to be **copy & paste friendly** with minimal modifications needed.

## 🚀 Quick Start

### 1. Create a New Example
```bash
# From the examples directory
./create-example.sh [number] "[name]" "[directory]"

# Examples:
./create-example.sh 03 "Security Audit" "security-audit"
./create-example.sh 04 "Compliance Check" "compliance-check"
./create-example.sh 05 "Custom Validation" "custom-validation"
```

### 2. Navigate and Customize
```bash
cd [number]-[directory]
# Edit the files as needed
```

### 3. Test Your Example
```bash
./setup.sh
./run-tests.sh
```

## 📋 Step-by-Step Guide

### Step 1: Create the Example Structure

The `create-example.sh` script will:
- ✅ Create a new directory with the correct name
- ✅ Copy all template files
- ✅ Replace basic placeholders
- ✅ Make scripts executable

### Step 2: Customize Configuration

#### **setup.sh** - Environment Setup
```bash
# Modify these variables:
EXAMPLE_NAME="Your Example Name"
EXAMPLE_DIR="your-example-directory"

# Update required files:
REQUIRED_FILES=(
    "configs/your-config.yaml"
    "configs/your-config.json"
    "invalid/your-broken.yaml"
    "invalid/your-broken.json"
)

# Update commands to show:
COMMANDS=(
    "praetorian validate configs/your-config.yaml"
    "praetorian validate invalid/your-broken.yaml"
)

# Update directories to create:
DIRECTORIES=(
    "configs"
    "invalid"
    "logs"
    "your-custom-dir"
)
```

#### **run-tests.sh** - Test Configuration
```bash
# Modify these variables:
EXAMPLE_NAME="Your Example Name"
EXAMPLE_DIR="your-example-directory"
VALIDATION_COMMAND="praetorian validate"  # or "praetorian audit"

# Update test cases:
TEST_CASES=(
    # Correct configurations
    "configs/your-config.yaml" "SUCCESS" "Correct YAML configuration"
    "configs/your-config.json" "SUCCESS" "Correct JSON configuration"
    
    # Incorrect configurations
    "invalid/your-broken.yaml" "FAILURE" "YAML configuration with errors"
    "invalid/your-broken.json" "FAILURE" "JSON configuration with errors"
)
```

#### **README.md** - Documentation
Replace all placeholders:
- `[EXAMPLE_NAME]` → Your example name
- `[BRIEF_DESCRIPTION]` → What your example does
- `[WHAT_THIS_EXAMPLE_DOES]` → Detailed description
- `[FEATURE_1]`, `[FEATURE_2]` → Your features
- `[LEARNING_POINT_1]` → What users learn

### Step 3: Create Configuration Files

#### **configs/** - Correct Configurations
Create files that demonstrate **correct** usage:
```yaml
# configs/your-config.yaml
app:
  name: "example-app"
  version: "1.0.0"
  environment: "development"

database:
  host: "localhost"
  port: 5432
  credentials:
    username: "admin"
    password: "${DB_PASSWORD}"  # ✅ Using environment variable
```

#### **invalid/** - Configurations with Errors
Create files that demonstrate **common mistakes**:
```yaml
# invalid/your-broken.yaml
app:
  name: "example-app"
  version: "1.0.0"
  environment: "development"

database:
  host: "localhost"
  port: "5432"  # ❌ Error: should be number, not string
  credentials:
    username: "admin"
    password: "hardcoded_password"  # ❌ Error: hardcoded secret
```

### Step 4: Test Your Example

```bash
# 1. Run setup
./setup.sh

# 2. Run tests
./run-tests.sh

# 3. Manual testing
praetorian validate configs/your-config.yaml
praetorian validate invalid/your-broken.yaml
```

## 🎨 Best Practices

### **File Organization**
```
your-example/
├── README.md              # Clear documentation
├── setup.sh              # Environment preparation
├── run-tests.sh          # Automated testing
├── configs/              # Correct configurations
│   ├── app.yaml
│   └── api.json
├── invalid/              # Configurations with errors
│   ├── app-broken.yaml
│   └── api-broken.json
└── fixes/                # Optional: How to fix errors
    └── how-to-fix.md
```

### **Error Documentation**
Always include clear comments explaining errors:
```yaml
# ❌ Error: should be number, not string
port: "5432"

# ❌ Error: hardcoded secret - use environment variable
password: "my_secret_password"
```

### **Progressive Complexity**
- Start with simple errors
- Build up to more complex scenarios
- Include different types of problems

### **Educational Value**
- Explain **why** each error is problematic
- Show **how** to fix the errors
- Provide **context** for when these errors occur

## 🔧 Advanced Customization

### **Custom Validation Commands**
```bash
# For audit examples:
VALIDATION_COMMAND="praetorian audit --security"

# For specific validation:
VALIDATION_COMMAND="praetorian validate --strict"
```

### **Multiple Test Types**
```bash
TEST_CASES=(
    # Basic validation
    "configs/basic.yaml" "SUCCESS" "Basic configuration"
    
    # Security validation
    "configs/secure.yaml" "SUCCESS" "Secure configuration"
    
    # Error cases
    "invalid/basic-broken.yaml" "FAILURE" "Basic errors"
    "invalid/security-broken.yaml" "FAILURE" "Security errors"
)
```

### **Environment-Specific Tests**
```bash
# Test different environments
TEST_CASES=(
    "configs/dev.yaml" "SUCCESS" "Development configuration"
    "configs/staging.yaml" "SUCCESS" "Staging configuration"
    "configs/production.yaml" "SUCCESS" "Production configuration"
    "invalid/production-broken.yaml" "FAILURE" "Production errors"
)
```

## 🚨 Common Issues

### **Praetorian Not Found**
```bash
# Solution: Build and link from project root
cd ../..
npm run build
npm link
```

### **Scripts Not Executable**
```bash
# Solution: Make scripts executable
chmod +x setup.sh run-tests.sh
```

### **Files Not Found**
```bash
# Solution: Check REQUIRED_FILES array in setup.sh
# Make sure all files exist in the correct locations
```

## 📚 Example Templates

### **Basic Validation Example**
- Validates YAML/JSON syntax
- Checks for common configuration errors
- Demonstrates basic Praetorian usage

### **Security Audit Example**
- Detects hardcoded secrets
- Validates security configurations
- Shows security best practices

### **Compliance Example**
- Checks required fields
- Validates format compliance
- Demonstrates regulatory requirements

### **Progressive Testing Example**
- Shows environment progression
- Demonstrates error escalation
- Teaches debugging techniques

## 🎯 Success Criteria

Your example is ready when:
- ✅ All scripts run without errors
- ✅ Tests pass/fail as expected
- ✅ Documentation is clear and complete
- ✅ Errors are well-documented
- ✅ Examples are educational
- ✅ Structure follows the template

---

**Happy creating! Your examples help others learn Praetorian effectively.** 🛡️ 