/**
 * @file src/shared/types/rules.ts
 * @description Core types for the Praetorian rule system
 */

import { ValidationSeverity } from './index';

/**
 * @interface ValidationRule
 * @description Base interface for all validation rules in Praetorian
 */
export interface ValidationRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name of the rule */
  name: string;
  /** Description of what the rule validates */
  description: string;
  /** Severity level when rule fails */
  severity: ValidationSeverity;
  /** Whether the rule is enabled */
  enabled: boolean;
  /** Optional category for grouping rules */
  category?: string;
  /** Optional tags for filtering */
  tags?: string[];
}

/**
 * @interface StructureRule
 * @description Rule for validating configuration structure
 */
export interface StructureRule extends ValidationRule {
  type: 'structure';
  /** Required properties that must exist */
  requiredProperties?: string[];
  /** Properties that are forbidden */
  forbiddenProperties?: string[];
  /** Whether to allow additional properties */
  allowAdditionalProperties?: boolean;
  /** Maximum nesting depth */
  maxDepth?: number;
}

/**
 * @interface FormatRule
 * @description Rule for validating data formats and patterns
 */
export interface FormatRule extends ValidationRule {
  type: 'format';
  /** Property path to validate (dot notation) */
  propertyPath?: string;
  /** Expected format (email, url, uuid, etc.) */
  format: string;
  /** Custom regex pattern */
  pattern?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * @interface SecurityRule
 * @description Rule for security-related validations
 */
export interface SecurityRule extends ValidationRule {
  type: 'security';
  /** Type of security check */
  securityType: 'secret' | 'permission' | 'vulnerability' | 'compliance';
  /** Specific security check configuration */
  config: any;
}

/**
 * @interface SchemaRule
 * @description Rule for schema validation
 */
export interface SchemaRule extends ValidationRule {
  type: 'schema';
  /** JSON Schema definition */
  schema: any;
  /** Whether to validate against schema */
  validateSchema: boolean;
}

/**
 * Union type for all rule types
 */
export type PraetorianRule = StructureRule | FormatRule | SecurityRule | SchemaRule;

/**
 * @interface RuleSet
 * @description Collection of rules that can be loaded together
 */
export interface RuleSet {
  /** Name of the rule set */
  name: string;
  /** Version of the rule set */
  version: string;
  /** Description of the rule set */
  description: string;
  /** Array of rules in this set */
  rules: PraetorianRule[];
  /** Dependencies on other rule sets */
  dependencies?: string[];
}

/**
 * @interface RuleConfig
 * @description Configuration for loading and composing rules
 */
export interface RuleConfig {
  /** Rule sets to include (can be local files or remote URLs) */
  ruleSets: string[];
  /** Rules to override (merge with existing rules by ID) */
  overrideRules?: Partial<PraetorianRule>[];
  /** Additional custom rules to add */
  customRules?: PraetorianRule[];
}

/**
 * @interface RuleLoadResult
 * @description Result of loading a rule set
 */
export interface RuleLoadResult {
  /** Successfully loaded rules */
  rules: PraetorianRule[];
  /** Errors encountered during loading */
  errors: string[];
  /** Warnings encountered during loading */
  warnings: string[];
}
