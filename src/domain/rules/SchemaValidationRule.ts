/**
 * Schema Validation Rule
 * 
 * A validation rule that validates configuration files against JSON schemas
 */

import { ValidationRule, ConfigFile, ValidationResult, ValidationError, ValidationWarning } from '../../shared/types';
import { JsonSchema, SchemaValidationRule as SchemaRule } from '../../shared/types';
import { SchemaValidator } from '../../application/validators/SchemaValidator';

export class SchemaValidationRule implements ValidationRule {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly category: 'security' | 'compliance' | 'performance' | 'best-practice';
  public readonly severity: 'error' | 'warning' | 'info';
  public readonly enabled: boolean;
  public readonly config?: Record<string, any>;

  private schemaValidator: SchemaValidator;
  private schemaRules: SchemaRule[];

  constructor(
    id: string,
    name: string,
    description: string,
    schemaRules: SchemaRule[],
    category: 'security' | 'compliance' | 'performance' | 'best-practice' = 'best-practice',
    severity: 'error' | 'warning' | 'info' = 'error',
    enabled: boolean = true,
    config?: Record<string, any>
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.severity = severity;
    this.enabled = enabled;
    this.config = config;
    this.schemaRules = schemaRules;
    this.schemaValidator = new SchemaValidator(config);
  }

  async execute(files: ConfigFile[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let rulesChecked = 0;
    let rulesPassed = 0;
    let rulesFailed = 0;

    for (const file of files) {
      for (const schemaRule of this.schemaRules) {
        rulesChecked++;
        
        try {
          const result = this.schemaValidator.validate(
            file.content,
            schemaRule.schema,
            {
              config: this.config,
              environment: file.environment,
              project: file.path,
              timestamp: new Date(),
              files: { [file.path]: file.content },
              schema: schemaRule.schema,
              rules: this.schemaRules,
              options: this.config || {}
            }
          );

          if (result.valid) {
            rulesPassed++;
          } else {
            rulesFailed++;
            
            // Convert schema errors to validation errors
            for (const error of result.errors) {
              errors.push({
                code: error.code,
                message: error.message,
                severity: this.severity,
                path: error.path,
                context: {
                  file: file.path,
                  rule: schemaRule.id,
                  actual: error.actual,
                  expected: error.expected
                }
              });
            }

            // Convert schema warnings to validation warnings
            for (const warning of result.warnings) {
              warnings.push({
                code: warning.code,
                message: warning.message,
                severity: 'warning',
                path: warning.path,
                context: {
                  file: file.path,
                  rule: schemaRule.id
                }
              });
            }
          }
        } catch (error) {
          rulesFailed++;
          errors.push({
            code: 'SCHEMA_VALIDATION_ERROR',
            message: `Schema validation failed for ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: this.severity,
            path: file.path,
            context: {
              file: file.path,
              rule: schemaRule.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      metadata: {
        rulesChecked,
        rulesPassed,
        rulesFailed,
        filesCompared: files.length
      }
    };
  }

  /**
   * Add a new schema rule
   */
  addSchemaRule(schemaRule: SchemaRule): void {
    this.schemaRules.push(schemaRule);
  }

  /**
   * Remove a schema rule by ID
   */
  removeSchemaRule(ruleId: string): boolean {
    const index = this.schemaRules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.schemaRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all schema rules
   */
  getSchemaRules(): SchemaRule[] {
    return [...this.schemaRules];
  }

  /**
   * Update schema validator options
   */
  updateOptions(options: Record<string, any>): void {
    this.schemaValidator = new SchemaValidator(options);
  }
}
