import { BasePlugin } from '../plugins/base/BasePlugin';
import { PluginMetadata } from '../types';

interface PluginManagerOptions {
  autoLoad?: boolean;
}

export class PluginManager {
  private plugins: Map<string, BasePlugin> = new Map();
  private options: PluginManagerOptions;

  constructor(options: PluginManagerOptions = {}) {
    this.options = {
      autoLoad: false, // Plugin loading is now handled by PluginLoader
      ...options
    };
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: BasePlugin): void {
    const metadata = plugin.getMetadata();
    this.plugins.set(metadata.name, plugin);
  }

  /**
   * Get a plugin by name
   */
  getPlugin(name: string): BasePlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all enabled plugins
   */
  getEnabledPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => {
      const metadata = plugin.getMetadata();
      return metadata.enabled !== false;
    });
  }

  /**
   * Get all plugins (enabled and disabled)
   */
  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Enable or disable a plugin
   */
  setPluginEnabled(name: string, enabled: boolean): boolean {
    const plugin = this.plugins.get(name);
    if (plugin) {
      // TODO: Implement plugin enable/disable
      return true;
    }
    return false;
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(name: string): PluginMetadata | undefined {
    const plugin = this.plugins.get(name);
    return plugin ? plugin.getMetadata() : undefined;
  }

  /**
   * List all available plugins
   */
  listPlugins(): Array<{ name: string; metadata: PluginMetadata }> {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      metadata: plugin.getMetadata()
    }));
  }

  /**
   * Get plugin health status
   */
  async getHealth(): Promise<{ healthy: boolean; plugins: any[] }> {
    const plugins = this.getAllPlugins();
    const healthResults = await Promise.all(
      plugins.map(async plugin => ({
        name: plugin.getMetadata().name,
        ...(await plugin.getHealth())
      }))
    );
    
    const healthy = healthResults.every(result => result.healthy);
    
    return {
      healthy,
      plugins: healthResults
    };
  }
} 