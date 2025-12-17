import type { WindowState } from '@/types';
import { WindowManager } from './WindowManager';

/**
 * Taskbar manager for task list and system tray
 */
export class Taskbar {
  private taskList: HTMLElement | null = null;
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
  }

  init() {
    this.taskList = document.getElementById('task-list');
    
    // Listen for window changes
    this.windowManager.onWindowsChange(() => this.updateTaskList());
  }

  private updateTaskList() {
    if (!this.taskList) return;
    this.taskList.innerHTML = '';

    const windows = this.windowManager.getWindows();
    const topWindow = this.windowManager.getTopWindow();

    windows.forEach((state) => {
      const item = this.createTaskItem(state, topWindow?.id === state.id && !state.minimized);
      this.taskList!.appendChild(item);
    });
  }

  private createTaskItem(state: WindowState, isActive: boolean): HTMLElement {
    const item = document.createElement('div');
    item.className = `task-item outset${isActive ? ' active inset' : ''}`;

    const iconUrl = state.file.icon || '';
    item.innerHTML = `
      ${iconUrl ? `<img src="${iconUrl}" draggable="false">` : ''}
      <span>${state.file.name}</span>
    `;

    item.addEventListener('click', () => {
      if (state.minimized || !isActive) {
        this.windowManager.restoreWindow(state.id);
      } else {
        this.windowManager.minimizeWindow(state.id);
      }
    });

    return item;
  }
}
