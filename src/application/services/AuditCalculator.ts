/**
 * Audit Calculator - Functional Programming
 * 
 * Single Responsibility: Calculate audit metrics and scores from validation results
 * Pure functions, no state, no side effects
 */

import { ValidationResult, AuditSummary } from '../../shared/types';

/**
 * Audit metrics interface
 */
export interface AuditMetrics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  criticalIssues: number;
  securityIssues: number;
  complianceIssues: number;
}

/**
 * Pure function to calculate audit summary from validation results
 */
export const calculateAuditSummary = (results: ValidationResult[]): AuditSummary => {
  // Guard clause: no results
  if (!results || results.length === 0) {
    return createEmptyAuditSummary();
  }

  const metrics = calculateMetrics(results);
  const score = calculateScore(metrics);
  const grade = calculateGrade(score);
  const recommendations = generateRecommendations(results);

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
};

/**
 * Pure function to calculate metrics from validation results
 */
export const calculateMetrics = (results: ValidationResult[]): AuditMetrics => {
  // Guard clause: no results
  if (!results || results.length === 0) {
    return createEmptyMetrics();
  }

  return results.reduce(aggregateResultMetrics, createEmptyMetrics());
};

/**
 * Pure function to aggregate metrics from a single result
 */
const aggregateResultMetrics = (acc: AuditMetrics, result: ValidationResult): AuditMetrics => {
  // Guard clause: invalid result
  if (!result) {
    return acc;
  }

  const resultMetrics = extractResultMetrics(result);
  const errorMetrics = calculateErrorMetrics(result.errors);

  return mergeMetrics(acc, resultMetrics, errorMetrics);
};

/**
 * Pure function to extract metrics from a single result
 */
const extractResultMetrics = (result: ValidationResult) => {
  // Guard clause: no metadata
  if (!result.metadata) {
    return {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warnings: 0
    };
  }

  return {
    totalChecks: result.metadata.rulesChecked || 0,
    passedChecks: result.metadata.rulesPassed || 0,
    failedChecks: result.metadata.rulesFailed || 0,
    warnings: result.warnings?.length || 0
  };
};

/**
 * Pure function to calculate error metrics from errors array
 */
const calculateErrorMetrics = (errors: any[]) => {
  // Guard clause: no errors
  if (!errors || errors.length === 0) {
    return { criticalIssues: 0, securityIssues: 0, complianceIssues: 0 };
  }

  return errors.reduce(aggregateErrorMetrics, { criticalIssues: 0, securityIssues: 0, complianceIssues: 0 });
};

/**
 * Pure function to aggregate metrics from a single error
 */
const aggregateErrorMetrics = (acc: any, error: any) => {
  // Guard clause: invalid error
  if (!error || !error.severity || !error.code) {
    return acc;
  }

  const criticalIssues = error.severity === 'error' ? 1 : 0;
  const securityIssues = error.code.includes('SECURITY') ? 1 : 0;
  const complianceIssues = error.code.includes('COMPLIANCE') ? 1 : 0;

  return {
    criticalIssues: acc.criticalIssues + criticalIssues,
    securityIssues: acc.securityIssues + securityIssues,
    complianceIssues: acc.complianceIssues + complianceIssues
  };
};

/**
 * Pure function to merge metrics objects
 */
const mergeMetrics = (acc: AuditMetrics, resultMetrics: any, errorMetrics: any): AuditMetrics => ({
  totalChecks: acc.totalChecks + resultMetrics.totalChecks,
  passedChecks: acc.passedChecks + resultMetrics.passedChecks,
  failedChecks: acc.failedChecks + resultMetrics.failedChecks,
  warnings: acc.warnings + resultMetrics.warnings,
  criticalIssues: acc.criticalIssues + errorMetrics.criticalIssues,
  securityIssues: acc.securityIssues + errorMetrics.securityIssues,
  complianceIssues: acc.complianceIssues + errorMetrics.complianceIssues
});

/**
 * Pure function to calculate score based on passed vs total checks
 */
export const calculateScore = (metrics: AuditMetrics): number => {
  // Guard clause: no metrics
  if (!metrics) {
    return 0;
  }

  // Guard clause: no checks performed
  if (metrics.totalChecks === 0) {
    return 100;
  }

  // Guard clause: invalid metrics
  if (metrics.passedChecks < 0 || metrics.totalChecks < 0) {
    return 0;
  }

  // Guard clause: passed checks exceed total checks
  if (metrics.passedChecks > metrics.totalChecks) {
    return 100;
  }

  const percentage = (metrics.passedChecks / metrics.totalChecks) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage)));
};

/**
 * Pure function to calculate grade based on score
 */
export const calculateGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  // Guard clause: invalid score
  if (typeof score !== 'number' || isNaN(score)) {
    return 'F';
  }

  // Guard clause: score out of bounds
  if (score < 0 || score > 100) {
    return 'F';
  }

  return getGradeFromScore(score);
};

/**
 * Pure function to get grade from score (internal helper)
 */
const getGradeFromScore = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Pure function to generate recommendations based on validation results
 */
export const generateRecommendations = (results: ValidationResult[]): string[] => {
  // Guard clause: no results
  if (!results || results.length === 0) {
    return [];
  }

  return results
    .filter(hasErrors)
    .map(generateResultRecommendation)
    .filter(isValidRecommendation);
};

/**
 * Pure function to check if result has errors
 */
const hasErrors = (result: ValidationResult): boolean => {
  // Guard clause: invalid result
  if (!result) {
    return false;
  }

  return result.errors && result.errors.length > 0;
};

/**
 * Pure function to generate recommendation for a single result
 */
const generateResultRecommendation = (result: ValidationResult): string => {
  // Guard clause: invalid result
  if (!result) {
    return '';
  }

  const auditType = result.metadata?.auditType || 'unknown';
  const errorCount = result.errors?.length || 0;
  
  return `Fix ${errorCount} issues in ${auditType} audit`;
};

/**
 * Pure function to validate recommendation string
 */
const isValidRecommendation = (recommendation: string): boolean => {
  // Guard clause: empty or invalid recommendation
  if (!recommendation || typeof recommendation !== 'string') {
    return false;
  }

  return recommendation.trim().length > 0;
};

/**
 * Pure function to create empty audit summary
 */
export const createEmptyAuditSummary = (): AuditSummary => ({
  score: 100,
  grade: 'A',
  criticalIssues: 0,
  securityIssues: 0,
  complianceIssues: 0,
  recommendations: [],
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  warnings: 0
});

/**
 * Pure function to create empty metrics
 */
export const createEmptyMetrics = (): AuditMetrics => ({
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  warnings: 0,
  criticalIssues: 0,
  securityIssues: 0,
  complianceIssues: 0
});

/**
 * Pure function to get score description
 */
export const getScoreDescription = (score: number): string => {
  // Guard clause: invalid score
  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
    return 'Invalid';
  }

  return getDescriptionFromScore(score);
};

/**
 * Pure function to get description from score (internal helper)
 */
const getDescriptionFromScore = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Poor';
  return 'Failing';
};

/**
 * Pure function to check if score is passing
 */
export const isScorePassing = (score: number, threshold: number = 70): boolean => {
  // Guard clause: invalid score
  if (typeof score !== 'number' || isNaN(score)) {
    return false;
  }

  // Guard clause: invalid threshold
  if (typeof threshold !== 'number' || isNaN(threshold) || threshold < 0 || threshold > 100) {
    return false;
  }

  return score >= threshold;
};

/**
 * Pure function to get grade color
 */
export const getGradeColor = (grade: 'A' | 'B' | 'C' | 'D' | 'F'): string => {
  // Guard clause: invalid grade
  if (!grade || typeof grade !== 'string') {
    return 'gray';
  }

  return getColorFromGrade(grade);
};

/**
 * Pure function to get color from grade (internal helper)
 */
const getColorFromGrade = (grade: string): string => {
  switch (grade) {
    case 'A': return 'green';
    case 'B': return 'blue';
    case 'C': return 'yellow';
    case 'D': return 'orange';
    case 'F': return 'red';
    default: return 'gray';
  }
};

/**
 * Pure function to get audit health status
 */
export const getAuditHealthStatus = (metrics: AuditMetrics): 'healthy' | 'warning' | 'critical' => {
  // Guard clause: no metrics
  if (!metrics) {
    return 'critical';
  }

  // Guard clause: critical issues present
  if (metrics.criticalIssues > 0) {
    return 'critical';
  }

  // Guard clause: high number of security or compliance issues
  if (metrics.securityIssues > 5 || metrics.complianceIssues > 3) {
    return 'warning';
  }

  return 'healthy';
};

/**
 * Pure function to get audit priority
 */
export const getAuditPriority = (metrics: AuditMetrics): 'low' | 'medium' | 'high' => {
  // Guard clause: no metrics
  if (!metrics) {
    return 'high';
  }

  const totalIssues = metrics.criticalIssues + metrics.securityIssues + metrics.complianceIssues;
  
  if (totalIssues > 10) return 'high';
  if (totalIssues > 5) return 'medium';
  return 'low';
};

/**
 * Pure function to calculate audit efficiency
 */
export const calculateAuditEfficiency = (metrics: AuditMetrics): number => {
  // Guard clause: no metrics
  if (!metrics) {
    return 0;
  }

  // Guard clause: no checks performed
  if (metrics.totalChecks === 0) {
    return 100;
  }

  const efficiency = (metrics.passedChecks / metrics.totalChecks) * 100;
  return Math.round(Math.max(0, Math.min(100, efficiency)));
}; 