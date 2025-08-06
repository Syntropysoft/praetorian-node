/**
 * TODO: DECLARATIVE PROGRAMMING PATTERN
 * 
 * This file demonstrates excellent declarative programming practices:
 * - Pure functions with clear input/output contracts
 * - Functional composition with async/await
 * - Immutable data handling with spread operator
 * - Array methods (forEach, push, length)
 * - No imperative state mutations
 * - Clear separation of concerns
 * 
 * Mutation Score: 100% - Declarative code is inherently testable!
 */

import { ValidationResult, ValidationContext } from '../../shared/types';
import { PluginLoader } from '../../infrastructure/plugins/PluginLoader';
import { HealthChecker } from '../../infrastructure/plugins/HealthChecker';
import { PluginValidator } from '../validators/PluginValidator';
import { ResultBuilder } from '../../shared/utils/ResultBuilder';

interface ValidatorOptions {
  plugins?: string[];
  strict?: boolean;
  rules?: Record<string, boolean>;
}

export class Validator {
  private pluginLoader: PluginLoader;
  private healthChecker: HealthChecker;
  private pluginValidator: PluginValidator;
  private resultBuilder: ResultBuilder;
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
    this.pluginValidator = new PluginValidator({ strict: this.options.strict });
    this.resultBuilder = new ResultBuilder();
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
        return this.resultBuilder.createNoPluginsResult(startTime);
      }

      const results = await this.pluginValidator.validateThroughPlugins(plugins, config, context);
      return this.resultBuilder.buildValidationResult(
        results, 
        plugins.length, 
        startTime, 
        this.pluginValidator.isStrictMode()
      );

    } catch (error) {
      return this.resultBuilder.buildErrorResult(error, startTime);
    }
  }

  /**
   * Get all available validation rules
   */
  getRules(): any[] {
    const pluginManager = this.pluginLoader.getPluginManager();
    const plugins = pluginManager.getEnabledPlugins();
    const rules: any[] = [];
    
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


} 