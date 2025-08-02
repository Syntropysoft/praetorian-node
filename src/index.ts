/**
 * SyntropySoft Praetorian
 * Guardian of configurations and security
 * 
 * Universal validation framework for DevSecOps
 */

// Core exports for MVP
export { ConfigParser } from './core/ConfigParser';
export { EqualityRule } from './core/rules/EqualityRule';

// Types
export type { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ConfigFile,
  PraetorianConfig,
  ValidationRule
} from './types'; 