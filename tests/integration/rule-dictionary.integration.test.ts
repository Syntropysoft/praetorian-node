/**
 * @file tests/integration/rule-dictionary.integration.test.ts
 * @description Integration tests for the functional rule dictionary
 */

import {
  createEmptyDictionary,
  addRulesToDictionary,
  mergeRuleDictionaries,
  dictionaryToRules,
  getRuleById,
  hasRule,
  getRulesByCategory,
  getRulesByType,
  getEnabledRules,
  getDisabledRules,
  getDictionaryStats,
  filterDictionary,
  removeRulesFromDictionary,
  overrideRulesInDictionary,
  RuleDictionary,
} from '../../src/application/services/rule-loading/RuleDictionary';
import { PraetorianRule } from '../../src/shared/types/rules';

describe('Rule Dictionary Integration Tests', () => {
  // Test rules for consistent testing
  const testRule1: PraetorianRule = {
    id: 'test-rule-1',
    name: 'Test Rule 1',
    description: 'First test rule',
    type: 'structure',
    severity: 'error',
    enabled: true,
    category: 'structure',
    requiredProperties: ['field1'],
  };

  const testRule2: PraetorianRule = {
    id: 'test-rule-2',
    name: 'Test Rule 2',
    description: 'Second test rule',
    type: 'format',
    severity: 'warning',
    enabled: true,
    category: 'format',
    format: 'string',
    propertyPath: 'field2',
  };

  const testRule3: PraetorianRule = {
    id: 'test-rule-3',
    name: 'Test Rule 3',
    description: 'Third test rule (disabled)',
    type: 'security',
    severity: 'error',
    enabled: false,
    category: 'security',
    securityType: 'secret',
    config: { patterns: ['password'] },
  };

  describe('Dictionary Creation and Basic Operations', () => {
    it('should create an empty dictionary', () => {
      const dictionary = createEmptyDictionary();
      
      expect(dictionary).toEqual({});
      expect(Object.keys(dictionary)).toHaveLength(0);
    });

    it('should add rules to dictionary', () => {
      const dictionary = createEmptyDictionary();
      const rules = [testRule1, testRule2];
      
      const result = addRulesToDictionary(dictionary, rules, 'test-source');
      
      expect(result.added).toEqual(['test-rule-1', 'test-rule-2']);
      expect(result.skipped).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(Object.keys(result.dictionary)).toHaveLength(2);
      expect(result.dictionary['test-rule-1']).toEqual(testRule1);
      expect(result.dictionary['test-rule-2']).toEqual(testRule2);
    });

    it('should skip duplicate rules', () => {
      const dictionary = createEmptyDictionary();
      const rules = [testRule1, testRule2];
      
      // Add rules first time
      const firstResult = addRulesToDictionary(dictionary, rules, 'source-1');
      
      // Try to add same rules again
      const secondResult = addRulesToDictionary(
        firstResult.dictionary, 
        rules, 
        'source-2'
      );
      
      expect(secondResult.added).toEqual([]);
      expect(secondResult.skipped).toEqual(['test-rule-1', 'test-rule-2']);
      expect(secondResult.warnings).toHaveLength(2);
      expect(secondResult.warnings[0]).toContain('already exists');
      expect(Object.keys(secondResult.dictionary)).toHaveLength(2);
    });

    it('should handle rules without ID', () => {
      const dictionary = createEmptyDictionary();
      const invalidRule = { ...testRule1, id: '' };
      
      const result = addRulesToDictionary(dictionary, [invalidRule], 'test-source');
      
      expect(result.added).toEqual([]);
      expect(result.skipped).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('no ID');
      expect(Object.keys(result.dictionary)).toHaveLength(0);
    });

    it('should handle empty rules array', () => {
      const dictionary = createEmptyDictionary();
      
      const result = addRulesToDictionary(dictionary, [], 'test-source');
      
      expect(result.added).toEqual([]);
      expect(result.skipped).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.dictionary).toEqual(dictionary);
    });
  });

  describe('Dictionary Merging', () => {
    it('should merge multiple dictionaries', () => {
      const dict1 = createEmptyDictionary();
      const dict2 = createEmptyDictionary();
      
      // Add rules to first dictionary
      const result1 = addRulesToDictionary(dict1, [testRule1], 'source-1');
      
      // Add rules to second dictionary
      const result2 = addRulesToDictionary(dict2, [testRule2], 'source-2');
      
      // Merge dictionaries
      const mergeResult = mergeRuleDictionaries(
        [result1.dictionary, result2.dictionary],
        ['source-1', 'source-2']
      );
      
      expect(mergeResult.added).toEqual(['test-rule-1', 'test-rule-2']);
      expect(Object.keys(mergeResult.dictionary)).toHaveLength(2);
      expect(mergeResult.dictionary['test-rule-1']).toEqual(testRule1);
      expect(mergeResult.dictionary['test-rule-2']).toEqual(testRule2);
    });

    it('should handle duplicate rules in merge', () => {
      const dict1 = createEmptyDictionary();
      const dict2 = createEmptyDictionary();
      
      // Add same rule to both dictionaries
      const result1 = addRulesToDictionary(dict1, [testRule1], 'source-1');
      const result2 = addRulesToDictionary(dict2, [testRule1], 'source-2');
      
      // Merge dictionaries
      const mergeResult = mergeRuleDictionaries(
        [result1.dictionary, result2.dictionary],
        ['source-1', 'source-2']
      );
      
      expect(mergeResult.added).toEqual(['test-rule-1']);
      expect(mergeResult.skipped).toEqual(['test-rule-1']);
      expect(mergeResult.warnings).toHaveLength(1);
      expect(Object.keys(mergeResult.dictionary)).toHaveLength(1);
    });
  });

  describe('Dictionary Query Operations', () => {
    let dictionary: RuleDictionary;

    beforeEach(() => {
      dictionary = createEmptyDictionary();
      const result = addRulesToDictionary(
        dictionary, 
        [testRule1, testRule2, testRule3], 
        'test-source'
      );
      dictionary = result.dictionary;
    });

    it('should convert dictionary to rules array', () => {
      const rules = dictionaryToRules(dictionary);
      
      expect(rules).toHaveLength(3);
      expect(rules).toContain(testRule1);
      expect(rules).toContain(testRule2);
      expect(rules).toContain(testRule3);
    });

    it('should get rule by ID', () => {
      const rule = getRuleById(dictionary, 'test-rule-1');
      
      expect(rule).toEqual(testRule1);
    });

    it('should return undefined for non-existent rule', () => {
      const rule = getRuleById(dictionary, 'non-existent');
      
      expect(rule).toBeUndefined();
    });

    it('should check if rule exists', () => {
      expect(hasRule(dictionary, 'test-rule-1')).toBe(true);
      expect(hasRule(dictionary, 'non-existent')).toBe(false);
    });

    it('should get rules by category', () => {
      const structureRules = getRulesByCategory(dictionary, 'structure');
      const formatRules = getRulesByCategory(dictionary, 'format');
      const securityRules = getRulesByCategory(dictionary, 'security');
      
      expect(structureRules).toHaveLength(1);
      expect(structureRules[0]).toEqual(testRule1);
      
      expect(formatRules).toHaveLength(1);
      expect(formatRules[0]).toEqual(testRule2);
      
      expect(securityRules).toHaveLength(1);
      expect(securityRules[0]).toEqual(testRule3);
    });

    it('should get rules by type', () => {
      const structureRules = getRulesByType(dictionary, 'structure');
      const formatRules = getRulesByType(dictionary, 'format');
      
      expect(structureRules).toHaveLength(1);
      expect(formatRules).toHaveLength(1);
    });

    it('should get enabled rules', () => {
      const enabledRules = getEnabledRules(dictionary);
      
      expect(enabledRules).toHaveLength(2);
      expect(enabledRules).toContain(testRule1);
      expect(enabledRules).toContain(testRule2);
      expect(enabledRules).not.toContain(testRule3);
    });

    it('should get disabled rules', () => {
      const disabledRules = getDisabledRules(dictionary);
      
      expect(disabledRules).toHaveLength(1);
      expect(disabledRules[0]).toEqual(testRule3);
    });

    it('should get dictionary statistics', () => {
      const stats = getDictionaryStats(dictionary);
      
      expect(stats.totalRules).toBe(3);
      expect(stats.enabledRules).toBe(2);
      expect(stats.disabledRules).toBe(1);
      expect(stats.categories).toEqual(['structure', 'format', 'security']);
      expect(stats.types).toEqual(['structure', 'format', 'security']);
      expect(stats.severities).toEqual(['error', 'warning']);
      expect(stats.uniqueIds).toBe(3);
    });
  });

  describe('Dictionary Filtering and Modification', () => {
    let dictionary: RuleDictionary;

    beforeEach(() => {
      dictionary = createEmptyDictionary();
      const result = addRulesToDictionary(
        dictionary, 
        [testRule1, testRule2, testRule3], 
        'test-source'
      );
      dictionary = result.dictionary;
    });

    it('should filter dictionary by predicate', () => {
      const enabledOnly = filterDictionary(dictionary, rule => rule.enabled);
      
      expect(Object.keys(enabledOnly)).toHaveLength(2);
      expect(enabledOnly['test-rule-1']).toEqual(testRule1);
      expect(enabledOnly['test-rule-2']).toEqual(testRule2);
      expect(enabledOnly['test-rule-3']).toBeUndefined();
    });

    it('should remove rules from dictionary', () => {
      const newDictionary = removeRulesFromDictionary(
        dictionary, 
        ['test-rule-1', 'test-rule-3']
      );
      
      expect(Object.keys(newDictionary)).toHaveLength(1);
      expect(newDictionary['test-rule-2']).toEqual(testRule2);
      expect(newDictionary['test-rule-1']).toBeUndefined();
      expect(newDictionary['test-rule-3']).toBeUndefined();
    });

    it('should override rules in dictionary', () => {
      const override: Partial<PraetorianRule> = {
        id: 'test-rule-1',
        severity: 'warning',
        enabled: false,
      };
      
      const result = overrideRulesInDictionary(dictionary, [override]);
      
      expect(result.added).toEqual(['test-rule-1']);
      expect(result.warnings).toEqual([]);
      
      const overriddenRule = result.dictionary['test-rule-1'];
      expect(overriddenRule.severity).toBe('warning');
      expect(overriddenRule.enabled).toBe(false);
      expect(overriddenRule.name).toBe(testRule1.name); // Other properties preserved
    });

    it('should warn when overriding non-existent rule', () => {
      const override: Partial<PraetorianRule> = {
        id: 'non-existent-rule',
        severity: 'warning',
      };
      
      const result = overrideRulesInDictionary(dictionary, [override]);
      
      expect(result.added).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Cannot override rule');
    });

    it('should warn when override has no ID', () => {
      const override: Partial<PraetorianRule> = {
        severity: 'warning',
      };
      
      const result = overrideRulesInDictionary(dictionary, [override]);
      
      expect(result.added).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('no ID');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined inputs gracefully', () => {
      const dictionary = createEmptyDictionary();
      
      // Test with null rules
      const result1 = addRulesToDictionary(dictionary, null as any, 'source');
      expect(result1.dictionary).toEqual(dictionary);
      expect(result1.added).toEqual([]);
      
      // Test with undefined rules
      const result2 = addRulesToDictionary(dictionary, undefined as any, 'source');
      expect(result2.dictionary).toEqual(dictionary);
      expect(result2.added).toEqual([]);
    });

    it('should handle empty merge arrays', () => {
      const result = mergeRuleDictionaries([]);
      
      expect(result.dictionary).toEqual({});
      expect(result.added).toEqual([]);
      expect(result.skipped).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should preserve original dictionary immutability', () => {
      const original = createEmptyDictionary();
      const rules = [testRule1];
      
      const result = addRulesToDictionary(original, rules, 'source');
      
      // Original should remain unchanged
      expect(Object.keys(original)).toHaveLength(0);
      
      // Result should have the new rules
      expect(Object.keys(result.dictionary)).toHaveLength(1);
    });
  });
});
