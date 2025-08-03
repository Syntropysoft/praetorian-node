import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

interface TemplateOptions {
  output?: string;
  name?: string;
  force?: boolean;
}

export async function runTemplate(recipe: string, options: TemplateOptions = {}) {
  console.log(chalk.blue('\n🏗️  Creating project from template...\n'));

  try {
    // Validate recipe
    const availableRecipes = getAvailableRecipes();
    if (!availableRecipes.includes(recipe)) {
      console.error(chalk.red(`❌ Unknown recipe: ${recipe}`));
      console.log(chalk.yellow('\nAvailable recipes:'));
      availableRecipes.forEach(r => console.log(chalk.gray(`  • ${r}`)));
      process.exit(1);
    }

    // Get project details
    const projectDetails = await getProjectDetails(recipe, options);

    // Create project
    await createProject(recipe, projectDetails);

    console.log(chalk.green('\n✅ Project created successfully!'));
    console.log(chalk.blue(`📁 Location: ${projectDetails.outputDir}`));
    
    // Show next steps
    showNextSteps(recipe, projectDetails);

  } catch (error) {
    console.error(chalk.red('\n❌ Template creation failed:'));
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function getAvailableRecipes(): string[] {
  return [
    'syntropylog-basic',
    'syntropylog-nats',
    'syntropylog-redis',
    'syntropylog-http',
    'syntropylog-full-stack',
    'express-security',
    'koa-performance',
    'fastify-production'
  ];
}

async function getProjectDetails(recipe: string, options: TemplateOptions) {
  const questions = [];

  if (!options.name) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: getDefaultProjectName(recipe),
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    });
  }

  if (!options.output) {
    questions.push({
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      default: './',
      validate: (input: string) => {
        const fullPath = path.resolve(input);
        if (fs.existsSync(fullPath) && !options.force) {
          return 'Directory already exists. Use --force to overwrite.';
        }
        return true;
      }
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    projectName: options.name || answers.projectName,
    outputDir: path.resolve(options.output || answers.outputDir),
    force: options.force || false
  };
}

function getDefaultProjectName(recipe: string): string {
  const nameMap: Record<string, string> = {
    'syntropylog-basic': 'my-syntropylog-app',
    'syntropylog-nats': 'syntropylog-nats-app',
    'syntropylog-redis': 'syntropylog-redis-app',
    'syntropylog-http': 'syntropylog-http-app',
    'syntropylog-full-stack': 'syntropylog-full-stack',
    'express-security': 'express-security-app',
    'koa-performance': 'koa-performance-app',
    'fastify-production': 'fastify-production-app'
  };
  
  return nameMap[recipe] || 'my-project';
}

async function createProject(recipe: string, details: any) {
  const projectDir = path.join(details.outputDir, details.projectName);
  
  // Create project directory
  if (fs.existsSync(projectDir) && !details.force) {
    throw new Error(`Project directory already exists: ${projectDir}`);
  }

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  console.log(chalk.gray(`Creating project: ${details.projectName}`));
  console.log(chalk.gray(`Location: ${projectDir}`));

  // Generate template files
  const template = getTemplate(recipe, details);
  
  for (const [filePath, content] of Object.entries(template)) {
    const fullPath = path.join(projectDir, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(chalk.gray(`  Created: ${filePath}`));
  }
}

function getTemplate(recipe: string, details: any): Record<string, string> {
  const templates: Record<string, Record<string, string>> = {
    'syntropylog-basic': {
      'package.json': JSON.stringify({
        name: details.projectName,
        version: '1.0.0',
        description: 'SyntropyLog application',
        main: 'src/index.ts',
        scripts: {
          start: 'tsx src/index.ts',
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          test: 'vitest'
        },
        dependencies: {
          syntropylog: '^0.7.4'
        },
        devDependencies: {
          typescript: '^5.0.0',
          tsx: '^4.0.0',
          vitest: '^1.0.0'
        }
      }, null, 2),
      'src/index.ts': `import { SyntropyLog } from 'syntropylog';

// Initialize SyntropyLog
const logger = new SyntropyLog({
  appName: '${details.projectName}',
  environment: 'development',
  logLevel: 'info'
});

// Your application code here
logger.info('Application started');

console.log('Hello from ${details.projectName}!');
`,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'node',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          outDir: './dist'
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      }, null, 2),
      'README.md': `# ${details.projectName}

A SyntropyLog application.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm start\` - Start the application
- \`npm run dev\` - Start in development mode with hot reload
- \`npm run build\` - Build the application
- \`npm test\` - Run tests
`
    }
  };

  return templates[recipe] || {
    'README.md': `# ${details.projectName}

Template for ${recipe} is not implemented yet.

## Getting Started

\`\`\`bash
npm install
\`\`\`
`
  };
}

function showNextSteps(recipe: string, details: any) {
  console.log(chalk.blue('\n🚀 Next Steps:\n'));
  console.log(chalk.gray(`cd ${details.projectName}`));
  console.log(chalk.gray('npm install'));
  console.log(chalk.gray('npm run dev'));
  
  if (recipe.startsWith('syntropylog-')) {
    console.log(chalk.blue('\n📚 Learn more about SyntropyLog:'));
    console.log(chalk.gray('https://github.com/syntropysoft/syntropylog'));
  }
} 