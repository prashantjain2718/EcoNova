/**
 * EcoNova API Module
 * Handles all backend API interactions for the EcoNova platform
 */

// API Configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:5000/api', // Update this to your backend API URL
    endpoints: {
        tasks: '/tasks',
        users: '/users',
        achievements: '/achievements',
        auth: '/auth', // New authentication endpoint
        validation: '/validation',
        analytics: '/analytics'
    },
    defaultHeaders: {
        'Content-Type': 'application/json',
    },
};

let authToken = null;
let currentUser = null;

/**
 * Initialize the API module
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
async function initApi(options = {}) {
    try {
        // Load auth token from localStorage if available
        authToken = localStorage.getItem('authToken');

        // Load current user from localStorage if available
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            currentUser = JSON.parse(userJson);
        }

        // Override default config with options
        if (options.baseUrl) {
            API_CONFIG.baseUrl = options.baseUrl;
        }

        // Test connection to API
        const connectionTest = await fetch(`${API_CONFIG.baseUrl}/health`, {
            method: 'GET',
            headers: API_CONFIG.defaultHeaders
        });

        if (!connectionTest.ok) {
            throw new Error('API server not available');
        }

        console.log('API initialized successfully');
        return true;
    } catch (error) {
        console.error('API initialization error:', error);
        return false;
    }
}

/**
 * Set up local storage fallback when API is not available
 * @returns {boolean} - Whether fallback setup was successful
 */
function setupLocalFallback() {
    // Create necessary local storage items if they don't exist
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('assignedTasks')) {
        localStorage.setItem('assignedTasks', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('userTasks')) {
        localStorage.setItem('userTasks', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('achievements')) {
        localStorage.setItem('achievements', JSON.stringify([]));
    }
    
    console.log('Local storage fallback initialized');
    return true;
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint
 * @param {string} method - The HTTP method
 * @param {Object} data - The request data
 * @returns {Promise<Object>} - The response data
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `${API_CONFIG.baseUrl}${endpoint}`;
        const headers = { ...API_CONFIG.defaultHeaders };

        // Add auth token if available
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const options = {
            method,
            headers
        };

        // Add request body for non-GET requests
        if (method !== 'GET' && data) {
            options.body = JSON.stringify(data);
        }

        // Make the request
        const response = await fetch(url, options);

        // Handle response
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Parse response JSON
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('API request error:', error);
        throw error; // Re-throw the error after logging
    }
}

/**
 * Handle local storage fallback for API requests
 * @param {string} endpoint - The API endpoint
 * @param {string} method - The HTTP method
 * @param {Object} data - The request data
 * @returns {Promise<Object>} - The simulated response data
 */
async function handleLocalFallback(endpoint, method, data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Extract resource type from endpoint
    const resourceMatch = endpoint.match(/^\/([^\/\?]+)/);
    if (!resourceMatch) {
        throw new Error(`Invalid endpoint: ${endpoint}`);
    }
    
    const resource = resourceMatch[1];
    const resourceId = endpoint.match(/\/([^\/]+)$/);
    
    // Handle different resources
    switch (resource) {
        case 'tasks':
            return handleTasksLocalFallback(method, resourceId ? resourceId[1] : null, data);
        case 'users':
            return handleUsersLocalFallback(method, resourceId ? resourceId[1] : null, data);
        case 'achievements':
            return handleAchievementsLocalFallback(method, resourceId ? resourceId[1] : null, data);
        case 'validation':
            return handleValidationLocalFallback(method, data);
        default:
            throw new Error(`Unsupported resource: ${resource}`);
    }
}

/**
 * Handle local fallback for tasks endpoints
 * @param {string} method - The HTTP method
 * @param {string} id - The task ID
 * @param {Object} data - The request data
 * @returns {Object} - The simulated response data
 */
function handleTasksLocalFallback(method, id, data) {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    switch (method) {
        case 'GET':
            if (id) {
                // Get single task
                const task = tasks.find(t => t.id === id);
                return task || { error: 'Task not found' };
            } else {
                // Get all tasks
                return { tasks };
            }
        case 'POST':
            // Create new task
            const newTask = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...data
            };
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return newTask;
        case 'PUT':
            // Update task
            if (!id) return { error: 'Task ID required' };
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex === -1) return { error: 'Task not found' };
            tasks[taskIndex] = { ...tasks[taskIndex], ...data, updatedAt: new Date().toISOString() };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks[taskIndex];
        case 'DELETE':
            // Delete task
            if (!id) return { error: 'Task ID required' };
            const filteredTasks = tasks.filter(t => t.id !== id);
            localStorage.setItem('tasks', JSON.stringify(filteredTasks));
            return { success: true };
        default:
            return { error: `Unsupported method: ${method}` };
    }
}

/**
 * Handle local fallback for users endpoints
 * @param {string} method - The HTTP method
 * @param {string} id - The user ID
 * @param {Object} data - The request data
 * @returns {Object} - The simulated response data
 */
function handleUsersLocalFallback(method, id, data) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    switch (method) {
        case 'GET':
            if (id) {
                // Get single user
                const user = users.find(u => u.id === id);
                return user || { error: 'User not found' };
            } else {
                // Get all users
                return { users };
            }
        case 'POST':
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...data
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            return newUser;
        case 'PUT':
            // Update user
            if (!id) return { error: 'User ID required' };
            const userIndex = users.findIndex(u => u.id === id);
            if (userIndex === -1) return { error: 'User not found' };
            users[userIndex] = { ...users[userIndex], ...data, updatedAt: new Date().toISOString() };
            localStorage.setItem('users', JSON.stringify(users));
            return users[userIndex];
        case 'DELETE':
            // Delete user
            if (!id) return { error: 'User ID required' };
            const filteredUsers = users.filter(u => u.id !== id);
            localStorage.setItem('users', JSON.stringify(filteredUsers));
            return { success: true };
        default:
            return { error: `Unsupported method: ${method}` };
    }
}

/**
 * Handle local fallback for achievements endpoints
 * @param {string} method - The HTTP method
 * @param {string} id - The achievement ID
 * @param {Object} data - The request data
 * @returns {Object} - The simulated response data
 */
function handleAchievementsLocalFallback(method, id, data) {
    // Get achievements from localStorage
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    
    switch (method) {
        case 'GET':
            if (id) {
                // Get single achievement
                const achievement = achievements.find(a => a.id === id);
                return achievement || { error: 'Achievement not found' };
            } else {
                // Get all achievements
                return { achievements };
            }
        case 'POST':
            // Create new achievement
            const newAchievement = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...data
            };
            achievements.push(newAchievement);
            localStorage.setItem('achievements', JSON.stringify(achievements));
            return newAchievement;
        case 'PUT':
            // Update achievement
            if (!id) return { error: 'Achievement ID required' };
            const achievementIndex = achievements.findIndex(a => a.id === id);
            if (achievementIndex === -1) return { error: 'Achievement not found' };
            achievements[achievementIndex] = { ...achievements[achievementIndex], ...data, updatedAt: new Date().toISOString() };
            localStorage.setItem('achievements', JSON.stringify(achievements));
            return achievements[achievementIndex];
        case 'DELETE':
            // Delete achievement
            if (!id) return { error: 'Achievement ID required' };
            const filteredAchievements = achievements.filter(a => a.id !== id);
            localStorage.setItem('achievements', JSON.stringify(filteredAchievements));
            return { success: true };
        default:
            return { error: `Unsupported method: ${method}` };
    }
}

/**
 * Handle local fallback for validation endpoints
 * @param {string} method - The HTTP method
 * @param {Object} data - The request data
 * @returns {Object} - The simulated response data
 */
function handleValidationLocalFallback(method, data) {
    if (method !== 'POST') {
        return { error: `Unsupported method: ${method}` };
    }
    
    // Use the AIValidation module if available
    if (window.AIValidation) {
        return window.AIValidation.validateTask(data);
    }
    
    // Fallback validation logic
    const isValid = Math.random() > 0.3; // 70% chance of success
    return {
        success: true,
        isValid,
        confidence: isValid ? (0.7 + Math.random() * 0.3).toFixed(2) : (0.3 + Math.random() * 0.4).toFixed(2),
        message: isValid ? 'Task validation successful!' : 'Task validation needs improvement',
        feedback: isValid ? 
            `Good job on your ${data.taskType} task. The evidence supports your work.` : 
            `We couldn't fully verify your ${data.taskType} task. Please provide clearer evidence.`
    };
}

/**
 * Task-related API functions
 */
const TasksAPI = {
    /**
     * Get all tasks
     * @returns {Promise<Array>} - Array of tasks
     */
    getAllTasks: async () => {
        const response = await apiRequest(API_CONFIG.endpoints.tasks);
        return response.tasks || [];
    },
    
    /**
     * Get a single task by ID
     * @param {string} taskId - The task ID
     * @returns {Promise<Object>} - The task object
     */
    getTaskById: async (taskId) => {
        return apiRequest(`${API_CONFIG.endpoints.tasks}/${taskId}`);
    },
    
    /**
     * Create a new task
     * @param {Object} taskData - The task data
     * @returns {Promise<Object>} - The created task
     */
    createTask: async (taskData) => {
        return apiRequest(API_CONFIG.endpoints.tasks, 'POST', taskData);
    },
    
    /**
     * Update a task
     * @param {string} taskId - The task ID
     * @param {Object} taskData - The updated task data
     * @returns {Promise<Object>} - The updated task
     */
    updateTask: async (taskId, taskData) => {
        return apiRequest(`${API_CONFIG.endpoints.tasks}/${taskId}`, 'PUT', taskData);
    },
    
    /**
     * Delete a task
     * @param {string} taskId - The task ID
     * @returns {Promise<Object>} - The response
     */
    deleteTask: async (taskId) => {
        return apiRequest(`${API_CONFIG.endpoints.tasks}/${taskId}`, 'DELETE');
    },
    
    /**
     * Get tasks assigned to a student
     * @param {string} studentId - The student ID
     * @returns {Promise<Array>} - Array of assigned tasks
     */
    getStudentTasks: async (studentId) => {
        const response = await apiRequest(`${API_CONFIG.endpoints.tasks}/student/${studentId}`);
        return response.tasks || [];
    },
    
    /**
     * Get tasks created by a teacher
     * @param {string} teacherId - The teacher ID
     * @returns {Promise<Array>} - Array of created tasks
     */
    getTeacherTasks: async (teacherId) => {
        const response = await apiRequest(`${API_CONFIG.endpoints.tasks}/teacher/${teacherId}`);
        return response.tasks || [];
    },
    
    /**
     * Submit a completed task
     * @param {string} taskId - The task ID
     * @param {Object} submissionData - The submission data
     * @returns {Promise<Object>} - The submission result
     */
    submitTask: async (taskId, submissionData) => {
        return apiRequest(`${API_CONFIG.endpoints.tasks}/${taskId}/submit`, 'POST', submissionData);
    },
    
    /**
     * Validate a task submission
     * @param {Object} submissionData - The submission data
     * @returns {Promise<Object>} - The validation result
     */
    validateTask: async (submissionData) => {
        return apiRequest(`${API_CONFIG.endpoints.validation}/task`, 'POST', submissionData);
    }
};

/**
 * User-related API functions
 */
const UsersAPI = {
    /**
     * Get all users
     * @returns {Promise<Array>} - Array of users
     */
    getAllUsers: async () => {
        const response = await apiRequest(API_CONFIG.endpoints.users);
        return response.users || [];
    },
    
    /**
     * Get a single user by ID
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} - The user object
     */
    getUserById: async (userId) => {
        return apiRequest(`${API_CONFIG.endpoints.users}/${userId}`);
    },
    
    /**
     * Get current user
     * @returns {Promise<Object>} - The current user object
     */
    getCurrentUser: async () => {
        if (!authToken) {
            return null;
        }
        return apiRequest(`${API_CONFIG.endpoints.users}/me`);
    },
    
    /**
     * Create a new user
     * @param {Object} userData - The user data
     * @returns {Promise<Object>} - The created user
     */
    createUser: async (userData) => {
        return apiRequest(API_CONFIG.endpoints.users, 'POST', userData);
    },
    
    /**
     * Update a user
     * @param {string} userId - The user ID
     * @param {Object} userData - The updated user data
     * @returns {Promise<Object>} - The updated user
     */
    updateUser: async (userId, userData) => {
        return apiRequest(`${API_CONFIG.endpoints.users}/${userId}`, 'PUT', userData);
    },
    
    /**
     * Delete a user
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} - The response
     */
    deleteUser: async (userId) => {
        return apiRequest(`${API_CONFIG.endpoints.users}/${userId}`, 'DELETE');
    },
    
     /**
      * Login a user
      * @param {string} email - The user email
      * @param {string} password - The user password
      * @returns {Promise<Object>} - The login result
      */
     login: async (email, password) => {
         const response = await apiRequest(API_CONFIG.endpoints.auth + '/login', 'POST', { email, password });

         if (response.token) {
             authToken = response.token;
             localStorage.setItem('authToken', authToken);

             if (response.user) {
                 currentUser = response.user;
                 localStorage.setItem('currentUser', JSON.stringify(currentUser));
             }
         }

         return response;
     },

     /**
      * Register a new user
      * @param {Object} userData - The user data (name, email, password)
      * @returns {Promise<Object>} - The registration result
      */
     register: async (userData) => {
         const response = await apiRequest(API_CONFIG.endpoints.auth + '/register', 'POST', userData);

         if (response.token) {
             authToken = response.token;
             localStorage.setItem('authToken', authToken);

             if (response.user) {
                 currentUser = response.user;
                 localStorage.setItem('currentUser', JSON.stringify(currentUser));
             }
         }

         return response;
     },

     /**
      * Logout the current user
      * @returns {Promise<Object>} - The logout result
      */
     logout: async () => {
         authToken = null;
         currentUser = null;
         localStorage.removeItem('authToken');
         localStorage.removeItem('currentUser');

         return { success: true };
     },

     /**
      * Get students for a teacher
      * @param {string} teacherId - The teacher ID
      * @returns {Promise<Array>} - Array of students
      */
     getTeacherStudents: async (teacherId) => {
         const response = await apiRequest(`${API_CONFIG.endpoints.users}/teacher/${teacherId}/students`);
         return response.students || [];
     }
 };

/**
 * Achievement-related API functions
 */
const AchievementsAPI = {
    /**
     * Get all achievements
     * @returns {Promise<Array>} - Array of achievements
     */
    getAllAchievements: async () => {
        const response = await apiRequest(API_CONFIG.endpoints.achievements);
        return response.achievements || [];
    },
    
    /**
     * Get a single achievement by ID
     * @param {string} achievementId - The achievement ID
     * @returns {Promise<Object>} - The achievement object
     */
    getAchievementById: async (achievementId) => {
        return apiRequest(`${API_CONFIG.endpoints.achievements}/${achievementId}`);
    },
    
    /**
     * Get achievements for a user
     * @param {string} userId - The user ID
     * @returns {Promise<Array>} - Array of user achievements
     */
    getUserAchievements: async (userId) => {
        const response = await apiRequest(`${API_CONFIG.endpoints.achievements}/user/${userId}`);
        return response.achievements || [];
    },
    
    /**
     * Award an achievement to a user
     * @param {string} userId - The user ID
     * @param {string} achievementId - The achievement ID
     * @returns {Promise<Object>} - The award result
     */
    awardAchievement: async (userId, achievementId) => {
        return apiRequest(`${API_CONFIG.endpoints.achievements}/award`, 'POST', { userId, achievementId });
    },
    
    /**
     * Check achievements for a user
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} - The check result
     */
    checkAchievements: async (userId) => {
        return apiRequest(`${API_CONFIG.endpoints.achievements}/check/${userId}`, 'POST');
    }
};

/**
 * Analytics-related API functions
 */
const AnalyticsAPI = {
    /**
     * Get user analytics
     * @param {string} userId - The user ID
     * @returns {Promise<Object>} - The user analytics
     */
    getUserAnalytics: async (userId) => {
        return apiRequest(`${API_CONFIG.endpoints.analytics}/user/${userId}`);
    },
    
    /**
     * Get class analytics for a teacher
     * @param {string} teacherId - The teacher ID
     * @returns {Promise<Object>} - The class analytics
     */
    getClassAnalytics: async (teacherId) => {
        return apiRequest(`${API_CONFIG.endpoints.analytics}/class/${teacherId}`);
    },
    
    /**
     * Get task analytics
     * @param {string} taskId - The task ID
     * @returns {Promise<Object>} - The task analytics
     */
    getTaskAnalytics: async (taskId) => {
        return apiRequest(`${API_CONFIG.endpoints.analytics}/task/${taskId}`);
    }
};

 // Export the API module
 window.EcoNovaAPI = {
     init: initApi,
     Tasks: TasksAPI,
     Users: UsersAPI,
     Achievements: AchievementsAPI,
     Analytics: AnalyticsAPI
 };

 let isApiInitialized = false;

 // Expose public functions
 window.API = {
     tasks: TasksAPI,
     users: UsersAPI,
     initApi: initApi,
     isInitialized: () => isApiInitialized,
     login: UsersAPI.login,
     register: UsersAPI.register,
     logout: UsersAPI.logout,
     // Add other public API functions here as they are implemented
 };

 // Initialize API
 (async () => {
     isApiInitialized = await initApi();
})();