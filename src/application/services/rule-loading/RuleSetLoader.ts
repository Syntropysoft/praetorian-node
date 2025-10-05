/**
 * @file src/application/services/rule-loading/RuleSetLoader.ts
 * @description Pure functions for loading rule sets from various sources
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { PraetorianRule, RuleLoadResult } from '../../../shared/types/rules';
import { CORE_RULE_SETS } from '../../../shared/rules/core-rules';

/**
 * @interface RuleSetLoadOptions
 * @description Options for loading a rule set
 */
export interface RuleSetLoadOptions {
  workingDirectory: string;
  validateRules?: boolean;
}

/**
 * Loads a rule set from a path or URL
 * @param ruleSetPath - Path to rule set (file path or URL)
 * @param options - Loading options
 * @returns Promise with loaded rules
 */
export const loadRuleSet = async (
  ruleSetPath: string,
  options: RuleSetLoadOptions
): Promise<RuleLoadResult> => {
  // Guard clause: empty path
  if (!ruleSetPath || ruleSetPath.trim().length === 0) {
    return createEmptyResult(['Rule set path cannot be empty']);
  }

  try {
    // Check if it's a core rule set reference
    if (ruleSetPath.startsWith('@praetorian/core/')) {
      return loadCoreRuleSet(ruleSetPath);
    }

    // Check if it's a URL
    if (isUrl(ruleSetPath)) {
      return await loadRuleSetFromUrl(ruleSetPath);
    }

    // Load from local file
    return await loadRuleSetFromFile(ruleSetPath, options);

  } catch (error) {
    return createEmptyResult([`Failed to load rule set ${ruleSetPath}: ${(error as Error).message}`]);
  }
};

/**
 * Loads a core rule set by name
 * @param corePath - Core rule set path (e.g., '@praetorian/core/all')
 * @returns Rule load result
 */
export const loadCoreRuleSet = (corePath: string): RuleLoadResult => {
  // Guard clause: invalid core path
  if (!corePath || !corePath.startsWith('@praetorian/core/')) {
    return createEmptyResult(['Invalid core rule set path']);
  }

  const coreSetName = corePath.replace('@praetorian/core/', '');
  
  // Guard clause: unknown core set
  if (!(coreSetName in CORE_RULE_SETS)) {
    return createEmptyResult([`Unknown core rule set: ${coreSetName}`]);
  }

  const rules = (CORE_RULE_SETS as any)[coreSetName];
  
  return {
    rules: Array.isArray(rules) ? rules : [],
    errors: [],
    warnings: [],
  };
};

/**
 * Loads rule set from a local file
 * @param filePath - Path to the rule file
 * @param options - Loading options
 * @returns Promise with loaded rules
 */
export const loadRuleSetFromFile = async (
  filePath: string,
  options: RuleSetLoadOptions
): Promise<RuleLoadResult> => {
  // Guard clause: empty file path
  if (!filePath || filePath.trim().length === 0) {
    return createEmptyResult(['File path cannot be empty']);
  }

  try {
    const fullPath = path.resolve(options.workingDirectory, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    const parseResult = parseRuleFile(content, fullPath);
    return parseResult;

  } catch (error) {
    return createEmptyResult([`Failed to read rule file ${filePath}: ${(error as Error).message}`]);
  }
};

/**
 * Loads rule set from a URL (placeholder for future implementation)
 * @param url - URL to the rule set
 * @returns Promise with loaded rules
 */
export const loadRuleSetFromUrl = async (url: string): Promise<RuleLoadResult> => {
  // Guard clause: empty URL
  if (!url || url.trim().length === 0) {
    return createEmptyResult(['URL cannot be empty']);
  }

  // Guard clause: invalid URL
  if (!isUrl(url)) {
    return createEmptyResult(['Invalid URL format']);
  }

  // TODO: Implement URL loading
  return createEmptyResult([`URL loading not yet implemented: ${url}`]);
};

/**
 * Parses rule file content based on file extension
 * @param content - File content
 * @param filePath - Full file path for extension detection
 * @returns Parsed rules result
 */
export const parseRuleFile = (content: string, filePath: string): RuleLoadResult => {
  // Guard clause: empty content
  if (!content || content.trim().length === 0) {
    return createEmptyResult(['File content is empty']);
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const parsedContent = parseContentByExtension(content, ext);
    
    // Guard clause: invalid parsed content
    if (!parsedContent) {
      return createEmptyResult([`Failed to parse ${ext} file`]);
    }

    const rules = extractRulesFromContent(parsedContent);
    return {
      rules,
      errors: [],
      warnings: [],
    };

  } catch (error) {
    return createEmptyResult([`Failed to parse rule file: ${(error as Error).message}`]);
  }
};

/**
 * Parses content based on file extension
 * @param content - File content
 * @param extension - File extension
 * @returns Parsed content
 */
export const parseContentByExtension = (content: string, extension: string): any => {
  // Guard clause: empty content
  if (!content || content.trim().length === 0) {
    return null;
  }

  switch (extension) {
    case '.yaml':
    case '.yml':
      return yaml.load(content);
    case '.json':
      return JSON.parse(content);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
};

/**
 * Extracts rules from parsed content
 * @param parsedContent - Parsed file content
 * @returns Array of rules
 */
export const extractRulesFromContent = (parsedContent: any): PraetorianRule[] => {
  // Guard clause: null or undefined content
  if (!parsedContent) {
    return [];
  }

  // If it's already an array, return it
  if (Array.isArray(parsedContent)) {
    return parsedContent;
  }

  // If it has a rules property, extract it
  if (parsedContent.rules && Array.isArray(parsedContent.rules)) {
    return parsedContent.rules;
  }

  // Invalid format
  throw new Error('Invalid rule file format: expected array of rules or object with rules array');
};

/**
 * Checks if a string is a valid URL
 * @param str - String to check
 * @returns True if URL, false otherwise
 */
export const isUrl = (str: string): boolean => {
  // Guard clause: empty string
  if (!str || str.trim().length === 0) {
    return false;
  }

  return str.startsWith('http://') || str.startsWith('https://');
};

/**
 * Creates an empty rule load result with errors
 * @param errors - Array of error messages
 * @returns Empty result with errors
 */
export const createEmptyResult = (errors: string[] = []): RuleLoadResult => ({
  rules: [],
  errors,
  warnings: [],
});

/**
 * Combines multiple rule load results
 * @param results - Array of rule load results
 * @returns Combined result
 */
export const combineRuleLoadResults = (results: RuleLoadResult[]): RuleLoadResult => {
  // Guard clause: empty results array
  if (!results || results.length === 0) {
    return createEmptyResult();
  }

  return results.reduce(
    (combined, result) => ({
      rules: [...combined.rules, ...result.rules],
      errors: [...combined.errors, ...result.errors],
      warnings: [...combined.warnings, ...result.warnings],
    }),
    createEmptyResult()
  );
};
