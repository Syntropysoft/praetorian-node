/**
 * SyntropySoft Praetorian
 * Guardian of configurations and security
 * 
 * Universal validation framework for DevSecOps
 */

// Domain Layer
export * from './domain/rules/EqualityRule';

// Application Layer
export * from './application/orchestrators/ValidationOrchestratorRefactored';
export * from './application/services/Validator';
export * from './application/services/AuditEngine';
export * from './application/services/AuditCalculator';
export * from './application/services/RuleLoaderService';
export * from './application/validators/PluginValidator';
export * from './application/validators/SchemaValidator';
export * from './application/validators/TypeValidator';
export * from './application/validators/FormatValidator';
export * from './application/validators/RangeValidator';
export * from './application/validators/StructureValidator';
export * from './application/validators/PatternValidator';
export * from './application/validators/SecurityValidator';
export * from './application/validators/SecretDetector';
export * from './application/validators/PermissionValidator';
export * from './application/validators/VulnerabilityScanner';
export * from './application/validators/ComplianceChecker';

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

// Rule System Types
export type {
  PraetorianRule,
  StructureRule,
  FormatRule,
  SecurityRule,
  SchemaRule,
  RuleSet,
  RuleConfig,
  RuleLoadResult
} from './shared/types/rules';
export * from './shared/utils/ResultBuilder';
export * from './shared/utils/EnvironmentManager';

// Presentation Layer
export * from './presentation/cli/cli'; 