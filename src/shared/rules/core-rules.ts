/**
 * @file src/shared/rules/core-rules.ts
 * @description Core validation rules for Praetorian CLI
 */

import { PraetorianRule } from '../types/rules';

/**
 * @constant CORE_STRUCTURE_RULES
 * @description Basic structure validation rules
 */
export const CORE_STRUCTURE_RULES: PraetorianRule[] = [
  {
    id: 'required-config-version',
    name: 'Configuration Version Required',
    description: 'Ensures configuration files have a version field',
    type: 'structure',
    severity: 'error',
    enabled: true,
    category: 'structure',
    tags: ['basic', 'version'],
    requiredProperties: ['version'],
    allowAdditionalProperties: true,
  },
  {
    id: 'no-empty-config',
    name: 'Non-Empty Configuration',
    description: 'Ensures configuration files are not empty',
    type: 'structure',
    severity: 'error',
    enabled: true,
    category: 'structure',
    tags: ['basic', 'empty'],
    maxDepth: 1,
  },
  {
    id: 'max-config-depth',
    name: 'Maximum Configuration Depth',
    description: 'Prevents excessive nesting in configuration files',
    type: 'structure',
    severity: 'warning',
    enabled: true,
    category: 'structure',
    tags: ['basic', 'depth'],
    maxDepth: 10,
  },
];

/**
 * @constant CORE_FORMAT_RULES
 * @description Basic format validation rules
 */
export const CORE_FORMAT_RULES: PraetorianRule[] = [
  {
    id: 'version-format',
    name: 'Version Format Validation',
    description: 'Validates version field follows semantic versioning',
    type: 'format',
    severity: 'warning',
    enabled: true,
    category: 'format',
    tags: ['basic', 'version'],
    propertyPath: 'version',
    format: 'semver',
    required: true,
  },
  {
    id: 'env-name-format',
    name: 'Environment Name Format',
    description: 'Validates environment names follow naming conventions',
    type: 'format',
    severity: 'warning',
    enabled: true,
    category: 'format',
    tags: ['basic', 'environment'],
    propertyPath: 'environment',
    format: 'string',
    pattern: '^[a-z][a-z0-9_-]*$',
    required: false,
  },
  {
    id: 'url-format',
    name: 'URL Format Validation',
    description: 'Validates URL fields have proper format',
    type: 'format',
    severity: 'error',
    enabled: true,
    category: 'format',
    tags: ['basic', 'url'],
    propertyPath: 'api.url',
    format: 'uri',
    required: false,
  },
];

/**
 * @constant CORE_SECURITY_RULES
 * @description Basic security validation rules
 */
export const CORE_SECURITY_RULES: PraetorianRule[] = [
  {
    id: 'no-hardcoded-secrets',
    name: 'No Hardcoded Secrets',
    description: 'Detects potential hardcoded secrets in configuration',
    type: 'security',
    severity: 'error',
    enabled: true,
    category: 'security',
    tags: ['basic', 'secrets'],
    securityType: 'secret',
    config: {
      patterns: ['password', 'secret', 'key', 'token'],
      minLength: 8,
    },
  },
  {
    id: 'no-http-urls',
    name: 'No HTTP URLs in Production',
    description: 'Warns about HTTP URLs in production configurations',
    type: 'security',
    severity: 'warning',
    enabled: true,
    category: 'security',
    tags: ['basic', 'https', 'production'],
    securityType: 'vulnerability',
    config: {
      checkHttp: true,
      environments: ['production', 'prod'],
    },
  },
  {
    id: 'sensitive-file-permissions',
    name: 'Sensitive File Permissions',
    description: 'Validates file permissions for sensitive configuration files',
    type: 'security',
    severity: 'warning',
    enabled: true,
    category: 'security',
    tags: ['basic', 'permissions'],
    securityType: 'permission',
    config: {
      maxPermissions: 644,
      sensitivePatterns: ['.env', 'config.json', 'secrets.yaml'],
    },
  },
];

/**
 * @constant CORE_SCHEMA_RULES
 * @description Basic schema validation rules
 */
export const CORE_SCHEMA_RULES: PraetorianRule[] = [
  {
    id: 'basic-config-schema',
    name: 'Basic Configuration Schema',
    description: 'Validates basic configuration structure',
    type: 'schema',
    severity: 'error',
    enabled: true,
    category: 'schema',
    tags: ['basic', 'structure'],
    validateSchema: true,
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string' },
        environment: { type: 'string' },
        api: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            timeout: { type: 'number', minimum: 1000 },
          },
        },
      },
      required: ['version'],
      additionalProperties: true,
    },
  },
];

/**
 * @constant ALL_CORE_RULES
 * @description All core rules combined
 */
export const ALL_CORE_RULES: PraetorianRule[] = [
  ...CORE_STRUCTURE_RULES,
  ...CORE_FORMAT_RULES,
  ...CORE_SECURITY_RULES,
  ...CORE_SCHEMA_RULES,
];

/**
 * @constant CORE_RULE_SETS
 * @description Organized rule sets for different use cases
 */
export const CORE_RULE_SETS = {
  structure: CORE_STRUCTURE_RULES,
  format: CORE_FORMAT_RULES,
  security: CORE_SECURITY_RULES,
  schema: CORE_SCHEMA_RULES,
  all: ALL_CORE_RULES,
} as const;
