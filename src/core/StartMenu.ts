import type { StartMenuConfig, MenuItem, FileItem } from '@/types';
import { WindowManager } from './WindowManager';
import { getHandler } from '@/file-handlers';

/**
 * Start menu manager
 */
export class StartMenu {
  private menuElement: HTMLElement | null = null;
  private startBtn: HTMLElement | null = null;
  private contentElement: HTMLElement | null = null;
  private sideElement: HTMLElement | null = null;
  private windowManager: WindowManager;
  private isOpen = false;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
  }

  init(config: StartMenuConfig) {
    this.menuElement = document.getElementById('start-menu');
    this.startBtn = document.getElementById('start-btn');
    this.contentElement = this.menuElement?.querySelector('.start-content') || null;
    this.sideElement = this.menuElement?.querySelector('.start-side span') || null;

    if (!this.menuElement || !this.startBtn || !this.contentElement) {
      console.error('Start menu elements not found');
      return;
    }

    // Set side text
    if (this.sideElement && config.sideText) {
      this.sideElement.textContent = config.sideText;
    }

    // Render menu items
    this.renderMenuItems(config.items, this.contentElement);

    // Setup toggle
    this.startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
  }

  private renderMenuItems(items: MenuItem[], container: HTMLElement) {
    container.innerHTML = '';

    items.forEach(item => {
      if (item.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'start-separator';
        container.appendChild(separator);
        return;
      }

      const menuItem = this.createMenuItem(item);
      container.appendChild(menuItem);
    });
  }

  private createMenuItem(item: MenuItem): HTMLElement {
    const handler = getHandler(item.type);
    const iconUrl = item.icon || handler?.defaultIcon || '';

    const div = document.createElement('div');
    div.className = 'start-item';
    
    if (item.type === 'submenu' && item.children?.length) {
      div.classList.add('has-submenu');
    }

    div.innerHTML = `
      ${iconUrl ? `<img src="${iconUrl}" draggable="false">` : ''}
      <span>${item.name || ''}</span>
    `;

    // Handle submenu
    if (item.type === 'submenu' && item.children?.length) {
      const submenu = document.createElement('div');
      submenu.className = 'start-submenu';
      this.renderMenuItems(item.children, submenu);
      div.appendChild(submenu);
    } else {
      // Handle click
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleItemClick(item);
      });
    }

    return div;
  }

  private handleItemClick(item: MenuItem) {
    this.close();

    // Handle action type
    if (item.type === 'action' && item.action) {
      this.executeAction(item.action);
      return;
    }

    // Handle link type
    if (item.type === 'link' && item.src) {
      window.open(item.src, '_blank');
      return;
    }

    // Handle file types (open in window)
    if (item.src || item.type === 'folder') {
      const file: FileItem = {
        id: item.id,
        name: item.name || '',
        type: item.type,
        icon: item.icon,
        src: item.src
      };
      
      // Add children for folder type
      if (item.type === 'folder' && item.children) {
        (file as FileItem & { children: MenuItem[] }).children = item.children as unknown as FileItem[];
      }

      this.windowManager.openFile(file);
    }
  }

  private executeAction(action: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = (window as any).app;
    
    switch (action) {
      case 'changeWallpaper':
        app?.changeWallpaper?.();
        break;
      case 'randomWallpaper':
        app?.randomWallpaper?.();
        break;
      case 'shutdown':
        app?.shutdown?.();
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.menuElement?.classList.add('show');
    this.startBtn?.classList.add('active');
    this.startBtn?.classList.remove('outset');
    this.startBtn?.classList.add('inset');
    this.isOpen = true;
  }

  close() {
    this.menuElement?.classList.remove('show');
    this.startBtn?.classList.remove('active');
    this.startBtn?.classList.remove('inset');
    this.startBtn?.classList.add('outset');
    this.isOpen = false;
  }
}
