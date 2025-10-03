/**
 * ConfigLoaderService - Single Responsibility: Load and parse configuration files
 * 
 * This service handles all configuration loading operations:
 * - Loading Praetorian configuration files
 * - Parsing YAML/JSON content
 * - File existence validation
 * - Format detection
 */

import fs from 'fs';
import yaml from 'yaml';
import { PraetorianConfig } from '../orchestrators/ValidationOrchestrator';

export interface ConfigFile {
  path: string;
  content: any;
  format: 'yaml' | 'json';
}

export class ConfigLoaderService {
  /**
   * Load Praetorian configuration with guard clauses
   */
  loadPraetorianConfig(configPath: string): PraetorianConfig {
    // Guard clause: validate file exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    // Guard clause: validate file is readable
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return yaml.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to parse configuration file ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load single configuration file with guard clauses
   */
  loadConfigFile(filePath: string): ConfigFile {
    // Guard clause: validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Configuration file not found: ${filePath}`);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const format = this.determineFileFormat(filePath);
      
      return {
        path: filePath,
        content: this.parseContent(content, format),
        format
      };
    } catch (error) {
      throw new Error(`Failed to load configuration file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load multiple configuration files (pure function)
   */
  loadConfigFiles(filePaths: string[]): ConfigFile[] {
    // Guard clause: validate input
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return [];
    }

    return filePaths.map(filePath => this.loadConfigFile(filePath));
  }

  /**
   * Separate existing and missing files (pure function)
   */
  separateExistingAndMissingFiles(files: string[]): { existingFiles: string[], missingFiles: string[] } {
    // Guard clause: validate input
    if (!Array.isArray(files)) {
      return { existingFiles: [], missingFiles: [] };
    }

    const existingFiles = files.filter(file => fs.existsSync(file));
    const missingFiles = files.filter(file => !fs.existsSync(file));
    
    return { existingFiles, missingFiles };
  }

  /**
   * Determine file format (pure function)
   */
  private determineFileFormat(filePath: string): 'yaml' | 'json' {
    // Guard clause: validate input
    if (typeof filePath !== 'string' || filePath.length === 0) {
      throw new Error('Invalid file path provided');
    }

    return filePath.endsWith('.yaml') || filePath.endsWith('.yml') ? 'yaml' : 'json';
  }

  /**
   * Parse content based on format (pure function)
   */
  private parseContent(content: string, format: 'yaml' | 'json'): any {
    // Guard clause: validate content
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }

    try {
      return format === 'yaml' ? yaml.parse(content) : JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse ${format} content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
