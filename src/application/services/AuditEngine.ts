import { AuditResult, ValidationContext, ValidationResult, AuditSummary } from '../../shared/types';
import { Validator } from './Validator';
import { AuditCalculator } from './AuditCalculator';
import { SecurityAuditor } from '../../infrastructure/plugins/SecurityAuditor';
import { ComplianceAuditor } from '../../infrastructure/plugins/ComplianceAuditor';
import { PerformanceAuditor } from '../../infrastructure/plugins/PerformanceAuditor';

interface AuditEngineOptions {
  plugins?: string[];
  types?: string[];
  strict?: boolean;
}

export class AuditEngine {
  private validator: Validator;
  private calculator: AuditCalculator;
  private securityAuditor: SecurityAuditor;
  private complianceAuditor: ComplianceAuditor;
  private performanceAuditor: PerformanceAuditor;
  private options: AuditEngineOptions;

  constructor(options: AuditEngineOptions = {}) {
    this.options = {
      plugins: ['syntropylog'],
      types: ['security', 'compliance', 'performance'],
      strict: false,
      ...options
    };
    
    this.validator = new Validator({
      plugins: this.options.plugins,
      strict: this.options.strict
    });
    
    this.calculator = new AuditCalculator();
    this.securityAuditor = new SecurityAuditor();
    this.complianceAuditor = new ComplianceAuditor();
    this.performanceAuditor = new PerformanceAuditor();
  }

  /**
   * Run a comprehensive audit
   */
  async audit(context: ValidationContext, options?: { type?: string; [key: string]: any }): Promise<AuditResult> {
    const startTime = Date.now();
    
    // Validate input parameters
    if (context === null || context === undefined) {
      throw new Error('Audit context is required and cannot be null or undefined');
    }
    
    if (!context || typeof context !== 'object') {
      throw new Error('Audit context must be a valid object');
    }
    
    try {
      let auditResults: ValidationResult[];
      
      if (options?.type) {
        // Run specific audit type
        const result = await this.runAuditType(options.type, context);
        auditResults = [result];
      } else {
        // Run all configured audit types
        auditResults = await this.runAllAudits(context);
      }
      
      const summary = this.calculator.calculateSummary(auditResults);
      const result = this.buildAuditResult(auditResults, summary, startTime);
      
      // Add properties expected by tests
      return this.addTestProperties(result, auditResults, options?.type);

    } catch (error) {
      return this.buildErrorResult(error, startTime);
    }
  }

  /**
   * Run all configured audit types
   */
  private async runAllAudits(context: ValidationContext): Promise<ValidationResult[]> {
    const auditResults: ValidationResult[] = [];
    
    for (const auditType of this.options.types || []) {
      const result = await this.runAuditType(auditType, context);
      auditResults.push(result);
    }

    return auditResults;
  }

  /**
   * Run a specific type of audit
   */
  private async runAuditType(auditType: string, context: ValidationContext): Promise<ValidationResult> {
    switch (auditType) {
      case 'security':
        return this.securityAuditor.audit(context);
      case 'compliance':
        return this.complianceAuditor.audit(context);
      case 'performance':
        return this.performanceAuditor.audit(context);
      default:
        return this.createUnknownAuditResult(auditType);
    }
  }

  /**
   * Build successful audit result
   */
  private buildAuditResult(
    results: ValidationResult[], 
    summary: AuditSummary, 
    startTime: number
  ): AuditResult {
    return {
      success: summary.failedChecks === 0,
      score: summary.score,
      grade: summary.grade,
      timestamp: new Date(),
      duration: Date.now() - startTime,
      totalChecks: summary.totalChecks,
      passedChecks: summary.passedChecks,
      failedChecks: summary.failedChecks,
      warnings: summary.warnings,
      results,
      summary
    };
  }

  /**
   * Build error result
   */
  private buildErrorResult(error: unknown, startTime: number): AuditResult {
    return {
      success: false,
      score: 0,
      grade: 'F',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 1,
      warnings: 0,
      results: [{
        success: false,
        errors: [{
          code: 'AUDIT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown audit error',
          severity: 'error',
          context: { error }
        }],
        warnings: [],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      }],
      summary: {
        score: 0,
        grade: 'F',
        criticalIssues: 1,
        securityIssues: 0,
        complianceIssues: 0,
        recommendations: ['Fix audit system errors'],
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 1,
        warnings: 0
      }
    };
  }

  /**
   * Create result for unknown audit type
   */
  private createUnknownAuditResult(auditType: string): ValidationResult {
    return {
      success: true,
      errors: [],
      warnings: [{
        code: 'UNKNOWN_AUDIT_TYPE',
        message: `Unknown audit type: ${auditType}`,
        severity: 'warning'
      }],
      metadata: { auditType }
    };
  }

  /**
   * Add properties expected by tests
   */
  private addTestProperties(result: AuditResult, auditResults: ValidationResult[], auditType?: string): AuditResult {
    // Add specific issue arrays based on audit type
    if (auditType === 'security') {
      result.vulnerabilities = auditResults.flatMap(r => r.errors).filter(e => e.severity === 'error');
    } else if (auditType === 'compliance') {
      result.complianceIssues = auditResults.flatMap(r => r.errors);
    } else if (auditType === 'performance') {
      result.performanceIssues = auditResults.flatMap(r => r.errors);
    }

    return result;
  }
} 