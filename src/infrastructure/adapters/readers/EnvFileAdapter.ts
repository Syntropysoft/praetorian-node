import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * ENV File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse ENV configuration files only
 * Pure functions, no state, no side effects
 */

export class EnvFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return filePath.endsWith('.env') || filePath.startsWith('env.');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    const content = await this.readFileContent(filePath);
    return parseEnvContent(content);
  }

  getFormat(): string {
    return 'env';
  }

  getSupportedExtensions(): string[] {
    return ['.env'];
  }
}

/**
 * Pure function to parse ENV content
 */
export const parseEnvContent = (content: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  const lines = splitIntoLines(content);
  const validLines = filterValidLines(lines);
  const keyValuePairs = extractKeyValuePairs(validLines);
  
  return keyValuePairs.reduce((result, pair) => {
    if (hasValidKey(pair.key)) {
      result[pair.key] = parseEnvValue(pair.value);
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
 * Pure function to filter valid lines
 */
const filterValidLines = (lines: string[]): string[] => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  return lines
    .map(line => line.trim())
    .filter(isValidEnvLine);
};

/**
 * Pure function to check if line is valid for ENV parsing
 */
const isValidEnvLine = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return false;
  }

  // Guard clause: comment line
  if (isCommentLine(line)) {
    return false;
  }

  // Guard clause: no equals sign
  if (!hasEqualsSign(line)) {
    return false;
  }

  return true;
};

/**
 * Pure function to check if line is a comment
 */
const isCommentLine = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return false;
  }

  return line.startsWith('#');
};

/**
 * Pure function to check if line has equals sign
 */
const hasEqualsSign = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return false;
  }

  return line.includes('=');
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
    .filter(hasValidKeyValuePair) as Array<{ key: string; value: string }>;
};

/**
 * Pure function to extract key-value pair from a single line
 */
const extractKeyValuePair = (line: string): { key: string; value: string } | null => {
  // Guard clause: no line
  if (!line) {
    return null;
  }

  const equalIndex = line.indexOf('=');
  
  // Guard clause: no equals sign or at start of line
  if (equalIndex <= 0) {
    return null;
  }

  const key = line.substring(0, equalIndex).trim();
  const value = line.substring(equalIndex + 1).trim();

  return { key, value };
};

/**
 * Pure function to check if key-value pair is valid
 */
const hasValidKeyValuePair = (pair: { key: string; value: string } | null): boolean => {
  return pair !== null && hasValidKey(pair.key);
};

/**
 * Pure function to check if key is valid
 */
const hasValidKey = (key: string): boolean => {
  // Guard clause: no key
  if (!key) {
    return false;
  }

  return key.length > 0;
};

/**
 * Pure function to parse an ENV value
 */
export const parseEnvValue = (value: string): string => {
  // Guard clause: no value
  if (!value || value === null || value === undefined) {
    return '';
  }

  return removeQuotes(value);
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
 * Pure function to check if value is quoted
 */
const isQuotedValue = (value: string): boolean => {
  // Guard clause: no value or too short
  if (!value || value.length < 2) {
    return false;
  }

  return (value.startsWith('"') && value.endsWith('"')) || 
         (value.startsWith("'") && value.endsWith("'"));
}; 