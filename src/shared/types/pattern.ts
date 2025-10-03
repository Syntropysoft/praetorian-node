/**
 * Pattern Matching Types
 * 
 * Single Responsibility: Define types for pattern matching validation
 */

import { ValidationResult, ValidationError, ValidationWarning } from './index';

/**
 * Pattern matching rule definition
 */
export interface PatternRule {
  /** Unique identifier for the pattern */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this pattern validates */
  description: string;
  /** The regex pattern to match against */
  pattern: string;
  /** Target path within the config file (optional) */
  targetPath?: string;
  /** Whether this pattern is required */
  required?: boolean;
  /** Severity level if pattern doesn't match */
  severity: 'error' | 'warning' | 'info';
  /** Custom error message (optional) */
  message?: string;
  /** Pattern flags (e.g., 'i' for case-insensitive) */
  flags?: string;
}

/**
 * Pattern matching context
 */
export interface PatternMatchingContext {
  /** File being validated */
  filePath: string;
  /** Current validation options */
  options: PatternMatchingOptions;
  /** Custom pattern validators */
  customValidators?: Record<string, (value: any, context: PatternMatchingContext) => ValidationResult>;
}

/**
 * Pattern matching options
 */
export interface PatternMatchingOptions {
  /** Whether to stop on first error */
  stopOnFirstError?: boolean;
  /** Whether to include warnings */
  includeWarnings?: boolean;
  /** Whether to validate all patterns or just required ones */
  validateAllPatterns?: boolean;
  /** Custom pattern rules */
  customRules?: PatternRule[];
}

/**
 * Pattern matching result
 */
export interface PatternMatchingResult {
  /** Whether all patterns matched successfully */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
  /** List of validation warnings */
  warnings: ValidationWarning[];
  /** Detailed results for each pattern */
  results: PatternValidationResult[];
  /** Summary of validation */
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Individual pattern validation result
 */
export interface PatternValidationResult {
  /** Pattern rule that was validated */
  rule: PatternRule;
  /** Whether this specific pattern matched */
  matched: boolean;
  /** Error if pattern didn't match */
  error?: ValidationError;
  /** Warning if pattern had issues */
  warning?: ValidationWarning;
  /** Value that was tested against the pattern */
  testedValue?: any;
  /** Path where the value was found */
  path?: string;
}

/**
 * Common pattern types
 */
export enum PatternType {
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  UUID = 'uuid',
  VERSION = 'version',
  SEMVER = 'semver',
  IPV4 = 'ipv4',
  IPV6 = 'ipv6',
  HOSTNAME = 'hostname',
  PORT = 'port',
  PATH = 'path',
  JSON = 'json',
  YAML = 'yaml',
  XML = 'xml',
  BASE64 = 'base64',
  HEX = 'hex',
  ALPHANUMERIC = 'alphanumeric',
  NUMERIC = 'numeric',
  ALPHA = 'alpha',
  CUSTOM = 'custom'
}
