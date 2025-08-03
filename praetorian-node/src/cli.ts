#!/usr/bin/env node

import { run } from '@oclif/core';
import chalk from 'chalk';

// ASCII Art Banner - Professional Praetorian Style with security colors
const banner = `
${chalk.blueBright('  ____                 _             _               ____ _     ___ ')}
${chalk.blueBright(' |  _ \\ _ __ __ _  ___| |_ ___  _ __(_) __ _ _ __    / ___| |   |_ _|')}
${chalk.blueBright(' | |_) | \'__/ _` |/ _ \\ __/ _ \\| \'__| |/ _` | \'_\\  | |   | |    | | ')}
${chalk.blueBright(' |  __/| | | (_| |  __/ || (_) | |  | | (_| | | | | | |___| |___ | | ')}
${chalk.blueBright(' |_|   |_|  \\__,_|\\___|\\__\\___/|_|  |_|\\__,_|_| |_|  \\____|_____|___|')}
${chalk.gray('                                                                                                                                        ')}

${chalk.white.bold('🛡️  Guardian of Configurations & Security')} ${chalk.gray('|')} ${chalk.blue('Universal Validation Framework for DevSecOps')}
`;

// Show banner only for help and version commands
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('--version') || args.includes('-V')) {
  console.log(banner);
}

run()
  .then(() => {
    // Command completed successfully
  })
  .catch((error) => {
    // Handle errors
    console.error('Error:', error.message);
    process.exit(1);
  }); 