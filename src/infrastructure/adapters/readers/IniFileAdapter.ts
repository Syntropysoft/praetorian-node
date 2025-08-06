import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class IniFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.ini') || filePath.endsWith('.cfg') || filePath.endsWith('.conf');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return this.parseIniContent(content);
    } catch (error) {
      throw new Error(`Failed to parse INI file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseIniContent(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');
    let currentSection: string | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith(';') || line.startsWith('#')) {
        continue;
      }
      
      // Handle section headers [section]
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1);
        if (!result[currentSection]) {
          result[currentSection] = {};
        }
        continue;
      }
      
      // Handle key-value pairs
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        if (currentSection) {
          result[currentSection][key] = this.parseValue(value);
        } else {
          result[key] = this.parseValue(value);
        }
      }
    }
    
    return result;
  }

  private parseValue(value: string): any {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Parse booleans
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === 'on') return true;
    if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === 'off') return false;
    
    // Parse numbers
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Return as string
    return value;
  }

  getFormat(): string {
    return 'ini';
  }

  getSupportedExtensions(): string[] {
    return ['.ini', '.cfg', '.conf'];
  }
} 