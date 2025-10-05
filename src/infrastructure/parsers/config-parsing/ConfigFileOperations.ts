/**
 * @file src/infrastructure/parsers/config-parsing/ConfigFileOperations.ts
 * @description Pure functions for configuration file operations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { PraetorianConfig } from '../../../shared/types';

/**
 * @interface FileOperationResult
 * @description Result of a file operation
 */
export interface FileOperationResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * @interface ConfigParseResult
 * @description Result of parsing a configuration file
 */
export interface ConfigParseResult {
  success: boolean;
  config?: PraetorianConfig;
  error?: string;
}

/**
 * Checks if a file exists
 * @param filePath - Path to check
 * @returns True if file exists, false otherwise
 */
export const fileExists = (filePath: string): boolean => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return false;
  }

  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

/**
 * Reads a file synchronously
 * @param filePath - Path to the file
 * @returns File operation result
 */
export const readFileSync = (filePath: string): FileOperationResult => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return {
      success: false,
      error: 'File path cannot be empty',
    };
  }

  // Guard clause: file doesn't exist
  if (!fileExists(filePath)) {
    return {
      success: false,
      error: `File not found: ${filePath}`,
    };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read file: ${(error as Error).message}`,
    };
  }
};

/**
 * Writes content to a file synchronously
 * @param filePath - Path to the file
 * @param content - Content to write
 * @returns File operation result
 */
export const writeFileSync = (filePath: string, content: string): FileOperationResult => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return {
      success: false,
      error: 'File path cannot be empty',
    };
  }

  // Guard clause: empty content
  if (content === undefined || content === null) {
    return {
      success: false,
      error: 'Content cannot be undefined or null',
    };
  }

  try {
    fs.writeFileSync(filePath, content);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to write file: ${(error as Error).message}`,
    };
  }
};

/**
 * Creates a directory if it doesn't exist
 * @param dirPath - Directory path
 * @returns File operation result
 */
export const createDirectorySync = (dirPath: string): FileOperationResult => {
  // Guard clause: empty path
  if (!dirPath || dirPath.trim().length === 0) {
    return {
      success: false,
      error: 'Directory path cannot be empty',
    };
  }

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create directory: ${(error as Error).message}`,
    };
  }
};

/**
 * Parses YAML content
 * @param content - YAML content
 * @returns Parsed content
 */
export const parseYamlContent = (content: string): any => {
  // Guard clause: empty content
  if (!content || content.trim().length === 0) {
    return null;
  }

  try {
    return yaml.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${(error as Error).message}`);
  }
};

/**
 * Stringifies content to YAML
 * @param content - Content to stringify
 * @returns YAML string
 */
export const stringifyToYaml = (content: any): string => {
  // Guard clause: null or undefined content
  if (content === null || content === undefined) {
    return '';
  }

  try {
    return yaml.stringify(content, { indent: 2 });
  } catch (error) {
    throw new Error(`Failed to stringify to YAML: ${(error as Error).message}`);
  }
};

/**
 * Resolves a path relative to a base directory
 * @param basePath - Base directory path
 * @param relativePath - Relative path
 * @returns Resolved absolute path
 */
export const resolvePath = (basePath: string, relativePath: string): string => {
  // Guard clause: empty base path
  if (!basePath || basePath.trim().length === 0) {
    return relativePath || '';
  }

  // Guard clause: empty relative path
  if (!relativePath || relativePath.trim().length === 0) {
    return basePath;
  }

  return path.resolve(basePath, relativePath);
};

/**
 * Gets the directory name of a file path
 * @param filePath - File path
 * @returns Directory name
 */
export const getDirectoryName = (filePath: string): string => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return '';
  }

  return path.dirname(filePath);
};

/**
 * Joins path segments
 * @param segments - Path segments
 * @returns Joined path
 */
export const joinPath = (...segments: string[]): string => {
  // Guard clause: no segments
  if (!segments || segments.length === 0) {
    return '';
  }

  // Filter out empty segments
  const validSegments = segments.filter(segment => 
    segment && segment.trim().length > 0
  );

  return path.join(...validSegments);
};

/**
 * Gets file extension
 * @param filePath - File path
 * @returns File extension (including the dot)
 */
export const getFileExtension = (filePath: string): string => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return '';
  }

  return path.extname(filePath);
};
