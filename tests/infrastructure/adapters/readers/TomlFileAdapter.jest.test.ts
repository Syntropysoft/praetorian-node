import { TomlFileAdapter, parseTomlContent } from '../../../../src/infrastructure/adapters/readers/TomlFileAdapter';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

// Mock toml library
jest.mock('toml', () => ({
  parse: jest.fn()
}));

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn()
  },
  existsSync: jest.fn()
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockToml = require('toml') as jest.Mocked<typeof import('toml')>;

describe('TomlFileAdapter', () => {
  let adapter: TomlFileAdapter;
  let tempDir: string;
  let mockReadFile: jest.MockedFunction<typeof fs.promises.readFile>;
  let mockAccess: jest.MockedFunction<typeof fs.promises.access>;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    adapter = new TomlFileAdapter();
    tempDir = tmpdir();
    mockReadFile = mockFs.promises.readFile as jest.MockedFunction<typeof fs.promises.readFile>;
    mockAccess = mockFs.promises.access as jest.MockedFunction<typeof fs.promises.access>;
    mockExistsSync = mockFs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
    
    // Mock file access to always succeed
    mockAccess.mockResolvedValue(undefined);
    mockExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canHandle', () => {
    it('should return true for .toml files', () => {
      expect(adapter.canHandle('config.toml')).toBe(true);
    });

    it('should return false for other file extensions', () => {
      expect(adapter.canHandle('config.yaml')).toBe(false);
      expect(adapter.canHandle('config.json')).toBe(false);
      expect(adapter.canHandle('config.txt')).toBe(false);
    });

    it('should return false for null or undefined file path', () => {
      expect(adapter.canHandle(null as any)).toBe(false);
      expect(adapter.canHandle(undefined as any)).toBe(false);
    });

    it('should return false for non-string file path', () => {
      expect(adapter.canHandle(123 as any)).toBe(false);
      expect(adapter.canHandle({} as any)).toBe(false);
    });
  });

  describe('read', () => {
    it('should read and parse TOML file successfully', async () => {
      const content = '[database]\nhost = "localhost"\nport = 5432';
      const filePath = path.join(tempDir, 'test.toml');
      const parsedResult = { database: { host: 'localhost', port: 5432 } };
      
      mockReadFile.mockResolvedValue(content);
      mockToml.parse.mockReturnValue(parsedResult);
      
      const result = await adapter.read(filePath);
      
      expect(result).toEqual(parsedResult);
      expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf8');
      expect(mockToml.parse).toHaveBeenCalledWith(content);
    });

    it('should throw error for invalid file path', async () => {
      await expect(adapter.read(null as any)).rejects.toThrow('File path is required');
      await expect(adapter.read(undefined as any)).rejects.toThrow('File path is required');
      await expect(adapter.read('')).rejects.toThrow('File path is required');
    });

    it('should throw error when file read fails', async () => {
      const filePath = path.join(tempDir, 'nonexistent.toml');
      const error = new Error('File not found');
      
      mockReadFile.mockRejectedValue(error);
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse TOML file');
    });

    it('should throw error when TOML parsing fails', async () => {
      const content = 'invalid toml content';
      const filePath = path.join(tempDir, 'test.toml');
      
      mockReadFile.mockResolvedValue(content);
      mockToml.parse.mockImplementation(() => {
        throw new Error('Invalid TOML');
      });
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse TOML file');
    });
  });

  describe('getFormat', () => {
    it('should return toml format', () => {
      expect(adapter.getFormat()).toBe('toml');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return supported extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.toml']);
    });
  });
});

describe('parseTomlContent', () => {
  describe('Guard clauses', () => {
    it('should return empty object for null content', () => {
      const result = parseTomlContent(null as any);
      expect(result).toEqual({});
    });

    it('should return empty object for undefined content', () => {
      const result = parseTomlContent(undefined as any);
      expect(result).toEqual({});
    });

    it('should return empty object for empty string', () => {
      const result = parseTomlContent('');
      expect(result).toEqual({});
    });

    it('should return empty object for non-string content', () => {
      const result = parseTomlContent(123 as any);
      expect(result).toEqual({});
    });
  });

  describe('TOML parsing', () => {
    it('should parse valid TOML content', () => {
      const content = '[database]\nhost = "localhost"\nport = 5432';
      const expectedResult = { database: { host: 'localhost', port: 5432 } };
      
      mockToml.parse.mockReturnValue(expectedResult);
      
      const result = parseTomlContent(content);
      
      expect(result).toEqual(expectedResult);
      expect(mockToml.parse).toHaveBeenCalledWith(content);
    });

    it('should handle null result from parser', () => {
      const content = '# empty toml file';
      
      mockToml.parse.mockReturnValue(null);
      
      const result = parseTomlContent(content);
      
      expect(result).toEqual({});
    });

    it('should throw error when parsing fails', () => {
      const content = 'invalid toml';
      const error = new Error('TOML parsing error');
      
      mockToml.parse.mockImplementation(() => {
        throw error;
      });
      
      expect(() => parseTomlContent(content)).toThrow('TOML parsing failed');
    });
  });
});