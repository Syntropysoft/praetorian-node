import { PluginMetadata, ValidationRule } from '../../../shared/types';

/**
 * Base class for all Praetorian plugins
 * 
 * Plugins extend this class to provide validation rules
 * and audit capabilities for specific domains.
 */
export abstract class BasePlugin {
  protected metadata: PluginMetadata;
  protected rules: ValidationRule[] = [];

  constructor(metadata: PluginMetadata) {
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Plugin metadata is required');
    }
    this.metadata = metadata;
    this.initializeRules();
  }

  /**
   * Get plugin metadata
   */
  getMetadata(): PluginMetadata {
    return this.metadata;
  }

  /**
   * Get all validation rules for this plugin
   */
  getRules(): ValidationRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  /**
   * Get a specific rule by ID
   */
  getRule(ruleId: string): ValidationRule | undefined {
    if (!ruleId || typeof ruleId !== 'string') {
      return undefined;
    }
    return this.rules.find(rule => rule.id === ruleId && rule.enabled);
  }

  /**
   * Validate a configuration using this plugin's rules
   */
  async validate(config: Record<string, any>, context: any): Promise<any> {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration is required');
    }
    if (!context || typeof context !== 'object') {
      throw new Error('Context is required');
    }

    const initialMetadata = createInitialMetadata(this.metadata);
    const rules = this.getRules();
    
    if (rules.length === 0) {
      return createEmptyValidationResult(this.metadata);
    }

    const results = await Promise.all(
      rules.map(rule => this.executeRuleSafely(rule, config, context))
    );

    return aggregateValidationResults(results, this.metadata);
  }

  /**
   * Initialize plugin-specific rules
   * Override this method in subclasses
   */
  protected abstract initializeRules(): void;

  /**
   * Execute a specific validation rule
   * Override this method in subclasses
   */
  protected abstract executeRule(
    rule: ValidationRule, 
    config: Record<string, any>, 
    context: any
  ): Promise<any>;

  /**
   * Add a validation rule to this plugin
   */
  protected addRule(rule: ValidationRule): void {
    if (!rule || typeof rule !== 'object') {
      throw new Error('Rule is required');
    }
    this.rules.push(rule);
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    if (!ruleId || typeof ruleId !== 'string') {
      return false;
    }
    if (typeof enabled !== 'boolean') {
      return false;
    }
    
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Get plugin health status
   */
  async getHealth(): Promise<{ healthy: boolean; message?: string }> {
    try {
      return { healthy: true };
    } catch (error) {
      return createUnhealthyResult(error);
    }
  }

  /**
   * Execute a rule safely with error handling
   */
  private async executeRuleSafely(
    rule: ValidationRule,
    config: Record<string, any>,
    context: any
  ): Promise<RuleExecutionResult> {
    try {
      const result = await this.executeRule(rule, config, context);
      return {
        success: result.success,
        errors: result.errors || [],
        warnings: result.warnings || [],
        ruleId: rule.id,
        severity: rule.severity
      };
    } catch (error) {
      return createRuleErrorResult(error, rule, this);
    }
  }
}

// Pure functions for functional programming approach

const createInitialMetadata = (metadata: PluginMetadata): Record<string, any> => ({
  plugin: metadata.name,
  version: metadata.version,
  rulesChecked: 0,
  rulesPassed: 0,
  rulesFailed: 0
});

const createEmptyValidationResult = (metadata: PluginMetadata) => ({
  success: true,
  errors: [],
  warnings: [],
  metadata: createInitialMetadata(metadata)
});

const createUnhealthyResult = (error: unknown): { healthy: boolean; message: string } => ({
  healthy: false,
  message: error instanceof Error ? error.message : 'Unknown health check error'
});


const createRuleErrorResult = (
  error: unknown,
  rule: ValidationRule,
  plugin: BasePlugin
): RuleExecutionResult => ({
  success: false,
  errors: [{
    code: 'PLUGIN_ERROR',
    message: `Plugin ${plugin.getMetadata().name} failed to execute rule ${rule.id}: ${getErrorMessage(error)}`,
    severity: 'error' as const,
    context: { ruleId: rule.id, plugin: plugin.getMetadata().name }
  }],
  warnings: [],
  ruleId: rule.id,
  severity: rule.severity
});

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

const aggregateValidationResults = (
  results: RuleExecutionResult[],
  metadata: PluginMetadata
): any => {
  const errors = results.flatMap(result => 
    result.severity === 'error' ? result.errors : []
  );
  
  const warnings = results.flatMap(result => 
    result.severity !== 'error' ? result.warnings : []
  );

  const rulesChecked = results.length;
  const rulesPassed = results.filter(r => r.success).length;
  const rulesFailed = results.filter(r => !r.success).length;

  return {
    success: errors.length === 0,
    errors,
    warnings,
    metadata: {
      plugin: metadata.name,
      version: metadata.version,
      rulesChecked,
      rulesPassed,
      rulesFailed
    }
  };
};

// Types for internal use
interface RuleExecutionResult {
  success: boolean;
  errors: any[];
  warnings: any[];
  ruleId: string;
  severity: string;
} 