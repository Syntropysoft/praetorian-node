/**
 * @file src/infrastructure/parsers/config-parsing/ConfigValidation.ts
 * @description Pure functions for configuration validation
 */

import { PraetorianConfig } from '../../../shared/types';

/**
 * @interface ValidationResult
 * @description Result of configuration validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a Praetorian configuration
 * @param config - Configuration to validate
 * @returns Validation result
 */
export const validatePraetorianConfig = (config: PraetorianConfig): ValidationResult => {
  // Guard clause: no config
  if (!config) {
    return {
      isValid: false,
      errors: ['Configuration is required'],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required sections
  validateRequiredSections(config, errors);
  
  // Validate files section
  validateFilesSection(config, errors, warnings);
  
  // Validate environments section
  validateEnvironmentsSection(config, errors, warnings);
  
  // Validate arrays
  validateArraySections(config, errors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validates that required sections are present
 * @param config - Configuration to validate
 * @param errors - Errors array to populate
 */
export const validateRequiredSections = (
  config: PraetorianConfig, 
  errors: string[]
): void => {
  // Guard clause: no config
  if (!config) {
    errors.push('Configuration is required');
    return;
  }

  if (!config.files && !config.environments) {
    errors.push('Configuration must specify either "files" or "environments"');
  }
};

/**
 * Validates the files section
 * @param config - Configuration to validate
 * @param errors - Errors array to populate
 * @param warnings - Warnings array to populate
 */
export const validateFilesSection = (
  config: PraetorianConfig,
  errors: string[],
  warnings: string[]
): void => {
  // Guard clause: no files section
  if (!config.files) {
    return;
  }

  // Guard clause: not an array
  if (!Array.isArray(config.files)) {
    errors.push('"files" must be an array');
    return;
  }

  // Guard clause: empty array
  if (config.files.length === 0) {
    errors.push('"files" must be a non-empty array');
    return;
  }

  // Validate each file path
  config.files.forEach((file, index) => {
    if (!file || typeof file !== 'string' || file.trim().length === 0) {
      errors.push(`File at index ${index} must be a non-empty string`);
    }
  });
};

/**
 * Validates the environments section
 * @param config - Configuration to validate
 * @param errors - Errors array to populate
 * @param warnings - Warnings array to populate
 */
export const validateEnvironmentsSection = (
  config: PraetorianConfig,
  errors: string[],
  warnings: string[]
): void => {
  // Guard clause: no environments section
  if (!config.environments) {
    return;
  }

  // Guard clause: not an object
  if (typeof config.environments !== 'object' || Array.isArray(config.environments)) {
    errors.push('"environments" must be an object');
    return;
  }

  // Validate environment entries
  const entries = Object.entries(config.environments);
  if (entries.length === 0) {
    warnings.push('"environments" object is empty');
    return;
  }

  entries.forEach(([envName, filePath]) => {
    if (!envName || envName.trim().length === 0) {
      errors.push('Environment name cannot be empty');
    }
    
    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      errors.push(`Environment "${envName}" must have a non-empty file path`);
    }
  });
};

/**
 * Validates array sections
 * @param config - Configuration to validate
 * @param errors - Errors array to populate
 */
export const validateArraySections = (
  config: PraetorianConfig,
  errors: string[]
): void => {
  // Guard clause: no config
  if (!config) {
    return;
  }

  // Validate ignore_keys
  if (config.ignore_keys && !Array.isArray(config.ignore_keys)) {
    errors.push('"ignore_keys" must be an array');
  }

  // Validate required_keys
  if (config.required_keys && !Array.isArray(config.required_keys)) {
    errors.push('"required_keys" must be an array');
  }

  // Validate forbidden_keys
  if (config.forbidden_keys && !Array.isArray(config.forbidden_keys)) {
    errors.push('"forbidden_keys" must be an array');
  }

  // Validate array contents
  validateStringArray(config.ignore_keys, 'ignore_keys', errors);
  validateStringArray(config.required_keys, 'required_keys', errors);
  validateStringArray(config.forbidden_keys, 'forbidden_keys', errors);
};

/**
 * Validates that an array contains only strings
 * @param array - Array to validate
 * @param fieldName - Name of the field for error messages
 * @param errors - Errors array to populate
 */
export const validateStringArray = (
  array: any,
  fieldName: string,
  errors: string[]
): void => {
  // Guard clause: not an array
  if (!Array.isArray(array)) {
    return;
  }

  array.forEach((item, index) => {
    if (!item || typeof item !== 'string' || item.trim().length === 0) {
      errors.push(`${fieldName} at index ${index} must be a non-empty string`);
    }
  });
};

/**
 * Validates object sections
 * @param config - Configuration to validate
 * @param errors - Errors array to populate
 */
export const validateObjectSections = (
  config: PraetorianConfig,
  errors: string[]
): void => {
  // Guard clause: no config
  if (!config) {
    return;
  }

  // Validate schema
  if (config.schema && typeof config.schema !== 'object') {
    errors.push('"schema" must be an object');
  }

  // Validate patterns
  if (config.patterns && typeof config.patterns !== 'object') {
    errors.push('"patterns" must be an object');
  }
};

/**
 * Checks if configuration has files to validate
 * @param config - Configuration to check
 * @returns True if has files, false otherwise
 */
export const hasFilesToValidate = (config: PraetorianConfig): boolean => {
  // Guard clause: no config
  if (!config) {
    return false;
  }

  // Check files array
  if (config.files && Array.isArray(config.files) && config.files.length > 0) {
    return true;
  }

  // Check environments
  if (config.environments && typeof config.environments === 'object') {
    const entries = Object.values(config.environments);
    return entries.length > 0 && entries.every(file => 
      file && typeof file === 'string' && file.trim().length > 0
    );
  }

  return false;
};
