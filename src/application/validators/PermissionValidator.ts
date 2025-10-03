/**
 * Permission Validator - Functional Programming
 * 
 * Single Responsibility: Validate file permissions only
 * Pure functions, no state, no side effects
 */

import { 
  PermissionRule, 
  PermissionValidationResult, 
  SecurityContext 
} from '../../shared/types/security';
import { ValidationError } from '../../shared/types';

/**
 * Pure function to validate file permissions
 */
export const validatePermissions = (
  filePath: string,
  permissions: number | undefined,
  rules: PermissionRule[],
  context: SecurityContext
): PermissionValidationResult[] => {
  // Guard clause: no file path
  if (!filePath || filePath.trim().length === 0) {
    return [];
  }

  // Guard clause: no rules
  if (!rules || rules.length === 0) {
    return [];
  }

  // Guard clause: no permissions provided
  if (permissions === undefined || permissions === null) {
    return rules.map(rule => createPermissionError(filePath, rule, 'Permissions not available'));
  }

  return rules
    .filter(rule => rule.enabled && matchesFilePattern(filePath, rule.filePattern))
    .map(rule => validateSinglePermission(filePath, permissions, rule, context));
};

/**
 * Pure function to validate a single permission rule
 */
const validateSinglePermission = (
  filePath: string,
  permissions: number,
  rule: PermissionRule,
  context: SecurityContext
): PermissionValidationResult => {
  // Guard clause: invalid rule
  if (!rule || !rule.filePattern) {
    return createPermissionError(filePath, rule, 'Invalid permission rule');
  }

  const isValid = isPermissionValid(permissions, rule);
  
  if (isValid) {
    return createPermissionSuccess(filePath, permissions, rule);
  }

  return createPermissionError(filePath, rule, 'Permissions too permissive', permissions);
};

/**
 * Pure function to check if permissions are valid
 */
const isPermissionValid = (permissions: number, rule: PermissionRule): boolean => {
  // Guard clause: invalid permissions
  if (permissions < 0 || permissions > 7777) {
    return false;
  }

  // Check maximum permissions
  if (permissions > rule.maxPermissions) {
    return false;
  }

  // Check minimum permissions if specified
  if (rule.minPermissions !== undefined && permissions < rule.minPermissions) {
    return false;
  }

  return true;
};

/**
 * Pure function to check if file matches pattern
 */
const matchesFilePattern = (filePath: string, pattern: string): boolean => {
  // Guard clause: empty pattern
  if (!pattern || pattern.trim().length === 0) {
    return false;
  }

  // Convert glob pattern to regex
  const regexPattern = convertGlobToRegex(pattern);
  return regexPattern.test(filePath);
};

/**
 * Pure function to convert glob pattern to regex
 */
const convertGlobToRegex = (globPattern: string): RegExp => {
  // Guard clause: empty pattern
  if (!globPattern) {
    return /^$/;
  }

  // Escape special regex characters except glob ones
  let regex = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*/g, '.*') // * matches anything
    .replace(/\?/g, '.'); // ? matches single char

  // Handle ** for recursive matching
  regex = regex.replace(/\*\*/g, '.*');

  return new RegExp(`^${regex}$`);
};

/**
 * Pure function to create permission success result
 */
const createPermissionSuccess = (
  filePath: string,
  permissions: number,
  rule: PermissionRule
): PermissionValidationResult => ({
  filePath,
  currentPermissions: permissions,
  requiredPermissions: rule.maxPermissions,
  valid: true
});

/**
 * Pure function to create permission error result
 */
const createPermissionError = (
  filePath: string,
  rule: PermissionRule,
  message: string,
  permissions?: number
): PermissionValidationResult => ({
  filePath,
  currentPermissions: permissions || 0,
  requiredPermissions: rule.maxPermissions,
  valid: false
});

/**
 * Pure function to format permissions as octal string
 */
export const formatPermissions = (permissions: number): string => {
  // Guard clause: invalid permissions
  if (permissions < 0 || permissions > 7777) {
    return '0000';
  }

  return permissions.toString(8).padStart(4, '0');
};

/**
 * Pure function to parse permissions from string
 */
export const parsePermissions = (permissionString: string): number => {
  // Guard clause: empty string
  if (!permissionString || permissionString.trim().length === 0) {
    return 0;
  }

  // Remove leading zeros and convert to number
  const cleanString = permissionString.replace(/^0+/, '') || '0';
  const permissions = parseInt(cleanString, 8);

  // Guard clause: invalid number
  if (isNaN(permissions) || permissions < 0 || permissions > 7777) {
    return 0;
  }

  return permissions;
};

/**
 * Pure function to check if permissions are too permissive
 */
export const isTooPermissive = (permissions: number, maxPermissions: number): boolean => {
  // Guard clause: invalid permissions
  if (permissions < 0 || permissions > 7777) {
    return true;
  }

  return permissions > maxPermissions;
};

/**
 * Pure function to check if permissions are too restrictive
 */
export const isTooRestrictive = (permissions: number, minPermissions: number): boolean => {
  // Guard clause: invalid permissions
  if (permissions < 0 || permissions > 7777) {
    return true;
  }

  return permissions < minPermissions;
};

/**
 * Pure function to get permission description
 */
export const getPermissionDescription = (permissions: number): string => {
  // Guard clause: invalid permissions
  if (permissions < 0 || permissions > 7777) {
    return 'Invalid permissions';
  }

  const owner = (permissions & 0o700) >> 6;
  const group = (permissions & 0o70) >> 3;
  const other = permissions & 0o7;

  const formatBits = (bits: number) => {
    const read = (bits & 4) ? 'r' : '-';
    const write = (bits & 2) ? 'w' : '-';
    const execute = (bits & 1) ? 'x' : '-';
    return `${read}${write}${execute}`;
  };

  return `${formatBits(owner)}${formatBits(group)}${formatBits(other)}`;
};

/**
 * Pure function to check if file is sensitive
 */
export const isSensitiveFile = (filePath: string): boolean => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return false;
  }

  const sensitivePatterns = [
    /\.env$/i,
    /\.env\..*$/i,
    /config\.json$/i,
    /secrets\.ya?ml$/i,
    /\.pem$/i,
    /\.key$/i,
    /\.p12$/i,
    /\.pfx$/i,
    /id_rsa$/i,
    /id_dsa$/i,
    /id_ecdsa$/i,
    /id_ed25519$/i
  ];

  return sensitivePatterns.some(pattern => pattern.test(filePath));
};

/**
 * Pure function to get recommended permissions for file
 */
export const getRecommendedPermissions = (filePath: string): number => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return 644;
  }

  // Sensitive files should be more restrictive
  if (isSensitiveFile(filePath)) {
    return 600; // Owner read/write only
  }

  // Executable files
  if (isExecutableFile(filePath)) {
    return 755; // Owner read/write/execute, others read/execute
  }

  // Regular files
  return 644; // Owner read/write, others read
};

/**
 * Pure function to check if file is executable
 */
const isExecutableFile = (filePath: string): boolean => {
  // Guard clause: empty path
  if (!filePath || filePath.trim().length === 0) {
    return false;
  }

  const executablePatterns = [
    /\.(sh|bash|zsh|fish)$/i,
    /\.(exe|bat|cmd)$/i,
    /\.(py|pl|rb|js|ts)$/i,
    /^[^.]*$/ // No extension (common for executables)
  ];

  return executablePatterns.some(pattern => pattern.test(filePath));
};
