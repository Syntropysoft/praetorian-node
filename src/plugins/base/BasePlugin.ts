import { PluginMetadata, ValidationRule, ValidationResult, ValidationContext } from '../../types';

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
    return this.rules.find(rule => rule.id === ruleId && rule.enabled);
  }

  /**
   * Validate a configuration using this plugin's rules
   */
  async validate(config: Record<string, any>, context: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    const metadata: Record<string, any> = {
      plugin: this.metadata.name,
      version: this.metadata.version,
      rulesChecked: 0,
      rulesPassed: 0,
      rulesFailed: 0
    };

    for (const rule of this.getRules()) {
      try {
        const result = await this.executeRule(rule, config, context);
        
        if (result.success) {
          metadata['rulesPassed']++;
        } else {
          if (rule.severity === 'error' || rule.severity === 'critical') {
            errors.push(...result.errors);
          } else {
            warnings.push(...result.warnings);
          }
          metadata['rulesFailed']++;
        }
        
        metadata['rulesChecked']++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          code: 'PLUGIN_ERROR',
          message: `Plugin ${this.metadata.name} failed to execute rule ${rule.id}: ${errorMessage}`,
          severity: 'error',
          context: { ruleId: rule.id, plugin: this.metadata.name }
        });
        metadata['rulesFailed']++;
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      metadata
    };
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
    context: ValidationContext
  ): Promise<ValidationResult>;

  /**
   * Add a validation rule to this plugin
   */
  protected addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
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
      // Basic health check - can be overridden by subclasses
      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        message: error instanceof Error ? error.message : 'Unknown health check error' 
      };
    }
  }
} 