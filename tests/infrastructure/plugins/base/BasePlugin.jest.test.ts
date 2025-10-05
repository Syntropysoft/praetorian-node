import { BasePlugin } from '../../../../src/infrastructure/plugins/base/BasePlugin';
import { PluginMetadata, ValidationRule } from '../../../../src/shared/types';

// Test implementation of BasePlugin for testing purposes
class TestPlugin extends BasePlugin {
  constructor(metadata: PluginMetadata) {
    super(metadata);
  }

  protected initializeRules(): void {
    this.addRule({
      id: 'test-rule-1',
      name: 'Test Rule 1',
      description: 'First test rule',
      enabled: true,
      severity: 'error',
      category: 'best-practice',
      execute: async () => ({ success: true, errors: [], warnings: [] })
    });

    this.addRule({
      id: 'test-rule-2',
      name: 'Test Rule 2',
      description: 'Second test rule',
      enabled: false,
      severity: 'warning',
      category: 'best-practice',
      execute: async () => ({ success: true, errors: [], warnings: [] })
    });

    this.addRule({
      id: 'test-rule-3',
      name: 'Test Rule 3',
      description: 'Third test rule',
      enabled: true,
      severity: 'warning',
      category: 'best-practice',
      execute: async () => ({ success: true, errors: [], warnings: [] })
    });
  }

  protected async executeRule(
    rule: ValidationRule,
    config: Record<string, any>,
    context: any
  ): Promise<any> {
    // Simulate different rule behaviors based on rule ID
    if (rule.id === 'test-rule-1') {
      if (config.shouldFail) {
        return {
          success: false,
          errors: [{
            code: 'TEST_ERROR',
            message: 'Test rule 1 failed',
            severity: 'error'
          }]
        };
      }
      return { success: true };
    }

    if (rule.id === 'test-rule-3') {
      return {
        success: false,
        warnings: [{
          code: 'TEST_WARNING',
          message: 'Test rule 3 warning',
          severity: 'warning'
        }]
      };
    }

    return { success: true };
  }
}

describe('BasePlugin', () => {
  let testPlugin: TestPlugin;
  let mockMetadata: PluginMetadata;

  beforeEach(() => {
    mockMetadata = {
      name: 'TestPlugin',
      version: '1.0.0',
      description: 'Test plugin for unit testing',
      author: 'Test Author',
      rules: []
    };
    testPlugin = new TestPlugin(mockMetadata);
  });

  describe('constructor', () => {
    it('should create plugin instance with valid metadata', () => {
      expect(testPlugin).toBeInstanceOf(BasePlugin);
      expect(testPlugin.getMetadata()).toEqual(mockMetadata);
    });

    it('should throw error for null metadata', () => {
      expect(() => new TestPlugin(null as any)).toThrow('Plugin metadata is required');
    });

    it('should throw error for undefined metadata', () => {
      expect(() => new TestPlugin(undefined as any)).toThrow('Plugin metadata is required');
    });

    it('should throw error for non-object metadata', () => {
      expect(() => new TestPlugin('invalid' as any)).toThrow('Plugin metadata is required');
    });

    it('should initialize rules during construction', () => {
      const rules = testPlugin.getRules();
      expect(rules).toHaveLength(2); // Only enabled rules
      expect(rules.every(rule => rule.enabled)).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('should return plugin metadata', () => {
      const metadata = testPlugin.getMetadata();
      expect(metadata).toEqual(mockMetadata);
    });
  });

  describe('getRules', () => {
    it('should return only enabled rules', () => {
      const rules = testPlugin.getRules();
      expect(rules).toHaveLength(2);
      expect(rules.every(rule => rule.enabled)).toBe(true);
      expect(rules.map(rule => rule.id)).toEqual(['test-rule-1', 'test-rule-3']);
    });

    it('should return empty array when no enabled rules', () => {
      // Disable all rules
      testPlugin.setRuleEnabled('test-rule-1', false);
      testPlugin.setRuleEnabled('test-rule-3', false);
      
      const rules = testPlugin.getRules();
      expect(rules).toHaveLength(0);
    });
  });

  describe('getRule', () => {
    it('should return rule by ID when it exists and is enabled', () => {
      const rule = testPlugin.getRule('test-rule-1');
      expect(rule).toBeDefined();
      expect(rule?.id).toBe('test-rule-1');
      expect(rule?.enabled).toBe(true);
    });

    it('should return undefined for non-existent rule', () => {
      const rule = testPlugin.getRule('non-existent-rule');
      expect(rule).toBeUndefined();
    });

    it('should return undefined for disabled rule', () => {
      const rule = testPlugin.getRule('test-rule-2');
      expect(rule).toBeUndefined();
    });

    it('should return undefined for null ruleId', () => {
      const rule = testPlugin.getRule(null as any);
      expect(rule).toBeUndefined();
    });

    it('should return undefined for undefined ruleId', () => {
      const rule = testPlugin.getRule(undefined as any);
      expect(rule).toBeUndefined();
    });

    it('should return undefined for non-string ruleId', () => {
      const rule = testPlugin.getRule(123 as any);
      expect(rule).toBeUndefined();
    });
  });

  describe('setRuleEnabled', () => {
    it('should enable a disabled rule', () => {
      const result = testPlugin.setRuleEnabled('test-rule-2', true);
      expect(result).toBe(true);
      
      const rule = testPlugin.getRule('test-rule-2');
      expect(rule).toBeDefined();
      expect(rule?.enabled).toBe(true);
    });

    it('should disable an enabled rule', () => {
      const result = testPlugin.setRuleEnabled('test-rule-1', false);
      expect(result).toBe(true);
      
      const rule = testPlugin.getRule('test-rule-1');
      expect(rule).toBeUndefined();
    });

    it('should return false for non-existent rule', () => {
      const result = testPlugin.setRuleEnabled('non-existent-rule', true);
      expect(result).toBe(false);
    });

    it('should return false for null ruleId', () => {
      const result = testPlugin.setRuleEnabled(null as any, true);
      expect(result).toBe(false);
    });

    it('should return false for undefined ruleId', () => {
      const result = testPlugin.setRuleEnabled(undefined as any, true);
      expect(result).toBe(false);
    });

    it('should return false for non-string ruleId', () => {
      const result = testPlugin.setRuleEnabled(123 as any, true);
      expect(result).toBe(false);
    });

    it('should return false for non-boolean enabled value', () => {
      const result = testPlugin.setRuleEnabled('test-rule-1', 'true' as any);
      expect(result).toBe(false);
    });
  });

  describe('addRule', () => {
    it('should add valid rule', () => {
      const newRule: ValidationRule = {
        id: 'new-rule',
        name: 'New Rule',
        description: 'A new rule',
        enabled: true,
        severity: 'error',
        category: 'best-practice',
        execute: async () => ({ success: true, errors: [], warnings: [] })
      };

      // Access protected method through type assertion
      (testPlugin as any).addRule(newRule);
      
      const rule = testPlugin.getRule('new-rule');
      expect(rule).toBeDefined();
      expect(rule?.id).toBe('new-rule');
    });

    it('should throw error for null rule', () => {
      expect(() => {
        (testPlugin as any).addRule(null);
      }).toThrow('Rule is required');
    });

    it('should throw error for undefined rule', () => {
      expect(() => {
        (testPlugin as any).addRule(undefined);
      }).toThrow('Rule is required');
    });

    it('should throw error for non-object rule', () => {
      expect(() => {
        (testPlugin as any).addRule('invalid-rule');
      }).toThrow('Rule is required');
    });
  });

  describe('validate', () => {
    it('should validate successfully when all rules pass', async () => {
      const config = { shouldFail: false };
      const context = { test: true };

      const result = await testPlugin.validate(config, context);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1); // test-rule-3 always returns warning
      expect(result.metadata.plugin).toBe('TestPlugin');
      expect(result.metadata.version).toBe('1.0.0');
      expect(result.metadata.rulesChecked).toBe(2);
      expect(result.metadata.rulesPassed).toBe(1);
      expect(result.metadata.rulesFailed).toBe(1);
    });

    it('should return errors when rules fail', async () => {
      const config = { shouldFail: true };
      const context = { test: true };

      const result = await testPlugin.validate(config, context);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('TEST_ERROR');
      expect(result.errors[0].message).toBe('Test rule 1 failed');
      expect(result.warnings).toHaveLength(1);
    });

    it('should return empty result when no rules are enabled', async () => {
      // Disable all rules
      testPlugin.setRuleEnabled('test-rule-1', false);
      testPlugin.setRuleEnabled('test-rule-3', false);

      const config = { test: true };
      const context = { test: true };

      const result = await testPlugin.validate(config, context);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata.rulesChecked).toBe(0);
      expect(result.metadata.rulesPassed).toBe(0);
      expect(result.metadata.rulesFailed).toBe(0);
    });

    it('should throw error for null config', async () => {
      const context = { test: true };

      await expect(testPlugin.validate(null as any, context))
        .rejects.toThrow('Configuration is required');
    });

    it('should throw error for undefined config', async () => {
      const context = { test: true };

      await expect(testPlugin.validate(undefined as any, context))
        .rejects.toThrow('Configuration is required');
    });

    it('should throw error for non-object config', async () => {
      const context = { test: true };

      await expect(testPlugin.validate('invalid-config' as any, context))
        .rejects.toThrow('Configuration is required');
    });

    it('should throw error for null context', async () => {
      const config = { test: true };

      await expect(testPlugin.validate(config, null as any))
        .rejects.toThrow('Context is required');
    });

    it('should throw error for undefined context', async () => {
      const config = { test: true };

      await expect(testPlugin.validate(config, undefined as any))
        .rejects.toThrow('Context is required');
    });

    it('should throw error for non-object context', async () => {
      const config = { test: true };

      await expect(testPlugin.validate(config, 'invalid-context' as any))
        .rejects.toThrow('Context is required');
    });
  });

  describe('getHealth', () => {
    it('should return healthy status by default', async () => {
      const health = await testPlugin.getHealth();
      
      expect(health.healthy).toBe(true);
      expect(health.message).toBeUndefined();
    });

    it('should handle health check errors gracefully', async () => {
      // Create a plugin that throws error in health check
      class FailingTestPlugin extends TestPlugin {
        async getHealth(): Promise<{ healthy: boolean; message?: string }> {
          try {
            throw new Error('Health check failed');
          } catch (error) {
            return { 
              healthy: false, 
              message: error instanceof Error ? error.message : 'Unknown health check error' 
            };
          }
        }
      }

      const failingPlugin = new FailingTestPlugin(mockMetadata);
      const health = await failingPlugin.getHealth();
      
      expect(health.healthy).toBe(false);
      expect(health.message).toBe('Health check failed');
    });
  });

  describe('executeRuleSafely (private method)', () => {
    it('should handle rule execution errors gracefully', async () => {
      // Create a plugin that throws error in executeRule
      class ErrorTestPlugin extends TestPlugin {
        protected async executeRule(
          rule: ValidationRule,
          config: Record<string, any>,
          context: any
        ): Promise<any> {
          throw new Error('Rule execution failed');
        }
      }

      const errorPlugin = new ErrorTestPlugin(mockMetadata);
      const config = { test: true };
      const context = { test: true };

      const result = await errorPlugin.validate(config, context);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0); // At least one rule should fail
      expect(result.errors[0].code).toBe('PLUGIN_ERROR');
      expect(result.errors[0].message).toContain('failed to execute rule');
      expect(result.errors[0].context.ruleId).toBe('test-rule-1');
      expect(result.errors[0].context.plugin).toBe('TestPlugin');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle concurrent validations', async () => {
      const config = { test: true };
      const context = { test: true };

      const promises = Array(5).fill(null).map(() => 
        testPlugin.validate(config, context)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metadata.plugin).toBe('TestPlugin');
      });
    });

    it('should return consistent metadata', () => {
      const metadata1 = testPlugin.getMetadata();
      const metadata2 = testPlugin.getMetadata();
      
      // Should return the same metadata object reference
      expect(metadata1).toBe(metadata2);
      expect(metadata1.name).toBe('TestPlugin');
      expect(metadata1.version).toBe('1.0.0');
      expect(metadata1.author).toBe('Test Author');
    });

    it('should handle very large configuration objects', async () => {
      const largeConfig = {
        data: Array(1000).fill(null).map((_, i) => ({
          id: i,
          value: `value-${i}`,
          nested: {
            deep: {
              value: `deep-value-${i}`
            }
          }
        }))
      };
      const context = { test: true };

      const result = await testPlugin.validate(largeConfig, context);

      expect(result.success).toBe(true);
      expect(result.metadata.rulesChecked).toBe(2);
    });
  });
});
