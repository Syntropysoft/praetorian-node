/**
 * @file src/application/services/RuleLoaderService.ts
 * @description Service for loading and composing validation rules (SOLID SRP refactored)
 */

import { 
  PraetorianRule, 
  RuleConfig, 
  RuleLoadResult, 
  RuleSet 
} from '../../shared/types/rules';
import { ALL_CORE_RULES, CORE_RULE_SETS } from '../../shared/rules/core-rules';
import { 
  loadRuleSet, 
  combineRuleLoadResults,
  RuleSetLoadOptions 
} from './rule-loading/RuleSetLoader';
import { 
  composeRules, 
  validateLoadedRules,
  RuleCompositionOptions 
} from './rule-loading/RuleComposer';
import {
  RuleDictionary,
  createEmptyDictionary,
  addRulesToDictionary,
  dictionaryToRules,
  RuleDictionaryResult,
  overrideRulesInDictionary,
} from './rule-loading/RuleDictionary';

/**
 * @interface RuleLoaderOptions
 * @description Options for the rule loader
 */
interface RuleLoaderOptions {
  /** Working directory for relative paths */
  workingDirectory?: string;
  /** Whether to include core rules by default */
  includeCoreRules?: boolean;
  /** Whether to validate loaded rules */
  validateRules?: boolean;
}

/**
 * @class RuleLoaderService
 * @description Service for loading and composing validation rules (SOLID SRP)
 */
export class RuleLoaderService {
  private readonly workingDirectory: string;
  private readonly includeCoreRules: boolean;
  private readonly validateRules: boolean;

  constructor(options: RuleLoaderOptions = {}) {
    this.workingDirectory = options.workingDirectory || process.cwd();
    this.includeCoreRules = options.includeCoreRules ?? true;
    this.validateRules = options.validateRules ?? true;
  }

  /**
   * Loads rules from a configuration
   * @param config - Rule configuration
   * @returns Promise with loaded rules and any errors/warnings
   */
  async loadRules(config: RuleConfig): Promise<RuleLoadResult> {
    // Guard clause: no config
    if (!config) {
      return createEmptyResult(['Configuration is required']);
    }

    try {
      // Initialize rule dictionary
      let ruleDictionary = createEmptyDictionary();
      const allWarnings: string[] = [];
      const allErrors: string[] = [];

      // Load rule sets and add to dictionary
      const ruleSetResults = await this.loadRuleSets(config.ruleSets);
      const loadedRules = extractRulesFromResults(ruleSetResults);
      
      // Add loaded rules to dictionary
      if (loadedRules.length > 0) {
        const dictResult = addRulesToDictionary(
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
        const coreDictResult = addRulesToDictionary(
          ruleDictionary, 
          coreRules, 
          'core-rules'
        );
        ruleDictionary = coreDictResult.dictionary;
        allWarnings.push(...coreDictResult.warnings);
      }
      
      // Apply rule overrides using dictionary
      if (config.overrideRules && config.overrideRules.length > 0) {
        const overrideResult = overrideRulesInDictionary(ruleDictionary, config.overrideRules);
        ruleDictionary = overrideResult.dictionary;
        allWarnings.push(...overrideResult.warnings);
      }
      
      // Add custom rules to dictionary
      if (config.customRules && config.customRules.length > 0) {
        const customDictResult = addRulesToDictionary(
          ruleDictionary, 
          config.customRules, 
          'custom-rules'
        );
        ruleDictionary = customDictResult.dictionary;
        allWarnings.push(...customDictResult.warnings);
      }

      // Get final rules from dictionary
      const finalRules = dictionaryToRules(ruleDictionary);

      // Validate if enabled
      const validationWarnings = this.validateRules 
        ? validateLoadedRules(finalRules)
        : [];

      return {
        rules: finalRules,
        errors: [...extractErrorsFromResults(ruleSetResults), ...allErrors],
        warnings: [
          ...extractWarningsFromResults(ruleSetResults), 
          ...allWarnings, 
          ...validationWarnings
        ],
      };

    } catch (error) {
      return createEmptyResult([`Failed to load rules: ${(error as Error).message}`]);
    }
  }

  /**
   * Gets base rules to start with
   * @returns Base rules
   */
  private getBaseRules(): PraetorianRule[] {
    return this.includeCoreRules ? ALL_CORE_RULES : [];
  }

  /**
   * Loads multiple rule sets
   * @param ruleSetPaths - Array of rule set paths
   * @returns Array of rule load results
   */
  private async loadRuleSets(ruleSetPaths: string[]): Promise<RuleLoadResult[]> {
    // Guard clause: no rule sets
    if (!ruleSetPaths || ruleSetPaths.length === 0) {
      return [];
    }

    const options: RuleSetLoadOptions = {
      workingDirectory: this.workingDirectory,
      validateRules: this.validateRules,
    };

    const loadPromises = ruleSetPaths.map(path => 
      loadRuleSet(path, options)
    );

    return Promise.all(loadPromises);
  }

  /**
   * Gets available core rule sets
   * @returns Available core rule set names
   */
  getAvailableCoreRuleSets(): string[] {
    return Object.keys(CORE_RULE_SETS);
  }
}

/**
 * Creates an empty rule load result with errors
 * @param errors - Array of error messages
 * @returns Empty result with errors
 */
const createEmptyResult = (errors: string[] = []): RuleLoadResult => ({
  rules: [],
  errors,
  warnings: [],
});

/**
 * Extracts rules from multiple load results
 * @param results - Array of rule load results
 * @returns Combined rules array
 */
const extractRulesFromResults = (results: RuleLoadResult[]): PraetorianRule[] => {
  // Guard clause: no results
  if (!results || results.length === 0) {
    return [];
  }

  return results.flatMap(result => result.rules);
};

/**
 * Extracts errors from multiple load results
 * @param results - Array of rule load results
 * @returns Combined errors array
 */
const extractErrorsFromResults = (results: RuleLoadResult[]): string[] => {
  // Guard clause: no results
  if (!results || results.length === 0) {
    return [];
  }

  return results.flatMap(result => result.errors);
};

/**
 * Extracts warnings from multiple load results
 * @param results - Array of rule load results
 * @returns Combined warnings array
 */
const extractWarningsFromResults = (results: RuleLoadResult[]): string[] => {
  // Guard clause: no results
  if (!results || results.length === 0) {
    return [];
  }

  return results.flatMap(result => result.warnings);
};
