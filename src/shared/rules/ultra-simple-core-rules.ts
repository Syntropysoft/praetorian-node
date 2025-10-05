/**
 * @file src/shared/rules/ultra-simple-core-rules.ts
 * @description Ultra-simple core rules - just ID -> Name mapping
 */

import { RuleDictionary } from '../types/rule-dictionary';

/**
 * Core structure rules
 */
export const CORE_STRUCTURE_RULES: RuleDictionary = {
  'required-config-version': 'Config Version Required',
  'required-config-name': 'Config Name Required',
  'max-nesting-depth': 'Maximum Nesting Depth',
  'no-circular-references': 'No Circular References',
};

/**
 * Core format rules
 */
export const CORE_FORMAT_RULES: RuleDictionary = {
  'version-format': 'Version Format Validation',
  'email-format': 'Email Format Validation',
  'url-format': 'URL Format Validation',
  'semver-format': 'Semantic Version Format',
};

/**
 * Core security rules
 */
export const CORE_SECURITY_RULES: RuleDictionary = {
  'no-secrets-in-config': 'No Secrets in Configuration',
  'secure-file-permissions': 'Secure File Permissions',
  'no-hardcoded-passwords': 'No Hardcoded Passwords',
  'encrypt-sensitive-data': 'Encrypt Sensitive Data',
};

/**
 * Core schema rules
 */
export const CORE_SCHEMA_RULES: RuleDictionary = {
  'validate-json-schema': 'Validate JSON Schema',
  'required-fields-present': 'Required Fields Present',
  'no-extra-fields': 'No Extra Fields',
  'data-type-validation': 'Data Type Validation',
};

/**
 * All core rules combined
 */
export const ALL_CORE_RULES: RuleDictionary = {
  ...CORE_STRUCTURE_RULES,
  ...CORE_FORMAT_RULES,
  ...CORE_SECURITY_RULES,
  ...CORE_SCHEMA_RULES,
};

/**
 * Organized rule sets for different use cases
 */
export const CORE_RULE_SETS = {
  structure: CORE_STRUCTURE_RULES,
  format: CORE_FORMAT_RULES,
  security: CORE_SECURITY_RULES,
  schema: CORE_SCHEMA_RULES,
  all: ALL_CORE_RULES,
} as const;
