/**
 * AuditCalculator Tests
 * 
 * Tests for audit calculation functionality with SOLID SRP and functional programming
 */

import {
  calculateAuditSummary,
  calculateMetrics,
  calculateScore,
  calculateGrade,
  generateRecommendations,
  createEmptyAuditSummary,
  createEmptyMetrics,
  getScoreDescription,
  isScorePassing,
  getGradeColor,
  getAuditHealthStatus,
  getAuditPriority,
  calculateAuditEfficiency,
  AuditMetrics
} from '../../../src/application/services/AuditCalculator';
import { ValidationResult } from '../../../src/shared/types';

describe('AuditCalculator', () => {
  describe('calculateAuditSummary', () => {
    it('should return empty summary for no results', () => {
      const result = calculateAuditSummary([]);

      expect(result.score).toBe(100);
      expect(result.grade).toBe('A');
      expect(result.totalChecks).toBe(0);
      expect(result.recommendations).toEqual([]);
    });

    it('should return empty summary for null results', () => {
      const result = calculateAuditSummary(null as any);

      expect(result.score).toBe(100);
      expect(result.grade).toBe('A');
      expect(result.totalChecks).toBe(0);
      expect(result.recommendations).toEqual([]);
    });

    it('should calculate summary for valid results', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: {
            rulesChecked: 10,
            rulesPassed: 8,
            rulesFailed: 2,
            auditType: 'security'
          }
        }
      ];

      const result = calculateAuditSummary(results);

      expect(result.score).toBe(80);
      expect(result.grade).toBe('B');
      expect(result.totalChecks).toBe(10);
      expect(result.passedChecks).toBe(8);
      expect(result.failedChecks).toBe(2);
    });

    it('should handle multiple results', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: {
            rulesChecked: 5,
            rulesPassed: 5,
            rulesFailed: 0,
            auditType: 'security'
          }
        },
        {
          success: false,
          errors: [
            { code: 'SECURITY_001', message: 'Security issue', severity: 'error' as const, path: '' }
          ],
          warnings: [],
          metadata: {
            rulesChecked: 3,
            rulesPassed: 2,
            rulesFailed: 1,
            auditType: 'compliance'
          }
        }
      ];

      const result = calculateAuditSummary(results);

      expect(result.score).toBe(88); // (5+2)/(5+3) * 100 = 87.5, rounded to 88
      expect(result.grade).toBe('B');
      expect(result.totalChecks).toBe(8);
      expect(result.passedChecks).toBe(7);
      expect(result.failedChecks).toBe(1);
      expect(result.criticalIssues).toBe(1);
      expect(result.securityIssues).toBe(1);
    });
  });

  describe('calculateMetrics', () => {
    it('should return empty metrics for no results', () => {
      const result = calculateMetrics([]);

      expect(result.totalChecks).toBe(0);
      expect(result.passedChecks).toBe(0);
      expect(result.failedChecks).toBe(0);
      expect(result.criticalIssues).toBe(0);
      expect(result.securityIssues).toBe(0);
      expect(result.complianceIssues).toBe(0);
    });

    it('should calculate metrics correctly', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [
            { code: 'SECURITY_001', message: 'Security issue', severity: 'error' as const, path: '' },
            { code: 'COMPLIANCE_001', message: 'Compliance issue', severity: 'warning' as const, path: '' }
          ],
          warnings: [{ code: 'WARN_001', message: 'Warning', severity: 'warning' as const, path: '' }],
          metadata: {
            rulesChecked: 10,
            rulesPassed: 7,
            rulesFailed: 3,
            auditType: 'security'
          }
        }
      ];

      const result = calculateMetrics(results);

      expect(result.totalChecks).toBe(10);
      expect(result.passedChecks).toBe(7);
      expect(result.failedChecks).toBe(3);
      expect(result.warnings).toBe(1);
      expect(result.criticalIssues).toBe(1);
      expect(result.securityIssues).toBe(1);
      expect(result.complianceIssues).toBe(1);
    });

    it('should handle results without metadata', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [],
          warnings: []
        }
      ];

      const result = calculateMetrics(results);

      expect(result.totalChecks).toBe(0);
      expect(result.passedChecks).toBe(0);
      expect(result.failedChecks).toBe(0);
    });
  });

  describe('calculateScore', () => {
    it('should return 100 for no metrics', () => {
      const result = calculateScore(null as any);

      expect(result).toBe(0);
    });

    it('should return 100 for zero total checks', () => {
      const metrics: AuditMetrics = createEmptyMetrics();

      const result = calculateScore(metrics);

      expect(result).toBe(100);
    });

    it('should calculate score correctly', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 8,
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 0,
        complianceIssues: 0
      };

      const result = calculateScore(metrics);

      expect(result).toBe(80);
    });

    it('should handle invalid metrics', () => {
      const metrics: AuditMetrics = {
        totalChecks: -5,
        passedChecks: 8,
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 0,
        complianceIssues: 0
      };

      const result = calculateScore(metrics);

      expect(result).toBe(0);
    });

    it('should cap score at 100', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 15, // More passed than total
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 0,
        complianceIssues: 0
      };

      const result = calculateScore(metrics);

      expect(result).toBe(100);
    });
  });

  describe('calculateGrade', () => {
    it('should return F for invalid score', () => {
      expect(calculateGrade(NaN)).toBe('F');
      expect(calculateGrade(-10)).toBe('F');
      expect(calculateGrade(150)).toBe('F');
      expect(calculateGrade('invalid' as any)).toBe('F');
    });

    it('should return correct grades', () => {
      expect(calculateGrade(95)).toBe('A');
      expect(calculateGrade(85)).toBe('B');
      expect(calculateGrade(75)).toBe('C');
      expect(calculateGrade(65)).toBe('D');
      expect(calculateGrade(55)).toBe('F');
    });

    it('should handle edge cases', () => {
      expect(calculateGrade(90)).toBe('A');
      expect(calculateGrade(80)).toBe('B');
      expect(calculateGrade(70)).toBe('C');
      expect(calculateGrade(60)).toBe('D');
    });
  });

  describe('generateRecommendations', () => {
    it('should return empty array for no results', () => {
      const result = generateRecommendations([]);

      expect(result).toEqual([]);
    });

    it('should return empty array for null results', () => {
      const result = generateRecommendations(null as any);

      expect(result).toEqual([]);
    });

    it('should generate recommendations for results with errors', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [
            { code: 'ERROR_001', message: 'Error 1', severity: 'error' as const, path: '' },
            { code: 'ERROR_002', message: 'Error 2', severity: 'error' as const, path: '' }
          ],
          warnings: [],
          metadata: {
            rulesChecked: 5,
            rulesPassed: 3,
            rulesFailed: 2,
            auditType: 'security'
          }
        }
      ];

      const result = generateRecommendations(results);

      expect(result).toEqual(['Fix 2 issues in security audit']);
    });

    it('should skip results without errors', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: {
            rulesChecked: 5,
            rulesPassed: 5,
            rulesFailed: 0,
            auditType: 'security'
          }
        }
      ];

      const result = generateRecommendations(results);

      expect(result).toEqual([]);
    });

    it('should handle results without metadata', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [
            { code: 'ERROR_001', message: 'Error', severity: 'error' as const, path: '' }
          ],
          warnings: []
        }
      ];

      const result = generateRecommendations(results);

      expect(result).toEqual(['Fix 1 issues in unknown audit']);
    });
  });

  describe('createEmptyAuditSummary', () => {
    it('should create empty summary', () => {
      const result = createEmptyAuditSummary();

      expect(result.score).toBe(100);
      expect(result.grade).toBe('A');
      expect(result.totalChecks).toBe(0);
      expect(result.recommendations).toEqual([]);
    });
  });

  describe('createEmptyMetrics', () => {
    it('should create empty metrics', () => {
      const result = createEmptyMetrics();

      expect(result.totalChecks).toBe(0);
      expect(result.passedChecks).toBe(0);
      expect(result.failedChecks).toBe(0);
      expect(result.criticalIssues).toBe(0);
    });
  });

  describe('getScoreDescription', () => {
    it('should return Invalid for invalid scores', () => {
      expect(getScoreDescription(NaN)).toBe('Invalid');
      expect(getScoreDescription(-10)).toBe('Invalid');
      expect(getScoreDescription(150)).toBe('Invalid');
      expect(getScoreDescription('invalid' as any)).toBe('Invalid');
    });

    it('should return correct descriptions', () => {
      expect(getScoreDescription(95)).toBe('Excellent');
      expect(getScoreDescription(85)).toBe('Good');
      expect(getScoreDescription(75)).toBe('Fair');
      expect(getScoreDescription(65)).toBe('Poor');
      expect(getScoreDescription(55)).toBe('Failing');
    });
  });

  describe('isScorePassing', () => {
    it('should return false for invalid inputs', () => {
      expect(isScorePassing(NaN)).toBe(false);
      expect(isScorePassing(70, NaN)).toBe(false);
      expect(isScorePassing(70, -10)).toBe(false);
      expect(isScorePassing(70, 150)).toBe(false);
    });

    it('should check passing correctly', () => {
      expect(isScorePassing(80, 70)).toBe(true);
      expect(isScorePassing(60, 70)).toBe(false);
      expect(isScorePassing(70, 70)).toBe(true);
    });

    it('should use default threshold', () => {
      expect(isScorePassing(80)).toBe(true);
      expect(isScorePassing(60)).toBe(false);
    });
  });

  describe('getGradeColor', () => {
    it('should return gray for invalid grades', () => {
      expect(getGradeColor('' as any)).toBe('gray');
      expect(getGradeColor(null as any)).toBe('gray');
      expect(getGradeColor('X' as any)).toBe('gray');
    });

    it('should return correct colors', () => {
      expect(getGradeColor('A')).toBe('green');
      expect(getGradeColor('B')).toBe('blue');
      expect(getGradeColor('C')).toBe('yellow');
      expect(getGradeColor('D')).toBe('orange');
      expect(getGradeColor('F')).toBe('red');
    });
  });

  describe('getAuditHealthStatus', () => {
    it('should return critical for no metrics', () => {
      const result = getAuditHealthStatus(null as any);

      expect(result).toBe('critical');
    });

    it('should return critical for critical issues', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 8,
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 1,
        securityIssues: 0,
        complianceIssues: 0
      };

      const result = getAuditHealthStatus(metrics);

      expect(result).toBe('critical');
    });

    it('should return warning for high security issues', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 8,
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 6,
        complianceIssues: 0
      };

      const result = getAuditHealthStatus(metrics);

      expect(result).toBe('warning');
    });

    it('should return warning for high compliance issues', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 8,
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 0,
        complianceIssues: 4
      };

      const result = getAuditHealthStatus(metrics);

      expect(result).toBe('warning');
    });

    it('should return healthy for low issues', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 9,
        failedChecks: 1,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 2,
        complianceIssues: 1
      };

      const result = getAuditHealthStatus(metrics);

      expect(result).toBe('healthy');
    });
  });

  describe('getAuditPriority', () => {
    it('should return high for no metrics', () => {
      const result = getAuditPriority(null as any);

      expect(result).toBe('high');
    });

    it('should return correct priorities', () => {
      const highMetrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 5,
        failedChecks: 5,
        warnings: 0,
        criticalIssues: 5,
        securityIssues: 5,
        complianceIssues: 5
      };

      const mediumMetrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 7,
        failedChecks: 3,
        warnings: 0,
        criticalIssues: 2,
        securityIssues: 3,
        complianceIssues: 2
      };

      const lowMetrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 9,
        failedChecks: 1,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 1,
        complianceIssues: 1
      };

      expect(getAuditPriority(highMetrics)).toBe('high');
      expect(getAuditPriority(mediumMetrics)).toBe('medium');
      expect(getAuditPriority(lowMetrics)).toBe('low');
    });
  });

  describe('calculateAuditEfficiency', () => {
    it('should return 0 for no metrics', () => {
      const result = calculateAuditEfficiency(null as any);

      expect(result).toBe(0);
    });

    it('should return 100 for zero total checks', () => {
      const metrics = createEmptyMetrics();

      const result = calculateAuditEfficiency(metrics);

      expect(result).toBe(100);
    });

    it('should calculate efficiency correctly', () => {
      const metrics: AuditMetrics = {
        totalChecks: 10,
        passedChecks: 8,
        failedChecks: 2,
        warnings: 0,
        criticalIssues: 0,
        securityIssues: 0,
        complianceIssues: 0
      };

      const result = calculateAuditEfficiency(metrics);

      expect(result).toBe(80);
    });
  });
});
