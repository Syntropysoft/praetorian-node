import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class HclFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.hcl') || filePath.endsWith('.tf') || filePath.endsWith('.tfvars');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return this.parseHclContent(content);
    } catch (error) {
      throw new Error(`Failed to parse HCL file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseHclContent(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');
    
    let currentBlock: string | null = null;
    let currentBlockData: Record<string, any> = {};
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Remove comments (both # and //)
      line = line.replace(/#.*$/, '').replace(/\/\/.*$/, '').trim();
      
      if (!line) continue;
      
      // Handle block definitions (e.g., "resource aws_instance web {")
      const blockMatch = line.match(/^(\w+)\s+([^{]+)\s*{/);
      if (blockMatch) {
        const [, blockType, blockName] = blockMatch;
        currentBlock = `${blockType}.${blockName.trim()}`;
        currentBlockData = {};
        continue;
      }
      
      // Handle variable definitions (e.g., "variable region {")
      const variableMatch = line.match(/^variable\s+(\w+)\s*{/);
      if (variableMatch) {
        currentBlock = `variable.${variableMatch[1]}`;
        currentBlockData = {};
        continue;
      }
      
      // Handle data source definitions (e.g., "data aws_ami ubuntu {")
      const dataMatch = line.match(/^data\s+([^{]+)\s*{/);
      if (dataMatch) {
        currentBlock = `data.${dataMatch[1].trim()}`;
        currentBlockData = {};
        continue;
      }
      
      // Handle module definitions (e.g., "module vpc {")
      const moduleMatch = line.match(/^module\s+(\w+)\s*{/);
      if (moduleMatch) {
        currentBlock = `module.${moduleMatch[1]}`;
        currentBlockData = {};
        continue;
      }
      
      // Handle key-value assignments
      const assignmentMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignmentMatch && currentBlock) {
        const [, key, value] = assignmentMatch;
        currentBlockData[key] = this.parseValue(value.trim());
        continue;
      }
      
      // Handle nested blocks
      if (line.includes('{') && currentBlock) {
        const nestedData = this.parseNestedBlock(lines, i + 1);
        const keyMatch = line.match(/^(\w+)\s*{/);
        if (keyMatch) {
          const key = keyMatch[1];
          currentBlockData[key] = nestedData;
        }
        
        // Skip the nested block lines
        i += this.countNestedBlockLines(lines, i + 1);
        continue;
      }
      
      // Handle closing braces
      if (line === '}' && currentBlock) {
        if (Object.keys(currentBlockData).length > 0) {
          result[currentBlock] = currentBlockData;
        }
        currentBlock = null;
        currentBlockData = {};
      }
    }
    
    // Save final block if exists
    if (currentBlock && Object.keys(currentBlockData).length > 0) {
      result[currentBlock] = currentBlockData;
    }
    
    return result;
  }

  private parseNestedBlock(lines: string[], startIndex: number): Record<string, any> {
    const result: Record<string, any> = {};
    let braceCount = 1;
    
    for (let i = startIndex; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Remove comments
      line = line.replace(/#.*$/, '').replace(/\/\/.*$/, '').trim();
      
      if (!line) continue;
      
      if (line.includes('{')) {
        braceCount++;
      }
      if (line.includes('}')) {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
      
      // Parse key-value pairs in nested block
      const assignmentMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignmentMatch) {
        const [, key, value] = assignmentMatch;
        result[key] = this.parseValue(value.trim());
      }
      
      // Handle nested blocks within nested blocks
      if (line.includes('{')) {
        const nestedData = this.parseNestedBlock(lines, i + 1);
        const keyMatch = line.match(/^(\w+)\s*{/);
        if (keyMatch) {
          const key = keyMatch[1];
          result[key] = nestedData;
        }
        
        // Skip the nested block lines
        i += this.countNestedBlockLines(lines, i + 1);
      }
    }
    
    return result;
  }

  private countNestedBlockLines(lines: string[], startIndex: number): number {
    let braceCount = 1;
    let lineCount = 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      lineCount++;
      const line = lines[i].trim();
      
      if (line.includes('{')) {
        braceCount++;
      }
      if (line.includes('}')) {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
    }
    
    return lineCount;
  }

  private parseValue(value: string): any {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Parse booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        // Try to parse as JSON array
        return JSON.parse(value);
      } catch {
        // Fallback: parse manually
        const content = value.slice(1, -1).trim();
        if (!content) return [];
        
        return content.split(',').map(item => this.parseValue(item.trim()));
      }
    }
    
    // Parse objects
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        // Try to parse as JSON object
        return JSON.parse(value);
      } catch {
        // Fallback: return as string for now
        return value;
      }
    }
    
    // Parse numbers
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Return as string
    return value;
  }

  getFormat(): string {
    return 'hcl';
  }

  getSupportedExtensions(): string[] {
    return ['.hcl', '.tf', '.tfvars'];
  }
} 