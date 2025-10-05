import { PerformanceAuditor } from '../../../src/infrastructure/plugins/PerformanceAuditor';
import { ValidationContext } from '../../../src/shared/types';

describe('PerformanceAuditor', () => {
  let performanceAuditor: PerformanceAuditor;
  let mockContext: ValidationContext;

  beforeEach(() => {
    performanceAuditor = new PerformanceAuditor();
    
    mockContext = {
      strict: false,
      ignoreKeys: [],
      requiredKeys: []
    };
  });

  describe('audit', () => {
    it('should run performance audit and return result', async () => {
      const result = await performanceAuditor.audit(mockContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('PERFORMANCE_AUDIT_NOT_IMPLEMENTED');
      expect(result.warnings[0].message).toBe('Performance audit not implemented yet');
      expect(result.warnings[0].severity).toBe('warning');
      expect(result.metadata).toEqual({
        auditType: 'performance',
        rulesChecked: 0,
        rulesPassed: 0,
        rulesFailed: 0
      });
    });

    it('should return success true when no errors', async () => {
      const result = await performanceAuditor.audit(mockContext);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return success true when no errors (current implementation)', async () => {
      // Current implementation always returns success=true since private methods are not called
      const result = await performanceAuditor.audit(mockContext);
      
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

      const result = await performanceAuditor.audit(emptyContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with strict mode enabled', async () => {
      const strictContext: ValidationContext = {
        strict: true,
        ignoreKeys: [],
        requiredKeys: []
      };

      const result = await performanceAuditor.audit(strictContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with ignore keys', async () => {
      const contextWithIgnore: ValidationContext = {
        strict: false,
        ignoreKeys: ['temp', 'cache'],
        requiredKeys: []
      };

      const result = await performanceAuditor.audit(contextWithIgnore);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle context with required keys', async () => {
      const contextWithRequired: ValidationContext = {
        strict: false,
        ignoreKeys: [],
        requiredKeys: ['id', 'name']
      };

      const result = await performanceAuditor.audit(contextWithRequired);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return consistent metadata structure', async () => {
      const result = await performanceAuditor.audit(mockContext);
      
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.auditType).toBe('performance');
      expect(typeof result.metadata!.rulesChecked).toBe('number');
      expect(typeof result.metadata!.rulesPassed).toBe('number');
      expect(typeof result.metadata!.rulesFailed).toBe('number');
    });

    it('should be async and return a Promise', () => {
      const result = performanceAuditor.audit(mockContext);
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should handle multiple concurrent audits', async () => {
      const audits = [
        performanceAuditor.audit(mockContext),
        performanceAuditor.audit(mockContext),
        performanceAuditor.audit(mockContext)
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
    describe('checkDatabasePoolConfig', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (performanceAuditor as any).checkDatabasePoolConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config without database pool', () => {
        const config = {
          name: 'test',
          version: '1.0.0'
        };
        const result = (performanceAuditor as any).checkDatabasePoolConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle database pool configuration', () => {
        const config = {
          database: {
            pool: {
              min: 5,
              max: 20,
              idle: 10000,
              acquire: 30000
            }
          }
        };
        const result = (performanceAuditor as any).checkDatabasePoolConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle multiple database configurations', () => {
        const config = {
          databases: {
            primary: {
              pool: { min: 5, max: 20 }
            },
            secondary: {
              pool: { min: 2, max: 10 }
            }
          }
        };
        const result = (performanceAuditor as any).checkDatabasePoolConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle nested database pool settings', () => {
        const config = {
          services: {
            userService: {
              database: {
                pool: {
                  connections: {
                    min: 5,
                    max: 20
                  }
                }
              }
            }
          }
        };
        const result = (performanceAuditor as any).checkDatabasePoolConfig(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('checkCachingConfig', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (performanceAuditor as any).checkCachingConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config without caching', () => {
        const config = {
          name: 'test',
          version: '1.0.0'
        };
        const result = (performanceAuditor as any).checkCachingConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle Redis cache configuration', () => {
        const config = {
          cache: {
            redis: {
              host: 'localhost',
              port: 6379,
              ttl: 3600,
              maxMemory: '256mb'
            }
          }
        };
        const result = (performanceAuditor as any).checkCachingConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle in-memory cache configuration', () => {
        const config = {
          cache: {
            memory: {
              maxSize: 1000,
              ttl: 300
            }
          }
        };
        const result = (performanceAuditor as any).checkCachingConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle multiple cache layers', () => {
        const config = {
          caching: {
            l1: {
              type: 'memory',
              size: 1000
            },
            l2: {
              type: 'redis',
              host: 'cache-server'
            }
          }
        };
        const result = (performanceAuditor as any).checkCachingConfig(config);
        
        expect(result).toEqual([]);
      });
    });

    describe('checkTimeoutConfig', () => {
      it('should return empty array for empty config', () => {
        const config = {};
        const result = (performanceAuditor as any).checkTimeoutConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should return empty array for config without timeouts', () => {
        const config = {
          name: 'test',
          version: '1.0.0'
        };
        const result = (performanceAuditor as any).checkTimeoutConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle API timeout configuration', () => {
        const config = {
          api: {
            timeout: {
              request: 30000,
              response: 60000
            }
          }
        };
        const result = (performanceAuditor as any).checkTimeoutConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle database timeout configuration', () => {
        const config = {
          database: {
            timeouts: {
              connection: 10000,
              query: 30000,
              idle: 600000
            }
          }
        };
        const result = (performanceAuditor as any).checkTimeoutConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle service timeout configuration', () => {
        const config = {
          services: {
            external: {
              timeouts: {
                connect: 5000,
                read: 15000,
                total: 30000
              }
            }
          }
        };
        const result = (performanceAuditor as any).checkTimeoutConfig(config);
        
        expect(result).toEqual([]);
      });

      it('should handle HTTP timeout configuration', () => {
        const config = {
          http: {
            client: {
              timeout: 30000,
              keepAlive: 30000
            },
            server: {
              timeout: 60000,
              headersTimeout: 65000
            }
          }
        };
        const result = (performanceAuditor as any).checkTimeoutConfig(config);
        
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

      const result = await performanceAuditor.audit(complexContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should maintain immutability of context', async () => {
      const originalContext = { ...mockContext };
      
      await performanceAuditor.audit(mockContext);
      
      expect(mockContext).toEqual(originalContext);
    });

    it('should handle very large context objects', async () => {
      const largeContext: ValidationContext = {
        strict: false,
        ignoreKeys: Array.from({ length: 100 }, (_, i) => `key${i}`),
        requiredKeys: Array.from({ length: 50 }, (_, i) => `required${i}`)
      };

      const result = await performanceAuditor.audit(largeContext);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle concurrent audits with different contexts', async () => {
      const contexts = [
        { strict: false, ignoreKeys: [], requiredKeys: [] },
        { strict: true, ignoreKeys: ['temp'], requiredKeys: ['id'] },
        { strict: false, ignoreKeys: ['cache', 'debug'], requiredKeys: ['name', 'version'] }
      ];

      const audits = contexts.map(context => performanceAuditor.audit(context));
      const results = await Promise.all(audits);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.metadata!.auditType).toBe('performance');
      });
    });

    it('should handle performance-specific configurations', async () => {
      const result = await performanceAuditor.audit(mockContext);
      
      expect(result.metadata!.auditType).toBe('performance');
      expect(result.warnings[0].code).toBe('PERFORMANCE_AUDIT_NOT_IMPLEMENTED');
    });
  });
});
