import type { FileHandler, FileItem, FileHandlerResult, FolderItem } from '@/types';
import { getHandler } from './index';

const ICON_BASE = 'https://win98icons.alexmeub.com/icons/png/';

export const FolderHandler: FileHandler = {
  type: 'folder',
  defaultIcon: `${ICON_BASE}directory_closed-4.png`,

  open(file: FileItem): FileHandlerResult {
    const folderFile = file as FolderItem;
    const viewMode = folderFile.viewMode || 'icon';
    
    const container = document.createElement('div');
    container.className = `folder-view${viewMode === 'list' ? ' list-view' : ''}`;

    return {
      title: file.name,
      content: container,
      windowSize: file.windowSize || { width: 500, height: 400 },
      onMount: () => {
        // Render children after mount
        const children = folderFile.children || [];
        children.forEach(child => {
          const item = createFolderItem(child);
          container.appendChild(item);
        });
      }
    };
  }
};

function createFolderItem(file: FileItem): HTMLElement {
  const handler = getHandler(file.type);
  const iconUrl = file.icon || handler?.defaultIcon || '';

  const div = document.createElement('div');
  div.className = 'folder-item';
  div.dataset.fileId = file.id;

  div.innerHTML = `
    <img src="${iconUrl}" draggable="false" alt="${file.name}">
    <span>${file.name}</span>
  `;

  // Single click - select
  div.addEventListener('click', (e) => {
    e.stopPropagation();
    // Deselect siblings
    div.parentElement?.querySelectorAll('.folder-item').forEach(el => {
      el.classList.remove('selected');
    });
    div.classList.add('selected');
  });

  // Double click - open
  div.addEventListener('dblclick', async (e) => {
    e.stopPropagation();
    
    // Link type opens in new tab
    if (file.type === 'link' && file.src) {
      window.open(file.src, '_blank');
      return;
    }

    // Import WindowManager dynamically to avoid circular dependency
    const { WindowManager } = await import('@/core/WindowManager');
    // Get the singleton instance from window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = (window as any).app;
    if (app?.windowManager) {
      app.windowManager.openFile(file);
    } else {
      // Fallback: create new instance (not ideal but works)
      const wm = new WindowManager();
      wm.openFile(file);
    }
  });

  return div;
}
