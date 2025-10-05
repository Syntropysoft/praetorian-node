/**
 * @file src/shared/types/devsecops-config.ts
 * @description Declarative configuration for DevSecOps teams
 */

/**
 * @interface RuleSource
 * @description Source configuration for rules (SOLID SRP)
 */
export interface RuleSource {
  /** Type of rule source */
  type: 'core' | 'local' | 'remote' | 'package' | 'git';
  /** Human-readable name for this source */
  name: string;
  /** Description for team visibility */
  description?: string;
  /** Path for local files (supports glob patterns) */
  path?: string;
  /** URL for remote sources */
  url?: string;
  /** NPM package name */
  package?: string;
  /** Git repository URL */
  repo?: string;
  /** Branch/tag for git sources */
  branch?: string;
  /** Subpath within git repo */
  gitPath?: string;
  /** Whether this source is enabled */
  enabled?: boolean;
  /** Priority for rule conflicts (higher = wins) */
  priority?: number;
}

/**
 * @interface EnvironmentConfig
 * @description Environment-specific rule configuration (SOLID SRP)
 */
export interface EnvironmentConfig {
  /** Environment name */
  name: string;
  /** Sources to load for this environment */
  sources: string[]; // References to source names
  /** Additional rules specific to this environment */
  additionalRules?: { [ruleId: string]: string };
  /** Rules to disable for this environment */
  disabledRules?: string[];
  /** Environment-specific overrides */
  overrides?: { [ruleId: string]: string };
}

/**
 * @interface DevSecOpsConfig
 * @description Main configuration for DevSecOps teams
 */
export interface DevSecOpsConfig {
  /** Version of the configuration schema */
  version: string;
  /** Project information */
  project: {
    name: string;
    description?: string;
    team?: string;
    repository?: string;
  };
  /** Rule sources configuration */
  sources: { [sourceName: string]: RuleSource };
  /** Environment-specific configurations */
  environments: { [envName: string]: EnvironmentConfig };
  /** Global rule overrides */
  globalOverrides?: { [ruleId: string]: string };
  /** Global disabled rules */
  globalDisabled?: string[];
  /** Validation settings */
  validation: {
    /** Whether to validate on config load */
    validateOnLoad?: boolean;
    /** Whether to fail on missing sources */
    failOnMissingSource?: boolean;
    /** Whether to warn on duplicate rules */
    warnOnDuplicates?: boolean;
  };
}

/**
 * @interface RuleLoadContext
 * @description Context for loading rules (SOLID SRP)
 */
export interface RuleLoadContext {
  /** Current environment */
  environment: string;
  /** Working directory */
  workingDirectory: string;
  /** Whether to include core rules by default */
  includeCoreRules?: boolean;
  /** Cache settings */
  cache?: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
  };
}

/**
 * @interface RuleLoadResult
 * @description Result of loading rules from configuration
 */
export interface RuleLoadResult {
  /** Successfully loaded rules */
  rules: { [ruleId: string]: string };
  /** Errors encountered during loading */
  errors: string[];
  /** Warnings encountered during loading */
  warnings: string[];
  /** Metadata about the loading process */
  metadata: {
    sourcesLoaded: string[];
    environmentsProcessed: string[];
    totalRules: number;
    duplicateRules: number;
    loadDuration: number;
  };
}

/**
 * @interface SourceLoadResult
 * @description Result of loading from a specific source
 */
export interface SourceLoadResult {
  /** Source name */
  sourceName: string;
  /** Successfully loaded rules */
  rules: { [ruleId: string]: string };
  /** Errors encountered */
  errors: string[];
  /** Warnings encountered */
  warnings: string[];
  /** Whether loading was successful */
  success: boolean;
}
