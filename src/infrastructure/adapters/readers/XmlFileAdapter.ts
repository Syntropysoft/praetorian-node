import * as xml2js from 'xml2js';
import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * XML File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse XML configuration files only
 * Uses xml2js library for robust XML parsing
 */

export class XmlFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return isXmlFile(filePath);
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return await parseXmlContent(content);
    } catch (error) {
      throw new Error(`Failed to parse XML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'xml';
  }

  getSupportedExtensions(): string[] {
    return ['.xml'];
  }
}

/**
 * Pure function to check if file is XML
 */
const isXmlFile = (filePath: string): boolean => {
  // Guard clause: no file path
  if (!filePath) {
    return false;
  }

  return filePath.endsWith('.xml');
};

/**
 * Pure function to parse XML content using xml2js
 */
export const parseXmlContent = async (content: string): Promise<Record<string, any>> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      explicitRoot: false
    });

    const result = await parser.parseStringPromise(content);
    return result || {};
  } catch (error) {
    throw new Error(`XML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 