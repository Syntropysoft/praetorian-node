import { EqualityRule } from '../src/domain/rules/EqualityRule';
import { ConfigFile } from '../src/shared/types';

describe('EqualityRule', () => {
  let equalityRule: EqualityRule;

  beforeEach(() => {
    equalityRule = new EqualityRule();
  });

  describe('constructor', () => {
    it('should create instance with correct properties', () => {
      expect(equalityRule.id).toBe('equality-rule');
      expect(equalityRule.name).toBe('equality');
      expect(equalityRule.description).toBe('Validates that configuration files have consistent keys across environments');
      expect(equalityRule.category).toBe('compliance');
      expect(equalityRule.severity).toBe('error');
      expect(equalityRule.enabled).toBe(true);
      expect(equalityRule.config).toEqual({});
    });
  });

  describe('execute', () => {
    it('should return warning when less than 2 files provided', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: { key1: 'value1' },
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('INSUFFICIENT_FILES');
      expect(result.warnings[0].message).toBe('Need at least 2 files to compare');
      expect(result.metadata!.filesCompared).toBe(1);
    });

    it('should return success when files have identical keys', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: { key1: 'value1', key2: 'value2' },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: { key1: 'value3', key2: 'value4' },
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata!.filesCompared).toBe(2);
      expect(result.metadata!.totalKeys).toBe(2);
    });

    it('should detect missing keys and return errors', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: { key1: 'value1', key2: 'value2' },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: { key1: 'value3' }, // Missing key2
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('MISSING_KEY');
      expect(result.errors[0].message).toBe("Key 'key2' is missing in config2.json");
      expect(result.errors[0].path).toBe('key2');
      expect(result.errors[0].context).toEqual({
        file: 'config2.json',
        missingKey: 'key2',
        availableKeys: ['key1']
      });
    });

    it('should detect missing keys and return errors for both files', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: { key1: 'value1' },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: { key1: 'value2', key2: 'value3' }, // key2 missing in config1
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1); // key2 missing in config1
      expect(result.warnings).toHaveLength(0); // No warnings in new logic
      expect(result.errors[0].code).toBe('MISSING_KEY');
      expect(result.errors[0].message).toBe("Key 'key2' is missing in config1.json");
      expect(result.errors[0].path).toBe('key2');
    });

    it('should handle nested objects correctly', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: {
            database: {
              host: 'localhost',
              port: 5432
            },
            api: {
              version: 'v1'
            }
          },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: {
            database: {
              host: 'localhost'
              // Missing port
            },
            api: {
              version: 'v1',
              timeout: 5000 // Extra key
            }
          },
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2); // database.port missing in config2, api.timeout missing in config1
      expect(result.warnings).toHaveLength(0); // No warnings in new logic
      expect(result.metadata!.totalKeys).toBe(6); // database, database.host, database.port, api, api.version, api.timeout
    });

    it('should handle complex nested structures', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: {
            level1: {
              level2: {
                level3: {
                  key1: 'value1',
                  key2: 'value2'
                }
              }
            }
          },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: {
            level1: {
              level2: {
                level3: {
                  key1: 'value1'
                  // Missing key2
                }
              }
            }
          },
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe("Key 'level1.level2.level3.key2' is missing in config2.json");
    });

    it('should handle arrays and non-object values', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: {
            array: [1, 2, 3],
            string: 'test',
            number: 42,
            boolean: true,
            null: null
          },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: {
            array: [4, 5, 6],
            string: 'test2',
            number: 100,
            boolean: false,
            null: null
          },
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata!.totalKeys).toBe(5);
    });

    it('should handle empty objects', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: {},
          format: 'json'
        },
        {
          path: 'config2.json',
          content: {},
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.metadata!.totalKeys).toBe(0);
    });

    it('should handle three or more files', async () => {
      const files: ConfigFile[] = [
        {
          path: 'config1.json',
          content: { key1: 'value1', key2: 'value2' },
          format: 'json'
        },
        {
          path: 'config2.json',
          content: { key1: 'value3', key2: 'value4' },
          format: 'json'
        },
        {
          path: 'config3.json',
          content: { key1: 'value5' }, // Missing key2
          format: 'json'
        }
      ];

      const result = await equalityRule.execute(files);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1); // key2 missing only in config3
      expect(result.warnings).toHaveLength(0); // No warnings in new logic
      expect(result.metadata!.filesCompared).toBe(3);
    });
  });

  describe('extractAllKeys', () => {
    it('should extract keys from simple object', () => {
      const obj = { key1: 'value1', key2: 'value2' };
      const keys = (equalityRule as any).extractAllKeys(obj);
      
      expect(keys).toEqual(new Set(['key1', 'key2']));
    });

    it('should extract nested keys with dot notation', () => {
      const obj = {
        level1: {
          level2: {
            key1: 'value1',
            key2: 'value2'
          }
        }
      };
      const keys = (equalityRule as any).extractAllKeys(obj);
      
      expect(keys).toEqual(new Set([
        'level1',
        'level1.level2',
        'level1.level2.key1',
        'level1.level2.key2'
      ]));
    });

    it('should handle arrays and non-object values', () => {
      const obj = {
        array: [1, 2, 3],
        string: 'test',
        number: 42,
        boolean: true,
        null: null
      };
      const keys = (equalityRule as any).extractAllKeys(obj);
      
      expect(keys).toEqual(new Set(['array', 'string', 'number', 'boolean', 'null']));
    });

    it('should handle empty object', () => {
      const obj = {};
      const keys = (equalityRule as any).extractAllKeys(obj);
      
      expect(keys).toEqual(new Set());
    });

    it('should handle null and undefined', () => {
      expect((equalityRule as any).extractAllKeys(null)).toEqual(new Set());
      expect((equalityRule as any).extractAllKeys(undefined)).toEqual(new Set());
    });
  });
}); 