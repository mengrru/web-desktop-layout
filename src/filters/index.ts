import type { Filter, FilterConfig } from '@/types';

// Filter registry
const filters: Map<string, Filter> = new Map();

/**
 * Register a filter
 */
export function registerFilter(filter: Filter) {
  filters.set(filter.id, filter);
}

/**
 * Get filter by id
 */
export function getFilter(id: string): Filter | undefined {
  return filters.get(id);
}

// Import and register built-in filters
import { ScanlineFilter } from './ScanlineFilter';

function registerBuiltinFilters() {
  registerFilter(ScanlineFilter);
}

/**
 * Filter manager for applying visual filters
 */
export class FilterManager {
  private activeFilters: Set<string> = new Set();
  private filterOverlay: HTMLElement | null = null;

  constructor() {
    registerBuiltinFilters();
  }

  applyFilters(configs: FilterConfig[]) {
    // Create filter overlay if not exists
    if (!this.filterOverlay) {
      this.filterOverlay = document.createElement('div');
      this.filterOverlay.id = 'filter-overlay';
      this.filterOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99999;
      `;
      document.body.appendChild(this.filterOverlay);
    }

    // Apply enabled filters
    configs.filter(c => c.enabled).forEach(config => {
      const filter = getFilter(config.id);
      if (!filter) {
        console.warn(`Filter not found: ${config.id}`);
        return;
      }

      filter.apply(this.filterOverlay!, config.options);
      this.activeFilters.add(config.id);
    });
  }

  removeFilter(id: string) {
    const filter = getFilter(id);
    if (filter && this.filterOverlay && this.activeFilters.has(id)) {
      filter.remove(this.filterOverlay);
      this.activeFilters.delete(id);
    }
  }

  removeAllFilters() {
    this.activeFilters.forEach(id => this.removeFilter(id));
  }
}
