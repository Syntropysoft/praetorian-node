/**
 * Compliance Checker - Functional Programming
 * 
 * Single Responsibility: Check compliance with security standards only
 * Pure functions, no state, no side effects
 */

import { 
  ComplianceRule, 
  ComplianceStandard, 
  SecurityContext 
} from '../../shared/types/security';
import { ValidationError } from '../../shared/types';

/**
 * Pure function to check compliance
 */
export const checkCompliance = (
  content: string,
  rules: ComplianceRule[],
  context: SecurityContext
): { standard: ComplianceStandard; passed: boolean; failedRequirements: string[] } => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return { standard: 'ISO27001', passed: false, failedRequirements: ['No content to validate'] };
  }

  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return { standard: 'ISO27001', passed: true, failedRequirements: [] };
  }

  const results = rules
    .filter(rule => rule.enabled)
    .map(rule => checkSingleComplianceRule(content, rule, context));

  const failedRequirements = results
    .filter(result => !result.passed)
    .map(result => result.requirement);

  const standard = rules[0]?.standard || 'ISO27001';
  const passed = failedRequirements.length === 0;

  return { standard, passed, failedRequirements };
};

/**
 * Pure function to check a single compliance rule
 */
const checkSingleComplianceRule = (
  content: string,
  rule: ComplianceRule,
  context: SecurityContext
): { requirement: string; passed: boolean } => {
  // Guard clause: invalid rule
  if (!rule || !rule.pattern) {
    return { requirement: rule?.requirement || 'Unknown', passed: false };
  }

  const matches = findComplianceMatches(content, rule.pattern);
  const passed = matches.length > 0;

  return { requirement: rule.requirement, passed };
};

/**
 * Pure function to find compliance matches
 */
const findComplianceMatches = (content: string, pattern: RegExp): Array<{ value: string; index: number }> => {
  const matches: Array<{ value: string; index: number }> = [];
  let match;
  
  // Reset regex lastIndex to ensure global search works
  pattern.lastIndex = 0;
  
  while ((match = pattern.exec(content)) !== null) {
    matches.push({
      value: match[0],
      index: match.index
    });
    
    // Prevent infinite loop on zero-length matches
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
  }
  
  return matches;
};

/**
 * Pure function to check PCI DSS compliance
 */
export const checkPCIDSSCompliance = (content: string): { standard: ComplianceStandard; passed: boolean; failedRequirements: string[] } => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return { standard: 'PCI-DSS', passed: false, failedRequirements: ['No content to validate'] };
  }

  const pciRequirements = [
    {
      requirement: 'PCI-DSS-3.4',
      description: 'Credit card data must be encrypted',
      pattern: /credit.?card|card.?number|cc.?number/gi,
      passed: false
    },
    {
      requirement: 'PCI-DSS-3.5',
      description: 'Encryption keys must be protected',
      pattern: /encryption.?key|secret.?key|private.?key/gi,
      passed: false
    },
    {
      requirement: 'PCI-DSS-8.2',
      description: 'Strong authentication required',
      pattern: /password|authentication|auth/gi,
      passed: false
    }
  ];

  const results = pciRequirements.map(req => ({
    ...req,
    passed: req.pattern.test(content)
  }));

  const failedRequirements = results
    .filter(result => !result.passed)
    .map(result => result.requirement);

  return {
    standard: 'PCI-DSS',
    passed: failedRequirements.length === 0,
    failedRequirements
  };
};

/**
 * Pure function to check GDPR compliance
 */
export const checkGDPRCompliance = (content: string): { standard: ComplianceStandard; passed: boolean; failedRequirements: string[] } => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return { standard: 'GDPR', passed: false, failedRequirements: ['No content to validate'] };
  }

  const gdprRequirements = [
    {
      requirement: 'GDPR-32',
      description: 'Personal data must be encrypted',
      pattern: /personal.?data|pii|personally.?identifiable/gi,
      passed: false
    },
    {
      requirement: 'GDPR-25',
      description: 'Data protection by design',
      pattern: /data.?protection|privacy.?by.?design/gi,
      passed: false
    },
    {
      requirement: 'GDPR-33',
      description: 'Data breach notification required',
      pattern: /breach.?notification|incident.?response/gi,
      passed: false
    }
  ];

  const results = gdprRequirements.map(req => ({
    ...req,
    passed: req.pattern.test(content)
  }));

  const failedRequirements = results
    .filter(result => !result.passed)
    .map(result => result.requirement);

  return {
    standard: 'GDPR',
    passed: failedRequirements.length === 0,
    failedRequirements
  };
};

/**
 * Pure function to check HIPAA compliance
 */
export const checkHIPAACompliance = (content: string): { standard: ComplianceStandard; passed: boolean; failedRequirements: string[] } => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return { standard: 'HIPAA', passed: false, failedRequirements: ['No content to validate'] };
  }

  const hipaaRequirements = [
    {
      requirement: 'HIPAA-164.312(a)(1)',
      description: 'Access control required',
      pattern: /access.?control|user.?authentication/gi,
      passed: false
    },
    {
      requirement: 'HIPAA-164.312(e)(1)',
      description: 'Audit controls required',
      pattern: /audit.?log|logging|audit.?trail/gi,
      passed: false
    },
    {
      requirement: 'HIPAA-164.312(c)(1)',
      description: 'Data encryption required',
      pattern: /encryption|encrypted|secure.?transmission/gi,
      passed: false
    }
  ];

  const results = hipaaRequirements.map(req => ({
    ...req,
    passed: req.pattern.test(content)
  }));

  const failedRequirements = results
    .filter(result => !result.passed)
    .map(result => result.requirement);

  return {
    standard: 'HIPAA',
    passed: failedRequirements.length === 0,
    failedRequirements
  };
};

/**
 * Pure function to check SOX compliance
 */
export const checkSOXCompliance = (content: string): { standard: ComplianceStandard; passed: boolean; failedRequirements: string[] } => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return { standard: 'SOX', passed: false, failedRequirements: ['No content to validate'] };
  }

  const soxRequirements = [
    {
      requirement: 'SOX-404',
      description: 'Internal controls required',
      pattern: /internal.?control|control.?framework/gi,
      passed: false
    },
    {
      requirement: 'SOX-302',
      description: 'Management certification required',
      pattern: /management.?certification|ceo.?certification/gi,
      passed: false
    },
    {
      requirement: 'SOX-409',
      description: 'Real-time disclosure required',
      pattern: /real.?time.?disclosure|timely.?disclosure/gi,
      passed: false
    }
  ];

  const results = soxRequirements.map(req => ({
    ...req,
    passed: req.pattern.test(content)
  }));

  const failedRequirements = results
    .filter(result => !result.passed)
    .map(result => result.requirement);

  return {
    standard: 'SOX',
    passed: failedRequirements.length === 0,
    failedRequirements
  };
};

/**
 * Pure function to check ISO 27001 compliance
 */
export const checkISO27001Compliance = (content: string): { standard: ComplianceStandard; passed: boolean; failedRequirements: string[] } => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return { standard: 'ISO27001', passed: false, failedRequirements: ['No content to validate'] };
  }

  const iso27001Requirements = [
    {
      requirement: 'ISO-27001-A.9.1',
      description: 'Access control policy required',
      pattern: /access.?control.?policy|user.?access.?management/gi,
      passed: false
    },
    {
      requirement: 'ISO-27001-A.10.1',
      description: 'Cryptography policy required',
      pattern: /cryptography.?policy|encryption.?policy/gi,
      passed: false
    },
    {
      requirement: 'ISO-27001-A.12.1',
      description: 'Operational procedures required',
      pattern: /operational.?procedures|security.?procedures/gi,
      passed: false
    }
  ];

  const results = iso27001Requirements.map(req => ({
    ...req,
    passed: req.pattern.test(content)
  }));

  const failedRequirements = results
    .filter(result => !result.passed)
    .map(result => result.requirement);

  return {
    standard: 'ISO27001',
    passed: failedRequirements.length === 0,
    failedRequirements
  };
};

/**
 * Pure function to get compliance standard description
 */
export const getComplianceStandardDescription = (standard: ComplianceStandard): string => {
  const descriptions: Record<ComplianceStandard, string> = {
    'PCI-DSS': 'Payment Card Industry Data Security Standard',
    'GDPR': 'General Data Protection Regulation',
    'HIPAA': 'Health Insurance Portability and Accountability Act',
    'SOX': 'Sarbanes-Oxley Act',
    'ISO27001': 'ISO/IEC 27001 Information Security Management',
    'NIST': 'National Institute of Standards and Technology',
    'CIS': 'Center for Internet Security'
  };

  return descriptions[standard] || 'Unknown compliance standard';
};

/**
 * Pure function to get compliance severity
 */
export const getComplianceSeverity = (standard: ComplianceStandard): 'critical' | 'high' | 'medium' | 'low' => {
  const severities: Record<ComplianceStandard, 'critical' | 'high' | 'medium' | 'low'> = {
    'PCI-DSS': 'critical',
    'GDPR': 'critical',
    'HIPAA': 'critical',
    'SOX': 'high',
    'ISO27001': 'high',
    'NIST': 'medium',
    'CIS': 'medium'
  };

  return severities[standard] || 'medium';
};
