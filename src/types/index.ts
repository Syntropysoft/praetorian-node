/**
 * Core types for SyntropySoft Praetorian
 */

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: Record<string, any>;
}

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  severity: 'error' | 'critical';
  context?: Record<string, any>;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  severity: 'warning' | 'info';
  context?: Record<string, any>;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'performance' | 'best-practice';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  config?: Record<string, any>;
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

export interface AuditResult {
  timestamp: Date;
  duration: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  results: ValidationResult[];
  summary: AuditSummary;
  // Properties expected by tests
  vulnerabilities?: ValidationError[];
  complianceIssues?: ValidationError[];
  performanceIssues?: ValidationError[];
  score?: number;
  grade?: string;
}

export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  config?: Record<string, any>;
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

export interface ValidationContext {
  config: Record<string, any>;
  environment: string;
  project: string;
  timestamp: Date;
  metadata: Record<string, any>;
} 