/**
 * @file tests/integration/pure-functions.integration.test.ts
 * @description Integration tests for pure functions in the rule system
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadRuleSet,
  loadCoreRuleSet,
  loadRuleSetFromFile,
  parseRuleFile,
  parseContentByExtension,
  extractRulesFromContent,
  combineRuleLoadResults,
  RuleSetLoadOptions,
} from '../../src/application/services/rule-loading/RuleSetLoader';
import {
  composeRules,
  addCustomRules,
  applyRuleOverrides,
  validateLoadedRules,
  getRulesByCategory,
  getRulesByTags,
  getEnabledRules,
  getDisabledRules,
  getUniqueCategories,
  getUniqueTags,
} from '../../src/application/services/rule-loading/RuleComposer';
import {
  fileExists,
  readFileSync,
  writeFileSync,
  createDirectorySync,
  parseYamlContent,
  stringifyToYaml,
  resolvePath,
  joinPath,
} from '../../src/infrastructure/parsers/config-parsing/ConfigFileOperations';
import {
  validatePraetorianConfig,
  hasFilesToValidate,
  validateRequiredSections,
  validateFilesSection,
  validateEnvironmentsSection,
} from '../../src/infrastructure/parsers/config-parsing/ConfigValidation';
import { PraetorianRule, RuleConfig } from '../../src/shared/types/rules';
import { PraetorianConfig } from '../../src/shared/types';

describe('Pure Functions Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'praetorian-pure-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('RuleSetLoader Pure Functions', () => {
    it('should load core rule sets correctly', () => {
      const result = loadCoreRuleSet('@praetorian/core/all');
      
      expect(result.errors).toHaveLength(0);
      expect(result.rules.length).toBeGreaterThan(0);
      
      // Should have rules from different categories
      const categories = result.rules.map(rule => rule.category).filter(Boolean);
      expect(categories).toContain('structure');
      expect(categories).toContain('format');
    });

    it('should handle invalid core rule set references', () => {
      const result = loadCoreRuleSet('@praetorian/core/invalid');
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Unknown core rule set');
      expect(result.rules).toHaveLength(0);
    });

    it('should parse YAML content correctly', () => {
      const yamlContent = `
rules:
  - id: "test-rule"
    name: "Test Rule"
    description: "A test rule"
    type: "structure"
    severity: "error"
    enabled: true
`;
      
      const result = parseRuleFile(yamlContent, 'test.yaml');
      
      expect(result.errors).toHaveLength(0);
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].id).toBe('test-rule');
    });

    it('should parse JSON content correctly', () => {
      const jsonContent = JSON.stringify({
        rules: [
          {
            id: 'test-rule-json',
            name: 'Test Rule JSON',
            description: 'A test rule from JSON',
            type: 'format',
            severity: 'warning',
            enabled: true,
          },
        ],
      });
      
      const result = parseRuleFile(jsonContent, 'test.json');
      
      expect(result.errors).toHaveLength(0);
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].id).toBe('test-rule-json');
    });

    it('should handle malformed content gracefully', () => {
      const malformedContent = `
rules:
  - id: "malformed-rule"
    name: "Malformed Rule"
    # Missing required fields
    type: "invalid-type"  # This should cause validation issues
`;
      
      const result = parseRuleFile(malformedContent, 'malformed.yaml');
      
      // Should parse successfully but have validation warnings
      expect(result.errors).toHaveLength(0);
      expect(result.rules.length).toBeGreaterThan(0);
    });

    it('should combine rule load results correctly', () => {
      const result1 = {
        rules: [{ 
          id: 'rule1', 
          name: 'Rule 1', 
          description: 'Test', 
          type: 'structure' as const, 
          severity: 'error' as const, 
          enabled: true,
          category: 'test'
        }],
        errors: ['error1'],
        warnings: ['warning1'],
      };
      
      const result2 = {
        rules: [{ 
          id: 'rule2', 
          name: 'Rule 2', 
          description: 'Test', 
          type: 'format' as const, 
          severity: 'warning' as const, 
          enabled: true,
          format: 'string',
          category: 'test'
        }],
        errors: ['error2'],
        warnings: ['warning2'],
      };
      
      const combined = combineRuleLoadResults([result1, result2]);
      
      expect(combined.rules).toHaveLength(2);
      expect(combined.errors).toHaveLength(2);
      expect(combined.warnings).toHaveLength(2);
      expect(combined.rules.map(r => r.id)).toEqual(['rule1', 'rule2']);
    });
  });

  describe('RuleComposer Pure Functions', () => {
    const baseRules: PraetorianRule[] = [
      {
        id: 'rule1',
        name: 'Rule 1',
        description: 'Base rule 1',
        type: 'structure',
        severity: 'error',
        enabled: true,
        category: 'test',
      },
      {
        id: 'rule2',
        name: 'Rule 2',
        description: 'Base rule 2',
        type: 'format' as const,
        severity: 'warning' as const,
        enabled: true,
        category: 'test',
        format: 'string',
      },
    ];

    it('should add custom rules correctly', () => {
      const customRules: PraetorianRule[] = [
        {
          id: 'custom1',
          name: 'Custom Rule 1',
          description: 'Custom rule',
          type: 'security' as const,
          severity: 'info' as const,
          enabled: true,
          category: 'custom',
          securityType: 'secret' as const,
          config: { patterns: ['password'] },
        },
      ];
      
      const result = addCustomRules(baseRules, customRules);
      
      expect(result).toHaveLength(3);
      expect(result.find(r => r.id === 'custom1')).toBeDefined();
    });

    it('should add rules from different sources', () => {
      const additionalRules: PraetorianRule[] = [
        {
          id: 'rule3',
          name: 'Rule 3',
          description: 'Additional rule',
          type: 'security' as const,
          severity: 'info' as const,
          enabled: true,
          category: 'additional',
          securityType: 'secret' as const,
          config: { patterns: ['token'] },
        },
      ];
      
      const result = addCustomRules(baseRules, additionalRules);
      
      expect(result).toHaveLength(3);
      expect(result.find(r => r.id === 'rule3')).toBeDefined();
    });

    it('should apply rule overrides correctly', () => {
      const overrides: Partial<PraetorianRule>[] = [
        {
          id: 'rule1',
          severity: 'warning', // Change severity
        },
        {
          id: 'new-rule',
          name: 'New Rule',
          description: 'New rule via override',
          type: 'structure',
          severity: 'error',
          enabled: true,
        },
      ];
      
      const result = applyRuleOverrides(baseRules, overrides);
      
      expect(result).toHaveLength(3);
      
      const updatedRule1 = result.find(r => r.id === 'rule1');
      expect(updatedRule1?.severity).toBe('warning');
      
      const newRule = result.find(r => r.id === 'new-rule');
      expect(newRule).toBeDefined();
      expect(newRule?.name).toBe('New Rule');
    });

    it('should validate rules correctly', () => {
      const invalidRules: PraetorianRule[] = [
        {
          id: 'valid-rule',
          name: 'Valid Rule',
          description: 'Valid rule',
          type: 'structure',
          severity: 'error',
          enabled: true,
        },
        {
          id: 'invalid-rule',
          name: '', // Empty name
          description: '', // Empty description
          type: 'format' as const,
          severity: 'error' as const,
          enabled: true,
          format: 'string',
        },
        {
          id: 'duplicate-rule',
          name: 'Duplicate Rule',
          description: 'Duplicate rule',
          type: 'structure' as const,
          severity: 'error' as const,
          enabled: true,
        },
        {
          id: 'duplicate-rule', // Duplicate ID
          name: 'Another Duplicate Rule',
          description: 'Another duplicate rule',
          type: 'format' as const,
          severity: 'warning' as const,
          enabled: true,
          format: 'string',
        },
      ];
      
      const warnings = validateLoadedRules(invalidRules);
      
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.includes('missing required fields'))).toBe(true);
      expect(warnings.some(w => w.includes('Duplicate rule ID found'))).toBe(true);
    });

    it('should filter rules by category correctly', () => {
      const testRules: PraetorianRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          description: 'Test rule',
          type: 'structure',
          severity: 'error',
          enabled: true,
          category: 'test',
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          description: 'Security rule',
          type: 'security' as const,
          severity: 'warning' as const,
          enabled: true,
          category: 'security',
          securityType: 'secret' as const,
          config: { patterns: ['password'] },
        },
      ];
      
      const testCategoryRules = getRulesByCategory(testRules, 'test');
      expect(testCategoryRules).toHaveLength(1);
      expect(testCategoryRules[0].id).toBe('rule1');
      
      const securityCategoryRules = getRulesByCategory(testRules, 'security');
      expect(securityCategoryRules).toHaveLength(1);
      expect(securityCategoryRules[0].id).toBe('rule2');
    });

    it('should filter rules by tags correctly', () => {
      const testRules: PraetorianRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          description: 'Test rule',
          type: 'structure',
          severity: 'error',
          enabled: true,
          tags: ['basic', 'test'],
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          description: 'Security rule',
          type: 'security' as const,
          severity: 'warning' as const,
          enabled: true,
          tags: ['basic', 'security'],
          securityType: 'secret' as const,
          config: { patterns: ['password'] },
        },
      ];
      
      const basicRules = getRulesByTags(testRules, ['basic']);
      expect(basicRules).toHaveLength(2);
      
      const testRules2 = getRulesByTags(testRules, ['test']);
      expect(testRules2).toHaveLength(1);
      expect(testRules2[0].id).toBe('rule1');
      
      const basicAndSecurity = getRulesByTags(testRules, ['basic', 'security']);
      expect(basicAndSecurity).toHaveLength(1);
      expect(basicAndSecurity[0].id).toBe('rule2');
    });

    it('should get enabled and disabled rules correctly', () => {
      const testRules: PraetorianRule[] = [
        {
          id: 'enabled-rule',
          name: 'Enabled Rule',
          description: 'Enabled rule',
          type: 'structure',
          severity: 'error',
          enabled: true,
        },
        {
          id: 'disabled-rule',
          name: 'Disabled Rule',
          description: 'Disabled rule',
          type: 'format' as const,
          severity: 'warning' as const,
          enabled: false,
          format: 'string',
        },
      ];
      
      const enabledRules = getEnabledRules(testRules);
      expect(enabledRules).toHaveLength(1);
      expect(enabledRules[0].id).toBe('enabled-rule');
      
      const disabledRules = getDisabledRules(testRules);
      expect(disabledRules).toHaveLength(1);
      expect(disabledRules[0].id).toBe('disabled-rule');
    });

    it('should get unique categories and tags correctly', () => {
      const testRules: PraetorianRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          description: 'Test rule',
          type: 'structure',
          severity: 'error',
          enabled: true,
          category: 'test',
          tags: ['basic', 'test'],
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          description: 'Security rule',
          type: 'security' as const,
          severity: 'warning' as const,
          enabled: true,
          category: 'security',
          tags: ['basic', 'security'],
          securityType: 'secret' as const,
          config: { patterns: ['password'] },
        },
        {
          id: 'rule3',
          name: 'Rule 3',
          description: 'Another test rule',
          type: 'format' as const,
          severity: 'info' as const,
          enabled: true,
          category: 'test',
          tags: ['advanced'],
          format: 'string',
        },
      ];
      
      const categories = getUniqueCategories(testRules);
      expect(categories).toHaveLength(2);
      expect(categories).toContain('test');
      expect(categories).toContain('security');
      
      const tags = getUniqueTags(testRules);
      expect(tags).toHaveLength(4);
      expect(tags).toContain('basic');
      expect(tags).toContain('test');
      expect(tags).toContain('security');
      expect(tags).toContain('advanced');
    });
  });

  describe('ConfigFileOperations Pure Functions', () => {
    it('should handle file operations correctly', () => {
      const testFile = path.join(tempDir, 'test.txt');
      const testContent = 'Hello, World!';
      
      // Test writeFileSync
      const writeResult = writeFileSync(testFile, testContent);
      expect(writeResult.success).toBe(true);
      expect(writeResult.error).toBeUndefined();
      
      // Test fileExists
      expect(fileExists(testFile)).toBe(true);
      expect(fileExists('non-existent-file.txt')).toBe(false);
      
      // Test readFileSync
      const readResult = readFileSync(testFile);
      expect(readResult.success).toBe(true);
      expect(readResult.content).toBe(testContent);
    });

    it('should handle directory operations correctly', () => {
      const testDir = path.join(tempDir, 'test-dir');
      
      // Test createDirectorySync
      const createResult = createDirectorySync(testDir);
      expect(createResult.success).toBe(true);
      expect(fs.existsSync(testDir)).toBe(true);
      
      // Should handle existing directory
      const createAgainResult = createDirectorySync(testDir);
      expect(createAgainResult.success).toBe(true);
    });

    it('should handle YAML operations correctly', () => {
      const testObject = {
        name: 'test',
        value: 42,
        nested: {
          array: [1, 2, 3],
        },
      };
      
      // Test stringifyToYaml
      const yamlString = stringifyToYaml(testObject);
      expect(yamlString).toContain('name: test');
      expect(yamlString).toContain('value: 42');
      
      // Test parseYamlContent
      const parsed = parseYamlContent(yamlString);
      expect(parsed.name).toBe('test');
      expect(parsed.value).toBe(42);
      expect(parsed.nested.array).toEqual([1, 2, 3]);
    });

    it('should handle path operations correctly', () => {
      // Test resolvePath
      const resolved = resolvePath('/base', 'relative');
      expect(resolved).toBe(path.resolve('/base', 'relative'));
      
      // Test joinPath
      const joined = joinPath('dir1', 'dir2', 'file.txt');
      expect(joined).toBe(path.join('dir1', 'dir2', 'file.txt'));
      
      // Test with empty segments
      const joinedWithEmpty = joinPath('dir1', '', 'dir2', '', 'file.txt');
      expect(joinedWithEmpty).toBe(path.join('dir1', 'dir2', 'file.txt'));
    });
  });

  describe('ConfigValidation Pure Functions', () => {
    it('should validate valid configuration correctly', () => {
      const validConfig: PraetorianConfig = {
        files: ['config1.yaml', 'config2.yaml'],
        environments: {
          dev: 'config-dev.yaml',
          prod: 'config-prod.yaml',
        },
        ignore_keys: ['debug'],
        required_keys: ['database.url'],
        schema: {
          'database.port': 'number',
        },
        patterns: {
          'api.token': '^[A-Za-z0-9_-]+$',
        },
        forbidden_keys: ['password'],
      };
      
      const validation = validatePraetorianConfig(validConfig);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid configuration correctly', () => {
      const invalidConfig: PraetorianConfig = {
        files: 'not-an-array', // Invalid type
        environments: 'not-an-object', // Invalid type
      } as any;
      
      const validation = validatePraetorianConfig(invalidConfig);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate files section correctly', () => {
      const configWithFiles: PraetorianConfig = {
        files: ['config1.yaml', 'config2.yaml'],
      };
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      validateFilesSection(configWithFiles, errors, warnings);
      expect(errors).toHaveLength(0);
    });

    it('should validate environments section correctly', () => {
      const configWithEnvs: PraetorianConfig = {
        environments: {
          dev: 'config-dev.yaml',
          prod: 'config-prod.yaml',
        },
      };
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      validateEnvironmentsSection(configWithEnvs, errors, warnings);
      expect(errors).toHaveLength(0);
    });

    it('should check if configuration has files to validate correctly', () => {
      const configWithFiles: PraetorianConfig = {
        files: ['config1.yaml'],
      };
      expect(hasFilesToValidate(configWithFiles)).toBe(true);
      
      const configWithEnvs: PraetorianConfig = {
        environments: {
          dev: 'config-dev.yaml',
        },
      };
      expect(hasFilesToValidate(configWithEnvs)).toBe(true);
      
      const emptyConfig: PraetorianConfig = {};
      expect(hasFilesToValidate(emptyConfig)).toBe(false);
    });
  });
});
