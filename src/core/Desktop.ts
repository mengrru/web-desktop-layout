import type { DesktopConfig, FileItem } from '@/types';
import { WindowManager } from './WindowManager';
import { getHandler } from '@/file-handlers';

/**
 * Desktop manager for rendering and managing desktop icons
 */
export class Desktop {
  private container: HTMLElement | null = null;
  private windowManager: WindowManager;
  private selectedIcon: HTMLElement | null = null;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
  }

  init(config: DesktopConfig) {
    this.container = document.getElementById('desktop');
    if (!this.container) {
      console.error('Desktop container not found');
      return;
    }

    this.render(config.items);
    this.setupEventListeners();
  }

  private render(items: FileItem[]) {
    if (!this.container) return;
    this.container.innerHTML = '';

    items.forEach(item => {
      const icon = this.createIcon(item);
      this.container!.appendChild(icon);
    });
  }

  private createIcon(file: FileItem): HTMLElement {
    const handler = getHandler(file.type);
    const iconUrl = file.icon || handler?.defaultIcon || '';

    const div = document.createElement('div');
    div.className = 'desktop-icon';
    div.dataset.fileId = file.id;

    div.innerHTML = `
      <img src="${iconUrl}" draggable="false" alt="${file.name}">
      <span>${file.name}</span>
    `;

    // Single click - select
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectIcon(div);
    });

    // Double click - open
    div.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.openFile(file);
    });

    return div;
  }

  private selectIcon(icon: HTMLElement) {
    // Deselect previous
    if (this.selectedIcon) {
      this.selectedIcon.classList.remove('selected');
    }

    // Select new
    icon.classList.add('selected');
    this.selectedIcon = icon;
  }

  private openFile(file: FileItem) {
    // Link type opens in new tab
    if (file.type === 'link' && file.src) {
      window.open(file.src, '_blank');
      return;
    }

    this.windowManager.openFile(file);
  }

  private setupEventListeners() {
    // Click on desktop to deselect
    this.container?.addEventListener('click', (e) => {
      if (e.target === this.container && this.selectedIcon) {
        this.selectedIcon.classList.remove('selected');
        this.selectedIcon = null;
      }
    });
  }
}
