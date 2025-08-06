import * as fs from 'fs';
import { FileAdapter } from './FileAdapter';
import { ConfigFile } from '../../../shared/types';

export abstract class AbstractFileAdapter implements FileAdapter {
  abstract canHandle(filePath: string): boolean;
  abstract read(filePath: string): Promise<Record<string, any>>;
  abstract getFormat(): string;
  abstract getSupportedExtensions(): string[];

  /**
   * Read file content as string with error handling
   */
  protected async readFileContent(filePath: string): Promise<string> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   */
  protected async getFileMetadata(filePath: string): Promise<ConfigFile['metadata']> {
    try {
      const stats = await fs.promises.stat(filePath);
      return {
        size: stats.size,
        lastModified: stats.mtime,
        encoding: 'utf8'
      };
    } catch (error) {
      // Return basic metadata if stats fail
      return {
        encoding: 'utf8'
      };
    }
  }

  /**
   * Create a ConfigFile object with metadata
   */
  protected async createConfigFile(filePath: string, content: Record<string, any>): Promise<ConfigFile> {
    const metadata = await this.getFileMetadata(filePath);
    
    return {
      path: filePath,
      content,
      format: this.getFormat(),
      metadata
    };
  }

  /**
   * Validate file exists
   */
  protected validateFileExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
  }
} 