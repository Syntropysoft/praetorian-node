export interface ParsedCLIArgs {
  command: string;
  subcommand?: string;
  config: string;
  options: Record<string, any>;
}

export class CLIParser {
  /**
   * Parse command line arguments
   */
  parse(args: string[]): ParsedCLIArgs {
    const options: Record<string, any> = {};
    let config = '';
    let i = 0;

    while (i < args.length) {
      const arg = args[i];
      
      if (arg === '--all') {
        options.all = true;
      } else if (arg === '--env' && i + 1 < args.length) {
        options.env = args[i + 1];
        i++;
      } else if (arg === '--environments' && i + 1 < args.length) {
        options.environments = args[i + 1];
        i++;
      } else if (arg === '--verbose') {
        options.verbose = true;
      } else if (arg === '--strict') {
        options.strict = true;
      } else if (arg === '--fail-fast') {
        options.failFast = true;
      } else if (arg && !arg.startsWith('--') && !config) {
        config = arg || '';
      }
      i++;
    }

    const command = args[0] || '';
    const subcommand = args[1];

    return {
      command,
      subcommand,
      config,
      options
    };
  }

  /**
   * Check if help is requested
   */
  isHelpRequested(args: string[]): boolean {
    return args.length === 0 || 
           args.includes('--help') || 
           args.includes('-h') || 
           args.includes('help');
  }

  /**
   * Check if version is requested
   */
  isVersionRequested(args: string[]): boolean {
    return args.includes('--version') || args.includes('-v');
  }
} 