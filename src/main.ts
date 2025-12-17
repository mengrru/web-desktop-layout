import './styles/index.css';
import { ConfigLoader } from './core/ConfigLoader';
import { Desktop } from './core/Desktop';
import { WindowManager } from './core/WindowManager';
import { Taskbar } from './core/Taskbar';
import { StartMenu } from './core/StartMenu';
import { FilterManager } from './filters';
import { WidgetManager } from './widgets';
import { registerAllHandlers } from './file-handlers';

class App {
  private configLoader: ConfigLoader;
  private desktop: Desktop;
  private windowManager: WindowManager;
  private taskbar: Taskbar;
  private startMenu: StartMenu;
  private filterManager: FilterManager;
  private widgetManager: WidgetManager;

  constructor() {
    this.configLoader = new ConfigLoader();
    this.windowManager = new WindowManager();
    this.taskbar = new Taskbar(this.windowManager);
    this.startMenu = new StartMenu(this.windowManager);
    this.desktop = new Desktop(this.windowManager);
    this.filterManager = new FilterManager();
    this.widgetManager = new WidgetManager();
  }

  async init() {
    // Register all file handlers
    registerAllHandlers();

    // Load configurations
    const [desktopConfig, startMenuConfig, settings] = await Promise.all([
      this.configLoader.loadDesktopConfig(),
      this.configLoader.loadStartMenuConfig(),
      this.configLoader.loadSettings()
    ]);

    // Initialize components
    this.windowManager.init();
    this.taskbar.init();
    this.startMenu.init(startMenuConfig);
    this.desktop.init(desktopConfig);

    // Apply wallpaper
    this.applyWallpaper(settings);

    // Apply filters
    this.filterManager.applyFilters(settings.filters);

    // Initialize widgets
    this.widgetManager.init(settings.widgets);

    // Setup event listeners
    this.setupEventListeners();

    console.log('Y2K Desktop initialized successfully!');
  }

  private applyWallpaper(settings: Awaited<ReturnType<ConfigLoader['loadSettings']>>) {
    const { wallpaper } = settings;
    if (wallpaper.type === 'image' && wallpaper.src) {
      document.body.style.backgroundImage = `url(${wallpaper.src})`;
    } else if (wallpaper.type === 'generated') {
      this.generateWallpaper();
    }
  }

  private generateWallpaper() {
    const canvas = document.createElement('canvas');
    const w = 64;
    const h = 36;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const palette = ['#92a8d1', '#f7cac9', '#a0c1b8', '#d4d0c8', '#95a5a6', '#e0cdcf', '#b6b5a7'];

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 20 + 5, Math.random() * 20 + 5);
    }

    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }

    const dataUrl = canvas.toDataURL();
    document.body.style.backgroundImage = `url(${dataUrl})`;
  }

  private setupEventListeners() {
    // Close start menu when clicking outside
    document.addEventListener('click', (e) => {
      const startMenu = document.getElementById('start-menu');
      const startBtn = document.getElementById('start-btn');
      if (startMenu?.classList.contains('show') &&
          !startMenu.contains(e.target as Node) &&
          !startBtn?.contains(e.target as Node)) {
        this.startMenu.close();
      }
    });

    // Wallpaper upload handler
    const wallpaperInput = document.getElementById('wallpaper-input') as HTMLInputElement;
    wallpaperInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.body.style.backgroundImage = `url(${event.target?.result})`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Public methods for actions
  changeWallpaper() {
    document.getElementById('wallpaper-input')?.click();
  }

  randomWallpaper() {
    this.generateWallpaper();
  }

  shutdown() {
    location.reload();
  }
}

// Initialize app
const app = new App();
app.init();

// Expose app actions globally for menu actions
(window as unknown as { app: App }).app = app;
