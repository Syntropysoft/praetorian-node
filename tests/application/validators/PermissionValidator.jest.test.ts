/**
 * PermissionValidator Tests
 * 
 * Tests for file permission validation functionality
 */

import * as PermissionValidator from '../../../src/application/validators/PermissionValidator';
import { SecurityContext } from '../../../src/shared/types/security';

describe('PermissionValidator', () => {
  describe('validatePermissions', () => {
    it('should validate file permissions successfully', () => {
      const rules: any[] = [{
        id: 'FILE_PERMISSIONS',
        name: 'File Permissions Check',
        description: 'Check file permissions',
        type: 'permission',
        filePattern: '*.env',
        maxPermissions: 0o600,
        minPermissions: 0o600,
        severity: 'high',
        enabled: true
      }];
      const context: SecurityContext = { 
        filePath: 'test.env', 
        content: 'test content', 
        options: {} 
      };

      const result = PermissionValidator.validatePermissions('test.env', 0o644, rules, context);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].filePath).toBe('test.env');
      expect(result[0].currentPermissions).toBe(0o644);
    });

    it('should handle empty rules', () => {
      const rules: any[] = [];
      const context: SecurityContext = { 
        filePath: 'test.env', 
        content: 'test content', 
        options: {} 
      };

      const result = PermissionValidator.validatePermissions('test.env', 0o644, rules, context);

      expect(result).toHaveLength(0);
    });

    it('should handle disabled rules', () => {
      const rules: any[] = [{
        id: 'FILE_PERMISSIONS',
        name: 'File Permissions Check',
        description: 'Check file permissions',
        type: 'permission',
        filePattern: '*.env',
        maxPermissions: 0o600,
        minPermissions: 0o600,
        severity: 'high',
        enabled: false
      }];
      const context: SecurityContext = { 
        filePath: 'test.env', 
        content: 'test content', 
        options: {} 
      };

      const result = PermissionValidator.validatePermissions('test.env', 0o644, rules, context);

      expect(result).toHaveLength(0);
    });
  });

  describe('formatPermissions', () => {
    it('should format permissions correctly', () => {
      expect(PermissionValidator.formatPermissions(0o755)).toBe('0755');
      expect(PermissionValidator.formatPermissions(0o644)).toBe('0644');
      expect(PermissionValidator.formatPermissions(0o600)).toBe('0600');
      expect(PermissionValidator.formatPermissions(0o777)).toBe('0777');
    });

    it('should handle edge cases', () => {
      expect(PermissionValidator.formatPermissions(0o000)).toBe('0000');
      expect(PermissionValidator.formatPermissions(0o111)).toBe('0111');
    });
  });

  describe('parsePermissions', () => {
    it('should parse permission strings correctly', () => {
      expect(PermissionValidator.parsePermissions('755')).toBe(0o755);
      expect(PermissionValidator.parsePermissions('644')).toBe(0o644);
      expect(PermissionValidator.parsePermissions('600')).toBe(0o600);
      expect(PermissionValidator.parsePermissions('777')).toBe(0o777);
    });

    it('should handle invalid permission strings', () => {
      expect(PermissionValidator.parsePermissions('invalid')).toBe(0);
      expect(PermissionValidator.parsePermissions('')).toBe(0);
      expect(PermissionValidator.parsePermissions('999')).toBe(0); // Returns 0 for invalid
    });
  });

  describe('isTooPermissive', () => {
    it('should detect overly permissive files', () => {
      expect(PermissionValidator.isTooPermissive(0o777, 0o600)).toBe(true);
      expect(PermissionValidator.isTooPermissive(0o644, 0o600)).toBe(true);
      expect(PermissionValidator.isTooPermissive(0o600, 0o600)).toBe(false);
      expect(PermissionValidator.isTooPermissive(0o400, 0o600)).toBe(false);
    });
  });

  describe('isTooRestrictive', () => {
    it('should detect overly restrictive files', () => {
      expect(PermissionValidator.isTooRestrictive(0o400, 0o644)).toBe(true);
      expect(PermissionValidator.isTooRestrictive(0o600, 0o644)).toBe(true); // 600 < 644
      expect(PermissionValidator.isTooRestrictive(0o644, 0o644)).toBe(false);
      expect(PermissionValidator.isTooRestrictive(0o755, 0o644)).toBe(false);
    });
  });

  describe('getPermissionDescription', () => {
    it('should describe permissions correctly', () => {
      const desc1 = PermissionValidator.getPermissionDescription(0o755);
      expect(desc1).toBe('rwxr-xr-x');

      const desc2 = PermissionValidator.getPermissionDescription(0o644);
      expect(desc2).toBe('rw-r--r--');
    });
  });

  describe('isSensitiveFile', () => {
    it('should identify sensitive files', () => {
      expect(PermissionValidator.isSensitiveFile('.env')).toBe(true);
      expect(PermissionValidator.isSensitiveFile('config.env')).toBe(true);
      expect(PermissionValidator.isSensitiveFile('secrets.yml')).toBe(true);
      expect(PermissionValidator.isSensitiveFile('private.key')).toBe(true);
      expect(PermissionValidator.isSensitiveFile('id_rsa')).toBe(true);
    });

    it('should not identify non-sensitive files', () => {
      expect(PermissionValidator.isSensitiveFile('README.md')).toBe(false);
      expect(PermissionValidator.isSensitiveFile('package.json')).toBe(false);
      expect(PermissionValidator.isSensitiveFile('index.js')).toBe(false);
    });
  });

  describe('getRecommendedPermissions', () => {
    it('should recommend correct permissions for sensitive files', () => {
      expect(PermissionValidator.getRecommendedPermissions('.env')).toBe(600);
      expect(PermissionValidator.getRecommendedPermissions('secrets.yml')).toBe(600);
      expect(PermissionValidator.getRecommendedPermissions('private.key')).toBe(600);
      expect(PermissionValidator.getRecommendedPermissions('id_rsa')).toBe(600);
    });

    it('should recommend correct permissions for config files', () => {
      expect(PermissionValidator.getRecommendedPermissions('config.yaml')).toBe(644);
      expect(PermissionValidator.getRecommendedPermissions('settings.json')).toBe(644);
      expect(PermissionValidator.getRecommendedPermissions('app.conf')).toBe(644);
    });

    it('should handle unknown file types', () => {
      expect(PermissionValidator.getRecommendedPermissions('unknown.txt')).toBe(644);
      expect(PermissionValidator.getRecommendedPermissions('')).toBe(644);
    });
  });
});
