/**
 * ConfigLoaderService Tests - Demonstrating improved testability with SRP
 * 
 * These tests show how the refactored service is much easier to test:
 * - Single responsibility makes mocking simpler
 * - Pure functions are predictable and testable
 * - Guard clauses make error cases explicit
 * - No side effects in most methods
 */

import { ConfigLoaderService, ConfigFile } from '../../../src/application/services/ConfigLoaderService';
import fs from 'fs';
import yaml from 'yaml';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock yaml module
jest.mock('yaml');
const mockedYaml = yaml as jest.Mocked<typeof yaml>;

describe('ConfigLoaderService', () => {
  let service: ConfigLoaderService;

  beforeEach(() => {
    service = new ConfigLoaderService();
    jest.clearAllMocks();
  });

  describe('loadPraetorianConfig', () => {
    it('should load and parse YAML configuration successfully', () => {
      // Arrange
      const configPath = 'praetorian.yaml';
      const configContent = 'files:\n  - config1.yaml\n  - config2.yaml';
      const expectedConfig = { files: ['config1.yaml', 'config2.yaml'] };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(configContent);
      mockedYaml.parse.mockReturnValue(expectedConfig);

      // Act
      const result = service.loadPraetorianConfig(configPath);

      // Assert
      expect(result).toEqual(expectedConfig);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(configPath);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(configPath, 'utf8');
      expect(mockedYaml.parse).toHaveBeenCalledWith(configContent);
    });

    it('should throw error when file does not exist (guard clause)', () => {
      // Arrange
      const configPath = 'nonexistent.yaml';
      mockedFs.existsSync.mockReturnValue(false);

      // Act & Assert
      expect(() => service.loadPraetorianConfig(configPath))
        .toThrow('Configuration file not found: nonexistent.yaml');
    });

    it('should throw error when file parsing fails (guard clause)', () => {
      // Arrange
      const configPath = 'invalid.yaml';
      const configContent = 'invalid yaml content';

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(configContent);
      mockedYaml.parse.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      // Act & Assert
      expect(() => service.loadPraetorianConfig(configPath))
        .toThrow('Failed to parse configuration file invalid.yaml: Invalid YAML');
    });
  });

  describe('loadConfigFile', () => {
    it('should load YAML file successfully', () => {
      // Arrange
      const filePath = 'config.yaml';
      const content = 'database:\n  host: localhost';
      const expectedContent = { database: { host: 'localhost' } };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(content);
      mockedYaml.parse.mockReturnValue(expectedContent);

      // Act
      const result = service.loadConfigFile(filePath);

      // Assert
      expect(result).toEqual({
        path: filePath,
        content: expectedContent,
        format: 'yaml'
      });
    });

    it('should load JSON file successfully', () => {
      // Arrange
      const filePath = 'config.json';
      const content = '{"database": {"host": "localhost"}}';
      const expectedContent = { database: { host: 'localhost' } };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(content);

      // Act
      const result = service.loadConfigFile(filePath);

      // Assert
      expect(result).toEqual({
        path: filePath,
        content: expectedContent,
        format: 'json'
      });
    });

    it('should throw error when file does not exist (guard clause)', () => {
      // Arrange
      const filePath = 'nonexistent.json';
      mockedFs.existsSync.mockReturnValue(false);

      // Act & Assert
      expect(() => service.loadConfigFile(filePath))
        .toThrow('Configuration file not found: nonexistent.json');
    });
  });

  describe('loadConfigFiles', () => {
    it('should load multiple files successfully', () => {
      // Arrange
      const filePaths = ['config1.yaml', 'config2.json'];
      const config1 = { database: { host: 'localhost' } };
      const config2 = { api: { port: 3000 } };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync
        .mockReturnValueOnce('database:\n  host: localhost')
        .mockReturnValueOnce('{"api": {"port": 3000}}');
      mockedYaml.parse.mockReturnValue(config1);

      // Act
      const result = service.loadConfigFiles(filePaths);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].format).toBe('yaml');
      expect(result[1].format).toBe('json');
    });

    it('should return empty array for empty input (guard clause)', () => {
      // Act
      const result = service.loadConfigFiles([]);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for invalid input (guard clause)', () => {
      // Act
      const result = service.loadConfigFiles(null as any);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('separateExistingAndMissingFiles', () => {
    it('should separate existing and missing files correctly', () => {
      // Arrange
      const files = ['existing1.yaml', 'missing1.yaml', 'existing2.json', 'missing2.json'];
      
      mockedFs.existsSync
        .mockImplementation((filePath) => {
          return filePath === 'existing1.yaml' || filePath === 'existing2.json';
        });

      // Act
      const result = service.separateExistingAndMissingFiles(files);

      // Assert
      expect(result.existingFiles).toEqual(['existing1.yaml', 'existing2.json']);
      expect(result.missingFiles).toEqual(['missing1.yaml', 'missing2.json']);
    });

    it('should handle empty array (guard clause)', () => {
      // Act
      const result = service.separateExistingAndMissingFiles([]);

      // Assert
      expect(result.existingFiles).toEqual([]);
      expect(result.missingFiles).toEqual([]);
    });

    it('should handle invalid input (guard clause)', () => {
      // Act
      const result = service.separateExistingAndMissingFiles(null as any);

      // Assert
      expect(result.existingFiles).toEqual([]);
      expect(result.missingFiles).toEqual([]);
    });
  });
});
