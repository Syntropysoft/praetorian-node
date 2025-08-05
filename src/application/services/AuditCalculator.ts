import { ValidationResult, AuditSummary } from '../../shared/types';

export class AuditCalculator {
  /**
   * Calculate audit summary from validation results
   */
  calculateSummary(results: ValidationResult[]): AuditSummary {
    const metrics = this.calculateMetrics(results);
    const score = this.calculateScore(metrics);
    const grade = this.calculateGrade(score);
    const recommendations = this.generateRecommendations(results);

    return {
      score,
      grade,
      criticalIssues: metrics.criticalIssues,
      securityIssues: metrics.securityIssues,
      complianceIssues: metrics.complianceIssues,
      recommendations,
      totalChecks: metrics.totalChecks,
      passedChecks: metrics.passedChecks,
      failedChecks: metrics.failedChecks,
      warnings: metrics.warnings
    };
  }

  /**
   * Calculate metrics from validation results
   */
  private calculateMetrics(results: ValidationResult[]) {
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let warnings = 0;
    let criticalIssues = 0;
    let securityIssues = 0;
    let complianceIssues = 0;

    results.forEach(result => {
      totalChecks += result.metadata?.rulesChecked || 0;
      passedChecks += result.metadata?.rulesPassed || 0;
      failedChecks += result.metadata?.rulesFailed || 0;
      warnings += result.warnings.length;

      result.errors.forEach(error => {
        if (error.severity === 'error') {
          criticalIssues++;
        }
        if (error.code.includes('SECURITY')) {
          securityIssues++;
        }
        if (error.code.includes('COMPLIANCE')) {
          complianceIssues++;
        }
      });
    });

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      warnings,
      criticalIssues,
      securityIssues,
      complianceIssues
    };
  }

  /**
   * Calculate score based on passed vs total checks
   */
  private calculateScore(metrics: ReturnType<typeof this.calculateMetrics>): number {
    return metrics.totalChecks > 0 
      ? Math.round((metrics.passedChecks / metrics.totalChecks) * 100) 
      : 100;
  }

  /**
   * Calculate grade based on score
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];

    results.forEach(result => {
      if (result.errors.length > 0) {
        const auditType = result.metadata?.auditType || 'unknown';
        recommendations.push(`Fix ${result.errors.length} issues in ${auditType} audit`);
      }
    });

    return recommendations;
  }
} 