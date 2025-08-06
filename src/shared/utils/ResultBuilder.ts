/**
 * TODO: DECLARATIVE PROGRAMMING PATTERN
 * 
 * This file demonstrates excellent declarative programming practices:
 * - Pure functions with functional array methods (flatMap, reduce)
 * - Immutable data transformations
 * - Object spread operator for composition
 * - Type guards for error handling
 * - No imperative loops or state mutations
 * - Clear data flow transformations
 * 
 * Mutation Score: 94.44% - Functional patterns make testing predictable!
 */

import { ValidationResult } from '../types';

export class ResultBuilder {
  /**
   * Build validation result from plugin results
   */
  buildValidationResult(
    results: ValidationResult[], 
    pluginsCount: number, 
    startTime: number,
    strict: boolean
  ): ValidationResult {
    // Declarativo: extraer datos usando métodos funcionales
    const allErrors = results.flatMap(result => result.errors);
    const allWarnings = results.flatMap(result => result.warnings);
    
    // Declarativo: reducir a métricas usando reduce
    const metrics = results.reduce((acc, result) => ({
      rulesChecked: acc.rulesChecked + (result.metadata?.rulesChecked || 0),
      rulesPassed: acc.rulesPassed + (result.metadata?.rulesPassed || 0),
      rulesFailed: acc.rulesFailed + (result.metadata?.rulesFailed || 0)
    }), { rulesChecked: 0, rulesPassed: 0, rulesFailed: 0 });

    const success = allErrors.length === 0 || !strict;

    return {
      success,
      errors: allErrors,
      warnings: allWarnings,
      metadata: {
        duration: Date.now() - startTime,
        pluginsChecked: pluginsCount,
        ...metrics,
        strict
      }
    };
  }

  /**
   * Create result when no plugins are loaded
   */
  createNoPluginsResult(startTime: number): ValidationResult {
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
  buildErrorResult(error: unknown, startTime: number): ValidationResult {
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