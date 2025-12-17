import type { FileHandler, FileType } from '@/types';

// Handler registry
const handlers: Map<FileType, FileHandler> = new Map();

/**
 * Register a file handler
 */
export function registerHandler(handler: FileHandler) {
  handlers.set(handler.type, handler);
}

/**
 * Get handler for a file type
 */
export function getHandler(type: FileType): FileHandler | undefined {
  return handlers.get(type);
}

/**
 * Get all registered handlers
 */
export function getAllHandlers(): Map<FileType, FileHandler> {
  return handlers;
}

// Import and register all handlers
import { FolderHandler } from './FolderHandler';
import { MarkdownHandler } from './MarkdownHandler';
import { ImageHandler } from './ImageHandler';
import { VideoHandler } from './VideoHandler';
import { AudioHandler } from './AudioHandler';
import { LinkHandler } from './LinkHandler';

export function registerAllHandlers() {
  registerHandler(FolderHandler);
  registerHandler(MarkdownHandler);
  registerHandler(ImageHandler);
  registerHandler(VideoHandler);
  registerHandler(AudioHandler);
  registerHandler(LinkHandler);
}

export { FolderHandler, MarkdownHandler, ImageHandler, VideoHandler, AudioHandler, LinkHandler };
