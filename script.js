// TaskList Mobile Web Application
// Main JavaScript functionality

class TaskListApp {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.draggedElement = null;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isDragging = false;
        
        this.init();
    }

    init() {
        this.loadTasksFromStorage();
        this.migrateTasks(); // Ensure all tasks have points
        this.bindEvents();
        this.renderTasks();
        this.updateProgress();
        this.showToast('Welcome to TaskList!', 'info');
    }

    // Migration function to add points to existing tasks (disabled - now supporting tasks without points)
    migrateTasks() {
        // No longer automatically adding points to tasks without them
        // Tasks can exist without points
    }

    // Event Binding
    bindEvents() {
        // Task form submission
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', this.handleTaskSubmit.bind(this));

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', this.handleSearch.bind(this));

        // Import/Export functionality
        const importButton = document.getElementById('import-button');
        const exportButton = document.getElementById('export-button');
        const fileInput = document.getElementById('json-file-input');

        importButton.addEventListener('click', () => fileInput.click());
        exportButton.addEventListener('click', this.exportTasks.bind(this));
        fileInput.addEventListener('change', this.handleFileImport.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    // Task Management
    handleTaskSubmit(e) {
        e.preventDefault();
        const taskInput = document.getElementById('task-input');
        const areaInput = document.getElementById('area-input');
        const pointsInput = document.getElementById('points-input');
        const taskText = taskInput.value.trim();
        const taskArea = areaInput.value.trim();
        const customPoints = pointsInput.value ? parseInt(pointsInput.value) : null;

        if (taskText) {
            this.addTask(taskText, false, null, customPoints, taskArea);
            taskInput.value = '';
            areaInput.value = '';
            pointsInput.value = '';
            taskInput.focus();
        }
    }

    addTask(text, completed = false, id = null, points = null, area = null) {
        const task = {
            id: id || this.generateId(),
            text: text,
            completed: completed,
            points: points, // Don't default to calculateTaskPoints if points is explicitly null
            area: area || null
        };

        this.tasks.push(task);
        this.saveTasksToStorage();
        this.renderTasks();
        this.updateProgress();
        
        if (!id) {
            this.showToast('Task added successfully!', 'success');
        }
    }

    calculateTaskPoints(text) {
        // Base points calculation based on task complexity/length
        const basePoints = 5;
        const lengthBonus = Math.min(Math.floor(text.length / 10), 10); // Up to 10 bonus points
        
        // Keywords that indicate higher complexity
        const complexityKeywords = ['implement', 'design', 'develop', 'create', 'build', 'optimize', 'analyze', 'research'];
        const hasComplexity = complexityKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
        );
        
        const complexityBonus = hasComplexity ? 10 : 0;
        
        return basePoints + lengthBonus + complexityBonus;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateProgress();
            
            const message = task.completed ? 'Task completed! 🎉' : 'Task reopened';
            this.showToast(message, task.completed ? 'success' : 'info');
        }
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateProgress();
            this.showToast('Task deleted', 'info');
        }
    }

    moveTask(fromIndex, toIndex) {
        if (fromIndex !== toIndex && fromIndex >= 0 && toIndex >= 0 && 
            fromIndex < this.tasks.length && toIndex < this.tasks.length) {
            const task = this.tasks.splice(fromIndex, 1)[0];
            this.tasks.splice(toIndex, 0, task);
            this.saveTasksToStorage();
            this.renderTasks();
        }
    }

    // Search Functionality
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        this.filterTasks(searchTerm);
    }

    filterTasks(searchTerm) {
        const taskElements = document.querySelectorAll('.task-item');
        let visibleCount = 0;

        taskElements.forEach(element => {
            const taskText = element.querySelector('.task-title').textContent.toLowerCase();
            const isVisible = !searchTerm || taskText.includes(searchTerm);
            
            element.classList.toggle('hidden', !isVisible);
            if (isVisible) visibleCount++;
        });

        // Show empty state if no tasks are visible
        this.toggleEmptyState(visibleCount === 0 && searchTerm);
    }

    // Rendering
    renderTasks() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');

        if (this.tasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.add('visible');
            return;
        }

        emptyState.classList.remove('visible');
        taskList.innerHTML = this.tasks.map((task, index) => this.createTaskElement(task, index)).join('');
        
        // Bind events for newly created task elements
        this.bindTaskEvents();
    }

    createTaskElement(task, index) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" 
                 data-task-id="${task.id}" 
                 data-index="${index}"
                 draggable="true">
                <div class="drag-handle" title="Drag to reorder">
                    <svg viewBox="0 0 16 16" width="16" height="16">
                        <path d="M10 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM6 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM10 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM6 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM10 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM6 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                    </svg>
                </div>
                <div class="task-content">
                    ${task.area || (task.points !== null && task.points !== undefined) ? `
                    <div class="task-header">
                        ${task.area ? `<span class="task-area">${this.escapeHtml(task.area)}</span>` : ''}
                        ${(task.points !== null && task.points !== undefined) ? `<span class="task-points ${task.completed ? 'completed' : ''}">${task.points} pts</span>` : ''}
                    </div>
                    ` : ''}
                    <div class="task-title">${this.escapeHtml(task.text)}</div>
                </div>
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     data-task-id="${task.id}"></div>
            </div>
        `;
    }

    bindTaskEvents() {
        // Task click events
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', this.handleTaskClick.bind(this));
            
            // Drag and drop events
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
            item.addEventListener('dragover', this.handleDragOver.bind(this));
            item.addEventListener('drop', this.handleDrop.bind(this));
            
            // Touch events for mobile drag and drop
            item.addEventListener('touchstart', this.handleTouchStart.bind(this));
            item.addEventListener('touchmove', this.handleTouchMove.bind(this));
            item.addEventListener('touchend', this.handleTouchEnd.bind(this));
        });

        // Checkbox events
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', this.handleCheckboxClick.bind(this));
        });
    }

    handleTaskClick(e) {
        if (e.target.closest('.task-checkbox') || e.target.closest('.drag-handle')) {
            return; // Don't toggle when clicking checkbox or drag handle
        }
        
        const taskId = e.currentTarget.dataset.taskId;
        this.toggleTask(taskId);
    }

    handleCheckboxClick(e) {
        e.stopPropagation();
        const taskId = e.target.dataset.taskId;
        this.toggleTask(taskId);
    }

    // Drag and Drop Implementation
    handleDragStart(e) {
        this.draggedElement = e.currentTarget;
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        this.draggedElement = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (e.currentTarget !== this.draggedElement) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (this.draggedElement && e.currentTarget !== this.draggedElement) {
            const fromIndex = parseInt(this.draggedElement.dataset.index);
            const toIndex = parseInt(e.currentTarget.dataset.index);
            this.moveTask(fromIndex, toIndex);
        }
    }

    // Touch Events for Mobile Drag and Drop
    handleTouchStart(e) {
        if (e.target.closest('.drag-handle')) {
            const touch = e.touches[0];
            this.touchStartY = touch.clientY;
            this.touchStartX = touch.clientX;
            this.draggedElement = e.currentTarget;
            this.isDragging = false;
        }
    }

    handleTouchMove(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        
        if (deltaY > 10 || deltaX > 10) {
            this.isDragging = true;
            this.draggedElement.classList.add('dragging');
            
            // Find element under touch point
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const taskItemBelow = elementBelow?.closest('.task-item');
            
            // Remove previous drag-over states
            document.querySelectorAll('.task-item').forEach(item => {
                item.classList.remove('drag-over');
            });
            
            // Add drag-over to current target
            if (taskItemBelow && taskItemBelow !== this.draggedElement) {
                taskItemBelow.classList.add('drag-over');
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.draggedElement) return;
        
        if (this.isDragging) {
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const taskItemBelow = elementBelow?.closest('.task-item');
            
            if (taskItemBelow && taskItemBelow !== this.draggedElement) {
                const fromIndex = parseInt(this.draggedElement.dataset.index);
                const toIndex = parseInt(taskItemBelow.dataset.index);
                this.moveTask(fromIndex, toIndex);
            }
        }
        
        // Cleanup
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
        
        this.draggedElement = null;
        this.isDragging = false;
    }

    // Progress Tracking
    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // Calculate points from completed tasks (only count tasks that have points)
        const earnedPoints = this.tasks
            .filter(task => task.completed && task.points !== null && task.points !== undefined)
            .reduce((total, task) => total + task.points, 0);
        
        // Calculate total points available from all tasks (only count tasks that have points)
        const totalPoints = this.tasks
            .filter(task => task.points !== null && task.points !== undefined)
            .reduce((total, task) => total + task.points, 0);

        document.getElementById('completed-count').textContent = completedTasks;
        document.getElementById('total-count').textContent = totalTasks;
        document.getElementById('points').textContent = earnedPoints;
        document.getElementById('total-points').textContent = totalPoints;
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
    }

    // Local Storage
    saveTasksToStorage() {
        try {
            localStorage.setItem('taskListApp_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
            this.showToast('Failed to save tasks', 'error');
        }
    }

    loadTasksFromStorage() {
        try {
            const storedTasks = localStorage.getItem('taskListApp_tasks');
            if (storedTasks) {
                this.tasks = JSON.parse(storedTasks);
            }
        } catch (error) {
            console.error('Failed to load tasks from localStorage:', error);
            this.showToast('Failed to load tasks', 'error');
            this.tasks = [];
        }
    }

    // Import/Export Functionality
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Tasks exported successfully!', 'success');
    }

    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedTasks = JSON.parse(event.target.result);
                this.importTasks(importedTasks);
            } catch (error) {
                console.error('Failed to parse JSON file:', error);
                this.showToast('Invalid JSON file format', 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        e.target.value = '';
    }

    importTasks(importedTasks) {
        if (!Array.isArray(importedTasks)) {
            this.showToast('Invalid task format in JSON file', 'error');
            return;
        }

        let importedCount = 0;
        importedTasks.forEach(task => {
            if (task.text && typeof task.text === 'string') {
                // Check if task already exists
                const exists = this.tasks.some(existingTask => 
                    existingTask.text === task.text || existingTask.id === task.id
                );
                
                if (!exists) {
                    this.addTask(
                        task.text,
                        Boolean(task.completed),
                        task.id || this.generateId(),
                        task.points || null, // Use imported points or let calculateTaskPoints handle it
                        task.area || null // Use imported area or null
                    );
                    importedCount++;
                }
            }
        });

        if (importedCount > 0) {
            this.showToast(`Imported ${importedCount} tasks successfully!`, 'success');
        } else {
            this.showToast('No new tasks to import', 'info');
        }
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const taskInput = document.getElementById('task-input');
            if (document.activeElement !== taskInput) {
                taskInput.focus();
            } else if (taskInput.value.trim()) {
                this.handleTaskSubmit(e);
            }
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (document.activeElement === searchInput) {
                searchInput.value = '';
                this.filterTasks('');
            }
        }
        
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleEmptyState(show) {
        const emptyState = document.getElementById('empty-state');
        emptyState.classList.toggle('visible', show);
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto remove toast
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
        
        // Make toast clickable to dismiss
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    // Loading Indicator
    showLoading() {
        document.getElementById('loading-indicator').classList.add('visible');
    }

    hideLoading() {
        document.getElementById('loading-indicator').classList.remove('visible');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskListApp = new TaskListApp();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}