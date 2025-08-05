import { Validator } from '../src/application/services/Validator';
import { PluginLoader } from '../src/infrastructure/plugins/PluginLoader';
import { HealthChecker } from '../src/infrastructure/plugins/HealthChecker';
import { PluginValidator } from '../src/application/validators/PluginValidator';
import { ResultBuilder } from '../src/shared/utils/ResultBuilder';
import { ValidationContext } from '../src/shared/types';

// Mock dependencies
jest.mock('../src/infrastructure/plugins/PluginLoader');
jest.mock('../src/infrastructure/plugins/HealthChecker');
jest.mock('../src/application/validators/PluginValidator');
jest.mock('../src/shared/utils/ResultBuilder');

describe('Validator', () => {
  let validator: Validator;
  let mockPluginLoader: jest.Mocked<PluginLoader>;
  let mockHealthChecker: jest.Mocked<HealthChecker>;
  let mockPluginValidator: jest.Mocked<PluginValidator>;
  let mockResultBuilder: jest.Mocked<ResultBuilder>;
  let mockPluginManager: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock PluginManager
    mockPluginManager = {
      getEnabledPlugins: jest.fn(),
      getPlugin: jest.fn()
    };

    // Mock PluginLoader
    mockPluginLoader = {
      getPluginManager: jest.fn().mockReturnValue(mockPluginManager),
      loadPlugins: jest.fn()
    } as any;

    // Mock HealthChecker
    mockHealthChecker = {
      getHealth: jest.fn(),
      isPluginHealthy: jest.fn(),
      getDetailedHealth: jest.fn()
    } as any;

    // Mock PluginValidator
    mockPluginValidator = {
      validateThroughPlugins: jest.fn(),
      isStrictMode: jest.fn(),
      isValidationSuccessful: jest.fn()
    } as any;

    // Mock ResultBuilder
    mockResultBuilder = {
      buildValidationResult: jest.fn(),
      createNoPluginsResult: jest.fn(),
      buildErrorResult: jest.fn()
    } as any;

    // Mock constructor dependencies
    (PluginLoader as jest.MockedClass<typeof PluginLoader>).mockImplementation(() => mockPluginLoader);
    (HealthChecker as jest.MockedClass<typeof HealthChecker>).mockImplementation(() => mockHealthChecker);
    (PluginValidator as jest.MockedClass<typeof PluginValidator>).mockImplementation(() => mockPluginValidator);
    (ResultBuilder as jest.MockedClass<typeof ResultBuilder>).mockImplementation(() => mockResultBuilder);

    validator = new Validator();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      expect(validator).toBeInstanceOf(Validator);
      expect(PluginLoader).toHaveBeenCalledWith({
        plugins: ['syntropylog'],
        autoLoad: true
      });
      expect(PluginValidator).toHaveBeenCalledWith({ strict: false });
    });

    it('should create instance with custom options', () => {
      const options = {
        plugins: ['security', 'compliance'],
        strict: true,
        rules: { 'rule1': true, 'rule2': false }
      };

      new Validator(options);

      expect(PluginLoader).toHaveBeenCalledWith({
        plugins: ['security', 'compliance'],
        autoLoad: true
      });
      expect(PluginValidator).toHaveBeenCalledWith({ strict: true });
    });

    it('should create instance with partial options', () => {
      const options = { strict: true };

      new Validator(options);

      expect(PluginLoader).toHaveBeenCalledWith({
        plugins: ['syntropylog'],
        autoLoad: true
      });
      expect(PluginValidator).toHaveBeenCalledWith({ strict: true });
    });
  });

  describe('validate', () => {
    const mockConfig = { test: 'config' };
    const mockContext: ValidationContext = { environment: 'test' };

    it('should validate configuration successfully with plugins', async () => {
      const mockPlugins = [
        { getRules: () => [], setRuleEnabled: () => false },
        { getRules: () => [], setRuleEnabled: () => false }
      ];
      const mockResults = [
        { success: true, errors: [], warnings: [] },
        { success: true, errors: [], warnings: [] }
      ];
      const mockValidationResult = { success: true, errors: [], warnings: [] };

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);
      mockPluginValidator.validateThroughPlugins.mockResolvedValue(mockResults);
      mockPluginValidator.isStrictMode.mockReturnValue(false);
      mockResultBuilder.buildValidationResult.mockReturnValue(mockValidationResult);

      const result = await validator.validate(mockConfig, mockContext);

      expect(mockPluginManager.getEnabledPlugins).toHaveBeenCalled();
      expect(mockPluginValidator.validateThroughPlugins).toHaveBeenCalledWith(mockPlugins, mockConfig, mockContext);
      expect(mockResultBuilder.buildValidationResult).toHaveBeenCalledWith(
        mockResults,
        2,
        expect.any(Number),
        false
      );
      expect(result).toBe(mockValidationResult);
    });

    it('should return no plugins result when no plugins are enabled', async () => {
      const mockNoPluginsResult = { success: true, errors: [], warnings: [] };

      mockPluginManager.getEnabledPlugins.mockReturnValue([]);
      mockResultBuilder.createNoPluginsResult.mockReturnValue(mockNoPluginsResult);

      const result = await validator.validate(mockConfig, mockContext);

      expect(mockResultBuilder.createNoPluginsResult).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toBe(mockNoPluginsResult);
    });

    it('should handle validation errors gracefully', async () => {
      const mockError = new Error('Validation failed');
      const mockErrorResult = { success: false, errors: [], warnings: [] };

      mockPluginManager.getEnabledPlugins.mockReturnValue([{ getRules: () => [] }]);
      mockPluginValidator.validateThroughPlugins.mockRejectedValue(mockError);
      mockResultBuilder.buildErrorResult.mockReturnValue(mockErrorResult);

      const result = await validator.validate(mockConfig, mockContext);

      expect(mockResultBuilder.buildErrorResult).toHaveBeenCalledWith(mockError, expect.any(Number));
      expect(result).toBe(mockErrorResult);
    });

    it('should throw error when config is null', async () => {
      await expect(validator.validate(null as any, mockContext))
        .rejects.toThrow('Configuration is required and cannot be null or undefined');
    });

    it('should throw error when config is undefined', async () => {
      await expect(validator.validate(undefined as any, mockContext))
        .rejects.toThrow('Configuration is required and cannot be null or undefined');
    });

    it('should throw error when context is null', async () => {
      await expect(validator.validate(mockConfig, null as any))
        .rejects.toThrow('Validation context is required and must be a valid object');
    });

    it('should throw error when context is undefined', async () => {
      await expect(validator.validate(mockConfig, undefined as any))
        .rejects.toThrow('Validation context is required and must be a valid object');
    });

    it('should throw error when context is not an object', async () => {
      await expect(validator.validate(mockConfig, 'not-an-object' as any))
        .rejects.toThrow('Validation context is required and must be a valid object');
    });

    it('should throw error when context is a number', async () => {
      await expect(validator.validate(mockConfig, 123 as any))
        .rejects.toThrow('Validation context is required and must be a valid object');
    });

    it('should throw error when context is a boolean', async () => {
      await expect(validator.validate(mockConfig, true as any))
        .rejects.toThrow('Validation context is required and must be a valid object');
    });
  });

  describe('getRules', () => {
    it('should return rules from all enabled plugins', () => {
      const mockRules1: any[] = [
        { id: 'rule1', name: 'Rule 1', description: 'Test rule 1', category: 'security', severity: 'error', enabled: true, execute: jest.fn() }
      ];
      const mockRules2: any[] = [
        { id: 'rule2', name: 'Rule 2', description: 'Test rule 2', category: 'compliance', severity: 'warning', enabled: true, execute: jest.fn() }
      ];

      const mockPlugins = [
        { getRules: () => mockRules1 },
        { getRules: () => mockRules2 }
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const rules = validator.getRules();

      expect(rules).toHaveLength(2);
      expect(rules).toEqual([...mockRules1, ...mockRules2]);
    });

    it('should return empty array when no plugins are enabled', () => {
      mockPluginManager.getEnabledPlugins.mockReturnValue([]);

      const rules = validator.getRules();

      expect(rules).toHaveLength(0);
    });

    it('should handle plugins with no rules', () => {
      const mockPlugins = [
        { getRules: () => [] },
        { getRules: () => [] }
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const rules = validator.getRules();

      expect(rules).toHaveLength(0);
    });
  });

  describe('setRuleEnabled', () => {
    it('should return true when rule is found and enabled', () => {
      const mockPlugins = [
        { setRuleEnabled: jest.fn().mockReturnValue(false) },
        { setRuleEnabled: jest.fn().mockReturnValue(true) }
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = validator.setRuleEnabled('rule1', true);

      expect(result).toBe(true);
      expect(mockPlugins[0].setRuleEnabled).toHaveBeenCalledWith('rule1', true);
      expect(mockPlugins[1].setRuleEnabled).toHaveBeenCalledWith('rule1', true);
    });

    it('should return false when rule is not found', () => {
      const mockPlugins = [
        { setRuleEnabled: jest.fn().mockReturnValue(false) },
        { setRuleEnabled: jest.fn().mockReturnValue(false) }
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = validator.setRuleEnabled('nonexistent-rule', true);

      expect(result).toBe(false);
    });

    it('should return false when no plugins are enabled', () => {
      mockPluginManager.getEnabledPlugins.mockReturnValue([]);

      const result = validator.setRuleEnabled('rule1', true);

      expect(result).toBe(false);
    });

    it('should stop searching after finding the rule', () => {
      const mockPlugins = [
        { setRuleEnabled: jest.fn().mockReturnValue(true) },
        { setRuleEnabled: jest.fn() }
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = validator.setRuleEnabled('rule1', false);

      expect(result).toBe(true);
      expect(mockPlugins[0].setRuleEnabled).toHaveBeenCalledWith('rule1', false);
      expect(mockPlugins[1].setRuleEnabled).not.toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health status from health checker', async () => {
      const mockHealth = { healthy: true, plugins: [] };

      mockHealthChecker.getHealth.mockResolvedValue(mockHealth);

      const result = await validator.getHealth();

      expect(mockHealthChecker.getHealth).toHaveBeenCalled();
      expect(result).toBe(mockHealth);
    });

    it('should handle health checker errors', async () => {
      const mockError = new Error('Health check failed');

      mockHealthChecker.getHealth.mockRejectedValue(mockError);

      await expect(validator.getHealth()).rejects.toThrow('Health check failed');
    });
  });
});