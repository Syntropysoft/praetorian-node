import { HclFileAdapter, parseHclContent, parseHclValue } from '../../../../src/infrastructure/adapters/readers/HclFileAdapter';
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

describe('HclFileAdapter', () => {
  let adapter: HclFileAdapter;
  let tempDir: string;
  let mockReadFile: jest.MockedFunction<typeof fs.promises.readFile>;
  let mockAccess: jest.MockedFunction<typeof fs.promises.access>;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    adapter = new HclFileAdapter();
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
    it('should return true for .hcl files', () => {
      expect(adapter.canHandle('config.hcl')).toBe(true);
    });

    it('should return true for .tf files', () => {
      expect(adapter.canHandle('main.tf')).toBe(true);
    });

    it('should return true for .tfvars files', () => {
      expect(adapter.canHandle('terraform.tfvars')).toBe(true);
    });

    it('should return false for other file extensions', () => {
      expect(adapter.canHandle('config.json')).toBe(false);
      expect(adapter.canHandle('config.yaml')).toBe(false);
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
    it('should read and parse HCL file successfully', async () => {
      const content = 'variable "region" {\n  default = "us-west-2"\n}';
      const filePath = path.join(tempDir, 'test.hcl');
      
      mockReadFile.mockResolvedValue(content);
      
      const result = await adapter.read(filePath);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
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
      const filePath = path.join(tempDir, 'nonexistent.hcl');
      const error = new Error('File not found');
      
      mockReadFile.mockRejectedValue(error);
      
      await expect(adapter.read(filePath)).rejects.toThrow('Failed to parse HCL file');
    });
  });

  describe('getFormat', () => {
    it('should return hcl format', () => {
      expect(adapter.getFormat()).toBe('hcl');
    });
  });

  describe('getSupportedExtensions', () => {
    it('should return supported extensions', () => {
      expect(adapter.getSupportedExtensions()).toEqual(['.hcl', '.tf', '.tfvars']);
    });
  });
});

describe('parseHclContent', () => {
  describe('Guard clauses', () => {
    it('should return empty object for null content', () => {
      expect(parseHclContent(null as any)).toEqual({});
    });

    it('should return empty object for undefined content', () => {
      expect(parseHclContent(undefined as any)).toEqual({});
    });

    it('should return empty object for empty string', () => {
      expect(parseHclContent('')).toEqual({});
    });

    it('should return empty object for non-string content', () => {
      expect(parseHclContent(123 as any)).toEqual({});
      expect(parseHclContent({} as any)).toEqual({});
    });
  });

  describe('Basic parsing', () => {
    it('should parse simple variable block', () => {
      const content = 'variable "region" {\n  default = "us-west-2"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        }
      });
    });

    it('should parse resource block', () => {
      const content = 'resource "aws_instance" "web" {\n  ami = "ami-12345"\n  instance_type = "t2.micro"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'resource.aws_instance.web': {
          ami: 'ami-12345',
          instance_type: 't2.micro'
        }
      });
    });

    it('should parse data block', () => {
      const content = 'data "aws_ami" "ubuntu" {\n  most_recent = true\n  owners = ["099720109477"]\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'data.aws_ami.ubuntu': {
          most_recent: true,
          owners: ['099720109477']
        }
      });
    });

    it('should parse module block', () => {
      const content = 'module "vpc" {\n  source = "./modules/vpc"\n  cidr = "10.0.0.0/16"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'module.vpc': {
          source: './modules/vpc',
          cidr: '10.0.0.0/16'
        }
      });
    });
  });

  describe('Comments handling', () => {
    it('should ignore single line comments with #', () => {
      const content = '# This is a comment\nvariable "region" {\n  # Another comment\n  default = "us-west-2"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        }
      });
    });

    it('should ignore single line comments with //', () => {
      const content = '// This is a comment\nvariable "region" {\n  // Another comment\n  default = "us-west-2"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        }
      });
    });

    it('should ignore empty lines', () => {
      const content = '\n\nvariable "region" {\n\n  default = "us-west-2"\n\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        }
      });
    });
  });

  describe('Nested blocks', () => {
    it('should parse nested blocks', () => {
      const content = 'resource "aws_instance" "web" {\n  ami = "ami-12345"\n  \n  tags {\n    Name = "web-server"\n    Environment = "production"\n  }\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'resource.aws_instance.web': {
          ami: 'ami-12345',
          tags: {
            Name: 'web-server',
            Environment: 'production'
          }
        }
      });
    });

    it('should parse deeply nested blocks', () => {
      const content = 'resource "aws_instance" "web" {\n  ami = "ami-12345"\n  \n  tags {\n    Name = "web-server"\n    \n    metadata {\n      version = "1.0"\n      author = "devops"\n    }\n  }\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'resource.aws_instance.web': {
          ami: 'ami-12345',
          tags: {
            Name: 'web-server',
            metadata: {
              version: '1.0',
              author: 'devops'
            }
          }
        }
      });
    });
  });

  describe('Multiple blocks', () => {
    it('should parse multiple variable blocks', () => {
      const content = 'variable "region" {\n  default = "us-west-2"\n}\n\nvariable "environment" {\n  default = "production"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        },
        'variable.environment': {
          default: 'production'
        }
      });
    });

    it('should parse mixed block types', () => {
      const content = 'variable "region" {\n  default = "us-west-2"\n}\n\nresource "aws_instance" "web" {\n  ami = "ami-12345"\n}\n\ndata "aws_ami" "ubuntu" {\n  most_recent = true\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        },
        'resource.aws_instance.web': {
          ami: 'ami-12345'
        },
        'data.aws_ami.ubuntu': {
          most_recent: true
        }
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle blocks with no properties', () => {
      const content = 'variable "empty" {\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({});
    });

    it('should handle malformed block definitions', () => {
      const content = 'invalid block {\n  key = "value"\n}';
      const result = parseHclContent(content);
      
      expect(result).toEqual({});
    });

    it('should handle unclosed blocks', () => {
      const content = 'variable "region" {\n  default = "us-west-2"';
      const result = parseHclContent(content);
      
      expect(result).toEqual({
        'variable.region': {
          default: 'us-west-2'
        }
      });
    });
  });
});

describe('parseHclValue', () => {
  describe('Guard clauses', () => {
    it('should return empty string for null value', () => {
      expect(parseHclValue(null as any)).toBe('');
    });

    it('should return empty string for undefined value', () => {
      expect(parseHclValue(undefined as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(parseHclValue('')).toBe('');
    });
  });

  describe('String values', () => {
    it('should return unquoted string', () => {
      expect(parseHclValue('hello')).toBe('hello');
    });

    it('should remove double quotes', () => {
      expect(parseHclValue('"hello"')).toBe('hello');
    });

    it('should remove single quotes', () => {
      expect(parseHclValue("'hello'")).toBe('hello');
    });

    it('should handle strings with spaces', () => {
      expect(parseHclValue('"hello world"')).toBe('hello world');
    });
  });

  describe('Boolean values', () => {
    it('should parse true as boolean', () => {
      expect(parseHclValue('true')).toBe(true);
    });

    it('should parse false as boolean', () => {
      expect(parseHclValue('false')).toBe(false);
    });

    it('should parse quoted booleans as strings', () => {
      expect(parseHclValue('"true"')).toBe('true');
      expect(parseHclValue("'false'")).toBe('false');
    });
  });

  describe('Numeric values', () => {
    it('should parse integers', () => {
      expect(parseHclValue('123')).toBe(123);
    });

    it('should parse floats', () => {
      expect(parseHclValue('123.45')).toBe(123.45);
    });

    it('should parse negative numbers', () => {
      expect(parseHclValue('-123')).toBe(-123);
    });

    it('should parse quoted numbers as strings', () => {
      expect(parseHclValue('"123"')).toBe('123');
    });

    it('should handle zero', () => {
      expect(parseHclValue('0')).toBe(0);
    });

    it('should handle zero with decimal', () => {
      expect(parseHclValue('0.0')).toBe(0);
    });
  });

  describe('Array values', () => {
    it('should parse empty array', () => {
      expect(parseHclValue('[]')).toEqual([]);
    });

    it('should parse simple array', () => {
      expect(parseHclValue('["a", "b", "c"]')).toEqual(['a', 'b', 'c']);
    });

    it('should parse array with mixed types', () => {
      expect(parseHclValue('[1, "hello", true]')).toEqual([1, 'hello', true]);
    });

    it('should parse array with spaces', () => {
      expect(parseHclValue('[ "a" , "b" , "c" ]')).toEqual(['a', 'b', 'c']);
    });

    it('should parse manually formatted array', () => {
      expect(parseHclValue('[a, b, c]')).toEqual(['a', 'b', 'c']);
    });

    it('should handle quoted arrays as strings', () => {
      expect(parseHclValue('"[1, 2, 3]"')).toBe('[1, 2, 3]');
    });
  });

  describe('Object values', () => {
    it('should parse JSON object', () => {
      const result = parseHclValue('{"key": "value", "number": 123}');
      expect(result).toEqual({ key: 'value', number: 123 });
    });

    it('should handle invalid JSON object', () => {
      const result = parseHclValue('{invalid json}');
      expect(result).toBe('{invalid json}');
    });

    it('should handle quoted objects as strings', () => {
      expect(parseHclValue('"{key: value}"')).toBe('{key: value}');
    });
  });

  describe('Complex values', () => {
    it('should handle nested arrays', () => {
      expect(parseHclValue('[["a", "b"], ["c", "d"]]')).toEqual([['a', 'b'], ['c', 'd']]);
    });

    it('should handle objects with arrays', () => {
      const result = parseHclValue('{"items": [1, 2, 3], "name": "test"}');
      expect(result).toEqual({ items: [1, 2, 3], name: 'test' });
    });

    it('should handle special characters', () => {
      expect(parseHclValue('hello-world_123')).toBe('hello-world_123');
    });

    it('should handle URLs', () => {
      expect(parseHclValue('https://example.com')).toBe('https://example.com');
    });
  });
});
