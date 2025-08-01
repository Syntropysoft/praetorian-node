import { ValidationResult, ValidationContext, ValidationRule } from '../types';
import { PluginManager } from './PluginManager';

interface ValidatorOptions {
  plugins?: string[];
  strict?: boolean;
  rules?: Record<string, boolean>;
}

export class Validator {
  private pluginManager: PluginManager;
  private options: ValidatorOptions;

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      plugins: ['syntropylog'],
      strict: false,
      rules: {},
      ...options
    };
    
    this.pluginManager = new PluginManager();
    this.initializePlugins();
  }

  /**
   * Validate a configuration using loaded plugins
   */
  async validate(config: Record<string, any>, context: ValidationContext): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Get all enabled plugins
      const plugins = this.pluginManager.getEnabledPlugins();
      
      if (plugins.length === 0) {
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

      // Run validation through each plugin
      const results = await Promise.all(
        plugins.map(plugin => plugin.validate(config, context))
      );

      // Aggregate results
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

      // Determine overall success
      const success = allErrors.length === 0 || !this.options.strict;

      return {
        success,
        errors: allErrors,
        warnings: allWarnings,
        metadata: {
          duration: Date.now() - startTime,
          pluginsChecked: plugins.length,
          rulesChecked: totalRulesChecked,
          rulesPassed: totalRulesPassed,
          rulesFailed: totalRulesFailed,
          strict: this.options.strict
        }
      };

    } catch (error) {
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

  /**
   * Get all available validation rules
   */
  getRules(): ValidationRule[] {
    const plugins = this.pluginManager.getEnabledPlugins();
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
    const plugins = this.pluginManager.getEnabledPlugins();
    
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
    const plugins = this.pluginManager.getEnabledPlugins();
    const healthResults = await Promise.all(
      plugins.map(async plugin => ({
        name: plugin.getMetadata().name,
        ...(await plugin.getHealth())
      }))
    );
    
    const healthy = healthResults.every(result => result.healthy);
    
    return {
      healthy,
      plugins: healthResults
    };
  }

  /**
   * Initialize plugins based on configuration
   */
  private initializePlugins(): void {
    if (!this.options.plugins) return;

    // TODO: Load actual plugins
    // For now, we'll create mock plugins for demonstration
    
    this.options.plugins.forEach(pluginName => {
      if (pluginName === 'syntropylog') {
        // TODO: Load SyntropyLog plugin
        console.log('Loading SyntropyLog plugin...');
      }
    });
  }
} 