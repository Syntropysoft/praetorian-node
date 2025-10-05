import * as yaml from 'js-yaml';
import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * YAML File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse YAML configuration files only
 * Pure functions, no state, no side effects
 */

export class YamlFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return isYamlFile(filePath);
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return parseYamlContent(content, filePath);
    } catch (error) {
      throw new Error(`Failed to parse YAML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'yaml';
  }

  getSupportedExtensions(): string[] {
    return ['.yaml', '.yml'];
  }
}

/**
 * Pure function to check if file is YAML
 */
const isYamlFile = (filePath: string): boolean => {
  // Guard clause: no file path
  if (!filePath) {
    return false;
  }

  return filePath.endsWith('.yaml') || filePath.endsWith('.yml');
};

/**
 * Pure function to parse YAML content
 */
export const parseYamlContent = (content: string, filePath?: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  try {
    const parsedContent = yaml.load(content);
    return validateYamlContent(parsedContent, filePath);
  } catch (error) {
    const errorMessage = getYamlErrorMessage(error, filePath);
    throw new Error(errorMessage);
  }
};

/**
 * Pure function to validate YAML content structure
 */
const validateYamlContent = (parsedContent: any, filePath?: string): Record<string, any> => {
  // Guard clause: no parsed content
  if (parsedContent === null || parsedContent === undefined) {
    return {};
  }

  // Guard clause: not an object
  if (typeof parsedContent !== 'object') {
    const fileName = filePath ? ` in ${filePath}` : '';
    throw new Error(`Invalid YAML content${fileName}: expected object, got ${typeof parsedContent}`);
  }

  // Guard clause: array instead of object
  if (Array.isArray(parsedContent)) {
    const fileName = filePath ? ` in ${filePath}` : '';
    throw new Error(`Invalid YAML content${fileName}: expected object, got array`);
  }

  return parsedContent as Record<string, any>;
};

/**
 * Pure function to get YAML error message
 */
const getYamlErrorMessage = (error: any, filePath?: string): string => {
  // Guard clause: no error
  if (!error) {
    return 'Unknown YAML parsing error';
  }

  const fileName = filePath ? ` in ${filePath}` : '';
  
  // Check if it's a YAML syntax error
  if (isYamlSyntaxError(error)) {
    return `Invalid YAML syntax${fileName}: ${error.message}`;
  }

  // Generic error
  return `YAML parsing error${fileName}: ${error.message || 'Unknown error'}`;
};

/**
 * Pure function to check if error is YAML syntax error
 */
const isYamlSyntaxError = (error: any): boolean => {
  // Guard clause: no error
  if (!error) {
    return false;
  }

  return error instanceof yaml.YAMLException;
}; 