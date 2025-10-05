/**
 * @file src/application/services/rule-loading/SimpleRuleDictionary.ts
 * @description Pure functional dictionary for simple rules (SOLID SRP + Functional Programming)
 */

import { SimpleRule, SimpleRuleDictionary, SimpleRuleDictionaryResult } from '../../../shared/types/simple-rules';

/**
 * Creates an empty simple rule dictionary
 * @returns Empty rule dictionary
 */
export const createEmptySimpleDictionary = (): SimpleRuleDictionary => ({});

/**
 * Adds simple rules to dictionary, skipping duplicates (Guard Clause Pattern)
 * @param dictionary - Current dictionary
 * @param rules - Rules to add
 * @param source - Source identifier for warnings
 * @returns Dictionary result with added/skipped rules
 */
export const addSimpleRulesToDictionary = (
  dictionary: SimpleRuleDictionary,
  rules: SimpleRule[],
  source: string = 'unknown'
): SimpleRuleDictionaryResult => {
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
    if (!rule.id || rule.id.trim().length === 0) {
      warnings.push(`Rule from ${source} has no ID, skipping`);
      continue;
    }

    // Guard clause: rule without name
    if (!rule.name || rule.name.trim().length === 0) {
      warnings.push(`Rule '${rule.id}' from ${source} has no name, skipping`);
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
 * Merges multiple simple rule dictionaries (Functional Composition)
 * @param dictionaries - Array of dictionaries to merge
 * @param sources - Source identifiers for warnings
 * @returns Merged dictionary result
 */
export const mergeSimpleRuleDictionaries = (
  dictionaries: SimpleRuleDictionary[],
  sources: string[] = []
): SimpleRuleDictionaryResult => {
  // Guard clause: no dictionaries
  if (!dictionaries || dictionaries.length === 0) {
    return {
      dictionary: createEmptySimpleDictionary(),
      added: [],
      skipped: [],
      warnings: [],
    };
  }

  let result = createEmptySimpleDictionary();
  const allAdded: string[] = [];
  const allSkipped: string[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < dictionaries.length; i++) {
    const dict = dictionaries[i];
    const source = sources[i] || `source-${i}`;
    
    // Convert dictionary to array of rules
    const rules = Object.values(dict);
    
    const mergeResult = addSimpleRulesToDictionary(result, rules, source);
    
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
 * Converts dictionary to array of simple rules (Pure Function)
 * @param dictionary - Rule dictionary
 * @returns Array of rules
 */
export const simpleDictionaryToRules = (dictionary: SimpleRuleDictionary): SimpleRule[] => {
  return Object.values(dictionary);
};

/**
 * Gets simple rule by ID from dictionary (Pure Function)
 * @param dictionary - Rule dictionary
 * @param ruleId - Rule ID to find
 * @returns Rule if found, undefined otherwise
 */
export const getSimpleRuleById = (dictionary: SimpleRuleDictionary, ruleId: string): SimpleRule | undefined => {
  return dictionary[ruleId];
};

/**
 * Checks if simple rule exists in dictionary (Pure Function)
 * @param dictionary - Rule dictionary
 * @param ruleId - Rule ID to check
 * @returns True if rule exists
 */
export const hasSimpleRule = (dictionary: SimpleRuleDictionary, ruleId: string): boolean => {
  return ruleId in dictionary;
};

/**
 * Gets simple rule dictionary statistics (Pure Function)
 * @param dictionary - Rule dictionary
 * @returns Statistics about the dictionary
 */
export const getSimpleDictionaryStats = (dictionary: SimpleRuleDictionary) => {
  const rules = Object.values(dictionary);
  const uniqueIds = Object.keys(dictionary).length;
  
  return {
    totalRules: rules.length,
    uniqueIds,
    ruleIds: Object.keys(dictionary).sort(),
    ruleNames: rules.map(rule => rule.name).sort(),
  };
};

/**
 * Filters simple dictionary by predicate (Pure Function)
 * @param dictionary - Rule dictionary
 * @param predicate - Filter function
 * @returns Filtered dictionary
 */
export const filterSimpleDictionary = (
  dictionary: SimpleRuleDictionary,
  predicate: (rule: SimpleRule) => boolean
): SimpleRuleDictionary => {
  const filtered: SimpleRuleDictionary = {};
  
  for (const [id, rule] of Object.entries(dictionary)) {
    if (predicate(rule)) {
      filtered[id] = rule;
    }
  }
  
  return filtered;
};

/**
 * Removes simple rules from dictionary (Pure Function)
 * @param dictionary - Rule dictionary
 * @param ruleIds - Rule IDs to remove
 * @returns New dictionary without specified rules
 */
export const removeSimpleRulesFromDictionary = (
  dictionary: SimpleRuleDictionary,
  ruleIds: string[]
): SimpleRuleDictionary => {
  const newDictionary = { ...dictionary };
  
  for (const ruleId of ruleIds) {
    delete newDictionary[ruleId];
  }
  
  return newDictionary;
};

/**
 * Overrides simple rules in dictionary (Pure Function)
 * @param dictionary - Rule dictionary
 * @param overrides - Rules to override (by ID)
 * @returns New dictionary with overridden rules
 */
export const overrideSimpleRulesInDictionary = (
  dictionary: SimpleRuleDictionary,
  overrides: Partial<SimpleRule>[]
): SimpleRuleDictionaryResult => {
  const newDictionary = { ...dictionary };
  const overridden: string[] = [];
  const warnings: string[] = [];

  for (const override of overrides) {
    // Guard clause: no ID in override
    if (!override.id || override.id.trim().length === 0) {
      warnings.push('Override rule has no ID, skipping');
      continue;
    }

    if (newDictionary[override.id]) {
      // Merge with existing rule
      newDictionary[override.id] = {
        ...newDictionary[override.id],
        ...override,
        id: override.id, // Ensure ID is not overridden
      };
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

/**
 * Validates simple rule structure (Pure Function with Guard Clauses)
 * @param rule - Rule to validate
 * @returns Validation result
 */
export const validateSimpleRule = (rule: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Guard clause: no rule object
  if (!rule) {
    errors.push('Rule object is required');
    return { valid: false, errors };
  }

  // Guard clause: no ID
  if (!rule.id || typeof rule.id !== 'string' || rule.id.trim().length === 0) {
    errors.push('Rule must have a valid ID');
  }

  // Guard clause: no name
  if (!rule.name || typeof rule.name !== 'string' || rule.name.trim().length === 0) {
    errors.push('Rule must have a valid name');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates array of simple rules (Pure Function)
 * @param rules - Rules to validate
 * @returns Validation result
 */
export const validateSimpleRules = (rules: any[]): { valid: boolean; errors: string[] } => {
  // Guard clause: no rules array
  if (!Array.isArray(rules)) {
    return { valid: false, errors: ['Rules must be an array'] };
  }

  const allErrors: string[] = [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const validation = validateSimpleRule(rule);
    
    if (!validation.valid) {
      allErrors.push(`Rule at index ${i}: ${validation.errors.join(', ')}`);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
};
