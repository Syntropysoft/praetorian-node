/**
 * @file tests/integration/validation-engine.integration.test.ts
 * @description Integration tests for the functional validation engine
 */

import {
  validate,
  validateRule,
  applyRuleByType,
  validateStructureRule,
  validateFormatRule,
  ValidationInput,
  ValidationOutput,
} from '../../src/application/validation/ValidationEngine';
import { PraetorianRule } from '../../src/shared/types/rules';

describe('Functional Validation Engine Integration Tests', () => {
  describe('Main Validation Function', () => {
    it('should validate data with multiple rules', () => {
      const rules: PraetorianRule[] = [
        {
          id: 'required-version',
          name: 'Version Required',
          description: 'Ensures version field is present',
          type: 'structure',
          severity: 'error',
          enabled: true,
          category: 'structure',
          requiredProperties: ['version'],
        },
        {
          id: 'version-format',
          name: 'Version Format',
          description: 'Validates version format',
          type: 'format',
          severity: 'warning',
          enabled: true,
          category: 'format',
          format: 'semver',
          propertyPath: 'version',
          required: true,
        },
      ];

      const input: ValidationInput = {
        data: { version: '1.0.0' },
        rules,
      };

      const result = validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.rulesApplied).toBe(2);
      expect(result.metadata.rulesPassed).toBe(2);
      expect(result.metadata.rulesFailed).toBe(0);
    });

    it('should handle validation failures', () => {
      const rules: PraetorianRule[] = [
        {
          id: 'required-version',
          name: 'Version Required',
          description: 'Ensures version field is present',
          type: 'structure',
          severity: 'error',
          enabled: true,
          category: 'structure',
          requiredProperties: ['version'],
        },
      ];

      const input: ValidationInput = {
        data: { name: 'test' }, // Missing version
        rules,
      };

      const result = validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('MISSING_REQUIRED_PROPERTY');
      expect(result.errors[0].message).toContain('version');
    });

    it('should skip disabled rules', () => {
      const rules: PraetorianRule[] = [
        {
          id: 'disabled-rule',
          name: 'Disabled Rule',
          description: 'This rule is disabled',
          type: 'structure',
          severity: 'error',
          enabled: false,
          category: 'structure',
          requiredProperties: ['version'],
        },
      ];

      const input: ValidationInput = {
        data: { name: 'test' },
        rules,
      };

      const result = validate(input);

      expect(result.valid).toBe(true);
      expect(result.metadata.rulesApplied).toBe(0);
    });

    it('should handle empty input gracefully', () => {
      const result = validate({} as ValidationInput);

      expect(result.valid).toBe(true);
      expect(result.metadata.rulesApplied).toBe(0);
    });
  });

  describe('Structure Rule Validation', () => {
    it('should validate required properties', () => {
      const rule: any = {
        id: 'test-rule',
        severity: 'error',
        requiredProperties: ['name', 'version'],
      };

      const data = { name: 'test', version: '1.0.0' };
      const result = validateStructureRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required properties', () => {
      const rule: any = {
        id: 'test-rule',
        severity: 'error',
        requiredProperties: ['name', 'version'],
      };

      const data = { name: 'test' }; // Missing version
      const result = validateStructureRule(rule, data);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('version');
    });

    it('should validate forbidden properties', () => {
      const rule: any = {
        id: 'test-rule',
        severity: 'error',
        forbiddenProperties: ['password', 'secret'],
      };

      const data = { name: 'test', password: 'secret123' };
      const result = validateStructureRule(rule, data);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('password');
    });

    it('should validate object depth', () => {
      const rule: any = {
        id: 'test-rule',
        severity: 'warning',
        maxDepth: 2,
      };

      const data = {
        level1: {
          level2: {
            level3: 'too deep'
          }
        }
      };

      const result = validateStructureRule(rule, data);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('depth');
    });

    it('should handle non-object data', () => {
      const rule: any = {
        id: 'test-rule',
        severity: 'error',
        requiredProperties: ['name'],
      };

      const result = validateStructureRule(rule, 'not an object');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('object');
    });
  });

  describe('Format Rule Validation', () => {
    it('should validate email format', () => {
      const rule: any = {
        id: 'email-rule',
        severity: 'error',
        format: 'email',
        propertyPath: 'email',
      };

      const data = { email: 'test@example.com' };
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid email format', () => {
      const rule: any = {
        id: 'email-rule',
        severity: 'error',
        format: 'email',
        propertyPath: 'email',
      };

      const data = { email: 'invalid-email' };
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_FORMAT');
      expect(result.errors[0].message).toContain('format');
    });

    it('should validate URI format', () => {
      const rule: any = {
        id: 'uri-rule',
        severity: 'error',
        format: 'uri',
        propertyPath: 'url',
      };

      const data = { url: 'https://example.com' };
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should validate semver format', () => {
      const rule: any = {
        id: 'semver-rule',
        severity: 'warning',
        format: 'semver',
        propertyPath: 'version',
      };

      const data = { version: '1.2.3' };
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should validate regex patterns', () => {
      const rule: any = {
        id: 'pattern-rule',
        severity: 'error',
        pattern: '^[A-Z][a-z]+$',
        propertyPath: 'name',
      };

      const data = { name: 'John' };
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should handle required fields', () => {
      const rule: any = {
        id: 'required-rule',
        severity: 'error',
        format: 'string',
        propertyPath: 'name',
        required: true,
      };

      const data = {}; // Missing name
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('REQUIRED_FIELD_MISSING');
      expect(result.errors[0].message).toContain('missing');
    });

    it('should skip validation for optional missing fields', () => {
      const rule: any = {
        id: 'optional-rule',
        severity: 'error',
        format: 'string',
        propertyPath: 'name',
        required: false,
      };

      const data = {}; // Missing name
      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Nested Property Validation', () => {
    it('should validate nested properties', () => {
      const rule: any = {
        id: 'nested-rule',
        severity: 'error',
        format: 'string',
        propertyPath: 'database.host',
        required: true,
      };

      const data = {
        database: {
          host: 'localhost',
          port: 5432
        }
      };

      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing nested properties', () => {
      const rule: any = {
        id: 'nested-rule',
        severity: 'error',
        format: 'string',
        propertyPath: 'database.host',
        required: true,
      };

      const data = {
        database: {
          port: 5432
        }
      };

      const result = validateFormatRule(rule, data);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('host');
    });
  });

  describe('Rule Type Application', () => {
    it('should apply structure rules correctly', () => {
      const rule: any = {
        id: 'structure-rule',
        type: 'structure',
        severity: 'error',
        requiredProperties: ['name'],
      };

      const data = { name: 'test' };
      const result = applyRuleByType(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should apply format rules correctly', () => {
      const rule: any = {
        id: 'format-rule',
        type: 'format',
        severity: 'error',
        format: 'email',
        propertyPath: 'email',
      };

      const data = { email: 'test@example.com' };
      const result = applyRuleByType(rule, data);

      expect(result.errors).toHaveLength(0);
    });

    it('should handle unknown rule types', () => {
      const rule: any = {
        id: 'unknown-rule',
        type: 'unknown',
        severity: 'error',
      };

      const data = { test: 'value' };
      const result = applyRuleByType(rule, data);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('UNKNOWN_RULE_TYPE');
      expect(result.errors[0].message).toContain('Rule type');
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle multiple validation failures', () => {
      const rules: PraetorianRule[] = [
        {
          id: 'required-name',
          name: 'Name Required',
          description: 'Name is required',
          type: 'structure',
          severity: 'error',
          enabled: true,
          category: 'structure',
          requiredProperties: ['name'],
        },
        {
          id: 'email-format',
          name: 'Email Format',
          description: 'Email must be valid',
          type: 'format',
          severity: 'error',
          enabled: true,
          category: 'format',
          format: 'email',
          propertyPath: 'email',
          required: true,
        },
        {
          id: 'no-password',
          name: 'No Password',
          description: 'Password field not allowed',
          type: 'structure',
          severity: 'warning',
          enabled: true,
          category: 'security',
          forbiddenProperties: ['password'],
        },
      ];

      const input: ValidationInput = {
        data: {
          email: 'invalid-email',
          password: 'secret123'
        },
        rules,
      };

      const result = validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      
      // Should have error for missing name
      expect(result.errors.some(e => e.message.includes('name'))).toBe(true);
      
      // Should have error for invalid email
      expect(result.errors.some(e => e.message.includes('format'))).toBe(true);
      
      // Should have warning for forbidden password
      expect(result.warnings.some(w => w.message.includes('password'))).toBe(true);
    });

    it('should handle null and undefined data', () => {
      const rules: PraetorianRule[] = [
        {
          id: 'required-field',
          name: 'Required Field',
          description: 'Field is required',
          type: 'structure',
          severity: 'error',
          enabled: true,
          category: 'structure',
          requiredProperties: ['field'],
        },
      ];

      // Test with null
      const resultNull = validate({
        data: null,
        rules,
      });

      expect(resultNull.valid).toBe(false);
      expect(resultNull.errors[0].code).toBe('NO_DATA');
      expect(resultNull.errors[0].message).toContain('null or undefined');

      // Test with undefined
      const resultUndefined = validate({
        data: undefined,
        rules,
      });

      expect(resultUndefined.valid).toBe(false);
      expect(resultUndefined.errors[0].code).toBe('NO_DATA');
      expect(resultUndefined.errors[0].message).toContain('null or undefined');
    });
  });
});
