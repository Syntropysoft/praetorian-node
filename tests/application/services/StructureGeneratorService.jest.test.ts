/**
 * StructureGeneratorService Tests - Demonstrating improved testability with SRP
 * 
 * These tests show how the refactored service is much easier to test:
 * - Pure functions are predictable and testable
 * - No side effects in most methods
 * - Clear input/output contracts
 * - Easy to test edge cases with guard clauses
 */

import { StructureGeneratorService } from '../../../src/application/services/StructureGeneratorService';
import { PraetorianConfig } from '../../../src/application/orchestrators/ValidationOrchestrator';

describe('StructureGeneratorService', () => {
  let service: StructureGeneratorService;

  beforeEach(() => {
    service = new StructureGeneratorService();
  });

  describe('createStructureFromRequiredKeys', () => {
    it('should create structure from required keys correctly', () => {
      // Arrange
      const requiredKeys = ['database.host', 'database.port', 'api.version'];

      // Act
      const result = service.createStructureFromRequiredKeys(requiredKeys);

      // Assert
      expect(result).toEqual({
        database: {
          host: null,
          port: null
        },
        api: {
          version: null
        }
      });
    });

    it('should handle empty array (guard clause)', () => {
      // Act
      const result = service.createStructureFromRequiredKeys([]);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle invalid input (guard clause)', () => {
      // Act
      const result = service.createStructureFromRequiredKeys(null as any);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle nested keys correctly', () => {
      // Arrange
      const requiredKeys = ['app.database.connection.host', 'app.database.connection.port'];

      // Act
      const result = service.createStructureFromRequiredKeys(requiredKeys);

      // Assert
      expect(result).toEqual({
        app: {
          database: {
            connection: {
              host: null,
              port: null
            }
          }
        }
      });
    });
  });

  describe('createStructureFromExistingFiles', () => {
    it('should create structure from existing files correctly', () => {
      // Arrange
      const existingStructures = [
        { database: { host: 'localhost', port: 5432 } },
        { api: { version: '1.0', port: 3000 } }
      ];

      // Act
      const result = service.createStructureFromExistingFiles(existingStructures);

      // Assert
      expect(result).toEqual({
        database: {
          host: null,
          port: null
        },
        api: {
          version: null,
          port: null
        }
      });
    });

    it('should handle empty array (guard clause)', () => {
      // Act
      const result = service.createStructureFromExistingFiles([]);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle invalid input (guard clause)', () => {
      // Act
      const result = service.createStructureFromExistingFiles(null as any);

      // Assert
      expect(result).toEqual({});
    });

    it('should merge nested structures correctly', () => {
      // Arrange
      const existingStructures = [
        { 
          app: { 
            database: { host: 'localhost' },
            api: { port: 3000 }
          } 
        },
        { 
          app: { 
            database: { port: 5432 },
            cache: { enabled: true }
          } 
        }
      ];

      // Act
      const result = service.createStructureFromExistingFiles(existingStructures);

      // Assert
      expect(result).toEqual({
        app: {
          database: {
            host: null,
            port: null
          },
          api: {
            port: null
          },
          cache: {
            enabled: null
          }
        }
      });
    });
  });

  describe('createEmptyStructureFromExisting', () => {
    it('should use required keys when available', () => {
      // Arrange
      const existingStructures = [{ database: { host: 'localhost' } }];
      const praetorianConfig: PraetorianConfig = {
        files: [],
        required_keys: ['api.version', 'api.port']
      };

      // Act
      const result = service.createEmptyStructureFromExisting(existingStructures, praetorianConfig);

      // Assert
      expect(result).toEqual({
        api: {
          version: null,
          port: null
        }
      });
    });

    it('should use existing structures when no required keys', () => {
      // Arrange
      const existingStructures = [{ database: { host: 'localhost' } }];
      const praetorianConfig: PraetorianConfig = {
        files: []
      };

      // Act
      const result = service.createEmptyStructureFromExisting(existingStructures, praetorianConfig);

      // Assert
      expect(result).toEqual({
        database: {
          host: null
        }
      });
    });

    it('should throw error for invalid inputs (guard clauses)', () => {
      // Act & Assert
      expect(() => service.createEmptyStructureFromExisting(null as any, {} as PraetorianConfig))
        .toThrow('Existing structures must be an array');

      expect(() => service.createEmptyStructureFromExisting([], null as any))
        .toThrow('Invalid Praetorian configuration provided');
    });
  });

  describe('addKeyToStructure', () => {
    it('should add simple key to empty structure', () => {
      // Arrange
      const structure = {};
      const key = 'database.host';

      // Act - Using private method through createStructureFromRequiredKeys
      const result = service.createStructureFromRequiredKeys([key]);

      // Assert
      expect(result).toEqual({
        database: {
          host: null
        }
      });
    });

    it('should handle empty key (guard clause)', () => {
      // Act
      const result = service.createStructureFromRequiredKeys(['']);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle invalid key (guard clause)', () => {
      // Act
      const result = service.createStructureFromRequiredKeys([null as any]);

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('mergeStructures', () => {
    it('should merge two structures correctly', () => {
      // Arrange
      const target = { database: { host: 'localhost' } };
      const source = { database: { port: 5432 }, api: { version: '1.0' } };

      // Act - Using private method through createStructureFromExistingFiles
      const result = service.createStructureFromExistingFiles([target, source]);

      // Assert
      expect(result).toEqual({
        database: {
          host: null,
          port: null
        },
        api: {
          version: null
        }
      });
    });

    it('should handle null target (guard clause)', () => {
      // Act
      const result = service.createStructureFromExistingFiles([null, { api: { port: 3000 } }]);

      // Assert
      expect(result).toEqual({
        api: {
          port: null
        }
      });
    });

    it('should handle null source (guard clause)', () => {
      // Act
      const result = service.createStructureFromExistingFiles([{ database: { host: 'localhost' } }, null]);

      // Assert
      expect(result).toEqual({
        database: {
          host: null
        }
      });
    });
  });

  describe('replaceValuesWithNull', () => {
    it('should replace all values with null', () => {
      // Arrange
      const obj = {
        string: 'hello',
        number: 42,
        boolean: true,
        nested: {
          value: 'world',
          deep: {
            value: 123
          }
        }
      };

      // Act - Using private method through createStructureFromExistingFiles
      const result = service.createStructureFromExistingFiles([obj]);

      // Assert
      expect(result).toEqual({
        string: null,
        number: null,
        boolean: null,
        nested: {
          value: null,
          deep: {
            value: null
          }
        }
      });
    });

    it('should handle null input (guard clause)', () => {
      // Act
      const result = service.createStructureFromExistingFiles([null]);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle array input (guard clause)', () => {
      // Act
      const result = service.createStructureFromExistingFiles([[1, 2, 3]]);

      // Assert
      expect(result).toEqual({});
    });
  });
});
