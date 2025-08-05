import { PluginManager } from '../src/infrastructure/plugins/PluginManager';
import { BasePlugin } from '../src/infrastructure/plugins/base/BasePlugin';
import { PluginMetadata } from '../src/shared/types';

// Mock BasePlugin
jest.mock('../src/infrastructure/plugins/base/BasePlugin');

// Mock Plugin class for testing
class MockPlugin extends BasePlugin {
  private mockMetadata: any;

  constructor(name: string, enabled: boolean = true) {
    const metadata = {
      name,
      version: '1.0.0',
      description: 'Mock plugin for testing',
      author: 'Test',
      enabled,
      rules: []
    };
    super(metadata);
    this.mockMetadata = metadata;
  }

  async execute(): Promise<any> {
    return { success: true };
  }

  override async getHealth(): Promise<{ healthy: boolean; message?: string }> {
    return { healthy: true, message: 'OK' };
  }

  initializeRules(): void {
    // Mock implementation
  }

  executeRule(): Promise<any> {
    return Promise.resolve({ success: true });
  }

  // Override getMetadata to ensure it returns the correct structure
  override getMetadata() {
    return this.mockMetadata;
  }
}

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const manager = new PluginManager();
      expect(manager).toBeInstanceOf(PluginManager);
    });

    it('should create instance with custom options', () => {
      const options = { autoLoad: true };
      const manager = new PluginManager(options);
      expect(manager).toBeInstanceOf(PluginManager);
    });

    it('should create instance with undefined options', () => {
      const manager = new PluginManager(undefined);
      expect(manager).toBeInstanceOf(PluginManager);
    });

    it('should create instance with null options', () => {
      const manager = new PluginManager(null as any);
      expect(manager).toBeInstanceOf(PluginManager);
    });

    it('should create instance with empty object options', () => {
      const manager = new PluginManager({});
      expect(manager).toBeInstanceOf(PluginManager);
    });
  });

  describe('registerPlugin', () => {
    it('should register a plugin successfully', () => {
      const plugin = new MockPlugin('test-plugin');
      
      pluginManager.registerPlugin(plugin);
      
      const registeredPlugin = pluginManager.getPlugin('test-plugin');
      expect(registeredPlugin).toBe(plugin);
    });

    it('should overwrite existing plugin with same name', () => {
      const plugin1 = new MockPlugin('test-plugin');
      const plugin2 = new MockPlugin('test-plugin');
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const registeredPlugin = pluginManager.getPlugin('test-plugin');
      expect(registeredPlugin).toBe(plugin2);
      expect(registeredPlugin).not.toBe(plugin1);
    });

    it('should handle multiple plugins with different names', () => {
      const plugin1 = new MockPlugin('plugin1');
      const plugin2 = new MockPlugin('plugin2');
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      expect(pluginManager.getPlugin('plugin1')).toBe(plugin1);
      expect(pluginManager.getPlugin('plugin2')).toBe(plugin2);
    });
  });

  describe('getPlugin', () => {
    it('should return plugin when it exists', () => {
      const plugin = new MockPlugin('test-plugin');
      pluginManager.registerPlugin(plugin);
      
      const result = pluginManager.getPlugin('test-plugin');
      
      expect(result).toBe(plugin);
    });

    it('should return undefined when plugin does not exist', () => {
      const result = pluginManager.getPlugin('nonexistent-plugin');
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = pluginManager.getPlugin('');
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for null', () => {
      const result = pluginManager.getPlugin(null as any);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      const result = pluginManager.getPlugin(undefined as any);
      
      expect(result).toBeUndefined();
    });
  });

  describe('getEnabledPlugins', () => {
    it('should return only enabled plugins', () => {
      const enabledPlugin = new MockPlugin('enabled-plugin', true);
      const disabledPlugin = new MockPlugin('disabled-plugin', false);
      
      pluginManager.registerPlugin(enabledPlugin);
      pluginManager.registerPlugin(disabledPlugin);
      
      const enabledPlugins = pluginManager.getEnabledPlugins();
      
      expect(enabledPlugins).toHaveLength(1);
      expect(enabledPlugins[0]).toBe(enabledPlugin);
    });

    it('should return empty array when no plugins are registered', () => {
      const enabledPlugins = pluginManager.getEnabledPlugins();
      
      expect(enabledPlugins).toHaveLength(0);
    });

    it('should return all plugins when all are enabled', () => {
      const plugin1 = new MockPlugin('plugin1', true);
      const plugin2 = new MockPlugin('plugin2', true);
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const enabledPlugins = pluginManager.getEnabledPlugins();
      
      expect(enabledPlugins).toHaveLength(2);
      expect(enabledPlugins).toContain(plugin1);
      expect(enabledPlugins).toContain(plugin2);
    });

    it('should return empty array when all plugins are disabled', () => {
      const plugin1 = new MockPlugin('plugin1', false);
      const plugin2 = new MockPlugin('plugin2', false);
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const enabledPlugins = pluginManager.getEnabledPlugins();
      
      expect(enabledPlugins).toHaveLength(0);
    });
  });

  describe('getAllPlugins', () => {
    it('should return all registered plugins', () => {
      const plugin1 = new MockPlugin('plugin1', true);
      const plugin2 = new MockPlugin('plugin2', false);
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const allPlugins = pluginManager.getAllPlugins();
      
      expect(allPlugins).toHaveLength(2);
      expect(allPlugins).toContain(plugin1);
      expect(allPlugins).toContain(plugin2);
    });

    it('should return empty array when no plugins are registered', () => {
      const allPlugins = pluginManager.getAllPlugins();
      
      expect(allPlugins).toHaveLength(0);
    });

    it('should return plugins in registration order', () => {
      const plugin1 = new MockPlugin('plugin1');
      const plugin2 = new MockPlugin('plugin2');
      const plugin3 = new MockPlugin('plugin3');
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      pluginManager.registerPlugin(plugin3);
      
      const allPlugins = pluginManager.getAllPlugins();
      
      expect(allPlugins[0]).toBe(plugin1);
      expect(allPlugins[1]).toBe(plugin2);
      expect(allPlugins[2]).toBe(plugin3);
    });
  });

  describe('setPluginEnabled', () => {
    it('should return true when plugin exists', () => {
      const plugin = new MockPlugin('test-plugin');
      pluginManager.registerPlugin(plugin);
      
      const result = pluginManager.setPluginEnabled('test-plugin', false);
      
      expect(result).toBe(true);
    });

    it('should return false when plugin does not exist', () => {
      const result = pluginManager.setPluginEnabled('nonexistent-plugin', false);
      
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = pluginManager.setPluginEnabled('', true);
      
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const result = pluginManager.setPluginEnabled(null as any, true);
      
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = pluginManager.setPluginEnabled(undefined as any, true);
      
      expect(result).toBe(false);
    });
  });

  describe('getPluginMetadata', () => {
    it('should return metadata when plugin exists', () => {
      const plugin = new MockPlugin('test-plugin');
      pluginManager.registerPlugin(plugin);
      
      const metadata = pluginManager.getPluginMetadata('test-plugin');
      
      expect(metadata).toEqual({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Mock plugin for testing',
        author: 'Test',
        enabled: true,
        rules: []
      });
    });

    it('should return undefined when plugin does not exist', () => {
      const metadata = pluginManager.getPluginMetadata('nonexistent-plugin');
      
      expect(metadata).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const metadata = pluginManager.getPluginMetadata('');
      
      expect(metadata).toBeUndefined();
    });

    it('should return undefined for null', () => {
      const metadata = pluginManager.getPluginMetadata(null as any);
      
      expect(metadata).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      const metadata = pluginManager.getPluginMetadata(undefined as any);
      
      expect(metadata).toBeUndefined();
    });
  });

  describe('listPlugins', () => {
    it('should return list of all plugins with metadata', () => {
      const plugin1 = new MockPlugin('plugin1', true);
      const plugin2 = new MockPlugin('plugin2', false);
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const pluginList = pluginManager.listPlugins();
      
      expect(pluginList).toHaveLength(2);
      expect(pluginList[0]).toEqual({
        name: 'plugin1',
        metadata: {
          name: 'plugin1',
          version: '1.0.0',
          description: 'Mock plugin for testing',
          author: 'Test',
          enabled: true,
          rules: []
        }
      });
      expect(pluginList[1]).toEqual({
        name: 'plugin2',
        metadata: {
          name: 'plugin2',
          version: '1.0.0',
          description: 'Mock plugin for testing',
          author: 'Test',
          enabled: false,
          rules: []
        }
      });
    });

    it('should return empty array when no plugins are registered', () => {
      const pluginList = pluginManager.listPlugins();
      
      expect(pluginList).toHaveLength(0);
    });

    it('should return plugins in registration order', () => {
      const plugin1 = new MockPlugin('plugin1');
      const plugin2 = new MockPlugin('plugin2');
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const pluginList = pluginManager.listPlugins();
      
      expect(pluginList[0].name).toBe('plugin1');
      expect(pluginList[1].name).toBe('plugin2');
    });
  });

  describe('getHealth', () => {
    it('should return health status for all plugins', async () => {
      const plugin1 = new MockPlugin('plugin1', true);
      const plugin2 = new MockPlugin('plugin2', true);
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const health = await pluginManager.getHealth();
      
      expect(health.healthy).toBe(true);
      expect(health.plugins).toHaveLength(2);
      expect(health.plugins[0]).toEqual({
        name: 'plugin1',
        healthy: true,
        message: 'OK'
      });
      expect(health.plugins[1]).toEqual({
        name: 'plugin2',
        healthy: true,
        message: 'OK'
      });
    });

    it('should return healthy status when no plugins are registered', async () => {
      const health = await pluginManager.getHealth();
      
      expect(health.healthy).toBe(true);
      expect(health.plugins).toHaveLength(0);
    });

    it('should return unhealthy status when any plugin is unhealthy', async () => {
      const healthyPlugin = new MockPlugin('healthy-plugin', true);
      const unhealthyPlugin = new MockPlugin('unhealthy-plugin', true);
      
      // Mock unhealthy plugin
      jest.spyOn(unhealthyPlugin, 'getHealth').mockResolvedValue({
        healthy: false,
        message: 'Error'
      });
      
      pluginManager.registerPlugin(healthyPlugin);
      pluginManager.registerPlugin(unhealthyPlugin);
      
      const health = await pluginManager.getHealth();
      
      expect(health.healthy).toBe(false);
      expect(health.plugins).toHaveLength(2);
      expect(health.plugins[1]).toEqual({
        name: 'unhealthy-plugin',
        healthy: false,
        message: 'Error'
      });
    });

    it('should handle plugin health check errors', async () => {
      const plugin = new MockPlugin('error-plugin', true);
      
      // Mock plugin that throws error
      jest.spyOn(plugin, 'getHealth').mockRejectedValue(new Error('Health check failed'));
      
      pluginManager.registerPlugin(plugin);
      
      await expect(pluginManager.getHealth()).rejects.toThrow('Health check failed');
    });

    it('should handle mixed healthy and unhealthy plugins', async () => {
      const healthyPlugin = new MockPlugin('healthy', true);
      const unhealthyPlugin = new MockPlugin('unhealthy', true);
      
      jest.spyOn(unhealthyPlugin, 'getHealth').mockResolvedValue({
        healthy: false,
        message: 'Unhealthy'
      });
      
      pluginManager.registerPlugin(healthyPlugin);
      pluginManager.registerPlugin(unhealthyPlugin);
      
      const health = await pluginManager.getHealth();
      
      expect(health.healthy).toBe(false);
      expect(health.plugins[0].healthy).toBe(true);
      expect(health.plugins[1].healthy).toBe(false);
    });
  });
}); 