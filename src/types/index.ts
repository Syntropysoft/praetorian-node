/**
 * Core types for SyntropySoft Praetorian
 */

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
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
  severity: 'error' | 'warning';
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

export interface ValidationRule {
  name: string;
  execute(files: ConfigFile[]): Promise<ValidationResult>;
}

export interface ConfigFile {
  path: string;
  content: Record<string, any>;
  format: 'yaml' | 'json' | 'env';
  environment?: string;
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
  issues: AuditIssue[];
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
export interface LegacyValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'performance' | 'best-practice';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  config?: Record<string, any>;
} 