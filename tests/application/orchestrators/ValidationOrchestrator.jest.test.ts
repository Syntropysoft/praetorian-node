import { ValidationOrchestrator, ValidationOptions, ValidationResult } from '../../../src/application/orchestrators/ValidationOrchestrator';
import { EnvironmentManager } from '../../../src/shared/utils/EnvironmentManager';
import { EqualityRule } from '../../../src/domain/rules/EqualityRule';

// Mock dependencies
jest.mock('../../../src/shared/utils/EnvironmentManager');
jest.mock('../../../src/domain/rules/EqualityRule');
jest.mock('fs');
jest.mock('yaml');

describe('ValidationOrchestrator', () => {
  let orchestrator: ValidationOrchestrator;
  let mockEnvironmentManager: jest.Mocked<EnvironmentManager>;
  let mockEqualityRule: jest.Mocked<EqualityRule>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock EnvironmentManager
    mockEnvironmentManager = {
      loadEnvironmentConfig: jest.fn(),
      validateAllEnvironments: jest.fn(),
      validateEnvironment: jest.fn(),
      getEnvironmentSummary: jest.fn()
    } as any;

    // Mock EqualityRule
    mockEqualityRule = {
      execute: jest.fn()
    } as any;

    // Mock constructor dependencies
    (EnvironmentManager as jest.MockedClass<typeof EnvironmentManager>).mockImplementation(() => mockEnvironmentManager);
    (EqualityRule as jest.MockedClass<typeof EqualityRule>).mockImplementation(() => mockEqualityRule);

    orchestrator = new ValidationOrchestrator();
  });

  describe('orchestrateValidation', () => {
    it('should handle single file validation', async () => {
      const configPath = 'test-config.yaml';
      const options: ValidationOptions = { verbose: true };
      
      // Mock file system operations
      const mockFs = require('fs');
      const mockYaml = require('yaml');
      
      mockFs.readFileSync.mockReturnValue('files: [config1.yaml]');
      mockYaml.parse.mockReturnValue({ files: ['config1.yaml'] });
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"test": "data"}');
      mockYaml.parse.mockReturnValue({ test: 'data' });
      
      mockEqualityRule.execute.mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const result = await orchestrator.orchestrateValidation(configPath, options);

      expect(result.success).toBe(true);
    });

    it('should handle environment validation', async () => {
      const configPath = 'test-config.yaml';
      const options: ValidationOptions = { all: true };
      
      const mockEnvironmentConfig = { 
        dev: 'config-dev.yaml',
        prod: 'config-prod.yaml'
      };
      const mockResult = { 
        success: true, 
        environment: 'dev', 
        configFile: 'config-dev.yaml',
        errors: [], 
        warnings: [] 
      };
      const mockSummary = { total: 2, passed: 2, failed: 0, success: true };

      mockEnvironmentManager.loadEnvironmentConfig.mockReturnValue(mockEnvironmentConfig);
      mockEnvironmentManager.validateAllEnvironments.mockResolvedValue([mockResult]);
      mockEnvironmentManager.getEnvironmentSummary.mockReturnValue(mockSummary);

      const result = await orchestrator.orchestrateValidation(configPath, options);

      expect(result.success).toBe(true);
    });

    it('should handle specific environment validation', async () => {
      const configPath = 'test-config.yaml';
      const options: ValidationOptions = { env: 'dev' };
      
      const mockEnvironmentConfig = { 
        dev: 'config-dev.yaml',
        prod: 'config-prod.yaml'
      };
      const mockResult = { 
        success: true, 
        environment: 'dev', 
        configFile: 'config-dev.yaml',
        errors: [], 
        warnings: [] 
      };

      mockEnvironmentManager.loadEnvironmentConfig.mockReturnValue(mockEnvironmentConfig);
      mockEnvironmentManager.validateEnvironment.mockResolvedValue(mockResult);

      const result = await orchestrator.orchestrateValidation(configPath, options);

      expect(result.success).toBe(true);
    });
  });
}); 