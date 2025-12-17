import type { FileHandler, FileItem, FileHandlerResult } from '@/types';

const ICON_BASE = 'https://win98icons.alexmeub.com/icons/png/';

export const ImageHandler: FileHandler = {
  type: 'image',
  defaultIcon: `${ICON_BASE}image_landscape-2.png`,

  open(file: FileItem): FileHandlerResult {
    const container = document.createElement('div');
    container.className = 'image-viewer';

    const img = document.createElement('img');
    // Handle relative paths with base URL
    const src = file.src?.startsWith('http') 
      ? file.src 
      : `${import.meta.env.BASE_URL}${(file.src || '').replace(/^\//, '')}`;
    img.src = src;
    img.alt = file.name;
    img.draggable = false;
    
    container.appendChild(img);

    return {
      title: file.name,
      content: container,
      windowSize: file.windowSize || { width: 500, height: 400 }
    };
  }
};
