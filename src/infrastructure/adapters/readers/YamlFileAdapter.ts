import * as yaml from 'js-yaml';
import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

export class YamlFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    return filePath.endsWith('.yaml') || filePath.endsWith('.yml');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      const parsedContent = yaml.load(content) as Record<string, any>;
      
      if (typeof parsedContent !== 'object' || parsedContent === null) {
        throw new Error(`Invalid YAML content in ${filePath}: expected object, got ${typeof parsedContent}`);
      }
      
      return parsedContent;
    } catch (error) {
      if (error instanceof yaml.YAMLException) {
        throw new Error(`Invalid YAML syntax in ${filePath}: ${(error as Error).message}`);
      }
      throw error;
    }
  }

  getFormat(): string {
    return 'yaml';
  }

  getSupportedExtensions(): string[] {
    return ['.yaml', '.yml'];
  }
} 