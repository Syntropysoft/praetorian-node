import chalk from 'chalk';

interface CheckOptions {
  brokers?: boolean;
  http?: boolean;
  redis?: boolean;
  logging?: boolean;
}

export async function runCheck(options: CheckOptions = {}) {
  console.log(chalk.blue('\n🔍 Checking SyntropyLog Components...\n'));

  try {
    const checks = [];
    if (options.brokers) checks.push('brokers');
    if (options.http) checks.push('http');
    if (options.redis) checks.push('redis');
    if (options.logging) checks.push('logging');
    
    // If no specific component, check all
    if (checks.length === 0) {
      checks.push('brokers', 'http', 'redis', 'logging');
    }

    console.log(chalk.gray(`Checking components: ${checks.join(', ')}`));

    const results = [];

    // Check brokers
    if (checks.includes('brokers')) {
      results.push(await checkBrokers());
    }

    // Check HTTP adapters
    if (checks.includes('http')) {
      results.push(await checkHttp());
    }

    // Check Redis
    if (checks.includes('redis')) {
      results.push(await checkRedis());
    }

    // Check logging
    if (checks.includes('logging')) {
      results.push(await checkLogging());
    }

    // Display results
    displayCheckResults(results);

  } catch (error) {
    console.error(chalk.red('\n❌ Check failed:'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function checkBrokers() {
  console.log(chalk.blue('🔌 Checking Broker Configuration...'));
  
  // TODO: Implement actual broker checks
  // For now, return mock results
  return {
    component: 'brokers',
    status: 'warning',
    message: 'Broker configuration check not implemented yet',
    details: [
      'NATS broker configuration',
      'Message broker adapters',
      'Connection settings'
    ]
  };
}

async function checkHttp() {
  console.log(chalk.blue('🌐 Checking HTTP Adapters...'));
  
  return {
    component: 'http',
    status: 'warning',
    message: 'HTTP adapter check not implemented yet',
    details: [
      'HTTP client configuration',
      'Request/response interceptors',
      'Error handling'
    ]
  };
}

async function checkRedis() {
  console.log(chalk.blue('🔴 Checking Redis Configuration...'));
  
  return {
    component: 'redis',
    status: 'warning',
    message: 'Redis configuration check not implemented yet',
    details: [
      'Redis connection settings',
      'Beacon configuration',
      'Connection pooling'
    ]
  };
}

async function checkLogging() {
  console.log(chalk.blue('📝 Checking Logging Configuration...'));
  
  return {
    component: 'logging',
    status: 'warning',
    message: 'Logging configuration check not implemented yet',
    details: [
      'Log levels',
      'Transport configuration',
      'Formatter settings'
    ]
  };
}

function displayCheckResults(results: any[]) {
  console.log(chalk.blue('\n📊 Check Results:\n'));

  let allPassed = true;

  results.forEach(result => {
    const statusIcon = getStatusIcon(result.status);
    const statusColor = getStatusColor(result.status);
    
    console.log(`${statusIcon} ${statusColor(result.component.toUpperCase())}`);
    console.log(`   ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      console.log(chalk.gray('   Details:'));
      result.details.forEach((detail: string) => {
        console.log(chalk.gray(`     • ${detail}`));
      });
    }
    
    if (result.status === 'error') {
      allPassed = false;
    }
    
    console.log('');
  });

  // Summary
  console.log(chalk.blue('📈 Summary:'));
  const passed = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`  • Passed: ${chalk.green(passed)}`);
  console.log(`  • Warnings: ${chalk.yellow(warnings)}`);
  console.log(`  • Errors: ${chalk.red(errors)}`);

  if (!allPassed) {
    console.log(chalk.yellow('\n⚠️  Some checks have warnings or errors.'));
  } else {
    console.log(chalk.green('\n✅ All checks passed!'));
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'success': return '✅';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    default: return '❓';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'success': return chalk.green;
    case 'warning': return chalk.yellow;
    case 'error': return chalk.red;
    default: return chalk.gray;
  }
} 