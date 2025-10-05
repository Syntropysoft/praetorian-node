/**
 * Pattern Types Tests
 * 
 * Tests for pattern matching type definitions
 */

import { 
  PatternRule, 
  PatternMatchingContext, 
  PatternMatchingOptions, 
  PatternMatchingResult,
  PatternValidationResult,
  PatternType 
} from '../../../src/shared/types/pattern';

describe('Pattern Types', () => {
  describe('PatternRule interface', () => {
    it('should create a valid PatternRule', () => {
      const rule: PatternRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test pattern rule',
        pattern: '^test$',
        targetPath: 'config.value',
        required: true,
        severity: 'error',
        message: 'Custom error message',
        flags: 'i'
      };

      expect(rule.id).toBe('test-rule');
      expect(rule.name).toBe('Test Rule');
      expect(rule.description).toBe('Test pattern rule');
      expect(rule.pattern).toBe('^test$');
      expect(rule.targetPath).toBe('config.value');
      expect(rule.required).toBe(true);
      expect(rule.severity).toBe('error');
      expect(rule.message).toBe('Custom error message');
      expect(rule.flags).toBe('i');
    });

    it('should create a minimal PatternRule', () => {
      const rule: PatternRule = {
        id: 'minimal-rule',
        name: 'Minimal Rule',
        description: 'Minimal pattern rule',
        pattern: '^minimal$',
        severity: 'warning'
      };

      expect(rule.id).toBe('minimal-rule');
      expect(rule.name).toBe('Minimal Rule');
      expect(rule.description).toBe('Minimal pattern rule');
      expect(rule.pattern).toBe('^minimal$');
      expect(rule.severity).toBe('warning');
      expect(rule.targetPath).toBeUndefined();
      expect(rule.required).toBeUndefined();
      expect(rule.message).toBeUndefined();
      expect(rule.flags).toBeUndefined();
    });
  });

  describe('PatternMatchingContext interface', () => {
    it('should create a valid PatternMatchingContext', () => {
      const options: PatternMatchingOptions = {
        stopOnFirstError: true,
        includeWarnings: false,
        validateAllPatterns: true,
        customRules: []
      };

      const context: PatternMatchingContext = {
        filePath: '/path/to/config.yaml',
        options,
        customValidators: {
        customValidator: (value: any, ctx: PatternMatchingContext) => ({
          success: true,
          errors: [],
          warnings: []
        })
        }
      };

      expect(context.filePath).toBe('/path/to/config.yaml');
      expect(context.options).toBe(options);
      expect(context.customValidators).toBeDefined();
      expect(context.customValidators?.customValidator).toBeDefined();
    });
  });

  describe('PatternMatchingOptions interface', () => {
    it('should create a valid PatternMatchingOptions', () => {
      const options: PatternMatchingOptions = {
        stopOnFirstError: true,
        includeWarnings: false,
        validateAllPatterns: true,
        customRules: [
          {
            id: 'custom-rule',
            name: 'Custom Rule',
            description: 'Custom pattern rule',
            pattern: '^custom$',
            severity: 'error'
          }
        ]
      };

      expect(options.stopOnFirstError).toBe(true);
      expect(options.includeWarnings).toBe(false);
      expect(options.validateAllPatterns).toBe(true);
      expect(options.customRules).toHaveLength(1);
      expect(options.customRules?.[0].id).toBe('custom-rule');
    });
  });

  describe('PatternMatchingResult interface', () => {
    it('should create a valid PatternMatchingResult', () => {
      const result: PatternMatchingResult = {
        valid: true,
        errors: [],
        warnings: [],
        results: [],
        summary: {
          total: 5,
          passed: 5,
          failed: 0,
          warnings: 0
        }
      };

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.results).toHaveLength(0);
      expect(result.summary.total).toBe(5);
      expect(result.summary.passed).toBe(5);
      expect(result.summary.failed).toBe(0);
      expect(result.summary.warnings).toBe(0);
    });
  });

  describe('PatternValidationResult interface', () => {
    it('should create a valid PatternValidationResult', () => {
      const rule: PatternRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test pattern rule',
        pattern: '^test$',
        severity: 'error'
      };

      const result: PatternValidationResult = {
        rule,
        matched: true,
        testedValue: 'test',
        path: 'config.value'
      };

      expect(result.rule).toBe(rule);
      expect(result.matched).toBe(true);
      expect(result.testedValue).toBe('test');
      expect(result.path).toBe('config.value');
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('PatternType enum', () => {
    it('should have all expected pattern types', () => {
      expect(PatternType.EMAIL).toBe('email');
      expect(PatternType.URL).toBe('url');
      expect(PatternType.PHONE).toBe('phone');
      expect(PatternType.UUID).toBe('uuid');
      expect(PatternType.VERSION).toBe('version');
      expect(PatternType.SEMVER).toBe('semver');
      expect(PatternType.IPV4).toBe('ipv4');
      expect(PatternType.IPV6).toBe('ipv6');
      expect(PatternType.HOSTNAME).toBe('hostname');
      expect(PatternType.PORT).toBe('port');
      expect(PatternType.PATH).toBe('path');
      expect(PatternType.JSON).toBe('json');
      expect(PatternType.YAML).toBe('yaml');
      expect(PatternType.XML).toBe('xml');
      expect(PatternType.BASE64).toBe('base64');
      expect(PatternType.HEX).toBe('hex');
      expect(PatternType.ALPHANUMERIC).toBe('alphanumeric');
      expect(PatternType.NUMERIC).toBe('numeric');
      expect(PatternType.ALPHA).toBe('alpha');
      expect(PatternType.CUSTOM).toBe('custom');
    });

    it('should have unique values', () => {
      const values = Object.values(PatternType);
      const uniqueValues = new Set(values);
      expect(values).toHaveLength(uniqueValues.size);
    });
  });
});
