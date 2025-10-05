/**
 * @file src/shared/types/rule-dictionary.ts
 * @description Ultra-simple rule dictionary - ID as key, name as value
 */

/**
 * @interface RuleDictionary
 * @description Simple dictionary: ID -> Name
 */
export interface RuleDictionary {
  [ruleId: string]: string; // ruleId -> ruleName
}

/**
 * @interface RuleDictionaryResult
 * @description Result of dictionary operations
 */
export interface RuleDictionaryResult {
  dictionary: RuleDictionary;
  added: string[];
  skipped: string[];
  warnings: string[];
}

/**
 * @interface RuleLoadResult
 * @description Result of loading rules
 */
export interface RuleLoadResult {
  rules: RuleDictionary;
  errors: string[];
  warnings: string[];
}

/**
 * @interface RuleConfig
 * @description Configuration for loading rules
 */
export interface RuleConfig {
  /** Rule sets to include (can be local files or remote URLs) */
  ruleSets: string[];
  /** Rules to override (merge with existing rules by ID) */
  overrideRules?: { [ruleId: string]: string }[];
  /** Additional custom rules to add */
  customRules?: { [ruleId: string]: string }[];
}
