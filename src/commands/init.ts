import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { ConfigParser } from '../core/ConfigParser';

export default class Init extends Command {
  static override description = 'Initialize a new Praetorian configuration file';

  static override examples = [
    '$ praetorian init',
    '$ praetorian init --config my-config.yaml',
  ];

  static override flags = {
    config: Flags.string({
      char: 'c',
      description: 'Path for the configuration file',
      default: 'praetorian.yaml',
    }),
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    const { flags } = await this.parse(Init);

    try {
      const configParser = new ConfigParser(flags.config);

      if (configParser.exists()) {
        this.log(chalk.yellow(`⚠️  Configuration file already exists: ${flags.config}`));
        this.log(chalk.gray('Use --config to specify a different path'));
        return;
      }

      // Create default configuration
      configParser.createDefault();

      this.log(chalk.green(`✅ Configuration file created: ${flags.config}`));
      this.log(chalk.blue('\n📋 Next steps:'));
      this.log(chalk.gray('1. Edit the configuration file to match your project'));
      this.log(chalk.gray('2. Add your configuration files to the "files" section'));
      this.log(chalk.gray('3. Run: praetorian validate'));
      
      this.log(chalk.blue('\n📖 Example usage:'));
      this.log(chalk.gray('$ praetorian validate'));
      this.log(chalk.gray('$ praetorian validate --env dev'));
      this.log(chalk.gray('$ praetorian validate config1.yaml config2.yaml'));

    } catch (error) {
      this.error(error instanceof Error ? error.message : 'Unknown error');
      this.exit(1);
    }
  }
} 