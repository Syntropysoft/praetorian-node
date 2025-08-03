import { ValidationResult, ValidationContext, ValidationRule } from '../types';
import { PluginLoader } from './PluginLoader';
import { HealthChecker } from './HealthChecker';

interface ValidatorOptions {
  plugins?: string[];
  strict?: boolean;
  rules?: Record<string, boolean>;
}

export class Validator {
  private pluginLoader: PluginLoader;
  private healthChecker: HealthChecker;
  private options: ValidatorOptions;

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      plugins: ['syntropylog'],
      strict: false,
      rules: {},
      ...options
    };
    
    this.pluginLoader = new PluginLoader({
      plugins: this.options.plugins,
      autoLoad: true
    });
    
    this.healthChecker = new HealthChecker(this.pluginLoader.getPluginManager());
  }

  /**
   * Validate a configuration using loaded plugins
   */
  async validate(config: Record<string, any>, context: ValidationContext): Promise<ValidationResult> {
    const startTime = Date.now();
    
    // Validate input parameters
    if (config === null || config === undefined) {
      throw new Error('Configuration is required and cannot be null or undefined');
    }
    
    if (!context || typeof context !== 'object') {
      throw new Error('Validation context is required and must be a valid object');
    }
    
    try {
      const pluginManager = this.pluginLoader.getPluginManager();
      const plugins = pluginManager.getEnabledPlugins();
      
      if (plugins.length === 0) {
        return this.createNoPluginsResult(startTime);
      }

      const results = await this.runValidationThroughPlugins(plugins, config, context);
      return this.buildValidationResult(results, plugins.length, startTime);

    } catch (error) {
      return this.buildErrorResult(error, startTime);
    }
  }

  /**
   * Get all available validation rules
   */
  getRules(): ValidationRule[] {
    const pluginManager = this.pluginLoader.getPluginManager();
    const plugins = pluginManager.getEnabledPlugins();
    const rules: ValidationRule[] = [];
    
    plugins.forEach(plugin => {
      rules.push(...plugin.getRules());
    });
    
    return rules;
  }

  /**
   * Enable or disable a specific rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const pluginManager = this.pluginLoader.getPluginManager();
    const plugins = pluginManager.getEnabledPlugins();
    
    for (const plugin of plugins) {
      if (plugin.setRuleEnabled(ruleId, enabled)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get plugin health status
   */
  async getHealth(): Promise<{ healthy: boolean; plugins: any[] }> {
    return this.healthChecker.getHealth();
  }

  /**
   * Run validation through all plugins
   */
  private async runValidationThroughPlugins(
    plugins: any[], 
    config: Record<string, any>, 
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    return Promise.all(
      plugins.map(plugin => plugin.validate(config, context))
    );
  }

  /**
   * Build validation result from plugin results
   */
  private buildValidationResult(
    results: ValidationResult[], 
    pluginsCount: number, 
    startTime: number
  ): ValidationResult {
    const allErrors: ValidationResult['errors'] = [];
    const allWarnings: ValidationResult['warnings'] = [];
    let totalRulesChecked = 0;
    let totalRulesPassed = 0;
    let totalRulesFailed = 0;

    results.forEach(result => {
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      
      if (result.metadata) {
        totalRulesChecked += result.metadata.rulesChecked || 0;
        totalRulesPassed += result.metadata.rulesPassed || 0;
        totalRulesFailed += result.metadata.rulesFailed || 0;
      }
    });

    const success = allErrors.length === 0 || !this.options.strict;

    return {
      success,
      errors: allErrors,
      warnings: allWarnings,
      metadata: {
        duration: Date.now() - startTime,
        pluginsChecked: pluginsCount,
        rulesChecked: totalRulesChecked,
        rulesPassed: totalRulesPassed,
        rulesFailed: totalRulesFailed,
        strict: this.options.strict
      }
    };
  }

  /**
   * Create result when no plugins are loaded
   */
  private createNoPluginsResult(startTime: number): ValidationResult {
    return {
      success: true,
      errors: [],
      warnings: [{
        code: 'NO_PLUGINS',
        message: 'No validation plugins loaded',
        severity: 'warning'
      }],
      metadata: {
        duration: Date.now() - startTime,
        pluginsChecked: 0,
        rulesChecked: 0
      }
    };
  }

  /**
   * Build error result
   */
  private buildErrorResult(error: unknown, startTime: number): ValidationResult {
    return {
      success: false,
      errors: [{
        code: 'VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        severity: 'error',
        context: { error: error }
      }],
      warnings: [],
      metadata: {
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
} 