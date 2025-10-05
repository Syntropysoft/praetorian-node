import { YamlFileAdapter, parseYamlContent } from '../../../../src/infrastructure/adapters/readers/YamlFileAdapter';
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

describe('YamlFileAdapter', () => {
  let adapter: YamlFileAdapter;
  let tempDir: string;
  let mockReadFile: jest.MockedFunction<typeof fs.promises.readFile>;
  let mockAccess: jest.MockedFunction<typeof fs.promises.access>;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    adapter = new YamlFileAdapter();
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
    it('should return true for .yaml files', () => {
      expect(adapter.canHandle('config.yaml')).toBe(true);
    });

    it('should return true for .yml files', () => {
      expect(adapter.canHandle('config.yml')).toBe(true);
    });

    it('should return false for other file extensions', () => {
      expect(adapter.canHandle('config.json')).toBe(false);
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
    it('should read and parse YAML file successfully', async () => {
      const content = 'database:\n  host: localhost\n  port: 5432\n  name: myapp';
      const filePath = path.join(tempDir, 'test.yaml');
      
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
      const filePath = path.join(tempDir, 'nonexistent.yaml');
      const error = new Error('File not found');
      
      mockReadFile.mockRejectedValue(error);
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse YAML file');
    });
  });

  describe('getFormat', () => {
    it('should return yaml format', () => {
      expect(adapter.getFormat()).toBe('yaml');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return supported extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.yaml', '.yml']);
    });
  });
});

describe('parseYamlContent', () => {
  describe('Guard clauses', () => {
    it('should return empty object for null content', () => {
      expect(parseYamlContent(null as any)).toEqual({});
    });

    it('should return empty object for undefined content', () => {
      expect(parseYamlContent(undefined as any)).toEqual({});
    });

    it('should return empty object for empty string', () => {
      expect(parseYamlContent('')).toEqual({});
    });

    it('should return empty object for non-string content', () => {
      expect(parseYamlContent(123 as any)).toEqual({});
      expect(parseYamlContent({} as any)).toEqual({});
    });
  });

  describe('Basic parsing', () => {
    it('should parse simple YAML object', () => {
      const content = 'name: John\nage: 30\ncity: New York';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        name: 'John',
        age: 30,
        city: 'New York'
      });
    });

    it('should parse nested YAML object', () => {
      const content = 'database:\n  host: localhost\n  port: 5432\n  credentials:\n    username: admin\n    password: secret';
      const result = parseYamlContent(content);
      
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

    it('should parse YAML with arrays', () => {
      const content = 'servers:\n  - name: web1\n    port: 80\n  - name: web2\n    port: 8080';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        servers: [
          { name: 'web1', port: 80 },
          { name: 'web2', port: 8080 }
        ]
      });
    });

    it('should parse YAML with mixed types', () => {
      const content = 'config:\n  enabled: true\n  timeout: 5000\n  retries: [1, 2, 3]\n  metadata: null';
      const result = parseYamlContent(content);
      
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
      const content = 'name: "John Doe"\nemail: john@example.com';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should parse numeric values', () => {
      const content = 'integer: 42\nfloat: 3.14\nnegative: -10';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        integer: 42,
        float: 3.14,
        negative: -10
      });
    });

    it('should parse boolean values', () => {
      const content = 'enabled: true\ndisabled: false';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        enabled: true,
        disabled: false
      });
    });

    it('should parse null values', () => {
      const content = 'nullable: null\nempty: ~';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        nullable: null,
        empty: null
      });
    });
  });

  describe('Complex structures', () => {
    it('should parse deeply nested objects', () => {
      const content = 'level1:\n  level2:\n    level3:\n      value: deep';
      const result = parseYamlContent(content);
      
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
      const content = 'users:\n  - id: 1\n    name: Alice\n  - id: 2\n    name: Bob';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ]
      });
    });

    it('should parse arrays with mixed types', () => {
      const content = 'mixed: [1, "string", true, null, {key: "value"}]';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        mixed: [1, 'string', true, null, { key: 'value' }]
      });
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid YAML syntax', () => {
      const content = 'invalid: yaml: content: [';
      
      expect(() => parseYamlContent(content)).toThrow('Invalid YAML syntax');
    });

    it('should throw error for YAML that is not an object', () => {
      const content = '- item1\n- item2\n- item3';
      
      expect(() => parseYamlContent(content)).toThrow('expected object, got array');
    });

    it('should throw error for primitive YAML values', () => {
      const content = 'simple string';
      
      expect(() => parseYamlContent(content)).toThrow('expected object, got string');
    });

    it('should throw error for numeric YAML values', () => {
      const content = '42';
      
      expect(() => parseYamlContent(content)).toThrow('expected object, got number');
    });

    it('should include file path in error messages when provided', () => {
      const content = 'invalid: yaml: content: [';
      const filePath = '/path/to/file.yaml';
      
      expect(() => parseYamlContent(content, filePath)).toThrow('in /path/to/file.yaml');
    });
  });

  describe('Edge cases', () => {
    it('should handle YAML with comments', () => {
      const content = '# This is a comment\nname: John\n# Another comment\nage: 30';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        name: 'John',
        age: 30
      });
    });

    it('should handle YAML with empty lines', () => {
      const content = 'name: John\n\n\nage: 30\n\ncity: New York';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        name: 'John',
        age: 30,
        city: 'New York'
      });
    });

    it('should handle YAML with special characters', () => {
      const content = 'special: "chars: @#$%^&*()"';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        special: 'chars: @#$%^&*()'
      });
    });

    it('should handle YAML with multiline strings', () => {
      const content = 'description: |\n  This is a\n  multiline string\n  with multiple lines';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        description: 'This is a\nmultiline string\nwith multiple lines\n'
      });
    });

    it('should handle YAML with folded strings', () => {
      const content = 'description: >\n  This is a folded\n  string that will\n  be on one line';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        description: 'This is a folded string that will be on one line\n'
      });
    });

    it('should handle YAML with anchors and aliases', () => {
      const content = 'defaults: &defaults\n  timeout: 30\n  retries: 3\n\nservice1:\n  <<: *defaults\n  name: service1';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        defaults: {
          timeout: 30,
          retries: 3
        },
        service1: {
          timeout: 30,
          retries: 3,
          name: 'service1'
        }
      });
    });

    it('should handle YAML with quoted keys', () => {
      const content = '"quoted key": value\n\'another quoted key\': another value';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        'quoted key': 'value',
        'another quoted key': 'another value'
      });
    });

    it('should handle YAML with numeric keys', () => {
      const content = '123: numeric key\n456: another numeric key';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        '123': 'numeric key',
        '456': 'another numeric key'
      });
    });
  });

  describe('Real-world examples', () => {
    it('should parse Docker Compose YAML', () => {
      const content = 'version: "3.8"\nservices:\n  web:\n    image: nginx\n    ports:\n      - "80:80"\n    environment:\n      - NODE_ENV=production';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        version: '3.8',
        services: {
          web: {
            image: 'nginx',
            ports: ['80:80'],
            environment: ['NODE_ENV=production']
          }
        }
      });
    });

    it('should parse Kubernetes YAML', () => {
      const content = 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: my-config\n  namespace: default\ndata:\n  config.yaml: |\n    key: value';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'my-config',
          namespace: 'default'
        },
        data: {
          'config.yaml': 'key: value\n'
        }
      });
    });

    it('should parse GitHub Actions YAML', () => {
      const content = 'name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - name: Run tests\n        run: npm test';
      const result = parseYamlContent(content);
      
      expect(result).toEqual({
        name: 'CI',
        on: {
          push: {
            branches: ['main']
          },
          pull_request: {
            branches: ['main']
          }
        },
        jobs: {
          test: {
            'runs-on': 'ubuntu-latest',
            steps: [
              { uses: 'actions/checkout@v2' },
              { name: 'Run tests', run: 'npm test' }
            ]
          }
        }
      });
    });
  });
});
