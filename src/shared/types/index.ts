/**
 * Core types for SyntropySoft Praetorian
 */

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info?: ValidationInfo[]; // Nueva sección para información (claves vacías)
  results?: any[]; // Detailed results for each validation
  metadata?: {
    duration?: number;
    rulesChecked?: number;
    rulesPassed?: number;
    rulesFailed?: number;
    filesCompared?: number;
    [key: string]: any;
  };
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  path?: string;
  context?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'warning';
  path?: string;
  context?: any;
}

export interface ValidationInfo {
  code: string;
  message: string;
  severity: 'info';
  path?: string;
  context?: any;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'performance' | 'best-practice';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  config?: Record<string, any>;
  execute(files: ConfigFile[]): Promise<ValidationResult>;
}

export interface ConfigFile {
  path: string;
  content: Record<string, any>;
  format: string; // Support for all file formats: yaml, json, env, toml, ini, xml
  environment?: string;
  metadata?: {
    size?: number;
    lastModified?: Date;
    encoding?: string;
  };
}

export interface PraetorianConfig {
  files?: string[];
  ignore_keys?: string[];
  required_keys?: string[];
  schema?: Record<string, string>;
  patterns?: Record<string, string>;
  forbidden_keys?: string[];
  environments?: Record<string, string>;
}

export interface PluginConfig {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface AuditResult {
  success: boolean;
  score: number;
  grade: string;
  timestamp: Date;
  duration: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  results: ValidationResult[];
  summary: AuditSummary;
  issues?: AuditIssue[];
  vulnerabilities?: ValidationError[];
  complianceIssues?: ValidationError[];
  performanceIssues?: ValidationError[];
  metadata?: {
    duration?: number;
    pluginsChecked?: number;
    [key: string]: any;
  };
}

export interface AuditIssue {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'compliance' | 'performance';
  path?: string;
  context?: any;
} 

// Legacy types for backward compatibility
export interface ValidationContext {
  config?: Record<string, any>;
  environment?: string;
  project?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
  files?: Record<string, any>;
  ignoreKeys?: string[];
  requiredKeys?: string[];
  strict?: boolean;
}

export interface AuditSummary {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  criticalIssues: number;
  securityIssues: number;
  complianceIssues: number;
  recommendations: string[];
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
}

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  enabled?: boolean;
  rules: ValidationRule[];
}

// Legacy ValidationRule interface for backward compatibility

// Schema Validation Types
export * from './schema';

// Pattern Matching Types
export * from './pattern';

// Security Types
export * from './security';
 