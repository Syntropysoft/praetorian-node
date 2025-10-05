/**
 * @file src/application/validation/ValidationEngine.ts
 * @description Pure functional validation engine for Praetorian
 */

import { PraetorianRule } from '../../shared/types/rules';
import { ValidationResult, ValidationError, ValidationWarning } from '../../shared/types';

/**
 * @interface ValidationInput
 * @description Input for the validation engine
 */
export interface ValidationInput {
  /** Configuration data to validate */
  data: any;
  /** Rules to apply */
  rules: PraetorianRule[];
  /** Context information */
  context?: {
    filePath?: string;
    environment?: string;
    [key: string]: any;
  };
}

/**
 * @interface ValidationOutput
 * @description Output from the validation engine
 */
export interface ValidationOutput {
  /** Overall validation result */
  valid: boolean;
  /** Errors found */
  errors: ValidationError[];
  /** Warnings found */
  warnings: ValidationWarning[];
  /** Metadata about the validation */
  metadata: {
    rulesApplied: number;
    rulesPassed: number;
    rulesFailed: number;
    duration: number;
  };
}

/**
 * @interface RuleValidationResult
 * @description Result of validating a single rule
 */
export interface RuleValidationResult {
  ruleId: string;
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Pure functional validation engine
 * @param input - Validation input
 * @returns Validation output
 */
export const validate = (input: ValidationInput): ValidationOutput => {
  // Guard clause: invalid input
  if (!input || !input.rules || input.rules.length === 0) {
    return createEmptyValidationOutput();
  }

  const startTime = Date.now();
  
  // Apply all rules to the data
  const ruleResults = input.rules
    .filter(rule => rule.enabled)
    .map(rule => validateRule(rule, input.data, input.context));

  // Collect all results
  const allErrors = ruleResults.flatMap(result => result.errors);
  const allWarnings = ruleResults.flatMap(result => result.warnings);
  const passedRules = ruleResults.filter(result => result.passed).length;
  const failedRules = ruleResults.filter(result => !result.passed).length;

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    metadata: {
      rulesApplied: input.rules.filter(rule => rule.enabled).length,
      rulesPassed: passedRules,
      rulesFailed: failedRules,
      duration: Date.now() - startTime,
    },
  };
};

/**
 * Validates a single rule against data
 * @param rule - Rule to apply
 * @param data - Data to validate
 * @param context - Validation context
 * @returns Rule validation result
 */
export const validateRule = (
  rule: PraetorianRule,
  data: any,
  context?: any
): RuleValidationResult => {
  // Guard clause: disabled rule
  if (!rule.enabled) {
    return createPassedRuleResult(rule.id);
  }

  // Guard clause: no data
  if (data === null || data === undefined) {
    return createFailedRuleResult(rule.id, [
      createValidationError(
        rule.id,
        'NO_DATA',
        'Data cannot be null or undefined',
        rule.severity
      ),
    ]);
  }

  // Apply rule based on type
  const result = applyRuleByType(rule, data, context);
  
  return {
    ruleId: rule.id,
    passed: result.errors.length === 0,
    errors: result.errors,
    warnings: result.warnings,
  };
};

/**
 * Applies a rule based on its type
 * @param rule - Rule to apply
 * @param data - Data to validate
 * @param context - Validation context
 * @returns Rule application result
 */
export const applyRuleByType = (
  rule: PraetorianRule,
  data: any,
  context?: any
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  switch (rule.type) {
    case 'structure':
      return validateStructureRule(rule, data);
    case 'format':
      return validateFormatRule(rule, data);
    case 'security':
      return validateSecurityRule(rule, data, context);
    case 'schema':
      return validateSchemaRule(rule, data);
    default:
      return {
        errors: [createValidationError(
          (rule as any).id || 'unknown',
          'UNKNOWN_RULE_TYPE',
          `Rule type '${(rule as any).type}' is not supported`,
          'error'
        )],
        warnings: [],
      };
  }
};

/**
 * Validates structure rules
 * @param rule - Structure rule
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateStructureRule = (
  rule: any, // StructureRule
  data: any
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Guard clause: not an object
  if (typeof data !== 'object' || Array.isArray(data)) {
    errors.push(createValidationError(
      rule.id,
      'INVALID_DATA_STRUCTURE',
      'Structure validation requires an object',
      rule.severity
    ));
    return { errors, warnings };
  }

  // Check required properties
  if (rule.requiredProperties && Array.isArray(rule.requiredProperties)) {
    for (const prop of rule.requiredProperties) {
      if (!hasProperty(data, prop)) {
        if (rule.severity === 'warning') {
          warnings.push(createValidationWarning(
            rule.id,
            'MISSING_REQUIRED_PROPERTY',
            `Required property '${prop}' is missing`
          ));
        } else {
          errors.push(createValidationError(
            rule.id,
            'MISSING_REQUIRED_PROPERTY',
            `Required property '${prop}' is missing`,
            rule.severity
          ));
        }
      }
    }
  }

  // Check forbidden properties
  if (rule.forbiddenProperties && Array.isArray(rule.forbiddenProperties)) {
    for (const prop of rule.forbiddenProperties) {
      if (hasProperty(data, prop)) {
        if (rule.severity === 'warning') {
          warnings.push(createValidationWarning(
            rule.id,
            'FORBIDDEN_PROPERTY',
            `Property '${prop}' is not allowed`
          ));
        } else {
          errors.push(createValidationError(
            rule.id,
            'FORBIDDEN_PROPERTY',
            `Property '${prop}' is not allowed`,
            rule.severity
          ));
        }
      }
    }
  }

  // Check max depth
  if (rule.maxDepth && typeof rule.maxDepth === 'number') {
    const depth = calculateObjectDepth(data);
    if (depth > rule.maxDepth) {
      if (rule.severity === 'warning') {
        warnings.push(createValidationWarning(
          rule.id,
          'EXCESSIVE_NESTING',
          `Object depth ${depth} exceeds maximum allowed depth ${rule.maxDepth}`
        ));
      } else {
        errors.push(createValidationError(
          rule.id,
          'EXCESSIVE_NESTING',
          `Object depth ${depth} exceeds maximum allowed depth ${rule.maxDepth}`,
          rule.severity
        ));
      }
    }
  }

  return { errors, warnings };
};

/**
 * Validates format rules
 * @param rule - Format rule
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateFormatRule = (
  rule: any, // FormatRule
  data: any
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Get value to validate
  const value = rule.propertyPath ? getNestedValue(data, rule.propertyPath) : data;

  // Guard clause: required field missing
  if (rule.required && (value === undefined || value === null)) {
    errors.push(createValidationError(
      rule.id,
      'REQUIRED_FIELD_MISSING',
      `Required field '${rule.propertyPath || 'root'}' is missing`,
      rule.severity
    ));
    return { errors, warnings };
  }

  // Skip validation if value is not present and not required
  if (value === undefined || value === null) {
    return { errors, warnings };
  }

  // Validate format
  if (rule.format && !validateFormat(value, rule.format)) {
    if (rule.severity === 'warning') {
      warnings.push(createValidationWarning(
        rule.id,
        'INVALID_FORMAT',
        `Value '${value}' does not match required format '${rule.format}'`
      ));
    } else {
      errors.push(createValidationError(
        rule.id,
        'INVALID_FORMAT',
        `Value '${value}' does not match required format '${rule.format}'`,
        rule.severity
      ));
    }
  }

  // Validate pattern
  if (rule.pattern && !validatePattern(value, rule.pattern)) {
    if (rule.severity === 'warning') {
      warnings.push(createValidationWarning(
        rule.id,
        'PATTERN_MISMATCH',
        `Value '${value}' does not match required pattern '${rule.pattern}'`
      ));
    } else {
      errors.push(createValidationError(
        rule.id,
        'PATTERN_MISMATCH',
        `Value '${value}' does not match required pattern '${rule.pattern}'`,
        rule.severity
      ));
    }
  }

  return { errors, warnings };
};

/**
 * Validates security rules
 * @param rule - Security rule
 * @param data - Data to validate
 * @param context - Validation context
 * @returns Validation result
 */
export const validateSecurityRule = (
  rule: any, // SecurityRule
  data: any,
  context?: any
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Guard clause: no security type
  if (!rule.securityType) {
    errors.push(createValidationError(
      rule.id,
      'INVALID_SECURITY_RULE',
      'Security rule must have a securityType',
      rule.severity
    ));
    return { errors, warnings };
  }

  // Apply security validation based on type
  switch (rule.securityType) {
    case 'secret':
      return validateSecretDetection(rule, data);
    case 'permission':
      return validatePermissions(rule, context);
    case 'vulnerability':
      return validateVulnerabilities(rule, data);
    case 'compliance':
      return validateCompliance(rule, data);
    default:
      errors.push(createValidationError(
        rule.id,
        'UNKNOWN_SECURITY_TYPE',
        `Security type '${rule.securityType}' is not supported`,
        rule.severity
      ));
  }

  return { errors, warnings };
};

/**
 * Validates schema rules
 * @param rule - Schema rule
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateSchemaRule = (
  rule: any, // SchemaRule
  data: any
): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Guard clause: schema validation disabled
  if (!rule.validateSchema) {
    return { errors, warnings };
  }

  // Guard clause: no schema
  if (!rule.schema) {
    errors.push(createValidationError(
      rule.id,
      'NO_SCHEMA_DEFINED',
      'Schema validation enabled but no schema provided',
      rule.severity
    ));
    return { errors, warnings };
  }

  // Basic schema validation (simplified for now)
  const schemaErrors = validateAgainstSchema(data, rule.schema);
  errors.push(...schemaErrors.map(error => createValidationError(
    rule.id,
    'SCHEMA_VALIDATION_FAILED',
    error,
    rule.severity
  )));

  return { errors, warnings };
};

// Helper functions

/**
 * Creates an empty validation output
 */
export const createEmptyValidationOutput = (): ValidationOutput => ({
  valid: true,
  errors: [],
  warnings: [],
  metadata: {
    rulesApplied: 0,
    rulesPassed: 0,
    rulesFailed: 0,
    duration: 0,
  },
});

/**
 * Creates a passed rule result
 */
export const createPassedRuleResult = (ruleId: string): RuleValidationResult => ({
  ruleId,
  passed: true,
  errors: [],
  warnings: [],
});

/**
 * Creates a failed rule result
 */
export const createFailedRuleResult = (
  ruleId: string,
  errors: ValidationError[]
): RuleValidationResult => ({
  ruleId,
  passed: false,
  errors,
  warnings: [],
});

/**
 * Creates a validation error or warning based on severity
 */
export const createValidationError = (
  ruleId: string,
  code: string,
  message: string,
  severity: string
): ValidationError => ({
  code,
  message,
  severity: severity as 'error' | 'warning' | 'info',
  path: ruleId,
});

/**
 * Creates a validation warning
 */
export const createValidationWarning = (
  ruleId: string,
  code: string,
  message: string
): ValidationWarning => ({
  code,
  message,
  severity: 'warning',
  path: ruleId,
});

/**
 * Checks if an object has a property (supports dot notation)
 */
export const hasProperty = (obj: any, path: string): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  return getNestedValue(obj, path) !== undefined;
};

/**
 * Gets a nested value from an object (supports dot notation)
 */
export const getNestedValue = (obj: any, path: string): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Calculates the depth of an object
 */
export const calculateObjectDepth = (obj: any, currentDepth = 0): number => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return currentDepth;
  }

  const depths = Object.values(obj).map(value => 
    calculateObjectDepth(value, currentDepth + 1)
  );

  return Math.max(currentDepth, ...depths);
};

/**
 * Validates a value against a format
 */
export const validateFormat = (value: any, format: string): boolean => {
  const stringValue = String(value);
  
  switch (format) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue);
    case 'uri':
      try {
        new URL(stringValue);
        return true;
      } catch {
        return false;
      }
    case 'uuid':
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stringValue);
    case 'semver':
      return /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(stringValue);
    case 'string':
      return typeof value === 'string';
    default:
      return true; // Unknown format, assume valid
  }
};

/**
 * Validates a value against a regex pattern
 */
export const validatePattern = (value: any, pattern: string): boolean => {
  try {
    const regex = new RegExp(pattern);
    return regex.test(String(value));
  } catch {
    return false; // Invalid regex pattern
  }
};

/**
 * Validates data against a JSON schema (simplified)
 */
export const validateAgainstSchema = (data: any, schema: any): string[] => {
  const errors: string[] = [];
  
  // Simplified schema validation
  if (schema.type && typeof data !== schema.type) {
    errors.push(`Expected type '${schema.type}' but got '${typeof data}'`);
  }
  
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (!hasProperty(data, field)) {
        errors.push(`Required field '${field}' is missing`);
      }
    }
  }
  
  return errors;
};

// Placeholder functions for security validation
export const validateSecretDetection = (rule: any, data: any) => ({ errors: [], warnings: [] });
export const validatePermissions = (rule: any, context: any) => ({ errors: [], warnings: [] });
export const validateVulnerabilities = (rule: any, data: any) => ({ errors: [], warnings: [] });
export const validateCompliance = (rule: any, data: any) => ({ errors: [], warnings: [] });
