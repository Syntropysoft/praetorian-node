import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Validator } from '../../core/Validator';

interface ValidateOptions {
  verbose?: boolean;
  strict?: boolean;
}

export async function runValidation(configPath: string, options: ValidateOptions = {}) {
  console.log(chalk.blue('\n🔍 Validating SyntropyLog Configuration...\n'));

  try {
    // Check if file exists
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red(`❌ Configuration file not found: ${configPath}`));
      process.exit(1);
    }

    // Read and parse configuration
    const configContent = fs.readFileSync(configPath, 'utf8');
    let config: any;

    if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
      config = yaml.parse(configContent);
    } else if (configPath.endsWith('.json')) {
      config = JSON.parse(configContent);
    } else {
      console.error(chalk.red('❌ Unsupported file format. Use .yaml, .yml, or .json'));
      process.exit(1);
    }

    if (options.verbose) {
      console.log(chalk.gray('📄 Configuration loaded:'));
      console.log(chalk.gray(JSON.stringify(config, null, 2)));
      console.log('');
    }

    // Create validator
    const validator = new Validator({
      plugins: ['syntropylog'],
      strict: options.strict
    });

    // Validate configuration
    const result = await validator.validate(config, {
      config: config,
      environment: 'development',
      project: path.basename(process.cwd()),
      timestamp: new Date(),
      metadata: { sourceFile: configPath }
    });

    // Display results
    displayValidationResults(result, options);

  } catch (error) {
    console.error(chalk.red('\n❌ Validation failed:'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function displayValidationResults(result: any, options: ValidateOptions) {
  console.log(chalk.blue('📊 Validation Results:\n'));

  if (result.success) {
    console.log(chalk.green('✅ Configuration is valid!'));
    
    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  ${result.warnings.length} warning(s):`));
      result.warnings.forEach((warning: any, index: number) => {
        console.log(chalk.yellow(`  ${index + 1}. ${warning.message}`));
        if (warning.path) {
          console.log(chalk.gray(`     Path: ${warning.path}`));
        }
      });
    }
  } else {
    console.log(chalk.red('❌ Configuration has errors:'));
    
    result.errors.forEach((error: any, index: number) => {
      console.log(chalk.red(`  ${index + 1}. ${error.message}`));
      if (error.path) {
        console.log(chalk.gray(`     Path: ${error.path}`));
      }
      if (error.context && options.verbose) {
        console.log(chalk.gray(`     Context: ${JSON.stringify(error.context)}`));
      }
    });

    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  ${result.warnings.length} warning(s):`));
      result.warnings.forEach((warning: any, index: number) => {
        console.log(chalk.yellow(`  ${index + 1}. ${warning.message}`));
        if (warning.path) {
          console.log(chalk.gray(`     Path: ${warning.path}`));
        }
      });
    }

    process.exit(1);
  }

  // Summary
  console.log(chalk.blue('\n📈 Summary:'));
  console.log(`  • Total checks: ${result.metadata?.rulesChecked || 0}`);
  console.log(`  • Passed: ${result.metadata?.rulesPassed || 0}`);
  console.log(`  • Failed: ${result.metadata?.rulesFailed || 0}`);
  console.log(`  • Warnings: ${result.warnings?.length || 0}`);
} 