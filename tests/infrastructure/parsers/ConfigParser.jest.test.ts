import { ConfigParser } from '../../../src/infrastructure/parsers/ConfigParser';
import { PraetorianConfig } from '../../../src/shared/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock the config parsing modules
jest.mock('../../../src/infrastructure/parsers/config-parsing/ConfigFileOperations', () => ({
  fileExists: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  createDirectorySync: jest.fn(),
  parseYamlContent: jest.fn(),
  stringifyToYaml: jest.fn(),
  resolvePath: jest.fn(),
  getDirectoryName: jest.fn(),
  joinPath: jest.fn()
}));

jest.mock('../../../src/infrastructure/parsers/config-parsing/ConfigValidation', () => ({
  validatePraetorianConfig: jest.fn(),
  hasFilesToValidate: jest.fn()
}));

jest.mock('../../../src/shared/templates/rule-templates', () => ({
  DEFAULT_PRAETORIAN_CONFIG: 'default config content',
  getRuleTemplate: jest.fn()
}));

const mockConfigFileOps = require('../../../src/infrastructure/parsers/config-parsing/ConfigFileOperations');
const mockConfigValidation = require('../../../src/infrastructure/parsers/config-parsing/ConfigValidation');
const mockRuleTemplates = require('../../../src/shared/templates/rule-templates');

describe('ConfigParser', () => {
  let configParser: ConfigParser;
  let mockConfig: PraetorianConfig;

  beforeEach(() => {
    configParser = new ConfigParser('test-config.yaml');
    
    mockConfig = {
      files: ['file1.yaml', 'file2.yaml'],
      environments: {
        dev: 'config-dev.yaml',
        prod: 'config-prod.yaml'
      },
      ignore_keys: ['temp', 'cache'],
      required_keys: ['id', 'name'],
      schema: { id: 'string', name: 'string' },
      patterns: { email: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$' },
      forbidden_keys: ['password', 'secret']
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockConfigFileOps.fileExists.mockReturnValue(true);
    mockConfigFileOps.readFileSync.mockReturnValue({
      success: true,
      content: 'yaml content'
    });
    mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
    mockConfigValidation.validatePraetorianConfig.mockReturnValue({
      isValid: true,
      errors: []
    });
    mockConfigValidation.hasFilesToValidate.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should create instance with default config path', () => {
      const parser = new ConfigParser();
      expect(parser).toBeInstanceOf(ConfigParser);
    });

    it('should create instance with custom config path', () => {
      const parser = new ConfigParser('custom.yaml');
      expect(parser).toBeInstanceOf(ConfigParser);
    });
  });

  describe('load', () => {
    it('should load configuration successfully', () => {
      const result = configParser.load();
      
      expect(result).toEqual(mockConfig);
      expect(mockConfigFileOps.fileExists).toHaveBeenCalledWith('test-config.yaml');
      expect(mockConfigFileOps.readFileSync).toHaveBeenCalledWith('test-config.yaml');
      expect(mockConfigFileOps.parseYamlContent).toHaveBeenCalledWith('yaml content');
      expect(mockConfigValidation.validatePraetorianConfig).toHaveBeenCalledWith(mockConfig);
    });

    it('should return cached config on subsequent calls', () => {
      const result1 = configParser.load();
      const result2 = configParser.load();
      
      expect(result1).toBe(result2);
      expect(mockConfigFileOps.fileExists).toHaveBeenCalledTimes(1);
    });

    it('should throw error when file does not exist', () => {
      mockConfigFileOps.fileExists.mockReturnValue(false);
      
      expect(() => configParser.load()).toThrow('Configuration file not found: test-config.yaml');
    });

    it('should throw error when file read fails', () => {
      mockConfigFileOps.readFileSync.mockReturnValue({
        success: false,
        error: 'Permission denied'
      });
      
      expect(() => configParser.load()).toThrow('Permission denied');
    });

    it('should throw error when file content is empty', () => {
      mockConfigFileOps.readFileSync.mockReturnValue({
        success: true,
        content: null
      });
      
      expect(() => configParser.load()).toThrow('Failed to read configuration file');
    });

    it('should throw error when YAML parsing fails', () => {
      mockConfigFileOps.parseYamlContent.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });
      
      expect(() => configParser.load()).toThrow('Failed to parse configuration file: Invalid YAML');
    });

    it('should throw error when configuration validation fails', () => {
      mockConfigValidation.validatePraetorianConfig.mockReturnValue({
        isValid: false,
        errors: ['Missing required field: files']
      });
      
      expect(() => configParser.load()).toThrow('Configuration validation failed: Missing required field: files');
    });
  });

  describe('getFilesToCompare', () => {
    it('should return files array when available', () => {
      const result = configParser.getFilesToCompare();
      
      expect(result).toEqual(['file1.yaml', 'file2.yaml']);
    });

    it('should return environment files when files array is empty', () => {
      mockConfig.files = [];
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getFilesToCompare();
      
      expect(result).toEqual(['config-dev.yaml', 'config-prod.yaml']);
    });

    it('should throw error when no files to validate', () => {
      mockConfigValidation.hasFilesToValidate.mockReturnValue(false);
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      expect(() => configParser.getFilesToCompare()).toThrow('No files specified in configuration. Use "files" or "environments" section.');
    });

    it('should throw error when both files and environments are empty', () => {
      mockConfig.files = [];
      mockConfig.environments = {};
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      mockConfigValidation.hasFilesToValidate.mockReturnValue(false);
      
      expect(() => configParser.getFilesToCompare()).toThrow('No files specified in configuration. Use "files" or "environments" section.');
    });
  });

  describe('getEnvironmentFiles', () => {
    it('should return specific environment file', () => {
      const result = configParser.getEnvironmentFiles('dev');
      
      expect(result).toEqual(['config-dev.yaml']);
    });

    it('should throw error when specific environment not found', () => {
      expect(() => configParser.getEnvironmentFiles('staging')).toThrow("Environment 'staging' not found in configuration");
    });

    it('should return all environment files when no environment specified', () => {
      const result = configParser.getEnvironmentFiles();
      
      expect(result).toEqual(['config-dev.yaml', 'config-prod.yaml']);
    });

  });

  describe('getIgnoreKeys', () => {
    it('should return ignore keys array', () => {
      const result = configParser.getIgnoreKeys();
      
      expect(result).toEqual(['temp', 'cache']);
    });

    it('should return empty array when ignore_keys is not an array', () => {
      mockConfig.ignore_keys = null as any;
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getIgnoreKeys();
      
      expect(result).toEqual([]);
    });
  });

  describe('getRequiredKeys', () => {
    it('should return required keys array', () => {
      const result = configParser.getRequiredKeys();
      
      expect(result).toEqual(['id', 'name']);
    });

    it('should return empty array when required_keys is not an array', () => {
      mockConfig.required_keys = null as any;
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getRequiredKeys();
      
      expect(result).toEqual([]);
    });
  });

  describe('getSchema', () => {
    it('should return schema object', () => {
      const result = configParser.getSchema();
      
      expect(result).toEqual({ id: 'string', name: 'string' });
    });

    it('should return empty object when schema is not an object', () => {
      mockConfig.schema = null as any;
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getSchema();
      
      expect(result).toEqual({});
    });
  });

  describe('getPatterns', () => {
    it('should return patterns object', () => {
      const result = configParser.getPatterns();
      
      expect(result).toEqual({ email: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$' });
    });

    it('should return empty object when patterns is not an object', () => {
      mockConfig.patterns = null as any;
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getPatterns();
      
      expect(result).toEqual({});
    });
  });

  describe('getForbiddenKeys', () => {
    it('should return forbidden keys array', () => {
      const result = configParser.getForbiddenKeys();
      
      expect(result).toEqual(['password', 'secret']);
    });

    it('should return empty array when forbidden_keys is not an array', () => {
      mockConfig.forbidden_keys = null as any;
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getForbiddenKeys();
      
      expect(result).toEqual([]);
    });
  });

  describe('getEnvironments', () => {
    it('should return environments object', () => {
      const result = configParser.getEnvironments();
      
      expect(result).toEqual({
        dev: 'config-dev.yaml',
        prod: 'config-prod.yaml'
      });
    });

    it('should return empty object when environments is not an object', () => {
      mockConfig.environments = null as any;
      mockConfigFileOps.parseYamlContent.mockReturnValue(mockConfig);
      
      const result = configParser.getEnvironments();
      
      expect(result).toEqual({});
    });
  });

  describe('exists', () => {
    it('should return true when file exists', () => {
      mockConfigFileOps.fileExists.mockReturnValue(true);
      
      const result = configParser.exists();
      
      expect(result).toBe(true);
      expect(mockConfigFileOps.fileExists).toHaveBeenCalledWith('test-config.yaml');
    });

    it('should return false when file does not exist', () => {
      mockConfigFileOps.fileExists.mockReturnValue(false);
      
      const result = configParser.exists();
      
      expect(result).toBe(false);
    });
  });

  describe('createDefault', () => {
    beforeEach(() => {
      mockConfigFileOps.fileExists.mockReturnValue(false);
      mockConfigFileOps.writeFileSync.mockReturnValue({ success: true });
      mockConfigFileOps.createDirectorySync.mockReturnValue({ success: true });
      mockConfigFileOps.getDirectoryName.mockReturnValue('/test');
      mockConfigFileOps.joinPath.mockImplementation((...args: string[]) => path.join(...args));
      mockRuleTemplates.getRuleTemplate.mockReturnValue('template content');
    });

    it('should create default configuration file', () => {
      configParser.createDefault();
      
      expect(mockConfigFileOps.writeFileSync).toHaveBeenCalledWith('test-config.yaml', 'default config content');
    });

    it('should throw error when file already exists', () => {
      mockConfigFileOps.fileExists.mockReturnValue(true);
      
      expect(() => configParser.createDefault()).toThrow('Configuration file already exists: test-config.yaml');
    });

    it('should throw error when file write fails', () => {
      mockConfigFileOps.writeFileSync.mockReturnValue({
        success: false,
        error: 'Permission denied'
      });
      
      expect(() => configParser.createDefault()).toThrow('Permission denied');
    });

    it('should create example rule files', () => {
      configParser.createDefault();
      
      expect(mockConfigFileOps.createDirectorySync).toHaveBeenCalledWith('/test/rules');
      expect(mockConfigFileOps.writeFileSync).toHaveBeenCalledTimes(5); // 1 config + 4 rule files
      expect(mockRuleTemplates.getRuleTemplate).toHaveBeenCalledTimes(4);
    });

    it('should skip existing rule files', () => {
      mockConfigFileOps.fileExists
        .mockReturnValueOnce(false) // config file
        .mockReturnValueOnce(true)  // structure.yaml exists
        .mockReturnValue(false);    // other files don't exist
      
      configParser.createDefault();
      
      expect(mockConfigFileOps.writeFileSync).toHaveBeenCalledTimes(4); // 1 config + 3 rule files
    });

    it('should throw error when directory creation fails', () => {
      mockConfigFileOps.createDirectorySync.mockReturnValue({
        success: false,
        error: 'Permission denied'
      });
      
      expect(() => configParser.createDefault()).toThrow('Permission denied');
    });
  });
});
