/**
 * Common Security Rules - Functional Programming
 * 
 * Single Responsibility: Provide predefined security rules
 * Pure functions, no state, no side effects
 */

import { 
  SecurityRule, 
  SecretDetectionRule, 
  PermissionRule, 
  VulnerabilityRule, 
  ComplianceRule,
  ComplianceStandard 
} from '../../shared/types/security';

/**
 * Pure function to get all common security rules
 */
export const getAllCommonSecurityRules = (): SecurityRule[] => [
  ...getSecretDetectionRules(),
  ...getPermissionRules(),
  ...getVulnerabilityRules(),
  ...getComplianceRules()
];

/**
 * Pure function to get secret detection rules
 */
export const getSecretDetectionRules = (): SecretDetectionRule[] => [
  {
    id: 'API_KEY_DETECTION',
    name: 'API Key Detection',
    description: 'Detects exposed API keys',
    type: 'secret',
    severity: 'critical',
    enabled: true,
    pattern: /(sk-|pk_|ak_|api_key)[a-zA-Z0-9]{20,}/gi,
    examples: ['sk-1234567890abcdef', 'pk_live_1234567890abcdef'],
    remediation: 'Remove API keys from configuration files and use environment variables'
  },
  {
    id: 'JWT_TOKEN_DETECTION',
    name: 'JWT Token Detection',
    description: 'Detects exposed JWT tokens',
    type: 'secret',
    severity: 'high',
    enabled: true,
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/gi,
    examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'],
    remediation: 'Remove JWT tokens from configuration files and use secure storage'
  },
  {
    id: 'PASSWORD_DETECTION',
    name: 'Password Detection',
    description: 'Detects exposed passwords',
    type: 'secret',
    severity: 'critical',
    enabled: true,
    pattern: /password\s*[:=]\s*["']?[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}["']?/gi,
    examples: ['password: "mypassword123"', 'password = "secretpass"'],
    remediation: 'Remove passwords from configuration files and use environment variables'
  },
  {
    id: 'DATABASE_URL_DETECTION',
    name: 'Database URL Detection',
    description: 'Detects exposed database connection strings',
    type: 'secret',
    severity: 'critical',
    enabled: true,
    pattern: /(mysql|postgresql|mongodb|redis):\/\/[^:]+:[^@]+@[^\/]+\/[^\s]+/gi,
    examples: ['mysql://user:password@localhost:3306/database'],
    remediation: 'Remove database credentials from configuration files and use environment variables'
  }
];

/**
 * Pure function to get permission rules
 */
export const getPermissionRules = (): PermissionRule[] => [
  {
    id: 'ENV_FILE_PERMISSIONS',
    name: 'Environment File Permissions',
    description: 'Ensures .env files have restrictive permissions',
    type: 'permission',
    severity: 'high',
    enabled: true,
    filePattern: '**/.env*',
    maxPermissions: 600
  },
  {
    id: 'CONFIG_FILE_PERMISSIONS',
    name: 'Config File Permissions',
    description: 'Ensures config files have appropriate permissions',
    type: 'permission',
    severity: 'medium',
    enabled: true,
    filePattern: '**/config.*',
    maxPermissions: 644
  },
  {
    id: 'SECRET_FILE_PERMISSIONS',
    name: 'Secret File Permissions',
    description: 'Ensures secret files have restrictive permissions',
    type: 'permission',
    severity: 'critical',
    enabled: true,
    filePattern: '**/*secret*',
    maxPermissions: 600
  },
  {
    id: 'KEY_FILE_PERMISSIONS',
    name: 'Key File Permissions',
    description: 'Ensures key files have restrictive permissions',
    type: 'permission',
    severity: 'critical',
    enabled: true,
    filePattern: '**/*.key',
    maxPermissions: 600
  }
];

/**
 * Pure function to get vulnerability rules
 */
export const getVulnerabilityRules = (): VulnerabilityRule[] => [
  {
    id: 'WEAK_ENCRYPTION_MD5',
    name: 'Weak Encryption - MD5',
    description: 'Detects use of MD5 hash function',
    type: 'vulnerability',
    severity: 'high',
    enabled: true,
    category: 'encryption',
    pattern: /MD5\s*\(/gi,
    cve: 'CVE-2004-2761',
    cvssScore: 7.5,
    remediation: 'Replace MD5 with SHA-256 or stronger hash functions',
    references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2004-2761']
  },
  {
    id: 'WEAK_ENCRYPTION_SHA1',
    name: 'Weak Encryption - SHA1',
    description: 'Detects use of SHA1 hash function',
    type: 'vulnerability',
    severity: 'medium',
    enabled: true,
    category: 'encryption',
    pattern: /SHA1\s*\(/gi,
    cve: 'CVE-2005-4900',
    cvssScore: 6.8,
    remediation: 'Replace SHA1 with SHA-256 or stronger hash functions',
    references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2005-4900']
  },
  {
    id: 'INSECURE_PROTOCOL_HTTP',
    name: 'Insecure Protocol - HTTP',
    description: 'Detects use of HTTP protocol',
    type: 'vulnerability',
    severity: 'medium',
    enabled: true,
    category: 'protocol',
    pattern: /http:\/\//gi,
    cve: 'CVE-2014-3566',
    cvssScore: 4.3,
    remediation: 'Use HTTPS for all communications',
    references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-3566']
  },
  {
    id: 'WEAK_PASSWORD_DEFAULT',
    name: 'Weak Password - Default',
    description: 'Detects default or weak passwords',
    type: 'vulnerability',
    severity: 'high',
    enabled: true,
    category: 'credential',
    pattern: /password\s*[:=]\s*["']?(admin|password|123456|root)["']?/gi,
    remediation: 'Use strong, unique passwords',
    references: ['https://owasp.org/www-community/vulnerabilities/Weak_Password_Requirements']
  }
];

/**
 * Pure function to get compliance rules
 */
export const getComplianceRules = (): ComplianceRule[] => [
  {
    id: 'PCI_DSS_ENCRYPTION',
    name: 'PCI DSS - Data Encryption',
    description: 'Ensures credit card data is encrypted',
    type: 'compliance',
    severity: 'critical',
    enabled: true,
    standard: 'PCI-DSS',
    requirement: 'PCI-DSS-3.4',
    pattern: /encryption|encrypted|secure/gi,
    requirementDescription: 'Credit card data must be encrypted',
    guidance: 'Implement strong encryption for all credit card data at rest and in transit'
  },
  {
    id: 'GDPR_DATA_PROTECTION',
    name: 'GDPR - Data Protection',
    description: 'Ensures personal data protection measures',
    type: 'compliance',
    severity: 'critical',
    enabled: true,
    standard: 'GDPR',
    requirement: 'GDPR-32',
    pattern: /personal.?data|pii|privacy/gi,
    requirementDescription: 'Personal data must be protected',
    guidance: 'Implement appropriate technical and organizational measures to protect personal data'
  },
  {
    id: 'HIPAA_ACCESS_CONTROL',
    name: 'HIPAA - Access Control',
    description: 'Ensures access control for health information',
    type: 'compliance',
    severity: 'critical',
    enabled: true,
    standard: 'HIPAA',
    requirement: 'HIPAA-164.312(a)(1)',
    pattern: /access.?control|authentication|authorization/gi,
    requirementDescription: 'Access control required for health information',
    guidance: 'Implement access controls to ensure only authorized users can access health information'
  }
];

/**
 * Pure function to get security rules by type
 */
export const getSecurityRulesByType = (type: string): SecurityRule[] => {
  switch (type) {
    case 'secret':
      return getSecretDetectionRules();
    case 'permission':
      return getPermissionRules();
    case 'vulnerability':
      return getVulnerabilityRules();
    case 'compliance':
      return getComplianceRules();
    default:
      return [];
  }
};

/**
 * Pure function to get security rules by severity
 */
export const getSecurityRulesBySeverity = (severity: string): SecurityRule[] => {
  return getAllCommonSecurityRules().filter(rule => rule.severity === severity);
};

/**
 * Pure function to get critical security rules
 */
export const getCriticalSecurityRules = (): SecurityRule[] => {
  return getSecurityRulesBySeverity('critical');
};

/**
 * Pure function to get high severity security rules
 */
export const getHighSeveritySecurityRules = (): SecurityRule[] => {
  return getSecurityRulesBySeverity('high');
};

/**
 * Pure function to get compliance rules by standard
 */
export const getComplianceRulesByStandard = (standard: ComplianceStandard): ComplianceRule[] => {
  return getComplianceRules().filter(rule => rule.standard === standard);
};

/**
 * Pure function to get PCI DSS rules
 */
export const getPCIDSSRules = (): ComplianceRule[] => {
  return getComplianceRulesByStandard('PCI-DSS');
};

/**
 * Pure function to get GDPR rules
 */
export const getGDPRRules = (): ComplianceRule[] => {
  return getComplianceRulesByStandard('GDPR');
};

/**
 * Pure function to get HIPAA rules
 */
export const getHIPAARules = (): ComplianceRule[] => {
  return getComplianceRulesByStandard('HIPAA');
};
