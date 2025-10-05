/**
 * @file tests/integration/devsecops-rule-connector.integration.test.ts
 * @description Integration tests for DevSecOps Rule Connector
 */

import { DevSecOpsRuleConnector } from '../../src/application/services/rule-loading/DevSecOpsRuleConnector';
import { DevSecOpsConfig, RuleLoadContext } from '../../src/shared/types/devsecops-config';
import fs from 'fs';
import path from 'path';

describe('DevSecOps Rule Connector Integration Tests', () => {
  let connector: DevSecOpsRuleConnector;
  let tempDir: string;

  beforeEach(() => {
    connector = new DevSecOpsRuleConnector();
    tempDir = fs.mkdtempSync('praetorian-devsecops-test-');
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Core Functionality for DevSecOps Teams', () => {
    it('should load core rules for development environment', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: {
          name: 'test-project',
          team: 'DevSecOps',
        },
        sources: {
          core: {
            type: 'core',
            name: 'Core Rules',
            enabled: true,
          },
        },
        environments: {
          dev: {
            name: 'Development',
            sources: ['core'],
          },
        },
        validation: {
          validateOnLoad: true,
        },
      };

      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors).toHaveLength(0);
      expect(result.rules).toBeDefined();
      expect(Object.keys(result.rules).length).toBeGreaterThan(0);
      
      // Should have core rules
      expect(result.rules['required-config-version']).toBeDefined();
      expect(result.rules['version-format']).toBeDefined();
      
      expect(result.metadata.sourcesLoaded).toContain('core');
      expect(result.metadata.environmentsProcessed).toContain('dev');
    });

    it('should load local rules with glob patterns', async () => {
      // Create test rule files
      const rulesDir = path.join(tempDir, 'rules');
      fs.mkdirSync(rulesDir, { recursive: true });

      const securityRules = {
        rules: [
          { id: 'no-hardcoded-secrets', name: 'No Hardcoded Secrets' },
          { id: 'secure-defaults', name: 'Secure Default Values' },
        ],
      };

      const complianceRules = {
        rules: [
          { id: 'gdpr-compliance', name: 'GDPR Compliance' },
          { id: 'audit-trail', name: 'Audit Trail Required' },
        ],
      };

      fs.writeFileSync(
        path.join(rulesDir, 'security.yaml'),
        JSON.stringify(securityRules, null, 2)
      );
      fs.writeFileSync(
        path.join(rulesDir, 'compliance.yaml'),
        JSON.stringify(complianceRules, null, 2)
      );

      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          local: {
            type: 'local',
            name: 'Local Rules',
            path: './rules/*.yaml',
            enabled: true,
          },
        },
        environments: {
          dev: {
            name: 'Development',
            sources: ['local'],
          },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors).toHaveLength(0);
      expect(result.rules).toBeDefined();
      
      // Should have rules from both files
      expect(result.rules['no-hardcoded-secrets']).toBe('No Hardcoded Secrets');
      expect(result.rules['secure-defaults']).toBe('Secure Default Values');
      expect(result.rules['gdpr-compliance']).toBe('GDPR Compliance');
      expect(result.rules['audit-trail']).toBe('Audit Trail Required');
    });

    it('should handle environment-specific overrides', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: {
            type: 'core',
            name: 'Core Rules',
            enabled: true,
          },
        },
        environments: {
          prod: {
            name: 'Production',
            sources: ['core'],
            overrides: {
              'strict-validation': 'Enable Strict Validation',
              'audit-logging': 'Enable Audit Logging',
            },
            disabledRules: ['debug-mode'],
          },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'prod',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors).toHaveLength(0);
      
      // Should have overridden rules
      expect(result.rules['strict-validation']).toBe('Enable Strict Validation');
      expect(result.rules['audit-logging']).toBe('Enable Audit Logging');
    });

    it('should apply global overrides and disabled rules', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: {
            type: 'core',
            name: 'Core Rules',
            enabled: true,
          },
        },
        environments: {
          dev: {
            name: 'Development',
            sources: ['core'],
          },
        },
        globalOverrides: {
          'team-name': 'DevSecOps Team',
          'validation-timeout': '30s',
        },
        globalDisabled: ['experimental-rule'],
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors).toHaveLength(0);
      
      // Should have global overrides
      expect(result.rules['team-name']).toBe('DevSecOps Team');
      expect(result.rules['validation-timeout']).toBe('30s');
    });
  });

  describe('DevSecOps Pipeline Scenarios', () => {
    it('should handle CI/CD pipeline environment', async () => {
      // Create company rules file
      const companyRules = {
        rules: [
          { id: 'company-policy', name: 'Company Policy Compliance' },
          { id: 'audit-requirements', name: 'Audit Requirements' },
        ],
      };
      fs.writeFileSync(
        path.join(tempDir, 'company-rules.yaml'),
        JSON.stringify(companyRules, null, 2)
      );

      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: {
            type: 'core',
            name: 'Core Rules',
            enabled: true,
          },
          company: {
            type: 'local',
            name: 'Company Rules',
            path: './company-rules.yaml',
            enabled: true,
          },
        },
        environments: {
          ci: {
            name: 'CI/CD Pipeline',
            sources: ['core', 'company'],
            disabledRules: ['interactive-validation'],
            overrides: {
              'automated-mode': 'Automated Validation Mode',
            },
          },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'ci',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors).toHaveLength(0);
      expect(result.rules['automated-mode']).toBe('Automated Validation Mode');
      expect(result.metadata.environmentsProcessed).toContain('ci');
    });

    it('should handle multi-environment configuration', async () => {
      // Create security rules file
      const securityRules = {
        rules: [
          { id: 'security-scan', name: 'Security Scan Required' },
          { id: 'vulnerability-check', name: 'Vulnerability Check' },
        ],
      };
      fs.writeFileSync(
        path.join(tempDir, 'security-rules.yaml'),
        JSON.stringify(securityRules, null, 2)
      );

      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: {
            type: 'core',
            name: 'Core Rules',
            enabled: true,
          },
          security: {
            type: 'local',
            name: 'Security Rules',
            path: './security-rules.yaml',
            enabled: true,
          },
        },
        environments: {
          dev: {
            name: 'Development',
            sources: ['core'],
          },
          staging: {
            name: 'Staging',
            sources: ['core', 'security'],
          },
          prod: {
            name: 'Production',
            sources: ['core', 'security'],
            overrides: {
              'strict-mode': 'Enable Strict Mode',
            },
          },
        },
        validation: { validateOnLoad: true },
      };

      // Test dev environment
      const devContext: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };
      const devResult = await connector.loadRulesFromConfig(config, devContext);
      expect(devResult.errors).toHaveLength(0);

      // Test prod environment
      const prodContext: RuleLoadContext = {
        environment: 'prod',
        workingDirectory: tempDir,
      };
      const prodResult = await connector.loadRulesFromConfig(config, prodContext);
      expect(prodResult.errors).toHaveLength(0);
      expect(prodResult.rules['strict-mode']).toBe('Enable Strict Mode');
    });
  });

  describe('Error Handling for DevSecOps Teams', () => {
    it('should handle missing environment gracefully', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: { type: 'core', name: 'Core Rules', enabled: true },
        },
        environments: {
          dev: { name: 'Development', sources: ['core'] },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'nonexistent',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Environment \'nonexistent\' not found');
    });

    it('should handle missing source gracefully', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: { type: 'core', name: 'Core Rules', enabled: true },
        },
        environments: {
          dev: {
            name: 'Development',
            sources: ['core', 'nonexistent-source'],
          },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => 
        error.includes('Source \'nonexistent-source\' not found')
      )).toBe(true);
    });

    it('should handle disabled sources', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: {
            type: 'core',
            name: 'Core Rules',
            enabled: false, // Disabled
          },
        },
        environments: {
          dev: {
            name: 'Development',
            sources: ['core'],
          },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors).toHaveLength(0);
      expect(result.warnings.some(warning => 
        warning.includes('is disabled')
      )).toBe(true);
      expect(Object.keys(result.rules).length).toBe(0);
    });
  });

  describe('Guard Clauses and Validation', () => {
    it('should validate configuration structure', async () => {
      const invalidConfig = {
        // Missing required fields
        sources: {},
        environments: {},
      } as DevSecOpsConfig;

      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(invalidConfig, context);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => 
        error.includes('No rule sources defined')
      )).toBe(true);
    });

    it('should handle empty configuration', async () => {
      const context: RuleLoadContext = {
        environment: 'dev',
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(null as any, context);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Configuration is required');
    });

    it('should handle missing environment in context', async () => {
      const config: DevSecOpsConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        sources: {
          core: { type: 'core', name: 'Core Rules', enabled: true },
        },
        environments: {
          dev: { name: 'Development', sources: ['core'] },
        },
        validation: { validateOnLoad: true },
      };

      const context: RuleLoadContext = {
        environment: '', // Empty environment
        workingDirectory: tempDir,
      };

      const result = await connector.loadRulesFromConfig(config, context);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Environment is required');
    });
  });
});
