import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * Properties File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse Java Properties files only
 * Pure functions, no state, no side effects
 */

export class PropertiesFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return filePath.endsWith('.properties');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return parsePropertiesContent(content);
    } catch (error) {
      throw new Error(`Failed to parse Properties file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'properties';
  }

  getSupportedExtensions(): string[] {
    return ['.properties'];
  }
}

/**
 * Pure function to parse properties content
 */
export const parsePropertiesContent = (content: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  const lines = splitIntoLines(content);
  const processedLines = processMultilineProperties(lines);
  const keyValuePairs = extractKeyValuePairs(processedLines);
  
  return keyValuePairs.reduce((result, pair) => {
    if (pair.key) {
      result[pair.key] = parsePropertiesValue(pair.value);
    }
    return result;
  }, {} as Record<string, any>);
};

/**
 * Pure function to split content into lines
 */
const splitIntoLines = (content: string): string[] => {
  // Guard clause: empty content
  if (!content) {
    return [];
  }

  return content.split('\n');
};

/**
 * Pure function to process multi-line properties
 */
const processMultilineProperties = (lines: string[]): string[] => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  return lines.reduce((processed: string[], line: string) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (isCommentOrEmpty(trimmedLine)) {
      return processed;
    }

    // Handle continuation from previous line
    if (processed.length > 0 && processed[processed.length - 1].endsWith('\\')) {
      const lastLine = processed[processed.length - 1];
      processed[processed.length - 1] = lastLine.slice(0, -1) + trimmedLine;
    } else {
      processed.push(trimmedLine);
    }

    return processed;
  }, []);
};

/**
 * Pure function to check if line is comment or empty
 */
const isCommentOrEmpty = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return true;
  }

  return line === '' || line.startsWith('#') || line.startsWith('!');
};

/**
 * Pure function to extract key-value pairs from lines
 */
const extractKeyValuePairs = (lines: string[]): Array<{ key: string; value: string }> => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  return lines
    .map(extractKeyValuePair)
    .filter(pair => pair !== null) as Array<{ key: string; value: string }>;
};

/**
 * Pure function to extract key-value pair from a single line
 */
const extractKeyValuePair = (line: string): { key: string; value: string } | null => {
  // Guard clause: no line
  if (!line) {
    return null;
  }

  const separatorInfo = findSeparator(line);
  
  if (separatorInfo.index > 0) {
    const key = line.substring(0, separatorInfo.index).trim();
    const value = line.substring(separatorInfo.index + separatorInfo.separator.length).trim();
    
    if (key) {
      return { key, value };
    }
  } else {
    // Handle cases where there's no clear separator - treat as key with empty value
    // This handles cases like "key " (key with trailing space)
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.includes('=') && !trimmedLine.includes(':')) {
      return { key: trimmedLine, value: '' };
    }
  }

  return null;
};

/**
 * Pure function to find the best separator in a line
 */
const findSeparator = (line: string): { index: number; separator: string } => {
  // Guard clause: no line
  if (!line) {
    return { index: -1, separator: '' };
  }

  const separators = ['=', ':', ' '];
  
  for (const separator of separators) {
    const index = line.indexOf(separator);
    if (index >= 0) {
      return { index, separator };
    }
  }

  return { index: -1, separator: '' };
};

/**
 * Pure function to check if line has any separator
 */
const hasSeparator = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return false;
  }

  return line.includes('=') || line.includes(':') || line.includes(' ');
};

/**
 * Pure function to parse a property value
 */
export const parsePropertiesValue = (value: string): any => {
  // Guard clause: no value
  if (!value || value === null || value === undefined) {
    return '';
  }

  // Check if value is quoted - if so, return as string without quotes
  const isQuoted = isQuotedValue(value);
  if (isQuoted) {
    return removeQuotes(value);
  }

  // Parse boolean values (only for unquoted values)
  const booleanValue = parseBoolean(value);
  if (booleanValue !== null) {
    return booleanValue;
  }

  // Parse numeric values (only for unquoted values)
  const numericValue = parseNumber(value);
  if (numericValue !== null) {
    return numericValue;
  }

  // Return as string
  return value;
};

/**
 * Pure function to check if value is quoted
 */
const isQuotedValue = (value: string): boolean => {
  // Guard clause: no value
  if (!value || value.length < 2) {
    return false;
  }

  return (value.startsWith('"') && value.endsWith('"')) || 
         (value.startsWith("'") && value.endsWith("'"));
};

/**
 * Pure function to remove quotes from value
 */
const removeQuotes = (value: string): string => {
  // Guard clause: no value
  if (!value) {
    return value;
  }

  if (isQuotedValue(value)) {
    return value.slice(1, -1);
  }

  return value;
};

/**
 * Pure function to parse boolean values
 */
const parseBoolean = (value: string): boolean | null => {
  // Guard clause: no value
  if (!value) {
    return null;
  }

  const lowerValue = value.toLowerCase();
  
  if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === 'on') {
    return true;
  }
  
  if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === 'off') {
    return false;
  }

  return null;
};

/**
 * Pure function to parse numeric values
 */
const parseNumber = (value: string): number | null => {
  // Guard clause: no value or empty string
  if (!value || value === '') {
    return null;
  }

  // Guard clause: values starting with 0 but not "0" or "0.x" are not valid numbers
  if (value.length > 1 && value.startsWith('0') && !value.includes('.')) {
    return null;
  }

  const numericValue = Number(value);
  
  // Guard clause: not a valid number
  if (isNaN(numericValue)) {
    return null;
  }

  return numericValue;
}; 