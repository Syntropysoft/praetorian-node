/**
 * SyntropySoft Praetorian
 * Guardian of configurations and security
 * 
 * Universal validation framework for DevSecOps
 */

// Core exports
export { Validator } from './core/Validator';
export { AuditEngine } from './core/AuditEngine';
export { PluginManager } from './core/PluginManager';

// Plugin system
export { BasePlugin } from './plugins/base/BasePlugin';

// Types
export type { ValidationResult, ValidationRule, AuditResult, PluginConfig } from './types';

// CLI (for programmatic access)
export { runCLI } from './cli/cli'; 