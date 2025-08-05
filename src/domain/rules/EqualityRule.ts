import { ValidationRule, ValidationResult, ConfigFile, ValidationError, ValidationWarning, ValidationContext } from '../../shared/types';

export class EqualityRule implements ValidationRule {
  id = 'equality-rule';
  name = 'equality';
  description = 'Validates that configuration files have consistent keys across environments';
  category: 'security' | 'compliance' | 'performance' | 'best-practice' = 'compliance';
  severity: 'error' | 'warning' | 'info' = 'error';
  enabled = true;
  config = {};

  async execute(files: ConfigFile[], context?: ValidationContext): Promise<ValidationResult> {
    const startTime = Date.now();
    const ignoreKeys = context?.ignoreKeys || [];
    const requiredKeys = context?.requiredKeys || [];

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

    // Pasada 1: Recolectar todas las claves de todos los archivos (excluyendo ignoradas)
    const masterKeyDictionary = this.collectAllKeys(files, ignoreKeys);
    
    // Pasada 2: Comparar diferencias - qué le falta a cada archivo
    const missingKeysReport = this.compareDifferences(files, masterKeyDictionary, ignoreKeys);
    
    // Pasada 3: Validar claves requeridas
    const requiredKeysReport = this.validateRequiredKeys(files, requiredKeys);
    
    // Combinar todos los errores
    const allErrors = [...missingKeysReport.errors, ...requiredKeysReport.errors];
    const allWarnings = [...missingKeysReport.warnings, ...requiredKeysReport.warnings];
    
    const success = allErrors.length === 0;

    return {
      success,
      errors: allErrors,
      warnings: allWarnings,
      metadata: {
        duration: Date.now() - startTime,
        rulesChecked: 1,
        rulesPassed: success ? 1 : 0,
        rulesFailed: success ? 0 : 1,
        filesCompared: files.length,
        totalKeys: masterKeyDictionary.size,
        ignoredKeys: ignoreKeys.length,
        requiredKeys: requiredKeys.length
      }
    };
  }

  // Pasada 1: Recolectar todas las claves de todos los archivos (excluyendo ignoradas)
  private collectAllKeys(files: ConfigFile[], ignoreKeys: string[]): Set<string> {
    return new Set(
      files.flatMap(file => 
        Array.from(this.extractAllKeys(file.content))
          .filter(key => !this.isKeyIgnored(key, ignoreKeys))
      )
    );
  }

  // Pasada 2: Comparar diferencias - qué le falta a cada archivo
  private compareDifferences(
    files: ConfigFile[], 
    masterKeyDictionary: Set<string>,
    ignoreKeys: string[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors = files.flatMap(file => {
      const fileKeys = this.extractAllKeys(file.content);
      
      // Encontrar claves que faltan en este archivo (excluyendo ignoradas)
      const missingKeys = Array.from(masterKeyDictionary).filter(
        masterKey => !fileKeys.has(masterKey) && !this.isKeyIgnored(masterKey, ignoreKeys)
      );
      
      // Crear errores por cada clave faltante
      return missingKeys.map(missingKey => ({
        code: 'MISSING_KEY',
        message: `Key '${missingKey}' is missing in ${file.path}`,
        severity: 'error' as const,
        path: missingKey,
        context: { 
          file: file.path, 
          missingKey,
          availableKeys: Array.from(fileKeys)
        }
      }));
    });

    return { errors, warnings: [] };
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

  // Verificar si una clave debe ser ignorada
  private isKeyIgnored(key: string, ignoreKeys: string[]): boolean {
    return ignoreKeys.some(ignoreKey => {
      // Soporte para patrones exactos y wildcards
      if (ignoreKey.includes('*')) {
        const pattern = ignoreKey.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(key);
      }
      return key === ignoreKey || key.startsWith(ignoreKey + '.');
    });
  }

  // Validar claves requeridas
  private validateRequiredKeys(
    files: ConfigFile[], 
    requiredKeys: string[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors = requiredKeys.flatMap(requiredKey =>
      files.flatMap(file => {
        const fileKeys = this.extractAllKeys(file.content);
        
        return !fileKeys.has(requiredKey) ? [{
          code: 'REQUIRED_KEY_MISSING',
          message: `Required key '${requiredKey}' is missing in ${file.path}`,
          severity: 'error' as const,
          path: requiredKey,
          context: { 
            file: file.path, 
            requiredKey,
            availableKeys: Array.from(fileKeys)
          }
        }] : [];
      })
    );

    return { errors, warnings: [] };
  }
} 