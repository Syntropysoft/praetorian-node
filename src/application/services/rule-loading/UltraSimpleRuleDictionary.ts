/**
 * @file src/application/services/rule-loading/UltraSimpleRuleDictionary.ts
 * @description Ultra-simple rule dictionary - ID as key, name as value (SOLID SRP + Functional Programming)
 */

import { RuleDictionary, RuleDictionaryResult } from '../../../shared/types/rule-dictionary';

/**
 * Creates an empty rule dictionary
 * @returns Empty rule dictionary
 */
export const createEmptyDictionary = (): RuleDictionary => ({});

/**
 * Adds rules to dictionary, skipping duplicates (Guard Clause Pattern)
 * @param dictionary - Current dictionary
 * @param rules - Rules to add (ID -> Name mapping)
 * @param source - Source identifier for warnings
 * @returns Dictionary result with added/skipped rules
 */
export const addRulesToDictionary = (
  dictionary: RuleDictionary,
  rules: { [ruleId: string]: string },
  source: string = 'unknown'
): RuleDictionaryResult => {
  // Guard clause: no rules to add
  if (!rules || Object.keys(rules).length === 0) {
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

  for (const [ruleId, ruleName] of Object.entries(rules)) {
    // Guard clause: no ID
    if (!ruleId || ruleId.trim().length === 0) {
      warnings.push(`Rule from ${source} has no ID, skipping`);
      continue;
    }

    // Guard clause: no name
    if (!ruleName || ruleName.trim().length === 0) {
      warnings.push(`Rule '${ruleId}' from ${source} has no name, skipping`);
      continue;
    }

    if (newDictionary[ruleId]) {
      // Rule already exists
      skipped.push(ruleId);
      warnings.push(`Rule '${ruleId}' already exists, skipping duplicate from ${source}`);
    } else {
      // Add new rule
      newDictionary[ruleId] = ruleName;
      added.push(ruleId);
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
 * Merges multiple rule dictionaries (Functional Composition)
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
    
    const mergeResult = addRulesToDictionary(result, dict, source);
    
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
 * Gets rule name by ID (Pure Function)
 * @param dictionary - Rule dictionary
 * @param ruleId - Rule ID to find
 * @returns Rule name if found, undefined otherwise
 */
export const getRuleNameById = (dictionary: RuleDictionary, ruleId: string): string | undefined => {
  return dictionary[ruleId];
};

/**
 * Checks if rule exists in dictionary (Pure Function)
 * @param dictionary - Rule dictionary
 * @param ruleId - Rule ID to check
 * @returns True if rule exists
 */
export const hasRule = (dictionary: RuleDictionary, ruleId: string): boolean => {
  return ruleId in dictionary;
};

/**
 * Gets dictionary statistics (Pure Function)
 * @param dictionary - Rule dictionary
 * @returns Statistics about the dictionary
 */
export const getDictionaryStats = (dictionary: RuleDictionary) => {
  const ruleIds = Object.keys(dictionary);
  const ruleNames = Object.values(dictionary);
  
  return {
    totalRules: ruleIds.length,
    uniqueIds: ruleIds.length,
    ruleIds: ruleIds.sort(),
    ruleNames: ruleNames.sort(),
  };
};

/**
 * Filters dictionary by predicate (Pure Function)
 * @param dictionary - Rule dictionary
 * @param predicate - Filter function
 * @returns Filtered dictionary
 */
export const filterDictionary = (
  dictionary: RuleDictionary,
  predicate: (ruleId: string, ruleName: string) => boolean
): RuleDictionary => {
  const filtered: RuleDictionary = {};
  
  for (const [ruleId, ruleName] of Object.entries(dictionary)) {
    if (predicate(ruleId, ruleName)) {
      filtered[ruleId] = ruleName;
    }
  }
  
  return filtered;
};

/**
 * Removes rules from dictionary (Pure Function)
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
 * Overrides rules in dictionary (Pure Function)
 * @param dictionary - Rule dictionary
 * @param overrides - Rules to override (ID -> Name mapping)
 * @returns New dictionary with overridden rules
 */
export const overrideRulesInDictionary = (
  dictionary: RuleDictionary,
  overrides: { [ruleId: string]: string }[]
): RuleDictionaryResult => {
  const newDictionary = { ...dictionary };
  const overridden: string[] = [];
  const warnings: string[] = [];

  for (const override of overrides) {
    for (const [ruleId, ruleName] of Object.entries(override)) {
      // Guard clause: no ID in override
      if (!ruleId || ruleId.trim().length === 0) {
        warnings.push('Override rule has no ID, skipping');
        continue;
      }

      // Guard clause: no name in override
      if (!ruleName || ruleName.trim().length === 0) {
        warnings.push(`Override rule '${ruleId}' has no name, skipping`);
        continue;
      }

      if (newDictionary[ruleId]) {
        // Override existing rule
        newDictionary[ruleId] = ruleName;
        overridden.push(ruleId);
      } else {
        warnings.push(`Cannot override rule '${ruleId}' - rule not found in dictionary`);
      }
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
 * Converts array of rule objects to dictionary (Pure Function)
 * @param rules - Array of rule objects with id and name
 * @returns Dictionary mapping
 */
export const arrayToDictionary = (rules: { id: string; name: string }[]): RuleDictionary => {
  const dictionary: RuleDictionary = {};
  
  for (const rule of rules) {
    if (rule.id && rule.name) {
      dictionary[rule.id] = rule.name;
    }
  }
  
  return dictionary;
};

/**
 * Converts dictionary to array of rule objects (Pure Function)
 * @param dictionary - Rule dictionary
 * @returns Array of rule objects
 */
export const dictionaryToArray = (dictionary: RuleDictionary): { id: string; name: string }[] => {
  return Object.entries(dictionary).map(([id, name]) => ({ id, name }));
};
