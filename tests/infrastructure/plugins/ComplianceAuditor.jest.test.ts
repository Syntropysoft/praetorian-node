import { ComplianceAuditor } from '../../../src/infrastructure/plugins/ComplianceAuditor';
import { ValidationContext } from '../../../src/shared/types';

describe('ComplianceAuditor', () => {
  let complianceAuditor: ComplianceAuditor;
  let mockContext: ValidationContext;

  beforeEach(() => {
    complianceAuditor = new ComplianceAuditor();
    
    mockContext = {
      strict: false,
      ignoreKeys: [],
      requiredKeys: []
    };
  });

  describe('audit', () => {
    it('should run compliance audit and return result', async () => {
      const result = await complianceAuditor.audit(mockContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('COMPLIANCE_AUDIT_NOT_IMPLEMENTED');
      expect(result.warnings[0].message).toBe('Compliance audit not implemented yet');
      expect(result.warnings[0].severity).toBe('warning');
      expect(result.metadata).toEqual({
        auditType: 'compliance',
        rulesChecked: 0,
        rulesPassed: 0,
        rulesFailed: 0
      });
    });

    it('should return success true when no errors', async () => {
      const result = await complianceAuditor.audit(mockContext);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return success true when no errors (current implementation)', async () => {
      // Current implementation always returns success=true since private methods are not called
      const result = await complianceAuditor.audit(mockContext);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
    });

    it('should handle empty context', async () => {
      const emptyContext: ValidationContext = {
        strict: false,
        ignoreKeys: [],
        requiredKeys: []
      };

      const result = await complianceAuditor.audit(emptyContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with strict mode enabled', async () => {
      const strictContext: ValidationContext = {
        strict: true,
        ignoreKeys: [],
        requiredKeys: []
      };

      const result = await complianceAuditor.audit(strictContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with ignore keys', async () => {
      const contextWithIgnore: ValidationContext = {
        strict: false,
        ignoreKeys: ['temp', 'cache'],
        requiredKeys: []
      };

      const result = await complianceAuditor.audit(contextWithIgnore);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with required keys', async () => {
      const contextWithRequired: ValidationContext = {
        strict: false,
        ignoreKeys: [],
        requiredKeys: ['id', 'name']
      };

      const result = await complianceAuditor.audit(contextWithRequired);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return consistent metadata structure', async () => {
      const result = await complianceAuditor.audit(mockContext);
      
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.auditType).toBe('compliance');
      expect(typeof result.metadata!.rulesChecked).toBe('number');
      expect(typeof result.metadata!.rulesPassed).toBe('number');
      expect(typeof result.metadata!.rulesFailed).toBe('number');
    });

    it('should be async and return a Promise', () => {
      const result = complianceAuditor.audit(mockContext);
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle multiple concurrent audits', async () => {
      const audits = [
        complianceAuditor.audit(mockContext),
        complianceAuditor.audit(mockContext),
        complianceAuditor.audit(mockContext)
      ];

      const results = await Promise.all(audits);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.warnings).toHaveLength(1);
      });
    });
  });

  describe('private methods', () => {
    describe('checkRequiredFields', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (complianceAuditor as any).checkRequiredFields(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config with all required fields', () => {
        const config = {
          name: 'test',
          version: '1.0.0',
          description: 'Test configuration'
        };
        const result = (complianceAuditor as any).checkRequiredFields(config);
        
        expect(result).toEqual([]);
      });

      it('should handle nested objects', () => {
        const config = {
          database: {
            host: 'localhost',
            port: 5432
          },
          api: {
            timeout: 5000
          }
        };
        const result = (complianceAuditor as any).checkRequiredFields(config);
        
        expect(result).toEqual([]);
      });

      it('should handle arrays', () => {
        const config = {
          servers: ['server1', 'server2'],
          ports: [8080, 8081]
        };
        const result = (complianceAuditor as any).checkRequiredFields(config);
        
        expect(result).toEqual([]);
      });

      it('should handle null and undefined values', () => {
        const config = {
          value1: null,
          value2: undefined,
          value3: ''
        };
        const result = (complianceAuditor as any).checkRequiredFields(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('checkFormatCompliance', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (complianceAuditor as any).checkFormatCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for properly formatted config', () => {
        const config = {
          name: 'test',
          version: '1.0.0',
          description: 'Test configuration'
        };
        const result = (complianceAuditor as any).checkFormatCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should handle nested configuration objects', () => {
        const config = {
          server: {
            host: 'localhost',
            port: 8080,
            ssl: {
              enabled: true,
              cert: '/path/to/cert'
            }
          }
        };
        const result = (complianceAuditor as any).checkFormatCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should handle arrays in configuration', () => {
        const config = {
          endpoints: [
            { name: 'api', url: '/api' },
            { name: 'health', url: '/health' }
          ],
          middleware: ['auth', 'logging']
        };
        const result = (complianceAuditor as any).checkFormatCompliance(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('checkRegulatoryCompliance', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (complianceAuditor as any).checkRegulatoryCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for compliant config', () => {
        const config = {
          privacy: {
            gdpr: {
              enabled: true,
              dataRetention: '30 days'
            }
          },
          security: {
            iso27001: {
              certified: true
            }
          }
        };
        const result = (complianceAuditor as any).checkRegulatoryCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should handle GDPR compliance configuration', () => {
        const config = {
          gdpr: {
            dataProcessing: {
              lawfulBasis: 'consent',
              dataSubjects: ['customers', 'employees'],
              dataCategories: ['personal', 'sensitive']
            },
            dataProtection: {
              encryption: true,
              accessControl: 'role-based',
              auditLogging: true
            }
          }
        };
        const result = (complianceAuditor as any).checkRegulatoryCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should handle SOC2 compliance configuration', () => {
        const config = {
          soc2: {
            availability: {
              monitoring: true,
              backup: true,
              disasterRecovery: true
            },
            security: {
              accessControl: true,
              encryption: true,
              monitoring: true
            }
          }
        };
        const result = (complianceAuditor as any).checkRegulatoryCompliance(config);
        
        expect(result).toEqual([]);
      });

      it('should handle ISO27001 compliance configuration', () => {
        const config = {
          iso27001: {
            informationSecurity: {
              policy: true,
              riskAssessment: true,
              controls: true
            },
            management: {
              roles: true,
              responsibilities: true,
              training: true
            }
          }
        };
        const result = (complianceAuditor as any).checkRegulatoryCompliance(config);
        
        expect(result).toEqual([]);
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle audit with complex context', async () => {
      const complexContext: ValidationContext = {
        strict: true,
        ignoreKeys: ['temp', 'cache', 'debug'],
        requiredKeys: ['id', 'name', 'version', 'description']
      };

      const result = await complianceAuditor.audit(complexContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should maintain immutability of context', async () => {
      const originalContext = { ...mockContext };
      
      await complianceAuditor.audit(mockContext);
      
      expect(mockContext).toEqual(originalContext);
    });

    it('should handle very large context objects', async () => {
      const largeContext: ValidationContext = {
        strict: false,
        ignoreKeys: Array.from({ length: 100 }, (_, i) => `key${i}`),
        requiredKeys: Array.from({ length: 50 }, (_, i) => `required${i}`)
      };

      const result = await complianceAuditor.audit(largeContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle concurrent audits with different contexts', async () => {
      const contexts = [
        { strict: false, ignoreKeys: [], requiredKeys: [] },
        { strict: true, ignoreKeys: ['temp'], requiredKeys: ['id'] },
        { strict: false, ignoreKeys: ['cache', 'debug'], requiredKeys: ['name', 'version'] }
      ];

      const audits = contexts.map(context => complianceAuditor.audit(context));
      const results = await Promise.all(audits);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metadata!.auditType).toBe('compliance');
      });
    });

    it('should handle different compliance standards in same audit', async () => {
      const result = await complianceAuditor.audit(mockContext);
      
      expect(result.metadata!.auditType).toBe('compliance');
      expect(result.warnings[0].code).toBe('COMPLIANCE_AUDIT_NOT_IMPLEMENTED');
    });
  });
});
