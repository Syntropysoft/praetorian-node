/**
 * @file src/shared/types/simple-rules.ts
 * @description Simplified rule structure - only ID and name
 */

/**
 * @interface SimpleRule
 * @description Minimal rule structure with only essential properties
 */
export interface SimpleRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name for the rule */
  name: string;
}

/**
 * @interface SimpleRuleSet
 * @description Collection of simple rules
 */
export interface SimpleRuleSet {
  /** Name of the rule set */
  name: string;
  /** Description of the rule set */
  description?: string;
  /** Array of rules */
  rules: SimpleRule[];
}

/**
 * @interface SimpleRuleConfig
 * @description Configuration for loading simple rules
 */
export interface SimpleRuleConfig {
  /** Rule sets to include (can be local files or remote URLs) */
  ruleSets: string[];
  /** Rules to override (merge with existing rules by ID) */
  overrideRules?: Partial<SimpleRule>[];
  /** Additional custom rules to add */
  customRules?: SimpleRule[];
}

/**
 * @interface SimpleRuleLoadResult
 * @description Result of loading simple rules
 */
export interface SimpleRuleLoadResult {
  /** Successfully loaded rules */
  rules: SimpleRule[];
  /** Errors encountered during loading */
  errors: string[];
  /** Warnings encountered during loading */
  warnings: string[];
}

/**
 * @interface SimpleRuleDictionary
 * @description Dictionary of simple rules indexed by ID
 */
export interface SimpleRuleDictionary {
  [ruleId: string]: SimpleRule;
}

/**
 * @interface SimpleRuleDictionaryResult
 * @description Result of dictionary operations
 */
export interface SimpleRuleDictionaryResult {
  dictionary: SimpleRuleDictionary;
  added: string[];
  skipped: string[];
  warnings: string[];
}
