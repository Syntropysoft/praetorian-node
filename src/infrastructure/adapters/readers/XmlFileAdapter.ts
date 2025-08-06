import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class XmlFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.xml');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return this.parseXmlContent(content);
    } catch (error) {
      throw new Error(`Failed to parse XML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseXmlContent(content: string): Record<string, any> {
    // Simple XML parser for configuration files
    // This is a basic implementation - for complex XML, consider using a library like xml2js
    
    const result: Record<string, any> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines, comments, and XML declarations
      if (!trimmed || 
          trimmed.startsWith('<!--') || 
          trimmed.startsWith('<?xml') ||
          trimmed.startsWith('<!DOCTYPE')) {
        continue;
      }
      
      // Parse simple key-value pairs like <key>value</key>
      const match = trimmed.match(/<(\w+)>(.*?)<\/\1>/);
      if (match) {
        const [, key, value] = match;
        result[key] = this.parseValue(value.trim());
      }
      
      // Parse attributes like <key value="something"/>
      const attrMatch = trimmed.match(/<(\w+)\s+value="([^"]*)"\s*\/>/);
      if (attrMatch) {
        const [, key, value] = attrMatch;
        result[key] = this.parseValue(value);
      }
    }
    
    return result;
  }

  private parseValue(value: string): any {
    // Parse booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Parse numbers
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Return as string
    return value;
  }

  getFormat(): string {
    return 'xml';
  }

  getSupportedExtensions(): string[] {
    return ['.xml'];
  }
} 