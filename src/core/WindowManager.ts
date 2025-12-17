import type { FileItem, WindowState, WindowSize } from '@/types';
import { getHandler } from '@/file-handlers';

/**
 * Window manager for creating, managing, and manipulating windows
 */
export class WindowManager {
  private windows: Map<string, WindowState> = new Map();
  private zIndexCounter = 100;
  private dragState: {
    window: HTMLElement | null;
    offsetX: number;
    offsetY: number;
  } = { window: null, offsetX: 0, offsetY: 0 };
  private defaultWindowSize: WindowSize = { width: 400, height: 300 };

  private onWindowsChangeCallbacks: Array<() => void> = [];

  init() {
    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
  }

  setDefaultWindowSize(size: WindowSize) {
    this.defaultWindowSize = size;
  }

  onWindowsChange(callback: () => void) {
    this.onWindowsChangeCallbacks.push(callback);
  }

  private notifyWindowsChange() {
    this.onWindowsChangeCallbacks.forEach(cb => cb());
  }

  async openFile(file: FileItem) {
    // Check if window already exists
    if (this.windows.has(file.id)) {
      this.restoreWindow(file.id);
      return;
    }

    const handler = getHandler(file.type);
    if (!handler) {
      console.error(`No handler for file type: ${file.type}`);
      return;
    }

    const result = await handler.open(file);
    this.createWindow(file, result);
  }

  private createWindow(
    file: FileItem,
    result: { title: string; content: string | HTMLElement; windowSize?: WindowSize; onMount?: (el: HTMLElement) => void; onDestroy?: () => void }
  ) {
    const windowSize = file.windowSize || result.windowSize || this.defaultWindowSize;
    const win = document.createElement('div');
    win.className = 'window outset active';
    win.id = `win-${file.id}`;
    win.style.zIndex = String(++this.zIndexCounter);
    win.style.width = `${windowSize.width}px`;
    win.style.height = `${windowSize.height}px`;

    // Random position offset
    const posX = 50 + Math.random() * 100;
    const posY = 50 + Math.random() * 100;
    win.style.left = `${posX}px`;
    win.style.top = `${posY}px`;

    const handler = getHandler(file.type);
    const iconUrl = file.icon || handler?.defaultIcon || '';

    win.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-left">
          ${iconUrl ? `<img src="${iconUrl}" class="title-bar-icon" draggable="false">` : ''}
          <span class="title-bar-text">${result.title}</span>
        </div>
        <div class="title-bar-controls">
          <button class="btn-minimize" title="最小化"></button>
          <button class="btn-maximize" title="最大化"></button>
          <button class="btn-close" title="关闭"></button>
        </div>
      </div>
      <div class="window-content inset"></div>
    `;

    // Add content
    const contentEl = win.querySelector('.window-content')!;
    if (typeof result.content === 'string') {
      contentEl.innerHTML = result.content;
    } else {
      contentEl.appendChild(result.content);
    }

    // Event listeners
    const titleBar = win.querySelector('.title-bar') as HTMLElement;
    titleBar.addEventListener('mousedown', (e) => this.onDragStart(e, file.id));

    win.querySelector('.btn-minimize')?.addEventListener('click', () => this.minimizeWindow(file.id));
    win.querySelector('.btn-maximize')?.addEventListener('click', () => this.maximizeWindow(file.id));
    win.querySelector('.btn-close')?.addEventListener('click', () => this.closeWindow(file.id));

    win.addEventListener('mousedown', () => this.bringToFront(file.id));

    document.body.appendChild(win);

    // Store window state
    this.windows.set(file.id, {
      id: file.id,
      element: win,
      minimized: false,
      file,
      zIndex: this.zIndexCounter,
      onDestroy: result.onDestroy
    });

    // Call onMount if provided
    if (result.onMount) {
      result.onMount(win);
    }

    // Deactivate other windows
    this.updateActiveWindow(file.id);
    this.notifyWindowsChange();
  }

  closeWindow(id: string) {
    const state = this.windows.get(id);
    if (!state) return;

    state.onDestroy?.();
    state.element.remove();
    this.windows.delete(id);
    this.notifyWindowsChange();
  }

  minimizeWindow(id: string) {
    const state = this.windows.get(id);
    if (!state) return;

    state.element.style.display = 'none';
    state.minimized = true;
    this.notifyWindowsChange();
  }

  restoreWindow(id: string) {
    const state = this.windows.get(id);
    if (!state) return;

    state.element.style.display = 'flex';
    state.minimized = false;
    this.bringToFront(id);
    this.notifyWindowsChange();
  }

  maximizeWindow(id: string) {
    const state = this.windows.get(id);
    if (!state) return;

    const el = state.element;
    if (el.dataset.maximized === 'true') {
      // Restore
      el.style.width = el.dataset.prevWidth || '';
      el.style.height = el.dataset.prevHeight || '';
      el.style.top = el.dataset.prevTop || '50px';
      el.style.left = el.dataset.prevLeft || '50px';
      el.dataset.maximized = 'false';
    } else {
      // Maximize
      el.dataset.prevWidth = el.style.width;
      el.dataset.prevHeight = el.style.height;
      el.dataset.prevTop = el.style.top;
      el.dataset.prevLeft = el.style.left;
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = 'calc(100vh - var(--taskbar-height))';
      el.dataset.maximized = 'true';
    }
  }

  bringToFront(id: string) {
    const state = this.windows.get(id);
    if (!state) return;

    state.zIndex = ++this.zIndexCounter;
    state.element.style.zIndex = String(this.zIndexCounter);
    this.updateActiveWindow(id);
    this.notifyWindowsChange();
  }

  private updateActiveWindow(activeId: string) {
    this.windows.forEach((state, id) => {
      if (id === activeId) {
        state.element.classList.add('active');
      } else {
        state.element.classList.remove('active');
      }
    });
  }

  // Drag handlers
  private onDragStart(e: MouseEvent, id: string) {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();

    const state = this.windows.get(id);
    if (!state) return;

    this.dragState.window = state.element;
    const rect = state.element.getBoundingClientRect();
    this.dragState.offsetX = e.clientX - rect.left;
    this.dragState.offsetY = e.clientY - rect.top;

    this.bringToFront(id);
  }

  private onDragMove(e: MouseEvent) {
    if (!this.dragState.window) return;

    let x = e.clientX - this.dragState.offsetX;
    let y = e.clientY - this.dragState.offsetY;

    // Prevent dragging above viewport
    if (y < 0) y = 0;

    this.dragState.window.style.left = `${x}px`;
    this.dragState.window.style.top = `${y}px`;
  }

  private onDragEnd() {
    this.dragState.window = null;
  }

  // Getters
  getWindows(): Map<string, WindowState> {
    return this.windows;
  }

  getTopWindow(): WindowState | null {
    let topWindow: WindowState | null = null;
    let maxZ = -1;

    this.windows.forEach(state => {
      if (!state.minimized && state.zIndex > maxZ) {
        maxZ = state.zIndex;
        topWindow = state;
      }
    });

    return topWindow;
  }
}
