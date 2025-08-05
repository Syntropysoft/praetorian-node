import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { PraetorianConfig } from '../../shared/types';

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
    if (this.config) {
      return this.config;
    }

    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Configuration file not found: ${this.configPath}`);
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      this.config = yaml.parse(content) as PraetorianConfig;
      
      // Validate configuration
      this.validateConfig(this.config);
      
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
    
    if (config.files && config.files.length > 0) {
      return config.files;
    }

    if (config.environments) {
      return Object.values(config.environments);
    }

    throw new Error('No files specified in configuration. Use "files" or "environments" section.');
  }

  /**
   * Get environment-specific files
   */
  getEnvironmentFiles(environment?: string): string[] {
    const config = this.load();
    
    if (environment && config.environments) {
      const envFile = config.environments[environment];
      if (!envFile) {
        throw new Error(`Environment '${environment}' not found in configuration`);
      }
      return [envFile];
    }

    if (config.environments) {
      return Object.values(config.environments);
    }

    return this.getFilesToCompare();
  }

  /**
   * Get keys to ignore during comparison
   */
  getIgnoreKeys(): string[] {
    const config = this.load();
    return config.ignore_keys || [];
  }

  /**
   * Get required keys that must be present
   */
  getRequiredKeys(): string[] {
    const config = this.load();
    return config.required_keys || [];
  }

  /**
   * Get schema validation rules
   */
  getSchema(): Record<string, string> {
    const config = this.load();
    return config.schema || {};
  }

  /**
   * Get pattern validation rules
   */
  getPatterns(): Record<string, string> {
    const config = this.load();
    return config.patterns || {};
  }

  /**
   * Get forbidden keys
   */
  getForbiddenKeys(): string[] {
    const config = this.load();
    return config.forbidden_keys || [];
  }

  /**
   * Get available environments
   */
  getEnvironments(): Record<string, string> {
    const config = this.load();
    return config.environments || {};
  }

  /**
   * Check if configuration file exists
   */
  exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Create a default configuration file
   */
  createDefault(): void {
    const defaultConfig: PraetorianConfig = {
      files: [
        'config-dev.yaml',
        'config-prod.yaml',
        'config-staging.yaml'
      ],
      ignore_keys: [
        'debug',
        'temp'
      ],
      required_keys: [
        'database.url',
        'api.token'
      ],
      schema: {
        'database.port': 'number',
        'api.token': 'string',
        'service.enabled': 'boolean'
      },
      patterns: {
        'api.token': '^[A-Za-z0-9_-]{20,}$'
      },
      forbidden_keys: [
        'password_plaintext'
      ],
      environments: {
        dev: 'config-dev.yaml',
        prod: 'config-prod.yaml',
        staging: 'config-staging.yaml'
      }
    };

    const content = yaml.stringify(defaultConfig, { indent: 2 });
    fs.writeFileSync(this.configPath, content);
  }

  private validateConfig(config: PraetorianConfig): void {
    if (!config.files && !config.environments) {
      throw new Error('Configuration must specify either "files" or "environments"');
    }

    if (config.files && (!Array.isArray(config.files) || config.files.length === 0)) {
      throw new Error('"files" must be a non-empty array');
    }

    if (config.environments && typeof config.environments !== 'object') {
      throw new Error('"environments" must be an object');
    }

    if (config.ignore_keys && !Array.isArray(config.ignore_keys)) {
      throw new Error('"ignore_keys" must be an array');
    }

    if (config.required_keys && !Array.isArray(config.required_keys)) {
      throw new Error('"required_keys" must be an array');
    }

    if (config.forbidden_keys && !Array.isArray(config.forbidden_keys)) {
      throw new Error('"forbidden_keys" must be an array');
    }
  }
} 