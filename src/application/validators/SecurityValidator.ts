/**
 * Security Validator - Functional Programming
 * 
 * Single Responsibility: Orchestrate security validation by delegating to pure functions
 * No state, no side effects, pure functions only
 */

import { 
  SecurityRule, 
  SecurityContext, 
  SecurityValidationResult, 
  SecurityRuleResult,
  SecurityOptions,
  ComplianceStandard
} from '../../shared/types/security';
import { ValidationError, ValidationWarning } from '../../shared/types';
import { detectSecrets } from './SecretDetector';
import { validatePermissions } from './PermissionValidator';
import { scanVulnerabilities } from './VulnerabilityScanner';
import { checkCompliance } from './ComplianceChecker';

/**
 * Pure function to validate security
 */
export const validateSecurity = (
  content: string,
  rules: SecurityRule[],
  context: SecurityContext
): SecurityValidationResult => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return createEmptySecurityResult();
  }

  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return createEmptySecurityResult();
  }

  const results = rules
    .filter(rule => rule.enabled)
    .map(rule => validateSingleSecurityRule(content, rule, context));

  const errors = results.flatMap(r => r.error ? [r.error] : []);
  const warnings = results.flatMap(r => r.warning ? [r.warning] : []);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    results,
    summary: createSecuritySummary(results),
    compliance: checkComplianceStatus(results)
  };
};

/**
 * Pure function to validate a single security rule
 */
const validateSingleSecurityRule = (
  content: string,
  rule: SecurityRule,
  context: SecurityContext
): SecurityRuleResult => {
  // Guard clause: invalid rule
  if (!rule || !rule.id) {
    return createFailedRuleResult(rule, 'Invalid security rule');
  }

  switch (rule.type) {
    case 'secret':
      return validateSecretRule(content, rule, context);
    case 'permission':
      return validatePermissionRule(content, rule, context);
    case 'vulnerability':
      return validateVulnerabilityRule(content, rule, context);
    case 'compliance':
      return validateComplianceRule(content, rule, context);
    default:
      return createFailedRuleResult(rule, `Unknown rule type: ${(rule as any).type}`);
  }
};

/**
 * Pure function to validate secret rule
 */
const validateSecretRule = (
  content: string,
  rule: SecurityRule,
  context: SecurityContext
): SecurityRuleResult => {
  // Guard clause: not a secret rule
  if (rule.type !== 'secret') {
    return createFailedRuleResult(rule, 'Not a secret rule');
  }

  const secretRule = rule as any; // Type assertion for secret rule
  const secrets = detectSecrets(content, [secretRule], context);

  if (secrets.length === 0) {
    return createPassedRuleResult(rule);
  }

  return createFailedRuleResult(rule, `Found ${secrets.length} potential secrets`, secrets[0]?.maskedValue);
};

/**
 * Pure function to validate permission rule
 */
const validatePermissionRule = (
  content: string,
  rule: SecurityRule,
  context: SecurityContext
): SecurityRuleResult => {
  // Guard clause: not a permission rule
  if (rule.type !== 'permission') {
    return createFailedRuleResult(rule, 'Not a permission rule');
  }

  const permissionRule = rule as any; // Type assertion for permission rule
  const permissions = validatePermissions(context.filePath, context.permissions, [permissionRule], context);

  if (permissions.length === 0 || permissions.every(p => p.valid)) {
    return createPassedRuleResult(rule);
  }

  const failedPermission = permissions.find(p => !p.valid);
  return createFailedRuleResult(rule, 'Invalid file permissions', failedPermission?.currentPermissions?.toString());
};

/**
 * Pure function to validate vulnerability rule
 */
const validateVulnerabilityRule = (
  content: string,
  rule: SecurityRule,
  context: SecurityContext
): SecurityRuleResult => {
  // Guard clause: not a vulnerability rule
  if (rule.type !== 'vulnerability') {
    return createFailedRuleResult(rule, 'Not a vulnerability rule');
  }

  const vulnerabilityRule = rule as any; // Type assertion for vulnerability rule
  const vulnerabilities = scanVulnerabilities(content, [vulnerabilityRule], context);

  if (vulnerabilities.length === 0) {
    return createPassedRuleResult(rule);
  }

  return createFailedRuleResult(rule, `Found ${vulnerabilities.length} vulnerabilities`, vulnerabilities[0]?.type);
};

/**
 * Pure function to validate compliance rule
 */
const validateComplianceRule = (
  content: string,
  rule: SecurityRule,
  context: SecurityContext
): SecurityRuleResult => {
  // Guard clause: not a compliance rule
  if (rule.type !== 'compliance') {
    return createFailedRuleResult(rule, 'Not a compliance rule');
  }

  const complianceRule = rule as any; // Type assertion for compliance rule
  const compliance = checkCompliance(content, [complianceRule], context);

  if (compliance.passed) {
    return createPassedRuleResult(rule);
  }

  return createFailedRuleResult(rule, `Compliance failed: ${compliance.failedRequirements.join(', ')}`);
};

/**
 * Pure function to create empty security result
 */
const createEmptySecurityResult = (): SecurityValidationResult => ({
  valid: true,
  errors: [],
  warnings: [],
  results: [],
  summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0, passed: 0, failed: 0 }
});

/**
 * Pure function to create passed rule result
 */
const createPassedRuleResult = (rule: SecurityRule): SecurityRuleResult => ({
  rule,
  passed: true
});

/**
 * Pure function to create failed rule result
 */
const createFailedRuleResult = (
  rule: SecurityRule, 
  message: string, 
  matchedValue?: string
): SecurityRuleResult => ({
  rule,
  passed: false,
  error: {
    code: `SECURITY_${rule.id.toUpperCase()}`,
    message,
    severity: mapSecuritySeverityToValidationSeverity(rule.severity),
    path: '',
    context: { matchedValue }
  }
});

/**
 * Pure function to create security summary
 */
const createSecuritySummary = (results: SecurityRuleResult[]) => {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  const critical = results.filter(r => !r.passed && r.rule.severity === 'critical').length;
  const high = results.filter(r => !r.passed && r.rule.severity === 'high').length;
  const medium = results.filter(r => !r.passed && r.rule.severity === 'medium').length;
  const low = results.filter(r => !r.passed && r.rule.severity === 'low').length;

  return { total, critical, high, medium, low, passed, failed };
};

/**
 * Pure function to check compliance status
 */
const checkComplianceStatus = (results: SecurityRuleResult[]) => {
  const complianceResults = results.filter(r => r.rule.type === 'compliance');
  
  if (complianceResults.length === 0) {
    return undefined;
  }

  const failedCompliance = complianceResults.filter(r => !r.passed);
  const standard = complianceResults[0]?.rule.type === 'compliance' 
    ? (complianceResults[0].rule as any).standard 
    : 'ISO27001' as ComplianceStandard;

  return {
    standard,
    passed: failedCompliance.length === 0,
    failedRequirements: failedCompliance.map(r => r.rule.id)
  };
};

/**
 * Pure function to get security severity level
 */
export const getSecuritySeverityLevel = (severity: string): 'critical' | 'high' | 'medium' | 'low' => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'low': return 'low';
    default: return 'medium';
  }
};

/**
 * Pure function to check if security rule is critical
 */
export const isCriticalSecurityRule = (rule: SecurityRule): boolean => {
  return rule.severity === 'critical';
};

/**
 * Pure function to check if security rule is enabled
 */
export const isSecurityRuleEnabled = (rule: SecurityRule): boolean => {
  return rule.enabled === true;
};

/**
 * Pure function to filter security rules by type
 */
export const filterSecurityRulesByType = (rules: SecurityRule[], type: string): SecurityRule[] => {
  return rules.filter(rule => rule.type === type);
};

/**
 * Pure function to filter security rules by severity
 */
export const filterSecurityRulesBySeverity = (rules: SecurityRule[], severity: string): SecurityRule[] => {
  return rules.filter(rule => rule.severity === severity);
};

/**
 * Pure function to map security severity to validation severity
 */
const mapSecuritySeverityToValidationSeverity = (securitySeverity: string): 'error' | 'warning' | 'info' => {
  switch (securitySeverity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'error';
  }
};
