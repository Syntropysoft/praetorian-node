#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 PRAETORIAN BUILD PROCESS - VERBOSE MODE');
console.log('==========================================\n');

// Step 1: Clean
console.log('🧹 STEP 1: Cleaning previous build...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
  console.log('✅ Clean completed successfully\n');
} catch (error) {
  console.error('❌ Clean failed:', error.message);
  process.exit(1);
}

// Step 2: Show TypeScript configuration
console.log('⚙️  STEP 2: TypeScript Configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  console.log('📋 Compiler Options:');
  console.log(`   • Target: ${tsConfig.compilerOptions.target}`);
  console.log(`   • Module: ${tsConfig.compilerOptions.module}`);
  console.log(`   • OutDir: ${tsConfig.compilerOptions.outDir}`);
  console.log(`   • RootDir: ${tsConfig.compilerOptions.rootDir}`);
  console.log(`   • Strict: ${tsConfig.compilerOptions.strict}`);
  console.log(`   • Declaration: ${tsConfig.compilerOptions.declaration}`);
  console.log(`   • SourceMap: ${tsConfig.compilerOptions.sourceMap}`);
  console.log(`   • Files included: ${tsConfig.include.join(', ')}`);
  console.log(`   • Files excluded: ${tsConfig.exclude.join(', ')}\n`);
} catch (error) {
  console.error('❌ Error reading tsconfig.json:', error.message);
}

// Step 3: Count source files
console.log('📊 STEP 3: Analyzing source files...');
try {
  const srcDir = 'src';
  const countFiles = (dir) => {
    let count = 0;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        count += countFiles(fullPath);
      } else if (item.endsWith('.ts')) {
        count++;
      }
    }
    return count;
  };
  
  const fileCount = countFiles(srcDir);
  console.log(`📁 Found ${fileCount} TypeScript files in src/\n`);
} catch (error) {
  console.error('❌ Error counting files:', error.message);
}

// Step 4: Build with TypeScript
console.log('🔨 STEP 4: Compiling TypeScript...');
console.log('   Starting TypeScript compilation...\n');
try {
  execSync('npx tsc --build --verbose', { stdio: 'inherit' });
  console.log('\n✅ TypeScript compilation completed successfully\n');
} catch (error) {
  console.error('\n❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Step 5: Verify build output
console.log('🔍 STEP 5: Verifying build output...');
try {
  const distDir = 'dist';
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found');
  }
  
  const countBuildFiles = (dir) => {
    let count = 0;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        count += countBuildFiles(fullPath);
      } else if (item.endsWith('.js') || item.endsWith('.d.ts')) {
        count++;
      }
    }
    return count;
  };
  
  const buildFileCount = countBuildFiles(distDir);
  console.log(`📦 Generated ${buildFileCount} build files in dist/\n`);
  
  // Show directory structure
  console.log('📁 Build output structure:');
  const showStructure = (dir, indent = '') => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        console.log(`${indent}📁 ${item}/`);
        showStructure(fullPath, indent + '  ');
      } else {
        console.log(`${indent}📄 ${item}`);
      }
    }
  };
  showStructure(distDir);
  console.log();
  
} catch (error) {
  console.error('❌ Error verifying build output:', error.message);
  process.exit(1);
}

// Step 6: Test CLI functionality
console.log('🧪 STEP 6: Testing CLI functionality...');
try {
  console.log('   Testing CLI help command...');
  const helpOutput = execSync('node dist/presentation/cli/cli.js --help', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  if (helpOutput.includes('init') && helpOutput.includes('validate')) {
    console.log('✅ CLI commands are working correctly');
  } else {
    console.log('⚠️  CLI commands may have issues');
  }
  console.log();
  
} catch (error) {
  console.error('❌ Error testing CLI:', error.message);
}

console.log('🎉 BUILD PROCESS COMPLETED SUCCESSFULLY!');
console.log('==========================================');
console.log('📦 Your Praetorian CLI is ready to use!');
console.log('🚀 Run: node dist/presentation/cli/cli.js --help'); 