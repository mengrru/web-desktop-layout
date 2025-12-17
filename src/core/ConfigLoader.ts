import type { DesktopConfig, StartMenuConfig, SettingsConfig } from '@/types';

/**
 * Configuration loader for loading JSON config files
 */
export class ConfigLoader {
  // Use import.meta.env.BASE_URL for correct base path in both dev and production
  private basePath = `${import.meta.env.BASE_URL}config`;

  async loadDesktopConfig(): Promise<DesktopConfig> {
    try {
      const response = await fetch(`${this.basePath}/desktop.json`);
      if (!response.ok) throw new Error('Failed to load desktop config');
      return await response.json();
    } catch (error) {
      console.error('Error loading desktop config:', error);
      return { items: [] };
    }
  }

  async loadStartMenuConfig(): Promise<StartMenuConfig> {
    try {
      const response = await fetch(`${this.basePath}/startmenu.json`);
      if (!response.ok) throw new Error('Failed to load start menu config');
      return await response.json();
    } catch (error) {
      console.error('Error loading start menu config:', error);
      return { items: [] };
    }
  }

  async loadSettings(): Promise<SettingsConfig> {
    try {
      const response = await fetch(`${this.basePath}/settings.json`);
      if (!response.ok) throw new Error('Failed to load settings');
      return await response.json();
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): SettingsConfig {
    return {
      wallpaper: {
        type: 'generated',
        generator: 'morandi-pixel'
      },
      filters: [],
      widgets: [
        { id: 'clock', enabled: true }
      ],
      defaultWindowSize: { width: 400, height: 300 }
    };
  }
}
