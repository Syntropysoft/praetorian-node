import { SecurityAuditor } from '../../../src/infrastructure/plugins/SecurityAuditor';
import { ValidationContext } from '../../../src/shared/types';

describe('SecurityAuditor', () => {
  let securityAuditor: SecurityAuditor;
  let mockContext: ValidationContext;

  beforeEach(() => {
    securityAuditor = new SecurityAuditor();
    
    mockContext = {
      strict: false,
      ignoreKeys: [],
      requiredKeys: []
    };
  });

  describe('audit', () => {
    it('should run security audit and return result', async () => {
      const result = await securityAuditor.audit(mockContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('SECURITY_AUDIT_NOT_IMPLEMENTED');
      expect(result.warnings[0].message).toBe('Security audit not implemented yet');
      expect(result.warnings[0].severity).toBe('warning');
      expect(result.metadata).toEqual({
        auditType: 'security',
        rulesChecked: 0,
        rulesPassed: 0,
        rulesFailed: 0
      });
    });

    it('should return success true when no errors', async () => {
      const result = await securityAuditor.audit(mockContext);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return success true when no errors (current implementation)', async () => {
      // Current implementation always returns success=true since private methods are not called
      const result = await securityAuditor.audit(mockContext);
      
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

      const result = await securityAuditor.audit(emptyContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with strict mode enabled', async () => {
      const strictContext: ValidationContext = {
        strict: true,
        ignoreKeys: [],
        requiredKeys: []
      };

      const result = await securityAuditor.audit(strictContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with ignore keys', async () => {
      const contextWithIgnore: ValidationContext = {
        strict: false,
        ignoreKeys: ['temp', 'cache'],
        requiredKeys: []
      };

      const result = await securityAuditor.audit(contextWithIgnore);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with required keys', async () => {
      const contextWithRequired: ValidationContext = {
        strict: false,
        ignoreKeys: [],
        requiredKeys: ['id', 'name']
      };

      const result = await securityAuditor.audit(contextWithRequired);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return consistent metadata structure', async () => {
      const result = await securityAuditor.audit(mockContext);
      
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.auditType).toBe('security');
      expect(typeof result.metadata!.rulesChecked).toBe('number');
      expect(typeof result.metadata!.rulesPassed).toBe('number');
      expect(typeof result.metadata!.rulesFailed).toBe('number');
    });

    it('should be async and return a Promise', () => {
      const result = securityAuditor.audit(mockContext);
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle multiple concurrent audits', async () => {
      const audits = [
        securityAuditor.audit(mockContext),
        securityAuditor.audit(mockContext),
        securityAuditor.audit(mockContext)
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
    describe('checkForHardcodedSecrets', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (securityAuditor as any).checkForHardcodedSecrets(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config without secrets', () => {
        const config = {
          name: 'test',
          version: '1.0.0',
          description: 'Test configuration'
        };
        const result = (securityAuditor as any).checkForHardcodedSecrets(config);
        
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
        const result = (securityAuditor as any).checkForHardcodedSecrets(config);
        
        expect(result).toEqual([]);
      });

      it('should handle arrays', () => {
        const config = {
          servers: ['server1', 'server2'],
          ports: [8080, 8081]
        };
        const result = (securityAuditor as any).checkForHardcodedSecrets(config);
        
        expect(result).toEqual([]);
      });

      it('should handle null and undefined values', () => {
        const config = {
          value1: null,
          value2: undefined,
          value3: ''
        };
        const result = (securityAuditor as any).checkForHardcodedSecrets(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('checkSecurityHeaders', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (securityAuditor as any).checkSecurityHeaders(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config without headers', () => {
        const config = {
          name: 'test',
          version: '1.0.0'
        };
        const result = (securityAuditor as any).checkSecurityHeaders(config);
        
        expect(result).toEqual([]);
      });

      it('should handle nested header configuration', () => {
        const config = {
          server: {
            headers: {
              'X-Frame-Options': 'DENY',
              'X-Content-Type-Options': 'nosniff'
            }
          }
        };
        const result = (securityAuditor as any).checkSecurityHeaders(config);
        
        expect(result).toEqual([]);
      });

      it('should handle arrays in header config', () => {
        const config = {
          headers: ['header1', 'header2'],
          security: {
            enabled: true
          }
        };
        const result = (securityAuditor as any).checkSecurityHeaders(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('checkCORSConfiguration', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (securityAuditor as any).checkCORSConfiguration(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config without CORS', () => {
        const config = {
          name: 'test',
          version: '1.0.0'
        };
        const result = (securityAuditor as any).checkCORSConfiguration(config);
        
        expect(result).toEqual([]);
      });

      it('should handle CORS configuration object', () => {
        const config = {
          cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type']
          }
        };
        const result = (securityAuditor as any).checkCORSConfiguration(config);
        
        expect(result).toEqual([]);
      });

      it('should handle nested CORS configuration', () => {
        const config = {
          server: {
            security: {
              cors: {
                enabled: true,
                origin: 'https://example.com'
              }
            }
          }
        };
        const result = (securityAuditor as any).checkCORSConfiguration(config);
        
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

      const result = await securityAuditor.audit(complexContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should maintain immutability of context', async () => {
      const originalContext = { ...mockContext };
      
      await securityAuditor.audit(mockContext);
      
      expect(mockContext).toEqual(originalContext);
    });

    it('should handle very large context objects', async () => {
      const largeContext: ValidationContext = {
        strict: false,
        ignoreKeys: Array.from({ length: 100 }, (_, i) => `key${i}`),
        requiredKeys: Array.from({ length: 50 }, (_, i) => `required${i}`)
      };

      const result = await securityAuditor.audit(largeContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle concurrent audits with different contexts', async () => {
      const contexts = [
        { strict: false, ignoreKeys: [], requiredKeys: [] },
        { strict: true, ignoreKeys: ['temp'], requiredKeys: ['id'] },
        { strict: false, ignoreKeys: ['cache', 'debug'], requiredKeys: ['name', 'version'] }
      ];

      const audits = contexts.map(context => securityAuditor.audit(context));
      const results = await Promise.all(audits);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metadata!.auditType).toBe('security');
      });
    });
  });
});
