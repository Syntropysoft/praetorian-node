/**
 * Rule Templates Tests
 * 
 * Tests for rule template functions
 */

import { 
  getRuleTemplate, 
  getAvailableTemplateTypes 
} from '../../../src/shared/templates/rule-templates';

describe('Rule Templates', () => {
  describe('getRuleTemplate', () => {
    it('should return config template', () => {
      const template = getRuleTemplate('config');
      expect(template).toContain('# Praetorian Configuration');
      expect(template).toContain('files:');
      expect(template).toContain('ruleSets:');
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should return structure template', () => {
      const template = getRuleTemplate('structure');
      expect(template).toContain('structure');
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should return format template', () => {
      const template = getRuleTemplate('format');
      expect(template).toContain('format');
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should return security template', () => {
      const template = getRuleTemplate('security');
      expect(template).toContain('security');
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should return schema template', () => {
      const template = getRuleTemplate('schema');
      expect(template).toContain('schema');
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should throw error for unknown template type', () => {
      expect(() => {
        getRuleTemplate('unknown' as any);
      }).toThrow('Unknown template type: unknown');
    });
  });

  describe('getAvailableTemplateTypes', () => {
    it('should return all available template types', () => {
      const types = getAvailableTemplateTypes();
      
      expect(Array.isArray(types)).toBe(true);
      expect(types).toHaveLength(5);
      expect(types).toContain('config');
      expect(types).toContain('structure');
      expect(types).toContain('format');
      expect(types).toContain('security');
      expect(types).toContain('schema');
    });

    it('should return immutable array', () => {
      const types1 = getAvailableTemplateTypes();
      const types2 = getAvailableTemplateTypes();
      
      expect(types1).not.toBe(types2); // Different array instances
      expect(types1).toEqual(types2); // Same content
    });
  });

  describe('Template content validation', () => {
    it('should have valid YAML structure for config template', () => {
      const template = getRuleTemplate('config');
      
      // Basic YAML structure validation
      expect(template).toMatch(/^files:\s*$/m);
      expect(template).toMatch(/^ruleSets:\s*$/m);
      expect(template).toMatch(/^environments:\s*$/m);
    });

    it('should have valid YAML structure for all templates', () => {
      const templateTypes = getAvailableTemplateTypes();
      
      templateTypes.forEach(type => {
        const template = getRuleTemplate(type as any);
        
        // Should not be empty
        expect(template.trim().length).toBeGreaterThan(0);
        
        // Should contain some YAML-like structure
        expect(template).toMatch(/:\s*$/m); // Contains colon followed by newline
      });
    });
  });
});
