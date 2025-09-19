// TaskList Mobile Web Application
// Main JavaScript functionality

class TaskListApp {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.draggedElement = null;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.touchStartTime = 0;
        this.isDragging = false;
        this.showCompleted = true; // Track completed task visibility
        
        this.init();
    }

    init() {
        this.loadTasksFromStorage();
        this.migrateTasks(); // Ensure all tasks have points
        this.bindEvents();
        this.renderTasks();
        this.updateProgress();
        this.showToast('Welcome to TaskList!', 'info');
        this.initCacheManagement();
    }

    // Cache Management Functions
    initCacheManagement() {
        // Add cache clearing functionality
        this.addCacheControls();
        
        // Clear browser cache on startup if development mode
        if (this.isDevelopmentMode()) {
            this.clearBrowserCache();
        }
    }

    isDevelopmentMode() {
        // Check if running in development (localhost or file://)
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' || 
               location.protocol === 'file:';
    }

    async clearBrowserCache() {
        try {
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('All caches cleared');
            }

            // Force reload with cache bypass
            if (performance.navigation.type !== performance.navigation.TYPE_RELOAD) {
                setTimeout(() => {
                    location.reload(true);
                }, 100);
            }
        } catch (error) {
            console.warn('Cache clearing failed:', error);
        }
    }

    addCacheControls() {
        // Add keyboard shortcut for cache clearing (Ctrl+Shift+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.clearBrowserCache();
                this.showToast('Cache cleared and page reloaded', 'success');
            }
        });

        // Add cache clear button in development mode
        if (this.isDevelopmentMode()) {
            this.addDevCacheButton();
        }
    }

    addDevCacheButton() {
        const header = document.querySelector('.header');
        if (header) {
            const cacheButton = document.createElement('button');
            cacheButton.textContent = '🗑️ Clear Cache';
            cacheButton.className = 'dev-cache-button';
            cacheButton.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                padding: 4px 8px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 10px;
                cursor: pointer;
                z-index: 1000;
            `;
            cacheButton.addEventListener('click', () => {
                this.clearBrowserCache();
                this.showToast('Cache cleared!', 'success');
            });
            header.appendChild(cacheButton);
        }
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

        // Table header filter functionality
        const filterArea = document.getElementById('filter-area');
        if (filterArea) {
            filterArea.addEventListener('input', this.handleTableFilter.bind(this));
        }
        const filterPoints = document.getElementById('filter-points');
        if (filterPoints) {
            filterPoints.addEventListener('input', this.handleTableFilter.bind(this));
        }

        // Import/Export functionality
        const importButton = document.getElementById('import-button');
        const exportButton = document.getElementById('export-button');
        const fileInput = document.getElementById('json-file-input');

        importButton.addEventListener('click', () => fileInput.click());
        exportButton.addEventListener('click', this.exportTasks.bind(this));
        fileInput.addEventListener('change', this.handleFileImport.bind(this));

        // Toggle completed tasks button
        const toggleCompletedButton = document.getElementById('toggle-completed-button');
        if (toggleCompletedButton) {
            toggleCompletedButton.addEventListener('click', this.toggleCompletedVisibility.bind(this));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    handleTableFilter() {
        const areaValue = (document.getElementById('filter-area')?.value || '').toLowerCase().trim();
        const pointsValue = parseInt(document.getElementById('filter-points')?.value, 10);

        document.querySelectorAll('.task-list-table tbody tr').forEach(row => {
            const areaCell = row.querySelector('.task-area');
            const pointsCell = row.querySelector('.task-points');
            let areaText = areaCell ? areaCell.textContent.toLowerCase().trim() : '';
            let pointsNum = pointsCell ? parseInt(pointsCell.textContent, 10) : null;

            let areaMatch = !areaValue || areaText.includes(areaValue);
            let pointsMatch = isNaN(pointsValue) || (pointsNum !== null && pointsNum >= pointsValue);

            row.style.display = (areaMatch && pointsMatch) ? '' : 'none';
        });
    }

    // Toggle completed tasks visibility
    toggleCompletedVisibility() {
        this.showCompleted = !this.showCompleted;
        const button = document.getElementById('toggle-completed-button');
        
        // Update button text while preserving the SVG
        const svg = button.querySelector('svg');
        button.innerHTML = '';
        button.appendChild(svg);
        button.appendChild(document.createTextNode(this.showCompleted ? 'Hide Completed' : 'Show Completed'));
        
        // Filter completed tasks
        document.querySelectorAll('.task-list-table tbody tr.completed').forEach(row => {
            row.style.display = this.showCompleted ? '' : 'none';
        });
        
        this.showToast(this.showCompleted ? 'Showing completed tasks' : 'Hiding completed tasks', 'info');
    }

    // Import/Export functionality
    // ...existing code...

    // Task Management
    handleTaskSubmit(e) {
        e.preventDefault();
        const taskInput = document.getElementById('task-input');
        const pointsInput = document.getElementById('points-input');
        const taskText = taskInput.value.trim();
        const customPoints = pointsInput.value ? parseInt(pointsInput.value) : null;

        if (taskText) {
            this.addTask(taskText, false, null, customPoints);
            taskInput.value = '';
            pointsInput.value = '';
            taskInput.focus();
        }
    }

    addTask(text, completed = false, id = null, points = null, area = null) {
        const task = {
            id: id || this.generateId(),
            text: text,
            completed: completed,
            points: points // Don't default to calculateTaskPoints if points is explicitly null
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
        if (fromIndex !== toIndex && fromIndex >= 0 && fromIndex < this.tasks.length) {
            // Adjust toIndex to be within valid bounds
            toIndex = Math.max(0, Math.min(toIndex, this.tasks.length));
            
            // Remove the task from its current position
            const task = this.tasks.splice(fromIndex, 1)[0];
            
            // Adjust insertion index if moving down
            if (toIndex > fromIndex) {
                toIndex = toIndex - 1;
            }
            
            // Insert at the new position
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
        const taskList = document.getElementById('task-list'); // tbody
        const emptyState = document.getElementById('empty-state');

        if (this.tasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.add('visible');
            return;
        }

        emptyState.classList.remove('visible');
        taskList.innerHTML = this.tasks.map((task, index) => this.createTaskRow(task, index)).join('');

        // Bind events for table rows
        this.bindTaskTableEvents();
    }

    createTaskRow(task, index) {
        return `
            <tr class="task-row ${task.completed ? 'completed' : ''}" 
                data-task-id="${task.id}" 
                data-index="${index}"
                draggable="true">
                <td class="task-drag-col">
                    <div class="drag-handle" title="Drag to reorder">
                        <svg viewBox="0 0 16 16" width="12" height="12">
                            <path d="M10 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM10 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                    </div>
                </td>
                <td class="task-num-col">${index + 1}</td>
                <td class="task-title-col">
                    <span class="task-title">${this.escapeHtml(task.text)}</span>
                </td>
                <td class="task-points-col">
                    ${(task.points !== null && task.points !== undefined) ? `<span class="pill ${task.completed ? 'completed' : ''}">${task.points}</span>` : ''}
                </td>
                <td class="task-actions-col">
                    <button class="delete-task-btn" title="Delete task" data-task-id="${task.id}">
                        <svg viewBox="0 0 16 16" width="12" height="12">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84L13.962 3.5H14.5a.5.5 0 0 0 0-1h-1.004a.58.58 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }

    bindTaskTableEvents() {
        // Task row click events
        document.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('click', this.handleTaskRowClick.bind(this));
            
            // Add drag and drop events
            row.addEventListener('dragstart', this.handleDragStart.bind(this));
            row.addEventListener('dragover', this.handleDragOver.bind(this));
            row.addEventListener('drop', this.handleDrop.bind(this));
            row.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            // Add touch events for mobile drag and drop
            row.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            row.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            row.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        });

        // Delete button events
        document.querySelectorAll('.delete-task-btn').forEach(deleteBtn => {
            deleteBtn.addEventListener('click', this.handleDeleteClick.bind(this));
        });
    }

    handleTaskRowClick(e) {
        // Don't toggle when clicking delete button or drag handle
        if (e.target.closest('.delete-task-btn') || e.target.closest('.drag-handle')) {
            return;
        }
        const taskId = e.currentTarget.dataset.taskId;
        this.toggleTask(taskId);
    }

    handleDeleteClick(e) {
        e.stopPropagation();
        const taskId = e.target.closest('.delete-task-btn').dataset.taskId;
        this.deleteTask(taskId);
    }

    // Drag and Drop Event Handlers
    handleDragStart(e) {
        this.draggedElement = e.currentTarget;
        e.currentTarget.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetRow = e.currentTarget;
        
        if (targetRow !== this.draggedElement) {
            targetRow.style.borderTop = '2px solid var(--color-accent-emphasis)';
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const targetRow = e.currentTarget;
        
        if (this.draggedElement && targetRow !== this.draggedElement) {
            const draggedIndex = parseInt(this.draggedElement.dataset.index);
            const targetIndex = parseInt(targetRow.dataset.index);
            
            // Reorder tasks array
            this.reorderTasks(draggedIndex, targetIndex);
        }
        
        // Clear visual indicators
        this.clearDragStyles();
    }

    handleDragEnd(e) {
        e.currentTarget.style.opacity = '';
        this.clearDragStyles();
        this.draggedElement = null;
    }

    clearDragStyles() {
        document.querySelectorAll('.task-row').forEach(row => {
            row.style.borderTop = '';
        });
    }

    reorderTasks(fromIndex, toIndex) {
        const taskToMove = this.tasks[fromIndex];
        this.tasks.splice(fromIndex, 1);
        this.tasks.splice(toIndex, 0, taskToMove);
        
        this.saveTasksToStorage();
        this.renderTasks();
        this.updateProgress();
        this.showToast('Task order updated', 'success');
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        const task = this.tasks[taskIndex];
        
        // Show confirmation dialog
        if (confirm(`Delete task: "${task.text}"?`)) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateProgress();
            this.showToast('Task deleted', 'success');
        }
    }

    // Touch Event Handlers for Mobile Drag and Drop
    handleTouchStart(e) {
        if (!e.target.closest('.drag-handle')) return;
        
        this.touchStartY = e.touches[0].clientY;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartTime = Date.now();
        this.draggedElement = e.currentTarget;
        this.isDragging = false;
        
        // Add visual feedback
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.zIndex = '1000';
    }

    handleTouchMove(e) {
        if (!this.draggedElement) return;
        
        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        
        // Start dragging if moved enough (prevents accidental drags)
        if (deltaY > 10 || deltaX > 10) {
            this.isDragging = true;
            e.preventDefault();
            
            // Find the row we're hovering over
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const targetRow = elementBelow?.closest('.task-row');
            
            // Clear previous drag indicators
            this.clearDragStyles();
            
            if (targetRow && targetRow !== this.draggedElement) {
                targetRow.style.borderTop = '2px solid var(--color-accent-emphasis)';
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.draggedElement) return;
        
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetRow = elementBelow?.closest('.task-row');
        
        // Reset visual feedback
        this.draggedElement.style.transform = '';
        this.draggedElement.style.zIndex = '';
        
        if (this.isDragging && targetRow && targetRow !== this.draggedElement) {
            const draggedIndex = parseInt(this.draggedElement.dataset.index);
            const targetIndex = parseInt(targetRow.dataset.index);
            
            // Reorder tasks
            this.reorderTasks(draggedIndex, targetIndex);
        } else if (!this.isDragging && Date.now() - this.touchStartTime < 300) {
            // Short tap - treat as click if not dragging
            if (!e.target.closest('.delete-task-btn')) {
                const taskId = this.draggedElement.dataset.taskId;
                this.toggleTask(taskId);
            }
        }
        
        this.clearDragStyles();
        this.draggedElement = null;
        this.isDragging = false;
    }

    handleCheckboxClick(e) {
        e.stopPropagation();
        const taskId = e.target.dataset.taskId;
        this.toggleTask(taskId);
    }

    handleDeleteClick(e) {
        e.stopPropagation();
        const taskId = e.target.closest('.delete-task-btn').dataset.taskId;
        this.deleteTask(taskId);
    }

    // Drag and Drop Implementation
    handleDragStart(e) {
        // Prevent dragging if started from checkbox or input elements
        if (e.target.closest('.task-checkbox') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
        
        this.draggedElement = e.currentTarget;
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
        
        // Set drag image to be the whole task item
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setDragImage(e.currentTarget, rect.width / 2, rect.height / 2);
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over', 'drop-line-above', 'drop-line-below');
        });
        
        // Clean up drop zone
        const dropZone = document.getElementById('drop-zone-bottom');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
        
        this.draggedElement = null;
    }

    handleDragEnter(e) {
        e.preventDefault();
    }

    handleDragLeave(e) {
        // Only remove drag-over if we're actually leaving the element
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    handleDragOver(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Remove all previous drag indicators
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over', 'drop-line-above', 'drop-line-below');
        });
        
        const targetItem = e.currentTarget;
        if (targetItem !== this.draggedElement) {
            const rect = targetItem.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const mouseY = e.clientY;
            
            // Determine if we should show drop line above or below
            if (mouseY < midpoint) {
                targetItem.classList.add('drop-line-above');
            } else {
                targetItem.classList.add('drop-line-below');
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        if (this.draggedElement && e.currentTarget !== this.draggedElement) {
            const fromIndex = parseInt(this.draggedElement.dataset.index);
            let toIndex = parseInt(e.currentTarget.dataset.index);
            
            // Adjust insertion index based on drop line position
            if (e.currentTarget.classList.contains('drop-line-below')) {
                toIndex = toIndex + 1;
            }
            
            if (!isNaN(fromIndex) && !isNaN(toIndex)) {
                this.moveTask(fromIndex, toIndex);
            }
        }
        
        // Clean up all drag indicators
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over', 'drop-line-above', 'drop-line-below');
        });
        
        // Clean up drop zone
        const dropZone = document.getElementById('drop-zone-bottom');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }

    // Bottom Drop Zone Handlers
    handleBottomDropZoneDragOver(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Remove all task drop indicators
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over', 'drop-line-above', 'drop-line-below');
        });
        
        // Show drop zone as active
        e.currentTarget.classList.add('drag-over');
    }

    handleBottomDropZoneDragLeave(e) {
        // Only remove if we're actually leaving the drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    handleBottomDropZoneDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (this.draggedElement) {
            const fromIndex = parseInt(this.draggedElement.dataset.index);
            const toIndex = this.tasks.length; // Move to end
            
            if (!isNaN(fromIndex)) {
                this.moveTask(fromIndex, toIndex);
            }
        }
    }

    // Touch Events for Mobile Drag and Drop
    handleTouchStart(e) {
        // Don't start drag if touching checkbox
        if (e.target.closest('.task-checkbox')) {
            return;
        }
        
        const touch = e.touches[0];
        this.touchStartY = touch.clientY;
        this.touchStartX = touch.clientX;
        this.draggedElement = e.currentTarget;
        this.isDragging = false;
        this.touchStartTime = Date.now();
    }

    handleTouchMove(e) {
        if (!this.draggedElement) return;
        
        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const timeDelta = Date.now() - this.touchStartTime;
        
        // Require minimum movement and time delay to start dragging
        if ((deltaY > 15 || deltaX > 15) && timeDelta > 150) {
            e.preventDefault(); // Prevent scrolling
            this.isDragging = true;
            this.draggedElement.classList.add('dragging');
            
            // Find element under touch point
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const taskItemBelow = elementBelow?.closest('.task-item');
            const dropZoneBelow = elementBelow?.closest('.drop-zone-bottom');
            
            // Remove previous drag indicators
            document.querySelectorAll('.task-item').forEach(item => {
                item.classList.remove('drag-over', 'drop-line-above', 'drop-line-below');
            });
            
            // Clean up drop zone
            const dropZone = document.getElementById('drop-zone-bottom');
            if (dropZone) {
                dropZone.classList.remove('drag-over');
            }
            
            // Handle drop zone
            if (dropZoneBelow) {
                dropZoneBelow.classList.add('drag-over');
            }
            // Add drop line indicator to current task target
            else if (taskItemBelow && taskItemBelow !== this.draggedElement) {
                const rect = taskItemBelow.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const touchY = touch.clientY;
                
                // Determine if we should show drop line above or below
                if (touchY < midpoint) {
                    taskItemBelow.classList.add('drop-line-above');
                } else {
                    taskItemBelow.classList.add('drop-line-below');
                }
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.draggedElement) return;
        
        if (this.isDragging) {
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const taskItemBelow = elementBelow?.closest('.task-item');
            const dropZoneBelow = elementBelow?.closest('.drop-zone-bottom');
            
            if (dropZoneBelow) {
                // Dropped on bottom drop zone - move to end
                const fromIndex = parseInt(this.draggedElement.dataset.index);
                this.moveTask(fromIndex, this.tasks.length);
            } else if (taskItemBelow && taskItemBelow !== this.draggedElement) {
                const fromIndex = parseInt(this.draggedElement.dataset.index);
                let toIndex = parseInt(taskItemBelow.dataset.index);
                
                // Adjust insertion index based on drop line position
                if (taskItemBelow.classList.contains('drop-line-below')) {
                    toIndex = toIndex + 1;
                }
                
                this.moveTask(fromIndex, toIndex);
            }
        } else {
            // This was a tap, not a drag - handle task toggle
            const timeDelta = Date.now() - this.touchStartTime;
            const touch = e.changedTouches[0];
            const deltaY = Math.abs(touch.clientY - this.touchStartY);
            const deltaX = Math.abs(touch.clientX - this.touchStartX);
            
            // If it was a short tap with minimal movement, toggle the task
            if (timeDelta < 300 && deltaY < 10 && deltaX < 10) {
                const taskId = this.draggedElement.dataset.taskId;
                if (!e.target.closest('.task-checkbox')) {
                    this.toggleTask(taskId);
                }
            }
        }
        
        // Cleanup
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over', 'drop-line-above', 'drop-line-below');
        });
        
        // Clean up drop zone
        const dropZone = document.getElementById('drop-zone-bottom');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
        
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
                        task.points || null
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

    // Additional Cache Control Methods
    async disableServiceWorkerCache() {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                console.log('Service worker unregistered');
                this.showToast('Service Worker cache disabled', 'info');
            } catch (error) {
                console.error('Failed to unregister service worker:', error);
            }
        }
    }

    setNoCacheHeaders() {
        // Add no-cache meta tags if they don't exist
        const head = document.head;
        
        const metaTags = [
            { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
            { 'http-equiv': 'Pragma', content: 'no-cache' },
            { 'http-equiv': 'Expires', content: '0' }
        ];

        metaTags.forEach(tagData => {
            const existing = head.querySelector(`meta[http-equiv="${tagData['http-equiv']}"]`);
            if (!existing) {
                const meta = document.createElement('meta');
                Object.keys(tagData).forEach(attr => {
                    meta.setAttribute(attr, tagData[attr]);
                });
                head.appendChild(meta);
            }
        });
    }

    // Development helper to force refresh all resources
    forceRefreshResources() {
        const timestamp = Date.now();
        
        // Refresh CSS
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            const href = link.href.split('?')[0];
            link.href = `${href}?v=${timestamp}`;
        });

        // Refresh scripts would require page reload
        setTimeout(() => location.reload(true), 100);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskListApp = new TaskListApp();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Check if caching should be disabled
        const disableCache = localStorage.getItem('disableCache') === 'true' || 
                           location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1';

        if (disableCache) {
            // Unregister any existing service workers
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (const registration of registrations) {
                    registration.unregister();
                }
            });
            console.log('Service Worker caching disabled');
        } else {
            // Register service worker normally
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    
                    // Force update on page load in development
                    if (location.hostname === 'localhost') {
                        registration.update();
                    }
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    });
}

// Add global cache control functions
window.disableCache = () => {
    localStorage.setItem('disableCache', 'true');
    if (window.taskListApp) {
        window.taskListApp.clearBrowserCache();
    }
};

window.enableCache = () => {
    localStorage.removeItem('disableCache');
    location.reload();
};