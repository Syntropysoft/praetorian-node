import * as toml from 'toml';
import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * TOML File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse TOML configuration files only
 * Uses toml library for robust TOML parsing
 */

export class TomlFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return isTomlFile(filePath);
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return parseTomlContent(content);
    } catch (error) {
      throw new Error(`Failed to parse TOML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'toml';
  }

  getSupportedExtensions(): string[] {
    return ['.toml'];
  }
}

/**
 * Pure function to check if file is TOML
 */
const isTomlFile = (filePath: string): boolean => {
  // Guard clause: no file path
  if (!filePath) {
    return false;
  }

  return filePath.endsWith('.toml');
};

/**
 * Pure function to parse TOML content using toml library
 */
export const parseTomlContent = (content: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  try {
    const result = toml.parse(content);
    return result || {};
  } catch (error) {
    throw new Error(`TOML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
