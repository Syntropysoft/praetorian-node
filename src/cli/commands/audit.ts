import chalk from 'chalk';
import { AuditEngine } from '../../core/AuditEngine';

interface AuditOptions {
  security?: boolean;
  compliance?: boolean;
  performance?: boolean;
  verbose?: boolean;
}

export async function runAudit(options: AuditOptions = {}) {
  console.log(chalk.blue('\n🔍 Running SyntropyLog Audit...\n'));

  try {
    // Determine audit types
    const auditTypes = [];
    if (options.security) auditTypes.push('security');
    if (options.compliance) auditTypes.push('compliance');
    if (options.performance) auditTypes.push('performance');
    
    // If no specific type, run all
    if (auditTypes.length === 0) {
      auditTypes.push('security', 'compliance', 'performance');
    }

    console.log(chalk.gray(`Audit types: ${auditTypes.join(', ')}`));

    // Create audit engine
    const auditEngine = new AuditEngine({
      plugins: ['syntropylog'],
      types: auditTypes
    });

    // Run audit
    const result = await auditEngine.audit({
      config: {},
      environment: 'development',
      project: 'syntropylog-project',
      timestamp: new Date(),
      metadata: {}
    });

    // Display results
    displayAuditResults(result, options);

  } catch (error) {
    console.error(chalk.red('\n❌ Audit failed:'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function displayAuditResults(result: any, options: AuditOptions) {
  console.log(chalk.blue('📊 Audit Results:\n'));

  // Score and Grade
  const score = result.summary?.score || 0;
  const grade = result.summary?.grade || 'F';
  
  console.log(chalk.blue('🏆 Overall Score:'));
  console.log(`  • Score: ${score}/100`);
  console.log(`  • Grade: ${getGradeColor(grade)}${grade}${chalk.reset()}`);
  console.log('');

  // Issues breakdown
  console.log(chalk.blue('📈 Issues Breakdown:'));
  console.log(`  • Critical Issues: ${chalk.red(result.summary?.criticalIssues || 0)}`);
  console.log(`  • Security Issues: ${chalk.yellow(result.summary?.securityIssues || 0)}`);
  console.log(`  • Compliance Issues: ${chalk.blue(result.summary?.complianceIssues || 0)}`);
  console.log('');

  // Detailed results
  if (result.results && result.results.length > 0) {
    console.log(chalk.blue('🔍 Detailed Results:\n'));
    
    result.results.forEach((validationResult: any, index: number) => {
      const pluginName = validationResult.metadata?.plugin || `Check ${index + 1}`;
      
      if (validationResult.success) {
        console.log(chalk.green(`✅ ${pluginName}`));
      } else {
        console.log(chalk.red(`❌ ${pluginName}`));
        
        validationResult.errors.forEach((error: any) => {
          console.log(chalk.red(`    • ${error.message}`));
          if (error.path) {
            console.log(chalk.gray(`      Path: ${error.path}`));
          }
        });
      }
      
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.forEach((warning: any) => {
          console.log(chalk.yellow(`    ⚠️  ${warning.message}`));
        });
      }
      
      console.log('');
    });
  }

  // Recommendations
  if (result.summary?.recommendations && result.summary.recommendations.length > 0) {
    console.log(chalk.blue('💡 Recommendations:\n'));
    result.summary.recommendations.forEach((rec: string, index: number) => {
      console.log(chalk.cyan(`  ${index + 1}. ${rec}`));
    });
    console.log('');
  }

  // Summary
  console.log(chalk.blue('📊 Summary:'));
  console.log(`  • Duration: ${result.duration || 0}ms`);
  console.log(`  • Total Checks: ${result.totalChecks || 0}`);
  console.log(`  • Passed: ${result.passedChecks || 0}`);
  console.log(`  • Failed: ${result.failedChecks || 0}`);
  console.log(`  • Warnings: ${result.warnings || 0}`);

  // Exit code based on results
  if (result.summary?.criticalIssues > 0 || result.summary?.securityIssues > 0) {
    console.log(chalk.red('\n⚠️  Critical or security issues found. Please review and fix.'));
    process.exit(1);
  }
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return chalk.green;
    case 'B': return chalk.cyan;
    case 'C': return chalk.yellow;
    case 'D': return chalk.magenta;
    case 'F': return chalk.red;
    default: return chalk.white;
  }
} 