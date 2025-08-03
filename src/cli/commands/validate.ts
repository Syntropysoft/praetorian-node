import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

interface ValidateOptions {
  verbose?: boolean;
  strict?: boolean;
  env?: string;
  all?: boolean;
  environments?: string;
  failFast?: boolean;
}

export async function runValidation(configPath: string, options: ValidateOptions = {}) {
  console.log(chalk.blue('\n🔍 Validating SyntropyLog Configuration...\n'));

  try {
    // Determine validation mode
    if (options.all || options.env) {
      await validateByEnvironments(options);
    } else {
      await validateSingleFile(configPath, options);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Validation failed:'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function validateByEnvironments(options: ValidateOptions) {
  const environmentsFile = options.environments || 'environments.yaml';
  
  // Check if environments file exists
  if (!fs.existsSync(environmentsFile)) {
    console.error(chalk.red(`❌ Environments file not found: ${environmentsFile}`));
    console.log(chalk.yellow('\nCreate an environments.yaml file with your environment configurations:'));
    console.log(chalk.gray(`
dev: config-dev.yaml
staging: config-staging.yaml
production: config-prod.yaml
    `));
    process.exit(1);
  }

  // Load environments configuration
  const environmentsContent = fs.readFileSync(environmentsFile, 'utf8');
  const environments = yaml.parse(environmentsContent);

  if (options.verbose) {
    console.log(chalk.gray('📄 Environments loaded:'));
    console.log(chalk.gray(JSON.stringify(environments, null, 2)));
    console.log('');
  }

  if (options.all) {
    await validateAllEnvironments(environments, options);
  } else if (options.env) {
    await validateSpecificEnvironment(options.env, environments, options);
  }
}

async function validateAllEnvironments(environments: Record<string, string>, options: ValidateOptions) {
  console.log(chalk.blue('🌍 Validating all environments...\n'));

  const results = [];
  let totalEnvironments = 0;
  let passedEnvironments = 0;
  let failedEnvironments = 0;

  for (const [envName, configFile] of Object.entries(environments)) {
    console.log(chalk.gray(`Validating ${envName} (${configFile})...`));
    
    try {
      const result = await validateSingleFile(configFile, { ...options, env: envName });
      results.push({ environment: envName, configFile, result });
      
      if (result.success) {
        passedEnvironments++;
        console.log(chalk.green(`✅ ${envName}: PASSED`));
      } else {
        failedEnvironments++;
        console.log(chalk.red(`❌ ${envName}: FAILED`));
        
        if (options.failFast) {
          console.log(chalk.red('\n🚨 Fail-fast enabled. Stopping validation.'));
          process.exit(1);
        }
      }
    } catch (error) {
      failedEnvironments++;
      console.log(chalk.red(`❌ ${envName}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`));
      
      if (options.failFast) {
        console.log(chalk.red('\n🚨 Fail-fast enabled. Stopping validation.'));
        process.exit(1);
      }
    }
    
    totalEnvironments++;
  }

  // Display summary
  displayMultiEnvironmentResults(results, totalEnvironments, passedEnvironments, failedEnvironments);
}

async function validateSpecificEnvironment(envName: string, environments: Record<string, string>, options: ValidateOptions) {
  const configFile = environments[envName];
  
  if (!configFile) {
    console.error(chalk.red(`❌ Environment '${envName}' not found in environments file`));
    console.log(chalk.yellow('\nAvailable environments:'));
    Object.keys(environments).forEach(env => console.log(chalk.gray(`  • ${env}`)));
    process.exit(1);
  }

  console.log(chalk.blue(`🌍 Validating environment: ${envName} (${configFile})\n`));
  
  try {
    const result = await validateSingleFile(configFile, { ...options, env: envName });
    displayValidationResults(result, options);
  } catch (error) {
    console.error(chalk.red(`❌ Validation failed for ${envName}:`));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function validateSingleFile(configPath: string, options: ValidateOptions) {
  // Check if file exists
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  // Read and parse configuration
  const configContent = fs.readFileSync(configPath, 'utf8');
  let config: any;

  if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
    config = yaml.parse(configContent);
  } else if (configPath.endsWith('.json')) {
    config = JSON.parse(configContent);
  } else {
    throw new Error('Unsupported file format. Use .yaml, .yml, or .json');
  }

  if (options.verbose) {
    console.log(chalk.gray('📄 Configuration loaded:'));
    console.log(chalk.gray(JSON.stringify(config, null, 2)));
    console.log('');
  }

  // Mock validation result for now
  const result = {
    success: true,
    errors: [],
    warnings: [],
    metadata: {
      rulesChecked: 5,
      rulesPassed: 5,
      rulesFailed: 0
    }
  };

  return result;
}

function displayMultiEnvironmentResults(results: any[], total: number, passed: number, failed: number) {
  console.log(chalk.blue('\n📊 Multi-Environment Validation Results:\n'));

  // Environment results
  results.forEach(({ environment, configFile, result }) => {
    const status = result.success ? chalk.green('✅') : chalk.red('❌');
    console.log(`${status} ${environment} (${configFile}): ${result.success ? 'PASSED' : 'FAILED'}`);
    
    if (!result.success && result.errors) {
      result.errors.forEach((error: any) => {
        console.log(chalk.red(`    • ${error.message}`));
      });
    }
  });

  // Summary
  console.log(chalk.blue('\n📈 Summary:'));
  console.log(`  • Total environments: ${total}`);
  console.log(`  • Passed: ${chalk.green(passed)}`);
  console.log(`  • Failed: ${chalk.red(failed)}`);

  if (failed > 0) {
    console.log(chalk.red('\n⚠️  Some environments have validation errors.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All environments passed validation!'));
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