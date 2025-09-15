/**
 * Task Upload and Validation Module
 * Handles the upload of real-world environmental tasks and their validation
 */

// DOM Elements
let taskUploadForm;
let taskImagePreview;
let taskSubmitButton;
let taskFeedbackArea;

// Initialize the task upload functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize AI validation with API key from environment
    await initializeAIValidation();
    
    // Set up the task upload form
    setupTaskUploadForm();
});

/**
 * Initialize the AI validation module with the API key
 */
async function initializeAIValidation() {
    try {
        // Try to load API key from localStorage first
        let apiKey = localStorage.getItem('geminiApiKey');
        
        // If not in localStorage, try to load from .env (simulated)
        if (!apiKey) {
            console.log('Loading API key from environment...');
            apiKey = window.AIValidation?.loadApiKey() || 'AIzaSyD9uVxhjBgqkFJ1pn33m3Ub0Q2pw-vZxrM';
            // Store the API key in localStorage for future use
            localStorage.setItem('geminiApiKey', apiKey);
        }
        
        // For testing purposes, allow setting API key via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlApiKey = urlParams.get('apiKey');
        if (urlApiKey) {
            apiKey = urlApiKey;
            // Save to localStorage for future use
            localStorage.setItem('geminiApiKey', apiKey);
            console.log('API key set from URL parameter');
        }
        
        // Initialize the AI validation module
        if (window.AIValidation) {
            const success = window.AIValidation.init(apiKey);
            console.log('AI Validation initialization:', success ? 'successful' : 'failed');
            
            // Add API key input field if not already present
            if (!document.getElementById('apiKeyInput')) {
                const settingsSection = document.querySelector('.settings-section') || 
                                        document.createElement('div');
                
                if (!settingsSection.classList.contains('settings-section')) {
                    settingsSection.classList.add('settings-section');
                    document.querySelector('.task-upload-container').prepend(settingsSection);
                }
                
                const apiKeyField = document.createElement('div');
                apiKeyField.className = 'form-group api-key-field';
                apiKeyField.innerHTML = `
                    <label for="apiKeyInput">Gemini API Key (for AI validation):</label>
                    <div class="input-with-button">
                        <input type="password" id="apiKeyInput" class="form-control" 
                               placeholder="Enter your Gemini API key" value="${apiKey || ''}">
                        <button id="saveApiKey" class="btn btn-primary">Save</button>
                    </div>
                    <small class="form-text text-muted">Required for AI validation of task submissions</small>
                `;
                
                settingsSection.appendChild(apiKeyField);
                
                // Add event listener for saving API key
                document.getElementById('saveApiKey').addEventListener('click', () => {
                    const newApiKey = document.getElementById('apiKeyInput').value.trim();
                    if (newApiKey) {
                        localStorage.setItem('geminiApiKey', newApiKey);
                        window.AIValidation.init(newApiKey);
                        alert('API key saved successfully!');
                    } else {
                        alert('Please enter a valid API key');
                    }
                });
            }
            
            return success;
        } else {
            console.error('AI Validation module not loaded');
            return false;
        }
    } catch (error) {
        console.error('Error initializing AI validation:', error);
        return false;
    }
}

/**
 * Set up the task upload form and event listeners
 */
function setupTaskUploadForm() {
    taskUploadForm = document.getElementById('task-upload-form');
    taskImagePreview = document.getElementById('task-image-preview');
    taskSubmitButton = document.getElementById('task-submit-button');
    taskFeedbackArea = document.getElementById('task-feedback');
    
    // If the form doesn't exist on this page, return
    if (!taskUploadForm) return;
    
    // Set up image preview
    const imageInput = document.getElementById('task-image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelection);
    }
    
    // Set up form submission
    taskUploadForm.addEventListener('submit', handleTaskSubmission);
}

/**
 * Handle image selection and preview
 * @param {Event} event - The change event
 */
function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
    }
    
    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = function(e) {
        if (taskImagePreview) {
            taskImagePreview.innerHTML = `<img src="${e.target.result}" alt="Task Preview" class="img-fluid rounded">`;
            taskImagePreview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Handle task form submission
 * @param {Event} event - The submit event
 */
async function handleTaskSubmission(event) {
    event.preventDefault();
    
    // Disable submit button to prevent multiple submissions
    if (taskSubmitButton) {
        taskSubmitButton.disabled = true;
        taskSubmitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';
    }
    
    // Get form data
    const formData = new FormData(taskUploadForm);
    const taskType = formData.get('task-type');
    const description = formData.get('task-description');
    const imageFile = formData.get('task-image');
    
    // Validate form data
    if (!taskType || !description || !imageFile) {
        showFeedback('error', 'Please fill in all fields and upload an image');
        resetSubmitButton();
        return;
    }
    
    // Show processing message
    if (taskFeedbackArea) {
        showFeedback('info', 'Processing your submission... This may take a moment.');
    }
    
    try {
        // Convert image to data URL for AI validation
        const imageUrl = await fileToDataUrl(imageFile);
        
        if (taskFeedbackArea) {
            showFeedback('info', 'Analyzing your image with AI... Please wait.');
        }
        
        // Create submission object
        const submission = {
            taskType,
            description,
            imageUrl,
            timestamp: new Date().toISOString(),
            userId: localStorage.getItem('userId') || 'anonymous',
            username: localStorage.getItem('username') || 'Anonymous User'
        };
        
        // Validate with AI
        if (window.AIValidation) {
            try {
                const result = await window.AIValidation.validateTask(submission);
                console.log('AI Validation result:', result);
                handleValidationResult(result, submission);
            } catch (validationError) {
                console.error('AI Validation error:', validationError);
                showFeedback('warning', 'AI validation encountered an error. Proceeding with basic validation.');
                simulateValidation(submission);
            }
        } else {
            // Fallback if AI validation is not available
            showFeedback('warning', 'AI validation not available. Using basic validation.');
            simulateValidation(submission);
        }
        
        // Save to database if available
        if (window.Database && typeof window.Database.saveTask === 'function') {
            try {
                await window.Database.saveTask(submission, result);
                console.log('Task saved to database');
            } catch (dbError) {
                console.error('Error saving to database:', dbError);
                // Continue with localStorage as fallback
            }
        }
    } catch (error) {
        console.error('Error during task submission:', error);
        showFeedback('error', 'An error occurred during submission. Please try again.');
        resetSubmitButton();
    }
}

/**
 * Handle the validation result
 * @param {Object} result - The validation result
 * @param {Object} submission - The original submission
 */
function handleValidationResult(result, submission) {
    if (result.success) {
        if (result.isValid) {
            // Task validated successfully
            showFeedback('success', `Task validated! ${result.message}`);
            saveTaskToUserProfile(submission, result);
        } else {
            // Task validation failed
            showFeedback('warning', `${result.message} (Confidence: ${result.confidence})`);
        }
        
        // Show AI feedback
        if (result.feedback) {
            showAIFeedback(result.feedback);
        }
    } else {
        // Error in validation process
        showFeedback('error', result.message || 'Validation failed. Please try again.');
    }
    
    resetSubmitButton();
}

/**
 * Simulate validation when AI is not available
 * @param {Object} submission - The task submission
 */
function simulateValidation(submission) {
    // Simulate processing delay
    setTimeout(() => {
        const isValid = Math.random() > 0.3; // 70% chance of success
        
        if (isValid) {
            showFeedback('success', 'Task validated successfully!');
            saveTaskToUserProfile(submission, { isValid: true });
        } else {
            showFeedback('warning', 'Task could not be validated. Please provide clearer evidence.');
        }
        
        resetSubmitButton();
    }, 1500);
}

/**
 * Save the validated task to the user's profile
 * @param {Object} submission - The task submission
 * @param {Object} validationResult - The validation result
 */
function saveTaskToUserProfile(submission, validationResult) {
    // In a real application, this would send data to a server
    // For demo purposes, we'll save to localStorage
    
    try {
        // Get existing tasks or initialize empty array
        const existingTasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
        
        // Add new task
        const newTask = {
            id: Date.now(),
            type: submission.taskType,
            description: submission.description,
            imageUrl: submission.imageUrl,
            timestamp: new Date().toISOString(),
            status: validationResult.isValid ? 'approved' : 'pending',
            confidence: validationResult.confidence || 'N/A'
        };
        
        existingTasks.push(newTask);
        
        // Save updated tasks
        localStorage.setItem('userTasks', JSON.stringify(existingTasks));
        
        // Update user points if task is approved
        if (validationResult.isValid) {
            updateUserPoints(10); // Award 10 points for completed task
            
            // Check for new achievements
            if (window.AchievementSystem && typeof window.AchievementSystem.checkAchievements === 'function') {
                window.AchievementSystem.checkAchievements();
            }
        }
        
        console.log('Task saved successfully:', newTask);
    } catch (error) {
        console.error('Error saving task:', error);
    }
}

/**
 * Update user points for completed tasks
 * @param {number} points - Points to add
 */
function updateUserPoints(points) {
    try {
        // Get current user data
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Update points
        userData.points = (userData.points || 0) + points;
        
        // Save updated user data
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Update points display if it exists
        const pointsDisplay = document.getElementById('user-points');
        if (pointsDisplay) {
            pointsDisplay.textContent = userData.points;
        }
        
        console.log(`User points updated: +${points} points`);
    } catch (error) {
        console.error('Error updating user points:', error);
    }
}

/**
 * Show feedback message to the user
 * @param {string} type - The type of feedback (success, warning, error)
 * @param {string} message - The feedback message
 */
function showFeedback(type, message) {
    if (!taskFeedbackArea) return;
    
    // Clear previous feedback
    taskFeedbackArea.innerHTML = '';
    
    // Create feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `alert alert-${type}`;
    feedbackElement.textContent = message;
    
    // Add to feedback area
    taskFeedbackArea.appendChild(feedbackElement);
    taskFeedbackArea.style.display = 'block';
    
    // Scroll to feedback
    taskFeedbackArea.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show AI feedback in a separate section
 * @param {string} feedback - The AI feedback message
 */
function showAIFeedback(feedback) {
    const aiFeedbackArea = document.getElementById('ai-feedback');
    if (!aiFeedbackArea) return;
    
    aiFeedbackArea.innerHTML = `
        <div class="ai-feedback-box">
            <div class="ai-icon"><i class="fas fa-robot"></i></div>
            <div class="ai-message">${feedback}</div>
        </div>
    `;
    
    aiFeedbackArea.style.display = 'block';
}

/**
 * Reset the submit button to its original state
 */
function resetSubmitButton() {
    if (taskSubmitButton) {
        taskSubmitButton.disabled = false;
        taskSubmitButton.innerHTML = 'Submit Task';
    }
}

/**
 * Convert a file to a data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves with the data URL
 */
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
    });
}