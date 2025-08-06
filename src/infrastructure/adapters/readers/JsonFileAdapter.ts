import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class JsonFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.json');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      const parsedContent = JSON.parse(content);
      
      if (typeof parsedContent !== 'object' || parsedContent === null) {
        throw new Error(`Invalid JSON content in ${filePath}: expected object, got ${typeof parsedContent}`);
      }
      
      return parsedContent;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON syntax in ${filePath}: ${error.message}`);
      }
      throw error;
    }
  }

  getFormat(): string {
    return 'json';
  }

  getSupportedExtensions(): string[] {
    return ['.json'];
  }
} 