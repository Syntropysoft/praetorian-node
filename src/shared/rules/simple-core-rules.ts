/**
 * @file src/shared/rules/simple-core-rules.ts
 * @description Core simple rules for Praetorian - only ID and name
 */

import { SimpleRule, SimpleRuleSet } from '../types/simple-rules';

/**
 * Core structure rules
 */
export const CORE_STRUCTURE_SIMPLE_RULES: SimpleRule[] = [
  { id: 'required-config-version', name: 'Config Version Required' },
  { id: 'required-config-name', name: 'Config Name Required' },
  { id: 'max-nesting-depth', name: 'Maximum Nesting Depth' },
  { id: 'no-circular-references', name: 'No Circular References' },
];

/**
 * Core format rules
 */
export const CORE_FORMAT_SIMPLE_RULES: SimpleRule[] = [
  { id: 'version-format', name: 'Version Format Validation' },
  { id: 'email-format', name: 'Email Format Validation' },
  { id: 'url-format', name: 'URL Format Validation' },
  { id: 'semver-format', name: 'Semantic Version Format' },
];

/**
 * Core security rules
 */
export const CORE_SECURITY_SIMPLE_RULES: SimpleRule[] = [
  { id: 'no-secrets-in-config', name: 'No Secrets in Configuration' },
  { id: 'secure-file-permissions', name: 'Secure File Permissions' },
  { id: 'no-hardcoded-passwords', name: 'No Hardcoded Passwords' },
  { id: 'encrypt-sensitive-data', name: 'Encrypt Sensitive Data' },
];

/**
 * Core schema rules
 */
export const CORE_SCHEMA_SIMPLE_RULES: SimpleRule[] = [
  { id: 'validate-json-schema', name: 'Validate JSON Schema' },
  { id: 'required-fields-present', name: 'Required Fields Present' },
  { id: 'no-extra-fields', name: 'No Extra Fields' },
  { id: 'data-type-validation', name: 'Data Type Validation' },
];

/**
 * All core simple rules combined
 */
export const ALL_CORE_SIMPLE_RULES: SimpleRule[] = [
  ...CORE_STRUCTURE_SIMPLE_RULES,
  ...CORE_FORMAT_SIMPLE_RULES,
  ...CORE_SECURITY_SIMPLE_RULES,
  ...CORE_SCHEMA_SIMPLE_RULES,
];

/**
 * Organized simple rule sets for different use cases
 */
export const CORE_SIMPLE_RULE_SETS = {
  structure: CORE_STRUCTURE_SIMPLE_RULES,
  format: CORE_FORMAT_SIMPLE_RULES,
  security: CORE_SECURITY_SIMPLE_RULES,
  schema: CORE_SCHEMA_SIMPLE_RULES,
  all: ALL_CORE_SIMPLE_RULES,
} as const;

/**
 * Example simple rule sets for templates
 */
export const EXAMPLE_SIMPLE_RULE_SETS: SimpleRuleSet[] = [
  {
    name: 'Basic Structure Rules',
    description: 'Essential structure validation rules',
    rules: [
      { id: 'app-name-required', name: 'Application Name Required' },
      { id: 'version-required', name: 'Version Required' },
      { id: 'description-required', name: 'Description Required' },
    ],
  },
  {
    name: 'Security Rules',
    description: 'Security validation rules',
    rules: [
      { id: 'no-api-keys', name: 'No API Keys in Config' },
      { id: 'no-database-urls', name: 'No Database URLs in Config' },
      { id: 'secure-defaults', name: 'Secure Default Values' },
    ],
  },
  {
    name: 'Format Rules',
    description: 'Format validation rules',
    rules: [
      { id: 'valid-email', name: 'Valid Email Format' },
      { id: 'valid-url', name: 'Valid URL Format' },
      { id: 'valid-version', name: 'Valid Version Format' },
    ],
  },
];
