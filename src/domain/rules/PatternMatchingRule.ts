/**
 * Pattern Matching Rule - Functional Programming
 * 
 * Single Responsibility: Validate configuration files against pattern rules
 * Pure functions, no state, no side effects
 */

import { ValidationRule, ConfigFile, ValidationResult } from '../../shared/types';
import { PatternRule, PatternMatchingContext, PatternMatchingOptions } from '../../shared/types/pattern';
import { validatePatterns } from '../../application/validators/PatternValidator';

export class PatternMatchingRule implements ValidationRule {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly category: 'security' | 'compliance' | 'performance' | 'best-practice';
  public readonly severity: 'error' | 'warning' | 'info';
  public readonly enabled: boolean;
  public readonly config?: Record<string, any>;

  private patternRules: PatternRule[];
  private options: PatternMatchingOptions;

  constructor(
    id: string,
    name: string,
    description: string,
    patternRules: PatternRule[],
    category: 'security' | 'compliance' | 'performance' | 'best-practice' = 'best-practice',
    severity: 'error' | 'warning' | 'info' = 'error',
    enabled: boolean = true,
    config?: Record<string, any>
  ) {
    // Guard clause: validate required parameters
    if (!id || !name || !description) {
      throw new Error('PatternMatchingRule requires id, name, and description');
    }

    // Guard clause: validate pattern rules
    if (!patternRules || patternRules.length === 0) {
      throw new Error('PatternMatchingRule requires at least one pattern rule');
    }

    this.id = id;
    this.name = name;
    this.description = description;
    this.patternRules = patternRules;
    this.category = category;
    this.severity = severity;
    this.enabled = enabled;
    this.config = config;
    this.options = {
      stopOnFirstError: false,
      includeWarnings: true,
      validateAllPatterns: true,
      ...config
    };
  }

  /**
   * Execute pattern matching validation
   */
  public async execute(files: ConfigFile[]): Promise<ValidationResult> {
    // Guard clause: rule disabled
    if (!this.enabled) {
      return createSuccessResult();
    }

    // Guard clause: no files provided
    if (!files || files.length === 0) {
      return createSuccessResult();
    }

    const results: ValidationResult[] = [];

    for (const file of files) {
      const result = await validateFilePatterns(file, this.patternRules, this.options);
      results.push(result);
    }

    return combineResults(results);
  }

  /**
   * Get pattern rules for this rule
   */
  public getPatternRules(): PatternRule[] {
    return [...this.patternRules];
  }

  /**
   * Add a new pattern rule
   */
  public addPatternRule(rule: PatternRule): void {
    // Guard clause: validate rule
    if (!rule || !rule.id || !rule.pattern) {
      throw new Error('Invalid pattern rule');
    }

    this.patternRules.push(rule);
  }

  /**
   * Remove a pattern rule by ID
   */
  public removePatternRule(ruleId: string): boolean {
    // Guard clause: validate rule ID
    if (!ruleId) {
      return false;
    }

    const initialLength = this.patternRules.length;
    this.patternRules = this.patternRules.filter(rule => rule.id !== ruleId);
    return this.patternRules.length < initialLength;
  }
}

/**
 * Pure function to validate patterns in a single file
 */
const validateFilePatterns = async (
  file: ConfigFile,
  patternRules: PatternRule[],
  options: PatternMatchingOptions
): Promise<ValidationResult> => {
  // Guard clause: no file content
  if (!file.content) {
    return createSuccessResult();
  }

  const context: PatternMatchingContext = {
    filePath: file.path,
    options
  };

  const result = validatePatterns(file.content, patternRules, context);

  return {
    success: result.valid,
    errors: result.errors,
    warnings: result.warnings,
    results: result.results.map(r => ({
      rule: r.rule.id,
      matched: r.matched,
      path: r.path,
      value: r.testedValue
    }))
  };
};

/**
 * Pure function to create success result
 */
const createSuccessResult = (): ValidationResult => ({
  success: true,
  errors: [],
  warnings: [],
  results: []
});

/**
 * Pure function to combine multiple results
 */
const combineResults = (results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(r => r.errors || []);
  const allWarnings = results.flatMap(r => r.warnings || []);
  const allSuccess = results.every(r => r.success);

  return {
    success: allSuccess,
    errors: allErrors,
    warnings: allWarnings,
    results: results.flatMap(r => r.results || [])
  };
};
