import { HealthChecker } from '../src/infrastructure/plugins/HealthChecker';
import { PluginManager } from '../src/infrastructure/plugins/PluginManager';
import { BasePlugin } from '../src/infrastructure/plugins/base/BasePlugin';

// Mock PluginManager
jest.mock('../src/infrastructure/plugins/PluginManager');

// Mock BasePlugin
class MockPlugin extends BasePlugin {
  constructor(name: string, healthy: boolean = true) {
    super({
      name,
      version: '1.0.0',
      description: 'Mock plugin for testing',
      author: 'Test',
      enabled: true,
      rules: []
    });
    this.healthy = healthy;
  }

  private healthy: boolean;

  async execute(): Promise<any> {
    return { success: true };
  }

  override async getHealth(): Promise<{ healthy: boolean; message?: string }> {
    return { healthy: this.healthy, message: this.healthy ? 'OK' : 'Error' };
  }

  initializeRules(): void {
    // Mock implementation
  }

  executeRule(): Promise<any> {
    return Promise.resolve({ success: true });
  }
}

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;
  let mockPluginManager: jest.Mocked<PluginManager>;

  beforeEach(() => {
    mockPluginManager = {
      getEnabledPlugins: jest.fn(),
      getPlugin: jest.fn()
    } as any;

    healthChecker = new HealthChecker(mockPluginManager);
  });

  describe('getHealth', () => {
    it('should return healthy status when all plugins are healthy', async () => {
      const mockPlugins = [
        new MockPlugin('plugin1', true),
        new MockPlugin('plugin2', true)
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = await healthChecker.getHealth();

      expect(result.healthy).toBe(true);
      expect(result.plugins).toHaveLength(2);
      expect(result.plugins[0]).toEqual({
        name: 'plugin1',
        healthy: true,
        message: 'OK'
      });
      expect(result.plugins[1]).toEqual({
        name: 'plugin2',
        healthy: true,
        message: 'OK'
      });
    });

    it('should return unhealthy status when any plugin is unhealthy', async () => {
      const mockPlugins = [
        new MockPlugin('plugin1', true),
        new MockPlugin('plugin2', false)
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = await healthChecker.getHealth();

      expect(result.healthy).toBe(false);
      expect(result.plugins).toHaveLength(2);
      expect(result.plugins[1]).toEqual({
        name: 'plugin2',
        healthy: false,
        message: 'Error'
      });
    });

    it('should return healthy status when no plugins are enabled', async () => {
      mockPluginManager.getEnabledPlugins.mockReturnValue([]);

      const result = await healthChecker.getHealth();

      expect(result.healthy).toBe(true);
      expect(result.plugins).toHaveLength(0);
    });
  });

  describe('isPluginHealthy', () => {
    it('should return true when plugin is healthy', async () => {
      const mockPlugin = new MockPlugin('test-plugin', true);

      mockPluginManager.getPlugin.mockReturnValue(mockPlugin);

      const result = await healthChecker.isPluginHealthy('test-plugin');

      expect(result).toBe(true);
      expect(mockPluginManager.getPlugin).toHaveBeenCalledWith('test-plugin');
    });

    it('should return false when plugin is unhealthy', async () => {
      const mockPlugin = new MockPlugin('test-plugin', false);

      mockPluginManager.getPlugin.mockReturnValue(mockPlugin);

      const result = await healthChecker.isPluginHealthy('test-plugin');

      expect(result).toBe(false);
    });

    it('should return false when plugin does not exist', async () => {
      mockPluginManager.getPlugin.mockReturnValue(undefined);

      const result = await healthChecker.isPluginHealthy('nonexistent-plugin');

      expect(result).toBe(false);
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information', async () => {
      const mockPlugins = [
        new MockPlugin('plugin1', true),
        new MockPlugin('plugin2', false),
        new MockPlugin('plugin3', true)
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = await healthChecker.getDetailedHealth();

      expect(result.overall).toBe(false);
      expect(result.plugins).toEqual({
        plugin1: { healthy: true, message: 'OK' },
        plugin2: { healthy: false, message: 'Error' },
        plugin3: { healthy: true, message: 'OK' }
      });
      expect(result.summary).toEqual({
        total: 3,
        healthy: 2,
        unhealthy: 1
      });
    });

    it('should return correct summary when all plugins are healthy', async () => {
      const mockPlugins = [
        new MockPlugin('plugin1', true),
        new MockPlugin('plugin2', true)
      ];

      mockPluginManager.getEnabledPlugins.mockReturnValue(mockPlugins);

      const result = await healthChecker.getDetailedHealth();

      expect(result.overall).toBe(true);
      expect(result.summary).toEqual({
        total: 2,
        healthy: 2,
        unhealthy: 0
      });
    });

    it('should return correct summary when no plugins are enabled', async () => {
      mockPluginManager.getEnabledPlugins.mockReturnValue([]);

      const result = await healthChecker.getDetailedHealth();

      expect(result.overall).toBe(true);
      expect(result.plugins).toEqual({});
      expect(result.summary).toEqual({
        total: 0,
        healthy: 0,
        unhealthy: 0
      });
    });
  });
}); 