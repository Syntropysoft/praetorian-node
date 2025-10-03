#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapeo de rutas viejas a nuevas
const pathMappings = {
  // Domain
  '../src/domain/rules/': '../../src/domain/rules/',
  '../src/shared/types': '../../src/shared/types',
  
  // Application
  '../src/application/orchestrators/': '../../src/application/orchestrators/',
  '../src/application/services/': '../../src/application/services/',
  '../src/application/validators/': '../../src/application/validators/',
  
  // Infrastructure
  '../src/infrastructure/adapters/': '../../src/infrastructure/adapters/',
  '../src/infrastructure/plugins/': '../../src/infrastructure/plugins/',
  '../src/infrastructure/parsers/': '../../src/infrastructure/parsers/',
  
  // Shared
  '../src/shared/utils/': '../../src/shared/utils/',
  '../src/shared/types': '../../src/shared/types',
  
  // Presentation
  '../src/presentation/': '../../src/presentation/',
};

// Función para procesar un archivo
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Aplicar mapeos
  for (const [oldPath, newPath] of Object.entries(pathMappings)) {
    if (content.includes(oldPath)) {
      content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
      changed = true;
    }
  }
  
  // Escribir archivo si cambió
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
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
console.log('Fixing test imports...');
processDirectory(testsDir);
console.log('Done!');
