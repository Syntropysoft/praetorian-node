/**
 * StructureGeneratorService - Single Responsibility: Generate empty configuration structures
 * 
 * This service handles all structure generation operations:
 * - Creating empty structures from required keys
 * - Merging existing structures
 * - Replacing values with null
 * - Writing structure files
 */

import fs from 'fs';
import yaml from 'yaml';
import { PraetorianConfig } from '../orchestrators/ValidationOrchestrator';

export class StructureGeneratorService {
  /**
   * Create empty structure file (pure function with side effect)
   */
  async createEmptyStructureFile(
    missingFilePath: string, 
    existingFiles: string[], 
    praetorianConfig: PraetorianConfig,
    configLoader: (filePath: string) => any
  ): Promise<void> {
    // Guard clause: validate inputs
    if (typeof missingFilePath !== 'string' || missingFilePath.length === 0) {
      throw new Error('Invalid missing file path provided');
    }

    if (!Array.isArray(existingFiles)) {
      throw new Error('Existing files must be an array');
    }

    if (!praetorianConfig || typeof praetorianConfig !== 'object') {
      throw new Error('Invalid Praetorian configuration provided');
    }

    const existingStructures = existingFiles.map(file => configLoader(file));
    const emptyStructure = this.createEmptyStructureFromExisting(existingStructures, praetorianConfig);
    const format = this.determineFileFormat(missingFilePath);
    
    const content = this.serializeStructure(emptyStructure, format);
    
    try {
      fs.writeFileSync(missingFilePath, content);
    } catch (error) {
      throw new Error(`Failed to write empty structure file ${missingFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create empty structure from existing files (pure function)
   */
  createEmptyStructureFromExisting(existingStructures: any[], praetorianConfig: PraetorianConfig): any {
    // Guard clause: validate inputs
    if (!Array.isArray(existingStructures)) {
      throw new Error('Existing structures must be an array');
    }

    if (!praetorianConfig || typeof praetorianConfig !== 'object') {
      throw new Error('Invalid Praetorian configuration provided');
    }

    // Use required keys if available, otherwise merge existing structures
    if (praetorianConfig.required_keys && praetorianConfig.required_keys.length > 0) {
      return this.createStructureFromRequiredKeys(praetorianConfig.required_keys);
    } else {
      return this.createStructureFromExistingFiles(existingStructures);
    }
  }

  /**
   * Create structure from required keys (pure function)
   */
  createStructureFromRequiredKeys(requiredKeys: string[]): any {
    // Guard clause: validate input
    if (!Array.isArray(requiredKeys) || requiredKeys.length === 0) {
      return {};
    }

    return requiredKeys.reduce((structure, key) => {
      return this.addKeyToStructure(structure, key);
    }, {});
  }

  /**
   * Create structure from existing files (pure function)
   */
  createStructureFromExistingFiles(existingStructures: any[]): any {
    // Guard clause: validate input
    if (!Array.isArray(existingStructures) || existingStructures.length === 0) {
      return {};
    }

    // Use functional approach: reduce instead of imperative loops
    const mergedStructure = existingStructures.reduce((acc, structure) => {
      return this.mergeStructures(acc, structure);
    }, {});

    return this.replaceValuesWithNull(mergedStructure);
  }

  /**
   * Add key to structure (pure function)
   */
  private addKeyToStructure(structure: any, key: string): any {
    // Guard clause: validate inputs
    if (typeof key !== 'string' || key.length === 0) {
      return structure;
    }

    const keys = key.split('.');
    const newStructure = { ...structure };
    let current = newStructure;
    
    // Use functional approach: reduce instead of imperative loops
    keys.slice(0, -1).forEach(keyPart => {
      if (!current[keyPart] || typeof current[keyPart] !== 'object' || Array.isArray(current[keyPart])) {
        current[keyPart] = {};
      }
      current = current[keyPart];
    });
    
    current[keys[keys.length - 1]] = null;
    return newStructure;
  }

  /**
   * Merge two structures (pure function)
   */
  private mergeStructures(target: any, source: any): any {
    // Guard clause: validate inputs
    if (typeof target !== 'object' || target === null || Array.isArray(target)) {
      return source;
    }

    if (typeof source !== 'object' || source === null || Array.isArray(source)) {
      return target;
    }

    // Use functional approach: Object.keys instead of for...in
    return Object.keys(source).reduce((merged, key) => {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          merged[key] = this.mergeStructures(merged[key] || {}, source[key]);
        } else {
          merged[key] = source[key];
        }
      }
      return merged;
    }, { ...target });
  }

  /**
   * Replace values with null (pure function)
   */
  private replaceValuesWithNull(obj: any): any {
    // Guard clause: validate input
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return null;
    }

    // Use functional approach: Object.keys instead of for...in
    return Object.keys(obj).reduce((result, key) => {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          result[key] = this.replaceValuesWithNull(obj[key]);
        } else {
          result[key] = null;
        }
      }
      return result;
    }, {} as any);
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
   * Serialize structure to string (pure function)
   */
  private serializeStructure(structure: any, format: 'yaml' | 'json'): string {
    // Guard clause: validate inputs
    if (structure === null || structure === undefined) {
      throw new Error('Structure cannot be null or undefined');
    }

    try {
      return format === 'yaml' ? yaml.stringify(structure) : JSON.stringify(structure, null, 2);
    } catch (error) {
      throw new Error(`Failed to serialize structure to ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
