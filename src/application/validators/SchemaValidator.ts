/**
 * Schema Validator - Refactored with SOLID SRP
 * 
 * Single Responsibility: Orchestrate schema validation by delegating to specialized validators
 */

import {
  JsonSchema,
  SchemaValidationResult,
  SchemaValidationError,
  SchemaValidationWarning,
  SchemaValidationContext,
  SchemaValidationOptions,
  ValidationResult
} from '../../shared/types';
import { validateType } from './TypeValidator';
import { validateFormat, validatePattern } from './FormatValidator';
import { validateStringLength, validateNumberRange } from './RangeValidator';
import { validateValue } from './StructureValidator';

/**
 * Schema Validator - Functional Programming
 * 
 * Single Responsibility: Orchestrate schema validation by delegating to pure functions
 * No state, no side effects, pure functions only
 */

export class SchemaValidator {
  private readonly options: SchemaValidationOptions;

  constructor(options: SchemaValidationOptions = {}) {
    // Guard clause: validate options
    this.options = {
      stopOnFirstError: false,
      includeWarnings: true,
      validateAdditionalProperties: true,
      ...options
    };
  }

  /**
   * Validate data against a JSON schema
   */
  validate(data: any, schema: JsonSchema, context?: Partial<SchemaValidationContext>): SchemaValidationResult {
    // Guard clause: validate inputs
    if (schema === null || schema === undefined) {
      return {
        valid: false,
        errors: [{
          path: '',
          message: 'Schema is required',
          code: 'MISSING_SCHEMA'
        }],
        warnings: []
      };
    }

    const errors: SchemaValidationError[] = [];
    const warnings: SchemaValidationWarning[] = [];

    try {
      this.validateValue(data, schema, '', errors, warnings, context);
    } catch (error) {
      errors.push({
        path: '',
        message: `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'SCHEMA_VALIDATION_ERROR'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? data : undefined
    };
  }

  /**
   * Validate a value against a schema - Delegates to specialized validators
   */
  private validateValue(
    value: any,
    schema: JsonSchema,
    path: string,
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    context?: Partial<SchemaValidationContext>
  ): void {
    // Guard clause: validate required properties
    if (this.isRequiredPropertyMissing(value, schema, path)) {
      errors.push({
        path,
        message: `Required property '${path}' is missing`,
        code: 'REQUIRED_PROPERTY_MISSING',
        rule: 'required'
      });
      return;
    }

    // Guard clause: handle null/undefined values
    if (this.shouldSkipValidation(value, schema)) {
      return;
    }

    // Delegate to specialized validators (SRP)
    this.delegateToSpecializedValidators(value, schema, path, errors, warnings, context);
  }

  /**
   * Check if required property is missing
   */
  private isRequiredPropertyMissing(value: any, schema: JsonSchema, path: string): boolean {
    if (!schema.required || !Array.isArray(schema.required)) {
      return false;
    }

    const propertyName = path.split('.').pop() || '';
    return schema.required.includes(propertyName) && (value === undefined || value === null);
  }

  /**
   * Check if validation should be skipped
   */
  private shouldSkipValidation(value: any, schema: JsonSchema): boolean {
    // Handle null values
    if (value === null) {
      if (schema.type !== 'null' && schema.type !== undefined) {
        return false; // Will be handled by type validator
      }
      return true;
    }

    // Handle undefined values
    if (value === undefined) {
      return true;
    }

    return false;
  }

  /**
   * Delegate validation to pure functions (SRP + Functional)
   */
  private delegateToSpecializedValidators(
    value: any,
    schema: JsonSchema,
    path: string,
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    context?: Partial<SchemaValidationContext>
  ): void {
    // Delegate to pure functions - no state, no side effects
    const validationErrors = validateValue(value, schema, path, context);
    errors.push(...validationErrors);

    // Custom validation rules
    this.validateCustomRules(value, schema, path, errors, context);
  }


  /**
   * Validate custom rules - Pure function delegation
   */
  private validateCustomRules(
    value: any,
    schema: JsonSchema,
    path: string,
    errors: SchemaValidationError[],
    context?: Partial<SchemaValidationContext>
  ): void {
    const customErrors = validateCustomRulesPure(value, schema, path, context);
    errors.push(...customErrors);
  }
}

/**
 * Pure function to validate custom rules
 */
const validateCustomRulesPure = (
  value: any,
  schema: JsonSchema,
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  // Guard clause: no custom rules
  if (!schema.customRules || !context?.options?.customValidators) {
    return [];
  }

  // Guard clause: no rules defined
  if (schema.customRules.length === 0) {
    return [];
  }

  return schema.customRules.flatMap(rule => 
    validateCustomRule(value, rule, path, context)
  );
};

/**
 * Pure function to validate a single custom rule
 */
const validateCustomRule = (
  value: any,
  rule: any,
  path: string,
  context?: Partial<SchemaValidationContext>
): SchemaValidationError[] => {
  // Guard clause: rule not found
  const validator = context?.options?.customValidators?.[rule.name];
  if (!validator) {
    return [];
  }

  try {
    const result = validator(value, context as SchemaValidationContext);
    return !result.success
      ? [createCustomRuleError(path, rule.message, rule.name)]
      : [];
  } catch (error) {
    return [createCustomValidationError(path, rule.name, error)];
  }
};

/**
 * Pure function to create custom rule error
 */
const createCustomRuleError = (path: string, message: string, ruleName: string): SchemaValidationError => ({
  path,
  message,
  code: `CUSTOM_${ruleName.toUpperCase()}`,
  rule: ruleName
});

/**
 * Pure function to create custom validation error
 */
const createCustomValidationError = (path: string, ruleName: string, error: any): SchemaValidationError => ({
  path,
  message: `Custom validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  code: 'CUSTOM_VALIDATION_ERROR',
  rule: ruleName
});
