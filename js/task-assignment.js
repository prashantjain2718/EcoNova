/**
 * Task Assignment Module for Teacher Dashboard
 * Handles the creation and assignment of environmental tasks to students
 */

// DOM Elements
let taskAssignForm;
let studentSelectDropdown;
let taskTypeDropdown;
let taskPointsInput;
let taskDescriptionInput;
let taskDueDateInput;
let assignTaskBtn;
let assignedTasksList;

// Initialize the task assignment functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Load required modules
    await loadRequiredModules();
    
    // Set up the task assignment form
    setupTaskAssignmentForm();
    
    // Load existing assigned tasks
    await loadAssignedTasks();
});

/**
 * Load required modules for task assignment
 */
async function loadRequiredModules() {
    try {
        // Check if API module is loaded
        if (!window.API && typeof window.API !== 'object') {
            console.log('Loading API module...');
            await loadScript('js/api.js');
            
            // Initialize API
            if (window.API && typeof window.API.initApi === 'function') {
                await window.API.initApi();
                console.log('API initialized');
            }
        }
        
        // Check if Database module is loaded
        if (!window.Database && typeof window.Database !== 'object') {
            console.log('Loading Database module...');
            await loadScript('js/database.js');
            
            // Initialize database
            if (window.Database && typeof window.Database.initDatabase === 'function') {
                await window.Database.initDatabase();
                console.log('Database initialized');
            }
        }
        
        // Check if RealWorldTasks module is loaded
        if (!window.RealWorldTasks && typeof window.RealWorldTasks !== 'object') {
            console.log('Loading Real-World Tasks module...');
            await loadScript('js/real-world-tasks.js');
            
            // Initialize RealWorldTasks
            if (window.RealWorldTasks && typeof window.RealWorldTasks.initialize === 'function') {
                await window.RealWorldTasks.initialize();
                console.log('RealWorldTasks initialized');
            }
        }
        
        console.log('All required modules loaded');
    } catch (error) {
        console.error('Error loading required modules:', error);
    }
}

/**
 * Load a script dynamically
 * @param {string} src - The script source URL
 * @returns {Promise} - Resolves when script is loaded
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (error) => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Set up the task assignment form and event listeners
 */
function setupTaskAssignmentForm() {
    taskAssignForm = document.getElementById('task-assign-form');
    studentSelectDropdown = document.getElementById('student-select');
    taskTypeDropdown = document.getElementById('task-type-select');
    taskPointsInput = document.getElementById('task-points');
    taskDescriptionInput = document.getElementById('task-description');
    taskDueDateInput = document.getElementById('task-due-date');
    assignTaskBtn = document.getElementById('assign-task-btn');
    assignedTasksList = document.getElementById('assigned-tasks-list');
    
    // If the form doesn't exist on this page, return
    if (!taskAssignForm) return;
    
    // Load real-world tasks if available
    loadRealWorldTasks();
    
    // Set up form submission
    taskAssignForm.addEventListener('submit', handleTaskAssignment);
    
    // Set up task type change to update points
    if (taskTypeDropdown) {
        taskTypeDropdown.addEventListener('change', updateSuggestedPoints);
    }
    
    // Set up bulk assignment toggle
    const bulkAssignToggle = document.getElementById('bulk-assign-toggle');
    if (bulkAssignToggle) {
        bulkAssignToggle.addEventListener('change', toggleBulkAssignment);
    }
    
    // Set up student filter
    const studentFilter = document.getElementById('student-filter');
    if (studentFilter) {
        studentFilter.addEventListener('input', filterStudentList);
    }
}

/**
 * Load real-world tasks data
 */
function loadRealWorldTasks() {
    // Check if real-world tasks are available
    if (!window.RealWorldTasks) {
        console.warn('Real-world tasks module not loaded');
        return;
    }
    
    // Get the task type select element
    if (!taskTypeDropdown) return;
    
    // Clear existing options
    taskTypeDropdown.innerHTML = '<option value="">Select Task Type</option>';
    
    // Add categories from real-world tasks
    window.RealWorldTasks.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        taskTypeDropdown.appendChild(option);
    });
    
    // Create task template select if it doesn't exist
    let taskTemplateSelect = document.getElementById('task-template-select');
    if (!taskTemplateSelect) {
        // Create the template select container
        const templateContainer = document.createElement('div');
        templateContainer.className = 'form-group';
        templateContainer.innerHTML = `
            <label for="task-template-select">Task Template:</label>
            <select id="task-template-select" class="form-control">
                <option value="">Select a Template</option>
            </select>
        `;
        
        // Insert after task type
        const taskTypeGroup = taskTypeDropdown.closest('.form-group');
        if (taskTypeGroup && taskTypeGroup.parentNode) {
            taskTypeGroup.parentNode.insertBefore(templateContainer, taskTypeGroup.nextSibling);
            
            // Get the newly created select
            taskTemplateSelect = document.getElementById('task-template-select');
            
            // Add event listener for template selection
            taskTemplateSelect.addEventListener('change', function() {
                const selectedTemplate = taskTemplateSelect.value;
                if (selectedTemplate && window.RealWorldTasks) {
                    const task = window.RealWorldTasks.getTaskById(selectedTemplate);
                    if (task) {
                        // Fill in form fields with template data
                        taskDescriptionInput.value = task.description;
                        taskPointsInput.value = task.points;
                        
                        // Set due date to 7 days from now by default if not already set
                        if (!taskDueDateInput.value) {
                            const dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 7);
                            const formattedDate = dueDate.toISOString().split('T')[0];
                            taskDueDateInput.value = formattedDate;
                        }
                    }
                }
            });
        }
    }
}

/**
 * Handle task assignment form submission
 * @param {Event} event - The submit event
 */
async function handleTaskAssignment(event) {
    event.preventDefault();
    
    // Show loading state
    const originalButtonText = assignTaskBtn.textContent;
    assignTaskBtn.textContent = 'Assigning...';
    assignTaskBtn.disabled = true;
    
    try {
        // Validate form
        if (!validateTaskForm()) {
            assignTaskBtn.textContent = originalButtonText;
            assignTaskBtn.disabled = false;
            return;
        }
        
        // Get selected students (single or multiple)
        const selectedStudents = getSelectedStudents();
        
        // Get task details
        const taskDetails = {
            type: taskTypeDropdown.value,
            points: parseInt(taskPointsInput.value),
            description: taskDescriptionInput.value,
            dueDate: taskDueDateInput.value,
            assignedDate: new Date().toISOString().split('T')[0],
            status: 'assigned'
        };
        
        // Get template ID if selected
        const taskTemplateSelect = document.getElementById('task-template-select');
        if (taskTemplateSelect && taskTemplateSelect.value) {
            taskDetails.templateId = taskTemplateSelect.value;
        }
        
        // Assign task to each selected student
        const assignmentPromises = selectedStudents.map(studentId => {
            return assignTaskToStudent(studentId, taskDetails);
        });
        
        // Wait for all assignments to complete
        const results = await Promise.all(assignmentPromises);
        const successCount = results.filter(result => result === true).length;
        
        // Show success message
        if (successCount === selectedStudents.length) {
            showNotification('success', `Task assigned to ${successCount} student(s)`);
        } else {
            showNotification('warning', `Task assigned to ${successCount} of ${selectedStudents.length} student(s)`);
        }
        
        // Reset form
        taskAssignForm.reset();
        
        // Refresh assigned tasks list
        await loadAssignedTasks();
    } catch (error) {
        console.error('Error in task assignment:', error);
        showNotification('error', 'An error occurred during task assignment');
    } finally {
        // Reset button state
        assignTaskBtn.textContent = originalButtonText;
        assignTaskBtn.disabled = false;
    }
}

/**
 * Get selected students from the form
 * @returns {Array} - Array of selected student IDs
 */
function getSelectedStudents() {
    const bulkAssignToggle = document.getElementById('bulk-assign-toggle');
    
    if (bulkAssignToggle && bulkAssignToggle.checked) {
        // Bulk assignment - get all checked students
        const checkedStudents = document.querySelectorAll('.student-checkbox:checked');
        return Array.from(checkedStudents).map(checkbox => checkbox.value);
    } else {
        // Single assignment
        return [studentSelectDropdown.value];
    }
}

/**
 * Validate the task assignment form
 * @returns {boolean} - Whether the form is valid
 */
function validateTaskForm() {
    // Check if students are selected
    const selectedStudents = getSelectedStudents();
    if (selectedStudents.length === 0) {
        showNotification('error', 'Please select at least one student');
        return false;
    }
    
    // Check if task type is selected
    if (!taskTypeDropdown.value) {
        showNotification('error', 'Please select a task type');
        return false;
    }
    
    // Check if points are valid
    const points = parseInt(taskPointsInput.value);
    if (isNaN(points) || points <= 0) {
        showNotification('error', 'Please enter a valid point value');
        return false;
    }
    
    // Check if description is provided
    if (!taskDescriptionInput.value.trim()) {
        showNotification('error', 'Please enter a task description');
        return false;
    }
    
    // Check if due date is provided and valid
    if (!taskDueDateInput.value) {
        showNotification('error', 'Please select a due date');
        return false;
    }
    
    const dueDate = new Date(taskDueDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
        showNotification('error', 'Due date cannot be in the past');
        return false;
    }
    
    return true;
}

/**
 * Assign a task to a student
 * @param {string} studentId - The student ID
 * @param {Object} taskDetails - The task details
 * @returns {Promise<boolean>} - Whether the assignment was successful
 */
async function assignTaskToStudent(studentId, taskDetails) {
    try {
        // Get student name
        const studentName = getStudentName(studentId);
        
        // Create task object
        const task = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            studentId,
            studentName,
            status: 'assigned',
            assignedDate: new Date().toISOString(),
            ...taskDetails
        };
        
        // Try to save to database first
        let saveSuccess = false;
        
        if (window.Database && typeof window.Database.saveTask === 'function') {
            try {
                await window.Database.saveTask(task);
                console.log('Task saved to database:', task);
                saveSuccess = true;
            } catch (dbError) {
                console.warn('Error saving to database, falling back to localStorage:', dbError);
            }
        }
        
        // If database save failed or not available, use localStorage as fallback
        if (!saveSuccess) {
            // Get existing assigned tasks or initialize empty array
            const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
            
            // Add new task
            assignedTasks.push(task);
            
            // Save updated tasks
            localStorage.setItem('assignedTasks', JSON.stringify(assignedTasks));
            console.log('Task saved to localStorage:', task);
        }
        
        // Also save to API if available
        if (window.API && typeof window.API.tasks.create === 'function') {
            try {
                await window.API.tasks.create(task);
                console.log('Task saved to API');
            } catch (apiError) {
                console.warn('Error saving to API:', apiError);
                // Continue execution since we already saved locally
            }
        }
        
        console.log('Task assigned successfully:', task);
        return true;
    } catch (error) {
        console.error('Error assigning task:', error);
        showNotification('error', 'Failed to assign task');
        return false;
    }
}

/**
 * Get student name by ID
 * @param {string} studentId - The student ID
 * @returns {string} - The student name
 */
function getStudentName(studentId) {
    // In a real application, this would fetch from a database
    // For demo purposes, we'll use the select option text or a default
    
    if (studentSelectDropdown) {
        const option = studentSelectDropdown.querySelector(`option[value="${studentId}"]`);
        if (option) {
            return option.textContent;
        }
    }
    
    // Check student checkboxes in bulk assignment
    const checkbox = document.querySelector(`.student-checkbox[value="${studentId}"]`);
    if (checkbox) {
        const nameElement = checkbox.closest('.student-item').querySelector('.student-name');
        if (nameElement) {
            return nameElement.textContent.trim();
        }
    }
    
    // Fallback to student data if available
    if (window.studentData && window.studentData[studentId]) {
        return window.studentData[studentId].name;
    }
    
    return 'Unknown Student';
}

/**
 * Update suggested points based on selected task type
 */
function updateSuggestedPoints() {
    if (!taskTypeDropdown || !taskPointsInput) return;
    
    const taskType = taskTypeDropdown.value;
    let suggestedPoints = 20; // Default points
    
    // Check if real-world tasks are available
    if (window.RealWorldTasks) {
        // Update task templates based on selected category
        updateTaskTemplates(taskType);
        
        // Get suggested points from real-world tasks categories
        const category = window.RealWorldTasks.categories.find(cat => cat.id === taskType);
        if (category) {
            suggestedPoints = category.basePoints || 20;
        }
    } else {
        // Fallback to original logic if real-world tasks not available
        const pointsMap = {
            'plant-tree': 50,
            'recycling': 30,
            'cleanup': 40,
            'water-conservation': 35,
            'energy-saving': 45,
            'composting': 30,
            'awareness': 25,
            'other': 20
        };
        
        suggestedPoints = pointsMap[taskType] || 20;
    }
    
    taskPointsInput.value = suggestedPoints;
}

/**
 * Update task templates dropdown based on selected category
 * @param {string} categoryId - The selected category ID
 */
function updateTaskTemplates(categoryId) {
    const taskTemplateSelect = document.getElementById('task-template-select');
    if (!taskTemplateSelect || !window.RealWorldTasks) return;
    
    // Clear existing options except the first one
    taskTemplateSelect.innerHTML = '<option value="">Select a Template</option>';
    
    if (!categoryId) return;
    
    // Get tasks for the selected category
    const categoryTasks = window.RealWorldTasks.getTasksByCategory(categoryId);
    
    // Add tasks to template dropdown
    categoryTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.title;
        taskTemplateSelect.appendChild(option);
    });
}

/**
 * Toggle between single and bulk assignment modes
 * @param {Event} event - The change event
 */
function toggleBulkAssignment(event) {
    const bulkAssignSection = document.getElementById('bulk-assign-section');
    const singleAssignSection = document.getElementById('single-assign-section');
    
    if (event.target.checked) {
        // Enable bulk assignment
        if (bulkAssignSection) bulkAssignSection.style.display = 'block';
        if (singleAssignSection) singleAssignSection.style.display = 'none';
    } else {
        // Enable single assignment
        if (bulkAssignSection) bulkAssignSection.style.display = 'none';
        if (singleAssignSection) singleAssignSection.style.display = 'block';
    }
}

/**
 * Filter student list in bulk assignment mode
 * @param {Event} event - The input event
 */
function filterStudentList(event) {
    const filterText = event.target.value.toLowerCase();
    const studentItems = document.querySelectorAll('.student-item');
    
    studentItems.forEach(item => {
        const studentName = item.querySelector('.student-name').textContent.toLowerCase();
        
        if (studentName.includes(filterText)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Load and display assigned tasks
 */
async function loadAssignedTasks() {
    if (!assignedTasksList) return;
    
    try {
        let assignedTasks = [];
        
        // Try to load from database first if available
        if (window.Database && typeof window.Database.getAssignedTasks === 'function') {
            try {
                assignedTasks = await window.Database.getAssignedTasks();
                console.log('Loaded assigned tasks from database:', assignedTasks.length);
            } catch (dbError) {
                console.warn('Error loading from database, falling back to localStorage:', dbError);
                // Fall back to localStorage
                assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
            }
        } else {
            // If database is not available, use localStorage
            assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        }
        
        // Clear current list
        assignedTasksList.innerHTML = '';
        
        if (assignedTasks.length === 0) {
            // Show empty state
            assignedTasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks assigned yet</p>
                </div>
            `;
            return;
        }
        
        // Sort tasks by due date (most recent first)
        assignedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        // Create task items
        assignedTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('assigned-task-item');
            
            // Determine status class
            let statusClass = 'status-assigned';
            if (task.status === 'completed') statusClass = 'status-completed';
            if (task.status === 'overdue') statusClass = 'status-overdue';
            
            // Check if task is overdue
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.dueDate);
            
            if (dueDate < today && task.status === 'assigned') {
                task.status = 'overdue';
                statusClass = 'status-overdue';
            }
            
            // Create task item HTML
            taskItem.innerHTML = `
                <div class="task-header">
                    <div class="task-type">
                        <i class="fas fa-${getTaskIcon(task.type)}"></i>
                        <span>${formatTaskType(task.type)}</span>
                    </div>
                    <div class="task-status ${statusClass}">
                        ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
                </div>
                <div class="task-details">
                    <div class="task-student">
                        <i class="fas fa-user"></i>
                        <span>${task.studentName}</span>
                    </div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        <div class="task-points">
                            <i class="fas fa-star"></i>
                            <span>${task.points} points</span>
                        </div>
                        <div class="task-due-date">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Due: ${formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task-btn" data-task-id="${task.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-task-btn" data-task-id="${task.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            assignedTasksList.appendChild(taskItem);
        });
        
        // Add event listeners to task action buttons
        setupTaskActionListeners();
    } catch (error) {
        console.error('Error loading assigned tasks:', error);
    }
}

/**
 * Set up event listeners for task action buttons
 */
function setupTaskActionListeners() {
    // Edit task buttons
    const editButtons = document.querySelectorAll('.edit-task-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskId = button.getAttribute('data-task-id');
            editTask(taskId);
        });
    });
    
    // Delete task buttons
    const deleteButtons = document.querySelectorAll('.delete-task-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const taskId = button.getAttribute('data-task-id');
            deleteTask(taskId);
        });
    });
}

/**
 * Edit an assigned task
 * @param {string} taskId - The task ID
 */
function editTask(taskId) {
    try {
        // Get assigned tasks from localStorage
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        
        // Find the task to edit
        const taskIndex = assignedTasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            showNotification('error', 'Task not found');
            return;
        }
        
        const task = assignedTasks[taskIndex];
        
        // Populate form with task details
        if (taskTypeDropdown) taskTypeDropdown.value = task.type;
        if (taskPointsInput) taskPointsInput.value = task.points;
        if (taskDescriptionInput) taskDescriptionInput.value = task.description;
        if (taskDueDateInput) taskDueDateInput.value = task.dueDate;
        
        // Select the student
        if (studentSelectDropdown) {
            const option = studentSelectDropdown.querySelector(`option[value="${task.studentId}"]`);
            if (option) {
                studentSelectDropdown.value = task.studentId;
            }
        }
        
        // Change form submission to update instead of create
        if (assignTaskBtn) {
            assignTaskBtn.textContent = 'Update Task';
            assignTaskBtn.setAttribute('data-edit-mode', 'true');
            assignTaskBtn.setAttribute('data-task-id', taskId);
        }
        
        // Scroll to form
        taskAssignForm.scrollIntoView({ behavior: 'smooth' });
        
        showNotification('info', 'Editing task - update form to save changes');
    } catch (error) {
        console.error('Error editing task:', error);
        showNotification('error', 'Failed to edit task');
    }
}

/**
 * Delete an assigned task
 * @param {string} taskId - The task ID
 */
function deleteTask(taskId) {
    try {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        // Get assigned tasks from localStorage
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        
        // Filter out the task to delete
        const updatedTasks = assignedTasks.filter(task => task.id !== taskId);
        
        // Save updated tasks
        localStorage.setItem('assignedTasks', JSON.stringify(updatedTasks));
        
        // Refresh assigned tasks list
        loadAssignedTasks();
        
        showNotification('success', 'Task deleted successfully');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('error', 'Failed to delete task');
    }
}

/**
 * Get icon for task type
 * @param {string} taskType - The task type
 * @returns {string} - The icon class
 */
function getTaskIcon(taskType) {
    const iconMap = {
        'plant-tree': 'seedling',
        'recycling': 'recycle',
        'cleanup': 'trash-alt',
        'water-conservation': 'tint',
        'energy-saving': 'lightbulb',
        'composting': 'leaf',
        'awareness': 'bullhorn',
        'other': 'tasks'
    };
    
    return iconMap[taskType] || 'tasks';
}

/**
 * Format task type for display
 * @param {string} taskType - The task type
 * @returns {string} - The formatted task type
 */
function formatTaskType(taskType) {
    const typeMap = {
        'plant-tree': 'Plant a Tree',
        'recycling': 'Recycling',
        'cleanup': 'Clean-up',
        'water-conservation': 'Water Conservation',
        'energy-saving': 'Energy Saving',
        'composting': 'Composting',
        'awareness': 'Awareness Campaign',
        'other': 'Other Task'
    };
    
    return typeMap[taskType] || 'Task';
}

/**
 * Format date for display
 * @param {string} dateString - The date string
 * @returns {string} - The formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Show notification message
 * @param {string} type - The notification type (success, error, info)
 * @param {string} message - The notification message
 */
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}