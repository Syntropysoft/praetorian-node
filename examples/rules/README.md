# Praetorian Rules Examples

This directory contains comprehensive examples demonstrating how to use Praetorian's validation rules system. Each example focuses on different aspects of configuration validation.

## 📁 Available Examples:

### 🛡️ [Security Rules](./security/)
**Purpose**: Demonstrate security validation rules
**Files**: 
- `praetorian.yaml` - Security rules configuration
- `config-dev.yaml` - Secure development config ✅
- `config-prod.yaml` - Secure production config ✅  
- `config-insecure.yaml` - Insecure config ❌ (shows violations)

**Rules Demonstrated**:
- Secret detection (API keys, passwords, tokens)
- Permission validation (file permissions)
- Encryption requirements
- SSL/TLS configuration
- Authentication methods

### 🔒 [Compliance Rules](./compliance/)
**Purpose**: Demonstrate regulatory compliance validation
**Files**:
- `praetorian.yaml` - Compliance rules configuration
- `config-prod.yaml` - Fully compliant configuration ✅

**Standards Covered**:
- **GDPR** - General Data Protection Regulation
- **PCI DSS** - Payment Card Industry Data Security Standard
- **HIPAA** - Health Insurance Portability and Accountability Act
- **SOX** - Sarbanes-Oxley Act

### ⚡ [Performance Rules](./performance/)
**Purpose**: Demonstrate performance optimization validation
**Files**:
- `praetorian.yaml` - Performance rules configuration

**Optimizations Covered**:
- Database performance (connection pooling, query optimization)
- Cache performance (TTL, memory usage, eviction policies)
- API performance (timeouts, rate limiting, compression)
- Resource optimization (memory, CPU, disk I/O)

### 🎯 [Custom Rules](./custom/)
**Purpose**: Demonstrate custom business-specific validation rules
**Files**:
- `praetorian.yaml` - Custom rules configuration

**Custom Rules Demonstrated**:
- Business hours validation
- Environment-specific configurations
- API versioning requirements
- Feature flag management
- Cost optimization

## 🚀 Quick Start:

### 1. Choose an Example
```bash
cd examples/rules/security  # or compliance, performance, custom
```

### 2. Run Validation

#### User Mode (Detailed Output)
```bash
# Validate with detailed explanations and tips
praetorian validate --config praetorian.yaml
```

#### Pipeline Mode (CI/CD Friendly)
```bash
# Validate with concise output for pipelines
praetorian validate --config praetorian.yaml --pipeline
```

#### Direct File Validation
```bash
# Validate specific files (single file - informational only)
praetorian validate config-dev.yaml
praetorian validate config-prod.yaml
praetorian validate config-insecure.yaml
```

### 3. Understand the Results

#### User Mode Output:
- ✅ **PASS**: Configuration follows all rules
- ❌ **FAIL**: Configuration violates one or more rules  
- ⚠️ **WARNINGS**: Configuration has non-critical issues
- 💡 **TIPS**: Helpful suggestions for improvement

#### Pipeline Mode Output:
- `PRAETORIAN_VALIDATION: PASSED` - All validations successful
- `PRAETORIAN_VALIDATION: FAILED` - Validation failures detected
- `PRAETORIAN_SUMMARY: files=X, errors=Y, warnings=Z` - Essential metrics

## 🔧 Pipeline Integration

### CI/CD Pipeline Usage

The `--pipeline` flag is designed specifically for CI/CD environments where concise output is essential:

```yaml
# Example GitHub Actions workflow
- name: Validate Configuration
  run: |
    cd examples/rules/security
    praetorian validate --config praetorian.yaml --pipeline
```

### Pipeline Output Format

Pipeline mode provides machine-readable output perfect for:
- **Exit codes**: `0` for success, `1` for failure
- **Log parsing**: Standardized `PRAETORIAN_VALIDATION:` and `PRAETORIAN_SUMMARY:` prefixes
- **Error limits**: Shows only first 5 errors to prevent log spam
- **Essential metrics**: Files, errors, warnings, duration in one line

### Integration Examples

```bash
# Jenkins Pipeline
pipeline {
  stages {
    stage('Validate Config') {
      steps {
        sh 'praetorian validate --config praetorian.yaml --pipeline'
      }
    }
  }
}

# Dockerfile
RUN praetorian validate --config praetorian.yaml --pipeline

# Makefile
validate:
	praetorian validate --config praetorian.yaml --pipeline
```

## 📖 Understanding Rule Categories:

### Security Rules
- **Purpose**: Protect against security vulnerabilities
- **Severity**: Usually `error` (critical) or `warning`
- **Examples**: Secret detection, permission validation, encryption

### Compliance Rules  
- **Purpose**: Ensure regulatory compliance
- **Severity**: Usually `error` (legal requirement)
- **Examples**: GDPR, PCI DSS, HIPAA, SOX compliance

### Performance Rules
- **Purpose**: Optimize system performance
- **Severity**: Usually `warning` or `info`
- **Examples**: Database optimization, cache tuning, resource limits

### Best Practice Rules
- **Purpose**: Follow industry best practices
- **Severity**: Usually `warning` or `info`
- **Examples**: Configuration standards, naming conventions

### Custom Rules
- **Purpose**: Business-specific requirements
- **Severity**: Varies based on business impact
- **Examples**: Environment-specific rules, feature flags

## 🔧 Creating Your Own Rules:

### 1. Define Rule Structure
```yaml
rules:
  - id: "my-custom-rule"
    name: "My Custom Rule"
    description: "Description of what this rule validates"
    category: "custom"  # security, compliance, performance, best-practice, custom
    severity: "warning"  # error, warning, info
    enabled: true
    config:
      # Rule-specific configuration
      mySetting: "value"
```

### 2. Configure Rule Behavior
```yaml
config:
  # Pattern matching
  patterns:
    - "pattern1"
    - "pattern2"
  
  # Exclusion patterns
  excludePatterns:
    - "exclude1"
  
  # Required features
  requiredFeatures:
    - "feature1"
    - "feature2"
  
  # Custom validation logic
  customLogic:
    enabled: true
    rules:
      - condition: "value > 100"
        message: "Value must be greater than 100"
```

### 3. Test Your Rules
```bash
# Test with valid configuration
praetorian validate config-valid.yaml

# Test with invalid configuration  
praetorian validate config-invalid.yaml
```

## 🎯 Rule Configuration Options:

### Basic Rule Properties:
- `id`: Unique identifier for the rule
- `name`: Human-readable name
- `description`: Detailed description
- `category`: Rule category (security, compliance, etc.)
- `severity`: Rule severity (error, warning, info)
- `enabled`: Whether the rule is active

### Rule Configuration:
- `patterns`: Regex patterns to match
- `excludePatterns`: Patterns to exclude
- `requiredFeatures`: Features that must be present
- `requiredKeys`: Keys that must exist
- `forbiddenKeys`: Keys that must not exist
- `customLogic`: Custom validation logic

### Validation Options:
- `strict`: Fail on warnings (true/false)
- `ignore_keys`: Keys to ignore during validation
- `required_keys`: Keys that must be present
- `forbidden_keys`: Keys that must not be present

## 🔄 Integration Examples:

### CI/CD Pipeline:
```yaml
- name: Validate Configuration
  run: |
    praetorian validate config-prod.yaml
    if [ $? -ne 0 ]; then
      echo "Configuration validation failed!"
      exit 1
    fi
```

### Pre-commit Hook:
```bash
#!/bin/bash
praetorian validate $(git diff --name-only --cached | grep '\.yaml$')
```

### Monitoring Integration:
```yaml
monitoring:
  validation:
    enabled: true
    schedule: "0 */6 * * *"  # Every 6 hours
    alertOnFailure: true
```

## 📊 Rule Performance:

### Rule Execution Order:
1. **Security rules** (highest priority)
2. **Compliance rules**
3. **Performance rules**
4. **Best practice rules**
5. **Custom rules** (lowest priority)

### Performance Tips:
- Use specific patterns instead of broad ones
- Exclude common false positives
- Group related validations
- Use appropriate severity levels

## 🆘 Troubleshooting:

### Common Issues:

1. **Rule not triggering**:
   - Check if rule is `enabled: true`
   - Verify pattern matches your content
   - Check rule configuration syntax

2. **Too many false positives**:
   - Add exclusion patterns
   - Refine pattern specificity
   - Adjust severity level

3. **Rule too slow**:
   - Optimize regex patterns
   - Reduce pattern complexity
   - Use more specific patterns

### Debug Mode:
```bash
praetorian validate --debug config.yaml
```

This will show detailed information about rule execution and matching.

## 📚 Further Reading:

- [Praetorian Documentation](../../README.md)
- [Rule Development Guide](../../docs/rule-development.md)
- [Configuration Reference](../../docs/configuration.md)
- [API Documentation](../../docs/api.md)

## 🤝 Contributing:

Want to add more examples? Great! Please:

1. Create a new directory under `rules/`
2. Include `praetorian.yaml` with rule definitions
3. Add example configuration files
4. Write a comprehensive `README.md`
5. Test your examples thoroughly

Happy validating! 🎉
