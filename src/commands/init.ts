import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { ConfigParser } from '../infrastructure/parsers/ConfigParser';
import fs from 'fs';
import path from 'path';

export default class Init extends Command {
  static override description = 'Initialize a new Praetorian configuration file';

  static override examples = [
    '$ praetorian init',
    '$ praetorian init --config my-config.yaml',
    '$ praetorian init --devsecops',
    '$ praetorian init --devsecops --config devsecops.yaml',
  ];

  static override flags = {
    config: Flags.string({
      char: 'c',
      description: 'Path for the configuration file',
      default: 'praetorian.yaml',
    }),
    devsecops: Flags.boolean({
      char: 'd',
      description: 'Generate DevSecOps configuration template',
      default: false,
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    const { flags } = await this.parse(Init);

    try {
      if (flags.devsecops) {
        await this.createDevSecOpsConfig(flags.config);
      } else {
        await this.createStandardConfig(flags.config);
      }

    } catch (error) {
      this.error(error instanceof Error ? error.message : 'Unknown error');
      this.exit(1);
    }
  }

  private async createStandardConfig(configPath: string): Promise<void> {
    const configParser = new ConfigParser(configPath);

    if (configParser.exists()) {
      this.log(chalk.yellow(`⚠️  Configuration file already exists: ${configPath}`));
      this.log(chalk.gray('Use --config to specify a different path'));
      return;
    }

    // Create default configuration
    configParser.createDefault();

    this.log(chalk.green(`✅ Configuration file created: ${configPath}`));
    this.log(chalk.green(`✅ Example rule files created in ./rules/ directory`));
    
    this.log(chalk.blue('\n📋 What was created:'));
    this.log(chalk.gray(`• ${configPath} - Main configuration with core rules`));
    this.log(chalk.gray('• ./rules/structure.yaml - Structure validation rules'));
    this.log(chalk.gray('• ./rules/format.yaml - Format validation rules'));
    this.log(chalk.gray('• ./rules/security.yaml - Security validation rules'));
    this.log(chalk.gray('• ./rules/schema.yaml - Schema validation rules'));
    
    this.log(chalk.blue('\n🎯 Next steps:'));
    this.log(chalk.gray('1. Edit praetorian.yaml to configure your validation'));
    this.log(chalk.gray('2. Customize rule files in ./rules/ directory'));
    this.log(chalk.gray('3. Add your configuration files to validate'));
    this.log(chalk.gray('4. Run: praetorian validate'));
    
    this.log(chalk.blue('\n📖 Example usage:'));
    this.log(chalk.gray('$ praetorian validate'));
    this.log(chalk.gray('$ praetorian validate --config my-config.yaml'));
    this.log(chalk.gray('$ praetorian validate config1.yaml config2.yaml'));
  }

  private async createDevSecOpsConfig(configPath: string): Promise<void> {
    if (fs.existsSync(configPath)) {
      this.log(chalk.yellow(`⚠️  Configuration file already exists: ${configPath}`));
      this.log(chalk.gray('Use --config to specify a different path'));
      return;
    }

    // Read DevSecOps template
    const templatePath = path.join(__dirname, '../../shared/templates/devsecops-template.yaml');
    let template: string;
    
    try {
      template = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      // Fallback to inline template if file not found
      template = this.getDevSecOpsTemplate();
    }

    // Write DevSecOps configuration
    fs.writeFileSync(configPath, template);

    // Create directories for DevSecOps structure
    const rulesDir = path.join(process.cwd(), 'rules');
    const environmentsDir = path.join(process.cwd(), 'environments');
    
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
    }
    if (!fs.existsSync(environmentsDir)) {
      fs.mkdirSync(environmentsDir, { recursive: true });
    }

    // Create example rule files for DevSecOps
    this.createDevSecOpsRuleFiles(rulesDir);
    
    // Create environments YAML file
    this.createEnvironmentsFile(environmentsDir);

    this.log(chalk.green(`✅ DevSecOps configuration created: ${configPath}`));
    this.log(chalk.green(`✅ DevSecOps structure created in ./rules/ and ./environments/`));
    
    this.log(chalk.blue('\n📋 What was created:'));
    this.log(chalk.gray(`• ${configPath} - DevSecOps configuration template`));
    this.log(chalk.gray('• ./rules/ - Directory for team-specific rules'));
    this.log(chalk.gray('• ./rules/security.yaml - Security rules example'));
    this.log(chalk.gray('• ./rules/compliance.yaml - Compliance rules example'));
    this.log(chalk.gray('• ./environments/ - Directory for environment-specific configs'));
    this.log(chalk.gray('• ./environments/environments.yaml - Environment configuration template'));
    
    this.log(chalk.blue('\n🎯 DevSecOps Features:'));
    this.log(chalk.gray('• Multi-source rule loading (core, local, remote, package, git)'));
    this.log(chalk.gray('• Environment-specific configurations'));
    this.log(chalk.gray('• Team visibility and collaboration'));
    this.log(chalk.gray('• Pipeline integration ready'));
    
    this.log(chalk.blue('\n📖 DevSecOps Usage:'));
    this.log(chalk.gray('$ praetorian validate --env=dev'));
    this.log(chalk.gray('$ praetorian validate --env=prod --config praetorian.yaml'));
    this.log(chalk.gray('$ praetorian validate --env=ci --rules=security'));
  }

  private createDevSecOpsRuleFiles(rulesDir: string): void {
    // Security rules example
    const securityRules = `# Team Security Rules
rules:
  - id: "no-hardcoded-secrets"
    name: "No Hardcoded Secrets"
  - id: "secure-defaults"
    name: "Secure Default Values"
  - id: "encryption-required"
    name: "Encryption Required for Sensitive Data"
  - id: "access-control"
    name: "Proper Access Control Configuration"
`;

    // Compliance rules example
    const complianceRules = `# Company Compliance Rules
rules:
  - id: "gdpr-compliance"
    name: "GDPR Compliance Check"
  - id: "audit-trail"
    name: "Audit Trail Required"
  - id: "data-retention"
    name: "Data Retention Policy"
  - id: "privacy-by-design"
    name: "Privacy by Design Principles"
`;

    fs.writeFileSync(path.join(rulesDir, 'security.yaml'), securityRules);
    fs.writeFileSync(path.join(rulesDir, 'compliance.yaml'), complianceRules);
  }

  private createEnvironmentsFile(environmentsDir: string): void {
    const environmentsYaml = `# Environment Configuration
# Define all your environments and their configuration files
# You can add as many environments as needed for your deployment pipeline

environments:
  # Development environment
  dev:
    name: "Development"
    config_files:
      - "./configs/app-dev.yaml"
      - "./configs/database-dev.yaml"
      - "./configs/api-dev.yaml"
    description: "Local development environment"
    
  # Staging environment
  staging:
    name: "Staging"
    config_files:
      - "./configs/app-staging.yaml"
      - "./configs/database-staging.yaml"
      - "./configs/api-staging.yaml"
    description: "Pre-production testing environment"
    
  # Production environment
  prod:
    name: "Production"
    config_files:
      - "./configs/app-prod.yaml"
      - "./configs/database-prod.yaml"
      - "./configs/api-prod.yaml"
    description: "Production environment"

# You can add more environments as needed:
# Examples:
# predev:
#   name: "Pre-Development"
#   config_files:
#     - "./configs/app-predev.yaml"
#     
# test:
#   name: "Testing"
#   config_files:
#     - "./configs/app-test.yaml"
#     
# qa:
#   name: "Quality Assurance"
#   config_files:
#     - "./configs/app-qa.yaml"
#     
# preprod:
#   name: "Pre-Production"
#   config_files:
#     - "./configs/app-preprod.yaml"
#     
# canary:
#   name: "Canary Deployment"
#   config_files:
#     - "./configs/app-canary.yaml"
`;

    fs.writeFileSync(path.join(environmentsDir, 'environments.yaml'), environmentsYaml);
  }

  private getDevSecOpsTemplate(): string {
    return `# Praetorian DevSecOps Configuration
# Declarative configuration for security, operations, and development teams
# Version: 1.0.0

version: "1.0.0"

# Project information for team visibility
project:
  name: "my-application"
  description: "Application configuration validation"
  team: "DevSecOps"
  repository: "https://github.com/company/my-application"

# Rule sources configuration
# Each source defines where rules come from
sources:
  # Core Praetorian rules (always available)
  core:
    type: "core"
    name: "Praetorian Core Rules"
    description: "Built-in security and configuration rules"
    enabled: true
    priority: 1

  # Local team rules
  team-security:
    type: "local"
    name: "Team Security Rules"
    description: "Custom security rules for our team"
    path: "./rules/security/*.yaml"
    enabled: true
    priority: 5

  # Company-wide rules
  company-compliance:
    type: "local"
    name: "Company Compliance Rules"
    description: "Company-wide compliance and security rules"
    path: "./rules/compliance.yaml"
    enabled: true
    priority: 3

# Environment-specific configurations
# Note: Environment files are defined in ./environments/environments.yaml
# This allows you to add as many environments as needed (predev, test, qa, preprod, canary, etc.)
environments:
  # Development environment - minimal rules for speed
  dev:
    name: "Development"
    sources:
      - "core"
      - "team-security"
    overrides:
      "debug-mode": "Enable Debug Mode"

  # Staging environment - more comprehensive rules
  staging:
    name: "Staging"
    sources:
      - "core"
      - "team-security"
      - "company-compliance"
    overrides:
      "test-data-allowed": "Allow Test Data"

  # Production environment - all security rules
  prod:
    name: "Production"
    sources:
      - "core"
      - "team-security"
      - "company-compliance"
    overrides:
      "strict-validation": "Enable Strict Validation"
      "audit-logging": "Enable Audit Logging"

  # CI/CD pipeline environment
  ci:
    name: "CI/CD Pipeline"
    sources:
      - "core"
      - "company-compliance"
    overrides:
      "automated-mode": "Automated Validation Mode"

# Global rule overrides (apply to all environments)
globalOverrides:
  "team-name": "DevSecOps Team"
  "validation-timeout": "30s"

# Validation settings
validation:
  # Validate configuration on load
  validateOnLoad: true
  # Fail if required sources are missing
  failOnMissingSource: true
  # Warn about duplicate rules
  warnOnDuplicates: true

# Example usage in pipeline:
# praetorian validate --env=prod --config=./praetorian.yaml
# praetorian validate --env=dev --config=./praetorian.yaml
# praetorian validate --env=staging --config=./praetorian.yaml
#
# Note: Only rules from specified 'sources' will be loaded and applied.
# Use 'overrides' to customize rule behavior per environment.
`;
  }
} 