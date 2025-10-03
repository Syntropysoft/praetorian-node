/**
 * Security Rule - Functional Programming
 * 
 * Single Responsibility: Validate configuration files against security rules
 * Pure functions, no state, no side effects
 */

import { ValidationRule, ConfigFile, ValidationResult } from '../../shared/types';
import { SecurityRule as SecurityRuleType, SecurityContext, SecurityOptions } from '../../shared/types/security';
import { validateSecurity } from '../../application/validators/SecurityValidator';

export class SecurityRule implements ValidationRule {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly category: 'security' | 'compliance' | 'performance' | 'best-practice';
  public readonly severity: 'error' | 'warning' | 'info';
  public readonly enabled: boolean;
  public readonly config?: Record<string, any>;

  private securityRules: SecurityRuleType[];
  private options: SecurityOptions;

  constructor(
    id: string,
    name: string,
    description: string,
    securityRules: SecurityRuleType[],
    category: 'security' | 'compliance' | 'performance' | 'best-practice' = 'security',
    severity: 'error' | 'warning' | 'info' = 'error',
    enabled: boolean = true,
    config?: Record<string, any>
  ) {
    // Guard clause: validate required parameters
    if (!id || !name || !description) {
      throw new Error('SecurityRule requires id, name, and description');
    }

    // Guard clause: validate security rules
    if (!securityRules || securityRules.length === 0) {
      throw new Error('SecurityRule requires at least one security rule');
    }

    this.id = id;
    this.name = name;
    this.description = description;
    this.securityRules = securityRules;
    this.category = category;
    this.severity = severity;
    this.enabled = enabled;
    this.config = config;
    this.options = {
      stopOnCritical: true,
      includeLowSeverity: false,
      validatePermissions: true,
      validateCompliance: true,
      ...config
    };
  }

  /**
   * Execute security validation
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
      const result = await validateFileSecurity(file, this.securityRules, this.options);
      results.push(result);
    }

    return combineResults(results);
  }

  /**
   * Get security rules for this rule
   */
  public getSecurityRules(): SecurityRuleType[] {
    return [...this.securityRules];
  }

  /**
   * Add a new security rule
   */
  public addSecurityRule(rule: SecurityRuleType): void {
    // Guard clause: validate rule
    if (!rule || !rule.id || !rule.type) {
      throw new Error('Invalid security rule');
    }

    this.securityRules.push(rule);
  }

  /**
   * Remove a security rule by ID
   */
  public removeSecurityRule(ruleId: string): boolean {
    // Guard clause: validate rule ID
    if (!ruleId) {
      return false;
    }

    const initialLength = this.securityRules.length;
    this.securityRules = this.securityRules.filter(rule => rule.id !== ruleId);
    return this.securityRules.length < initialLength;
  }

  /**
   * Update security options
   */
  public updateOptions(options: Partial<SecurityOptions>): void {
    // Guard clause: validate options
    if (!options || typeof options !== 'object') {
      throw new Error('Invalid security options');
    }

    this.options = { ...this.options, ...options };
  }
}

/**
 * Pure function to validate security in a single file
 */
const validateFileSecurity = async (
  file: ConfigFile,
  securityRules: SecurityRuleType[],
  options: SecurityOptions
): Promise<ValidationResult> => {
  // Guard clause: no file content
  if (!file.content) {
    return createSuccessResult();
  }

  const context: SecurityContext = {
    filePath: file.path,
    content: JSON.stringify(file.content),
    options
  };

  const result = validateSecurity(context.content, securityRules, context);

  return {
    success: result.valid,
    errors: result.errors,
    warnings: result.warnings,
    results: result.results.map(r => ({
      rule: r.rule.id,
      passed: r.passed,
      path: r.path,
      value: r.matchedValue
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
