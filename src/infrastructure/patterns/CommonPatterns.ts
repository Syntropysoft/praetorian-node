/**
 * Common Patterns - Functional Programming
 * 
 * Single Responsibility: Provide predefined pattern rules
 * Pure functions, no state, no side effects
 */

import { PatternRule, PatternType } from '../../shared/types/pattern';

/**
 * Pure function to get all common pattern rules
 */
export const getAllCommonPatterns = (): PatternRule[] => [
  ...getEmailPatterns(),
  ...getUrlPatterns(),
  ...getPhonePatterns(),
  ...getUuidPatterns(),
  ...getVersionPatterns(),
  ...getIpPatterns(),
  ...getHostnamePatterns(),
  ...getPortPatterns(),
  ...getPathPatterns(),
  ...getFormatPatterns(),
  ...getNumericPatterns(),
  ...getAlphaPatterns()
];

/**
 * Pure function to get email patterns
 */
export const getEmailPatterns = (): PatternRule[] => [
  {
    id: 'EMAIL_BASIC',
    name: 'Basic Email',
    description: 'Validates basic email format',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    severity: 'error',
    required: true
  },
  {
    id: 'EMAIL_STRICT',
    name: 'Strict Email',
    description: 'Validates strict email format with domain validation',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get URL patterns
 */
export const getUrlPatterns = (): PatternRule[] => [
  {
    id: 'URL_HTTP',
    name: 'HTTP URL',
    description: 'Validates HTTP/HTTPS URLs',
    pattern: '^https?://[^\\s/$.?#].[^\\s]*$',
    severity: 'error',
    required: true
  },
  {
    id: 'URL_STRICT',
    name: 'Strict URL',
    description: 'Validates strict URL format',
    pattern: '^https?://(?:[\\w\\-]+\\.)+[\\w\\-]+(?:/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=]*)?$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get phone patterns
 */
export const getPhonePatterns = (): PatternRule[] => [
  {
    id: 'PHONE_INTERNATIONAL',
    name: 'International Phone',
    description: 'Validates international phone numbers',
    pattern: '^\\+[1-9]\\d{1,14}$',
    severity: 'error',
    required: true
  },
  {
    id: 'PHONE_US',
    name: 'US Phone',
    description: 'Validates US phone numbers',
    pattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get UUID patterns
 */
export const getUuidPatterns = (): PatternRule[] => [
  {
    id: 'UUID_V4',
    name: 'UUID v4',
    description: 'Validates UUID v4 format',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    flags: 'i',
    severity: 'error',
    required: true
  },
  {
    id: 'UUID_ANY',
    name: 'Any UUID',
    description: 'Validates any UUID format',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    flags: 'i',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get version patterns
 */
export const getVersionPatterns = (): PatternRule[] => [
  {
    id: 'VERSION_SEMVER',
    name: 'Semantic Version',
    description: 'Validates semantic versioning format',
    pattern: '^\\d+\\.\\d+\\.\\d+(-[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*)?(\\+[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*)?$',
    severity: 'error',
    required: true
  },
  {
    id: 'VERSION_SIMPLE',
    name: 'Simple Version',
    description: 'Validates simple version format (x.y.z)',
    pattern: '^\\d+\\.\\d+\\.\\d+$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get IP patterns
 */
export const getIpPatterns = (): PatternRule[] => [
  {
    id: 'IPV4',
    name: 'IPv4 Address',
    description: 'Validates IPv4 addresses',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    severity: 'error',
    required: true
  },
  {
    id: 'IPV6',
    name: 'IPv6 Address',
    description: 'Validates IPv6 addresses',
    pattern: '^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get hostname patterns
 */
export const getHostnamePatterns = (): PatternRule[] => [
  {
    id: 'HOSTNAME_BASIC',
    name: 'Basic Hostname',
    description: 'Validates basic hostname format',
    pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$',
    severity: 'error',
    required: true
  }
];

/**
 * Pure function to get port patterns
 */
export const getPortPatterns = (): PatternRule[] => [
  {
    id: 'PORT_RANGE',
    name: 'Port Range',
    description: 'Validates port numbers (1-65535)',
    pattern: '^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$',
    severity: 'error',
    required: true
  }
];

/**
 * Pure function to get path patterns
 */
export const getPathPatterns = (): PatternRule[] => [
  {
    id: 'PATH_UNIX',
    name: 'Unix Path',
    description: 'Validates Unix-style file paths',
    pattern: '^(/[^/ ]*)+/?$',
    severity: 'error',
    required: true
  },
  {
    id: 'PATH_WINDOWS',
    name: 'Windows Path',
    description: 'Validates Windows-style file paths',
    pattern: '^[a-zA-Z]:\\\\([^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get format patterns
 */
export const getFormatPatterns = (): PatternRule[] => [
  {
    id: 'BASE64',
    name: 'Base64',
    description: 'Validates Base64 encoded strings',
    pattern: '^[A-Za-z0-9+/]*={0,2}$',
    severity: 'error',
    required: true
  },
  {
    id: 'HEX',
    name: 'Hexadecimal',
    description: 'Validates hexadecimal strings',
    pattern: '^[0-9a-fA-F]+$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get numeric patterns
 */
export const getNumericPatterns = (): PatternRule[] => [
  {
    id: 'NUMERIC_INTEGER',
    name: 'Integer',
    description: 'Validates integer numbers',
    pattern: '^-?\\d+$',
    severity: 'error',
    required: true
  },
  {
    id: 'NUMERIC_DECIMAL',
    name: 'Decimal',
    description: 'Validates decimal numbers',
    pattern: '^-?\\d+\\.\\d+$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get alpha patterns
 */
export const getAlphaPatterns = (): PatternRule[] => [
  {
    id: 'ALPHA_ONLY',
    name: 'Alpha Only',
    description: 'Validates alphabetic characters only',
    pattern: '^[a-zA-Z]+$',
    severity: 'error',
    required: true
  },
  {
    id: 'ALPHANUMERIC',
    name: 'Alphanumeric',
    description: 'Validates alphanumeric characters',
    pattern: '^[a-zA-Z0-9]+$',
    severity: 'error',
    required: false
  }
];

/**
 * Pure function to get patterns by type
 */
export const getPatternsByType = (type: PatternType): PatternRule[] => {
  const patternMap: Record<PatternType, () => PatternRule[]> = {
    [PatternType.EMAIL]: getEmailPatterns,
    [PatternType.URL]: getUrlPatterns,
    [PatternType.PHONE]: getPhonePatterns,
    [PatternType.UUID]: getUuidPatterns,
    [PatternType.VERSION]: getVersionPatterns,
    [PatternType.SEMVER]: getVersionPatterns,
    [PatternType.IPV4]: getIpPatterns,
    [PatternType.IPV6]: getIpPatterns,
    [PatternType.HOSTNAME]: getHostnamePatterns,
    [PatternType.PORT]: getPortPatterns,
    [PatternType.PATH]: getPathPatterns,
    [PatternType.JSON]: () => [],
    [PatternType.YAML]: () => [],
    [PatternType.XML]: () => [],
    [PatternType.BASE64]: getFormatPatterns,
    [PatternType.HEX]: getFormatPatterns,
    [PatternType.ALPHANUMERIC]: getAlphaPatterns,
    [PatternType.NUMERIC]: getNumericPatterns,
    [PatternType.ALPHA]: getAlphaPatterns,
    [PatternType.CUSTOM]: () => []
  };

  return patternMap[type]?.() || [];
};
