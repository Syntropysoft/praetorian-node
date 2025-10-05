/**
 * @file tests/integration/simple-rule-system.integration.test.ts
 * @description Tests for the simplified rule system - one rule = one dictionary entry
 */

import { SimpleRuleLoaderService } from '../../src/application/services/SimpleRuleLoaderService';
import { SimpleRuleConfig } from '../../src/shared/types/simple-rules';
import { 
  addSimpleRulesToDictionary, 
  createEmptySimpleDictionary,
  getSimpleDictionaryStats 
} from '../../src/application/services/rule-loading/SimpleRuleDictionary';
import fs from 'fs';
import path from 'path';

describe('Simple Rule System Integration Tests', () => {
  let ruleLoader: SimpleRuleLoaderService;
  let tempDir: string;

  beforeEach(() => {
    ruleLoader = new SimpleRuleLoaderService();
    tempDir = fs.mkdtempSync('praetorian-test-');
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Core Concept: One Rule = One Dictionary Entry', () => {
    it('should load the same rule 200 times and only store it once', () => {
      // Create 200 identical rules
      const duplicateRule = { id: 'test-rule', name: 'Test Rule' };
      const rules200 = Array(200).fill(duplicateRule);

      // Start with empty dictionary
      let dictionary = createEmptySimpleDictionary();

      // Add all 200 rules to dictionary
      const result = addSimpleRulesToDictionary(dictionary, rules200, 'test-source');

      // Should only have 1 rule in dictionary (not 200!)
      expect(Object.keys(result.dictionary)).toHaveLength(1);
      expect(result.dictionary['test-rule']).toEqual(duplicateRule);

      // Should have 1 added and 199 skipped
      expect(result.added).toEqual(['test-rule']);
      expect(result.skipped).toHaveLength(199);
      expect(result.warnings).toHaveLength(199);
      
      // All warnings should mention duplicates
      expect(result.warnings.every(warning => 
        warning.includes('already exists, skipping duplicate')
      )).toBe(true);

      // Dictionary stats should show only 1 unique rule
      const stats = getSimpleDictionaryStats(result.dictionary);
      expect(stats.totalRules).toBe(1);
      expect(stats.uniqueIds).toBe(1);
    });

    it('should handle mixed rules with duplicates', () => {
      const rules = [
        { id: 'rule-1', name: 'Rule 1' },
        { id: 'rule-2', name: 'Rule 2' },
        { id: 'rule-1', name: 'Rule 1 Duplicate' }, // Duplicate ID
        { id: 'rule-3', name: 'Rule 3' },
        { id: 'rule-2', name: 'Rule 2 Duplicate' }, // Duplicate ID
        { id: 'rule-4', name: 'Rule 4' },
      ];

      let dictionary = createEmptySimpleDictionary();
      const result = addSimpleRulesToDictionary(dictionary, rules, 'test-source');

      // Should have 4 unique rules (not 6)
      expect(Object.keys(result.dictionary)).toHaveLength(4);
      
      // Should have added 4 rules and skipped 2
      expect(result.added).toHaveLength(4);
      expect(result.skipped).toHaveLength(2);
      expect(result.warnings).toHaveLength(2);

      // Check that the first occurrence of each rule is kept
      expect(result.dictionary['rule-1']).toEqual({ id: 'rule-1', name: 'Rule 1' });
      expect(result.dictionary['rule-2']).toEqual({ id: 'rule-2', name: 'Rule 2' });
      expect(result.dictionary['rule-3']).toEqual({ id: 'rule-3', name: 'Rule 3' });
      expect(result.dictionary['rule-4']).toEqual({ id: 'rule-4', name: 'Rule 4' });
    });
  });

  describe('Rule Loading from Files', () => {
    it('should load rules from YAML file and deduplicate', async () => {
      // Create YAML file with duplicate rules
      const yamlContent = `
rules:
  - id: "app-name-required"
    name: "Application Name Required"
  - id: "version-required"
    name: "Version Required"
  - id: "app-name-required"  # Duplicate!
    name: "Application Name Required (Duplicate)"
  - id: "description-required"
    name: "Description Required"
`;

      const ruleFile = path.join(tempDir, 'rules.yaml');
      fs.writeFileSync(ruleFile, yamlContent);

      const config: SimpleRuleConfig = {
        ruleSets: [ruleFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have 3 unique rules (not 4)
      expect(result.rules).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      
      // Should have warnings about duplicates
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warning => 
        warning.includes('already exists, skipping duplicate')
      )).toBe(true);

      // Check specific rules
      const ruleIds = result.rules.map(rule => rule.id);
      expect(ruleIds).toContain('app-name-required');
      expect(ruleIds).toContain('version-required');
      expect(ruleIds).toContain('description-required');
      
      // Should only have one app-name-required rule
      const appNameRules = result.rules.filter(rule => rule.id === 'app-name-required');
      expect(appNameRules).toHaveLength(1);
    });

    it('should load rules from JSON file and deduplicate', async () => {
      // Create JSON file with duplicate rules
      const jsonContent = {
        rules: [
          { id: 'test-rule-1', name: 'Test Rule 1' },
          { id: 'test-rule-2', name: 'Test Rule 2' },
          { id: 'test-rule-1', name: 'Test Rule 1 Duplicate' }, // Duplicate
          { id: 'test-rule-3', name: 'Test Rule 3' },
        ]
      };

      const ruleFile = path.join(tempDir, 'rules.json');
      fs.writeFileSync(ruleFile, JSON.stringify(jsonContent, null, 2));

      const config: SimpleRuleConfig = {
        ruleSets: [ruleFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have 3 unique rules (not 4)
      expect(result.rules).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      
      // Should have warnings about duplicates
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Core Rules Integration', () => {
    it('should load core rules and deduplicate with custom rules', async () => {
      // Create custom rule file with a rule that exists in core rules
      const customRuleContent = `
rules:
  - id: "required-config-version"  # This exists in core rules!
    name: "Custom Version Rule"
  - id: "my-custom-rule"
    name: "My Custom Rule"
`;

      const customRuleFile = path.join(tempDir, 'custom-rules.yaml');
      fs.writeFileSync(customRuleFile, customRuleContent);

      const config: SimpleRuleConfig = {
        ruleSets: ['@praetorian/core/all', customRuleFile],
        customRules: [
          { id: 'another-custom-rule', name: 'Another Custom Rule' },
          { id: 'my-custom-rule', name: 'My Custom Rule Duplicate' }, // Duplicate of file rule
        ],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have core rules + unique custom rules
      expect(result.rules.length).toBeGreaterThan(10); // Core rules are many
      expect(result.errors).toHaveLength(0);
      
      // Should have warnings about duplicates
      expect(result.warnings.length).toBeGreaterThan(0);

      // Check that core rule was not overridden by custom rule
      const coreVersionRule = result.rules.find(rule => rule.id === 'required-config-version');
      expect(coreVersionRule).toBeDefined();
      expect(coreVersionRule?.name).toBe('Config Version Required'); // Core rule name, not custom

      // Check that custom rules were added
      const customRule = result.rules.find(rule => rule.id === 'my-custom-rule');
      expect(customRule).toBeDefined();
      expect(customRule?.name).toBe('My Custom Rule'); // First occurrence kept

      const anotherCustomRule = result.rules.find(rule => rule.id === 'another-custom-rule');
      expect(anotherCustomRule).toBeDefined();
    });
  });

  describe('Rule Overrides', () => {
    it('should override rule names but keep unique IDs', async () => {
      const config: SimpleRuleConfig = {
        ruleSets: ['@praetorian/core/all'],
        overrideRules: [
          { id: 'version-format', name: 'Custom Version Format Name' },
          { id: 'non-existent-rule', name: 'This Should Not Work' }, // Non-existent rule
        ],
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.errors).toHaveLength(0);
      
      // Should have warnings about non-existent override
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warning => 
        warning.includes('Cannot override rule')
      )).toBe(true);

      // Check that override worked for existing rule
      const overriddenRule = result.rules.find(rule => rule.id === 'version-format');
      expect(overriddenRule).toBeDefined();
      expect(overriddenRule?.name).toBe('Custom Version Format Name');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rule files gracefully', async () => {
      const emptyYamlContent = `rules: []`;
      const ruleFile = path.join(tempDir, 'empty-rules.yaml');
      fs.writeFileSync(ruleFile, emptyYamlContent);

      const config: SimpleRuleConfig = {
        ruleSets: [ruleFile],
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.rules).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle malformed rule files gracefully', async () => {
      const malformedContent = `invalid yaml content: [`;
      const ruleFile = path.join(tempDir, 'malformed-rules.yaml');
      fs.writeFileSync(ruleFile, malformedContent);

      const config: SimpleRuleConfig = {
        ruleSets: [ruleFile],
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.rules).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to parse content');
    });

    it('should handle rules without ID or name', async () => {
      const invalidRulesContent = `
rules:
  - name: "Rule without ID"
  - id: "rule-without-name"
  - id: "valid-rule"
    name: "Valid Rule"
`;

      const ruleFile = path.join(tempDir, 'invalid-rules.yaml');
      fs.writeFileSync(ruleFile, invalidRulesContent);

      const config: SimpleRuleConfig = {
        ruleSets: [ruleFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should only have the valid rule
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].id).toBe('valid-rule');
      expect(result.rules[0].name).toBe('Valid Rule');
      
      // Should have validation errors for invalid rules
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
