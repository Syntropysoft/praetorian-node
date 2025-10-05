import * as path from 'path';
import { PraetorianConfig } from '../../shared/types';
import { DEFAULT_PRAETORIAN_CONFIG } from '../../shared/templates/rule-templates';
import {
  fileExists,
  readFileSync,
  writeFileSync,
  createDirectorySync,
  parseYamlContent,
  stringifyToYaml,
  resolvePath,
  getDirectoryName,
  joinPath,
} from './config-parsing/ConfigFileOperations';
import {
  validatePraetorianConfig,
  hasFilesToValidate,
} from './config-parsing/ConfigValidation';

export class ConfigParser {
  private configPath: string;
  private config: PraetorianConfig | null = null;

  constructor(configPath: string = 'praetorian.yaml') {
    this.configPath = configPath;
  }

  /**
   * Load configuration from file
   */
  load(): PraetorianConfig {
    // Guard clause: already loaded
    if (this.config) {
      return this.config;
    }

    // Guard clause: file doesn't exist
    if (!fileExists(this.configPath)) {
      throw new Error(`Configuration file not found: ${this.configPath}`);
    }

    const readResult = readFileSync(this.configPath);
    
    // Guard clause: failed to read file
    if (!readResult.success || !readResult.content) {
      throw new Error(readResult.error || 'Failed to read configuration file');
    }

    try {
      this.config = parseYamlContent(readResult.content) as PraetorianConfig;
      
      // Validate configuration
      const validation = validatePraetorianConfig(this.config);
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
      
      return this.config;
    } catch (error) {
      throw new Error(`Failed to parse configuration file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get files to compare from configuration
   */
  getFilesToCompare(): string[] {
    const config = this.load();
    
    // Guard clause: no files to validate
    if (!hasFilesToValidate(config)) {
      throw new Error('No files specified in configuration. Use "files" or "environments" section.');
    }

    // Return files array if available
    if (config.files && Array.isArray(config.files) && config.files.length > 0) {
      return config.files;
    }

    // Return environment files if available
    if (config.environments && typeof config.environments === 'object') {
      return Object.values(config.environments);
    }

    throw new Error('No files specified in configuration. Use "files" or "environments" section.');
  }

  /**
   * Get environment-specific files
   */
  getEnvironmentFiles(environment?: string): string[] {
    const config = this.load();
    
    // Guard clause: specific environment requested
    if (environment && config.environments) {
      const envFile = config.environments[environment];
      if (!envFile) {
        throw new Error(`Environment '${environment}' not found in configuration`);
      }
      return [envFile];
    }

    // Return all environment files if no specific environment requested
    if (config.environments && typeof config.environments === 'object') {
      return Object.values(config.environments);
    }

    // Fallback to files array
    return this.getFilesToCompare();
  }

  /**
   * Get keys to ignore during comparison
   */
  getIgnoreKeys(): string[] {
    const config = this.load();
    return Array.isArray(config.ignore_keys) ? config.ignore_keys : [];
  }

  /**
   * Get required keys that must be present
   */
  getRequiredKeys(): string[] {
    const config = this.load();
    return Array.isArray(config.required_keys) ? config.required_keys : [];
  }

  /**
   * Get schema validation rules
   */
  getSchema(): Record<string, string> {
    const config = this.load();
    return (config.schema && typeof config.schema === 'object') ? config.schema : {};
  }

  /**
   * Get pattern validation rules
   */
  getPatterns(): Record<string, string> {
    const config = this.load();
    return (config.patterns && typeof config.patterns === 'object') ? config.patterns : {};
  }

  /**
   * Get forbidden keys
   */
  getForbiddenKeys(): string[] {
    const config = this.load();
    return Array.isArray(config.forbidden_keys) ? config.forbidden_keys : [];
  }

  /**
   * Get available environments
   */
  getEnvironments(): Record<string, string> {
    const config = this.load();
    return (config.environments && typeof config.environments === 'object') ? config.environments : {};
  }

  /**
   * Check if configuration file exists
   */
  exists(): boolean {
    return fileExists(this.configPath);
  }

  /**
   * Create a default configuration file with new rule system
   */
  createDefault(): void {
    // Guard clause: file already exists
    if (fileExists(this.configPath)) {
      throw new Error(`Configuration file already exists: ${this.configPath}`);
    }

    const writeResult = writeFileSync(this.configPath, DEFAULT_PRAETORIAN_CONFIG);
    
    // Guard clause: failed to write file
    if (!writeResult.success) {
      throw new Error(writeResult.error || 'Failed to create configuration file');
    }
    
    // Create example rule files
    this.createExampleRuleFiles();
  }

  /**
   * Create example rule files for users to customize
   */
  private createExampleRuleFiles(): void {
    const rulesDir = joinPath(getDirectoryName(this.configPath), 'rules');
    
    // Create rules directory if it doesn't exist
    const createResult = createDirectorySync(rulesDir);
    if (!createResult.success) {
      throw new Error(createResult.error || 'Failed to create rules directory');
    }

    // Create example rule files
    const exampleFiles = [
      { name: 'structure.yaml', template: 'structure' },
      { name: 'security.yaml', template: 'security' },
      { name: 'format.yaml', template: 'format' },
      { name: 'schema.yaml', template: 'schema' }
    ];

    for (const file of exampleFiles) {
      const filePath = joinPath(rulesDir, file.name);
      
      // Guard clause: file already exists
      if (fileExists(filePath)) {
        continue;
      }

      const { getRuleTemplate } = require('../../shared/templates/rule-templates');
      const content = getRuleTemplate(file.template as any);
      
      const writeResult = writeFileSync(filePath, content);
      if (!writeResult.success) {
        throw new Error(writeResult.error || `Failed to create ${file.name}`);
      }
    }
  }

} 