import { AbstractFileAdapter } from '../base/AbstractFileAdapter';

/**
 * HCL File Adapter - Functional Programming
 * 
 * Single Responsibility: Parse HCL configuration files only
 * Pure functions, no state, no side effects
 */

export class HclFileAdapter extends AbstractFileAdapter {
  canHandle(filePath: string): boolean {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    return filePath.endsWith('.hcl') || filePath.endsWith('.tf') || filePath.endsWith('.tfvars');
  }

  async read(filePath: string): Promise<Record<string, any>> {
    // Guard clause: no file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required');
    }

    this.validateFileExists(filePath);
    
    try {
      const content = await this.readFileContent(filePath);
      return parseHclContent(content);
    } catch (error) {
      throw new Error(`Failed to parse HCL file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFormat(): string {
    return 'hcl';
  }

  getSupportedExtensions(): string[] {
    return ['.hcl', '.tf', '.tfvars'];
  }
}

/**
 * Pure function to parse HCL content
 */
export const parseHclContent = (content: string): Record<string, any> => {
  // Guard clause: no content
  if (!content || typeof content !== 'string') {
    return {};
  }

  const lines = splitIntoLines(content);
  const cleanLines = removeCommentsFromLines(lines);
  const blocks = parseBlocks(cleanLines);
  
  return blocks.reduce((result, block) => {
    if (hasValidBlockName(block.name)) {
      result[block.name] = block.data;
    }
    return result;
  }, {} as Record<string, any>);
};

/**
 * Pure function to split content into lines
 */
const splitIntoLines = (content: string): string[] => {
  // Guard clause: empty content
  if (!content) {
    return [];
  }

  return content.split('\n');
};

/**
 * Pure function to remove comments from lines
 */
const removeCommentsFromLines = (lines: string[]): string[] => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  return lines
    .map(removeCommentsFromLine)
    .filter(isNotEmptyLine);
};

/**
 * Pure function to remove comments from a single line
 */
const removeCommentsFromLine = (line: string): string => {
  // Guard clause: no line
  if (!line) {
    return '';
  }

  return line
    .replace(/#.*$/, '')
    .replace(/\/\/.*$/, '')
    .trim();
};

/**
 * Pure function to check if line is not empty
 */
const isNotEmptyLine = (line: string): boolean => {
  return line.length > 0;
};

/**
 * Pure function to remove quotes from block names
 */
const removeQuotesFromBlockName = (blockName: string): string => {
  // Guard clause: no block name
  if (!blockName) {
    return '';
  }

  return blockName
    .split(' ')
    .map(part => part.replace(/^["']|["']$/g, ''))
    .join('.');
};

/**
 * Pure function to parse blocks from lines
 */
const parseBlocks = (lines: string[]): Array<{ name: string; data: Record<string, any> }> => {
  // Guard clause: no lines
  if (!lines || lines.length === 0) {
    return [];
  }

  let currentBlock: string | null = null;
  let currentBlockData: Record<string, any> = {};
  const blocks: Array<{ name: string; data: Record<string, any> }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Guard clause: skip empty lines
    if (!isNotEmptyLine(line)) {
      continue;
    }

    // Check if it's a block definition
    const blockInfo = parseBlockDefinition(line);
    if (isValidBlockInfo(blockInfo)) {
      // Save previous block if exists
      if (hasValidBlockName(currentBlock) && hasBlockData(currentBlockData)) {
        blocks.push({ name: currentBlock!, data: currentBlockData });
      }
      
      currentBlock = blockInfo!.name;
      currentBlockData = {};
      continue;
    }

    // Check if it's a key-value assignment
    const assignment = parseKeyValueAssignment(line);
    if (isValidAssignment(assignment) && hasValidBlockName(currentBlock)) {
      currentBlockData[assignment!.key] = parseHclValue(assignment!.value);
      continue;
    }

    // Check if it's a nested block
    const nestedBlock = parseNestedBlockDefinition(line);
    if (isValidNestedBlock(nestedBlock) && hasValidBlockName(currentBlock)) {
      const nestedData = parseNestedBlockContent(lines, i + 1);
      currentBlockData[nestedBlock!.name] = nestedData.data;
      i += nestedData.consumedLines;
      continue;
    }

    // Check if it's a closing brace
    if (isClosingBrace(line) && hasValidBlockName(currentBlock)) {
      if (hasBlockData(currentBlockData)) {
        blocks.push({ name: currentBlock!, data: currentBlockData });
      }
      currentBlock = null;
      currentBlockData = {};
    }
  }

  // Save final block if exists
  if (hasValidBlockName(currentBlock) && hasBlockData(currentBlockData)) {
    blocks.push({ name: currentBlock!, data: currentBlockData });
  }

  return blocks;
};

/**
 * Pure function to parse block definition
 */
const parseBlockDefinition = (line: string): { name: string; type: string } | null => {
  // Guard clause: no line
  if (!line) {
    return null;
  }

  // Check for resource block (only valid resource types)
  const resourceMatch = line.match(/^(resource|provider|terraform|locals|output)\s+([^{]+)\s*{/);
  if (isValidResourceMatch(resourceMatch)) {
    const [, blockType, blockName] = resourceMatch!;
    const cleanBlockName = removeQuotesFromBlockName(blockName.trim());
    return { name: `${blockType}.${cleanBlockName}`, type: blockType };
  }

  // Check for variable block
  const variableMatch = line.match(/^variable\s+([^{]+)\s*{/);
  if (isValidVariableMatch(variableMatch)) {
    const cleanBlockName = removeQuotesFromBlockName(variableMatch![1].trim());
    return { name: `variable.${cleanBlockName}`, type: 'variable' };
  }

  // Check for data block
  const dataMatch = line.match(/^data\s+([^{]+)\s*{/);
  if (isValidDataMatch(dataMatch)) {
    const cleanBlockName = removeQuotesFromBlockName(dataMatch![1].trim());
    return { name: `data.${cleanBlockName}`, type: 'data' };
  }

  // Check for module block
  const moduleMatch = line.match(/^module\s+([^{]+)\s*{/);
  if (isValidModuleMatch(moduleMatch)) {
    const cleanBlockName = removeQuotesFromBlockName(moduleMatch![1].trim());
    return { name: `module.${cleanBlockName}`, type: 'module' };
  }

  return null;
};

/**
 * Pure function to check if resource match is valid
 */
const isValidResourceMatch = (match: RegExpMatchArray | null): boolean => {
  return match !== null && match.length >= 3;
};

/**
 * Pure function to check if variable match is valid
 */
const isValidVariableMatch = (match: RegExpMatchArray | null): boolean => {
  return match !== null && match.length >= 2;
};

/**
 * Pure function to check if data match is valid
 */
const isValidDataMatch = (match: RegExpMatchArray | null): boolean => {
  return match !== null && match.length >= 2;
};

/**
 * Pure function to check if module match is valid
 */
const isValidModuleMatch = (match: RegExpMatchArray | null): boolean => {
  return match !== null && match.length >= 2;
};

/**
 * Pure function to check if block info is valid
 */
const isValidBlockInfo = (blockInfo: { name: string; type: string } | null): boolean => {
  return blockInfo !== null && hasValidBlockName(blockInfo.name);
};

/**
 * Pure function to check if block name is valid
 */
const hasValidBlockName = (blockName: string | null): boolean => {
  return blockName !== null && blockName.length > 0;
};

/**
 * Pure function to check if block has data
 */
const hasBlockData = (blockData: Record<string, any>): boolean => {
  return Object.keys(blockData).length > 0;
};

/**
 * Pure function to parse key-value assignment
 */
const parseKeyValueAssignment = (line: string): { key: string; value: string } | null => {
  // Guard clause: no line
  if (!line) {
    return null;
  }

  const match = line.match(/^(\w+)\s*=\s*(.+)$/);
  if (!isValidAssignmentMatch(match)) {
    return null;
  }

  const [, key, value] = match!;
  return { key, value: value.trim() };
};

/**
 * Pure function to check if assignment match is valid
 */
const isValidAssignmentMatch = (match: RegExpMatchArray | null): boolean => {
  return match !== null && match.length >= 3;
};

/**
 * Pure function to check if assignment is valid
 */
const isValidAssignment = (assignment: { key: string; value: string } | null): boolean => {
  return assignment !== null && assignment.key.length > 0;
};

/**
 * Pure function to parse nested block definition
 */
const parseNestedBlockDefinition = (line: string): { name: string } | null => {
  // Guard clause: no line
  if (!line) {
    return null;
  }

  if (!containsOpeningBrace(line)) {
    return null;
  }

  const match = line.match(/^(\w+)\s*{/);
  if (!isValidNestedBlockMatch(match)) {
    return null;
  }

  return { name: match![1] };
};

/**
 * Pure function to check if line contains opening brace
 */
const containsOpeningBrace = (line: string): boolean => {
  return line.includes('{');
};

/**
 * Pure function to check if nested block match is valid
 */
const isValidNestedBlockMatch = (match: RegExpMatchArray | null): boolean => {
  return match !== null && match.length >= 2;
};

/**
 * Pure function to check if nested block is valid
 */
const isValidNestedBlock = (nestedBlock: { name: string } | null): boolean => {
  return nestedBlock !== null && nestedBlock.name.length > 0;
};

/**
 * Pure function to parse nested block content
 */
const parseNestedBlockContent = (lines: string[], startIndex: number): { data: Record<string, any>; consumedLines: number } => {
  // Guard clause: no lines or invalid start index
  if (!lines || startIndex < 0 || startIndex >= lines.length) {
    return { data: {}, consumedLines: 0 };
  }

  let braceCount = 1;
  let consumedLines = 0;
  const data: Record<string, any> = {};

  for (let i = startIndex; i < lines.length; i++) {
    consumedLines++;
    const line = lines[i];

    // Guard clause: skip empty lines
    if (!isNotEmptyLine(line)) {
      continue;
    }

    if (containsOpeningBrace(line)) {
      braceCount++;
    }
    
    if (isClosingBrace(line)) {
      braceCount--;
      if (isBraceCountZero(braceCount)) {
        break;
      }
    }

    // Parse key-value pairs in nested block
    const assignment = parseKeyValueAssignment(line);
    if (isValidAssignment(assignment)) {
      data[assignment!.key] = parseHclValue(assignment!.value);
      continue;
    }

    // Handle nested blocks within nested blocks
    const nestedBlock = parseNestedBlockDefinition(line);
    if (isValidNestedBlock(nestedBlock)) {
      const nestedData = parseNestedBlockContent(lines, i + 1);
      data[nestedBlock!.name] = nestedData.data;
      i += nestedData.consumedLines;
      consumedLines += nestedData.consumedLines;
    }
  }

  return { data, consumedLines };
};

/**
 * Pure function to check if line is closing brace
 */
const isClosingBrace = (line: string): boolean => {
  return line === '}';
};

/**
 * Pure function to check if brace count is zero
 */
const isBraceCountZero = (braceCount: number): boolean => {
  return braceCount === 0;
};

/**
 * Pure function to parse an HCL value
 */
export const parseHclValue = (value: string): any => {
  // Guard clause: no value
  if (!value || value === null || value === undefined) {
    return '';
  }

  // Check if value is quoted - if so, return as string
  if (isQuotedValue(value)) {
    return removeQuotes(value);
  }

  // Parse boolean values
  const booleanValue = parseBoolean(value);
  if (booleanValue !== null) {
    return booleanValue;
  }

  // Parse array values
  const arrayValue = parseArray(value);
  if (arrayValue !== null) {
    return arrayValue;
  }

  // Parse object values
  const objectValue = parseObject(value);
  if (objectValue !== null) {
    return objectValue;
  }

  // Parse numeric values
  const numericValue = parseNumber(value);
  if (numericValue !== null) {
    return numericValue;
  }

  // Return as string
  return value;
};

/**
 * Pure function to remove quotes from value
 */
const removeQuotes = (value: string): string => {
  // Guard clause: no value
  if (!value) {
    return value;
  }

  if (isQuotedValue(value)) {
    return value.slice(1, -1);
  }

  return value;
};

/**
 * Pure function to check if value is quoted
 */
const isQuotedValue = (value: string): boolean => {
  // Guard clause: no value or too short
  if (!value || value.length < 2) {
    return false;
  }

  return (value.startsWith('"') && value.endsWith('"')) || 
         (value.startsWith("'") && value.endsWith("'"));
};

/**
 * Pure function to parse boolean values
 */
const parseBoolean = (value: string): boolean | null => {
  // Guard clause: no value
  if (!value) {
    return null;
  }

  if (value === 'true') {
    return true;
  }
  
  if (value === 'false') {
    return false;
  }

  return null;
};

/**
 * Pure function to parse array values
 */
const parseArray = (value: string): any[] | null => {
  // Guard clause: no value or not array format
  if (!value || !isArrayFormat(value)) {
    return null;
  }

  try {
    // Try to parse as JSON array
    return JSON.parse(value);
  } catch {
    // Fallback: parse manually
    const content = value.slice(1, -1).trim();
    if (!hasArrayContent(content)) {
      return [];
    }
    
    return content.split(',').map(item => parseHclValue(item.trim()));
  }
};

/**
 * Pure function to check if value is array format
 */
const isArrayFormat = (value: string): boolean => {
  return value.startsWith('[') && value.endsWith(']');
};

/**
 * Pure function to check if array has content
 */
const hasArrayContent = (content: string): boolean => {
  return content.length > 0;
};

/**
 * Pure function to parse object values
 */
const parseObject = (value: string): Record<string, any> | null => {
  // Guard clause: no value or not object format
  if (!value || !isObjectFormat(value)) {
    return null;
  }

  try {
    // Try to parse as JSON object
    return JSON.parse(value);
  } catch {
    // Invalid JSON - return null
    return null;
  }
};

/**
 * Pure function to check if value is object format
 */
const isObjectFormat = (value: string): boolean => {
  return value.startsWith('{') && value.endsWith('}');
};

/**
 * Pure function to parse numeric values
 */
const parseNumber = (value: string): number | null => {
  // Guard clause: no value
  if (!value) {
    return null;
  }

  const numericValue = Number(value);
  
  // Guard clause: not a valid number
  if (isNaN(numericValue)) {
    return null;
  }

  return numericValue;
}; 