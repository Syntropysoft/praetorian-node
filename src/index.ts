/**
 * SyntropySoft Praetorian
 * Guardian of configurations and security
 * 
 * Universal validation framework for DevSecOps
 */

// Domain Layer
export * from './domain/rules/EqualityRule';

// Application Layer
export * from './application/orchestrators/ValidationOrchestrator';
export * from './application/services/Validator';
export * from './application/services/AuditEngine';
export * from './application/services/AuditCalculator';
export * from './application/validators/PluginValidator';

// Infrastructure Layer
export * from './infrastructure/plugins/PluginLoader';
export * from './infrastructure/plugins/PluginManager';
export * from './infrastructure/plugins/HealthChecker';
export * from './infrastructure/plugins/base/BasePlugin';
export * from './infrastructure/parsers/ConfigParser';
export * from './infrastructure/adapters';

// Shared Layer - Solo exportar tipos específicos para evitar duplicados
export type { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ConfigFile,
  PraetorianConfig,
  ValidationRule,
  ValidationContext,
  PluginMetadata
} from './shared/types';
export * from './shared/utils/ResultBuilder';
export * from './shared/utils/EnvironmentManager';

// Presentation Layer
export * from './presentation/cli/cli';
export * from './presentation/output/CLILogger'; 