import { EnvironmentManager, EnvironmentConfig, EnvironmentValidationResult } from '../src/shared/utils/EnvironmentManager';
import { ConfigFile } from '../src/shared/types';

// Mock fs and yaml modules
jest.mock('fs');
jest.mock('yaml');

describe('EnvironmentManager', () => {
  let environmentManager: EnvironmentManager;
  let mockFs: any;
  let mockYaml: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFs = {
      existsSync: jest.fn(),
      readFileSync: jest.fn()
    };
    
    mockYaml = {
      parse: jest.fn()
    };

    require('fs').existsSync = mockFs.existsSync;
    require('fs').readFileSync = mockFs.readFileSync;
    require('yaml').parse = mockYaml.parse;

    environmentManager = new EnvironmentManager();
  });

  describe('loadEnvironmentConfig', () => {
    it('should load environment configuration from file', () => {
      const mockConfig = { dev: 'config-dev.yaml', prod: 'config-prod.yaml' };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('dev: config-dev.yaml\nprod: config-prod.yaml');
      mockYaml.parse.mockReturnValue(mockConfig);

      const result = environmentManager.loadEnvironmentConfig('environments.yaml');

      expect(result).toEqual(mockConfig);
      expect(mockFs.existsSync).toHaveBeenCalledWith('environments.yaml');
      expect(mockFs.readFileSync).toHaveBeenCalledWith('environments.yaml', 'utf8');
      expect(mockYaml.parse).toHaveBeenCalledWith('dev: config-dev.yaml\nprod: config-prod.yaml');
    });

    it('should throw error when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        environmentManager.loadEnvironmentConfig('nonexistent.yaml');
      }).toThrow('Environment configuration file not found: nonexistent.yaml');
    });
  });

  describe('validateEnvironment', () => {
    it('should validate specific environment successfully', async () => {
      const environmentConfig = { dev: 'config-dev.yaml' };
      const mockContent = '{"database": {"host": "localhost"}}';
      const mockParsedContent = { database: { host: 'localhost' } };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockContent);
      
      const mockValidationFunction = jest.fn().mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const result = await environmentManager.validateEnvironment('dev', environmentConfig, mockValidationFunction);

      expect(result).toEqual({
        environment: 'dev',
        configFile: 'config-dev.yaml',
        success: true,
        errors: [],
        warnings: []
      });
      expect(mockFs.existsSync).toHaveBeenCalledWith('config-dev.yaml');
      expect(mockFs.readFileSync).toHaveBeenCalledWith('config-dev.yaml', 'utf8');
    });

    it('should throw error when environment not found', async () => {
      const environmentConfig = { dev: 'config-dev.yaml' };

      await expect(
        environmentManager.validateEnvironment('staging', environmentConfig, jest.fn())
      ).rejects.toThrow("Environment 'staging' not found in configuration");
    });

    it('should throw error when config file not found', async () => {
      const environmentConfig = { dev: 'config-dev.yaml' };
      mockFs.existsSync.mockReturnValue(false);

      await expect(
        environmentManager.validateEnvironment('dev', environmentConfig, jest.fn())
      ).rejects.toThrow('Configuration file not found: config-dev.yaml');
    });

    it('should handle JSON files correctly', async () => {
      const environmentConfig = { dev: 'config-dev.json' };
      const mockContent = '{"database": {"host": "localhost"}}';
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockContent);
      
      const mockValidationFunction = jest.fn().mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const result = await environmentManager.validateEnvironment('dev', environmentConfig, mockValidationFunction);

      expect(result.success).toBe(true);
      expect(mockValidationFunction).toHaveBeenCalledWith([{
        path: 'config-dev.json',
        content: { database: { host: 'localhost' } },
        format: 'json'
      }]);
    });

    it('should handle YAML files correctly', async () => {
      const environmentConfig = { dev: 'config-dev.yml' };
      const mockContent = 'database:\n  host: localhost';
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockContent);
      mockYaml.parse.mockReturnValue({ database: { host: 'localhost' } });
      
      const mockValidationFunction = jest.fn().mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const result = await environmentManager.validateEnvironment('dev', environmentConfig, mockValidationFunction);

      expect(result.success).toBe(true);
      expect(mockValidationFunction).toHaveBeenCalledWith([{
        path: 'config-dev.yml',
        content: { database: { host: 'localhost' } },
        format: 'yaml'
      }]);
    });
  });

  describe('validateAllEnvironments', () => {
    it('should validate all environments', async () => {
      const environmentConfig = { 
        dev: 'config-dev.yaml', 
        prod: 'config-prod.yaml' 
      };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"test": "data"}');
      
      const mockValidationFunction = jest.fn().mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const results = await environmentManager.validateAllEnvironments(environmentConfig, mockValidationFunction);

      expect(results).toHaveLength(2);
      expect(results[0].environment).toBe('dev');
      expect(results[1].environment).toBe('prod');
    });
  });

  describe('getEnvironmentSummary', () => {
    it('should generate correct summary for all passed environments', () => {
      const results: EnvironmentValidationResult[] = [
        { environment: 'dev', configFile: 'dev.yaml', success: true, errors: [], warnings: [] },
        { environment: 'prod', configFile: 'prod.yaml', success: true, errors: [], warnings: [] }
      ];

      const summary = environmentManager.getEnvironmentSummary(results);

      expect(summary).toEqual({
        total: 2,
        passed: 2,
        failed: 0,
        success: true
      });
    });

    it('should generate correct summary for mixed results', () => {
      const results: EnvironmentValidationResult[] = [
        { environment: 'dev', configFile: 'dev.yaml', success: true, errors: [], warnings: [] },
        { environment: 'prod', configFile: 'prod.yaml', success: false, errors: ['Error'], warnings: [] }
      ];

      const summary = environmentManager.getEnvironmentSummary(results);

      expect(summary).toEqual({
        total: 2,
        passed: 1,
        failed: 1,
        success: false
      });
    });

    it('should handle empty results array', () => {
      const summary = environmentManager.getEnvironmentSummary([]);

      expect(summary).toEqual({
        total: 0,
        passed: 0,
        failed: 0,
        success: true
      });
    });
  });
}); 