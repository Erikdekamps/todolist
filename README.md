# TaskList - Mobile Todo App

A beautiful, feature-rich mobile web application for managing your tasks, built with vanilla HTML, CSS, and JavaScript. 

# TaskList - Drag & Drop Todo App

A feature-rich task management web application with drag-and-drop sorting, built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

- ✅ **Add & Manage Tasks** - Quick task creation with custom points
- 🎯 **Task Completion** - Click task text to toggle completion status
- 🔄 **Drag & Drop Sorting** - Reorder tasks by dragging rows (desktop and mobile)
- 🗑️ **Delete Tasks** - Remove tasks with dedicated delete buttons
- 🏆 **Point System** - Assign custom points to track task value/difficulty
- 📊 **Progress Tracking** - Real-time progress bar with completed/total points
- 🔍 **Advanced Filtering** - Search by task text and filter by area/points
- 📥 **JSON Import/Export** - Bulk task management and data backup
- 📱 **Mobile-Optimized** - Touch-friendly drag and drop on mobile devices
- 💾 **Local Storage** - Persistent data across browser sessions
- ♿ **WCAG AA Compliant** - Accessible design with proper contrast
- 🎮 **RuneScape-Themed** - Clean table-based interface with medieval color scheme
- 🛠️ **Developer Tools** - Cache clearing for development

##  Quick Start

1. Open `index.html` in your web browser
2. Start adding tasks using the input field
3. Click on tasks to mark them complete
4. Use the search bar to filter tasks

## 🎮 Usage

### Adding Tasks
- Type your task description in the input field
- Optionally assign custom points (defaults to auto-calculation)
- Press Enter or click the plus button to add
- **Shortcut**: `Ctrl/Cmd + Enter`

### Managing Tasks
- **Complete**: Click on the task text to toggle completion
- **Delete**: Click the red delete button (🗑️) in each row
- **Reorder**: Drag tasks by the handle (⋮⋮) to sort them
- **Search**: Use the search bar to filter by task text
- **Filter**: Use table header inputs to filter by area or points

### Drag & Drop Features
- **Desktop**: Click and drag the drag handle (⋮⋮) to reorder
- **Mobile**: Touch and drag support for mobile devices
- **Visual Feedback**: Tasks highlight during drag operations
- **Smooth Animations**: Seamless reordering with visual transitions

### Point System
- **Custom Points**: Set specific point values for tasks
- **Auto-calculation**: Leave blank for automatic point assignment
- **Progress Tracking**: Visual progress bar shows completion ratio
- **Filtering**: Filter tasks by point ranges in table headers

### Data Management
- **Import**: Upload JSON files with task data
- **Export**: Download current tasks as JSON backup
- **Local Storage**: Automatic saving of all changes
- **Cache Control**: Developer button to clear browser cache

## 🏗️ Technical Details

### File Structure
```
todolist/
├── index.html          # Main application structure
├── styles.css          # RuneScape-themed styling with drag/drop support
├── script.js           # Core logic with drag-and-drop functionality
├── manifest.json       # PWA manifest for mobile installation
├── sw.js               # Service worker for offline support
└── sample-tasks.json   # Example task data
```

### Key Technologies
- **Vanilla JavaScript** - No frameworks, pure ES6+ code
- **HTML5 Drag & Drop API** - Desktop drag and drop support
- **Touch Events** - Mobile drag and drop implementation
- **CSS Grid & Flexbox** - Responsive table-based layout
- **Local Storage API** - Client-side data persistence
- **Service Workers** - PWA capabilities and caching

### Browser Support
- Chrome 60+, Safari 12+, Firefox 55+, Edge 79+
- Mobile browsers with touch event support
- Drag and drop on both desktop and mobile devices

## 📱 Mobile Features

- Touch-optimized drag and drop interactions
- PWA support (install as native app from browser)
- Responsive table layout for all screen sizes
- Touch-friendly delete and completion buttons
- Smooth drag animations on mobile devices

## 📊 Data Format

Tasks are stored as JSON objects with the following structure:
```json
{
    "id": "unique-id-string",
    "text": "Task description", 
    "completed": false,
    "points": 15,
    "area": "Work"
}
```

### Import/Export
- Export current tasks as JSON file for backup
- Import JSON files to restore or bulk-add tasks
- Supports drag-and-drop file uploads
- Automatic validation of imported data structure

## 🚀 Deployment

Deploy to any static hosting service - no build process required!

## 📝 License

MIT License - Open source and free to use.

---

*A modern, feature-rich task management app with drag-and-drop sorting, built with vanilla web technologies and optimized for both desktop and mobile use.*