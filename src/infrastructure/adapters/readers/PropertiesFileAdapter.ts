import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class PropertiesFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.properties');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return this.parsePropertiesContent(content);
    } catch (error) {
      throw new Error(`Failed to parse Properties file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parsePropertiesContent(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#') || line.startsWith('!')) {
        continue;
      }
      
      // Handle multi-line values (lines ending with \)
      let fullLine = line;
      while (fullLine.endsWith('\\') && i + 1 < lines.length) {
        i++;
        const nextLine = lines[i].trim();
        fullLine = fullLine.slice(0, -1) + nextLine;
      }
      
      // Parse key-value pairs with multiple separators
      const equalIndex = fullLine.indexOf('=');
      const colonIndex = fullLine.indexOf(':');
      const spaceIndex = fullLine.indexOf(' ');
      
      let separatorIndex = -1;
      let separator = '';
      
      // Find the first separator (priority: =, :, space)
      if (equalIndex >= 0) {
        separatorIndex = equalIndex;
        separator = '=';
      } else if (colonIndex >= 0) {
        separatorIndex = colonIndex;
        separator = ':';
      } else if (spaceIndex >= 0) {
        separatorIndex = spaceIndex;
        separator = ' ';
      }
      
      if (separatorIndex > 0) {
        const key = fullLine.substring(0, separatorIndex).trim();
        const value = fullLine.substring(separatorIndex + separator.length).trim();
        
        if (key) {
          result[key] = this.parseValue(value);
        }
      } else if (fullLine.includes('=') || fullLine.includes(':') || fullLine.includes(' ')) {
        // Handle cases where there's a separator but no value (empty values)
        const key = fullLine.replace(/[=:\s].*$/, '').trim();
        if (key) {
          result[key] = '';
        }
      }
    }
    
    return result;
  }

  private parseValue(value: string): any {
    // Handle empty values
    if (value === '' || value === null || value === undefined) {
      return '';
    }
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Parse booleans
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === 'on') return true;
    if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === 'off') return false;
    
    // Parse numbers (but not empty strings)
    if (value !== '' && !isNaN(Number(value))) {
      return Number(value);
    }
    
    // Return as string
    return value;
  }

  getFormat(): string {
    return 'properties';
  }

  getSupportedExtensions(): string[] {
    return ['.properties'];
  }
} 