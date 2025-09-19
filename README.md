# TaskList - Mobile Todo App

A beautiful, feature-rich mobile web application for managing your tasks, built with vanilla HTML, CSS, and JavaScript. 

## ✨ Features

- ✅ **Add & Manage Tasks** - Quick task creation with custom points
- 🎯 **Task Completion** - Click anywhere on a task to toggle completion
- 🏆 **Smart Point System** - Dynamic points based on task complexity
- 📊 **Progress Tracking** - Real-time progress bar with earned/total points
-  **Search & Filter** - Real-time task filtering
- � **JSON Import/Export** - Bulk task management
- 📱 **Mobile-First Design** - Responsive layout optimized for all devices
- � **Local Storage** - Persistent data across sessions
- 🌙 **Dark Mode Support** - Automatic theme switching
- ♿ **WCAG AA Compliant** - Accessible design

##  Quick Start

1. Open `index.html` in your web browser
2. Start adding tasks using the input field
3. Click on tasks to mark them complete
4. Use the search bar to filter tasks

## 🎮 Usage

### Adding Tasks
- Type your task and optionally set points
- Press Enter or click the plus button
- **Shortcut**: `Ctrl/Cmd + Enter`

### Managing Tasks
- **Complete**: Click anywhere on the task
- **Delete**: Hover and click the trash icon
- **Search**: Use the search bar above the table
- **Import/Export**: Use JSON buttons for backup

### Point System
- **Auto-calculation**: Based on task complexity (5-25 points)
- **Custom Points**: Override by setting specific values
- **Progress**: Visual progress bar tracks completion

## 🏗️ Technical Details

### File Structure
```
todolist/
├── index.html          # Main application
├── styles.css          # GitHub-inspired styling
├── script.js           # Application logic
├── manifest.json       # PWA manifest
├── sw.js               # Service worker
└── sample-tasks.json   # Example data
```

### Browser Support
- Chrome 60+, Safari 12+, Firefox 55+, Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Features

- Touch-optimized interactions
- PWA support (install as native app)
- Responsive design for all screen sizes
- Hidden scrollbars for clean interface

## 📊 Data Format

Tasks are stored as JSON objects:
```json
{
    "id": "unique-id",
    "text": "Task description", 
    "completed": false,
    "points": 15
}
```

## 🚀 Deployment

Deploy to any static hosting service - no build process required!

## 📝 License

MIT License - Open source and free to use.

---

*A modern, accessible task management app built with vanilla web technologies.*