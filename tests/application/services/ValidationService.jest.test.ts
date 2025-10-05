import { ValidationService } from '../../../src/application/services/ValidationService';
import { ValidationOptions } from '../../../src/application/orchestrators/ValidationOrchestrator';

// Mock EqualityRule
jest.mock('../../../src/domain/rules/EqualityRule', () => ({
  EqualityRule: jest.fn()
}));

const mockEqualityRule = require('../../../src/domain/rules/EqualityRule') as jest.Mocked<typeof import('../../../src/domain/rules/EqualityRule')>;

describe('ValidationService', () => {
  let validationService: ValidationService;
  let mockExecute: jest.MockedFunction<any>;

  beforeEach(() => {
    validationService = new ValidationService();
    mockExecute = jest.fn();
    
    // Reset mock implementation
    mockEqualityRule.EqualityRule.mockImplementation(() => ({
      execute: mockExecute
    } as any));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createValidationFunction', () => {
    it('should create validation function successfully', () => {
      const options: ValidationOptions = {
        strict: true,
        ignore_keys: ['test'],
        required_keys: ['id']
      };

      const validationFunction = validationService.createValidationFunction(options);

      expect(typeof validationFunction).toBe('function');
      expect(validationFunction).toBeInstanceOf(Function);
    });

    it('should throw error for null options', () => {
      expect(() => {
        validationService.createValidationFunction(null as any);
      }).toThrow('Invalid validation options provided');
    });

    it('should throw error for undefined options', () => {
      expect(() => {
        validationService.createValidationFunction(undefined as any);
      }).toThrow('Invalid validation options provided');
    });

    it('should throw error for non-object options', () => {
      expect(() => {
        validationService.createValidationFunction('invalid' as any);
      }).toThrow('Invalid validation options provided');

      expect(() => {
        validationService.createValidationFunction(123 as any);
      }).toThrow('Invalid validation options provided');

      expect(() => {
        validationService.createValidationFunction(true as any);
      }).toThrow('Invalid validation options provided');
    });

    it('should create validation function with default values', async () => {
      const options: ValidationOptions = {};
      const files = [{ id: 1 }, { id: 2 }];

      const validationFunction = validationService.createValidationFunction(options);
      const result = await validationFunction(files);

      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: false,
        ignoreKeys: [],
        requiredKeys: []
      });
    });

    it('should create validation function with custom values', async () => {
      const options: ValidationOptions = {
        strict: true,
        ignore_keys: ['test', 'temp'],
        required_keys: ['id', 'name']
      };
      const files = [{ id: 1, name: 'test1' }, { id: 2, name: 'test2' }];

      const validationFunction = validationService.createValidationFunction(options);
      const result = await validationFunction(files);

      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: true,
        ignoreKeys: ['test', 'temp'],
        requiredKeys: ['id', 'name']
      });
    });

    it('should throw error when files is not an array', async () => {
      const options: ValidationOptions = {};
      const invalidFiles = 'not an array';

      const validationFunction = validationService.createValidationFunction(options);

      await expect(validationFunction(invalidFiles as any)).rejects.toThrow('Files must be an array');
    });

    it('should call EqualityRule execute with correct context', async () => {
      const options: ValidationOptions = {
        strict: false,
        ignore_keys: ['ignore'],
        required_keys: ['required']
      };
      const files = [{ id: 1 }];
      const expectedResult = { success: true };

      mockExecute.mockResolvedValue(expectedResult);

      const validationFunction = validationService.createValidationFunction(options);
      const result = await validationFunction(files);

      expect(result).toBe(expectedResult);
      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: false,
        ignoreKeys: ['ignore'],
        requiredKeys: ['required']
      });
    });
  });

  describe('executeValidation', () => {
    it('should execute validation successfully', async () => {
      const options: ValidationOptions = {
        strict: true,
        ignore_keys: [],
        required_keys: ['id']
      };
      const files = [{ id: 1 }, { id: 2 }];
      const expectedResult = { success: true };

      mockExecute.mockResolvedValue(expectedResult);

      const result = await validationService.executeValidation(files, options);

      expect(result).toBe(expectedResult);
      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: true,
        ignoreKeys: [],
        requiredKeys: ['id']
      });
    });

    it('should throw error for null files', async () => {
      const options: ValidationOptions = {};

      await expect(validationService.executeValidation(null as any, options))
        .rejects.toThrow('Files must be an array');
    });

    it('should throw error for undefined files', async () => {
      const options: ValidationOptions = {};

      await expect(validationService.executeValidation(undefined as any, options))
        .rejects.toThrow('Files must be an array');
    });

    it('should throw error for non-array files', async () => {
      const options: ValidationOptions = {};

      await expect(validationService.executeValidation('not array' as any, options))
        .rejects.toThrow('Files must be an array');

      await expect(validationService.executeValidation(123 as any, options))
        .rejects.toThrow('Files must be an array');

      await expect(validationService.executeValidation({} as any, options))
        .rejects.toThrow('Files must be an array');
    });

    it('should throw error for null options', async () => {
      const files = [{ id: 1 }];

      await expect(validationService.executeValidation(files, null as any))
        .rejects.toThrow('Invalid validation options provided');
    });

    it('should throw error for undefined options', async () => {
      const files = [{ id: 1 }];

      await expect(validationService.executeValidation(files, undefined as any))
        .rejects.toThrow('Invalid validation options provided');
    });

    it('should throw error for non-object options', async () => {
      const files = [{ id: 1 }];

      await expect(validationService.executeValidation(files, 'invalid' as any))
        .rejects.toThrow('Invalid validation options provided');

      await expect(validationService.executeValidation(files, 123 as any))
        .rejects.toThrow('Invalid validation options provided');

      await expect(validationService.executeValidation(files, true as any))
        .rejects.toThrow('Invalid validation options provided');
    });

    it('should handle validation errors from EqualityRule', async () => {
      const options: ValidationOptions = {};
      const files = [{ id: 1 }];
      const validationError = new Error('Validation failed');

      mockExecute.mockRejectedValue(validationError);

      await expect(validationService.executeValidation(files, options))
        .rejects.toThrow('Validation failed');
    });

    it('should create new EqualityRule instance for each validation', async () => {
      const options: ValidationOptions = {};
      const files = [{ id: 1 }];

      await validationService.executeValidation(files, options);
      await validationService.executeValidation(files, options);

      expect(mockEqualityRule.EqualityRule).toHaveBeenCalledTimes(2);
    });
  });

  describe('Guard clauses and error handling', () => {
    it('should handle empty files array', async () => {
      const options: ValidationOptions = {};
      const files: any[] = [];

      mockExecute.mockResolvedValue({ success: true });

      const result = await validationService.executeValidation(files, options);

      expect(result).toEqual({ success: true });
      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: false,
        ignoreKeys: [],
        requiredKeys: []
      });
    });

    it('should handle options with only strict flag', async () => {
      const options: ValidationOptions = { strict: true };
      const files = [{ id: 1 }];

      mockExecute.mockResolvedValue({ success: true });

      const result = await validationService.executeValidation(files, options);

      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: true,
        ignoreKeys: [],
        requiredKeys: []
      });
    });

    it('should handle options with only ignore_keys', async () => {
      const options: ValidationOptions = { ignore_keys: ['test'] };
      const files = [{ id: 1 }];

      mockExecute.mockResolvedValue({ success: true });

      const result = await validationService.executeValidation(files, options);

      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: false,
        ignoreKeys: ['test'],
        requiredKeys: []
      });
    });

    it('should handle options with only required_keys', async () => {
      const options: ValidationOptions = { required_keys: ['id'] };
      const files = [{ id: 1 }];

      mockExecute.mockResolvedValue({ success: true });

      const result = await validationService.executeValidation(files, options);

      expect(mockExecute).toHaveBeenCalledWith(files, {
        strict: false,
        ignoreKeys: [],
        requiredKeys: ['id']
      });
    });
  });
});
