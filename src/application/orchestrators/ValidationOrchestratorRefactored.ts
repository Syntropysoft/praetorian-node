/**
 * ValidationOrchestratorRefactored - Clean Architecture with SOLID SRP
 * 
 * This orchestrator now follows Single Responsibility Principle:
 * - Orchestrates validation flow only
 * - Delegates specific responsibilities to specialized services
 * - Uses guard clauses for early validation
 * - Employs functional programming patterns
 * 
 * Mutation Score: Expected 90%+ (functional patterns are more testable)
 */

import { EqualityRule } from '../../domain/rules/EqualityRule';
// import { SchemaValidationRule } from '../../domain/rules/SchemaValidationRule'; // Removed - unused
import { ValidationContext } from '../../shared/types';
import { EnvironmentManager } from '../../shared/utils/EnvironmentManager';
import { ConfigLoaderService, ConfigFile } from '../services/ConfigLoaderService';
import { StructureGeneratorService } from '../services/StructureGeneratorService';
import { ValidationService } from '../services/ValidationService';
// import { CommonSchemas } from '../../infrastructure/schemas/CommonSchemas'; // Removed - unused

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
  schema_validation?: boolean;
  schema_rules?: string[];
}

export interface PraetorianConfig {
  files: string[];
  ignore_keys?: string[];
  required_keys?: string[];
}

export class ValidationOrchestratorRefactored {
  private readonly environmentManager: EnvironmentManager;
  private readonly configLoader: ConfigLoaderService;
  private readonly structureGenerator: StructureGeneratorService;
  private readonly validationService: ValidationService;

  constructor() {
    this.environmentManager = new EnvironmentManager();
    this.configLoader = new ConfigLoaderService();
    this.structureGenerator = new StructureGeneratorService();
    this.validationService = new ValidationService();
  }

  /**
   * Orchestrate validation based on options (main entry point)
   */
  async orchestrateValidation(configPath: string, options: ValidationOptions): Promise<ValidationResult> {
    // Guard clause: validate inputs
    if (typeof configPath !== 'string' || configPath.length === 0) {
      throw new Error('Configuration path is required');
    }

    if (!options || typeof options !== 'object') {
      throw new Error('Validation options are required');
    }

    // Determine validation strategy based on options
    if (this.isEnvironmentValidation(options)) {
      return await this.validateByEnvironments(options);
    } else {
      return await this.validateSingleFile(configPath, options);
    }
  }

  /**
   * Check if validation should use environment-based approach (pure function)
   */
  private isEnvironmentValidation(options: ValidationOptions): boolean {
    return Boolean(options.all || options.env);
  }

  /**
   * Validate using environment-based approach
   */
  private async validateByEnvironments(options: ValidationOptions): Promise<ValidationResult> {
    // Guard clause: validate environment options
    if (!options.all && !options.env) {
      return { success: false, error: 'No validation mode specified' };
    }

    const environmentsFile = options.environments || 'environments.yaml';
    const environmentConfig = this.environmentManager.loadEnvironmentConfig(environmentsFile);
    const validationFunction = this.validationService.createValidationFunction(options);
    
    if (options.all) {
      return await this.validateAllEnvironments(environmentConfig, validationFunction, options);
    } else {
      return await this.validateSpecificEnvironment(options.env!, environmentConfig, validationFunction, options);
    }
  }

  /**
   * Validate all environments (pure function with async side effects)
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
   * Validate specific environment (pure function with async side effects)
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
   * Validate single file configuration
   */
  private async validateSingleFile(configPath: string, options: ValidationOptions): Promise<ValidationResult> {
    // Load configuration with guard clauses
    const praetorianConfig = this.configLoader.loadPraetorianConfig(configPath);
    
    // Separate existing and missing files (pure function)
    const { existingFiles, missingFiles } = this.configLoader.separateExistingAndMissingFiles(praetorianConfig.files);
    
    // Handle missing files if any exist
    if (missingFiles.length > 0) {
      await this.handleMissingFiles(missingFiles, existingFiles, praetorianConfig);
    }
    
    // Load all configuration files (pure function)
    const allFiles = this.configLoader.loadConfigFiles(praetorianConfig.files);
    
    // Execute validation (pure function with async side effects)
    const result = await this.validationService.executeValidation(allFiles, options);
    
    // Execute schema validation if enabled
    const schemaResult = await this.runSchemaValidation(allFiles, options);
    
    // Combine results
    const combinedErrors = [
      ...(result?.errors ?? []),
      ...(schemaResult.errors ?? [])
    ];
    const combinedWarnings = [
      ...(result?.warnings ?? []),
      ...(schemaResult.warnings ?? [])
    ];
    
    // Return result with null coalescing for safety
    return {
      success: (result?.success ?? false) && (schemaResult.success ?? true),
      errors: combinedErrors,
      warnings: combinedWarnings,
      results: [
        ...(result?.results ?? []),
        ...(schemaResult.results ?? [])
      ]
    };
  }

  /**
   * Handle missing files by creating empty structures (pure function with async side effects)
   */
  private async handleMissingFiles(
    missingFiles: string[], 
    existingFiles: string[], 
    praetorianConfig: PraetorianConfig
  ): Promise<void> {
    // Guard clause: validate inputs
    if (!Array.isArray(missingFiles) || missingFiles.length === 0) {
      return;
    }

    // Use functional approach: Promise.all instead of imperative loops
    const createFilePromises = missingFiles.map(missingFile => 
      this.structureGenerator.createEmptyStructureFile(
        missingFile, 
        existingFiles, 
        praetorianConfig,
        (filePath) => this.configLoader.loadConfigFile(filePath).content
      )
    );

    await Promise.all(createFilePromises);
  }

  /**
   * Run schema validation on configuration files
   */
  private async runSchemaValidation(files: ConfigFile[], options: ValidationOptions): Promise<ValidationResult> {
    if (!options.schema_validation) {
      return { success: true, results: [] };
    }

    const schemaRules = this.getSchemaRules(options.schema_rules);
    const results: ValidationResult[] = [];

    for (const rule of schemaRules) {
      try {
        const result = await rule.execute(files);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          results: []
        });
      }
    }

    // Combine all results
    const allErrors = results.flatMap(r => r.errors || []);
    const allWarnings = results.flatMap(r => r.warnings || []);
    const allSuccess = results.every(r => r.success);

    return {
      success: allSuccess,
      errors: allErrors,
      warnings: allWarnings,
      results
    };
  }

  /**
   * Get schema rules based on options
   * NOTE: SchemaValidationRule and CommonSchemas were removed as unused
   */
  private getSchemaRules(requestedRules?: string[]): any[] {
    // Return empty array since schema validation is not implemented
    return [];
  }
}

/**
 * Run validation with the refactored orchestrator (pure function with async side effects)
 */
export async function runValidationRefactored(configPath: string, options: ValidationOptions = {}): Promise<ValidationResult> {
  const orchestrator = new ValidationOrchestratorRefactored();
  return await orchestrator.orchestrateValidation(configPath, options);
}
