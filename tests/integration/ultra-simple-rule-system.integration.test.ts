/**
 * @file tests/integration/ultra-simple-rule-system.integration.test.ts
 * @description Tests for ultra-simple rule system - ID as key, name as value
 */

import { 
  createEmptyDictionary,
  addRulesToDictionary,
  getDictionaryStats,
  getRuleNameById,
  hasRule,
  arrayToDictionary,
  dictionaryToArray,
} from '../../src/application/services/rule-loading/UltraSimpleRuleDictionary';
import { ALL_CORE_RULES, CORE_STRUCTURE_RULES } from '../../src/shared/rules/ultra-simple-core-rules';

describe('Ultra-Simple Rule System Integration Tests', () => {
  describe('Core Concept: ID as Key, Name as Value', () => {
    it('should load the same rule 200 times and only store it once', () => {
      // Create 200 identical rules
      const duplicateRule = { 'test-rule': 'Test Rule' };
      const rules200 = Array(200).fill(duplicateRule);

      // Start with empty dictionary
      let dictionary = createEmptyDictionary();

      // Add all 200 rules to dictionary one by one
      for (const rule of rules200) {
        const result = addRulesToDictionary(dictionary, rule, 'test-source');
        dictionary = result.dictionary;
      }

      // Should only have 1 rule in dictionary (not 200!)
      const stats = getDictionaryStats(dictionary);
      expect(stats.totalRules).toBe(1);
      expect(stats.uniqueIds).toBe(1);
      
      // Check the rule
      expect(dictionary['test-rule']).toBe('Test Rule');
      expect(hasRule(dictionary, 'test-rule')).toBe(true);
      expect(getRuleNameById(dictionary, 'test-rule')).toBe('Test Rule');
    });

    it('should handle mixed rules with duplicates', () => {
      const rules: { [key: string]: string }[] = [
        { 'rule-1': 'Rule 1' },
        { 'rule-2': 'Rule 2' },
        { 'rule-1': 'Rule 1 Duplicate' }, // Duplicate ID
        { 'rule-3': 'Rule 3' },
        { 'rule-2': 'Rule 2 Duplicate' }, // Duplicate ID
        { 'rule-4': 'Rule 4' },
      ];

      let dictionary = createEmptyDictionary();
      let allWarnings: string[] = [];
      let allAdded: string[] = [];
      let allSkipped: string[] = [];

      // Add all rules
      for (const rule of rules) {
        const result = addRulesToDictionary(dictionary, rule, 'test-source');
        dictionary = result.dictionary;
        allAdded.push(...result.added);
        allSkipped.push(...result.skipped);
        allWarnings.push(...result.warnings);
      }

      // Should have 4 unique rules (not 6)
      const stats = getDictionaryStats(dictionary);
      expect(stats.totalRules).toBe(4);
      
      // Should have added 4 rules and skipped 2
      expect(allAdded).toHaveLength(4);
      expect(allSkipped).toHaveLength(2);
      expect(allWarnings).toHaveLength(2);

      // Check that the first occurrence of each rule is kept
      expect(dictionary['rule-1']).toBe('Rule 1');
      expect(dictionary['rule-2']).toBe('Rule 2');
      expect(dictionary['rule-3']).toBe('Rule 3');
      expect(dictionary['rule-4']).toBe('Rule 4');
    });

    it('should demonstrate the ultra-simple structure', () => {
      const dictionary = {
        'app-name-required': 'Application Name Required',
        'version-required': 'Version Required',
        'description-required': 'Description Required',
      };

      // This is the entire rule structure - just ID -> Name
      expect(dictionary['app-name-required']).toBe('Application Name Required');
      expect(dictionary['version-required']).toBe('Version Required');
      expect(dictionary['description-required']).toBe('Description Required');

      // Easy to check if rule exists
      expect('app-name-required' in dictionary).toBe(true);
      expect('non-existent-rule' in dictionary).toBe(false);

      // Easy to get all rule IDs
      const ruleIds = Object.keys(dictionary);
      expect(ruleIds).toEqual(['app-name-required', 'version-required', 'description-required']);

      // Easy to get all rule names
      const ruleNames = Object.values(dictionary);
      expect(ruleNames).toEqual(['Application Name Required', 'Version Required', 'Description Required']);
    });
  });

  describe('Core Rules Integration', () => {
    it('should load core rules and demonstrate the structure', () => {
      // Core rules are just ID -> Name mappings
      expect(ALL_CORE_RULES['required-config-version']).toBe('Config Version Required');
      expect(ALL_CORE_RULES['version-format']).toBe('Version Format Validation');
      expect(ALL_CORE_RULES['no-secrets-in-config']).toBe('No Secrets in Configuration');

      // Easy to check categories
      expect(CORE_STRUCTURE_RULES['required-config-version']).toBe('Config Version Required');
      expect(CORE_STRUCTURE_RULES['version-format']).toBeUndefined(); // Not in structure rules
    });

    it('should merge core rules with custom rules and deduplicate', () => {
      const customRules = {
        'my-custom-rule': 'My Custom Rule',
        'required-config-version': 'My Custom Version Rule', // Override core rule
      };

      let dictionary = createEmptyDictionary();
      
      // Add core rules first
      const coreResult = addRulesToDictionary(dictionary, ALL_CORE_RULES, 'core-rules');
      dictionary = coreResult.dictionary;
      
      // Add custom rules
      const customResult = addRulesToDictionary(dictionary, customRules, 'custom-rules');
      dictionary = customResult.dictionary;

      // Should have all core rules + custom rules
      const stats = getDictionaryStats(dictionary);
      expect(stats.totalRules).toBeGreaterThan(10); // Core rules are many
      
      // Should have warnings about duplicates
      expect(customResult.warnings.length).toBeGreaterThan(0);
      expect(customResult.warnings.some(warning => 
        warning.includes('already exists, skipping duplicate')
      )).toBe(true);

      // Custom rule should be added
      expect(dictionary['my-custom-rule']).toBe('My Custom Rule');
      
      // Core rule should still have original name (first occurrence wins)
      expect(dictionary['required-config-version']).toBe('Config Version Required');
    });
  });

  describe('Conversion Functions', () => {
    it('should convert array to dictionary and back', () => {
      const ruleArray = [
        { id: 'rule-1', name: 'Rule 1' },
        { id: 'rule-2', name: 'Rule 2' },
        { id: 'rule-3', name: 'Rule 3' },
      ];

      // Convert array to dictionary
      const dictionary = arrayToDictionary(ruleArray);
      expect(dictionary).toEqual({
        'rule-1': 'Rule 1',
        'rule-2': 'Rule 2',
        'rule-3': 'Rule 3',
      });

      // Convert dictionary back to array
      const backToArray = dictionaryToArray(dictionary);
      expect(backToArray).toEqual(ruleArray);
    });

    it('should handle empty arrays and dictionaries', () => {
      const emptyArray: { id: string; name: string }[] = [];
      const emptyDictionary = createEmptyDictionary();

      expect(arrayToDictionary(emptyArray)).toEqual({});
      expect(dictionaryToArray(emptyDictionary)).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rules without ID or name', () => {
      const invalidRules = {
        '': 'Rule without ID',
        'valid-rule': '',
        'another-valid-rule': 'Valid Rule',
      };

      const result = addRulesToDictionary(createEmptyDictionary(), invalidRules, 'test-source');

      // Should only have the valid rule
      expect(Object.keys(result.dictionary)).toHaveLength(1);
      expect(result.dictionary['another-valid-rule']).toBe('Valid Rule');
      
      // Should have warnings for invalid rules
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should preserve dictionary immutability', () => {
      const original: { [key: string]: string } = { 'rule-1': 'Rule 1' };
      const additional = { 'rule-2': 'Rule 2' };
      
      const result = addRulesToDictionary(original, additional, 'test-source');
      
      // Original should remain unchanged
      expect(Object.keys(original)).toHaveLength(1);
      expect(original['rule-1']).toBe('Rule 1');
      expect(original['rule-2']).toBeUndefined();
      
      // Result should have both rules
      expect(Object.keys(result.dictionary)).toHaveLength(2);
      expect(result.dictionary['rule-1']).toBe('Rule 1');
      expect(result.dictionary['rule-2']).toBe('Rule 2');
    });
  });
});
