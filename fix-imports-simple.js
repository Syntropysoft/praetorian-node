#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para procesar un archivo
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Reemplazar todas las rutas relativas con rutas absolutas desde src/
  const relativePathRegex = /from ['"](\.\.\/)+src\//g;
  const matches = content.match(relativePathRegex);
  
  if (matches) {
    // Calcular la profundidad del archivo de test
    const relativePath = path.relative(path.join(__dirname, 'tests'), filePath);
    const depth = relativePath.split(path.sep).length - 1;
    
    // Crear la ruta correcta
    const correctPath = '../'.repeat(depth) + 'src/';
    
    // Reemplazar todas las ocurrencias
    content = content.replace(relativePathRegex, `from '${correctPath}`);
    changed = true;
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
console.log('Fixing test imports with correct relative paths...');
processDirectory(testsDir);
console.log('Done!');
