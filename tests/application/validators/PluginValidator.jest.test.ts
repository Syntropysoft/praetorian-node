import { PluginValidator } from '../../../src/application/validators/PluginValidator';
import { ValidationContext } from '../../../src/shared/types';

describe('PluginValidator', () => {
  let pluginValidator: PluginValidator;

  describe('constructor', () => {
    it('should create instance with default options', () => {
      pluginValidator = new PluginValidator();
      expect(pluginValidator).toBeInstanceOf(PluginValidator);
    });

    it('should create instance with strict mode enabled', () => {
      pluginValidator = new PluginValidator({ strict: true });
      expect(pluginValidator).toBeInstanceOf(PluginValidator);
    });

    it('should create instance with strict mode explicitly disabled', () => {
      pluginValidator = new PluginValidator({ strict: false });
      expect(pluginValidator).toBeInstanceOf(PluginValidator);
    });

    it('should create instance with undefined strict mode', () => {
      pluginValidator = new PluginValidator({ strict: undefined });
      expect(pluginValidator).toBeInstanceOf(PluginValidator);
    });
  });

  describe('validateThroughPlugins', () => {
    beforeEach(() => {
      pluginValidator = new PluginValidator();
    });

    it('should validate through multiple plugins successfully', async () => {
      const mockPlugins = [
        {
          validate: jest.fn().mockResolvedValue({ success: true, errors: [], warnings: [] })
        },
        {
          validate: jest.fn().mockResolvedValue({ success: true, errors: [], warnings: [] })
        }
      ];

      const config = { test: 'config' };
      const context: ValidationContext = { environment: 'test' };

      const results = await pluginValidator.validateThroughPlugins(mockPlugins, config, context);

      expect(results).toHaveLength(2);
      expect(mockPlugins[0].validate).toHaveBeenCalledWith(config, context);
      expect(mockPlugins[1].validate).toHaveBeenCalledWith(config, context);
    });

    it('should handle plugin validation errors', async () => {
      const mockPlugins = [
        {
          validate: jest.fn().mockRejectedValue(new Error('Plugin error'))
        }
      ];

      const config = { test: 'config' };
      const context: ValidationContext = { environment: 'test' };

      await expect(pluginValidator.validateThroughPlugins(mockPlugins, config, context))
        .rejects.toThrow('Plugin error');
    });

    it('should handle empty plugins array', async () => {
      const mockPlugins: any[] = [];
      const config = { test: 'config' };
      const context: ValidationContext = { environment: 'test' };

      const results = await pluginValidator.validateThroughPlugins(mockPlugins, config, context);

      expect(results).toHaveLength(0);
    });

    it('should handle plugin that throws error', async () => {
      const mockPlugins = [
        {
          validate: jest.fn().mockImplementation(() => {
            throw new Error('Synchronous error');
          })
        }
      ];

      const config = { test: 'config' };
      const context: ValidationContext = { environment: 'test' };

      await expect(pluginValidator.validateThroughPlugins(mockPlugins, config, context))
        .rejects.toThrow('Synchronous error');
    });

    it('should handle mixed successful and failed plugins', async () => {
      const mockPlugins = [
        {
          validate: jest.fn().mockResolvedValue({ success: true, errors: [], warnings: [] })
        },
        {
          validate: jest.fn().mockRejectedValue(new Error('Plugin 2 failed'))
        }
      ];

      const config = { test: 'config' };
      const context: ValidationContext = { environment: 'test' };

      await expect(pluginValidator.validateThroughPlugins(mockPlugins, config, context))
        .rejects.toThrow('Plugin 2 failed');
    });
  });

  describe('isValidationSuccessful', () => {
    it('should return true when no errors exist', () => {
      pluginValidator = new PluginValidator();
      const errors: any[] = [];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(true);
    });

    it('should return true when errors exist but strict mode is false', () => {
      pluginValidator = new PluginValidator({ strict: false });
      const errors = [{ message: 'Error 1' }, { message: 'Error 2' }];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(true);
    });

    it('should return false when errors exist and strict mode is true', () => {
      pluginValidator = new PluginValidator({ strict: true });
      const errors = [{ message: 'Error 1' }];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(false);
    });

    it('should return true when errors exist but strict mode is false (default)', () => {
      pluginValidator = new PluginValidator();
      const errors = [{ message: 'Error 1' }];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(true);
    });

    it('should return true when errors array is null', () => {
      pluginValidator = new PluginValidator({ strict: false });
      const errors = null as any;

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(true);
    });

    it('should return true when errors array is undefined', () => {
      pluginValidator = new PluginValidator({ strict: false });
      const errors = undefined as any;

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(true);
    });

    it('should return true when errors array is empty and strict mode is true', () => {
      pluginValidator = new PluginValidator({ strict: true });
      const errors: any[] = [];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(true);
    });

    it('should return false when errors array has one error and strict mode is true', () => {
      pluginValidator = new PluginValidator({ strict: true });
      const errors = [{ message: 'Single error' }];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(false);
    });

    it('should return false when errors array has multiple errors and strict mode is true', () => {
      pluginValidator = new PluginValidator({ strict: true });
      const errors = [{ message: 'Error 1' }, { message: 'Error 2' }, { message: 'Error 3' }];

      const result = pluginValidator.isValidationSuccessful(errors);

      expect(result).toBe(false);
    });
  });

  describe('isStrictMode', () => {
    it('should return false by default', () => {
      pluginValidator = new PluginValidator();
      expect(pluginValidator.isStrictMode()).toBe(false);
    });

    it('should return true when strict mode is enabled', () => {
      pluginValidator = new PluginValidator({ strict: true });
      expect(pluginValidator.isStrictMode()).toBe(true);
    });

    it('should return false when strict mode is explicitly disabled', () => {
      pluginValidator = new PluginValidator({ strict: false });
      expect(pluginValidator.isStrictMode()).toBe(false);
    });

    it('should return false when strict mode is undefined', () => {
      pluginValidator = new PluginValidator({ strict: undefined });
      expect(pluginValidator.isStrictMode()).toBe(false);
    });

    it('should return false when strict mode is null', () => {
      pluginValidator = new PluginValidator({ strict: null as any });
      expect(pluginValidator.isStrictMode()).toBe(false);
    });
  });
}); 