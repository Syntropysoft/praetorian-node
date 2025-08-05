#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const tmpDir = path.join(process.cwd(), 'tmp');

function cleanTmp() {
  if (fs.existsSync(tmpDir)) {
    console.log('🧹 Cleaning tmp directory...');
    
    const items = fs.readdirSync(tmpDir);
    items.forEach(item => {
      const itemPath = path.join(tmpDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`  📁 Removed directory: ${item}`);
      } else {
        fs.unlinkSync(itemPath);
        console.log(`  📄 Removed file: ${item}`);
      }
    });
    
    console.log('✅ Tmp directory cleaned successfully!');
  } else {
    console.log('ℹ️  Tmp directory does not exist, nothing to clean.');
  }
}

// Run if called directly
if (require.main === module) {
  cleanTmp();
}

module.exports = { cleanTmp }; 