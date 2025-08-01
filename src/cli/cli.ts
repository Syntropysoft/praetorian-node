#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { runValidation } from './commands/validate';
import { runAudit } from './commands/audit';
import { runTemplate } from './commands/template';
import { runCheck } from './commands/check';

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.blue('╔══════════════════════════════════════════════════════════════╗')}
${chalk.blue('║')}  ${chalk.yellow('🏛️  SyntropySoft Praetorian')}  ${chalk.gray('- Guardian of configurations')}  ${chalk.blue('║')}
${chalk.blue('║')}  ${chalk.gray('Universal validation framework for DevSecOps')}  ${chalk.blue('║')}
${chalk.blue('╚══════════════════════════════════════════════════════════════╝')}
`;

console.log(banner);

program
  .name('praetorian')
  .description('Guardian of configurations and security')
  .version('0.1.0');

// SyntropyLog specific commands
program
  .command('syntropylog')
  .description('SyntropyLog specific commands')
  .addCommand(
    new Command('validate')
      .description('Validate SyntropyLog configuration')
      .argument('<config>', 'Configuration file path')
      .option('-v, --verbose', 'Verbose output')
      .option('--strict', 'Strict validation mode')
      .action(runValidation)
  )
  .addCommand(
    new Command('audit')
      .description('Audit SyntropyLog configuration and code')
      .option('-s, --security', 'Security audit')
      .option('-c, --compliance', 'Compliance audit')
      .option('-p, --performance', 'Performance audit')
      .option('-v, --verbose', 'Verbose output')
      .action(runAudit)
  )
  .addCommand(
    new Command('check')
      .description('Check specific SyntropyLog components')
      .option('--brokers', 'Check broker configuration')
      .option('--http', 'Check HTTP adapters')
      .option('--redis', 'Check Redis configuration')
      .option('--logging', 'Check logging configuration')
      .action(runCheck)
  );

// Template system
program
  .command('template')
  .description('Template generation system')
  .addCommand(
    new Command('create')
      .description('Create a new project from template')
      .argument('<recipe>', 'Template recipe name')
      .option('-o, --output <dir>', 'Output directory', './')
      .option('--name <name>', 'Project name')
      .option('--force', 'Overwrite existing files')
      .action(runTemplate)
  )
  .addCommand(
    new Command('list')
      .description('List available templates')
      .action(() => {
        console.log(chalk.blue('\n📋 Available Templates:\n'));
        console.log(chalk.yellow('SyntropyLog Templates:'));
        console.log('  syntropylog-basic     - Basic SyntropyLog setup');
        console.log('  syntropylog-nats      - SyntropyLog with NATS broker');
        console.log('  syntropylog-redis     - SyntropyLog with Redis');
        console.log('  syntropylog-http      - SyntropyLog with HTTP adapters');
        console.log('  syntropylog-full-stack - Complete SyntropyLog setup');
        console.log('\n' + chalk.yellow('Framework Templates:'));
        console.log('  express-security      - Express.js with security');
        console.log('  koa-performance       - Koa.js optimized');
        console.log('  fastify-production    - Fastify for production');
      })
  )
  .addCommand(
    new Command('info')
      .description('Show template information')
      .argument('<recipe>', 'Template recipe name')
      .action((recipe) => {
        console.log(chalk.blue(`\n📖 Template Info: ${recipe}\n`));
        // TODO: Implement template info
        console.log('Template information will be displayed here...');
      })
  );

// Universal validation (future)
program
  .command('validate')
  .description('Universal validation (future)')
  .argument('<framework>', 'Framework name')
  .argument('<config>', 'Configuration file path')
  .action((framework, config) => {
    console.log(chalk.yellow(`\n🔮 Universal validation for ${framework} coming soon...`));
    console.log(chalk.gray(`Config: ${config}`));
  });

// Global options
program
  .option('-v, --verbose', 'Verbose output')
  .option('--debug', 'Debug mode')
  .option('--json', 'Output in JSON format');

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (err) {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red('\n❌ Error:'), err.message);
  process.exit(1);
}

// Export for programmatic use
export function runCLI(args: string[] = process.argv.slice(2)) {
  program.parse(args);
} 