/**
 * Pattern Validator - Functional Programming
 * 
 * Single Responsibility: Validate string patterns only
 * Pure functions, no state, no side effects
 */

import { 
  PatternRule, 
  PatternMatchingContext, 
  PatternMatchingResult, 
  PatternValidationResult,
  PatternMatchingOptions,
  PatternType
} from '../../shared/types/pattern';
import { ValidationError, ValidationWarning } from '../../shared/types';

/**
 * Pure function to validate patterns against data
 */
export const validatePatterns = (
  data: any,
  rules: PatternRule[],
  context: PatternMatchingContext
): PatternMatchingResult => {
  // Guard clause: no rules provided
  if (!rules || rules.length === 0) {
    return createEmptyResult();
  }

  // Guard clause: no data provided
  if (data === null || data === undefined) {
    return createEmptyResult();
  }

  const results = rules.map(rule => validateSinglePattern(data, rule, context));
  const errors = results.flatMap(r => r.error ? [r.error] : []);
  const warnings = results.flatMap(r => r.warning ? [r.warning] : []);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    results,
    summary: createSummary(results)
  };
};

/**
 * Pure function to validate a single pattern
 */
const validateSinglePattern = (
  data: any,
  rule: PatternRule,
  context: PatternMatchingContext
): PatternValidationResult => {
  // Guard clause: invalid rule
  if (!rule || !rule.pattern) {
    return createFailedResult(rule, 'Invalid pattern rule');
  }

  const value = extractValueFromPath(data, rule.targetPath);
  const regex = createRegexFromPattern(rule);
  
  if (!regex) {
    return createFailedResult(rule, 'Invalid regex pattern');
  }

  const matched = regex.test(value);
  
  if (matched) {
    return createSuccessResult(rule, value, rule.targetPath);
  }

  return createFailedResult(rule, rule.message || `Value does not match pattern: ${rule.pattern}`, value, rule.targetPath);
};

/**
 * Pure function to extract value from nested path
 */
const extractValueFromPath = (data: any, path?: string): string => {
  // Guard clause: no path specified
  if (!path) {
    return String(data);
  }

  // Guard clause: invalid data
  if (data === null || data === undefined) {
    return '';
  }

  return path.split('.').reduce((obj, key) => {
    if (obj && typeof obj === 'object' && key in obj) {
      return obj[key];
    }
    return undefined;
  }, data) || '';
};

/**
 * Pure function to create regex from pattern
 */
const createRegexFromPattern = (rule: PatternRule): RegExp | null => {
  try {
    const flags = rule.flags || '';
    return new RegExp(rule.pattern, flags);
  } catch (error) {
    return null;
  }
};

/**
 * Pure function to create success result
 */
const createSuccessResult = (
  rule: PatternRule, 
  value: any, 
  path?: string
): PatternValidationResult => ({
  rule,
  matched: true,
  testedValue: value,
  path
});

/**
 * Pure function to create failed result
 */
const createFailedResult = (
  rule: PatternRule, 
  message: string, 
  value?: any, 
  path?: string
): PatternValidationResult => ({
  rule,
  matched: false,
  error: {
    code: `PATTERN_MISMATCH_${rule.id.toUpperCase()}`,
    message,
    severity: rule.severity,
    path: path || '',
    context: { pattern: rule.pattern, value }
  },
  testedValue: value,
  path
});

/**
 * Pure function to create empty result
 */
const createEmptyResult = (): PatternMatchingResult => ({
  valid: true,
  errors: [],
  warnings: [],
  results: [],
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
});

/**
 * Pure function to create summary
 */
const createSummary = (results: PatternValidationResult[]) => {
  const total = results.length;
  const passed = results.filter(r => r.matched).length;
  const failed = results.filter(r => !r.matched).length;
  const warnings = results.filter(r => r.warning).length;

  return { total, passed, failed, warnings };
};

/**
 * Pure function to check if value is string
 */
export const isString = (value: any): boolean => typeof value === 'string';

/**
 * Pure function to check if value is empty
 */
export const isEmpty = (value: any): boolean => 
  value === null || value === undefined || value === '';

/**
 * Pure function to get string value safely
 */
export const getStringValue = (value: any): string => 
  isString(value) ? value : String(value || '');
