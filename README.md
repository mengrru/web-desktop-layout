# Y2K Desktop - Win98 Style Personal Homepage

A Windows 98-style desktop simulator built with TypeScript and Vite.

## Features

- 🖥️ Authentic Win98 UI with 3D borders and gradients
- 📁 File/folder system with icon and list views
- 🖼️ Support for images, videos, audio, markdown, and links
- 📋 Multi-level start menu
- 🧩 Extensible widget system (tray)
- 🎨 Filter system (scanline effect)
- 🎯 Theme support via CSS variables

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── public/
│   ├── config/           # JSON configuration files
│   │   ├── desktop.json  # Desktop items
│   │   ├── startmenu.json # Start menu items
│   │   └── settings.json  # Global settings
│   └── content/
│       └── markdown/     # Markdown files
├── src/
│   ├── core/             # Core modules
│   ├── file-handlers/    # File type handlers
│   ├── widgets/          # Tray widgets
│   ├── filters/          # Visual filters
│   ├── styles/           # CSS modules
│   └── types/            # TypeScript types
```

## Configuration

### Desktop Items (`public/config/desktop.json`)

```json
{
  "items": [
    {
      "id": "unique-id",
      "name": "Display Name",
      "type": "folder|image|video|audio|link|markdown",
      "icon": "optional-icon-url",
      "src": "file-path-or-url",
      "viewMode": "icon|list",  // for folders
      "children": []            // for folders
    }
  ]
}
```

### Start Menu (`public/config/startmenu.json`)

```json
{
  "sideText": "WINDOWS Y2K",
  "items": [
    {
      "id": "unique-id",
      "name": "Menu Item",
      "type": "submenu|separator|action|folder|markdown|...",
      "icon": "icon-url",
      "action": "changeWallpaper|randomWallpaper|shutdown",
      "children": []  // for submenus
    }
  ]
}
```

### Settings (`public/config/settings.json`)

```json
{
  "wallpaper": {
    "type": "generated|image",
    "src": "image-path"
  },
  "filters": [
    { "id": "scanline", "enabled": true }
  ],
  "widgets": [
    { "id": "clock", "enabled": true }
  ],
  "defaultWindowSize": { "width": 400, "height": 300 }
}
```

## Extending

### Adding a new file handler

```typescript
// src/file-handlers/MyHandler.ts
import type { FileHandler } from '@/types';

export const MyHandler: FileHandler = {
  type: 'my-type',
  defaultIcon: 'icon-url',
  open(file) {
    return {
      title: file.name,
      content: '<div>My content</div>',
      windowSize: { width: 400, height: 300 }
    };
  }
};

// Register in src/file-handlers/index.ts
```

### Adding a new widget

```typescript
// src/widgets/MyWidget.ts
import type { Widget } from '@/types';

export const MyWidget: Widget = {
  id: 'my-widget',
  render: () => '<span>Widget</span>',
  init: (el) => { /* setup */ },
  onClick: () => { /* handle click */ }
};
```

## License

MIT
