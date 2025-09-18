# TaskList - Mobile Todo App

A beautiful, feature-rich mobile web application for managing your tasks, built with vanilla HTML, CSS, and JavaScript. Inspired by GitHub's design system and optimized for mobile devices.

## ✨ Features

### Core Functionality
- ✅ **Add & Manage Tasks** - Quick task creation with intuitive interface
- 🎯 **Task Completion** - Click anywhere on a task to toggle completion
- 📊 **Progress Tracking** - Real-time progress bar and points system
- 💾 **Local Storage** - Persistent data storage across sessions
- 🔍 **Search & Filter** - Real-time task filtering with search functionality

### Advanced Features
- 🖱️ **Drag & Drop Reordering** - Intuitive task reordering (desktop & mobile)
- 📱 **Touch-Optimized** - Smooth touch interactions for mobile devices
- 📥 **JSON Import/Export** - Bulk task management with JSON files
- ⌨️ **Keyboard Shortcuts** - Power user efficiency features
- 🌙 **Dark Mode Support** - Automatic theme switching based on system preference

### Mobile-First Design
- 📱 **Responsive Layout** - Optimized for all screen sizes
- 🎨 **GitHub Design System** - Professional, clean interface
- ⚡ **PWA Ready** - Install as a native app on mobile devices
- 🔔 **Toast Notifications** - User-friendly feedback system

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Start adding tasks using the input field
3. Click on tasks to mark them as complete
4. Use the search bar to filter your tasks

### Installation as PWA
1. Open the app in Chrome/Safari on mobile
2. Tap "Add to Home Screen" when prompted
3. Launch from your home screen like a native app

## 🎮 Usage Guide

### Adding Tasks
- Type your task in the "Add new task" field
- Click the plus button or press Enter to add
- **Keyboard Shortcut**: `Ctrl/Cmd + Enter` (from anywhere)

### Managing Tasks
- **Complete Task**: Click anywhere on the task
- **Reorder Tasks**: Drag tasks using the handle (≡) icon
- **Search Tasks**: Use the search bar at the bottom
- **Clear Search**: Press `Escape` while in search field

### Import/Export
- **Export**: Click "Export JSON" to download your tasks
- **Import**: Click "Import JSON" and select a JSON file
- Use `sample-tasks.json` to test the import functionality

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter` - Focus input or add current task
- `Ctrl/Cmd + F` - Focus search field
- `Escape` - Clear search (when search is focused)

## 🏗️ Technical Details

### Architecture
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage API
- **PWA**: Service Worker for offline functionality
- **Design**: GitHub design system with CSS custom properties

### File Structure
```
todolist/
├── index.html          # Main application HTML
├── styles.css          # Complete styling with GitHub theme
├── script.js           # Full application logic
├── manifest.json       # PWA manifest
├── sw.js               # Service worker for offline support
├── sample-tasks.json   # Example tasks for import testing
└── README.md           # This documentation
```

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Safari 12+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Optimization

### Touch Interactions
- Large touch targets (minimum 44px)
- Smooth scrolling and animations
- Touch-based drag and drop
- Optimized keyboard behavior

### Performance
- Lightweight vanilla JavaScript (~8KB)
- CSS-only animations
- Efficient DOM manipulation
- Local storage for instant loading

## 🎨 Design System

### Colors (GitHub Theme)
- **Primary**: #0366d6 (GitHub blue)
- **Success**: #1f883d (Green for completed tasks)
- **Text**: #24292f (Primary text)
- **Background**: #ffffff (Light), #0d1117 (Dark)

### Typography
- **Font**: System fonts (-apple-system, Segoe UI, etc.)
- **Sizes**: 12px - 24px responsive scale
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

## 📊 Data Format

### Task Object Structure
```json
{
    "id": "unique-identifier",
    "text": "Task description",
    "completed": false,
    "createdAt": "2025-09-18T10:00:00.000Z",
    "completedAt": null
}
```

### JSON Import Format
Tasks should be provided as an array of task objects:
```json
[
    {
        "text": "Complete project documentation",
        "completed": false
    },
    {
        "text": "Review code changes",
        "completed": true
    }
]
```

## 🔧 Customization

### Changing Colors
Edit CSS custom properties in `:root` selector in `styles.css`:
```css
:root {
    --color-accent-emphasis: #your-color;
    --color-success-emphasis: #your-success-color;
}
```

### Modifying Point System
Update the points calculation in `script.js`:
```javascript
const points = completedTasks * 10; // Change multiplier here
```

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

### Local Development
Simply open `index.html` in your browser - no build process required!

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🙏 Acknowledgments

- Inspired by GitHub's design system
- Icons from GitHub's Octicons
- Modern web standards and best practices
AI generated todolist application thingie.
