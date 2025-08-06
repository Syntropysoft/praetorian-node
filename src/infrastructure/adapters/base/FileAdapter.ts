import { ConfigFile } from '../../../shared/types';

export interface FileAdapter {
  /**
   * Check if this adapter can handle the given file
   */
  canHandle(filePath: string): boolean;

  /**
   * Read and parse the file content
   */
  read(filePath: string): Promise<Record<string, any>>;

  /**
   * Get the format name for this adapter
   */
  getFormat(): string;

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[];
} 