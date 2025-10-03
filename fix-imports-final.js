#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapeo específico de rutas correctas para cada archivo
const correctPaths = {
  // Application layer
  'tests/application/orchestrators/': '../../../src/',
  'tests/application/services/': '../../../src/',
  'tests/application/validators/': '../../../src/',
  
  // Domain layer
  'tests/domain/rules/': '../../../src/',
  
  // Infrastructure layer
  'tests/infrastructure/adapters/': '../../../src/',
  'tests/infrastructure/adapters/readers/': '../../../../src/',
  'tests/infrastructure/plugins/': '../../../src/',
  
  // Presentation layer
  'tests/presentation/cli/': '../../../src/',
  
  // Shared layer
  'tests/shared/utils/': '../../../src/',
  
  // Integration layer
  'tests/integration/': '../src/',
};

// Función para encontrar la ruta correcta para un archivo
function findCorrectPath(filePath) {
  const relativePath = path.relative(path.join(__dirname, 'tests'), filePath);
  
  for (const [prefix, correctPath] of Object.entries(correctPaths)) {
    if (relativePath.startsWith(prefix)) {
      return correctPath;
    }
  }
  
  // Fallback: calcular basado en profundidad
  const depth = relativePath.split(path.sep).length - 1;
  return '../'.repeat(depth) + 'src/';
}

// Función para procesar un archivo
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Calcular la ruta correcta para este archivo
  const correctPath = findCorrectPath(filePath);
  
  // Reemplazar todas las rutas que empiecen con '../' y terminen con 'src/'
  const relativePathRegex = /from ['"](\.\.\/)+src\//g;
  const matches = content.match(relativePathRegex);
  
  if (matches) {
    // Reemplazar todas las ocurrencias
    content = content.replace(relativePathRegex, `from '${correctPath}`);
    changed = true;
  }
  
  // Escribir archivo si cambió
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath} (using path: ${correctPath})`);
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.test.ts') || item.endsWith('.jest.test.ts')) {
      processFile(fullPath);
    }
  }
}

// Procesar directorio de tests
const testsDir = path.join(__dirname, 'tests');
console.log('Fixing test imports with correct relative paths...');
processDirectory(testsDir);
console.log('Done!');
