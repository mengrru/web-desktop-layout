import type { FileHandler, FileItem, FileHandlerResult } from '@/types';
import { marked } from 'marked';

const ICON_BASE = 'https://win98icons.alexmeub.com/icons/png/';

export const MarkdownHandler: FileHandler = {
  type: 'markdown',
  defaultIcon: `${ICON_BASE}notepad-5.png`,

  async open(file: FileItem): Promise<FileHandlerResult> {
    let content = '';

    if (file.src) {
      try {
        // Handle relative paths with base URL
        const url = file.src.startsWith('http') 
          ? file.src 
          : `${import.meta.env.BASE_URL}${file.src.replace(/^\//, '')}`;
        const response = await fetch(url);
        if (response.ok) {
          const mdText = await response.text();
          content = await marked(mdText);
        } else {
          content = '<p>无法加载文件内容</p>';
        }
      } catch (error) {
        console.error('Error loading markdown:', error);
        content = '<p>加载文件时出错</p>';
      }
    }

    return {
      title: file.name,
      content: `<div class="md-content">${content}</div>`,
      windowSize: file.windowSize || { width: 500, height: 400 }
    };
  }
};
