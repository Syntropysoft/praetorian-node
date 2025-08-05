import { PluginLoader } from '../src/infrastructure/plugins/PluginLoader';
import { PluginManager } from '../src/infrastructure/plugins/PluginManager';

// Mock PluginManager
jest.mock('../src/infrastructure/plugins/PluginManager');

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

describe('PluginLoader', () => {
  let mockConsoleLog: jest.Mock;
  let mockConsoleWarn: jest.Mock;

  beforeEach(() => {
    mockConsoleLog = jest.fn();
    mockConsoleWarn = jest.fn();
    
    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const loader = new PluginLoader();
      
      expect(loader).toBeInstanceOf(PluginLoader);
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading default plugins...');
    });

    it('should create instance with custom options', () => {
      const options = {
        plugins: ['syntropylog'],
        autoLoad: false
      };
      
      const loader = new PluginLoader(options);
      
      expect(loader).toBeInstanceOf(PluginLoader);
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Loading default plugins...');
    });

    it('should create instance with autoLoad disabled', () => {
      const options = { autoLoad: false };
      
      const loader = new PluginLoader(options);
      
      expect(loader).toBeInstanceOf(PluginLoader);
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Loading default plugins...');
    });
  });

  describe('loadPlugins', () => {
    it('should load known plugins successfully', async () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      await loader.loadPlugins(['syntropylog', 'security']);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading SyntropyLog plugin...');
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading Security plugin...');
    });

    it('should handle unknown plugins gracefully', async () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      await loader.loadPlugins(['unknown-plugin']);
      
      expect(mockConsoleWarn).toHaveBeenCalledWith('Unknown plugin: unknown-plugin');
    });

    it('should handle mixed known and unknown plugins', async () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      await loader.loadPlugins(['syntropylog', 'unknown-plugin', 'compliance']);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading SyntropyLog plugin...');
      expect(mockConsoleWarn).toHaveBeenCalledWith('Unknown plugin: unknown-plugin');
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading Compliance plugin...');
    });

    it('should handle empty plugin list', async () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      await loader.loadPlugins([]);
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should handle plugin loading errors gracefully', async () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      // Mock a plugin that throws an error
      const originalLoadPlugin = (loader as any).loadPlugin;
      (loader as any).loadPlugin = jest.fn().mockImplementation((pluginName: string) => {
        if (pluginName === 'syntropylog') {
          throw new Error('Plugin load error');
        }
        return originalLoadPlugin.call(loader, pluginName);
      });
      
      await loader.loadPlugins(['syntropylog', 'security']);
      
      expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to load plugin syntropylog:', expect.any(Error));
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading Security plugin...');
    });
  });

  describe('getPluginManager', () => {
    it('should return plugin manager instance', () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      const pluginManager = loader.getPluginManager();
      
      expect(pluginManager).toBeInstanceOf(PluginManager);
    });
  });

  describe('private methods coverage', () => {
    it('should load all known plugin types', async () => {
      const loader = new PluginLoader({ autoLoad: false });
      
      await loader.loadPlugins(['syntropylog', 'security', 'compliance']);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading SyntropyLog plugin...');
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading Security plugin...');
      expect(mockConsoleLog).toHaveBeenCalledWith('Loading Compliance plugin...');
    });
  });
}); 