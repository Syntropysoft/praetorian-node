/**
 * ValidationService - Single Responsibility: Execute validation logic
 * 
 * This service handles all validation operations:
 * - Creating validation functions
 * - Executing validation rules
 * - Managing validation context
 */

import { EqualityRule } from '../../domain/rules/EqualityRule';
import { ValidationContext } from '../../shared/types';
import { ValidationOptions } from '../orchestrators/ValidationOrchestrator';

export class ValidationService {
  /**
   * Create validation function (pure function)
   */
  createValidationFunction(options: ValidationOptions) {
    // Guard clause: validate options
    if (!options || typeof options !== 'object') {
      throw new Error('Invalid validation options provided');
    }

    return async (files: any[]) => {
      // Guard clause: validate files
      if (!Array.isArray(files)) {
        throw new Error('Files must be an array');
      }

      const equalityRule = new EqualityRule();
      const context: ValidationContext = {
        strict: options.strict ?? false,
        ignoreKeys: options.ignore_keys ?? [],
        requiredKeys: options.required_keys ?? []
      };
      
      return await equalityRule.execute(files, context);
    };
  }

  /**
   * Execute validation with guard clauses
   */
  async executeValidation(files: any[], options: ValidationOptions): Promise<any> {
    // Guard clause: validate inputs
    if (!Array.isArray(files)) {
      throw new Error('Files must be an array');
    }

    if (!options || typeof options !== 'object') {
      throw new Error('Invalid validation options provided');
    }

    const validationFunction = this.createValidationFunction(options);
    return await validationFunction(files);
  }
}
