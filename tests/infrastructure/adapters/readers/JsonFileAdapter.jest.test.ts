import { JsonFileAdapter, parseJsonContent } from '../../../../src/infrastructure/adapters/readers/JsonFileAdapter';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    access: jest.fn()
  },
  existsSync: jest.fn()
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('JsonFileAdapter', () => {
  let adapter: JsonFileAdapter;
  let tempDir: string;
  let mockReadFile: jest.MockedFunction<typeof fs.promises.readFile>;
  let mockAccess: jest.MockedFunction<typeof fs.promises.access>;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    adapter = new JsonFileAdapter();
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
    it('should return true for .json files', () => {
      expect(adapter.canHandle('config.json')).toBe(true);
    });

    it('should return false for other file extensions', () => {
      expect(adapter.canHandle('config.yaml')).toBe(false);
      expect(adapter.canHandle('config.xml')).toBe(false);
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
    it('should read and parse JSON file successfully', async () => {
      const content = '{"database": {"host": "localhost", "port": 5432, "name": "myapp"}}';
      const filePath = path.join(tempDir, 'test.json');
      
      mockReadFile.mockResolvedValue(content);
      
      const result = await adapter.read(filePath);
      
      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 5432,
          name: 'myapp'
        }
      });
      expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf8');
    });

    it('should throw error for invalid file path', async () => {
      await expect(adapter.read(null as any)).rejects.toThrow('File path is required');
      await expect(adapter.read(undefined as any)).rejects.toThrow('File path is required');
      await expect(adapter.read('')).rejects.toThrow('File path is required');
    });

    it('should throw error when file read fails', async () => {
      const filePath = path.join(tempDir, 'nonexistent.json');
      const error = new Error('File not found');
      
      mockReadFile.mockRejectedValue(error);
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse JSON file');
    });
  });

  describe('getFormat', () => {
    it('should return json format', () => {
      expect(adapter.getFormat()).toBe('json');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return supported extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.json']);
    });
  });
});

describe('parseJsonContent', () => {
  describe('Guard clauses', () => {
    it('should return empty object for null content', () => {
      expect(parseJsonContent(null as any)).toEqual({});
    });

    it('should return empty object for undefined content', () => {
      expect(parseJsonContent(undefined as any)).toEqual({});
    });

    it('should return empty object for empty string', () => {
      expect(parseJsonContent('')).toEqual({});
    });

    it('should return empty object for non-string content', () => {
      expect(parseJsonContent(123 as any)).toEqual({});
      expect(parseJsonContent({} as any)).toEqual({});
    });
  });

  describe('Basic parsing', () => {
    it('should parse simple JSON object', () => {
      const content = '{"name": "John", "age": 30, "city": "New York"}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        name: 'John',
        age: 30,
        city: 'New York'
      });
    });

    it('should parse nested JSON object', () => {
      const content = '{"database": {"host": "localhost", "port": 5432, "credentials": {"username": "admin", "password": "secret"}}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 5432,
          credentials: {
            username: 'admin',
            password: 'secret'
          }
        }
      });
    });

    it('should parse JSON with arrays', () => {
      const content = '{"servers": [{"name": "web1", "port": 80}, {"name": "web2", "port": 8080}]}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        servers: [
          { name: 'web1', port: 80 },
          { name: 'web2', port: 8080 }
        ]
      });
    });

    it('should parse JSON with mixed types', () => {
      const content = '{"config": {"enabled": true, "timeout": 5000, "retries": [1, 2, 3], "metadata": null}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        config: {
          enabled: true,
          timeout: 5000,
          retries: [1, 2, 3],
          metadata: null
        }
      });
    });
  });

  describe('Data type parsing', () => {
    it('should parse string values', () => {
      const content = '{"name": "John Doe", "email": "john@example.com"}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should parse numeric values', () => {
      const content = '{"integer": 42, "float": 3.14, "negative": -10}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        integer: 42,
        float: 3.14,
        negative: -10
      });
    });

    it('should parse boolean values', () => {
      const content = '{"enabled": true, "disabled": false}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        enabled: true,
        disabled: false
      });
    });

    it('should parse null values', () => {
      const content = '{"nullable": null, "empty": null}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        nullable: null,
        empty: null
      });
    });
  });

  describe('Complex structures', () => {
    it('should parse deeply nested objects', () => {
      const content = '{"level1": {"level2": {"level3": {"value": "deep"}}}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      });
    });

    it('should parse objects with array of objects', () => {
      const content = '{"users": [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ]
      });
    });

    it('should parse arrays with mixed types', () => {
      const content = '{"mixed": [1, "string", true, null, {"key": "value"}]}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        mixed: [1, 'string', true, null, { key: 'value' }]
      });
    });

    it('should parse empty object', () => {
      const content = '{}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({});
    });

    it('should parse object with empty arrays', () => {
      const content = '{"emptyArray": [], "emptyObject": {}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        emptyArray: [],
        emptyObject: {}
      });
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid JSON syntax', () => {
      const content = '{"invalid": json, "content": [}';
      
      expect(() => parseJsonContent(content)).toThrow('Invalid JSON syntax');
    });

    it('should throw error for JSON that is not an object', () => {
      const content = '["item1", "item2", "item3"]';
      
      expect(() => parseJsonContent(content)).toThrow('expected object, got array');
    });

    it('should throw error for primitive JSON values', () => {
      const content = '"simple string"';
      
      expect(() => parseJsonContent(content)).toThrow('expected object, got string');
    });

    it('should throw error for numeric JSON values', () => {
      const content = '42';
      
      expect(() => parseJsonContent(content)).toThrow('expected object, got number');
    });

    it('should throw error for boolean JSON values', () => {
      const content = 'true';
      
      expect(() => parseJsonContent(content)).toThrow('expected object, got boolean');
    });

    it('should include file path in error messages when provided', () => {
      const content = '{"invalid": json, "content": [}';
      const filePath = '/path/to/file.json';
      
      expect(() => parseJsonContent(content, filePath)).toThrow('in /path/to/file.json');
    });

    it('should handle malformed JSON with missing quotes', () => {
      const content = '{name: "John", age: 30}';
      
      expect(() => parseJsonContent(content)).toThrow('Invalid JSON syntax');
    });

    it('should handle malformed JSON with trailing comma', () => {
      const content = '{"name": "John", "age": 30,}';
      
      expect(() => parseJsonContent(content)).toThrow('Invalid JSON syntax');
    });

    it('should handle malformed JSON with unclosed braces', () => {
      const content = '{"name": "John", "age": 30';
      
      expect(() => parseJsonContent(content)).toThrow('Invalid JSON syntax');
    });
  });

  describe('Edge cases', () => {
    it('should handle JSON with special characters', () => {
      const content = '{"special": "chars: @#$%^&*()", "unicode": "ñáéíóú"}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        special: 'chars: @#$%^&*()',
        unicode: 'ñáéíóú'
      });
    });

    it('should handle JSON with escaped characters', () => {
      const content = '{"escaped": "line1\\nline2\\ttabbed", "quotes": "He said \\"Hello\\""}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        escaped: 'line1\nline2\ttabbed',
        quotes: 'He said "Hello"'
      });
    });

    it('should handle JSON with very large numbers', () => {
      const content = '{"large": 999999999999999999, "small": 0.0000000000000001}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        large: 999999999999999999,
        small: 0.0000000000000001
      });
    });

    it('should handle JSON with scientific notation', () => {
      const content = '{"scientific": 1e10, "negative": -2.5e-5}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        scientific: 1e10,
        negative: -2.5e-5
      });
    });

    it('should handle JSON with numeric keys', () => {
      const content = '{"123": "numeric key", "456": "another numeric key"}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        '123': 'numeric key',
        '456': 'another numeric key'
      });
    });

    it('should handle JSON with special key names', () => {
      const content = '{"constructor": "special", "toString": "special", "hasOwnProperty": "special"}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        'constructor': 'special',
        'toString': 'special',
        'hasOwnProperty': 'special'
      });
    });
  });

  describe('Real-world examples', () => {
    it('should parse package.json structure', () => {
      const content = '{"name": "my-app", "version": "1.0.0", "scripts": {"start": "node index.js", "test": "jest"}, "dependencies": {"express": "^4.18.0", "lodash": "^4.17.21"}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        name: 'my-app',
        version: '1.0.0',
        scripts: {
          start: 'node index.js',
          test: 'jest'
        },
        dependencies: {
          express: '^4.18.0',
          lodash: '^4.17.21'
        }
      });
    });

    it('should parse tsconfig.json structure', () => {
      const content = '{"compilerOptions": {"target": "ES2020", "module": "commonjs", "strict": true, "esModuleInterop": true}, "include": ["src/**/*"], "exclude": ["node_modules", "dist"]}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      });
    });

    it('should parse API configuration', () => {
      const content = '{"api": {"baseUrl": "https://api.example.com", "version": "v1", "endpoints": {"users": "/users", "posts": "/posts"}, "auth": {"type": "bearer", "token": "secret"}}, "cache": {"enabled": true, "ttl": 3600}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        api: {
          baseUrl: 'https://api.example.com',
          version: 'v1',
          endpoints: {
            users: '/users',
            posts: '/posts'
          },
          auth: {
            type: 'bearer',
            token: 'secret'
          }
        },
        cache: {
          enabled: true,
          ttl: 3600
        }
      });
    });

    it('should parse complex nested configuration', () => {
      const content = '{"database": {"host": "localhost", "port": 5432, "name": "myapp", "options": {"ssl": true, "pool": {"min": 2, "max": 10}}}, "redis": {"host": "localhost", "port": 6379, "db": 0}, "logging": {"level": "info", "transports": ["console", "file"], "file": {"path": "/var/log/app.log", "maxSize": "10MB"}}}';
      const result = parseJsonContent(content);
      
      expect(result).toEqual({
        database: {
          host: 'localhost',
          port: 5432,
          name: 'myapp',
          options: {
            ssl: true,
            pool: {
              min: 2,
              max: 10
            }
          }
        },
        redis: {
          host: 'localhost',
          port: 6379,
          db: 0
        },
        logging: {
          level: 'info',
          transports: ['console', 'file'],
          file: {
            path: '/var/log/app.log',
            maxSize: '10MB'
          }
        }
      });
    });
  });
});
