import { ValidationRule, ValidationResult, ConfigFile, ValidationError, ValidationWarning } from '../../types';

export class EqualityRule implements ValidationRule {
  name = 'equality';

  async execute(files: ConfigFile[]): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (files.length < 2) {
      return {
        success: true,
        errors: [],
        warnings: [{
          code: 'INSUFFICIENT_FILES',
          message: 'Need at least 2 files to compare',
          severity: 'warning'
        }],
        metadata: {
          duration: Date.now() - startTime,
          rulesChecked: 1,
          rulesPassed: 1,
          rulesFailed: 0,
          filesCompared: files.length
        }
      };
    }

    // Extract all keys from all files
    const fileKeys = new Map<string, Set<string>>();
    
    for (const file of files) {
      const keys = this.extractAllKeys(file.content);
      fileKeys.set(file.path, keys);
    }

    // Compare keys between all files
    const allKeys = new Set<string>();
    for (const keys of Array.from(fileKeys.values())) {
      keys.forEach(key => allKeys.add(key));
    }

    // Check for missing keys in each file
    for (const [filePath, keys] of Array.from(fileKeys.entries())) {
      for (const expectedKey of Array.from(allKeys)) {
        if (!keys.has(expectedKey)) {
          errors.push({
            code: 'MISSING_KEY',
            message: `Key '${expectedKey}' is missing in ${filePath}`,
            severity: 'error',
            path: expectedKey,
            context: { file: filePath, missingKey: expectedKey }
          });
        }
      }
    }

    // Check for extra keys (warnings)
    for (const [filePath, keys] of Array.from(fileKeys.entries())) {
      for (const extraKey of Array.from(keys)) {
        const isExtra = Array.from(fileKeys.values()).every(
          otherKeys => otherKeys.has(extraKey) || otherKeys === keys
        );
        
        if (!isExtra) {
          warnings.push({
            code: 'EXTRA_KEY',
            message: `Key '${extraKey}' is only present in ${filePath}`,
            severity: 'warning',
            path: extraKey,
            context: { file: filePath, extraKey }
          });
        }
      }
    }

    const success = errors.length === 0;

    return {
      success,
      errors,
      warnings,
      metadata: {
        duration: Date.now() - startTime,
        rulesChecked: 1,
        rulesPassed: success ? 1 : 0,
        rulesFailed: success ? 0 : 1,
        filesCompared: files.length,
        totalKeys: allKeys.size
      }
    };
  }

  private extractAllKeys(obj: any, prefix = ''): Set<string> {
    const keys = new Set<string>();
    
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.add(fullKey);
        
        // Recursively extract nested keys
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const nestedKeys = this.extractAllKeys(value, fullKey);
          nestedKeys.forEach(nestedKey => keys.add(nestedKey));
        }
      }
    }
    
    return keys;
  }
} 