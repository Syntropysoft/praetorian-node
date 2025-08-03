import chalk from 'chalk';

export class CLILogger {
  private verbose: boolean = false;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (data && this.verbose) {
      console.log(chalk.blue(message), data);
    } else {
      console.log(chalk.blue(message));
    }
  }

  /**
   * Log success message
   */
  success(message: string): void {
    console.log(chalk.green('✅ ' + message));
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    console.log(chalk.yellow('⚠️  ' + message));
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    if (error) {
      console.error(chalk.red('❌ ' + message), error);
    } else {
      console.error(chalk.red('❌ ' + message));
    }
  }

  /**
   * Log debug message (only in verbose mode)
   */
  debug(message: string, data?: any): void {
    if (this.verbose) {
      if (data) {
        console.log(chalk.gray('🔍 ' + message), data);
      } else {
        console.log(chalk.gray('🔍 ' + message));
      }
    }
  }

  /**
   * Log banner
   */
  banner(): void {
    const banner = `
${chalk.blue('╔══════════════════════════════════════════════════════════════╗')}
${chalk.blue('║')}  ${chalk.yellow('🏛️  SyntropySoft Praetorian')}  ${chalk.gray('- Guardian of configuraciones')}  ${chalk.blue('║')}
${chalk.blue('║')}  ${chalk.gray('Universal validation framework for DevSecOps')}  ${chalk.blue('║')}
${chalk.blue('╚══════════════════════════════════════════════════════════════╝')}
`;
    console.log(banner);
  }

  /**
   * Log help information
   */
  help(): void {
    console.log(chalk.blue('\n📖 Praetorian CLI - Guardian of configurations\n'));
    console.log(chalk.yellow('Usage:'));
    console.log('  praetorian <command> [subcommand] [options]\n');
    console.log(chalk.yellow('Commands:'));
    console.log('  syntropylog  - SyntropyLog specific commands');
    console.log('  template     - Template generation system');
    console.log('  audit        - Run comprehensive audits');
    console.log('  check        - Health checks and diagnostics\n');
    console.log(chalk.yellow('SyntropyLog Commands:'));
    console.log('  praetorian syntropylog validate [config] [options]');
    console.log('  praetorian syntropylog validate --all');
    console.log('  praetorian syntropylog validate --env <environment>');
    console.log('  praetorian syntropylog audit');
  }

  /**
   * Log version information
   */
  version(): void {
    console.log(chalk.blue('🏛️  SyntropySoft Praetorian v0.1.0'));
    console.log(chalk.gray('Guardian of configurations and security'));
  }
} 