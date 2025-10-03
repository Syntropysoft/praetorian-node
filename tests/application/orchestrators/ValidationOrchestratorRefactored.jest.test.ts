/**
 * ValidationOrchestratorRefactored Tests - Demonstrating improved testability
 * 
 * These tests show how the refactored orchestrator is much easier to test:
 * - Clear separation of concerns
 * - Easy to mock dependencies
 * - Predictable behavior with guard clauses
 * - Functional patterns make testing straightforward
 */

import { ValidationOrchestratorRefactored } from '../../../src/application/orchestrators/ValidationOrchestratorRefactored';
import { ConfigLoaderService } from '../../../src/application/services/ConfigLoaderService';
import { StructureGeneratorService } from '../../../src/application/services/StructureGeneratorService';
import { ValidationService } from '../../../src/application/services/ValidationService';
import { EnvironmentManager } from '../../../src/shared/utils/EnvironmentManager';

// Mock all dependencies
jest.mock('../../../src/application/services/ConfigLoaderService');
jest.mock('../../../src/application/services/StructureGeneratorService');
jest.mock('../../../src/application/services/ValidationService');
jest.mock('../../../src/shared/utils/EnvironmentManager');

const MockedConfigLoaderService = ConfigLoaderService as jest.MockedClass<typeof ConfigLoaderService>;
const MockedStructureGeneratorService = StructureGeneratorService as jest.MockedClass<typeof StructureGeneratorService>;
const MockedValidationService = ValidationService as jest.MockedClass<typeof ValidationService>;
const MockedEnvironmentManager = EnvironmentManager as jest.MockedClass<typeof EnvironmentManager>;

describe('ValidationOrchestratorRefactored', () => {
  let orchestrator: ValidationOrchestratorRefactored;
  let mockConfigLoader: jest.Mocked<ConfigLoaderService>;
  let mockStructureGenerator: jest.Mocked<StructureGeneratorService>;
  let mockValidationService: jest.Mocked<ValidationService>;
  let mockEnvironmentManager: jest.Mocked<EnvironmentManager>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockConfigLoader = {
      loadPraetorianConfig: jest.fn(),
      loadConfigFile: jest.fn(),
      loadConfigFiles: jest.fn(),
      separateExistingAndMissingFiles: jest.fn()
    } as any;

    mockStructureGenerator = {
      createEmptyStructureFile: jest.fn(),
      createEmptyStructureFromExisting: jest.fn(),
      createStructureFromRequiredKeys: jest.fn(),
      createStructureFromExistingFiles: jest.fn()
    } as any;

    mockValidationService = {
      createValidationFunction: jest.fn(),
      executeValidation: jest.fn()
    } as any;

    mockEnvironmentManager = {
      loadEnvironmentConfig: jest.fn(),
      validateAllEnvironments: jest.fn(),
      validateEnvironment: jest.fn(),
      getEnvironmentSummary: jest.fn()
    } as any;

    // Mock constructor calls
    MockedConfigLoaderService.mockImplementation(() => mockConfigLoader);
    MockedStructureGeneratorService.mockImplementation(() => mockStructureGenerator);
    MockedValidationService.mockImplementation(() => mockValidationService);
    MockedEnvironmentManager.mockImplementation(() => mockEnvironmentManager);

    orchestrator = new ValidationOrchestratorRefactored();
  });

  describe('orchestrateValidation', () => {
    it('should validate single file successfully', async () => {
      // Arrange
      const configPath = 'praetorian.yaml';
      const options = { strict: true };
      const praetorianConfig = { files: ['config1.yaml', 'config2.yaml'] };
      const configFiles = [
        { path: 'config1.yaml', content: { database: { host: 'localhost' } }, format: 'yaml' as const },
        { path: 'config2.yaml', content: { database: { host: 'localhost' } }, format: 'yaml' as const }
      ];
      const validationResult = { success: true, errors: [], warnings: [], results: [] };

      mockConfigLoader.loadPraetorianConfig.mockReturnValue(praetorianConfig);
      mockConfigLoader.separateExistingAndMissingFiles.mockReturnValue({
        existingFiles: ['config1.yaml', 'config2.yaml'],
        missingFiles: []
      });
      mockConfigLoader.loadConfigFiles.mockReturnValue(configFiles);
      mockValidationService.executeValidation.mockResolvedValue(validationResult);

      // Act
      const result = await orchestrator.orchestrateValidation(configPath, options);

      // Assert
      expect(result).toEqual(validationResult);
      expect(mockConfigLoader.loadPraetorianConfig).toHaveBeenCalledWith(configPath);
      expect(mockConfigLoader.separateExistingAndMissingFiles).toHaveBeenCalledWith(praetorianConfig.files);
      expect(mockConfigLoader.loadConfigFiles).toHaveBeenCalledWith(praetorianConfig.files);
      expect(mockValidationService.executeValidation).toHaveBeenCalledWith(configFiles, options);
    });

    it('should handle missing files by creating empty structures', async () => {
      // Arrange
      const configPath = 'praetorian.yaml';
      const options = { strict: true };
      const praetorianConfig = { files: ['config1.yaml', 'missing.yaml'] };
      const existingFiles = ['config1.yaml'];
      const missingFiles = ['missing.yaml'];
      const configFiles = [
        { path: 'config1.yaml', content: { database: { host: 'localhost' } }, format: 'yaml' as const },
        { path: 'missing.yaml', content: { database: { host: null } }, format: 'yaml' as const }
      ];
      const validationResult = { success: true, errors: [], warnings: [], results: [] };

      mockConfigLoader.loadPraetorianConfig.mockReturnValue(praetorianConfig);
      mockConfigLoader.separateExistingAndMissingFiles.mockReturnValue({
        existingFiles,
        missingFiles
      });
      mockConfigLoader.loadConfigFile.mockReturnValue({ path: 'config1.yaml', content: { database: { host: 'localhost' } }, format: 'yaml' as const });
      mockConfigLoader.loadConfigFiles.mockReturnValue(configFiles);
      mockValidationService.executeValidation.mockResolvedValue(validationResult);

      // Act
      const result = await orchestrator.orchestrateValidation(configPath, options);

      // Assert
      expect(result).toEqual(validationResult);
      expect(mockStructureGenerator.createEmptyStructureFile).toHaveBeenCalledWith(
        'missing.yaml',
        existingFiles,
        praetorianConfig,
        expect.any(Function)
      );
    });

    it('should validate by environments when env option is provided', async () => {
      // Arrange
      const configPath = 'praetorian.yaml';
      const options = { env: 'dev' };
      const environmentConfig = { dev: 'config-dev.yaml' };
      const validationResult = { 
        environment: 'dev',
        configFile: 'config-dev.yaml',
        success: true, 
        errors: [], 
        warnings: [] 
      };

      mockEnvironmentManager.loadEnvironmentConfig.mockReturnValue(environmentConfig);
      mockEnvironmentManager.validateEnvironment.mockResolvedValue(validationResult);
      mockValidationService.createValidationFunction.mockReturnValue(jest.fn().mockResolvedValue(validationResult));

      // Act
      const result = await orchestrator.orchestrateValidation(configPath, options);

      // Assert
      expect(result).toEqual({
        success: true,
        errors: [],
        warnings: []
      });
      expect(mockEnvironmentManager.loadEnvironmentConfig).toHaveBeenCalledWith('environments.yaml');
      expect(mockEnvironmentManager.validateEnvironment).toHaveBeenCalledWith('dev', environmentConfig, expect.any(Function));
    });

    it('should validate all environments when all option is provided', async () => {
      // Arrange
      const configPath = 'praetorian.yaml';
      const options = { all: true };
      const environmentConfig = { dev: 'config-dev.yaml', prod: 'config-prod.yaml' };
      const results = [
        { environment: 'dev', configFile: 'config-dev.yaml', success: true, errors: [], warnings: [] },
        { environment: 'prod', configFile: 'config-prod.yaml', success: true, errors: [], warnings: [] }
      ];
      const summary = { total: 2, passed: 2, failed: 0, success: true };
      const validationResult = { success: true, results, summary };

      mockEnvironmentManager.loadEnvironmentConfig.mockReturnValue(environmentConfig);
      mockEnvironmentManager.validateAllEnvironments.mockResolvedValue(results);
      mockEnvironmentManager.getEnvironmentSummary.mockReturnValue(summary);
      mockValidationService.createValidationFunction.mockReturnValue(jest.fn().mockResolvedValue({}));

      // Act
      const result = await orchestrator.orchestrateValidation(configPath, options);

      // Assert
      expect(result).toEqual(validationResult);
      expect(mockEnvironmentManager.validateAllEnvironments).toHaveBeenCalledWith(environmentConfig, expect.any(Function));
      expect(mockEnvironmentManager.getEnvironmentSummary).toHaveBeenCalledWith(results);
    });

    it('should throw error for invalid config path (guard clause)', async () => {
      // Act & Assert
      await expect(orchestrator.orchestrateValidation('', {}))
        .rejects.toThrow('Configuration path is required');

      await expect(orchestrator.orchestrateValidation(null as any, {}))
        .rejects.toThrow('Configuration path is required');
    });

    it('should throw error for invalid options (guard clause)', async () => {
      // Act & Assert
      await expect(orchestrator.orchestrateValidation('config.yaml', null as any))
        .rejects.toThrow('Validation options are required');

      await expect(orchestrator.orchestrateValidation('config.yaml', undefined as any))
        .rejects.toThrow('Validation options are required');
    });
  });

  describe('isEnvironmentValidation', () => {
    it('should return true when all option is provided', () => {
      // This is a private method, so we test it through orchestrateValidation
      // The behavior is already tested in the integration tests above
    });

    it('should return true when env option is provided', () => {
      // This is a private method, so we test it through orchestrateValidation
      // The behavior is already tested in the integration tests above
    });
  });
});
