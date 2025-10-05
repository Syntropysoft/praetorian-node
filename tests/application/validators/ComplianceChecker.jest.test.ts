/**
 * ComplianceChecker Tests
 * 
 * Tests for compliance checking functionality with various security standards
 * Following SOLID SRP and functional programming principles
 */

import {
  checkCompliance,
  checkPCIDSSCompliance,
  checkGDPRCompliance,
  checkHIPAACompliance,
  checkSOXCompliance,
  checkISO27001Compliance,
  getComplianceStandardDescription,
  getComplianceSeverity,
} from '../../../src/application/validators/ComplianceChecker';
import { ComplianceRule, ComplianceStandard, SecurityContext } from '../../../src/shared/types/security';

describe('ComplianceChecker', () => {
  describe('checkCompliance', () => {
    it('should return failed for empty content', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'test-rule',
          name: 'Test Rule',
          description: 'Test requirement',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'test-requirement',
          pattern: /test/gi,
          requirementDescription: 'Test requirement',
          guidance: 'Test guidance'
        }
      ];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: '',
        options: {}
      };

      const result = checkCompliance('', rules, context);

      expect(result.standard).toBe('ISO27001');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should return passed for no rules', () => {
      const rules: ComplianceRule[] = [];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'test content',
        options: {}
      };

      const result = checkCompliance('test content', rules, context);

      expect(result.standard).toBe('ISO27001');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should return passed for null rules', () => {
      const rules: ComplianceRule[] = null as any;
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'test content',
        options: {}
      };

      const result = checkCompliance('test content', rules, context);

      expect(result.standard).toBe('ISO27001');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should check enabled rules only', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'enabled-rule',
          name: 'Enabled Rule',
          description: 'Enabled rule',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'enabled-rule',
          pattern: /enabled/gi,
          requirementDescription: 'Enabled rule',
          guidance: 'Enabled guidance'
        },
        {
          id: 'disabled-rule',
          name: 'Disabled Rule',
          description: 'Disabled rule',
          type: 'compliance',
          severity: 'high',
          enabled: false,
          standard: 'ISO27001',
          requirement: 'disabled-rule',
          pattern: /disabled/gi,
          requirementDescription: 'Disabled rule',
          guidance: 'Disabled guidance'
        }
      ];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'enabled content',
        options: {}
      };

      const result = checkCompliance('enabled content', rules, context);

      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should return failed requirements for non-matching content', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          description: 'Rule 1',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'rule1',
          pattern: /pattern1/gi,
          requirementDescription: 'Rule 1',
          guidance: 'Rule 1 guidance'
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          description: 'Rule 2',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'rule2',
          pattern: /pattern2/gi,
          requirementDescription: 'Rule 2',
          guidance: 'Rule 2 guidance'
        }
      ];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'different content',
        options: {}
      };

      const result = checkCompliance('different content', rules, context);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('rule1');
      expect(result.failedRequirements).toContain('rule2');
    });

    it('should return passed when all rules match', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          description: 'Rule 1',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'rule1',
          pattern: /test/gi,
          requirementDescription: 'Rule 1',
          guidance: 'Rule 1 guidance'
        },
        {
          id: 'rule2',
          name: 'Rule 2',
          description: 'Rule 2',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'rule2',
          pattern: /content/gi,
          requirementDescription: 'Rule 2',
          guidance: 'Rule 2 guidance'
        }
      ];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'test content',
        options: {}
      };

      const result = checkCompliance('test content', rules, context);

      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should handle rules with invalid patterns', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'invalid-rule',
          name: 'Invalid Rule',
          description: 'Invalid rule',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'ISO27001',
          requirement: 'invalid-rule',
          pattern: null as any,
          requirementDescription: 'Invalid rule',
          guidance: 'Invalid guidance'
        }
      ];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'test content',
        options: {}
      };

      const result = checkCompliance('test content', rules, context);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('invalid-rule');
    });

    it('should use standard from first rule', () => {
      const rules: ComplianceRule[] = [
        {
          id: 'rule1',
          name: 'Rule 1',
          description: 'Rule 1',
          type: 'compliance',
          severity: 'high',
          enabled: true,
          standard: 'PCI-DSS' as ComplianceStandard,
          requirement: 'rule1',
          pattern: /test/gi,
          requirementDescription: 'Rule 1',
          guidance: 'Rule 1 guidance'
        }
      ];
      const context: SecurityContext = { 
        filePath: 'test.yaml',
        content: 'test content',
        options: {}
      };

      const result = checkCompliance('test content', rules, context);

      expect(result.standard).toBe('PCI-DSS');
    });
  });

  describe('checkPCIDSSCompliance', () => {
    it('should return failed for empty content', () => {
      const result = checkPCIDSSCompliance('');

      expect(result.standard).toBe('PCI-DSS');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should return failed for whitespace-only content', () => {
      const result = checkPCIDSSCompliance('   \n\t  ');

      expect(result.standard).toBe('PCI-DSS');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should pass when all PCI-DSS requirements are met', () => {
      const content = `
        credit card encryption enabled
        encryption key protection configured
        strong password authentication required
      `;

      const result = checkPCIDSSCompliance(content);

      expect(result.standard).toBe('PCI-DSS');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should fail when credit card data is not encrypted', () => {
      const content = `
        storing sensitive data without encryption
        authentication required
        encryption key protection
      `;

      const result = checkPCIDSSCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('PCI-DSS-3.4');
    });

    it('should fail when encryption keys are not protected', () => {
      const content = `
        credit card encryption enabled
        storing keys without protection
        password authentication
      `;

      const result = checkPCIDSSCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('PCI-DSS-3.5');
    });

    it('should fail when strong authentication is missing', () => {
      const content = `
        credit card encryption enabled
        encryption key protection configured
        basic system configuration
      `;

      const result = checkPCIDSSCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('PCI-DSS-8.2');
    });

    it('should handle case-insensitive matching', () => {
      const content = `
        CREDIT CARD encryption enabled
        ENCRYPTION KEY protection configured
        PASSWORD authentication required
      `;

      const result = checkPCIDSSCompliance(content);

      expect(result.standard).toBe('PCI-DSS');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });
  });

  describe('checkGDPRCompliance', () => {
    it('should return failed for empty content', () => {
      const result = checkGDPRCompliance('');

      expect(result.standard).toBe('GDPR');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should pass when all GDPR requirements are met', () => {
      const content = `
        personal data encryption enabled
        data protection by design implemented
        breach notification procedures in place
      `;

      const result = checkGDPRCompliance(content);

      expect(result.standard).toBe('GDPR');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should fail when personal data is not encrypted', () => {
      const content = `
        handling user information in plain text
        data protection by design
        breach notification
      `;

      const result = checkGDPRCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('GDPR-32');
    });

    it('should fail when data protection by design is missing', () => {
      const content = `
        personal data encryption enabled
        basic data handling
        breach notification procedures
      `;

      const result = checkGDPRCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('GDPR-25');
    });

    it('should fail when breach notification is missing', () => {
      const content = `
        personal data encryption enabled
        data protection by design implemented
        basic security procedures
      `;

      const result = checkGDPRCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('GDPR-33');
    });
  });

  describe('checkHIPAACompliance', () => {
    it('should return failed for empty content', () => {
      const result = checkHIPAACompliance('');

      expect(result.standard).toBe('HIPAA');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should pass when all HIPAA requirements are met', () => {
      const content = `
        access control system implemented
        audit log monitoring enabled
        data encryption for transmission
      `;

      const result = checkHIPAACompliance(content);

      expect(result.standard).toBe('HIPAA');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should fail when access control is missing', () => {
      const content = `
        audit log monitoring enabled
        data encryption for transmission
        basic system setup
      `;

      const result = checkHIPAACompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('HIPAA-164.312(a)(1)');
    });

    it('should fail when audit controls are missing', () => {
      const content = `
        access control system implemented
        data encryption for transmission
        basic system monitoring
      `;

      const result = checkHIPAACompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('HIPAA-164.312(e)(1)');
    });

    it('should fail when data encryption is missing', () => {
      const content = `
        access control system implemented
        audit log monitoring enabled
        basic data handling
      `;

      const result = checkHIPAACompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('HIPAA-164.312(c)(1)');
    });
  });

  describe('checkSOXCompliance', () => {
    it('should return failed for empty content', () => {
      const result = checkSOXCompliance('');

      expect(result.standard).toBe('SOX');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should pass when all SOX requirements are met', () => {
      const content = `
        internal control framework implemented
        management certification process
        real-time disclosure procedures
      `;

      const result = checkSOXCompliance(content);

      expect(result.standard).toBe('SOX');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should fail when internal controls are missing', () => {
      const content = `
        management certification process
        real-time disclosure procedures
        basic business setup
      `;

      const result = checkSOXCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('SOX-404');
    });

    it('should fail when management certification is missing', () => {
      const content = `
        internal control framework implemented
        real-time disclosure procedures
        basic management setup
      `;

      const result = checkSOXCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('SOX-302');
    });

    it('should fail when real-time disclosure is missing', () => {
      const content = `
        internal control framework implemented
        management certification process
        delayed disclosure process
      `;

      const result = checkSOXCompliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('SOX-409');
    });
  });

  describe('checkISO27001Compliance', () => {
    it('should return failed for empty content', () => {
      const result = checkISO27001Compliance('');

      expect(result.standard).toBe('ISO27001');
      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('No content to validate');
    });

    it('should pass when all ISO27001 requirements are met', () => {
      const content = `
        access control policy documented
        cryptography policy implemented
        operational procedures defined
      `;

      const result = checkISO27001Compliance(content);

      expect(result.standard).toBe('ISO27001');
      expect(result.passed).toBe(true);
      expect(result.failedRequirements).toHaveLength(0);
    });

    it('should fail when access control policy is missing', () => {
      const content = `
        cryptography policy implemented
        operational procedures defined
        basic security setup
      `;

      const result = checkISO27001Compliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('ISO-27001-A.9.1');
    });

    it('should fail when cryptography policy is missing', () => {
      const content = `
        access control policy documented
        operational procedures defined
        basic encryption setup
      `;

      const result = checkISO27001Compliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('ISO-27001-A.10.1');
    });

    it('should fail when operational procedures are missing', () => {
      const content = `
        access control policy documented
        cryptography policy implemented
        basic operational setup
      `;

      const result = checkISO27001Compliance(content);

      expect(result.passed).toBe(false);
      expect(result.failedRequirements).toContain('ISO-27001-A.12.1');
    });
  });

  describe('getComplianceStandardDescription', () => {
    it('should return correct description for PCI-DSS', () => {
      const result = getComplianceStandardDescription('PCI-DSS');
      expect(result).toBe('Payment Card Industry Data Security Standard');
    });

    it('should return correct description for GDPR', () => {
      const result = getComplianceStandardDescription('GDPR');
      expect(result).toBe('General Data Protection Regulation');
    });

    it('should return correct description for HIPAA', () => {
      const result = getComplianceStandardDescription('HIPAA');
      expect(result).toBe('Health Insurance Portability and Accountability Act');
    });

    it('should return correct description for SOX', () => {
      const result = getComplianceStandardDescription('SOX');
      expect(result).toBe('Sarbanes-Oxley Act');
    });

    it('should return correct description for ISO27001', () => {
      const result = getComplianceStandardDescription('ISO27001');
      expect(result).toBe('ISO/IEC 27001 Information Security Management');
    });

    it('should return correct description for NIST', () => {
      const result = getComplianceStandardDescription('NIST');
      expect(result).toBe('National Institute of Standards and Technology');
    });

    it('should return correct description for CIS', () => {
      const result = getComplianceStandardDescription('CIS');
      expect(result).toBe('Center for Internet Security');
    });

    it('should return unknown for invalid standard', () => {
      const result = getComplianceStandardDescription('INVALID' as ComplianceStandard);
      expect(result).toBe('Unknown compliance standard');
    });
  });

  describe('getComplianceSeverity', () => {
    it('should return critical for PCI-DSS', () => {
      const result = getComplianceSeverity('PCI-DSS');
      expect(result).toBe('critical');
    });

    it('should return critical for GDPR', () => {
      const result = getComplianceSeverity('GDPR');
      expect(result).toBe('critical');
    });

    it('should return critical for HIPAA', () => {
      const result = getComplianceSeverity('HIPAA');
      expect(result).toBe('critical');
    });

    it('should return high for SOX', () => {
      const result = getComplianceSeverity('SOX');
      expect(result).toBe('high');
    });

    it('should return high for ISO27001', () => {
      const result = getComplianceSeverity('ISO27001');
      expect(result).toBe('high');
    });

    it('should return medium for NIST', () => {
      const result = getComplianceSeverity('NIST');
      expect(result).toBe('medium');
    });

    it('should return medium for CIS', () => {
      const result = getComplianceSeverity('CIS');
      expect(result).toBe('medium');
    });

    it('should return medium for invalid standard', () => {
      const result = getComplianceSeverity('INVALID' as ComplianceStandard);
      expect(result).toBe('medium');
    });
  });
});