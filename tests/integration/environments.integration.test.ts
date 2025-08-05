#!/usr/bin/env node

import { runValidation } from '../../src/application/orchestrators/ValidationOrchestrator';
import * as fs from 'fs';
import * as path from 'path';

describe('Environment Integration Tests', () => {
  const testDir = path.join(process.cwd(), 'tmp', 'environments-test');
  
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

  it('should handle environment not found', async () => {
    // Create test environment config
    const envConfig = {
      dev: 'config-dev.yaml',
      prod: 'config-prod.yaml'
    };
    
    const envPath = path.join(testDir, 'environments.yaml');
    fs.writeFileSync(envPath, JSON.stringify(envConfig));
    
    // Create existing config files
    fs.writeFileSync(path.join(testDir, 'config-dev.yaml'), JSON.stringify({ database: { host: 'localhost' } }));
    fs.writeFileSync(path.join(testDir, 'config-prod.yaml'), JSON.stringify({ database: { host: 'prod-server' } }));
    
    // Test with non-existent environment
    await expect(
      runValidation('test-config.yaml', { env: 'staging' })
    ).rejects.toThrow();
  });
}); 