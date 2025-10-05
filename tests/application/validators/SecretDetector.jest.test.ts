import { 
  detectSecrets, 
  looksLikeSecret, 
  getSecretSeverity, 
  isValidSecretContext 
} from '../../../src/application/validators/SecretDetector';
import { 
  SecretDetectionRule, 
  SecurityContext 
} from '../../../src/shared/types/security';

describe('SecretDetector', () => {
  const mockContext: SecurityContext = {
    filePath: 'config.yaml',
    content: 'test content',
    options: {
      stopOnCritical: false,
      includeLowSeverity: true
    }
  };

  const mockRule: SecretDetectionRule = {
    id: 'API_KEY',
    name: 'API Key',
    description: 'Detects API keys',
    type: 'secret',
    pattern: /sk-[a-zA-Z0-9]{20,}/g,
    examples: ['sk-test12345678901234567890'],
    remediation: 'Remove API key from configuration',
    excludePatterns: [],
    enabled: true,
    severity: 'high'
  };

  describe('detectSecrets', () => {
    it('should return empty array for empty content', () => {
      const result = detectSecrets('', [mockRule], mockContext);
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only content', () => {
      const result = detectSecrets('   \n\t  ', [mockRule], mockContext);
      expect(result).toEqual([]);
    });

    it('should return empty array for no rules', () => {
      const result = detectSecrets('content', [], mockContext);
      expect(result).toEqual([]);
    });

    it('should return empty array for null rules', () => {
      const result = detectSecrets('content', null as any, mockContext);
      expect(result).toEqual([]);
    });

    it('should detect secrets with enabled rules only', () => {
      const disabledRule: SecretDetectionRule = { ...mockRule, enabled: false };
      const content = 'api_key=sk-test12345678901234567890';
      
      const result = detectSecrets(content, [mockRule, disabledRule], mockContext);
      
      expect(result).toHaveLength(1);
      expect(result[0].secretType).toBe('API Key');
    });

    it('should handle rules with invalid patterns', () => {
      const invalidRule: SecretDetectionRule = { ...mockRule, pattern: null as any };
      const content = 'api_key=sk-test12345678901234567890';
      
      const result = detectSecrets(content, [invalidRule], mockContext);
      
      expect(result).toEqual([]);
    });

    it('should detect multiple secrets', () => {
      const content = 'api_key=sk-test12345678901234567890\ntoken=sk-another123456789012345678';
      
      const result = detectSecrets(content, [mockRule], mockContext);
      
      expect(result).toHaveLength(2);
      expect(result[0].secretType).toBe('API Key');
      expect(result[1].secretType).toBe('API Key');
    });

    it('should calculate correct line and column numbers', () => {
      const content = 'line1\napi_key=sk-test12345678901234567890\nline3';
      
      const result = detectSecrets(content, [mockRule], mockContext);
      
      expect(result[0].lineNumber).toBe(2);
      expect(result[0].columnNumber).toBe(9);
    });

    it('should mask secret values correctly', () => {
      const content = 'api_key=sk-test12345678901234567890';
      
      const result = detectSecrets(content, [mockRule], mockContext);
      
      expect(result[0].maskedValue).toMatch(/^sk\*+/);
    });

    it('should calculate confidence based on value characteristics', () => {
      const content = 'api_key=sk-test12345678901234567890';
      
      const result = detectSecrets(content, [mockRule], mockContext);
      
      expect(result[0].confidence).toBeGreaterThan(50);
    });

    it('should filter out false positives with exclude patterns', () => {
      const ruleWithExclude: SecretDetectionRule = {
        ...mockRule,
        excludePatterns: [/test/]
      };
      const content = 'api_key=sk-test12345678901234567890';
      
      const result = detectSecrets(content, [ruleWithExclude], mockContext);
      
      expect(result).toEqual([]);
    });
  });

  describe('looksLikeSecret', () => {
    it('should return false for empty value', () => {
      expect(looksLikeSecret('')).toBe(false);
    });

    it('should return false for null value', () => {
      expect(looksLikeSecret(null as any)).toBe(false);
    });

    it('should return false for undefined value', () => {
      expect(looksLikeSecret(undefined as any)).toBe(false);
    });

    it('should detect long alphanumeric strings', () => {
      expect(looksLikeSecret('abcdefghijklmnopqrstuvwxyz123456')).toBe(true);
    });

    it('should detect hex strings', () => {
      expect(looksLikeSecret('abcdef1234567890abcdef1234567890')).toBe(true);
    });

    it('should detect base64-like strings', () => {
      expect(looksLikeSecret('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=')).toBe(true);
    });

    it('should detect Stripe-like keys', () => {
      expect(looksLikeSecret('sk-test12345678901234567890')).toBe(true);
    });

    it('should detect public keys', () => {
      expect(looksLikeSecret('pk_test12345678901234567890')).toBe(true);
    });

    it('should not detect short strings', () => {
      expect(looksLikeSecret('short')).toBe(false);
    });

    it('should not detect normal text', () => {
      expect(looksLikeSecret('this is normal text')).toBe(false);
    });
  });

  describe('getSecretSeverity', () => {
    it('should return critical for high confidence', () => {
      expect(getSecretSeverity(95)).toBe('critical');
    });

    it('should return high for medium-high confidence', () => {
      expect(getSecretSeverity(80)).toBe('high');
    });

    it('should return medium for medium confidence', () => {
      expect(getSecretSeverity(60)).toBe('medium');
    });

    it('should return low for low confidence', () => {
      expect(getSecretSeverity(30)).toBe('low');
    });

    it('should handle edge cases', () => {
      expect(getSecretSeverity(90)).toBe('critical');
      expect(getSecretSeverity(75)).toBe('high');
      expect(getSecretSeverity(50)).toBe('medium');
      expect(getSecretSeverity(49)).toBe('low');
    });
  });

  describe('isValidSecretContext', () => {
    it('should return true when no valid contexts defined', () => {
      const result = isValidSecretContext('value', 'context');
      expect(result).toBe(true);
    });

    it('should return true when no valid contexts array', () => {
      const result = isValidSecretContext('value', 'context', []);
      expect(result).toBe(true);
    });

    it('should return true when context matches valid contexts', () => {
      const result = isValidSecretContext('value', 'config file', ['config']);
      expect(result).toBe(true);
    });

    it('should handle case insensitive matching', () => {
      const result = isValidSecretContext('value', 'CONFIG FILE', ['config']);
      expect(result).toBe(true);
    });

    it('should return false when context does not match', () => {
      const result = isValidSecretContext('value', 'random text', ['config']);
      expect(result).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle content with special characters', () => {
      const specialRule: SecretDetectionRule = {
        ...mockRule,
        pattern: /sk-[a-zA-Z0-9!@#$%^&*()]{20,}/g
      };
      const content = 'api_key=sk-test!@#$%^&*()12345678901234567890';
      const result = detectSecrets(content, [specialRule], mockContext);
      expect(result).toHaveLength(1);
    });

    it('should handle very long content', () => {
      const longContent = 'x'.repeat(10000) + 'api_key=sk-test12345678901234567890' + 'x'.repeat(10000);
      const result = detectSecrets(longContent, [mockRule], mockContext);
      expect(result).toHaveLength(1);
    });

    it('should handle multiple rules with different patterns', () => {
      const jwtRule: SecretDetectionRule = {
        ...mockRule,
        id: 'JWT',
        name: 'JWT Token',
        pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
        examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9']
      };
      
      const content = 'api_key=sk-test12345678901234567890\ntoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const result = detectSecrets(content, [mockRule, jwtRule], mockContext);
      
      expect(result).toHaveLength(2);
      expect(result[0].secretType).toBe('API Key');
      expect(result[1].secretType).toBe('JWT Token');
    });
  });
});