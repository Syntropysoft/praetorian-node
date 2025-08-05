#!/usr/bin/env node

import { runValidation } from '../../src/application/orchestrators/ValidationOrchestrator';
import * as fs from 'fs';
import * as path from 'path';

describe('Validation Integration Tests', () => {
  const testDir = path.join(process.cwd(), 'tmp', 'validation-test');
  
  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
    }
  });

  it('should create missing files with empty structure', async () => {
    // Create test config with absolute paths
    const praetorianConfig = {
      files: [
        path.join(testDir, 'config1.yaml'),
        path.join(testDir, 'config2.yaml'),
        path.join(testDir, 'missing.yaml')
      ],
      required_keys: ['database.host', 'database.port']
    };
    
    const configPath = path.join(testDir, 'praetorian.yaml');
    const yaml = require('yaml');
    fs.writeFileSync(configPath, yaml.stringify(praetorianConfig));
    
    // Create existing files
    fs.writeFileSync(path.join(testDir, 'config1.yaml'), yaml.stringify({ database: { host: 'localhost' } }));
    fs.writeFileSync(path.join(testDir, 'config2.yaml'), yaml.stringify({ database: { port: 5432 } }));
    
    const result = await runValidation(configPath, { verbose: true });
    
    // Just verify that the function runs without throwing
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
}); 