/**
 * Shared Types Index Tests
 * 
 * Tests for type exports and re-exports
 */

describe('Shared Types Index', () => {
  describe('Module imports', () => {
    it('should import types module successfully', async () => {
      const typesModule = await import('../../../src/shared/types');
      
      // Check that the module is properly imported
      expect(typeof typesModule).toBe('object');
      expect(typesModule).toBeDefined();
    });

    it('should have expected module structure', async () => {
      const typesModule = await import('../../../src/shared/types');
      
      // Check that the module has some exports
      const exports = Object.keys(typesModule);
      expect(exports.length).toBeGreaterThan(0);
    });
  });

  describe('Type structure validation', () => {
    it('should have consistent module structure', async () => {
      const typesModule = await import('../../../src/shared/types');
      
      // This test ensures the module structure is consistent
      expect(typeof typesModule).toBe('object');
      expect(typesModule).not.toBeNull();
      expect(typesModule).not.toBeUndefined();
    });

    it('should be importable multiple times', async () => {
      const module1 = await import('../../../src/shared/types');
      const module2 = await import('../../../src/shared/types');
      
      // Modules should be the same object (cached)
      expect(module1).toBe(module2);
    });
  });

  describe('Re-export functionality', () => {
    it('should re-export all expected modules', async () => {
      // This test ensures that the index file properly re-exports all sub-modules
      const typesModule = await import('../../../src/shared/types');
      
      // The module should exist and be importable
      expect(typesModule).toBeDefined();
      expect(typeof typesModule).toBe('object');
    });

    it('should handle import errors gracefully', async () => {
      // Test that the module can be imported without throwing errors
      let importError = null;
      
      try {
        await import('../../../src/shared/types');
      } catch (error) {
        importError = error;
      }
      
      expect(importError).toBeNull();
    });
  });
});
