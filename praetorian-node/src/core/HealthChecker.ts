import { PluginManager } from './PluginManager';

export interface HealthStatus {
  healthy: boolean;
  plugins: Array<{
    name: string;
    healthy: boolean;
    message?: string;
  }>;
}

export class HealthChecker {
  private pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  /**
   * Get overall health status
   */
  async getHealth(): Promise<HealthStatus> {
    const plugins = this.pluginManager.getEnabledPlugins();
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

  /**
   * Check if specific plugin is healthy
   */
  async isPluginHealthy(pluginName: string): Promise<boolean> {
    const plugin = this.pluginManager.getPlugin(pluginName);
    if (!plugin) {
      return false;
    }

    const health = await plugin.getHealth();
    return health.healthy;
  }

  /**
   * Get detailed health information
   */
  async getDetailedHealth(): Promise<{
    overall: boolean;
    plugins: Record<string, { healthy: boolean; message?: string }>;
    summary: { total: number; healthy: number; unhealthy: number };
  }> {
    const health = await this.getHealth();
    const pluginDetails: Record<string, { healthy: boolean; message?: string }> = {};
    
    health.plugins.forEach(plugin => {
      pluginDetails[plugin.name] = {
        healthy: plugin.healthy,
        message: plugin.message
      };
    });

    const summary = {
      total: health.plugins.length,
      healthy: health.plugins.filter(p => p.healthy).length,
      unhealthy: health.plugins.filter(p => !p.healthy).length
    };

    return {
      overall: health.healthy,
      plugins: pluginDetails,
      summary
    };
  }
} 