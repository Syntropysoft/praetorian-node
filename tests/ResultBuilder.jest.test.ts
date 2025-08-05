import { ResultBuilder } from '../src/shared/utils/ResultBuilder';
import { ValidationResult } from '../src/shared/types';

describe('ResultBuilder', () => {
  let resultBuilder: ResultBuilder;
  let mockStartTime: number;

  beforeEach(() => {
    resultBuilder = new ResultBuilder();
    mockStartTime = Date.now();
  });

  describe('buildValidationResult', () => {
    it('should build successful result when no errors', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: { rulesChecked: 2, rulesPassed: 2, rulesFailed: 0 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 1, mockStartTime, true);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        pluginsChecked: 1,
        rulesChecked: 2,
        rulesPassed: 2,
        rulesFailed: 0,
        strict: true
      });
    });

    it('should build failed result when errors exist and strict mode is true', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [{ code: 'ERROR1', message: 'Error 1', severity: 'error' }],
          warnings: [],
          metadata: { rulesChecked: 1, rulesPassed: 0, rulesFailed: 1 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 1, mockStartTime, true);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('ERROR1');
      expect(result.metadata!.strict).toBe(true);
    });

    it('should build successful result when errors exist but strict mode is false', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [{ code: 'ERROR1', message: 'Error 1', severity: 'error' }],
          warnings: [],
          metadata: { rulesChecked: 1, rulesPassed: 0, rulesFailed: 1 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 1, mockStartTime, false);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.metadata!.strict).toBe(false);
    });

    it('should aggregate multiple plugin results correctly', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [{ code: 'WARN1', message: 'Warning 1', severity: 'warning' }],
          metadata: { rulesChecked: 2, rulesPassed: 2, rulesFailed: 0 }
        },
        {
          success: false,
          errors: [{ code: 'ERROR1', message: 'Error 1', severity: 'error' }],
          warnings: [{ code: 'WARN2', message: 'Warning 2', severity: 'warning' }],
          metadata: { rulesChecked: 1, rulesPassed: 0, rulesFailed: 1 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 2, mockStartTime, true);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(2);
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        pluginsChecked: 2,
        rulesChecked: 3,
        rulesPassed: 2,
        rulesFailed: 1,
        strict: true
      });
    });

    it('should handle results without metadata gracefully', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: undefined
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 1, mockStartTime, false);

      expect(result.success).toBe(true);
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        pluginsChecked: 1,
        rulesChecked: 0,
        rulesPassed: 0,
        rulesFailed: 0,
        strict: false
      });
    });

    it('should handle empty results array', () => {
      const results: ValidationResult[] = [];

      const result = resultBuilder.buildValidationResult(results, 0, mockStartTime, true);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        pluginsChecked: 0,
        rulesChecked: 0,
        rulesPassed: 0,
        rulesFailed: 0,
        strict: true
      });
    });

    it('should handle results with partial metadata', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: { rulesChecked: 5 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 1, mockStartTime, false);

      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        pluginsChecked: 1,
        rulesChecked: 5,
        rulesPassed: 0,
        rulesFailed: 0,
        strict: false
      });
    });

    it('should handle multiple errors from different plugins', () => {
      const results: ValidationResult[] = [
        {
          success: false,
          errors: [{ code: 'ERROR1', message: 'Error 1', severity: 'error' }],
          warnings: [],
          metadata: { rulesChecked: 1, rulesPassed: 0, rulesFailed: 1 }
        },
        {
          success: false,
          errors: [
            { code: 'ERROR2', message: 'Error 2', severity: 'error' },
            { code: 'ERROR3', message: 'Error 3', severity: 'error' }
          ],
          warnings: [],
          metadata: { rulesChecked: 2, rulesPassed: 0, rulesFailed: 2 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 2, mockStartTime, true);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].code).toBe('ERROR1');
      expect(result.errors[1].code).toBe('ERROR2');
      expect(result.errors[2].code).toBe('ERROR3');
    });

    it('should handle mixed success and failure with strict mode false', () => {
      const results: ValidationResult[] = [
        {
          success: true,
          errors: [],
          warnings: [],
          metadata: { rulesChecked: 2, rulesPassed: 2, rulesFailed: 0 }
        },
        {
          success: false,
          errors: [{ code: 'ERROR1', message: 'Error 1', severity: 'error' }],
          warnings: [],
          metadata: { rulesChecked: 1, rulesPassed: 0, rulesFailed: 1 }
        }
      ];

      const result = resultBuilder.buildValidationResult(results, 2, mockStartTime, false);

      expect(result.success).toBe(true); // Should be true because strict mode is false
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('createNoPluginsResult', () => {
    it('should create result when no plugins are loaded', () => {
      const result = resultBuilder.createNoPluginsResult(mockStartTime);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toEqual({
        code: 'NO_PLUGINS',
        message: 'No validation plugins loaded',
        severity: 'warning'
      });
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        pluginsChecked: 0,
        rulesChecked: 0
      });
    });

    it('should calculate correct duration', () => {
      const startTime = Date.now() - 1000; // 1 second ago
      const result = resultBuilder.createNoPluginsResult(startTime);

      expect(result.metadata!.duration).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('buildErrorResult', () => {
    it('should build error result with Error object', () => {
      const error = new Error('Test error message');
      const result = resultBuilder.buildErrorResult(error, mockStartTime);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Test error message',
        severity: 'error',
        context: { error }
      });
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        error: 'Test error message'
      });
    });

    it('should build error result with unknown error type', () => {
      const error = 'String error';
      const result = resultBuilder.buildErrorResult(error, mockStartTime);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Unknown validation error',
        severity: 'error',
        context: { error }
      });
      expect(result.metadata).toEqual({
        duration: expect.any(Number),
        error: 'Unknown error'
      });
    });

    it('should include error context in metadata', () => {
      const error = new Error('Context test');
      const result = resultBuilder.buildErrorResult(error, mockStartTime);

      expect(result.errors[0].context).toEqual({ error });
      expect(result.metadata!.error).toBe('Context test');
    });

    it('should handle null error', () => {
      const result = resultBuilder.buildErrorResult(null, mockStartTime);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Unknown validation error');
      expect(result.metadata!.error).toBe('Unknown error');
    });

    it('should handle undefined error', () => {
      const result = resultBuilder.buildErrorResult(undefined, mockStartTime);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Unknown validation error');
      expect(result.metadata!.error).toBe('Unknown error');
    });

    it('should handle number error', () => {
      const error = 42;
      const result = resultBuilder.buildErrorResult(error, mockStartTime);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Unknown validation error');
      expect(result.metadata!.error).toBe('Unknown error');
    });

    it('should handle boolean error', () => {
      const error = true;
      const result = resultBuilder.buildErrorResult(error, mockStartTime);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Unknown validation error');
      expect(result.metadata!.error).toBe('Unknown error');
    });

    it('should calculate correct duration for error result', () => {
      const startTime = Date.now() - 500; // 500ms ago
      const error = new Error('Duration test');
      const result = resultBuilder.buildErrorResult(error, startTime);

      expect(result.metadata!.duration).toBeGreaterThanOrEqual(500);
    });
  });
}); 