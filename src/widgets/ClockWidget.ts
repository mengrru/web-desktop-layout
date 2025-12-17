import type { Widget } from '@/types';

let calendarElement: HTMLElement | null = null;
let currentDate = new Date();

function createCalendar(anchorElement: HTMLElement): HTMLElement {
  const calendar = document.createElement('div');
  calendar.className = 'calendar-popup outset';
  
  updateCalendarContent(calendar);
  
  // Position above the clock widget
  const rect = anchorElement.getBoundingClientRect();
  calendar.style.position = 'fixed';
  calendar.style.bottom = `${window.innerHeight - rect.top + 4}px`;
  calendar.style.right = `${window.innerWidth - rect.right}px`;
  
  return calendar;
}

function updateCalendarContent(calendar: HTMLElement) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Build calendar grid
  let daysHtml = '';
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    daysHtml += '<span class="calendar-day empty"></span>';
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = today.getFullYear() === year && 
                    today.getMonth() === month && 
                    today.getDate() === day;
    daysHtml += `<span class="calendar-day${isToday ? ' today' : ''}">${day}</span>`;
  }
  
  calendar.innerHTML = `
    <div class="calendar-header">
      <button class="calendar-nav-btn win98-btn" data-action="prev-year">«</button>
      <button class="calendar-nav-btn win98-btn" data-action="prev-month">‹</button>
      <span class="calendar-title">${year}年 ${monthNames[month]}</span>
      <button class="calendar-nav-btn win98-btn" data-action="next-month">›</button>
      <button class="calendar-nav-btn win98-btn" data-action="next-year">»</button>
    </div>
    <div class="calendar-weekdays">
      ${dayNames.map(d => `<span class="calendar-weekday">${d}</span>`).join('')}
    </div>
    <div class="calendar-days">
      ${daysHtml}
    </div>
    <div class="calendar-footer">
      <button class="calendar-today-btn win98-btn" data-action="today">今天</button>
    </div>
  `;
  
  // Add navigation event listeners
  calendar.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = (btn as HTMLElement).dataset.action;
      
      switch (action) {
        case 'prev-year':
          currentDate.setFullYear(currentDate.getFullYear() - 1);
          break;
        case 'prev-month':
          currentDate.setMonth(currentDate.getMonth() - 1);
          break;
        case 'next-month':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'next-year':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        case 'today':
          currentDate = new Date();
          break;
      }
      
      updateCalendarContent(calendar);
    });
  });
}

function closeCalendar() {
  if (calendarElement) {
    calendarElement.remove();
    calendarElement = null;
  }
  document.removeEventListener('click', handleOutsideClick);
}

function handleOutsideClick(e: MouseEvent) {
  if (calendarElement && !calendarElement.contains(e.target as Node)) {
    closeCalendar();
  }
}

export const ClockWidget: Widget = {
  id: 'clock',

  render(): string {
    return `<span class="clock-display">00:00</span>`;
  },

  init(element: HTMLElement, options?: Record<string, unknown>) {
    const format = (options?.format as string) || 'HH:mm';
    const display = element.querySelector('.clock-display') as HTMLElement;
    
    const updateClock = () => {
      const now = new Date();
      let timeStr = '';
      
      if (format === 'HH:mm:ss') {
        timeStr = now.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        });
      } else {
        timeStr = now.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      if (display) {
        display.textContent = timeStr;
      }
    };

    // Update immediately
    updateClock();
    
    // Update every second
    const intervalId = window.setInterval(updateClock, 1000);
    
    // Store interval ID for cleanup
    (element as HTMLElement & { _clockInterval?: number })._clockInterval = intervalId;
    
    // Store element reference for onClick
    (element as HTMLElement & { _widgetElement?: HTMLElement })._widgetElement = element;
  },

  onClick() {
    // Toggle calendar
    if (calendarElement) {
      closeCalendar();
      return;
    }
    
    // Find the widget element (tray widget container)
    const trayWidget = document.querySelector('.tray-widget[data-widget-id="clock"]') as HTMLElement;
    if (!trayWidget) return;
    
    // Reset to current date when opening
    currentDate = new Date();
    
    // Create and show calendar
    calendarElement = createCalendar(trayWidget);
    document.body.appendChild(calendarElement);
    
    // Add outside click listener (delayed to avoid immediate close)
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);
  },

  destroy() {
    closeCalendar();
  }
};
