import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class EnvFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.env') || filePath.startsWith('env.');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    const content = await this.readFileContent(filePath);
    return this.parseEnvContent(content);
  }

  private parseEnvContent(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      // Handle key=value format
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        
        // Remove quotes if present
        const cleanValue = this.removeQuotes(value);
        
        if (key) {
          result[key] = cleanValue;
        }
      }
    }
    
    return result;
  }

  private removeQuotes(value: string): string {
    // Remove single or double quotes from beginning and end
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  }

  getFormat(): string {
    return 'env';
  }

  getSupportedExtensions(): string[] {
    return ['.env'];
  }
} 