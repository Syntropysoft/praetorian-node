/**
 * IniFileAdapter Tests
 * 
 * Tests for INI file parsing functionality with SOLID SRP and functional programming
 */

import { IniFileAdapter, parseIniContent, parseIniValue } from '../../../../src/infrastructure/adapters/readers/IniFileAdapter';
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

describe('IniFileAdapter', () => {
  let adapter: IniFileAdapter;
  let tempDir: string;

  beforeEach(() => {
    adapter = new IniFileAdapter();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'praetorian-ini-test-'));
    
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
    it('should return true for .ini files', () => {
      expect(adapter.canHandle('config.ini')).toBe(true);
      expect(adapter.canHandle('/path/to/file.ini')).toBe(true);
    });

    it('should return true for .cfg files', () => {
      expect(adapter.canHandle('config.cfg')).toBe(true);
      expect(adapter.canHandle('/path/to/file.cfg')).toBe(true);
    });

    it('should return true for .conf files', () => {
      expect(adapter.canHandle('config.conf')).toBe(true);
      expect(adapter.canHandle('/path/to/file.conf')).toBe(true);
    });

    it('should return false for non-INI files', () => {
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
    it('should return ini format', () => {
      expect(adapter.getFormat()).toBe('ini');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return ini extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.ini', '.cfg', '.conf']);
    });
  });

  describe('read', () => {
    it('should read and parse INI file with sections', async () => {
      const testFile = path.join(tempDir, 'test.ini');
      const content = `
        # Test INI file
        [database]
        host=localhost
        port=5432
        name=myapp
        debug=true
        
        [app]
        name=MyApp
        version=1.0.0
        timeout=30
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'database': {
          'host': 'localhost',
          'port': 5432,
          'name': 'myapp',
          'debug': true
        },
        'app': {
          'name': 'MyApp',
          'version': '1.0.0',
          'timeout': 30
        }
      });
    });

    it('should handle INI file without sections', async () => {
      const testFile = path.join(tempDir, 'test.ini');
      const content = `
        # Simple INI without sections
        host=localhost
        port=5432
        debug=true
        name=MyApp
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({});
    });

    it('should handle empty sections', async () => {
      const testFile = path.join(tempDir, 'test.ini');
      const content = `
        [empty]
        
        [database]
        host=localhost
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'empty': {},
        'database': {
          'host': 'localhost'
        }
      });
    });

    it('should handle quoted values', async () => {
      const testFile = path.join(tempDir, 'test.ini');
      const content = `
        [app]
        name="My Application"
        description='A test application'
        version="1.0.0"
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'app': {
          'name': 'My Application',
          'description': 'A test application',
          'version': '1.0.0'
        }
      });
    });

    it('should skip comments and empty lines', async () => {
      const testFile = path.join(tempDir, 'test.ini');
      const content = `
        # This is a comment
        ; This is also a comment
        
        [database]
        host=localhost
        ; Another comment
        port=5432
        
        # Final comment
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'database': {
          'host': 'localhost',
          'port': 5432
        }
      });
    });

    it('should handle malformed lines gracefully', async () => {
      const testFile = path.join(tempDir, 'test.ini');
      const content = `
        [database]
        host=localhost
        =invalid
        valid=value
        invalid
        another=test
      `;

      fs.writeFileSync(testFile, content);
      mockReadFile.mockResolvedValue(content);

      const result = await adapter.read(testFile);

      expect(result).toEqual({
        'database': {
          'host': 'localhost',
          'valid': 'value',
          'another': 'test'
        }
      });
    });

    it('should throw error for invalid file path', async () => {
      await expect(adapter.read('')).rejects.toThrow('File path is required');
      await expect(adapter.read(null as any)).rejects.toThrow('File path is required');
      await expect(adapter.read(undefined as any)).rejects.toThrow('File path is required');
    });

    it('should throw error for non-existent file', async () => {
      // fs.existsSync will return false for non-existent files by default
      await expect(adapter.read('nonexistent.ini')).rejects.toThrow('File not found');
    });
  });
});

describe('parseIniContent', () => {
  it('should parse simple INI with sections', () => {
    const content = `
      [section1]
      key1=value1
      key2=value2
      
      [section2]
      key3=value3
    `;
    const result = parseIniContent(content);

    expect(result).toEqual({
      'section1': {
        'key1': 'value1',
        'key2': 'value2'
      },
      'section2': {
        'key3': 'value3'
      }
    });
  });

  it('should handle empty content', () => {
    expect(parseIniContent('')).toEqual({});
    expect(parseIniContent(null as any)).toEqual({});
    expect(parseIniContent(undefined as any)).toEqual({});
  });

  it('should handle content with only comments', () => {
    const content = '# Comment 1\n; Comment 2\n\n# Comment 3';
    const result = parseIniContent(content);

    expect(result).toEqual({});
  });

  it('should handle mixed content', () => {
    const content = `
      # Header comment
      [database]
      host=localhost
      port=5432
      debug=true
      
      ; App section
      [app]
      name=MyApp
      version=1.0.0
      timeout=30
    `;

    const result = parseIniContent(content);

    expect(result).toEqual({
      'database': {
        'host': 'localhost',
        'port': 5432,
        'debug': true
      },
      'app': {
        'name': 'MyApp',
        'version': '1.0.0',
        'timeout': 30
      }
    });
  });

  it('should handle empty sections', () => {
    const content = `
      [empty1]
      
      [empty2]
      
      [database]
      host=localhost
    `;

    const result = parseIniContent(content);

    expect(result).toEqual({
      'empty1': {},
      'empty2': {},
      'database': {
        'host': 'localhost'
      }
    });
  });

  it('should handle invalid section headers', () => {
    const content = `
      [valid]
      key=value
      
      [invalid
      key2=value2
      
      valid2]
      key3=value3
    `;

    const result = parseIniContent(content);

    expect(result).toEqual({
      'valid': {
        'key': 'value'
      }
    });
  });
});

describe('parseIniValue', () => {
  it('should parse string values', () => {
    expect(parseIniValue('hello')).toBe('hello');
    expect(parseIniValue('world')).toBe('world');
    expect(parseIniValue('test value')).toBe('test value');
  });

  it('should parse boolean values', () => {
    expect(parseIniValue('true')).toBe(true);
    expect(parseIniValue('false')).toBe(false);
    expect(parseIniValue('yes')).toBe(true);
    expect(parseIniValue('no')).toBe(false);
    expect(parseIniValue('on')).toBe(true);
    expect(parseIniValue('off')).toBe(false);
    expect(parseIniValue('TRUE')).toBe(true);
    expect(parseIniValue('FALSE')).toBe(false);
  });

  it('should parse numeric values', () => {
    expect(parseIniValue('123')).toBe(123);
    expect(parseIniValue('45.67')).toBe(45.67);
    expect(parseIniValue('0')).toBe(0);
    expect(parseIniValue('-10')).toBe(-10);
    expect(parseIniValue('3.14159')).toBe(3.14159);
  });

  it('should remove quotes', () => {
    expect(parseIniValue('"quoted"')).toBe('quoted');
    expect(parseIniValue("'quoted'")).toBe('quoted');
    expect(parseIniValue('"quoted with spaces"')).toBe('quoted with spaces');
  });

  it('should handle empty values', () => {
    expect(parseIniValue('')).toBe('');
    expect(parseIniValue(null as any)).toBe('');
    expect(parseIniValue(undefined as any)).toBe('');
  });

  it('should handle quoted booleans', () => {
    expect(parseIniValue('"true"')).toBe('true'); // String, not boolean
    expect(parseIniValue("'false'")).toBe('false'); // String, not boolean
  });

  it('should handle quoted numbers', () => {
    expect(parseIniValue('"123"')).toBe('123'); // String, not number
    expect(parseIniValue("'456'")).toBe('456'); // String, not number
  });

  it('should handle edge cases', () => {
    expect(parseIniValue('0')).toBe(0);
    expect(parseIniValue('00')).toBe('00'); // Not a valid number (starts with 0)
    expect(parseIniValue('truee')).toBe('truee'); // Not a boolean
    expect(parseIniValue('falsy')).toBe('falsy'); // Not a boolean
  });
});
