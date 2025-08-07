import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { ConfigParser } from '../infrastructure/parsers/ConfigParser';
import { EqualityRule } from '../domain/rules/EqualityRule';
import { FileReaderService } from '../infrastructure/adapters/FileReaderService';
import { ConfigFile } from '../shared/types';

// Types for better type safety
interface EmptyKeyInfo {
  path: string;
  file: string;
  value: any;
  valueType: string;
  message: string;
}

interface EmptyKeysReport {
  summary: {
    totalFiles: number;
    totalEmptyKeys: number;
    filesWithEmptyKeys: number;
  };
  emptyKeys: EmptyKeyInfo[];
  metadata?: any;
}

interface GroupedEmptyKeys {
  [filePath: string]: EmptyKeyInfo[];
}

export default class EmptyKeys extends Command {
  static override description = 'Generate a report of empty keys in configuration files';

  static override examples = [
    '$ praetorian empty-keys',
    '$ praetorian empty-keys --env dev',
    '$ praetorian empty-keys config-dev.yaml config-prod.yaml',
    '$ praetorian empty-keys --output json',
    '$ praetorian empty-keys --include-values',
  ];

  static override flags = {
    env: Flags.string({
      char: 'e',
      description: 'Environment to analyze (dev, staging, prod)',
      required: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output format (pretty, json, csv)',
      options: ['pretty', 'json', 'csv'],
      default: 'pretty',
    }),
    config: Flags.string({
      char: 'c',
      description: 'Path to praetorian.yaml configuration file',
      default: 'praetorian.yaml',
    }),
    'include-values': Flags.boolean({
      char: 'v',
      description: 'Include empty values in the report',
      default: false,
    }),
    'group-by-file': Flags.boolean({
      char: 'g',
      description: 'Group empty keys by file',
      default: false,
    }),
    help: Flags.help({ char: 'h' }),
  };

  static override args = {
    files: Args.string({
      description: 'Configuration files to analyze',
      required: false,
      multiple: true,
    }),
  };

  async run() {
    const { args, flags } = await this.parse(EmptyKeys);

    try {
      const filesToAnalyze = this.determineFilesToAnalyze(args, flags);
      const configFiles = await this.loadFiles(filesToAnalyze);
      const result = await new EqualityRule().execute(configFiles);
      
      this.displayEmptyKeysReport(result, flags);
    } catch (error) {
      this.error(error instanceof Error ? error.message : 'Unknown error');
      this.exit(1);
    }
  }

  private determineFilesToAnalyze(args: any, flags: any): string[] {
    if (args.files?.length > 0) {
      return Array.isArray(args.files) ? args.files : [args.files];
    }

    const configParser = new ConfigParser(flags.config);
    
    if (!configParser.exists()) {
      this.error(`Configuration file not found: ${flags.config}`);
      this.log(chalk.yellow('\nCreate a configuration file with:'));
      this.log(chalk.gray('praetorian init'));
      throw new Error('Configuration file not found');
    }

    return flags.env 
      ? configParser.getEnvironmentFiles(flags.env)
      : configParser.getFilesToCompare();
  }

  private async loadFiles(filePaths: string[]): Promise<ConfigFile[]> {
    const fileReaderService = new FileReaderService();
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

  private displayEmptyKeysReport(result: any, flags: any): void {
    const emptyKeys = result.info || [];
    const totalFiles = result.metadata?.filesCompared || 0;

    const outputHandlers = {
      json: () => this.displayJsonReport(emptyKeys, totalFiles, result.metadata),
      csv: () => this.displayCsvReport(emptyKeys, flags),
      pretty: () => this.displayPrettyReport(emptyKeys, totalFiles, flags)
    };

    const handler = outputHandlers[flags.output as keyof typeof outputHandlers] || outputHandlers.pretty;
    handler();
  }

  private displayJsonReport(emptyKeys: any[], totalFiles: number, metadata: any): void {
    const report: EmptyKeysReport = {
      summary: {
        totalFiles,
        totalEmptyKeys: emptyKeys.length,
        filesWithEmptyKeys: this.getUniqueFiles(emptyKeys).length,
      },
      emptyKeys: this.transformToEmptyKeyInfo(emptyKeys),
      metadata,
    };
    console.log(JSON.stringify(report, null, 2));
  }

  private displayCsvReport(emptyKeys: any[], flags: any): void {
    const headers = ['Key', 'File', 'Value Type', 'Value'];
    const rows = this.transformToCsvRows(emptyKeys, flags);
    
    console.log(headers.join(','));
    rows.forEach(row => console.log(row.join(',')));
  }

  private displayPrettyReport(emptyKeys: any[], totalFiles: number, flags: any): void {
    console.log(chalk.blue('\n🔍 Empty Keys Report:\n'));

    if (emptyKeys.length === 0) {
      console.log(chalk.green('✅ No empty keys found!'));
      console.log(chalk.gray(`Analyzed ${totalFiles} file(s)`));
      return;
    }

    this.displaySummary(emptyKeys, totalFiles);
    this.displayEmptyKeysList(emptyKeys, flags);
    this.displayRecommendations();
  }

  private displaySummary(emptyKeys: any[], totalFiles: number): void {
    const summaryLines = [
      `  • Files analyzed: ${totalFiles}`,
      `  • Total empty keys: ${emptyKeys.length}`,
      `  • Files with empty keys: ${this.getUniqueFiles(emptyKeys).length}`
    ];

    console.log(chalk.blue('📊 Summary:'));
    summaryLines.forEach(line => console.log(line));
  }

  private displayEmptyKeysList(emptyKeys: any[], flags: any): void {
    if (flags['group-by-file']) {
      this.displayGroupedByFile(emptyKeys, flags);
    } else {
      this.displayFlatList(emptyKeys, flags);
    }
  }

  private displayGroupedByFile(emptyKeys: any[], flags: any): void {
    const grouped = this.groupByFile(emptyKeys);
    
    Object.entries(grouped)
      .map(([filePath, keys]) => ({
        filePath,
        keys,
        count: keys.length
      }))
      .forEach(({ filePath, keys, count }) => {
        console.log(chalk.cyan(`\n📁 ${filePath} (${count} empty keys):`));
        this.renderEmptyKeys(keys, flags, '  ');
      });
  }

  private displayFlatList(emptyKeys: any[], flags: any): void {
    console.log(chalk.blue('\n📋 Empty Keys List:'));
    this.renderEmptyKeys(emptyKeys, flags, '  ');
  }

  private renderEmptyKeys(emptyKeys: any[], flags: any, prefix: string): void {
    emptyKeys
      .map(key => this.formatEmptyKeyDisplay(key, flags, prefix))
      .forEach(line => console.log(line));
  }

  private formatEmptyKeyDisplay(key: any, flags: any, prefix: string): string {
    const keyDisplay = chalk.blue(`${prefix}• ${key.path}`);
    const fileDisplay = chalk.gray(` [${key.context?.file}]`);
    const valueDisplay = flags['include-values'] 
      ? chalk.gray(` (${key.context?.valueType}: ${JSON.stringify(key.context?.value)})`)
      : '';
    
    return `${keyDisplay}${fileDisplay}${valueDisplay}`;
  }

  private displayRecommendations(): void {
    const recommendations = [
      '  • Review empty keys to ensure they are intentional',
      '  • Consider using environment-specific values for empty keys',
      '  • Add empty keys to ignore list if they are expected',
      '  • Use --include-values to see actual empty values'
    ];

    console.log(chalk.yellow('\n💡 Recommendations:'));
    recommendations.forEach(rec => console.log(chalk.gray(rec)));
  }

  // Pure functions for data transformation
  private transformToEmptyKeyInfo(emptyKeys: any[]): EmptyKeyInfo[] {
    return emptyKeys.map(key => ({
      path: key.path,
      file: key.context?.file || '',
      value: key.context?.value,
      valueType: key.context?.valueType || '',
      message: key.message || ''
    }));
  }

  private transformToCsvRows(emptyKeys: any[], flags: any): string[][] {
    return emptyKeys.map(key => [
      `"${key.path}"`,
      `"${key.context?.file || ''}"`,
      `"${key.context?.valueType || ''}"`,
      `"${flags['include-values'] ? JSON.stringify(key.context?.value || '') : ''}"`,
    ]);
  }

  private groupByFile(emptyKeys: any[]): GroupedEmptyKeys {
    return emptyKeys.reduce((acc, key) => {
      const filePath = key.context?.file || 'unknown';
      return {
        ...acc,
        [filePath]: [...(acc[filePath] || []), key]
      };
    }, {} as GroupedEmptyKeys);
  }

  private getUniqueFiles(emptyKeys: any[]): string[] {
    return emptyKeys
      .map(key => key.context?.file)
      .filter(Boolean)
      .reduce((unique, file) => 
        unique.includes(file) ? unique : [...unique, file], 
        [] as string[]
      );
  }
}
