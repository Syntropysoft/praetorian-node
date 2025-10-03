/**
 * Secret Detector - Functional Programming
 * 
 * Single Responsibility: Detect exposed secrets only
 * Pure functions, no state, no side effects
 */

import { 
  SecretDetectionRule, 
  SecretDetectionResult, 
  SecurityContext,
  SecuritySeverity 
} from '../../shared/types/security';
import { ValidationError } from '../../shared/types';

/**
 * Pure function to detect secrets in content
 */
export const detectSecrets = (
  content: string,
  rules: SecretDetectionRule[],
  context: SecurityContext
): SecretDetectionResult[] => {
  // Guard clause: no content
  if (!content || content.trim().length === 0) {
    return [];
  }

  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  return rules
    .filter(rule => rule.enabled)
    .flatMap(rule => detectSecretsWithRule(content, rule, context));
};

/**
 * Pure function to detect secrets with a specific rule
 */
const detectSecretsWithRule = (
  content: string,
  rule: SecretDetectionRule,
  context: SecurityContext
): SecretDetectionResult[] => {
  // Guard clause: invalid rule
  if (!rule || !rule.pattern) {
    return [];
  }

  const matches = findPatternMatches(content, rule.pattern);
  
  return matches
    .filter(match => !isFalsePositive(match.value, rule, context))
    .map(match => createSecretDetectionResult(match, rule, content));
};

/**
 * Pure function to find all pattern matches
 */
const findPatternMatches = (content: string, pattern: RegExp): Array<{ value: string; index: number }> => {
  const matches: Array<{ value: string; index: number }> = [];
  let match;
  
  // Reset regex lastIndex to ensure global search works
  pattern.lastIndex = 0;
  
  while ((match = pattern.exec(content)) !== null) {
    matches.push({
      value: match[0],
      index: match.index
    });
    
    // Prevent infinite loop on zero-length matches
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
  }
  
  return matches;
};

/**
 * Pure function to check if match is false positive
 */
const isFalsePositive = (
  value: string,
  rule: SecretDetectionRule,
  context: SecurityContext
): boolean => {
  // Guard clause: no exclude patterns
  if (!rule.excludePatterns || rule.excludePatterns.length === 0) {
    return false;
  }

  // Check against exclude patterns
  return rule.excludePatterns.some(excludePattern => excludePattern.test(value));
};

/**
 * Pure function to create secret detection result
 */
const createSecretDetectionResult = (
  match: { value: string; index: number },
  rule: SecretDetectionRule,
  content: string
): SecretDetectionResult => {
  const { lineNumber, columnNumber } = getLineAndColumn(content, match.index);
  const context = getContextAroundMatch(content, match.index, 50);
  
  return {
    secretType: rule.name,
    maskedValue: maskSecret(match.value),
    confidence: calculateConfidence(match.value, rule),
    context,
    lineNumber,
    columnNumber
  };
};

/**
 * Pure function to get line and column from index
 */
const getLineAndColumn = (content: string, index: number): { lineNumber: number; columnNumber: number } => {
  const beforeMatch = content.substring(0, index);
  const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
  const lastNewline = beforeMatch.lastIndexOf('\n');
  const columnNumber = index - lastNewline;
  
  return { lineNumber, columnNumber };
};

/**
 * Pure function to get context around match
 */
const getContextAroundMatch = (content: string, index: number, contextLength: number): string => {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(content.length, index + contextLength);
  return content.substring(start, end);
};

/**
 * Pure function to mask secret value
 */
const maskSecret = (value: string): string => {
  // Guard clause: empty value
  if (!value || value.length === 0) {
    return value;
  }

  // Guard clause: very short value
  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }

  // Show first 2 and last 2 characters, mask the rest
  const start = value.substring(0, 2);
  const end = value.substring(value.length - 2);
  const middle = '*'.repeat(Math.max(4, value.length - 4));
  
  return `${start}${middle}${end}`;
};

/**
 * Pure function to calculate confidence level
 */
const calculateConfidence = (value: string, rule: SecretDetectionRule): number => {
  // Guard clause: empty value
  if (!value || value.length === 0) {
    return 0;
  }

  let confidence = 50; // Base confidence

  // Length-based confidence
  if (value.length >= 20) confidence += 20;
  if (value.length >= 40) confidence += 10;

  // Character diversity
  const hasNumbers = /\d/.test(value);
  const hasLetters = /[a-zA-Z]/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

  if (hasNumbers && hasLetters) confidence += 15;
  if (hasSpecial) confidence += 10;

  // Pattern-specific confidence
  if (rule.id.includes('API_KEY') && value.startsWith('sk-')) confidence += 20;
  if (rule.id.includes('JWT') && value.includes('.')) confidence += 15;

  return Math.min(100, confidence);
};

/**
 * Pure function to check if value looks like a secret
 */
export const looksLikeSecret = (value: string): boolean => {
  // Guard clause: empty value
  if (!value || value.length === 0) {
    return false;
  }

  // Common secret patterns
  const secretPatterns = [
    /^[a-zA-Z0-9]{20,}$/, // Long alphanumeric
    /^[a-f0-9]{32,}$/i,   // Hex strings
    /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64-like
    /^sk-[a-zA-Z0-9]{20,}$/, // Stripe-like keys
    /^pk_[a-zA-Z0-9]{20,}$/, // Public keys
    /^[a-zA-Z0-9]{24,}$/ // Generic long strings
  ];

  return secretPatterns.some(pattern => pattern.test(value));
};

/**
 * Pure function to get secret severity
 */
export const getSecretSeverity = (confidence: number): SecuritySeverity => {
  if (confidence >= 90) return 'critical';
  if (confidence >= 75) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
};

/**
 * Pure function to validate secret context
 */
export const isValidSecretContext = (
  value: string,
  context: string,
  validContexts?: string[]
): boolean => {
  // Guard clause: no valid contexts defined
  if (!validContexts || validContexts.length === 0) {
    return true;
  }

  return validContexts.some(validContext => 
    context.toLowerCase().includes(validContext.toLowerCase())
  );
};
