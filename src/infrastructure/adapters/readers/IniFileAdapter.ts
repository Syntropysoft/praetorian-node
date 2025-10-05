import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * INI File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse INI configuration files only
 * Pure functions, no state, no side effects
 */

export class IniFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return filePath.endsWith('.ini') || filePath.endsWith('.cfg') || filePath.endsWith('.conf');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return parseIniContent(content);
    } catch (error) {
      throw new Error(`Failed to parse INI file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'ini';
  }

  getSupportedExtensions(): string[] {
    return ['.ini', '.cfg', '.conf'];
  }
}

/**
 * Pure function to parse INI content
 */
export const parseIniContent = (content: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  const lines = splitIntoLines(content);
  const processedLines = filterCommentsAndEmpty(lines);
  const sections = parseSections(processedLines);
  
  return sections.reduce((result, section) => {
    if (section.name) {
      result[section.name] = section.properties;
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
 * Pure function to filter comments and empty lines
 */
const filterCommentsAndEmpty = (lines: string[]): string[] => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  return lines
    .map(line => line.trim())
    .filter(line => line && !isComment(line));
};

/**
 * Pure function to check if line is a comment
 */
const isComment = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return false;
  }

  return line.startsWith(';') || line.startsWith('#');
};

/**
 * Pure function to parse sections from lines
 */
const parseSections = (lines: string[]): Array<{ name: string; properties: Record<string, any> }> => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  let currentSection: string | null = null;
  const result: Record<string, any> = {};

  for (const line of lines) {
    // Guard clause: skip empty lines and comments
    if (isEmptyOrComment(line)) {
      continue;
    }

    // Guard clause: check if it's a valid section header
    if (isValidSectionHeader(line)) {
      currentSection = extractSectionName(line);
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      continue;
    }

    // Guard clause: invalid section header - reset current section
    if (isInvalidSectionHeader(line)) {
      currentSection = null;
      continue;
    }

    // Guard clause: only process key-value if we have a valid current section
    if (!hasValidCurrentSection(currentSection)) {
      continue;
    }

    const keyValue = extractKeyValuePair(line);
    if (hasValidKeyValue(keyValue) && currentSection) {
      result[currentSection][keyValue!.key] = parseIniValue(keyValue!.value);
    }
  }

  return Object.entries(result).map(([name, properties]) => ({
    name,
    properties
  }));
};

/**
 * Pure function to check if line is empty or comment
 */
const isEmptyOrComment = (line: string): boolean => {
  if (!line || line.trim() === '') return true;
  if (line.trim().startsWith(';')) return true;
  if (line.trim().startsWith('#')) return true;
  return false;
};

/**
 * Pure function to check if line is a valid section header
 */
const isValidSectionHeader = (line: string): boolean => {
  if (!line) return false;
  if (!line.startsWith('[') || !line.endsWith(']')) return false;
  if (line.length < 3) return false; // [x]
  return true;
};

/**
 * Pure function to check if line is an invalid section header
 */
const isInvalidSectionHeader = (line: string): boolean => {
  if (!line) return false;
  if (line.startsWith('[') || line.endsWith(']')) return true;
  return false;
};

/**
 * Pure function to check if we have a valid current section
 */
const hasValidCurrentSection = (currentSection: string | null): boolean => {
  return currentSection !== null;
};

/**
 * Pure function to check if key-value pair is valid
 */
const hasValidKeyValue = (keyValue: { key: string; value: string } | null): boolean => {
  return keyValue !== null && keyValue.key.length > 0;
};

/**
 * Pure function to check if line is a section header
 */
const isSectionHeader = (line: string): boolean => {
  // Guard clause: no line
  if (!line) {
    return false;
  }

  return line.startsWith('[') && line.endsWith(']');
};

/**
 * Pure function to extract section name from header
 */
const extractSectionName = (line: string): string => {
  // Guard clause: no line or invalid format
  if (!line || !isSectionHeader(line)) {
    return '';
  }

  return line.slice(1, -1).trim();
};

/**
 * Pure function to extract key-value pair from line
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

  // Guard clause: no key
  if (!key) {
    return null;
  }

  return { key, value };
};

/**
 * Pure function to parse an INI value
 */
export const parseIniValue = (value: string): any => {
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