# 🛡️ Security Policy

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.4-alpha | ✅ Yes |
| 0.0.3-alpha.1 | ❌ No |
| < 0.0.3 | ❌ No |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 🚨 How to Report

1. **DO NOT** open a public issue for security vulnerabilities
2. Email security details to: [security@syntropysoft.com](mailto:security@syntropysoft.com)
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### 📋 What to Include

Please include as much of the following information as possible:

- **Version affected**: Which version(s) of Praetorian are affected
- **Environment**: Operating system, Node.js version, etc.
- **Configuration**: Your `praetorian.yaml` configuration (remove sensitive data)
- **Reproduction steps**: Detailed steps to reproduce the issue
- **Impact assessment**: What could an attacker do with this vulnerability
- **Suggested fix**: Any ideas on how to fix the issue

### ⏱️ Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Timeline**: Depends on severity, typically 1-4 weeks
- **Public Disclosure**: After fix is available, following responsible disclosure

### 🔒 Security Best Practices

When using Praetorian CLI:

1. **Keep Updated**: Always use the latest version
2. **Secure Configuration**: Never commit sensitive data to version control
3. **Environment Variables**: Use environment variables for secrets
4. **File Permissions**: Ensure configuration files have appropriate permissions
5. **CI/CD Security**: Use secure pipelines and avoid hardcoded secrets

### 🛡️ Security Features

Praetorian CLI includes several security features:

- **Secret Detection**: Automatically detects exposed secrets in configuration files
- **Vulnerability Scanning**: Scans for common security vulnerabilities
- **Compliance Checking**: Validates against security standards (PCI-DSS, GDPR, etc.)
- **File Permission Validation**: Checks file permissions for sensitive files
- **Input Validation**: Validates all inputs to prevent injection attacks

### 📞 Contact

For security-related questions or concerns:
- Email: [security@syntropysoft.com](mailto:security@syntropysoft.com)
- GitHub: [Create a private security advisory](https://github.com/Syntropysoft/praetorian/security/advisories/new)

Thank you for helping keep Praetorian CLI secure! 🔒
