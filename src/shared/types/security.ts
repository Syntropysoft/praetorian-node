/**
 * Security Rules Types
 * 
 * Single Responsibility: Define types for security validation
 */

import { ValidationResult, ValidationError, ValidationWarning } from './index';

/**
 * Security severity levels
 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Security rule types
 */
export type SecurityRuleType = 'secret' | 'permission' | 'vulnerability' | 'compliance';

/**
 * Compliance standards
 */
export type ComplianceStandard = 'PCI-DSS' | 'GDPR' | 'HIPAA' | 'SOX' | 'ISO27001' | 'NIST' | 'CIS';

/**
 * Base security rule interface
 */
export interface BaseSecurityRule {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the rule */
  description: string;
  /** Rule type */
  type: SecurityRuleType;
  /** Severity level */
  severity: SecuritySeverity;
  /** Whether the rule is enabled */
  enabled: boolean;
  /** Custom configuration */
  config?: Record<string, any>;
}

/**
 * Secret detection rule
 */
export interface SecretDetectionRule extends BaseSecurityRule {
  type: 'secret';
  /** Regex pattern to detect secrets */
  pattern: RegExp;
  /** Examples of what this rule detects */
  examples: string[];
  /** Remediation steps */
  remediation: string;
  /** False positive patterns to exclude */
  excludePatterns?: RegExp[];
  /** Context where this secret might be valid */
  validContexts?: string[];
}

/**
 * Permission validation rule
 */
export interface PermissionRule extends BaseSecurityRule {
  type: 'permission';
  /** File pattern to match */
  filePattern: string;
  /** Maximum allowed permissions (octal) */
  maxPermissions: number;
  /** Minimum required permissions (octal) */
  minPermissions?: number;
  /** File owner requirements */
  ownerRequirements?: {
    user?: string;
    group?: string;
  };
}

/**
 * Vulnerability detection rule
 */
export interface VulnerabilityRule extends BaseSecurityRule {
  type: 'vulnerability';
  /** Vulnerability category */
  category: 'encryption' | 'protocol' | 'credential' | 'configuration' | 'injection' | 'xss' | 'csrf';
  /** Regex pattern to detect vulnerability */
  pattern: RegExp;
  /** CVE identifier if applicable */
  cve?: string;
  /** CVSS score if available */
  cvssScore?: number;
  /** Remediation steps */
  remediation: string;
  /** References */
  references?: string[];
}

/**
 * Compliance validation rule
 */
export interface ComplianceRule extends BaseSecurityRule {
  type: 'compliance';
  /** Compliance standard */
  standard: ComplianceStandard;
  /** Requirement identifier */
  requirement: string;
  /** Regex pattern to validate compliance */
  pattern: RegExp;
  /** Requirement description */
  requirementDescription: string;
  /** Implementation guidance */
  guidance: string;
  /** References to standard */
  references?: string[];
}

/**
 * Union type for all security rules
 */
export type SecurityRule = SecretDetectionRule | PermissionRule | VulnerabilityRule | ComplianceRule;

/**
 * Security validation context
 */
export interface SecurityContext {
  /** File being validated */
  filePath: string;
  /** File content */
  content: string;
  /** File permissions (if available) */
  permissions?: number;
  /** File owner (if available) */
  owner?: {
    user: string;
    group: string;
  };
  /** Validation options */
  options: SecurityOptions;
  /** Custom security validators */
  customValidators?: Record<string, (value: any, context: SecurityContext) => ValidationResult>;
}

/**
 * Security validation options
 */
export interface SecurityOptions {
  /** Whether to stop on first critical error */
  stopOnCritical?: boolean;
  /** Whether to include low severity issues */
  includeLowSeverity?: boolean;
  /** Whether to validate file permissions */
  validatePermissions?: boolean;
  /** Whether to validate compliance */
  validateCompliance?: boolean;
  /** Custom security rules */
  customRules?: SecurityRule[];
  /** Exclude patterns for false positives */
  excludePatterns?: RegExp[];
}

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  /** Whether all security checks passed */
  valid: boolean;
  /** List of security errors */
  errors: ValidationError[];
  /** List of security warnings */
  warnings: ValidationWarning[];
  /** Detailed results for each rule */
  results: SecurityRuleResult[];
  /** Security summary */
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    failed: number;
  };
  /** Compliance status */
  compliance?: {
    standard: ComplianceStandard;
    passed: boolean;
    failedRequirements: string[];
  };
}

/**
 * Individual security rule result
 */
export interface SecurityRuleResult {
  /** Rule that was validated */
  rule: SecurityRule;
  /** Whether this rule passed */
  passed: boolean;
  /** Error if rule failed */
  error?: ValidationError;
  /** Warning if rule had issues */
  warning?: ValidationWarning;
  /** Value that triggered the rule */
  matchedValue?: string;
  /** Path where the issue was found */
  path?: string;
  /** Line number if available */
  lineNumber?: number;
  /** Column number if available */
  columnNumber?: number;
}

/**
 * Secret detection result
 */
export interface SecretDetectionResult {
  /** Type of secret detected */
  secretType: string;
  /** The actual secret value (masked) */
  maskedValue: string;
  /** Confidence level (0-100) */
  confidence: number;
  /** Context around the secret */
  context: string;
  /** Line number */
  lineNumber: number;
  /** Column number */
  columnNumber: number;
}

/**
 * Permission validation result
 */
export interface PermissionValidationResult {
  /** File path */
  filePath: string;
  /** Current permissions */
  currentPermissions: number;
  /** Required permissions */
  requiredPermissions: number;
  /** Whether permissions are correct */
  valid: boolean;
  /** Owner information */
  owner?: {
    user: string;
    group: string;
  };
}

/**
 * Vulnerability detection result
 */
export interface VulnerabilityDetectionResult {
  /** Vulnerability type */
  type: string;
  /** CVE if applicable */
  cve?: string;
  /** CVSS score if available */
  cvssScore?: number;
  /** Description */
  description: string;
  /** Remediation steps */
  remediation: string;
  /** References */
  references?: string[];
  /** Line number */
  lineNumber: number;
  /** Column number */
  columnNumber: number;
}
