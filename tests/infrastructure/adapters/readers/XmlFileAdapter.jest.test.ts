import { XmlFileAdapter, parseXmlContent } from '../../../../src/infrastructure/adapters/readers/XmlFileAdapter';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

// Mock xml2js library
jest.mock('xml2js', () => ({
  Parser: jest.fn()
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
const mockXml2js = require('xml2js') as jest.Mocked<typeof import('xml2js')>;

describe('XmlFileAdapter', () => {
  let adapter: XmlFileAdapter;
  let tempDir: string;
  let mockReadFile: jest.MockedFunction<typeof fs.promises.readFile>;
  let mockAccess: jest.MockedFunction<typeof fs.promises.access>;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;
  let mockParseStringPromise: jest.MockedFunction<any>;

  beforeEach(() => {
    adapter = new XmlFileAdapter();
    tempDir = tmpdir();
    mockReadFile = mockFs.promises.readFile as jest.MockedFunction<typeof fs.promises.readFile>;
    mockAccess = mockFs.promises.access as jest.MockedFunction<typeof fs.promises.access>;
    mockExistsSync = mockFs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
    
    // Mock file access to always succeed
    mockAccess.mockResolvedValue(undefined);
    mockExistsSync.mockReturnValue(true);
    
    // Mock xml2js parser
    mockParseStringPromise = jest.fn();
    mockXml2js.Parser.mockImplementation(() => ({
      parseStringPromise: mockParseStringPromise
    }) as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canHandle', () => {
    it('should return true for .xml files', () => {
      expect(adapter.canHandle('config.xml')).toBe(true);
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
    it('should read and parse XML file successfully', async () => {
      const content = '<?xml version="1.0"?><config><name>test</name></config>';
      const filePath = path.join(tempDir, 'test.xml');
      const parsedResult = { config: { name: 'test' } };
      
      mockReadFile.mockResolvedValue(content);
      mockParseStringPromise.mockResolvedValue(parsedResult);
      
      const result = await adapter.read(filePath);
      
      expect(result).toEqual(parsedResult);
      expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf8');
      expect(mockParseStringPromise).toHaveBeenCalledWith(content);
    });

    it('should throw error for invalid file path', async () => {
      await expect(adapter.read(null as any)).rejects.toThrow('File path is required');
      await expect(adapter.read(undefined as any)).rejects.toThrow('File path is required');
      await expect(adapter.read('')).rejects.toThrow('File path is required');
    });

    it('should throw error when file read fails', async () => {
      const filePath = path.join(tempDir, 'nonexistent.xml');
      const error = new Error('File not found');
      
      mockReadFile.mockRejectedValue(error);
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse XML file');
    });

    it('should throw error when XML parsing fails', async () => {
      const content = 'invalid xml content';
      const filePath = path.join(tempDir, 'test.xml');
      
      mockReadFile.mockResolvedValue(content);
      mockParseStringPromise.mockRejectedValue(new Error('Invalid XML'));
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse XML file');
    });
  });

  describe('getFormat', () => {
    it('should return xml format', () => {
      expect(adapter.getFormat()).toBe('xml');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return supported extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.xml']);
    });
  });
});

describe('parseXmlContent', () => {
  let mockParseStringPromise: jest.MockedFunction<any>;

  beforeEach(() => {
    mockParseStringPromise = jest.fn();
    mockXml2js.Parser.mockImplementation(() => ({
      parseStringPromise: mockParseStringPromise
    }) as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Guard clauses', () => {
    it('should return empty object for null content', async () => {
      const result = await parseXmlContent(null as any);
      expect(result).toEqual({});
    });

    it('should return empty object for undefined content', async () => {
      const result = await parseXmlContent(undefined as any);
      expect(result).toEqual({});
    });

    it('should return empty object for empty string', async () => {
      const result = await parseXmlContent('');
      expect(result).toEqual({});
    });

    it('should return empty object for non-string content', async () => {
      const result = await parseXmlContent(123 as any);
      expect(result).toEqual({});
    });
  });

  describe('XML parsing', () => {
    it('should parse valid XML content', async () => {
      const content = '<?xml version="1.0"?><config><name>test</name><port>8080</port></config>';
      const expectedResult = { config: { name: 'test', port: '8080' } };
      
      mockParseStringPromise.mockResolvedValue(expectedResult);
      
      const result = await parseXmlContent(content);
      
      expect(result).toEqual(expectedResult);
      expect(mockParseStringPromise).toHaveBeenCalledWith(content);
    });

    it('should handle null result from parser', async () => {
      const content = '<?xml version="1.0"?><config></config>';
      
      mockParseStringPromise.mockResolvedValue(null);
      
      const result = await parseXmlContent(content);
      
      expect(result).toEqual({});
    });

    it('should throw error when parsing fails', async () => {
      const content = 'invalid xml';
      const error = new Error('XML parsing error');
      
      mockParseStringPromise.mockRejectedValue(error);
      
      await expect(parseXmlContent(content)).rejects.toThrow('XML parsing failed');
    });
  });

  describe('Parser configuration', () => {
    it('should create parser with correct options', async () => {
      const content = '<test>value</test>';
      
      mockParseStringPromise.mockResolvedValue({ test: 'value' });
      
      await parseXmlContent(content);
      
      expect(mockXml2js.Parser).toHaveBeenCalledWith({
        explicitArray: false,
        mergeAttrs: true,
        explicitRoot: false
      });
    });
  });
});