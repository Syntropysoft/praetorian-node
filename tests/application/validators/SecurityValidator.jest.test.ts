/**
 * SecurityValidator Tests
 * 
 * Tests for security validation orchestration functionality
 * Following SOLID SRP and functional programming principles
 */

import {
  validateSecurity,
  getSecuritySeverityLevel,
  isCriticalSecurityRule,
  isSecurityRuleEnabled,
  filterSecurityRulesByType,
  filterSecurityRulesBySeverity,
} from '../../../src/application/validators/SecurityValidator';
import { 
  SecurityRule, 
  SecurityContext, 
  SecurityValidationResult,
  SecretDetectionRule,
  PermissionRule,
  VulnerabilityRule,
  ComplianceRule,
  ComplianceStandard
} from '../../../src/shared/types/security';

// Mock the dependencies
jest.mock('../../../src/application/validators/SecretDetector');
jest.mock('../../../src/application/validators/PermissionValidator');
jest.mock('../../../src/application/validators/VulnerabilityScanner');
jest.mock('../../../src/application/validators/ComplianceChecker');

import { detectSecrets } from '../../../src/application/validators/SecretDetector';
import { validatePermissions } from '../../../src/application/validators/PermissionValidator';
import { scanVulnerabilities } from '../../../src/application/validators/VulnerabilityScanner';
import { checkCompliance } from '../../../src/application/validators/ComplianceChecker';

const mockDetectSecrets = detectSecrets as jest.MockedFunction<typeof detectSecrets>;
const mockValidatePermissions = validatePermissions as jest.MockedFunction<typeof validatePermissions>;
const mockScanVulnerabilities = scanVulnerabilities as jest.MockedFunction<typeof scanVulnerabilities>;
const mockCheckCompliance = checkCompliance as jest.MockedFunction<typeof checkCompliance>;

describe('SecurityValidator', () => {
  let mockContext: SecurityContext;

  beforeEach(() => {
    mockContext = {
      filePath: 'test.yaml',
      content: 'test content',
      options: {}
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock returns
    mockDetectSecrets.mockReturnValue([]);
    mockValidatePermissions.mockReturnValue([]);
    mockScanVulnerabilities.mockReturnValue([]);
    mockCheckCompliance.mockReturnValue({
      standard: 'ISO27001' as ComplianceStandard,
      passed: true,
      failedRequirements: []
    });
  });

  describe('validateSecurity', () => {
    it('should return empty result for empty content', () => {
      const rules: any[] = [
        {
          id: 'test-rule',
          name: 'Test Rule',
          description: 'Test security rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      const result = validateSecurity('', rules, mockContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    });

    it('should return empty result for whitespace-only content', () => {
      const rules: any[] = [
        {
          id: 'test-rule',
          name: 'Test Rule',
          description: 'Test security rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      const result = validateSecurity('   \n\t  ', rules, mockContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    });

    it('should return empty result for no rules', () => {
      const rules: any[] = [];

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    });

    it('should return empty result for null rules', () => {
      const rules: SecurityRule[] = null as any;

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    });

    it('should validate only enabled rules', () => {
      const rules: any[] = [
        {
          id: 'enabled-rule',
          name: 'Enabled Rule',
          description: 'Enabled security rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        },
        {
          id: 'disabled-rule',
          name: 'Disabled Rule',
          description: 'Disabled security rule',
          type: 'secret',
          severity: 'high',
          enabled: false
        }
      ];

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].rule.id).toBe('enabled-rule');
    });

    it('should handle invalid rule gracefully', () => {
      const rules: any[] = [
        {
          id: '',
          name: 'Invalid Rule',
          description: 'Invalid security rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(false);
      expect(result.results[0].error?.message).toContain('Invalid security rule');
    });

    it('should validate secret rule successfully', () => {
      const rules: SecretDetectionRule[] = [
        {
          id: 'secret-rule',
          name: 'Secret Rule',
          description: 'Detect secrets',
          type: 'secret',
          severity: 'high',
          enabled: true,
          pattern: /api_key/gi,
          examples: ['api_key=123'],
          remediation: 'Remove secret'
        }
      ];

      mockDetectSecrets.mockReturnValue([]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(mockDetectSecrets).toHaveBeenCalledWith('test content', rules, mockContext);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(true);
    });

    it('should validate secret rule with failures', () => {
      const rules: SecretDetectionRule[] = [
        {
          id: 'secret-rule',
          name: 'Secret Rule',
          description: 'Detect secrets',
          type: 'secret',
          severity: 'high',
          enabled: true,
          pattern: /api_key/gi,
          examples: ['api_key=123'],
          remediation: 'Remove secret'
        }
      ];

      mockDetectSecrets.mockReturnValue([
        {
          secretType: 'api_key',
          maskedValue: 'api_key=***',
          confidence: 95,
          context: 'api_key=123456',
          lineNumber: 1,
          columnNumber: 1
        }
      ]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(false);
      expect(result.results[0].error?.message).toContain('Found 1 potential secrets');
      expect(result.results[0].matchedValue).toBe('api_key=***');
    });

    it('should validate permission rule successfully', () => {
      const rules: PermissionRule[] = [
        {
          id: 'permission-rule',
          name: 'Permission Rule',
          description: 'Validate permissions',
          type: 'permission',
          severity: 'medium',
          enabled: true,
          filePattern: '*.yaml',
          maxPermissions: 644
        }
      ];

      mockValidatePermissions.mockReturnValue([
        {
          filePath: 'test.yaml',
          currentPermissions: 644,
          requiredPermissions: 644,
          valid: true
        }
      ]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(mockValidatePermissions).toHaveBeenCalledWith(
        mockContext.filePath,
        mockContext.permissions,
        rules,
        mockContext
      );
      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(true);
    });

    it('should validate permission rule with failures', () => {
      const rules: PermissionRule[] = [
        {
          id: 'permission-rule',
          name: 'Permission Rule',
          description: 'Validate permissions',
          type: 'permission',
          severity: 'medium',
          enabled: true,
          filePattern: '*.yaml',
          maxPermissions: 644
        }
      ];

      mockValidatePermissions.mockReturnValue([
        {
          filePath: 'test.yaml',
          currentPermissions: 777,
          requiredPermissions: 644,
          valid: false
        }
      ]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(false);
      expect(result.results[0].error?.message).toContain('Invalid file permissions');
      expect(result.results[0].matchedValue).toBe('777');
    });

    it('should validate vulnerability rule successfully', () => {
      const rules: VulnerabilityRule[] = [
        {
          id: 'vulnerability-rule',
          name: 'Vulnerability Rule',
          description: 'Scan for vulnerabilities',
          type: 'vulnerability',
          severity: 'high',
          enabled: true,
          category: 'encryption',
          pattern: /MD5/gi,
          remediation: 'Use SHA-256'
        }
      ];

      mockScanVulnerabilities.mockReturnValue([]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(mockScanVulnerabilities).toHaveBeenCalledWith('test content', rules, mockContext);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(true);
    });

    it('should validate vulnerability rule with failures', () => {
      const rules: VulnerabilityRule[] = [
        {
          id: 'vulnerability-rule',
          name: 'Vulnerability Rule',
          description: 'Scan for vulnerabilities',
          type: 'vulnerability',
          severity: 'high',
          enabled: true,
          category: 'encryption',
          pattern: /MD5/gi,
          remediation: 'Use SHA-256'
        }
      ];

      mockScanVulnerabilities.mockReturnValue([
        {
          type: 'encryption',
          cve: 'CVE-2004-2761',
          cvssScore: 7.5,
          description: 'MD5 hash function detected',
          remediation: 'Use SHA-256',
          references: ['https://example.com'],
          lineNumber: 1,
          columnNumber: 1
        }
      ]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(false);
      expect(result.results[0].error?.message).toContain('Found 1 vulnerabilities');
      expect(result.results[0].matchedValue).toBe('encryption');
    });

    it('should validate compliance rule successfully', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'compliance-rule',
          name: 'Compliance Rule',
          description: 'Check compliance',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'ISO-27001-A.9.1',
          pattern: /access.?control/gi,
          requirementDescription: 'Access control policy',
          guidance: 'Implement access control'
        }
      ];

      mockCheckCompliance.mockReturnValue({
        standard: 'ISO27001',
        passed: true,
        failedRequirements: []
      });

      const result = validateSecurity('test content', rules, mockContext);

      expect(mockCheckCompliance).toHaveBeenCalledWith('test content', rules, mockContext);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(true);
    });

    it('should validate compliance rule with failures', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'compliance-rule',
          name: 'Compliance Rule',
          description: 'Check compliance',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'ISO-27001-A.9.1',
          pattern: /access.?control/gi,
          requirementDescription: 'Access control policy',
          guidance: 'Implement access control'
        }
      ];

      mockCheckCompliance.mockReturnValue({
        standard: 'ISO27001',
        passed: false,
        failedRequirements: ['ISO-27001-A.9.1', 'ISO-27001-A.10.1']
      });

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(false);
      expect(result.results[0].error?.message).toContain('Compliance failed');
      expect(result.results[0].error?.message).toContain('ISO-27001-A.9.1');
    });

    it('should handle unknown rule type', () => {
      const rules: any[] = [
        {
          id: 'unknown-rule',
          name: 'Unknown Rule',
          description: 'Unknown rule type',
          type: 'unknown' as any,
          severity: 'high',
          enabled: true
        }
      ];

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].passed).toBe(false);
      expect(result.results[0].error?.message).toContain('Unknown rule type');
    });

    it('should create correct security summary', () => {
      const rules: any[] = [
        {
          id: 'critical-rule',
          name: 'Critical Rule',
          description: 'Critical security rule',
          type: 'secret',
          severity: 'critical',
          enabled: true
        },
        {
          id: 'high-rule',
          name: 'High Rule',
          description: 'High security rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        },
        {
          id: 'medium-rule',
          name: 'Medium Rule',
          description: 'Medium security rule',
          type: 'secret',
          severity: 'medium',
          enabled: true
        }
      ];

      // Mock all rules to fail
      mockDetectSecrets.mockReturnValue([
        { secretType: 'api_key', maskedValue: '***', confidence: 95, context: '', lineNumber: 1, columnNumber: 1 },
        { secretType: 'password', maskedValue: '***', confidence: 90, context: '', lineNumber: 1, columnNumber: 1 },
        { secretType: 'token', maskedValue: '***', confidence: 85, context: '', lineNumber: 1, columnNumber: 1 }
      ]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.summary.total).toBe(3);
      expect(result.summary.passed).toBe(0);
      expect(result.summary.failed).toBe(3);
      expect(result.summary.critical).toBe(1);
      expect(result.summary.high).toBe(1);
      expect(result.summary.medium).toBe(1);
      expect(result.summary.low).toBe(0);
    });

    it('should set valid to false when there are errors', () => {
      const rules: any[] = [
        {
          id: 'failing-rule',
          name: 'Failing Rule',
          description: 'Failing security rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      mockDetectSecrets.mockReturnValue([
        { secretType: 'api_key', maskedValue: '***', confidence: 95, context: '', lineNumber: 1, columnNumber: 1 }
      ]);

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(0);
    });

    it('should include compliance status when compliance rules are present', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'compliance-rule',
          name: 'Compliance Rule',
          description: 'Check compliance',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'ISO-27001-A.9.1',
          pattern: /access.?control/gi,
          requirementDescription: 'Access control policy',
          guidance: 'Implement access control'
        }
      ];

      mockCheckCompliance.mockReturnValue({
        standard: 'ISO27001',
        passed: true,
        failedRequirements: []
      });

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.compliance).toBeDefined();
      expect(result.compliance?.standard).toBe('ISO27001');
      expect(result.compliance?.passed).toBe(true);
      expect(result.compliance?.failedRequirements).toEqual([]);
    });

    it('should not include compliance status when no compliance rules are present', () => {
      const rules: any[] = [
        {
          id: 'secret-rule',
          name: 'Secret Rule',
          description: 'Detect secrets',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      const result = validateSecurity('test content', rules, mockContext);

      expect(result.compliance).toBeUndefined();
    });
  });

  describe('getSecuritySeverityLevel', () => {
    it('should return correct severity for critical', () => {
      expect(getSecuritySeverityLevel('critical')).toBe('critical');
      expect(getSecuritySeverityLevel('CRITICAL')).toBe('critical');
      expect(getSecuritySeverityLevel('Critical')).toBe('critical');
    });

    it('should return correct severity for high', () => {
      expect(getSecuritySeverityLevel('high')).toBe('high');
      expect(getSecuritySeverityLevel('HIGH')).toBe('high');
      expect(getSecuritySeverityLevel('High')).toBe('high');
    });

    it('should return correct severity for medium', () => {
      expect(getSecuritySeverityLevel('medium')).toBe('medium');
      expect(getSecuritySeverityLevel('MEDIUM')).toBe('medium');
      expect(getSecuritySeverityLevel('Medium')).toBe('medium');
    });

    it('should return correct severity for low', () => {
      expect(getSecuritySeverityLevel('low')).toBe('low');
      expect(getSecuritySeverityLevel('LOW')).toBe('low');
      expect(getSecuritySeverityLevel('Low')).toBe('low');
    });

    it('should return medium for unknown severity', () => {
      expect(getSecuritySeverityLevel('unknown')).toBe('medium');
      expect(getSecuritySeverityLevel('')).toBe('medium');
      expect(getSecuritySeverityLevel('invalid')).toBe('medium');
    });
  });

  describe('isCriticalSecurityRule', () => {
    it('should return true for critical rules', () => {
      const rule: any = {
        id: 'critical-rule',
        name: 'Critical Rule',
        description: 'Critical security rule',
        type: 'secret',
        severity: 'critical',
        enabled: true
      };

      expect(isCriticalSecurityRule(rule)).toBe(true);
    });

    it('should return false for non-critical rules', () => {
      const rule: any = {
        id: 'high-rule',
        name: 'High Rule',
        description: 'High security rule',
        type: 'secret',
        severity: 'high',
        enabled: true
      };

      expect(isCriticalSecurityRule(rule)).toBe(false);
    });
  });

  describe('isSecurityRuleEnabled', () => {
    it('should return true for enabled rules', () => {
      const rule: any = {
        id: 'enabled-rule',
        name: 'Enabled Rule',
        description: 'Enabled security rule',
        type: 'secret',
        severity: 'high',
        enabled: true
      };

      expect(isSecurityRuleEnabled(rule)).toBe(true);
    });

    it('should return false for disabled rules', () => {
      const rule: any = {
        id: 'disabled-rule',
        name: 'Disabled Rule',
        description: 'Disabled security rule',
        type: 'secret',
        severity: 'high',
        enabled: false
      };

      expect(isSecurityRuleEnabled(rule)).toBe(false);
    });
  });

  describe('filterSecurityRulesByType', () => {
    it('should filter rules by type', () => {
      const rules: any[] = [
        {
          id: 'secret-rule',
          name: 'Secret Rule',
          description: 'Secret rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        },
        {
          id: 'permission-rule',
          name: 'Permission Rule',
          description: 'Permission rule',
          type: 'permission',
          severity: 'medium',
          enabled: true
        },
        {
          id: 'vulnerability-rule',
          name: 'Vulnerability Rule',
          description: 'Vulnerability rule',
          type: 'vulnerability',
          severity: 'high',
          enabled: true
        }
      ];

      const secretRules = filterSecurityRulesByType(rules, 'secret');
      const permissionRules = filterSecurityRulesByType(rules, 'permission');

      expect(secretRules).toHaveLength(1);
      expect(secretRules[0].id).toBe('secret-rule');
      expect(permissionRules).toHaveLength(1);
      expect(permissionRules[0].id).toBe('permission-rule');
    });

    it('should return empty array for non-existent type', () => {
      const rules: any[] = [
        {
          id: 'secret-rule',
          name: 'Secret Rule',
          description: 'Secret rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      const filteredRules = filterSecurityRulesByType(rules, 'nonexistent');

      expect(filteredRules).toEqual([]);
    });
  });

  describe('filterSecurityRulesBySeverity', () => {
    it('should filter rules by severity', () => {
      const rules: any[] = [
        {
          id: 'critical-rule',
          name: 'Critical Rule',
          description: 'Critical rule',
          type: 'secret',
          severity: 'critical',
          enabled: true
        },
        {
          id: 'high-rule',
          name: 'High Rule',
          description: 'High rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        },
        {
          id: 'medium-rule',
          name: 'Medium Rule',
          description: 'Medium rule',
          type: 'secret',
          severity: 'medium',
          enabled: true
        }
      ];

      const criticalRules = filterSecurityRulesBySeverity(rules, 'critical');
      const highRules = filterSecurityRulesBySeverity(rules, 'high');

      expect(criticalRules).toHaveLength(1);
      expect(criticalRules[0].id).toBe('critical-rule');
      expect(highRules).toHaveLength(1);
      expect(highRules[0].id).toBe('high-rule');
    });

    it('should return empty array for non-existent severity', () => {
      const rules: any[] = [
        {
          id: 'high-rule',
          name: 'High Rule',
          description: 'High rule',
          type: 'secret',
          severity: 'high',
          enabled: true
        }
      ];

      const filteredRules = filterSecurityRulesBySeverity(rules, 'nonexistent');

      expect(filteredRules).toEqual([]);
    });
  });
});
