import type { Filter } from '@/types';

export const ScanlineFilter: Filter = {
  id: 'scanline',
  name: '扫描线',

  apply(container: HTMLElement, options?: Record<string, unknown>) {
    const opacity = (options?.opacity as number) || 0.05;
    
    // Remove existing scanline if any
    const existing = container.querySelector('.scanline-effect');
    if (existing) {
      existing.remove();
    }

    const scanline = document.createElement('div');
    scanline.className = 'scanline-effect';
    scanline.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, ${opacity}) 50%),
        linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
      background-size: 100% 4px, 6px 100%;
      pointer-events: none;
    `;
    
    container.appendChild(scanline);
  },

  remove(container: HTMLElement) {
    const scanline = container.querySelector('.scanline-effect');
    if (scanline) {
      scanline.remove();
    }
  }
};
