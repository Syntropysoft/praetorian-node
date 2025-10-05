/**
 * @file src/application/services/rule-loading/RuleDictionary.ts
 * @description Pure functional rule dictionary to manage unique rule loading
 */

import { PraetorianRule } from '../../../shared/types/rules';

/**
 * @interface RuleDictionary
 * @description Dictionary of rules indexed by ID
 */
export interface RuleDictionary {
  [ruleId: string]: PraetorianRule;
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
 * Creates an empty rule dictionary
 * @returns Empty rule dictionary
 */
export const createEmptyDictionary = (): RuleDictionary => ({});

/**
 * Adds rules to dictionary, skipping duplicates
 * @param dictionary - Current dictionary
 * @param rules - Rules to add
 * @param source - Source identifier for warnings
 * @returns Dictionary result with added/skipped rules
 */
export const addRulesToDictionary = (
  dictionary: RuleDictionary,
  rules: PraetorianRule[],
  source: string = 'unknown'
): RuleDictionaryResult => {
  // Guard clause: no rules to add
  if (!rules || rules.length === 0) {
    return {
      dictionary,
      added: [],
      skipped: [],
      warnings: [],
    };
  }

  const newDictionary = { ...dictionary };
  const added: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    // Guard clause: rule without ID
    if (!rule.id) {
      warnings.push(`Rule from ${source} has no ID, skipping`);
      continue;
    }

    if (newDictionary[rule.id]) {
      // Rule already exists
      skipped.push(rule.id);
      warnings.push(`Rule '${rule.id}' already exists, skipping duplicate from ${source}`);
    } else {
      // Add new rule
      newDictionary[rule.id] = rule;
      added.push(rule.id);
    }
  }

  return {
    dictionary: newDictionary,
    added,
    skipped,
    warnings,
  };
};

/**
 * Merges multiple rule dictionaries
 * @param dictionaries - Array of dictionaries to merge
 * @param sources - Source identifiers for warnings
 * @returns Merged dictionary result
 */
export const mergeRuleDictionaries = (
  dictionaries: RuleDictionary[],
  sources: string[] = []
): RuleDictionaryResult => {
  // Guard clause: no dictionaries
  if (!dictionaries || dictionaries.length === 0) {
    return {
      dictionary: createEmptyDictionary(),
      added: [],
      skipped: [],
      warnings: [],
    };
  }

  let result = createEmptyDictionary();
  const allAdded: string[] = [];
  const allSkipped: string[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < dictionaries.length; i++) {
    const dict = dictionaries[i];
    const source = sources[i] || `source-${i}`;
    
    // Convert dictionary to array of rules
    const rules = Object.values(dict);
    
    const mergeResult = addRulesToDictionary(result, rules, source);
    
    result = mergeResult.dictionary;
    allAdded.push(...mergeResult.added);
    allSkipped.push(...mergeResult.skipped);
    allWarnings.push(...mergeResult.warnings);
  }

  return {
    dictionary: result,
    added: allAdded,
    skipped: allSkipped,
    warnings: allWarnings,
  };
};

/**
 * Converts dictionary to array of rules
 * @param dictionary - Rule dictionary
 * @returns Array of rules
 */
export const dictionaryToRules = (dictionary: RuleDictionary): PraetorianRule[] => {
  return Object.values(dictionary);
};

/**
 * Gets rule by ID from dictionary
 * @param dictionary - Rule dictionary
 * @param ruleId - Rule ID to find
 * @returns Rule if found, undefined otherwise
 */
export const getRuleById = (dictionary: RuleDictionary, ruleId: string): PraetorianRule | undefined => {
  return dictionary[ruleId];
};

/**
 * Checks if rule exists in dictionary
 * @param dictionary - Rule dictionary
 * @param ruleId - Rule ID to check
 * @returns True if rule exists
 */
export const hasRule = (dictionary: RuleDictionary, ruleId: string): boolean => {
  return ruleId in dictionary;
};

/**
 * Gets rules by category from dictionary
 * @param dictionary - Rule dictionary
 * @param category - Category to filter by
 * @returns Array of rules in category
 */
export const getRulesByCategory = (dictionary: RuleDictionary, category: string): PraetorianRule[] => {
  return Object.values(dictionary).filter(rule => rule.category === category);
};

/**
 * Gets rules by type from dictionary
 * @param dictionary - Rule dictionary
 * @param type - Type to filter by
 * @returns Array of rules of type
 */
export const getRulesByType = (dictionary: RuleDictionary, type: string): PraetorianRule[] => {
  return Object.values(dictionary).filter(rule => rule.type === type);
};

/**
 * Gets enabled rules from dictionary
 * @param dictionary - Rule dictionary
 * @returns Array of enabled rules
 */
export const getEnabledRules = (dictionary: RuleDictionary): PraetorianRule[] => {
  return Object.values(dictionary).filter(rule => rule.enabled);
};

/**
 * Gets disabled rules from dictionary
 * @param dictionary - Rule dictionary
 * @returns Array of disabled rules
 */
export const getDisabledRules = (dictionary: RuleDictionary): PraetorianRule[] => {
  return Object.values(dictionary).filter(rule => !rule.enabled);
};

/**
 * Gets dictionary statistics
 * @param dictionary - Rule dictionary
 * @returns Statistics about the dictionary
 */
export const getDictionaryStats = (dictionary: RuleDictionary) => {
  const rules = Object.values(dictionary);
  const categories = new Set(rules.map(rule => rule.category));
  const types = new Set(rules.map(rule => rule.type));
  const severities = new Set(rules.map(rule => rule.severity));
  
  return {
    totalRules: rules.length,
    enabledRules: rules.filter(rule => rule.enabled).length,
    disabledRules: rules.filter(rule => !rule.enabled).length,
    categories: Array.from(categories),
    types: Array.from(types),
    severities: Array.from(severities),
    uniqueIds: Object.keys(dictionary).length,
  };
};

/**
 * Filters dictionary by predicate
 * @param dictionary - Rule dictionary
 * @param predicate - Filter function
 * @returns Filtered dictionary
 */
export const filterDictionary = (
  dictionary: RuleDictionary,
  predicate: (rule: PraetorianRule) => boolean
): RuleDictionary => {
  const filtered: RuleDictionary = {};
  
  for (const [id, rule] of Object.entries(dictionary)) {
    if (predicate(rule)) {
      filtered[id] = rule;
    }
  }
  
  return filtered;
};

/**
 * Removes rules from dictionary
 * @param dictionary - Rule dictionary
 * @param ruleIds - Rule IDs to remove
 * @returns New dictionary without specified rules
 */
export const removeRulesFromDictionary = (
  dictionary: RuleDictionary,
  ruleIds: string[]
): RuleDictionary => {
  const newDictionary = { ...dictionary };
  
  for (const ruleId of ruleIds) {
    delete newDictionary[ruleId];
  }
  
  return newDictionary;
};

/**
 * Overrides rules in dictionary
 * @param dictionary - Rule dictionary
 * @param overrides - Rules to override (by ID)
 * @returns New dictionary with overridden rules
 */
export const overrideRulesInDictionary = (
  dictionary: RuleDictionary,
  overrides: Partial<PraetorianRule>[]
): RuleDictionaryResult => {
  const newDictionary = { ...dictionary };
  const overridden: string[] = [];
  const warnings: string[] = [];

  for (const override of overrides) {
    // Guard clause: no ID in override
    if (!override.id) {
      warnings.push('Override rule has no ID, skipping');
      continue;
    }

    if (newDictionary[override.id]) {
      // Merge with existing rule
      newDictionary[override.id] = {
        ...newDictionary[override.id],
        ...override,
        id: override.id, // Ensure ID is not overridden
      } as PraetorianRule;
      overridden.push(override.id);
    } else {
      warnings.push(`Cannot override rule '${override.id}' - rule not found in dictionary`);
    }
  }

  return {
    dictionary: newDictionary,
    added: overridden,
    skipped: [],
    warnings,
  };
};
