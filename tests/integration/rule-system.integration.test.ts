/**
 * @file tests/integration/rule-system.integration.test.ts
 * @description Integration tests for the new rule system
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { RuleLoaderService } from '../../src/application/services/RuleLoaderService';
import { ConfigParser } from '../../src/infrastructure/parsers/ConfigParser';
import { RuleConfig } from '../../src/shared/types/rules';

describe('Rule System Integration Tests', () => {
  let tempDir: string;
  let ruleLoader: RuleLoaderService;
  let configParser: ConfigParser;

  beforeEach(() => {
    // Create temporary directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'praetorian-test-'));
    ruleLoader = new RuleLoaderService({
      workingDirectory: tempDir,
      includeCoreRules: true,
      validateRules: true,
    });
    configParser = new ConfigParser(path.join(tempDir, 'praetorian.yaml'));
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Rule Loading Integration', () => {
    it('should load core rules by default', async () => {
      // Guard clause: no config provided
      const config: RuleConfig = {
        ruleSets: [],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have core rules loaded
      expect(result.rules.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      
      // Should have rules from different categories
      const categories = result.rules.map(rule => rule.category).filter(Boolean);
      expect(categories).toContain('structure');
      expect(categories).toContain('format');
      expect(categories).toContain('security');
      expect(categories).toContain('schema');
    });

    it('should load custom rules from YAML files', async () => {
      // Create custom rule file
      const customRuleContent = `
rules:
  - id: "custom-test-rule"
    name: "Custom Test Rule"
    description: "A custom rule for testing"
    type: "structure"
    severity: "warning"
    enabled: true
    category: "custom"
    requiredProperties: ["testField"]
`;
      
      const customRuleFile = path.join(tempDir, 'custom-rules.yaml');
      fs.writeFileSync(customRuleFile, customRuleContent);

      const config: RuleConfig = {
        ruleSets: [customRuleFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have both core and custom rules
      expect(result.rules.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      
      // Should have the custom rule
      const customRule = result.rules.find(rule => rule.id === 'custom-test-rule');
      expect(customRule).toBeDefined();
      expect(customRule?.name).toBe('Custom Test Rule');
      expect(customRule?.category).toBe('custom');
    });

    it('should load core rule sets by reference', async () => {
      const config: RuleConfig = {
        ruleSets: ['@praetorian/core/structure', '@praetorian/core/security'],
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.errors).toHaveLength(0);
      expect(result.rules.length).toBeGreaterThan(0);
      
      // Should have both structure and security rules
      const structureRules = result.rules.filter(rule => rule.category === 'structure');
      const securityRules = result.rules.filter(rule => rule.category === 'security');
      
      expect(structureRules.length).toBeGreaterThan(0);
      expect(securityRules.length).toBeGreaterThan(0);
    });

    it('should load only rules from specified rule sets', async () => {
      const config: RuleConfig = {
        ruleSets: ['@praetorian/core/structure'], // Only structure rules
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.errors).toHaveLength(0);
      
      // Should have structure rules
      const structureRules = result.rules.filter(rule => rule.category === 'structure');
      expect(structureRules.length).toBeGreaterThan(0);
      
      // Should not have other categories (since we only loaded structure)
      const otherRules = result.rules.filter(rule => rule.category !== 'structure');
      expect(otherRules.length).toBe(0);
    });

    it('should handle rule overrides', async () => {
      const config: RuleConfig = {
        ruleSets: [],
        overrideRules: [
          {
            id: 'version-format',
            severity: 'error', // Change from warning to error
          },
        ],
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.errors).toHaveLength(0);
      
      // Should have the overridden rule
      const overriddenRule = result.rules.find(rule => rule.id === 'version-format');
      expect(overriddenRule).toBeDefined();
      expect(overriddenRule?.severity).toBe('error');
    });

    it('should handle custom rules addition', async () => {
      const customRule = {
        id: 'custom-addition-rule',
        name: 'Custom Addition Rule',
        description: 'A rule added via customRules',
        type: 'format' as const,
        severity: 'info' as const,
        enabled: true,
        category: 'custom',
        format: 'email',
        required: false,
      };

      const config: RuleConfig = {
        ruleSets: [],
        customRules: [customRule],
      };

      const result = await ruleLoader.loadRules(config);

      expect(result.errors).toHaveLength(0);
      
      // Should have the custom rule
      const addedRule = result.rules.find(rule => rule.id === 'custom-addition-rule');
      expect(addedRule).toBeDefined();
      expect(addedRule?.name).toBe('Custom Addition Rule');
    });
  });

  describe('Configuration Integration', () => {
    it('should create default configuration with rule system', () => {
      // Guard clause: config file doesn't exist
      expect(configParser.exists()).toBe(false);

      // Create default configuration
      configParser.createDefault();

      // Should exist now
      expect(configParser.exists()).toBe(true);

      // Should be able to load it
      const config = configParser.load();
      expect(config).toBeDefined();
    });

    it('should create example rule files', () => {
      configParser.createDefault();

      // Should create rules directory
      const rulesDir = path.join(tempDir, 'rules');
      expect(fs.existsSync(rulesDir)).toBe(true);

      // Should create example rule files
      const expectedFiles = ['structure.yaml', 'format.yaml', 'security.yaml', 'schema.yaml'];
      
      for (const fileName of expectedFiles) {
        const filePath = path.join(rulesDir, fileName);
        expect(fs.existsSync(filePath)).toBe(true);
        
        // Should have valid YAML content
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('rules:');
        expect(content.length).toBeGreaterThan(100); // Should have substantial content
      }
    });

    it('should validate configuration structure', () => {
      // Create a valid configuration
      const validConfig = `
files:
  - config-dev.yaml
  - config-prod.yaml
environments:
  dev: config-dev.yaml
  prod: config-prod.yaml
ignore_keys:
  - debug
required_keys:
  - database.url
`;
      
      const configFile = path.join(tempDir, 'valid-config.yaml');
      fs.writeFileSync(configFile, validConfig); // Fix: was writing configFile instead of validConfig

      const parser = new ConfigParser(configFile);
      
      // Should be able to load without errors
      expect(() => parser.load()).not.toThrow();
    });

    it('should handle invalid configuration gracefully', () => {
      // Create invalid configuration
      const invalidConfig = `
files: "not-an-array"
environments: "not-an-object"
`;
      
      const configFile = path.join(tempDir, 'invalid-config.yaml');
      fs.writeFileSync(configFile, invalidConfig);

      const parser = new ConfigParser(configFile);
      
      // Should throw validation error
      expect(() => parser.load()).toThrow();
    });
  });

  describe('End-to-End Rule System Integration', () => {
    it('should work with complete rule configuration', async () => {
      // Create a complete configuration
      configParser.createDefault();
      
      // Load the configuration
      const config = configParser.load();
      expect(config).toBeDefined();

      // Create a rule configuration that references the example files
      const ruleConfig: RuleConfig = {
        ruleSets: [
          '@praetorian/core/all',
          './rules/structure.yaml',
          './rules/security.yaml',
        ],
        customRules: [
          {
            id: 'integration-test-rule',
            name: 'Integration Test Rule',
            description: 'Rule created during integration test',
            type: 'structure',
            severity: 'info',
            enabled: true,
            category: 'test',
            requiredProperties: ['integrationTest'],
          },
        ],
      };

      // Load rules using the configuration
      const ruleResult = await ruleLoader.loadRules(ruleConfig);

      // Should have loaded successfully
      expect(ruleResult.errors).toHaveLength(0);
      expect(ruleResult.rules.length).toBeGreaterThan(0);

      // Should have core rules
      const coreRules = ruleResult.rules.filter(rule => 
        ['structure', 'format', 'security', 'schema'].includes(rule.category || '')
      );
      expect(coreRules.length).toBeGreaterThan(0);

      // Should have custom rule
      const customRule = ruleResult.rules.find(rule => rule.id === 'integration-test-rule');
      expect(customRule).toBeDefined();

      // Should have rules from all loaded rule sets
      expect(ruleResult.rules.length).toBeGreaterThan(0);
    });

    it('should handle missing rule files gracefully', async () => {
      const ruleConfig: RuleConfig = {
        ruleSets: [
          '@praetorian/core/all',
          './non-existent-rules.yaml',
        ],
      };

      const result = await ruleLoader.loadRules(ruleConfig);

      // Should have errors for missing file
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('non-existent-rules.yaml');

      // Should still have core rules
      expect(result.rules.length).toBeGreaterThan(0);
    });

    it('should validate rule consistency', async () => {
      // Create rule with duplicate ID
      const duplicateRuleContent = `
rules:
  - id: "required-config-version"  # This ID already exists in core rules
    name: "Duplicate Rule"
    description: "A rule with duplicate ID"
    type: "structure"
    severity: "error"
    enabled: true
`;
      
      const duplicateRuleFile = path.join(tempDir, 'duplicate-rules.yaml');
      fs.writeFileSync(duplicateRuleFile, duplicateRuleContent);

      const config: RuleConfig = {
        ruleSets: ['@praetorian/core/all', duplicateRuleFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have warnings about duplicate IDs
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warning => 
        warning.includes('already exists, skipping duplicate')
      )).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed YAML gracefully', async () => {
      // Create malformed YAML
      const malformedContent = `
rules:
  - id: "malformed-rule"
    name: "Malformed Rule"
    description: "A rule with malformed YAML"
    type: "structure"
    severity: "error"
    enabled: true
    # Missing closing quote
    requiredProperties: ["testField
`;
      
      const malformedFile = path.join(tempDir, 'malformed-rules.yaml');
      fs.writeFileSync(malformedFile, malformedContent);

      const config: RuleConfig = {
        ruleSets: [malformedFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have errors
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to parse rule file');
    });

    it('should handle invalid rule structure', async () => {
      // Create rule with invalid structure
      const invalidRuleContent = `
rules:
  - id: "invalid-rule"
    # Missing required fields
    type: "structure"
    severity: "error"
`;
      
      const invalidRuleFile = path.join(tempDir, 'invalid-rules.yaml');
      fs.writeFileSync(invalidRuleFile, invalidRuleContent);

      const config: RuleConfig = {
        ruleSets: [invalidRuleFile],
      };

      const result = await ruleLoader.loadRules(config);

      // Should have warnings about missing fields
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warning => 
        warning.includes('missing required fields')
      )).toBe(true);
    });
  });
});
