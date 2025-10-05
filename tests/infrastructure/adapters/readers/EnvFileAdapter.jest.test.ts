/**
 * EnvFileAdapter Tests
 * 
 * Tests for ENV file parsing functionality with SOLID SRP and functional programming
 */

import { EnvFileAdapter, parseEnvContent, parseEnvValue } from '../../../../src/infrastructure/adapters/readers/EnvFileAdapter';
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

describe('EnvFileAdapter', () => {
  let adapter: EnvFileAdapter;
  let tempDir: string;

  beforeEach(() => {
    adapter = new EnvFileAdapter();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'praetorian-env-test-'));
    
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
    it('should return true for .env files', () => {
      expect(adapter.canHandle('config.env')).toBe(true);
      expect(adapter.canHandle('/path/to/file.env')).toBe(true);
    });

    it('should return true for env.* files', () => {
      expect(adapter.canHandle('env.development')).toBe(true);
      expect(adapter.canHandle('env.production')).toBe(true);
    });

    it('should return false for non-ENV files', () => {
      expect(adapter.canHandle('config.json')).toBe(false);
      expect(adapter.canHandle('config.yaml')).toBe(false);
      expect(adapter.canHandle('config.properties')).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(adapter.canHandle('')).toBe(false);
      expect(adapter.canHandle(null as any)).toBe(false);
      expect(adapter.canHandle(undefined as any)).toBe(false);
      expect(adapter.canHandle(123 as any)).toBe(false);
    });
  });

  describe('getFormat', () => {
    it('should return env format', () => {
      expect(adapter.getFormat()).toBe('env');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return env extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.env']);
    });
  });

  describe('read', () => {
    it('should read and parse ENV file', async () => {
      const testFile = path.join(tempDir, 'test.env');
      const content = `
        # Test ENV file
        APP_NAME=MyApp
        APP_VERSION=1.0.0
        DEBUG=true
        PORT=8080
        DATABASE_URL=postgres://localhost:5432/mydb
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'APP_NAME': 'MyApp',
        'APP_VERSION': '1.0.0',
        'DEBUG': 'true',
        'PORT': '8080',
        'DATABASE_URL': 'postgres://localhost:5432/mydb'
      });
    });

    it('should handle quoted values', async () => {
      const testFile = path.join(tempDir, 'test.env');
      const content = `
        SINGLE_QUOTE='quoted value'
        DOUBLE_QUOTE="quoted value"
        MIXED="single 'quotes' inside"
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'SINGLE_QUOTE': 'quoted value',
        'DOUBLE_QUOTE': 'quoted value',
        'MIXED': "single 'quotes' inside"
      });
    });

    it('should handle empty values', async () => {
      const testFile = path.join(tempDir, 'test.env');
      const content = `
        EMPTY_KEY=
        EMPTY_KEY2=""
        NORMAL_KEY=value
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'EMPTY_KEY': '',
        'EMPTY_KEY2': '',
        'NORMAL_KEY': 'value'
      });
    });

    it('should skip comments and empty lines', async () => {
      const testFile = path.join(tempDir, 'test.env');
      const content = `
        # This is a comment
        APP_NAME=MyApp
        
        # Another comment
        DEBUG=true
        
        # Final comment
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'APP_NAME': 'MyApp',
        'DEBUG': 'true'
      });
    });

    it('should handle malformed lines gracefully', async () => {
      const testFile = path.join(tempDir, 'test.env');
      const content = `
        VALID_KEY=value
        =invalid
        invalid
        ANOTHER_VALID=test
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'VALID_KEY': 'value',
        'ANOTHER_VALID': 'test'
      });
    });

    it('should handle values with equals signs', async () => {
      const testFile = path.join(tempDir, 'test.env');
      const content = `
        CONNECTION_STRING=postgresql://user:pass@host:5432/db
        API_URL=https://api.example.com/v1?key=value
        EQUALS_IN_VALUE=key=value=another
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'CONNECTION_STRING': 'postgresql://user:pass@host:5432/db',
        'API_URL': 'https://api.example.com/v1?key=value',
        'EQUALS_IN_VALUE': 'key=value=another'
      });
    });

    it('should throw error for invalid file path', async () => {
      await expect(adapter.read('')).rejects.toThrow('File path is required');
      await expect(adapter.read(null as any)).rejects.toThrow('File path is required');
      await expect(adapter.read(undefined as any)).rejects.toThrow('File path is required');
    });

    it('should throw error for non-existent file', async () => {
      // fs.existsSync will return false for non-existent files by default
      await expect(adapter.read('nonexistent.env')).rejects.toThrow('File not found');
    });
  });
});

describe('parseEnvContent', () => {
  it('should parse simple ENV content', () => {
    const content = 'KEY1=value1\nKEY2=value2';
    const result = parseEnvContent(content);

    expect(result).toEqual({
      'KEY1': 'value1',
      'KEY2': 'value2'
    });
  });

  it('should handle empty content', () => {
    expect(parseEnvContent('')).toEqual({});
    expect(parseEnvContent(null as any)).toEqual({});
    expect(parseEnvContent(undefined as any)).toEqual({});
  });

  it('should handle content with only comments', () => {
    const content = '# Comment 1\n# Comment 2\n\n# Comment 3';
    const result = parseEnvContent(content);

    expect(result).toEqual({});
  });

  it('should handle mixed content', () => {
    const content = `
      # Header comment
      APP_NAME=MyApp
      APP_VERSION=1.0.0
      
      # Database config
      DB_HOST=localhost
      DB_PORT=5432
      
      # Feature flags
      FEATURE_NEW=true
      FEATURE_OLD=false
    `;

    const result = parseEnvContent(content);

    expect(result).toEqual({
      'APP_NAME': 'MyApp',
      'APP_VERSION': '1.0.0',
      'DB_HOST': 'localhost',
      'DB_PORT': '5432',
      'FEATURE_NEW': 'true',
      'FEATURE_OLD': 'false'
    });
  });

  it('should handle quoted values', () => {
    const content = `
      SINGLE_QUOTE='quoted value'
      DOUBLE_QUOTE="quoted value"
      MIXED="single 'quotes' inside"
    `;

    const result = parseEnvContent(content);

    expect(result).toEqual({
      'SINGLE_QUOTE': 'quoted value',
      'DOUBLE_QUOTE': 'quoted value',
      'MIXED': "single 'quotes' inside"
    });
  });

  it('should handle empty values', () => {
    const content = `
      EMPTY_KEY=
      EMPTY_KEY2=""
      NORMAL_KEY=value
    `;

    const result = parseEnvContent(content);

    expect(result).toEqual({
      'EMPTY_KEY': '',
      'EMPTY_KEY2': '',
      'NORMAL_KEY': 'value'
    });
  });

  it('should handle values with spaces around equals', () => {
    const content = `
      KEY1 = value1
      KEY2= value2
      KEY3 =value3
      KEY4 = value4
    `;

    const result = parseEnvContent(content);

    expect(result).toEqual({
      'KEY1': 'value1',
      'KEY2': 'value2',
      'KEY3': 'value3',
      'KEY4': 'value4'
    });
  });

  it('should handle values with equals signs inside', () => {
    const content = `
      CONNECTION_STRING=postgresql://user:pass@host:5432/db
      API_URL=https://api.example.com/v1?key=value
      EQUALS_IN_VALUE=key=value=another
    `;

    const result = parseEnvContent(content);

    expect(result).toEqual({
      'CONNECTION_STRING': 'postgresql://user:pass@host:5432/db',
      'API_URL': 'https://api.example.com/v1?key=value',
      'EQUALS_IN_VALUE': 'key=value=another'
    });
  });
});

describe('parseEnvValue', () => {
  it('should parse string values', () => {
    expect(parseEnvValue('hello')).toBe('hello');
    expect(parseEnvValue('world')).toBe('world');
    expect(parseEnvValue('test value')).toBe('test value');
  });

  it('should remove quotes', () => {
    expect(parseEnvValue('"quoted"')).toBe('quoted');
    expect(parseEnvValue("'quoted'")).toBe('quoted');
    expect(parseEnvValue('"quoted with spaces"')).toBe('quoted with spaces');
  });

  it('should handle empty values', () => {
    expect(parseEnvValue('')).toBe('');
    expect(parseEnvValue(null as any)).toBe('');
    expect(parseEnvValue(undefined as any)).toBe('');
  });

  it('should handle mixed quotes', () => {
    expect(parseEnvValue('"single \'quotes\' inside"')).toBe("single 'quotes' inside");
    expect(parseEnvValue("'double \"quotes\" inside'")).toBe('double "quotes" inside');
  });

  it('should handle incomplete quotes', () => {
    expect(parseEnvValue('"incomplete quote')).toBe('"incomplete quote');
    expect(parseEnvValue('incomplete quote\'')).toBe("incomplete quote'");
    expect(parseEnvValue('"')).toBe('"');
  });

  it('should handle values with special characters', () => {
    expect(parseEnvValue('value with spaces')).toBe('value with spaces');
    expect(parseEnvValue('value-with-dashes')).toBe('value-with-dashes');
    expect(parseEnvValue('value_with_underscores')).toBe('value_with_underscores');
    expect(parseEnvValue('value.with.dots')).toBe('value.with.dots');
  });
});
