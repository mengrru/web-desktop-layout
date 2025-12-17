/** File types */
export type FileType = 'folder' | 'image' | 'video' | 'audio' | 'link' | 'markdown' | string;

/** Window size configuration */
export interface WindowSize {
  width: number;
  height: number;
}

/** Base file/folder configuration */
export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  icon?: string;
  src?: string;
  windowSize?: WindowSize;
}

/** Folder configuration */
export interface FolderItem extends FileItem {
  type: 'folder';
  viewMode?: 'icon' | 'list';
  children: FileItem[];
}

/** Desktop configuration */
export interface DesktopConfig {
  items: FileItem[];
}

/** Menu item types */
export type MenuItemType = FileType | 'submenu' | 'separator' | 'action';

/** Start menu item (supports nesting) */
export interface MenuItem {
  id: string;
  name?: string;
  icon?: string;
  type: MenuItemType;
  src?: string;
  action?: string;
  children?: MenuItem[];
}

/** Start menu configuration */
export interface StartMenuConfig {
  sideText?: string;
  items: MenuItem[];
}

/** Widget configuration */
export interface WidgetConfig {
  id: string;
  enabled: boolean;
  options?: Record<string, unknown>;
}

/** Filter configuration */
export interface FilterConfig {
  id: string;
  enabled: boolean;
  options?: Record<string, unknown>;
}

/** Wallpaper configuration */
export interface WallpaperConfig {
  type: 'image' | 'generated';
  src?: string;
  generator?: string;
}

/** Global settings */
export interface SettingsConfig {
  wallpaper: WallpaperConfig;
  filters: FilterConfig[];
  widgets: WidgetConfig[];
  defaultWindowSize: WindowSize;
  theme?: string;
}

/** File handler result */
export interface FileHandlerResult {
  title: string;
  content: string | HTMLElement;
  windowSize?: WindowSize;
  onMount?: (windowEl: HTMLElement) => void;
  onDestroy?: () => void;
}

/** File handler interface */
export interface FileHandler {
  type: FileType;
  defaultIcon: string;
  open(file: FileItem): Promise<FileHandlerResult> | FileHandlerResult;
}

/** Widget interface */
export interface Widget {
  id: string;
  render(): string | HTMLElement;
  init?(element: HTMLElement, options?: Record<string, unknown>): void;
  onClick?(): void;
  destroy?(): void;
}

/** Filter interface */
export interface Filter {
  id: string;
  name: string;
  apply(container: HTMLElement, options?: Record<string, unknown>): void;
  remove(container: HTMLElement): void;
}

/** Window state */
export interface WindowState {
  id: string;
  element: HTMLElement;
  minimized: boolean;
  file: FileItem;
  zIndex: number;
  onDestroy?: () => void;
}
