import type { FileHandler, FileItem, FileHandlerResult } from '@/types';

const ICON_BASE = 'https://win98icons.alexmeub.com/icons/png/';

export const LinkHandler: FileHandler = {
  type: 'link',
  defaultIcon: `${ICON_BASE}world-3.png`,

  open(file: FileItem): FileHandlerResult {
    // Links should open in new tab, but this is a fallback
    if (file.src) {
      window.open(file.src, '_blank');
    }

    return {
      title: file.name,
      content: `<div style="padding: 20px; text-align: center;">
        <p>正在打开链接...</p>
        <p><a href="${file.src}" target="_blank">${file.src}</a></p>
      </div>`,
      windowSize: { width: 300, height: 150 }
    };
  }
};
