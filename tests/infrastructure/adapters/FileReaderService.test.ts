import { FileReaderService } from '../../../src/infrastructure/adapters/FileReaderService';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    stat: jest.fn()
  }
}));

const fs = require('fs');
const mockReadFile = fs.promises.readFile;
const mockExistsSync = fs.existsSync;
const mockStat = fs.promises.stat;

describe('FileReaderService', () => {
  let fileReaderService: FileReaderService;

  beforeEach(() => {
    fileReaderService = new FileReaderService();
    jest.clearAllMocks();
  });

  describe('isSupported', () => {
    it('should return true for supported file formats', () => {
      expect(fileReaderService.isSupported('config.yaml')).toBe(true);
      expect(fileReaderService.isSupported('config.json')).toBe(true);
      expect(fileReaderService.isSupported('config.toml')).toBe(true);
      expect(fileReaderService.isSupported('config.ini')).toBe(true);
      expect(fileReaderService.isSupported('config.xml')).toBe(true);
      expect(fileReaderService.isSupported('config.env')).toBe(true);
      expect(fileReaderService.isSupported('config.properties')).toBe(true);
      expect(fileReaderService.isSupported('config.hcl')).toBe(true);
      expect(fileReaderService.isSupported('config.plist')).toBe(true);
    });

    it('should return false for unsupported file formats', () => {
      expect(fileReaderService.isSupported('config.txt')).toBe(false);
      expect(fileReaderService.isSupported('config.doc')).toBe(false);
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return all supported extensions', () => {
      const extensions = fileReaderService.getSupportedExtensions();
      
      expect(extensions).toContain('.yaml');
      expect(extensions).toContain('.yml');
      expect(extensions).toContain('.json');
      expect(extensions).toContain('.env');
      expect(extensions).toContain('.toml');
      expect(extensions).toContain('.ini');
      expect(extensions).toContain('.cfg');
      expect(extensions).toContain('.conf');
      expect(extensions).toContain('.xml');
      expect(extensions).toContain('.properties');
      expect(extensions).toContain('.hcl');
      expect(extensions).toContain('.tf');
      expect(extensions).toContain('.tfvars');
      expect(extensions).toContain('.plist');
    });
  });

  describe('validateFiles', () => {
    it('should separate valid and invalid files', () => {
      const files = ['config.yaml', 'config.json', 'config.txt', 'config.doc'];
      const result = fileReaderService.validateFiles(files);
      
      expect(result.valid).toEqual(['config.yaml', 'config.json']);
      expect(result.invalid).toEqual(['config.txt', 'config.doc']);
    });

    it('should return all files as valid when all are supported', () => {
      const files = ['config.yaml', 'config.json', 'config.toml'];
      const result = fileReaderService.validateFiles(files);
      
      expect(result.valid).toEqual(files);
      expect(result.invalid).toEqual([]);
    });

    it('should return all files as invalid when none are supported', () => {
      const files = ['config.txt', 'config.doc', 'config.pdf'];
      const result = fileReaderService.validateFiles(files);
      
      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual(files);
    });
  });

  describe('readFile', () => {
    it('should read and parse YAML file', async () => {
      const yamlContent = `
database:
  host: localhost
  port: 5432
      `;
      
      mockExistsSync.mockReturnValue(true);
      mockReadFile.mockResolvedValue(yamlContent);
      
      const result = await fileReaderService.readFile('config.yaml');
      
      expect(result.path).toBe('config.yaml');
      expect(result.format).toBe('yaml');
      expect(result.content).toEqual({
        database: {
          host: 'localhost',
          port: 5432
        }
      });
    });

    it('should read and parse JSON file', async () => {
      const jsonContent = `{
        "database": {
          "host": "localhost",
          "port": 5432
        }
      }`;
      
      mockExistsSync.mockReturnValue(true);
      mockReadFile.mockResolvedValue(jsonContent);
      
      const result = await fileReaderService.readFile('config.json');
      
      expect(result.path).toBe('config.json');
      expect(result.format).toBe('json');
      expect(result.content).toEqual({
        database: {
          host: 'localhost',
          port: 5432
        }
      });
    });

    it('should throw error for unsupported file format', async () => {
      await expect(fileReaderService.readFile('config.txt')).rejects.toThrow(
        'Unsupported file format: config.txt'
      );
    });
  });

  describe('readFiles', () => {
    it('should read multiple files successfully', async () => {
      const yamlContent = `
database:
  host: localhost
      `;
      const jsonContent = `{
        "api": {
          "port": 3000
        }
      }`;
      
      mockExistsSync.mockReturnValue(true);
      mockReadFile
        .mockResolvedValueOnce(yamlContent)
        .mockResolvedValueOnce(jsonContent);
      
      const results = await fileReaderService.readFiles(['config.yaml', 'config.json']);
      
      expect(results).toHaveLength(2);
      expect(results[0].format).toBe('yaml');
      expect(results[1].format).toBe('json');
    });

    it('should throw error when any file is unsupported', async () => {
      await expect(fileReaderService.readFiles(['config.yaml', 'config.txt'])).rejects.toThrow(
        'Failed to read file config.txt: Unsupported file format: config.txt'
      );
    });
  });
}); 