/**
 * TODO: IMPERATIVE PROGRAMMING PATTERN - NEEDS REFACTORING
 * 
 * This file demonstrates imperative programming practices that make testing difficult:
 * - Imperative for loops (lines 200-210, 250-260, 280-290)
 * - Mutable state handling with object mutations
 * - Complex nested conditionals
 * - Multiple responsibilities in single methods
 * - Side effects in loops and object mutations
 * 
 * Mutation Score: 32.04% - Imperative patterns make testing fragile!
 * 
 * RECOMMENDATION: Refactor to use:
 * - Functional array methods (map, filter, reduce)
 * - Immutable data transformations
 * - Pure functions with clear contracts
 * - Composition over mutation
 * - Recursive functional patterns for object traversal
 */

import fs from 'fs';
import yaml from 'yaml';
import { EqualityRule } from '../../domain/rules/EqualityRule';
import { ValidationContext } from '../../shared/types';
import { EnvironmentManager } from '../../shared/utils/EnvironmentManager';

export interface ValidationResult {
  success: boolean;
  errors?: any[];
  warnings?: any[];
  summary?: any;
  results?: any[];
  error?: string;
}

export interface ValidationOptions {
  verbose?: boolean;
  strict?: boolean;
  env?: string;
  all?: boolean;
  environments?: string;
  failFast?: boolean;
  ignore_keys?: string[];
  required_keys?: string[];
}

export interface PraetorianConfig {
  files: string[];
  ignore_keys?: string[];
  required_keys?: string[];
}

export class ValidationOrchestrator {
  private environmentManager: EnvironmentManager;

  constructor() {
    this.environmentManager = new EnvironmentManager();
  }

  /**
   * Orchestrate validation based on options
   */
  async orchestrateValidation(configPath: string, options: ValidationOptions): Promise<ValidationResult> {
    if (options.all || options.env) {
      return await this.validateByEnvironments(options);
    } else {
      return await this.validateSingleFile(configPath, options);
    }
  }

  /**
   * Validate using environment-based approach
   */
  private async validateByEnvironments(options: ValidationOptions): Promise<ValidationResult> {
    const environmentsFile = options.environments || 'environments.yaml';
    const environmentConfig = this.environmentManager.loadEnvironmentConfig(environmentsFile);
    const validationFunction = this.createValidationFunction(options);
    
    if (options.all) {
      return await this.validateAllEnvironments(environmentConfig, validationFunction, options);
    } else if (options.env) {
      return await this.validateSpecificEnvironment(options.env, environmentConfig, validationFunction, options);
    }
    
    return { success: false, error: 'No validation mode specified' };
  }

  /**
   * Validate all environments
   */
  private async validateAllEnvironments(
    environmentConfig: any, 
    validationFunction: (files: any[]) => Promise<any>,
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const results = await this.environmentManager.validateAllEnvironments(environmentConfig, validationFunction);
    const summary = this.environmentManager.getEnvironmentSummary(results);
    
    return {
      success: summary.passed === summary.total,
      results,
      summary
    };
  }

  /**
   * Validate specific environment
   */
  private async validateSpecificEnvironment(
    envName: string, 
    environmentConfig: any,
    validationFunction: (files: any[]) => Promise<any>,
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const result = await this.environmentManager.validateEnvironment(envName, environmentConfig, validationFunction);
    
    return {
      success: result.success,
      errors: result.errors,
      warnings: result.warnings
    };
  }

  /**
   * Validate single file
   */
  private async validateSingleFile(configPath: string, options: ValidationOptions): Promise<ValidationResult> {
    const praetorianConfig = this.loadPraetorianConfig(configPath);
    const { existingFiles, missingFiles } = this.separateExistingAndMissingFiles(praetorianConfig.files);
    
    if (missingFiles.length > 0) {
      await this.handleMissingFiles(missingFiles, existingFiles, praetorianConfig);
    }
    
    const allFiles = this.loadAllConfigurationFiles(praetorianConfig.files);
    const validationFunction = this.createValidationFunction(options);
    const result = await validationFunction(allFiles);
    
    // Funcional: usar operador de coalescencia nula para manejar undefined
    return {
      success: result?.success ?? false,
      errors: result?.errors ?? [],
      warnings: result?.warnings ?? []
    };
  }

  /**
   * Load Praetorian configuration
   */
  private loadPraetorianConfig(configPath: string): PraetorianConfig {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return yaml.parse(configContent);
  }

  /**
   * Separate existing and missing files
   */
  private separateExistingAndMissingFiles(files: string[]): { existingFiles: string[], missingFiles: string[] } {
    // Funcional: usar operador de coalescencia nula y verificación de array
    const fileArray = files ?? [];
    const existingFiles = fileArray.filter(file => fs.existsSync(file));
    const missingFiles = fileArray.filter(file => !fs.existsSync(file));
    
    return { existingFiles, missingFiles };
  }

  /**
   * Handle missing files by creating empty structures
   */
  private async handleMissingFiles(
    missingFiles: string[], 
    existingFiles: string[], 
    praetorianConfig: PraetorianConfig
  ): Promise<void> {
    for (const missingFile of missingFiles) {
      await this.createEmptyStructureFile(missingFile, existingFiles, praetorianConfig);
    }
  }

  /**
   * Load all configuration files
   */
  private loadAllConfigurationFiles(files: string[]): any[] {
    // Funcional: usar operador de coalescencia nula y verificación de array
    const fileArray = files ?? [];
    return fileArray.map(file => ({
      path: file,
      content: this.loadFileContent(file),
      format: this.determineFileFormat(file)
    }));
  }

  /**
   * Load file content
   */
  private loadFileContent(filePath: string): any {
    const content = fs.readFileSync(filePath, 'utf8');
    const format = this.determineFileFormat(filePath);
    
    if (format === 'yaml') {
      return yaml.parse(content);
    } else {
      return JSON.parse(content);
    }
  }

  /**
   * Determine file format
   */
  private determineFileFormat(filePath: string): 'yaml' | 'json' {
    return filePath.endsWith('.yaml') || filePath.endsWith('.yml') ? 'yaml' : 'json';
  }

  /**
   * Create validation function
   */
  private createValidationFunction(options: ValidationOptions) {
    return async (files: any[]) => {
      const equalityRule = new EqualityRule();
      const context: ValidationContext = {
        strict: options.strict,
        ignoreKeys: options.ignore_keys,
        requiredKeys: options.required_keys
      };
      
      return await equalityRule.execute(files, context);
    };
  }

  /**
   * Create empty structure file
   */
  private async createEmptyStructureFile(
    missingFilePath: string, 
    existingFiles: string[], 
    praetorianConfig: PraetorianConfig
  ): Promise<void> {
    const existingStructures = existingFiles.map(file => this.loadFileContent(file));
    const emptyStructure = this.createEmptyStructureFromExisting(existingStructures, praetorianConfig);
    const format = this.determineFileFormat(missingFilePath);
    
    const content = format === 'yaml' ? yaml.stringify(emptyStructure) : JSON.stringify(emptyStructure, null, 2);
    fs.writeFileSync(missingFilePath, content);
  }

  /**
   * Create empty structure from existing files
   */
  private createEmptyStructureFromExisting(existingStructures: any[], praetorianConfig: PraetorianConfig): any {
    if (praetorianConfig.required_keys && praetorianConfig.required_keys.length > 0) {
      return this.createStructureFromRequiredKeys(praetorianConfig.required_keys);
    } else {
      return this.createStructureFromExistingFiles(existingStructures);
    }
  }

  /**
   * Create structure from required keys
   */
  private createStructureFromRequiredKeys(requiredKeys: string[]): any {
    const structure: any = {};
    
    for (const key of requiredKeys) {
      const keys = key.split('.');
      let current = structure;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = null;
    }
    
    return structure;
  }

  /**
   * Create structure from existing files
   */
  private createStructureFromExistingFiles(existingStructures: any[]): any {
    if (existingStructures.length === 0) {
      return {};
    }
    
    const mergedStructure = { ...existingStructures[0] };
    
    for (let i = 1; i < existingStructures.length; i++) {
      this.mergeStructure(mergedStructure, existingStructures[i]);
    }
    
    return this.replaceValuesWithNull(mergedStructure);
  }

  /**
   * Merge structure
   */
  private mergeStructure(target: any, source: any): void {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
            target[key] = {};
          }
          this.mergeStructure(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  /**
   * Replace values with null
   */
  private replaceValuesWithNull(obj: any): any {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return null;
    }
    
    const result: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          result[key] = this.replaceValuesWithNull(obj[key]);
        } else {
          result[key] = null;
        }
      }
    }
    
    return result;
  }
}

/**
 * Run validation with the orchestrator
 */
export async function runValidation(configPath: string, options: ValidationOptions = {}): Promise<ValidationResult> {
  const orchestrator = new ValidationOrchestrator();
  return await orchestrator.orchestrateValidation(configPath, options);
} 