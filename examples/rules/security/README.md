# Security Rules Example

This example demonstrates how to use Praetorian's built-in security validation rules to ensure your configuration files are secure and follow security best practices.

## Files in this example:

- `praetorian.yaml` - Configuration file with security rules
- `config-dev.yaml` - **SECURE** development configuration (passes all rules)
- `config-prod.yaml` - **SECURE** production configuration (passes all rules)
- `config-insecure.yaml` - **INSECURE** configuration (fails security rules)

## Security Rules Demonstrated:

### 1. Secret Detection Rules
- **Rule ID**: `no-hardcoded-secrets`
- **Purpose**: Detects hardcoded API keys, passwords, and tokens
- **Severity**: Error
- **What it checks**:
  - API keys, passwords, secrets, tokens, auth keys
  - Excludes example/placeholder values

### 2. Permission Validation Rules
- **Rule ID**: `secure-permissions`
- **Purpose**: Ensures configuration files have secure permissions
- **Severity**: Warning
- **What it checks**:
  - File permissions (max 644)
  - Sensitive file permissions (600 for keys, secrets)

### 3. Encryption Rules
- **Rule ID**: `encryption-required`
- **Purpose**: Ensures sensitive data is encrypted
- **Severity**: Error
- **What it checks**:
  - Required encrypted fields
  - Encryption indicators

## Running the Example:

### Validate Secure Configurations:
```bash
# Validate development config (should pass)
praetorian validate config-dev.yaml

# Validate production config (should pass)
praetorian validate config-prod.yaml
```

### Validate Insecure Configuration:
```bash
# Validate insecure config (should fail with security errors)
praetorian validate config-insecure.yaml
```

## Expected Results:

### ✅ Secure Configurations (config-dev.yaml, config-prod.yaml):
- **Result**: SUCCESS
- **Security checks passed**: All security rules pass
- **No hardcoded secrets**: Uses environment variables
- **Proper encryption**: Sensitive data is encrypted
- **Secure permissions**: Files have appropriate permissions

### ❌ Insecure Configuration (config-insecure.yaml):
- **Result**: FAILURE
- **Security violations detected**:
  - Hardcoded secrets (API keys, passwords, tokens)
  - Forbidden keys (adminPassword, rootPassword)
  - Missing encryption
  - No SSL configuration
  - Weak authentication methods
  - Logging sensitive data

## Security Best Practices Demonstrated:

### ✅ DO (Secure Examples):
1. **Use Environment Variables**: `${API_KEY}`, `${DB_PASSWORD}`
2. **Enable Encryption**: `encryption: true`, `algorithm: "AES-256-GCM"`
3. **Use HTTPS**: `https://api.example.com`
4. **Implement SSL**: `ssl: true`, `minTlsVersion: "1.2"`
5. **Secure Logging**: Exclude sensitive fields, use structured logging
6. **Rate Limiting**: `rateLimit: { enabled: true }`
7. **Input Validation**: Validate all inputs
8. **Secure Headers**: HSTS, CSP, X-Frame-Options

### ❌ DON'T (Insecure Examples):
1. **Hardcode Secrets**: `apiKey: "sk-1234567890abcdef"`
2. **Use Weak Encryption**: `algorithm: "DES"`
3. **Disable SSL**: `ssl: false`
4. **Log Sensitive Data**: Include passwords in logs
5. **Use HTTP**: `http://api.example.com`
6. **Skip Authentication**: No auth mechanisms
7. **No Rate Limiting**: `rateLimit: { enabled: false }`

## Customizing Security Rules:

You can customize the security rules in `praetorian.yaml`:

```yaml
rules:
  - id: "no-hardcoded-secrets"
    enabled: true  # Enable/disable the rule
    severity: "error"  # error, warning, info
    config:
      patterns:
        - "your-custom-pattern"  # Add custom patterns
      excludePatterns:
        - "your-exclude-pattern"  # Add exclusions
```

## Integration with CI/CD:

Add to your pipeline:
```yaml
- name: Validate Security Configuration
  run: |
    praetorian validate config-prod.yaml
    if [ $? -ne 0 ]; then
      echo "Security validation failed!"
      exit 1
    fi
```

This ensures that insecure configurations never reach production.
