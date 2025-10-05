/**
 * PropertiesFileAdapter Tests
 * 
 * Tests for Properties file parsing functionality with SOLID SRP and functional programming
 */

import { PropertiesFileAdapter, parsePropertiesContent, parsePropertiesValue } from '../../../../src/infrastructure/adapters/readers/PropertiesFileAdapter';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock fs.promises.readFile
const mockReadFile = jest.fn();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: (...args: any[]) => mockReadFile(...args),
  },
}));

describe('PropertiesFileAdapter', () => {
  let adapter: PropertiesFileAdapter;
  let tempDir: string;

    beforeEach(() => {
    adapter = new PropertiesFileAdapter();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'praetorian-properties-test-'));
    
    // Reset all mocks
    jest.clearAllMocks();
    mockReadFile.mockClear();
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('canHandle', () => {
    it('should return true for .properties files', () => {
      expect(adapter.canHandle('config.properties')).toBe(true);
      expect(adapter.canHandle('/path/to/file.properties')).toBe(true);
    });

    it('should return false for non-properties files', () => {
      expect(adapter.canHandle('config.json')).toBe(false);
      expect(adapter.canHandle('config.yaml')).toBe(false);
      expect(adapter.canHandle('config.xml')).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(adapter.canHandle('')).toBe(false);
      expect(adapter.canHandle(null as any)).toBe(false);
      expect(adapter.canHandle(undefined as any)).toBe(false);
      expect(adapter.canHandle(123 as any)).toBe(false);
    });
  });

  describe('getFormat', () => {
    it('should return properties format', () => {
      expect(adapter.getFormat()).toBe('properties');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return properties extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.properties']);
    });
  });

  describe('read', () => {
    it('should read and parse properties file', async () => {
      const testFile = path.join(tempDir, 'test.properties');
      const content = `
        # Test properties file
        app.name=MyApp
        app.version=1.0.0
        debug=true
        port=8080
        description=My Application
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'app.name': 'MyApp',
        'app.version': '1.0.0',
        'debug': true,
        'port': 8080,
        'description': 'My Application'
      });
    });

    it('should handle different separators', async () => {
      const testFile = path.join(tempDir, 'test.properties');
      const content = `
        key1=value1
        key2:value2
        key3 value3
        key4=value4
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3',
        'key4': 'value4'
      });
    });

    it('should handle quoted values', async () => {
      const testFile = path.join(tempDir, 'test.properties');
      const content = `
        single.quote='quoted value'
        double.quote="quoted value"
        mixed="single 'quotes' inside"
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'single.quote': 'quoted value',
        'double.quote': 'quoted value',
        'mixed': "single 'quotes' inside"
      });
    });

    it('should handle multi-line values', async () => {
      const testFile = path.join(tempDir, 'test.properties');
      const content = `
        multi.line=This is a long value that \\
        continues on the next line \\
        and ends here
        single.line=single value
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'multi.line': 'This is a long value that continues on the next line and ends here',
        'single.line': 'single value'
      });
    });

    it('should handle empty values', async () => {
      const testFile = path.join(tempDir, 'test.properties');
      const content = `
        empty.key=
        empty.key2:
        empty.key3 
        normal.key=value
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'empty.key': '',
        'empty.key2': '',
        'empty.key3': '',
        'normal.key': 'value'
      });
    });

    it('should skip comments and empty lines', async () => {
      const testFile = path.join(tempDir, 'test.properties');
      const content = `
        # This is a comment
        ! This is also a comment
        
        key1=value1
        
        # Another comment
        key2=value2
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'key1': 'value1',
        'key2': 'value2'
      });
    });

    it('should throw error for invalid file path', async () => {
      await expect(adapter.read('')).rejects.toThrow('File path is required');
      await expect(adapter.read(null as any)).rejects.toThrow('File path is required');
      await expect(adapter.read(undefined as any)).rejects.toThrow('File path is required');
    });

    it('should throw error for non-existent file', async () => {
      // fs.existsSync will return false for non-existent files by default
      await expect(adapter.read('nonexistent.properties')).rejects.toThrow('File not found');
    });
  });
});

describe('parsePropertiesContent', () => {
  it('should parse simple properties', () => {
    const content = 'key1=value1\nkey2=value2';
    const result = parsePropertiesContent(content);

    expect(result).toEqual({
      'key1': 'value1',
      'key2': 'value2'
    });
  });

  it('should handle empty content', () => {
    expect(parsePropertiesContent('')).toEqual({});
    expect(parsePropertiesContent(null as any)).toEqual({});
    expect(parsePropertiesContent(undefined as any)).toEqual({});
  });

  it('should handle content with only comments', () => {
    const content = '# Comment 1\n! Comment 2\n\n# Comment 3';
    const result = parsePropertiesContent(content);

    expect(result).toEqual({});
  });

  it('should handle mixed content', () => {
    const content = `
      # Header comment
      app.name=MyApp
      app.version=1.0.0
      
      # Database config
      db.host=localhost
      db.port=5432
      
      # Feature flags
      feature.new=true
      feature.old=false
    `;

    const result = parsePropertiesContent(content);

    expect(result).toEqual({
      'app.name': 'MyApp',
      'app.version': '1.0.0',
      'db.host': 'localhost',
      'db.port': 5432,
      'feature.new': true,
      'feature.old': false
    });
  });

  it('should handle multi-line properties', () => {
    const content = `
      description=This is a long description \\
      that spans multiple lines \\
      and ends here
      single=value
    `;

    const result = parsePropertiesContent(content);

    expect(result).toEqual({
      'description': 'This is a long description that spans multiple lines and ends here',
      'single': 'value'
    });
  });
});

describe('parsePropertiesValue', () => {
  it('should parse string values', () => {
    expect(parsePropertiesValue('hello')).toBe('hello');
    expect(parsePropertiesValue('world')).toBe('world');
    expect(parsePropertiesValue('test value')).toBe('test value');
  });

  it('should parse boolean values', () => {
    expect(parsePropertiesValue('true')).toBe(true);
    expect(parsePropertiesValue('false')).toBe(false);
    expect(parsePropertiesValue('yes')).toBe(true);
    expect(parsePropertiesValue('no')).toBe(false);
    expect(parsePropertiesValue('on')).toBe(true);
    expect(parsePropertiesValue('off')).toBe(false);
    expect(parsePropertiesValue('TRUE')).toBe(true);
    expect(parsePropertiesValue('FALSE')).toBe(false);
  });

  it('should parse numeric values', () => {
    expect(parsePropertiesValue('123')).toBe(123);
    expect(parsePropertiesValue('45.67')).toBe(45.67);
    expect(parsePropertiesValue('0')).toBe(0);
    expect(parsePropertiesValue('-10')).toBe(-10);
    expect(parsePropertiesValue('3.14159')).toBe(3.14159);
  });

  it('should remove quotes', () => {
    expect(parsePropertiesValue('"quoted"')).toBe('quoted');
    expect(parsePropertiesValue("'quoted'")).toBe('quoted');
    expect(parsePropertiesValue('"quoted with spaces"')).toBe('quoted with spaces');
  });

  it('should handle empty values', () => {
    expect(parsePropertiesValue('')).toBe('');
    expect(parsePropertiesValue(null as any)).toBe('');
    expect(parsePropertiesValue(undefined as any)).toBe('');
  });

  it('should handle quoted booleans', () => {
    expect(parsePropertiesValue('"true"')).toBe('true'); // String, not boolean
    expect(parsePropertiesValue("'false'")).toBe('false'); // String, not boolean
  });

  it('should handle quoted numbers', () => {
    expect(parsePropertiesValue('"123"')).toBe('123'); // String, not number
    expect(parsePropertiesValue("'456'")).toBe('456'); // String, not number
  });

  it('should handle edge cases', () => {
    expect(parsePropertiesValue('0')).toBe(0);
    expect(parsePropertiesValue('00')).toBe('00'); // Not a valid number (starts with 0)
    expect(parsePropertiesValue('truee')).toBe('truee'); // Not a boolean
    expect(parsePropertiesValue('falsy')).toBe('falsy'); // Not a boolean
  });
});
