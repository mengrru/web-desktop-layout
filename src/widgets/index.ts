import type { Widget, WidgetConfig } from '@/types';

// Widget registry
const widgets: Map<string, Widget> = new Map();

/**
 * Register a widget
 */
export function registerWidget(widget: Widget) {
  widgets.set(widget.id, widget);
}

/**
 * Get widget by id
 */
export function getWidget(id: string): Widget | undefined {
  return widgets.get(id);
}

// Import and register built-in widgets
import { ClockWidget } from './ClockWidget';

function registerBuiltinWidgets() {
  registerWidget(ClockWidget);
}

/**
 * Widget manager for initializing and managing tray widgets
 */
export class WidgetManager {
  private activeWidgets: Map<string, { widget: Widget; element: HTMLElement }> = new Map();
  private trayElement: HTMLElement | null = null;

  init(configs: WidgetConfig[]) {
    registerBuiltinWidgets();
    
    this.trayElement = document.getElementById('tray');
    if (!this.trayElement) {
      console.error('Tray element not found');
      return;
    }

    // Clear existing content
    this.trayElement.innerHTML = '';

    // Initialize enabled widgets
    configs.filter(c => c.enabled).forEach(config => {
      const widget = getWidget(config.id);
      if (!widget) {
        console.warn(`Widget not found: ${config.id}`);
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'tray-widget';
      wrapper.dataset.widgetId = config.id;

      const content = widget.render();
      if (typeof content === 'string') {
        wrapper.innerHTML = content;
      } else {
        wrapper.appendChild(content);
      }

      // Add click handler
      if (widget.onClick) {
        wrapper.addEventListener('click', () => widget.onClick!());
      }

      this.trayElement!.appendChild(wrapper);

      // Initialize widget
      if (widget.init) {
        widget.init(wrapper, config.options);
      }

      this.activeWidgets.set(config.id, { widget, element: wrapper });
    });
  }

  destroy() {
    this.activeWidgets.forEach(({ widget }) => {
      widget.destroy?.();
    });
    this.activeWidgets.clear();
  }
}
