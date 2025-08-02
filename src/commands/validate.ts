import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { ConfigParser } from '../core/ConfigParser';
import { EqualityRule } from '../core/rules/EqualityRule';
import { ConfigFile } from '../types';

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
      this.displayResults(result, flags.output);

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
    const configFiles: ConfigFile[] = [];

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      let parsedContent: Record<string, any>;

      if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        parsedContent = yaml.parse(content);
      } else if (filePath.endsWith('.json')) {
        parsedContent = JSON.parse(content);
      } else if (filePath.endsWith('.env') || filePath.startsWith('env.')) {
        parsedContent = this.parseEnvFile(content);
      } else {
        throw new Error(`Unsupported file format: ${filePath}`);
      }

      configFiles.push({
        path: filePath,
        content: parsedContent,
        format: this.getFileFormat(filePath),
      });
    }

    return configFiles;
  }

  private parseEnvFile(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          result[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
    
    return result;
  }

  private getFileFormat(filePath: string): 'yaml' | 'json' | 'env' {
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      return 'yaml';
    } else if (filePath.endsWith('.json')) {
      return 'json';
    } else if (filePath.endsWith('.env') || filePath.startsWith('env.')) {
      return 'env';
    }
    throw new Error(`Unsupported file format: ${filePath}`);
  }

  private displayResults(result: any, outputFormat: string) {
    if (outputFormat === 'json') {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Pretty output
    console.log(chalk.blue('\n📊 Validation Results:\n'));

    if (result.success) {
      console.log(chalk.green('✅ All files have consistent keys!'));
    } else {
      console.log(chalk.red('❌ Key inconsistencies found:'));
      
      for (const error of result.errors) {
        console.log(chalk.red(`  • ${error.message}`));
      }
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  ${result.warnings.length} warning(s):`));
      for (const warning of result.warnings) {
        console.log(chalk.yellow(`  • ${warning.message}`));
      }
    }

    // Summary
    if (result.metadata) {
      console.log(chalk.blue('\n📈 Summary:'));
      console.log(`  • Files compared: ${result.metadata.filesCompared || 0}`);
      console.log(`  • Total keys: ${result.metadata.totalKeys || 0}`);
      console.log(`  • Duration: ${result.metadata.duration || 0}ms`);
    }
  }
} 