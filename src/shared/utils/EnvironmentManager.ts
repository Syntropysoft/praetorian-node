import { ConfigFile } from '../types';

export interface EnvironmentConfig {
  [environment: string]: string;
}

export interface EnvironmentValidationResult {
  environment: string;
  configFile: string;
  success: boolean;
  errors: any[];
  warnings: any[];
}

// Pure functions for file format detection
const isYamlFile = (filePath: string): boolean => 
  filePath.endsWith('.yaml') || filePath.endsWith('.yml');

const isJsonFile = (filePath: string): boolean => 
  filePath.endsWith('.json');

const getFileFormat = (filePath: string): 'yaml' | 'json' => 
  isYamlFile(filePath) ? 'yaml' : 'json';

// Pure function for parsing content
const parseContent = (content: string, format: 'yaml' | 'json'): any => {
  if (format === 'yaml') {
    const yaml = require('yaml');
    return yaml.parse(content);
  }
  return JSON.parse(content);
};

// Pure function for creating ConfigFile
const createConfigFile = (filePath: string, content: string): ConfigFile => ({
  path: filePath,
  content: parseContent(content, getFileFormat(filePath)),
  format: getFileFormat(filePath)
});

// Pure function for creating validation result
const createValidationResult = (
  environment: string, 
  configFile: string, 
  result: any
): EnvironmentValidationResult => ({
  environment,
  configFile,
  success: result.success ?? false,
  errors: result.errors ?? [],
  warnings: result.warnings ?? []
});

export class EnvironmentManager {
  private readonly fs: any;
  private readonly yaml: any;

  constructor() {
    this.fs = require('fs');
    this.yaml = require('yaml');
  }

  /**
   * Load environment configuration from file
   */
  loadEnvironmentConfig(filePath: string): EnvironmentConfig {
    if (!this.fs.existsSync(filePath)) {
      throw new Error(`Environment configuration file not found: ${filePath}`);
    }
    
    const content = this.fs.readFileSync(filePath, 'utf8');
    return this.yaml.parse(content);
  }

  /**
   * Validate specific environment
   */
  async validateEnvironment(
    environment: string,
    environmentConfig: EnvironmentConfig,
    validationFunction: (files: ConfigFile[]) => Promise<any>
  ): Promise<EnvironmentValidationResult> {
    const configFile = environmentConfig[environment];
    
    if (!configFile) {
      throw new Error(`Environment '${environment}' not found in configuration`);
    }

    if (!this.fs.existsSync(configFile)) {
      throw new Error(`Configuration file not found: ${configFile}`);
    }

    const content = this.fs.readFileSync(configFile, 'utf8');
    const configFileObj = createConfigFile(configFile, content);
    const result = await validationFunction([configFileObj]);

    return createValidationResult(environment, configFile, result);
  }

  /**
   * Validate all environments
   */
  async validateAllEnvironments(
    environmentConfig: EnvironmentConfig,
    validationFunction: (files: ConfigFile[]) => Promise<any>
  ): Promise<EnvironmentValidationResult[]> {
    const environments = Object.keys(environmentConfig);
    
    return Promise.all(
      environments.map(env => 
        this.validateEnvironment(env, environmentConfig, validationFunction)
      )
    );
  }

  /**
   * Get environment summary
   */
  getEnvironmentSummary(results: EnvironmentValidationResult[]): {
    total: number;
    passed: number;
    failed: number;
    success: boolean;
  } {
    const total = results.length;
    const passed = results.filter(r => r.success).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      success: failed === 0
    };
  }
} 