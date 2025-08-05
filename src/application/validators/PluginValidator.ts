import { ValidationResult, ValidationContext } from '../../shared/types';

export interface PluginValidatorOptions {
  strict?: boolean;
}

export class PluginValidator {
  private options: PluginValidatorOptions;

  constructor(options: PluginValidatorOptions = {}) {
    this.options = {
      strict: false,
      ...options
    };
  }

  /**
   * Run validation through all plugins
   */
  async validateThroughPlugins(
    plugins: any[], 
    config: Record<string, any>, 
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    return Promise.all(
      plugins.map(plugin => plugin.validate(config, context))
    );
  }

  /**
   * Check if validation should be considered successful
   */
  isValidationSuccessful(errors: any[]): boolean {
    // Funcional: usar operador de coalescencia nula y verificación de longitud
    const errorCount = errors?.length ?? 0;
    return errorCount === 0 || !this.options.strict;
  }

  /**
   * Get strict mode setting
   */
  isStrictMode(): boolean {
    return this.options.strict || false;
  }
} 