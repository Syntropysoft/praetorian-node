/**
 * @file src/shared/templates/rule-templates.ts
 * @description Templates for generating rule configuration files
 */

/**
 * @constant DEFAULT_PRAETORIAN_CONFIG
 * @description Default praetorian.yaml configuration template
 */
export const DEFAULT_PRAETORIAN_CONFIG = `# Praetorian Configuration
# This file defines validation rules for your configuration files

# Configuration files to validate
files:
  - config-dev.yaml
  - config-prod.yaml
  - config-staging.yaml

# Environment-specific configurations
environments:
  dev: config-dev.yaml
  prod: config-prod.yaml
  staging: config-staging.yaml

# Keys to ignore during validation
ignore_keys:
  - debug
  - temp
  - timestamp

# Required keys that must be present
required_keys:
  - database.url
  - api.token
  - version

# Schema validation rules
schema:
  database.port: number
  api.timeout: number
  service.enabled: boolean

# Pattern validation rules
patterns:
  api.token: "^[A-Za-z0-9_-]{20,}$"
  version: '^[0-9]+\\.[0-9]+\\.[0-9]+$'

# Forbidden keys
forbidden_keys:
  - password_plaintext
  - secret_key

# Rule system configuration (NEW)
# Only rules listed here will be applied - no exclusions, just active rules
ruleSets:
  - "@praetorian/core/all"           # Include all core rules
  - "./rules/structure.yaml"         # Custom structure rules
  - "./rules/security.yaml"          # Custom security rules

# Rule overrides (optional)
# Override specific properties of existing rules
overrideRules:
  # - id: "version-format"
  #   severity: "warning"             # Example: change severity

# Additional custom rules (optional)
# Add completely new rules
customRules:
  # - id: "my-custom-rule"
  #   name: "My Custom Rule"
  #   description: "Validates my custom requirement"
  #   type: "structure"
  #   severity: "error"
  #   enabled: true
  #   category: "custom"
  #   requiredProperties: ["myField"]

# Validation options
options:
  failOnError: true
  showWarnings: true
  verbose: false
`;

/**
 * @constant STRUCTURE_RULES_TEMPLATE
 * @description Template for structure validation rules
 */
export const STRUCTURE_RULES_TEMPLATE = `# Structure Validation Rules
# Rules for validating configuration file structure

rules:
  - id: "required-api-config"
    name: "API Configuration Required"
    description: "Ensures API configuration is present"
    type: "structure"
    severity: "error"
    enabled: true
    category: "structure"
    tags: ["api", "required"]
    requiredProperties: ["api"]

  - id: "no-deprecated-fields"
    name: "No Deprecated Fields"
    description: "Prevents use of deprecated configuration fields"
    type: "structure"
    severity: "warning"
    enabled: true
    category: "structure"
    tags: ["deprecated"]
    forbiddenProperties: ["oldField", "legacyConfig"]

  - id: "max-nesting-level"
    name: "Maximum Nesting Level"
    description: "Limits configuration nesting depth"
    type: "structure"
    severity: "warning"
    enabled: true
    category: "structure"
    tags: ["depth", "complexity"]
    maxDepth: 5
`;

/**
 * @constant FORMAT_RULES_TEMPLATE
 * @description Template for format validation rules
 */
export const FORMAT_RULES_TEMPLATE = `# Format Validation Rules
# Rules for validating data formats and patterns

rules:
  - id: "api-url-format"
    name: "API URL Format"
    description: "Validates API URL format"
    type: "format"
    severity: "error"
    enabled: true
    category: "format"
    tags: ["api", "url"]
    propertyPath: "api.url"
    format: "uri"
    required: true

  - id: "timeout-range"
    name: "Timeout Range Validation"
    description: "Validates timeout values are within reasonable range"
    type: "format"
    severity: "warning"
    enabled: true
    category: "format"
    tags: ["timeout", "range"]
    propertyPath: "api.timeout"
    pattern: "^[1-9][0-9]{3,5}$"
    required: false

  - id: "environment-format"
    name: "Environment Name Format"
    description: "Validates environment names"
    type: "format"
    severity: "warning"
    enabled: true
    category: "format"
    tags: ["environment"]
    propertyPath: "environment"
    pattern: "^[a-z][a-z0-9_-]*$"
    required: true
`;

/**
 * @constant SECURITY_RULES_TEMPLATE
 * @description Template for security validation rules
 */
export const SECURITY_RULES_TEMPLATE = `# Security Validation Rules
# Rules for security-related validations

rules:
  - id: "no-secrets-in-config"
    name: "No Secrets in Configuration"
    description: "Detects potential secrets in configuration files"
    type: "security"
    severity: "error"
    enabled: true
    category: "security"
    tags: ["secrets", "security"]
    securityType: "secret"
    config:
      patterns: ["password", "secret", "key", "token", "auth"]
      minLength: 8
      caseSensitive: false

  - id: "https-only-production"
    name: "HTTPS Only in Production"
    description: "Ensures HTTPS is used in production"
    type: "security"
    severity: "error"
    enabled: true
    category: "security"
    tags: ["https", "production", "security"]
    securityType: "vulnerability"
    config:
      checkHttp: true
      environments: ["production", "prod"]
      allowedDomains: ["localhost", "127.0.0.1"]

  - id: "config-file-permissions"
    name: "Configuration File Permissions"
    description: "Validates file permissions for config files"
    type: "security"
    severity: "warning"
    enabled: true
    category: "security"
    tags: ["permissions", "files"]
    securityType: "permission"
    config:
      maxPermissions: 644
      sensitivePatterns: [".env", "config.json", "secrets.yaml", "*.key"]
`;

/**
 * @constant SCHEMA_RULES_TEMPLATE
 * @description Template for schema validation rules
 */
export const SCHEMA_RULES_TEMPLATE = `# Schema Validation Rules
# Rules for JSON Schema validation

rules:
  - id: "api-config-schema"
    name: "API Configuration Schema"
    description: "Validates API configuration structure"
    type: "schema"
    severity: "error"
    enabled: true
    category: "schema"
    tags: ["api", "schema"]
    validateSchema: true
    schema:
      type: "object"
      properties:
        api:
          type: "object"
          properties:
            url:
              type: "string"
              format: "uri"
            timeout:
              type: "number"
              minimum: 1000
              maximum: 300000
            retries:
              type: "number"
              minimum: 0
              maximum: 10
          required: ["url", "timeout"]
      required: ["api"]

  - id: "database-config-schema"
    name: "Database Configuration Schema"
    description: "Validates database configuration structure"
    type: "schema"
    severity: "error"
    enabled: true
    category: "schema"
    tags: ["database", "schema"]
    validateSchema: true
    schema:
      type: "object"
      properties:
        database:
          type: "object"
          properties:
            host:
              type: "string"
            port:
              type: "number"
              minimum: 1
              maximum: 65535
            name:
              type: "string"
            ssl:
              type: "boolean"
          required: ["host", "port", "name"]
      required: ["database"]
`;

/**
 * Gets the appropriate template based on type
 * @param type - Template type
 * @returns Template content
 */
export function getRuleTemplate(type: 'config' | 'structure' | 'format' | 'security' | 'schema'): string {
  switch (type) {
    case 'config':
      return DEFAULT_PRAETORIAN_CONFIG;
    case 'structure':
      return STRUCTURE_RULES_TEMPLATE;
    case 'format':
      return FORMAT_RULES_TEMPLATE;
    case 'security':
      return SECURITY_RULES_TEMPLATE;
    case 'schema':
      return SCHEMA_RULES_TEMPLATE;
    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}

/**
 * Gets all available template types
 * @returns Array of template types
 */
export function getAvailableTemplateTypes(): string[] {
  return ['config', 'structure', 'format', 'security', 'schema'];
}
