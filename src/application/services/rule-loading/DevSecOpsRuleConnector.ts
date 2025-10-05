/**
 * @file src/application/services/rule-loading/DevSecOpsRuleConnector.ts
 * @description DevSecOps Rule Connector - Multi-source rule loading (SOLID SRP + Functional Programming)
 */

import { 
  DevSecOpsConfig, 
  RuleLoadContext, 
  RuleLoadResult, 
  SourceLoadResult,
  RuleSource,
  EnvironmentConfig 
} from '../../../shared/types/devsecops-config';
import { RuleDictionary, RuleDictionaryResult } from '../../../shared/types/rule-dictionary';
import { ALL_CORE_RULES, CORE_RULE_SETS } from '../../../shared/rules/ultra-simple-core-rules';
import {
  createEmptyDictionary,
  addRulesToDictionary,
  mergeRuleDictionaries,
  getDictionaryStats,
} from './UltraSimpleRuleDictionary';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

/**
 * @class DevSecOpsRuleConnector
 * @description Connects rule dictionary with multiple sources (SOLID SRP)
 */
export class DevSecOpsRuleConnector {
  private readonly workingDirectory: string;

  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
  }

  /**
   * Loads rules from DevSecOps configuration (Main Orchestrator Method)
   * @param config - DevSecOps configuration
   * @param context - Loading context
   * @returns Promise with loaded rules and metadata
   */
  async loadRulesFromConfig(
    config: DevSecOpsConfig, 
    context: RuleLoadContext
  ): Promise<RuleLoadResult> {
    const startTime = Date.now();
    
    // Guard clause: no config
    if (!config) {
      return this.createEmptyResult(['Configuration is required']);
    }

    // Guard clause: no environment
    if (!context.environment) {
      return this.createEmptyResult(['Environment is required']);
    }

    try {
      // Validate configuration
      const validationErrors = this.validateConfig(config);
      if (validationErrors.length > 0) {
        return this.createEmptyResult(validationErrors);
      }

      // Get environment configuration
      const envConfig = this.getEnvironmentConfig(config, context.environment);
      
      // Load rules from all sources
      const sourceResults = await this.loadFromSources(
        config.sources, 
        envConfig, 
        context
      );

      // Merge all results
      const mergedResult = this.mergeSourceResults(sourceResults);

      // Apply environment-specific overrides
      const finalResult = this.applyEnvironmentOverrides(
        mergedResult, 
        envConfig, 
        config
      );

      return {
        rules: finalResult.dictionary,
        errors: this.extractErrors(sourceResults),
        warnings: this.extractWarnings(sourceResults),
        metadata: {
          sourcesLoaded: sourceResults.map(r => r.sourceName),
          environmentsProcessed: [context.environment],
          totalRules: Object.keys(finalResult.dictionary).length,
          duplicateRules: this.extractWarnings(sourceResults).filter(w => 
            w.includes('already exists')
          ).length,
          loadDuration: Date.now() - startTime,
        },
      };

    } catch (error) {
      return this.createEmptyResult([`Failed to load rules: ${(error as Error).message}`]);
    }
  }

  /**
   * Loads rules from a specific source (Pure Function with Guard Clauses)
   * @param source - Source configuration
   * @param sourceName - Name of the source
   * @param context - Loading context
   * @returns Promise with source load result
   */
  private async loadFromSource(
    source: RuleSource,
    sourceName: string,
    context: RuleLoadContext
  ): Promise<SourceLoadResult> {
    // Guard clause: source disabled
    if (source.enabled === false) {
      return {
        sourceName,
        rules: {},
        errors: [],
        warnings: [`Source '${sourceName}' is disabled`],
        success: true,
      };
    }

    try {
      switch (source.type) {
        case 'core':
          return this.loadCoreRules(source, sourceName);
        case 'local':
          return await this.loadLocalRules(source, sourceName, context);
        case 'remote':
          return await this.loadRemoteRules(source, sourceName, context);
        case 'package':
          return await this.loadPackageRules(source, sourceName, context);
        case 'git':
          return await this.loadGitRules(source, sourceName, context);
        default:
          return {
            sourceName,
            rules: {},
            errors: [`Unknown source type: ${source.type}`],
            warnings: [],
            success: false,
          };
      }
    } catch (error) {
      return {
        sourceName,
        rules: {},
        errors: [`Failed to load from source '${sourceName}': ${(error as Error).message}`],
        warnings: [],
        success: false,
      };
    }
  }

  /**
   * Loads core rules (Pure Function)
   * @param source - Source configuration
   * @param sourceName - Source name
   * @returns Source load result
   */
  private loadCoreRules(source: RuleSource, sourceName: string): SourceLoadResult {
    // Guard clause: core rules disabled in context
    if (source.enabled === false) {
      return {
        sourceName,
        rules: {},
        errors: [],
        warnings: [`Core rules disabled for source '${sourceName}'`],
        success: true,
      };
    }

    return {
      sourceName,
      rules: ALL_CORE_RULES,
      errors: [],
      warnings: [],
      success: true,
    };
  }

  /**
   * Loads local rules from file system (Pure Function with Guard Clauses)
   * @param source - Source configuration
   * @param sourceName - Source name
   * @param context - Loading context
   * @returns Promise with source load result
   */
  private async loadLocalRules(
    source: RuleSource,
    sourceName: string,
    context: RuleLoadContext
  ): Promise<SourceLoadResult> {
    // Guard clause: no path specified
    if (!source.path) {
      return {
        sourceName,
        rules: {},
        errors: [`Local source '${sourceName}' has no path specified`],
        warnings: [],
        success: false,
      };
    }

    try {
      const fullPath = path.isAbsolute(source.path) 
        ? source.path 
        : path.join(context.workingDirectory, source.path);

      // Check if it's a glob pattern
      if (source.path.includes('*') || source.path.includes('?')) {
        return await this.loadLocalGlobRules(fullPath, sourceName);
      } else {
        return await this.loadLocalSingleFile(fullPath, sourceName);
      }
    } catch (error) {
      return {
        sourceName,
        rules: {},
        errors: [`Failed to load local rules from '${source.path}': ${(error as Error).message}`],
        warnings: [],
        success: false,
      };
    }
  }

  /**
   * Loads rules from directory pattern (Pure Function)
   * @param patternPath - Pattern path (simplified for now)
   * @param sourceName - Source name
   * @returns Promise with source load result
   */
  private async loadLocalGlobRules(
    patternPath: string,
    sourceName: string
  ): Promise<SourceLoadResult> {
    try {
      // For now, handle simple directory patterns
      const dirPath = patternPath.replace('/*.yaml', '').replace('/*.yml', '');
      const files = await this.getRuleFilesFromDirectory(dirPath);
      
      if (files.length === 0) {
        return {
          sourceName,
          rules: {},
          errors: [],
          warnings: [`No rule files found in directory '${dirPath}'`],
          success: true,
        };
      }

      const allRules: RuleDictionary = {};
      const allErrors: string[] = [];
      const allWarnings: string[] = [];

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const parsed = this.parseRuleFile(content, extname(file));
          
          // Merge rules from this file
          const result = addRulesToDictionary(allRules, parsed, file);
          Object.assign(allRules, result.dictionary);
          allErrors.push(...result.warnings.map(w => `${file}: ${w}`));
          allWarnings.push(...result.warnings);
        } catch (error) {
          allErrors.push(`Failed to load ${file}: ${(error as Error).message}`);
        }
      }

      return {
        sourceName,
        rules: allRules,
        errors: allErrors,
        warnings: allWarnings,
        success: allErrors.length === 0,
      };
    } catch (error) {
      return {
        sourceName,
        rules: {},
        errors: [`Failed to process directory pattern '${patternPath}': ${(error as Error).message}`],
        warnings: [],
        success: false,
      };
    }
  }

  /**
   * Gets rule files from directory (Pure Function)
   * @param dirPath - Directory path
   * @returns Promise with array of file paths
   */
  private async getRuleFilesFromDirectory(dirPath: string): Promise<string[]> {
    try {
      const entries = await readdir(dirPath);
      const ruleFiles: string[] = [];

      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const stats = await stat(fullPath);
        
        if (stats.isFile() && (entry.endsWith('.yaml') || entry.endsWith('.yml') || entry.endsWith('.json'))) {
          ruleFiles.push(fullPath);
        }
      }

      return ruleFiles;
    } catch (error) {
      return [];
    }
  }

  /**
   * Loads rules from single file (Pure Function)
   * @param filePath - File path
   * @param sourceName - Source name
   * @returns Promise with source load result
   */
  private async loadLocalSingleFile(
    filePath: string,
    sourceName: string
  ): Promise<SourceLoadResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const rules = this.parseRuleFile(content, path.extname(filePath));

      return {
        sourceName,
        rules,
        errors: [],
        warnings: [],
        success: true,
      };
    } catch (error) {
      return {
        sourceName,
        rules: {},
        errors: [`Failed to load file '${filePath}': ${(error as Error).message}`],
        warnings: [],
        success: false,
      };
    }
  }

  // Placeholder methods for other source types (to be implemented)
  private async loadRemoteRules(source: RuleSource, sourceName: string, context: RuleLoadContext): Promise<SourceLoadResult> {
    return {
      sourceName,
      rules: {},
      errors: ['Remote rule loading not implemented yet'],
      warnings: [],
      success: false,
    };
  }

  private async loadPackageRules(source: RuleSource, sourceName: string, context: RuleLoadContext): Promise<SourceLoadResult> {
    return {
      sourceName,
      rules: {},
      errors: ['Package rule loading not implemented yet'],
      warnings: [],
      success: false,
    };
  }

  private async loadGitRules(source: RuleSource, sourceName: string, context: RuleLoadContext): Promise<SourceLoadResult> {
    return {
      sourceName,
      rules: {},
      errors: ['Git rule loading not implemented yet'],
      warnings: [],
      success: false,
    };
  }

  // Helper methods (Pure Functions with Guard Clauses)

  private validateConfig(config: DevSecOpsConfig): string[] {
    const errors: string[] = [];

    // Guard clause: no sources
    if (!config.sources || Object.keys(config.sources).length === 0) {
      errors.push('No rule sources defined');
    }

    // Guard clause: no environments
    if (!config.environments || Object.keys(config.environments).length === 0) {
      errors.push('No environments defined');
    }

    return errors;
  }

  private getEnvironmentConfig(config: DevSecOpsConfig, environment: string): EnvironmentConfig {
    // Guard clause: environment not found
    if (!config.environments[environment]) {
      throw new Error(`Environment '${environment}' not found in configuration`);
    }

    return config.environments[environment];
  }

  private async loadFromSources(
    sources: { [sourceName: string]: RuleSource },
    envConfig: EnvironmentConfig,
    context: RuleLoadContext
  ): Promise<SourceLoadResult[]> {
    const loadPromises = envConfig.sources.map(sourceName => {
      const source = sources[sourceName];
      if (!source) {
        return Promise.resolve({
          sourceName,
          rules: {},
          errors: [`Source '${sourceName}' not found in configuration`],
          warnings: [],
          success: false,
        });
      }
      return this.loadFromSource(source, sourceName, context);
    });

    return Promise.all(loadPromises);
  }

  private mergeSourceResults(sourceResults: SourceLoadResult[]): RuleDictionaryResult {
    const dictionaries = sourceResults
      .filter(result => result.success)
      .map(result => result.rules);
    
    const sources = sourceResults
      .filter(result => result.success)
      .map(result => result.sourceName);

    return mergeRuleDictionaries(dictionaries, sources);
  }

  private applyEnvironmentOverrides(
    mergedResult: RuleDictionaryResult,
    envConfig: EnvironmentConfig,
    config: DevSecOpsConfig
  ): RuleDictionaryResult {
    let finalDictionary = mergedResult.dictionary;

    // Apply environment-specific overrides
    if (envConfig.overrides) {
      const overrideResult = addRulesToDictionary(
        finalDictionary,
        envConfig.overrides,
        `environment-${envConfig.name}-overrides`
      );
      finalDictionary = overrideResult.dictionary;
    }

    // Apply global overrides
    if (config.globalOverrides) {
      const globalOverrideResult = addRulesToDictionary(
        finalDictionary,
        config.globalOverrides,
        'global-overrides'
      );
      finalDictionary = globalOverrideResult.dictionary;
    }

    // Remove disabled rules
    const disabledRules = [
      ...(envConfig.disabledRules || []),
      ...(config.globalDisabled || [])
    ];

    for (const ruleId of disabledRules) {
      delete finalDictionary[ruleId];
    }

    return {
      dictionary: finalDictionary,
      added: mergedResult.added,
      skipped: mergedResult.skipped,
      warnings: mergedResult.warnings,
    };
  }

  private parseRuleFile(content: string, extension: string): RuleDictionary {
    try {
      let parsed: any;

      switch (extension.toLowerCase()) {
        case '.yaml':
        case '.yml':
          parsed = yaml.load(content);
          break;
        case '.json':
          parsed = JSON.parse(content);
          break;
        default:
          throw new Error(`Unsupported file extension: ${extension}`);
      }

      return this.extractRulesFromParsedContent(parsed);
    } catch (error) {
      throw new Error(`Failed to parse rule file: ${(error as Error).message}`);
    }
  }

  private extractRulesFromParsedContent(content: any): RuleDictionary {
    // Guard clause: no content
    if (!content) {
      return {};
    }

    // Handle different content structures
    if (Array.isArray(content)) {
      return this.arrayToRuleDictionary(content);
    } else if (content.rules && Array.isArray(content.rules)) {
      return this.arrayToRuleDictionary(content.rules);
    } else if (typeof content === 'object') {
      // Check if it's already a rule dictionary
      if (this.isRuleDictionary(content)) {
        return content;
      }
      // Treat as single rule if it has id and name
      if (content.id && content.name) {
        return { [content.id]: content.name };
      }
    }

    return {};
  }

  private arrayToRuleDictionary(rules: any[]): RuleDictionary {
    const dictionary: RuleDictionary = {};
    
    for (const rule of rules) {
      if (rule.id && rule.name) {
        dictionary[rule.id] = rule.name;
      }
    }
    
    return dictionary;
  }

  private isRuleDictionary(obj: any): boolean {
    return typeof obj === 'object' && 
           obj !== null && 
           !Array.isArray(obj) &&
           Object.values(obj).every(value => typeof value === 'string');
  }

  private extractErrors(sourceResults: SourceLoadResult[]): string[] {
    return sourceResults.flatMap(result => result.errors);
  }

  private extractWarnings(sourceResults: SourceLoadResult[]): string[] {
    return sourceResults.flatMap(result => result.warnings);
  }

  private createEmptyResult(errors: string[]): RuleLoadResult {
    return {
      rules: {},
      errors,
      warnings: [],
      metadata: {
        sourcesLoaded: [],
        environmentsProcessed: [],
        totalRules: 0,
        duplicateRules: 0,
        loadDuration: 0,
      },
    };
  }
}
