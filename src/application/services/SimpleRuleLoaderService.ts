/**
 * @file src/application/services/SimpleRuleLoaderService.ts
 * @description Simple rule loader service (SOLID SRP + Functional Programming)
 */

import { 
  SimpleRule, 
  SimpleRuleConfig, 
  SimpleRuleLoadResult,
  SimpleRuleSet 
} from '../../shared/types/simple-rules';
import { 
  ALL_CORE_SIMPLE_RULES, 
  CORE_SIMPLE_RULE_SETS 
} from '../../shared/rules/simple-core-rules';
import {
  createEmptySimpleDictionary,
  addSimpleRulesToDictionary,
  simpleDictionaryToRules,
  overrideSimpleRulesInDictionary,
  validateSimpleRule,
} from './rule-loading/SimpleRuleDictionary';
import { SimpleRuleDictionary, SimpleRuleDictionaryResult } from '../../shared/types/simple-rules';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * @interface SimpleRuleLoaderOptions
 * @description Options for the simple rule loader
 */
interface SimpleRuleLoaderOptions {
  /** Working directory for relative paths */
  workingDirectory?: string;
  /** Whether to include core rules by default */
  includeCoreRules?: boolean;
  /** Whether to validate loaded rules */
  validateRules?: boolean;
}

/**
 * @class SimpleRuleLoaderService
 * @description Service for loading simple rules (SOLID SRP)
 */
export class SimpleRuleLoaderService {
  private readonly workingDirectory: string;
  private readonly includeCoreRules: boolean;
  private readonly validateRules: boolean;

  constructor(options: SimpleRuleLoaderOptions = {}) {
    this.workingDirectory = options.workingDirectory || process.cwd();
    this.includeCoreRules = options.includeCoreRules ?? true;
    this.validateRules = options.validateRules ?? true;
  }

  /**
   * Loads simple rules from a configuration (Main Orchestrator Method)
   * @param config - Rule configuration
   * @returns Promise with loaded rules and any errors/warnings
   */
  async loadRules(config: SimpleRuleConfig): Promise<SimpleRuleLoadResult> {
    // Guard clause: no config
    if (!config) {
      return this.createEmptyResult(['Configuration is required']);
    }

    try {
      // Initialize rule dictionary
      let ruleDictionary = createEmptySimpleDictionary();
      const allWarnings: string[] = [];
      const allErrors: string[] = [];

      // Load rule sets and add to dictionary
      const ruleSetResults = await this.loadRuleSets(config.ruleSets);
      const loadedRules = this.extractRulesFromResults(ruleSetResults);
      
      // Add loaded rules to dictionary
      if (loadedRules.length > 0) {
        const dictResult = addSimpleRulesToDictionary(
          ruleDictionary, 
          loadedRules, 
          'rule-sets'
        );
        ruleDictionary = dictResult.dictionary;
        allWarnings.push(...dictResult.warnings);
      }
      
      // Determine if we should include core rules as base
      const hasCoreAllRequest = config.ruleSets.includes('@praetorian/core/all');
      const shouldIncludeAllCoreRules = this.includeCoreRules && 
        (config.ruleSets.length === 0 || hasCoreAllRequest);
      
      // Add core rules to dictionary if needed
      if (shouldIncludeAllCoreRules) {
        const coreRules = this.getBaseRules();
        const coreDictResult = addSimpleRulesToDictionary(
          ruleDictionary, 
          coreRules, 
          'core-rules'
        );
        ruleDictionary = coreDictResult.dictionary;
        allWarnings.push(...coreDictResult.warnings);
      }
      
      // Apply rule overrides using dictionary
      if (config.overrideRules && config.overrideRules.length > 0) {
        const overrideResult = overrideSimpleRulesInDictionary(ruleDictionary, config.overrideRules);
        ruleDictionary = overrideResult.dictionary;
        allWarnings.push(...overrideResult.warnings);
      }
      
      // Add custom rules to dictionary
      if (config.customRules && config.customRules.length > 0) {
        const customDictResult = addSimpleRulesToDictionary(
          ruleDictionary, 
          config.customRules, 
          'custom-rules'
        );
        ruleDictionary = customDictResult.dictionary;
        allWarnings.push(...customDictResult.warnings);
      }

      // Get final rules from dictionary
      const finalRules = simpleDictionaryToRules(ruleDictionary);

      // Validate if enabled
      const validationWarnings = this.validateRules 
        ? this.validateLoadedRules(finalRules)
        : [];

      return {
        rules: finalRules,
        errors: [...this.extractErrorsFromResults(ruleSetResults), ...allErrors],
        warnings: [
          ...this.extractWarningsFromResults(ruleSetResults), 
          ...allWarnings, 
          ...validationWarnings
        ],
      };

    } catch (error) {
      return this.createEmptyResult([`Failed to load rules: ${(error as Error).message}`]);
    }
  }

  /**
   * Gets base rules to start with (Pure Function)
   * @returns Base rules
   */
  private getBaseRules(): SimpleRule[] {
    return this.includeCoreRules ? ALL_CORE_SIMPLE_RULES : [];
  }

  /**
   * Loads multiple rule sets (Pure Function with Guard Clauses)
   * @param ruleSetPaths - Array of rule set paths
   * @returns Array of rule load results
   */
  private async loadRuleSets(ruleSetPaths: string[]): Promise<SimpleRuleLoadResult[]> {
    // Guard clause: no rule sets
    if (!ruleSetPaths || ruleSetPaths.length === 0) {
      return [];
    }

    const loadPromises = ruleSetPaths.map(path => this.loadRuleSet(path));
    return Promise.all(loadPromises);
  }

  /**
   * Loads a single rule set (Pure Function with Guard Clauses)
   * @param ruleSetPath - Path to rule set
   * @returns Rule load result
   */
  private async loadRuleSet(ruleSetPath: string): Promise<SimpleRuleLoadResult> {
    // Guard clause: empty path
    if (!ruleSetPath || ruleSetPath.trim().length === 0) {
      return this.createEmptyResult(['Rule set path cannot be empty']);
    }

    try {
      // Check if it's a core rule set reference
      if (ruleSetPath.startsWith('@praetorian/core/')) {
        return this.loadCoreRuleSet(ruleSetPath);
      }

      // Check if it's a URL
      if (this.isUrl(ruleSetPath)) {
        return await this.loadRuleSetFromUrl(ruleSetPath);
      }

      // Load from local file
      return await this.loadRuleSetFromFile(ruleSetPath);

    } catch (error) {
      return this.createEmptyResult([`Failed to load rule set '${ruleSetPath}': ${(error as Error).message}`]);
    }
  }

  /**
   * Loads a core rule set (Pure Function)
   * @param corePath - Core rule set path
   * @returns Rule load result
   */
  private loadCoreRuleSet(corePath: string): SimpleRuleLoadResult {
    // Guard clause: invalid core path
    if (!corePath || !corePath.startsWith('@praetorian/core/')) {
      return this.createEmptyResult(['Invalid core rule set path']);
    }

    const coreSetName = corePath.replace('@praetorian/core/', '');
    
    // Guard clause: unknown core set
    if (!(coreSetName in CORE_SIMPLE_RULE_SETS)) {
      return this.createEmptyResult([`Unknown core rule set: ${coreSetName}`]);
    }

    const rules = (CORE_SIMPLE_RULE_SETS as any)[coreSetName];
    
    return {
      rules: Array.isArray(rules) ? rules : [],
      errors: [],
      warnings: [],
    };
  }

  /**
   * Loads rule set from local file (Pure Function with Guard Clauses)
   * @param filePath - Path to rule file
   * @returns Rule load result
   */
  private async loadRuleSetFromFile(filePath: string): Promise<SimpleRuleLoadResult> {
    // Guard clause: invalid file path
    if (!filePath || typeof filePath !== 'string') {
      return this.createEmptyResult(['Invalid file path']);
    }

    try {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.workingDirectory, filePath);

      const content = await fs.readFile(fullPath, 'utf-8');
      const extension = path.extname(filePath).toLowerCase();

      return this.parseContentByExtension(content, extension);

    } catch (error) {
      return this.createEmptyResult([`Failed to read file '${filePath}': ${(error as Error).message}`]);
    }
  }

  /**
   * Loads rule set from URL (Placeholder - Pure Function)
   * @param url - URL to load from
   * @returns Rule load result
   */
  private async loadRuleSetFromUrl(url: string): Promise<SimpleRuleLoadResult> {
    // Guard clause: invalid URL
    if (!url || typeof url !== 'string') {
      return this.createEmptyResult(['Invalid URL']);
    }

    // TODO: Implement URL loading
    return this.createEmptyResult(['URL loading not implemented yet']);
  }

  /**
   * Parses content by file extension (Pure Function)
   * @param content - File content
   * @param extension - File extension
   * @returns Rule load result
   */
  private parseContentByExtension(content: string, extension: string): SimpleRuleLoadResult {
    try {
      let parsed: any;

      switch (extension) {
        case '.yaml':
        case '.yml':
          parsed = yaml.load(content);
          break;
        case '.json':
          parsed = JSON.parse(content);
          break;
        default:
          return this.createEmptyResult([`Unsupported file extension: ${extension}`]);
      }

      return this.extractRulesFromContent(parsed);

    } catch (error) {
      return this.createEmptyResult([`Failed to parse content: ${(error as Error).message}`]);
    }
  }

  /**
   * Extracts rules from parsed content (Pure Function)
   * @param content - Parsed content
   * @returns Rule load result
   */
  private extractRulesFromContent(content: any): SimpleRuleLoadResult {
    // Guard clause: no content
    if (!content) {
      return this.createEmptyResult(['No content to parse']);
    }

    // Handle different content structures
    let rules: any[] = [];

    if (Array.isArray(content)) {
      rules = content;
    } else if (content.rules && Array.isArray(content.rules)) {
      rules = content.rules;
    } else if (typeof content === 'object') {
      // Treat object as a single rule if it has id and name
      if (content.id && content.name) {
        rules = [content];
      }
    }

    // Filter valid rules and collect errors for invalid ones
    const validRules: SimpleRule[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const validation = validateSimpleRule(rule);
      
      if (validation.valid) {
        validRules.push(rule);
      } else {
        validationErrors.push(`Rule at index ${i}: ${validation.errors.join(', ')}`);
      }
    }

    return {
      rules: validRules,
      errors: validationErrors,
      warnings: [],
    };
  }

  // Helper methods (Pure Functions)

  private createEmptyResult(errors: string[]): SimpleRuleLoadResult {
    return {
      rules: [],
      errors,
      warnings: [],
    };
  }

  private extractRulesFromResults(results: SimpleRuleLoadResult[]): SimpleRule[] {
    return results.flatMap(result => result.rules);
  }

  private extractErrorsFromResults(results: SimpleRuleLoadResult[]): string[] {
    return results.flatMap(result => result.errors);
  }

  private extractWarningsFromResults(results: SimpleRuleLoadResult[]): string[] {
    return results.flatMap(result => result.warnings);
  }

  private isUrl(path: string): boolean {
    try {
      new URL(path);
      return true;
    } catch {
      return false;
    }
  }

  private validateLoadedRules(rules: SimpleRule[]): string[] {
    const validationErrors: string[] = [];
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const validation = validateSimpleRule(rule);
      
      if (!validation.valid) {
        validationErrors.push(`Rule at index ${i}: ${validation.errors.join(', ')}`);
      }
    }
    
    return validationErrors.map(error => `Validation warning: ${error}`);
  }
}
