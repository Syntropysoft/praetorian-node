import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * JSON File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse JSON configuration files only
 * Pure functions, no state, no side effects
 */

export class JsonFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return isJsonFile(filePath);
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return parseJsonContent(content, filePath);
    } catch (error) {
      throw new Error(`Failed to parse JSON file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'json';
  }

  getSupportedExtensions(): string[] {
    return ['.json'];
  }
}

/**
 * Pure function to check if file is JSON
 */
const isJsonFile = (filePath: string): boolean => {
  // Guard clause: no file path
  if (!filePath) {
    return false;
  }

  return filePath.endsWith('.json');
};

/**
 * Pure function to parse JSON content
 */
export const parseJsonContent = (content: string, filePath?: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  try {
    const parsedContent = JSON.parse(content);
    return validateJsonContent(parsedContent, filePath);
  } catch (error) {
    const errorMessage = getJsonErrorMessage(error, filePath);
    throw new Error(errorMessage);
  }
};

/**
 * Pure function to validate JSON content structure
 */
const validateJsonContent = (parsedContent: any, filePath?: string): Record<string, any> => {
  // Guard clause: no parsed content
  if (parsedContent === null || parsedContent === undefined) {
    return {};
  }

  // Guard clause: not an object
  if (typeof parsedContent !== 'object') {
    const fileName = filePath ? ` in ${filePath}` : '';
    throw new Error(`Invalid JSON content${fileName}: expected object, got ${typeof parsedContent}`);
  }

  // Guard clause: array instead of object
  if (Array.isArray(parsedContent)) {
    const fileName = filePath ? ` in ${filePath}` : '';
    throw new Error(`Invalid JSON content${fileName}: expected object, got array`);
  }

  return parsedContent as Record<string, any>;
};

/**
 * Pure function to get JSON error message
 */
const getJsonErrorMessage = (error: any, filePath?: string): string => {
  // Guard clause: no error
  if (!error) {
    return 'Unknown JSON parsing error';
  }

  const fileName = filePath ? ` in ${filePath}` : '';
  
  // Check if it's a JSON syntax error
  if (isJsonSyntaxError(error)) {
    return `Invalid JSON syntax${fileName}: ${error.message}`;
  }

  // Generic error
  return `JSON parsing error${fileName}: ${error.message || 'Unknown error'}`;
};

/**
 * Pure function to check if error is JSON syntax error
 */
const isJsonSyntaxError = (error: any): boolean => {
  // Guard clause: no error
  if (!error) {
    return false;
  }

  return error instanceof SyntaxError;
}; 