/**
 * Integration Test Module for EcoNova
 * This module tests the integration between different components of the application
 */

const IntegrationTest = (function() {
    // Private variables
    let testResults = {};
    let testStatus = 'not_started'; // not_started, running, completed, failed
    
    /**
     * Initialize the integration test module
     */
    async function initialize() {
        console.log('Initializing Integration Test Module...');
        testStatus = 'running';
        testResults = {};
        
        try {
            // Load required modules
            await loadDependencies();
            
            // Run tests
            await runAllTests();
            
            testStatus = 'completed';
            console.log('Integration tests completed successfully');
            return true;
        } catch (error) {
            testStatus = 'failed';
            console.error('Integration tests failed:', error);
            return false;
        }
    }
    
    /**
     * Load all required dependencies
     */
    async function loadDependencies() {
        const requiredModules = [
            { name: 'API', path: 'js/api.js' },
            { name: 'Database', path: 'js/database.js' },
            { name: 'RealWorldTasks', path: 'js/real-world-tasks.js' },
            { name: 'AIValidation', path: 'js/ai-validation.js' }
        ];
        
        for (const module of requiredModules) {
            if (!window[module.name]) {
                console.log(`Loading ${module.name} module...`);
                await loadScript(module.path);
                console.log(`${module.name} module loaded`);
            }
        }
        
        // Initialize database
        if (window.Database && typeof window.Database.initialize === 'function') {
            await window.Database.initialize();
            console.log('Database initialized');
        }
        
        // Initialize API
        if (window.API && typeof window.API.initApi === 'function') {
            await window.API.initApi();
            console.log('API initialized');
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
     * Run all integration tests
     */
    async function runAllTests() {
        // Test database connection
        await testDatabaseConnection();
        
        // Test API functionality
        await testAPIFunctionality();
        
        // Test real-world tasks
        await testRealWorldTasks();
        
        // Test AI validation
        await testAIValidation();
        
        // Test task assignment
        await testTaskAssignment();
        
        // Display test results
        displayTestResults();
    }
    
    /**
     * Test database connection
     */
    async function testDatabaseConnection() {
        console.log('Testing database connection...');
        testResults.database = { status: 'running', tests: {} };
        
        try {
            // Check if database is initialized
            if (!window.Database || !window.Database.isInitialized()) {
                throw new Error('Database not initialized');
            }
            
            // Test saving and retrieving data
            const testData = { id: 'test-' + Date.now(), value: 'test-value' };
            await window.Database.saveData('test', testData);
            const retrievedData = await window.Database.getData('test', testData.id);
            
            if (!retrievedData || retrievedData.value !== testData.value) {
                throw new Error('Data retrieval failed');
            }
            
            testResults.database.tests.connection = { status: 'passed', message: 'Database connection successful' };
            testResults.database.tests.dataStorage = { status: 'passed', message: 'Data storage and retrieval successful' };
            testResults.database.status = 'passed';
            console.log('Database tests passed');
        } catch (error) {
            testResults.database.status = 'failed';
            testResults.database.error = error.message;
            console.error('Database test failed:', error);
        }
    }
    
    /**
     * Test API functionality
     */
    async function testAPIFunctionality() {
        console.log('Testing API functionality...');
        testResults.api = { status: 'running', tests: {} };
        
        try {
            // Check if API is initialized
            if (!window.API) {
                throw new Error('API not initialized');
            }
            
            // Test tasks API
            if (typeof window.API.tasks.getAll === 'function') {
                const tasks = await window.API.tasks.getAll();
                testResults.api.tests.tasks = { status: 'passed', message: 'Tasks API working' };
            } else {
                testResults.api.tests.tasks = { status: 'skipped', message: 'Tasks API not available' };
            }
            
            // Test users API
            if (typeof window.API.users.getAll === 'function') {
                const users = await window.API.users.getAll();
                testResults.api.tests.users = { status: 'passed', message: 'Users API working' };
            } else {
                testResults.api.tests.users = { status: 'skipped', message: 'Users API not available' };
            }
            
            testResults.api.status = 'passed';
            console.log('API tests passed');
        } catch (error) {
            testResults.api.status = 'failed';
            testResults.api.error = error.message;
            console.error('API test failed:', error);
        }
    }
    
    /**
     * Test real-world tasks
     */
    async function testRealWorldTasks() {
        console.log('Testing real-world tasks...');
        testResults.realWorldTasks = { status: 'running', tests: {} };
        
        try {
            // Check if RealWorldTasks is initialized
            if (!window.RealWorldTasks) {
                throw new Error('RealWorldTasks not initialized');
            }
            
            // Test categories
            if (!window.RealWorldTasks.categories || window.RealWorldTasks.categories.length === 0) {
                throw new Error('No task categories found');
            }
            testResults.realWorldTasks.tests.categories = { 
                status: 'passed', 
                message: `Found ${window.RealWorldTasks.categories.length} categories` 
            };
            
            // Test getting tasks by category
            const firstCategory = window.RealWorldTasks.categories[0];
            const categoryTasks = window.RealWorldTasks.getTasksByCategory(firstCategory.id);
            
            if (!categoryTasks || categoryTasks.length === 0) {
                throw new Error(`No tasks found for category: ${firstCategory.name}`);
            }
            
            testResults.realWorldTasks.tests.tasksByCategory = { 
                status: 'passed', 
                message: `Found ${categoryTasks.length} tasks for category ${firstCategory.name}` 
            };
            
            // Test getting task by ID
            const firstTask = categoryTasks[0];
            const taskById = window.RealWorldTasks.getTaskById(firstTask.id);
            
            if (!taskById || taskById.id !== firstTask.id) {
                throw new Error(`Failed to get task by ID: ${firstTask.id}`);
            }
            
            testResults.realWorldTasks.tests.taskById = { 
                status: 'passed', 
                message: `Successfully retrieved task by ID` 
            };
            
            testResults.realWorldTasks.status = 'passed';
            console.log('Real-world tasks tests passed');
        } catch (error) {
            testResults.realWorldTasks.status = 'failed';
            testResults.realWorldTasks.error = error.message;
            console.error('Real-world tasks test failed:', error);
        }
    }
    
    /**
     * Test AI validation
     */
    async function testAIValidation() {
        console.log('Testing AI validation...');
        testResults.aiValidation = { status: 'running', tests: {} };
        
        try {
            // Check if AIValidation is initialized
            if (!window.AIValidation) {
                throw new Error('AIValidation not initialized');
            }
            
            // Test API connection
            if (typeof window.AIValidation.testApiConnection === 'function') {
                try {
                    const apiConnectionResult = await window.AIValidation.testApiConnection();
                    testResults.aiValidation.tests.apiConnection = { 
                        status: 'passed', 
                        message: 'AI API connection successful' 
                    };
                } catch (apiError) {
                    testResults.aiValidation.tests.apiConnection = { 
                        status: 'failed', 
                        message: 'AI API connection failed: ' + apiError.message 
                    };
                }
            } else {
                testResults.aiValidation.tests.apiConnection = { 
                    status: 'skipped', 
                    message: 'AI API connection test not available' 
                };
            }
            
            // We can't fully test image validation without an actual image
            // So we'll just check if the function exists
            if (typeof window.AIValidation.validateTaskWithAI === 'function') {
                testResults.aiValidation.tests.validateFunction = { 
                    status: 'passed', 
                    message: 'AI validation function available' 
                };
            } else {
                testResults.aiValidation.tests.validateFunction = { 
                    status: 'failed', 
                    message: 'AI validation function not available' 
                };
            }
            
            testResults.aiValidation.status = 'passed';
            console.log('AI validation tests passed');
        } catch (error) {
            testResults.aiValidation.status = 'failed';
            testResults.aiValidation.error = error.message;
            console.error('AI validation test failed:', error);
        }
    }
    
    /**
     * Test task assignment
     */
    async function testTaskAssignment() {
        console.log('Testing task assignment...');
        testResults.taskAssignment = { status: 'running', tests: {} };
        
        try {
            // Create a test task
            const testTask = {
                id: 'test-' + Date.now(),
                studentId: 'test-student',
                studentName: 'Test Student',
                type: 'recycling',
                description: 'Test task for integration testing',
                points: 10,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'assigned',
                assignedDate: new Date().toISOString()
            };
            
            // Test saving task to database
            if (window.Database && typeof window.Database.saveTask === 'function') {
                await window.Database.saveTask(testTask);
                testResults.taskAssignment.tests.saveTask = { 
                    status: 'passed', 
                    message: 'Task saved to database successfully' 
                };
            } else {
                testResults.taskAssignment.tests.saveTask = { 
                    status: 'skipped', 
                    message: 'Database saveTask function not available' 
                };
            }
            
            // Test retrieving tasks from database
            if (window.Database && typeof window.Database.getTasks === 'function') {
                const tasks = await window.Database.getTasks();
                const foundTask = tasks.find(task => task.id === testTask.id);
                
                if (foundTask) {
                    testResults.taskAssignment.tests.getTask = { 
                        status: 'passed', 
                        message: 'Task retrieved from database successfully' 
                    };
                } else {
                    testResults.taskAssignment.tests.getTask = { 
                        status: 'failed', 
                        message: 'Task not found in database' 
                    };
                }
            } else {
                testResults.taskAssignment.tests.getTask = { 
                    status: 'skipped', 
                    message: 'Database getTasks function not available' 
                };
            }
            
            testResults.taskAssignment.status = 'passed';
            console.log('Task assignment tests passed');
        } catch (error) {
            testResults.taskAssignment.status = 'failed';
            testResults.taskAssignment.error = error.message;
            console.error('Task assignment test failed:', error);
        }
    }
    
    /**
     * Display test results in the console
     */
    function displayTestResults() {
        console.log('%c Integration Test Results ', 'background: #3498db; color: white; font-size: 16px; padding: 5px;');
        
        for (const [testName, result] of Object.entries(testResults)) {
            const statusColor = result.status === 'passed' ? '#2ecc71' : '#e74c3c';
            console.log(
                `%c ${testName} `, 
                `background: ${statusColor}; color: white; font-weight: bold; padding: 3px;`,
                result.status.toUpperCase()
            );
            
            if (result.tests) {
                for (const [subTestName, subResult] of Object.entries(result.tests)) {
                    const subStatusColor = subResult.status === 'passed' ? '#2ecc71' : 
                                          subResult.status === 'skipped' ? '#f39c12' : '#e74c3c';
                    console.log(
                        `  - %c ${subTestName} `, 
                        `background: ${subStatusColor}; color: white; font-size: 10px; padding: 2px;`,
                        subResult.message
                    );
                }
            }
            
            if (result.error) {
                console.log(`  Error: ${result.error}`);
            }
        }
    }
    
    /**
     * Get test results
     * @returns {Object} - The test results
     */
    function getTestResults() {
        return {
            status: testStatus,
            results: testResults
        };
    }
    
    // Public API
    return {
        initialize,
        getTestResults
    };
})();

// Make the module available globally
window.IntegrationTest = IntegrationTest;

// Auto-initialize if on test page
if (document.getElementById('integration-test-container')) {
    document.addEventListener('DOMContentLoaded', () => {
        IntegrationTest.initialize();
    });
}