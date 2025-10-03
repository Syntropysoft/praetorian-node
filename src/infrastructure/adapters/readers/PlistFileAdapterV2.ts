import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

// ============================================================================
// TYPES
// ============================================================================

interface ParsedLine {
  type: 'key' | 'value' | 'dict_start' | 'dict_end' | 'array_start' | 'array_end' | 'skip';
  key?: string;
  value?: any;
}

interface ParserResult {
  type: string;
  data: any;
}

// ============================================================================
// VALUE PARSERS
// ============================================================================

interface ValueParser {
  canParse(line: string): boolean;
  parse(line: string): any;
}

class StringValueParser implements ValueParser {
  canParse(line: string): boolean {
    return line.includes('<string>');
  }
  
  parse(line: string): any {
    const match = line.match(/<string>(.*?)<\/string>/);
    return match ? this.parseValue(match[1]) : null;
  }
  
  private parseValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
}

class IntegerValueParser implements ValueParser {
  canParse(line: string): boolean {
    return line.includes('<integer>');
  }
  
  parse(line: string): any {
    const match = line.match(/<integer>(.*?)<\/integer>/);
    return match ? parseInt(match[1], 10) : null;
  }
}

class RealValueParser implements ValueParser {
  canParse(line: string): boolean {
    return line.includes('<real>');
  }
  
  parse(line: string): any {
    const match = line.match(/<real>(.*?)<\/real>/);
    return match ? parseFloat(match[1]) : null;
  }
}

class BooleanValueParser implements ValueParser {
  canParse(line: string): boolean {
    return line.includes('<true/>') || line.includes('<false/>');
  }
  
  parse(line: string): any {
    if (line.includes('<true/>')) return true;
    if (line.includes('<false/>')) return false;
    return null;
  }
}

class DateValueParser implements ValueParser {
  canParse(line: string): boolean {
    return line.includes('<date>');
  }
  
  parse(line: string): any {
    const match = line.match(/<date>(.*?)<\/date>/);
    return match ? new Date(match[1]) : null;
  }
}

class DataValueParser implements ValueParser {
  canParse(line: string): boolean {
    return line.includes('<data>');
  }
  
  parse(line: string): any {
    const match = line.match(/<data>(.*?)<\/data>/);
    return match ? match[1] : null; // Keep as base64 string
  }
}

// ============================================================================
// LINE PARSERS
// ============================================================================

interface LineParser {
  canParse(line: string): boolean;
  parse(line: string): ParsedLine;
}

class KeyParser implements LineParser {
  canParse(line: string): boolean {
    return line.includes('<key>');
  }
  
  parse(line: string): ParsedLine {
    const match = line.match(/<key>(.*?)<\/key>/);
    return match ? { type: 'key', key: match[1] } : { type: 'skip' };
  }
}

class DictStartParser implements LineParser {
  canParse(line: string): boolean {
    return line.includes('<dict>');
  }
  
  parse(line: string): ParsedLine {
    return { type: 'dict_start' };
  }
}

class DictEndParser implements LineParser {
  canParse(line: string): boolean {
    return line.includes('</dict>');
  }
  
  parse(line: string): ParsedLine {
    return { type: 'dict_end' };
  }
}

class ArrayStartParser implements LineParser {
  canParse(line: string): boolean {
    return line.includes('<array>');
  }
  
  parse(line: string): ParsedLine {
    return { type: 'array_start' };
  }
}

class ArrayEndParser implements LineParser {
  canParse(line: string): boolean {
    return line.includes('</array>');
  }
  
  parse(line: string): ParsedLine {
    return { type: 'array_end' };
  }
}

class ValueLineParser implements LineParser {
  private valueParsers: ValueParser[] = [
    new StringValueParser(),
    new IntegerValueParser(),
    new RealValueParser(),
    new BooleanValueParser(),
    new DateValueParser(),
    new DataValueParser()
  ];
  
  canParse(line: string): boolean {
    return this.valueParsers.some(parser => parser.canParse(line));
  }
  
  parse(line: string): ParsedLine {
    const parser = this.valueParsers.find(p => p.canParse(line));
    const value = parser ? parser.parse(line) : null;
    return { type: 'value', value };
  }
}

// ============================================================================
// STATE MANAGER
// ============================================================================

class PlistStateManager {
  private result: Record<string, any> = {};
  private currentKey: string | null = null;
  private stack: Array<{ type: 'dict' | 'array'; data: any; key?: string }> = [];
  
  processLine(parsedLine: ParsedLine): void {
    switch (parsedLine.type) {
      case 'key':
        this.currentKey = parsedLine.key!;
        break;
        
      case 'value':
        this.addValue(parsedLine.value);
        break;
        
      case 'dict_start':
        this.startDict();
        break;
        
      case 'dict_end':
        this.endDict();
        break;
        
      case 'array_start':
        this.startArray();
        break;
        
      case 'array_end':
        this.endArray();
        break;
    }
  }
  
  private addValue(value: any): void {
    if (this.stack.length === 0) {
      // Root level - add directly to result
      if (this.currentKey) {
        this.result[this.currentKey] = value;
        this.currentKey = null;
      }
    } else {
      // Nested level
      const current = this.stack[this.stack.length - 1];
      if (current.type === 'dict' && this.currentKey) {
        current.data[this.currentKey] = value;
        this.currentKey = null;
      } else if (current.type === 'array') {
        current.data.push(value);
      }
    }
  }
  
  private startDict(): void {
    const dict: Record<string, any> = {};
    // Store the current key with the dict
    this.stack.push({ 
      type: 'dict', 
      data: dict,
      key: this.currentKey || undefined // Store the key that this dict belongs to
    });
    this.currentKey = null; // Clear the key since we're starting a new dict
  }
  
  private endDict(): void {
    if (this.stack.length === 0) return;
    
    const dict = this.stack.pop()!;
    if (dict.type === 'dict') {
      // If we're at root level (stack is now empty), merge the dict into result
      if (this.stack.length === 0) {
        Object.assign(this.result, dict.data);
      } else {
        // Otherwise, add the dict as a value to the parent
        // Use the stored key if available
        if (dict.key) {
          // Temporarily set the current key to the stored key
          const originalKey = this.currentKey;
          this.currentKey = dict.key;
          this.addValue(dict.data);
          this.currentKey = originalKey;
        } else {
          this.addValue(dict.data);
        }
      }
    }
  }
  
  private startArray(): void {
    const array: any[] = [];
    this.stack.push({ 
      type: 'array', 
      data: array,
      key: this.currentKey || undefined // Store the key that this array belongs to
    });
    this.currentKey = null; // Clear the key since we're starting a new array
  }
  
  private endArray(): void {
    if (this.stack.length === 0) return;
    
    const array = this.stack.pop()!;
    if (array.type === 'array') {
      // If we're at root level (stack is now empty), add directly to result
      if (this.stack.length === 0) {
        if (array.key) {
          this.result[array.key] = array.data;
        }
        return;
      }
      
      // Add the array to the parent context using the stored key
      const parent = this.stack[this.stack.length - 1];
      if (parent.type === 'dict' && array.key) {
        parent.data[array.key] = array.data;
      } else if (parent.type === 'array') {
        parent.data.push(array.data);
      }
    }
  }
  
  getResult(): Record<string, any> {
    return this.result;
  }
}

// ============================================================================
// MAIN PARSER
// ============================================================================

class PlistParser {
  private lineParsers: LineParser[] = [
    new KeyParser(),
    new ValueLineParser(),
    new DictStartParser(),
    new DictEndParser(),
    new ArrayStartParser(),
    new ArrayEndParser()
  ];
  
  parse(content: string): Record<string, any> {
    const stateManager = new PlistStateManager();
    
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => this.isRelevantLine(line));
    
    lines.forEach((line, index) => {
      const parser = this.lineParsers.find(p => p.canParse(line));
      if (parser) {
        const parsedLine = parser.parse(line);
        stateManager.processLine(parsedLine);
      }
    });
    
    return stateManager.getResult();
  }
  
  private isRelevantLine(line: string): boolean {
    return line.length > 0 && 
           !line.startsWith('<!--') && 
           !line.startsWith('<?xml') && 
           !line.startsWith('<!DOCTYPE') &&
           !line.startsWith('<plist version');
  }
}

// ============================================================================
// FILE ADAPTER
// ============================================================================

export class PlistFileAdapterV2 extends AbstractFileAdapter {
  private parser = new PlistParser();
  
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.plist');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return this.parser.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse PLIST file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'plist';
  }

  getSupportedExtensions(): string[] {
    return ['.plist'];
  }
} 