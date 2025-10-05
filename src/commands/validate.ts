import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { ConfigParser } from '../infrastructure/parsers/ConfigParser';
import { EqualityRule } from '../domain/rules/EqualityRule';
import { FileReaderService } from '../infrastructure/adapters/FileReaderService';
import { ConfigFile } from '../shared/types';

export default class Validate extends Command {
  static override description = 'Validate configuration files for key consistency';

  static override examples = [
    '$ praetorian validate',
    '$ praetorian validate --env dev',
    '$ praetorian validate config-dev.yaml config-prod.yaml',
    '$ praetorian validate --output json',
  ];

  static override flags = {
    env: Flags.string({
      char: 'e',
      description: 'Environment to validate (dev, staging, prod)',
      required: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output format (pretty, json)',
      options: ['pretty', 'json'],
      default: 'pretty',
    }),
    config: Flags.string({
      char: 'c',
      description: 'Path to praetorian.yaml configuration file',
      default: 'praetorian.yaml',
    }),
    pipeline: Flags.boolean({
      char: 'p',
      description: 'Pipeline mode - concise output for CI/CD',
      default: false,
    }),
    help: Flags.help({ char: 'h' }),
  };

  static override args = {
    files: Args.string({
      description: 'Configuration files to compare',
      required: false,
      multiple: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Validate);

    try {
      // Determine files to compare
      let filesToCompare: string[];

      if (args.files && args.files.length > 0) {
        // Use files from command line arguments
        filesToCompare = Array.isArray(args.files) ? args.files : [args.files];
      } else {
        // Use configuration file
        const configParser = new ConfigParser(flags.config);
        
        if (!configParser.exists()) {
          this.error(`Configuration file not found: ${flags.config}`);
          this.log(chalk.yellow('\nCreate a configuration file with:'));
          this.log(chalk.gray('praetorian init'));
          return;
        }

        if (flags.env) {
          filesToCompare = configParser.getEnvironmentFiles(flags.env);
        } else {
          filesToCompare = configParser.getFilesToCompare();
        }
      }

      // Load and parse files
      const configFiles = await this.loadFiles(filesToCompare);

      // Run validation
      const rule = new EqualityRule();
      const result = await rule.execute(configFiles);

      // Display results
      this.displayResults(result, flags.output, flags.pipeline);

      // Exit with appropriate code
      if (!result.success) {
        this.exit(1);
      }

    } catch (error) {
      this.error(error instanceof Error ? error.message : 'Unknown error');
      this.exit(1);
    }
  }

  private async loadFiles(filePaths: string[]): Promise<ConfigFile[]> {
    const fileReaderService = new FileReaderService();
    
    // Validate files before reading
    const { valid, invalid } = fileReaderService.validateFiles(filePaths);
    
    if (invalid.length > 0) {
      const supportedExtensions = fileReaderService.getSupportedExtensions().join(', ');
      throw new Error(
        `Unsupported file formats: ${invalid.join(', ')}. ` +
        `Supported extensions: ${supportedExtensions}`
      );
    }
    
    return await fileReaderService.readFiles(valid);
  }

  private displayResults(result: any, outputFormat: string, isPipelineMode: boolean = false) {
    if (outputFormat === 'json') {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (isPipelineMode) {
      this.displayPipelineResults(result);
      return;
    }

    this.displayUserResults(result);
  }

  private displayPipelineResults(result: any) {
    // Pipeline mode - concise output for CI/CD
    if (result.success) {
      console.log(chalk.green('✅ PRAETORIAN_VALIDATION: PASSED'));
    } else {
      console.log(chalk.red('❌ PRAETORIAN_VALIDATION: FAILED'));
      
      // Show only critical errors for pipeline
      const criticalErrors = result.errors?.slice(0, 5) || [];
      for (const error of criticalErrors) {
        console.log(chalk.red(`  • ${error.message}`));
      }
      
      if (result.errors?.length > 5) {
        console.log(chalk.red(`  • ... and ${result.errors.length - 5} more errors`));
      }
    }

    // Pipeline summary - essential metrics only
    if (result.metadata) {
      const files = result.metadata.filesCompared || 0;
      const errors = result.errors?.length || 0;
      const warnings = result.warnings?.length || 0;
      
      console.log(chalk.blue(`PRAETORIAN_SUMMARY: files=${files}, errors=${errors}, warnings=${warnings}, duration=${result.metadata.duration || 0}ms`));
    }
  }

  private displayUserResults(result: any) {
    // User mode - detailed output with explanations
    console.log(chalk.blue('\n📊 Validation Results:\n'));

    if (result.success) {
      console.log(chalk.green('✅ All files have consistent keys!'));
      console.log(chalk.gray('   Your configuration files are properly synchronized across environments.'));
    } else {
      console.log(chalk.red('❌ Key inconsistencies found:'));
      console.log(chalk.gray('   The following keys are missing in some configuration files:'));
      
      for (const error of result.errors) {
        console.log(chalk.red(`  • ${error.message}`));
      }
      
      console.log(chalk.yellow('\n💡 Tip: Use --pipeline flag for concise CI/CD output'));
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  ${result.warnings.length} warning(s):`));
      for (const warning of result.warnings) {
        console.log(chalk.yellow(`  • ${warning.message}`));
      }
    }

    // Mostrar claves vacías como información (no afecta el pipeline)
    if (result.info && result.info.length > 0) {
      console.log(chalk.blue(`\nℹ️  ${result.info.length} empty key(s) found (informational):`));
      for (const info of result.info) {
        console.log(chalk.blue(`  • ${info.message}`));
      }
      console.log(chalk.gray('    Note: Empty keys are informational only and do not affect validation success'));
    }

    // Summary
    if (result.metadata) {
      console.log(chalk.blue('\n📈 Summary:'));
      console.log(`  • Files compared: ${result.metadata.filesCompared || 0}`);
      console.log(`  • Total keys: ${result.metadata.totalKeys || 0}`);
      console.log(`  • Empty keys: ${result.metadata.emptyKeys || 0}`);
      console.log(`  • Duration: ${result.metadata.duration || 0}ms`);
      
      if (result.success) {
        console.log(chalk.green('\n🎉 Validation completed successfully!'));
      } else {
        console.log(chalk.red('\n🔧 Fix the inconsistencies above and run validation again.'));
      }
    }
  }
} 