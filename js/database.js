/**
 * EcoNova Database Module
 * Handles database connections and operations for the EcoNova platform
 */

// Database Configuration
const DB_CONFIG = {
    type: 'mongodb', // Options: 'indexeddb', 'firebase', 'mongodb'
    name: 'econova_db',
    version: 2, // Increment the version to trigger onupgradeneeded
    stores: [
        { name: 'users', keyPath: 'id' },
        { name: 'tasks', keyPath: 'id' },
        { name: 'submissions', keyPath: 'id' },
        { name: 'achievements', keyPath: 'id' },
        { name: 'analytics', keyPath: 'id' },
        { name: 'test', keyPath: 'id' } // Add the 'test' object store
    ],
    mongoAtlasConnectionString: 'YOUR_MONGODB_ATLAS_CONNECTION_STRING' // Placeholder for MongoDB Atlas
};

// Database connection
let db = null;
let inMemoryMongoDb = {}; // In-memory store for simulated MongoDB

// Expose public functions
window.Database = {
    initDatabase: initDatabase,
    isInitialized: () => db !== null,
    saveData: async function(storeName, item) {
        if (!item || !item.id) {
            throw new Error('Item must have an id to be saved.');
        }
        const existingItem = await getItem(storeName, item.id);
        if (existingItem) {
            return updateItem(storeName, item.id, item);
        } else {
            return addItem(storeName, item);
        }
    },
    // Add other public database functions here as they are implemented
    // For example: saveData, getData, etc.
};

/**
 * Initialize the database
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
async function initDatabase(options = {}) {
    try {
        // Override default config with options
        if (options.type) DB_CONFIG.type = options.type;
        if (options.name) DB_CONFIG.name = options.name;
        if (options.version) DB_CONFIG.version = options.version;
        if (options.stores) DB_CONFIG.stores = options.stores;
        
        // Initialize the appropriate database type
        switch (DB_CONFIG.type) {
            case 'indexeddb':
                return initIndexedDB();
            case 'firebase':
                return initFirebase(options.firebaseConfig);
            case 'mongodb':
                return initMongoDB(options.mongoConfig);
            default:
                throw new Error(`Unsupported database type: ${DB_CONFIG.type}`);
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
}

/**
 * Initialize IndexedDB
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
        
        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB connected successfully');
            resolve(true);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            // Create object stores
            DB_CONFIG.stores.forEach(store => {
                if (!database.objectStoreNames.contains(store.name)) {
                    database.createObjectStore(store.name, { keyPath: store.keyPath });
                    console.log(`Created object store: ${store.name}`);
                }
            });
        };
    });
}

/**
 * Initialize Firebase (placeholder for future implementation)
 * @param {Object} firebaseConfig - Firebase configuration
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
async function initFirebase(firebaseConfig) {
    // This would be implemented with Firebase SDK
    console.warn('Firebase database not implemented yet');
    return false;
}

/**
 * Initialize MongoDB (placeholder for future implementation)
 * @param {Object} mongoConfig - MongoDB configuration
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
async function initMongoDB(mongoConfig) {
    console.log('Attempting to connect to MongoDB Atlas via backend service...');
    // In a real application, this would involve configuring an API client
    // to communicate with your backend server that interacts with MongoDB Atlas.
    // The connection string (DB_CONFIG.mongoAtlasConnectionString) would be used on the backend.
    // For now, we'll simulate a successful connection.
    if (!DB_CONFIG.mongoAtlasConnectionString || DB_CONFIG.mongoAtlasConnectionString === 'YOUR_MONGODB_ATLAS_CONNECTION_STRING') {
        console.warn('MongoDB Atlas connection string not configured. Using simulated connection.');
    } else {
        console.log('Using MongoDB Atlas connection string:', DB_CONFIG.mongoAtlasConnectionString);
    }
    db = { type: 'mongodb', client: 'simulated-atlas' }; // Simulate a database connection object for Atlas
    console.log('Simulated MongoDB Atlas connection successful.');
    return true;
}

// MongoDB (simulated) specific operations
async function addMongoDbItem(storeName, item) {
    if (!inMemoryMongoDb[storeName]) {
        inMemoryMongoDb[storeName] = [];
    }
    // Ensure item has an ID
    if (!item.id) {
        item.id = Date.now().toString();
    }
    // Add timestamps
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    inMemoryMongoDb[storeName].push(item);
    return item;
}

async function getMongoDbItem(storeName, id) {
    if (!inMemoryMongoDb[storeName]) {
        return null;
    }
    return inMemoryMongoDb[storeName].find(item => item.id === id);
}

async function getAllMongoDbItems(storeName) {
    if (!inMemoryMongoDb[storeName]) {
        return [];
    }
    return [...inMemoryMongoDb[storeName]];
}

async function updateMongoDbItem(storeName, id, updates) {
    if (!inMemoryMongoDb[storeName]) {
        throw new Error(`Store not found: ${storeName}`);
    }
    let itemIndex = inMemoryMongoDb[storeName].findIndex(item => item.id === id);
    if (itemIndex === -1) {
        throw new Error(`Item not found: ${id}`);
    }
    const updatedItem = { ...inMemoryMongoDb[storeName][itemIndex], ...updates, updatedAt: new Date().toISOString() };
    inMemoryMongoDb[storeName][itemIndex] = updatedItem;
    return updatedItem;
}

async function deleteMongoDbItem(storeName, id) {
    if (!inMemoryMongoDb[storeName]) {
        return false;
    }
    const initialLength = inMemoryMongoDb[storeName].length;
    inMemoryMongoDb[storeName] = inMemoryMongoDb[storeName].filter(item => item.id !== id);
    return inMemoryMongoDb[storeName].length < initialLength;
}

async function queryMongoDbItems(storeName, filterFn) {
    if (!inMemoryMongoDb[storeName]) {
        return [];
    }
    return inMemoryMongoDb[storeName].filter(filterFn);
}

async function clearMongoDbStore(storeName) {
    inMemoryMongoDb[storeName] = [];
    return true;
}

async function importMongoDbData(storeName, items) {
    if (!inMemoryMongoDb[storeName]) {
        inMemoryMongoDb[storeName] = [];
    }
    for (const item of items) {
        if (!item.id) {
            item.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        }
        item.createdAt = item.createdAt || new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        inMemoryMongoDb[storeName].push(item);
    }
    return true;
}

async function exportMongoDbData(storeName) {
    return getAllMongoDbItems(storeName);
}

/**
 * Get a database transaction
 * @param {string} storeName - The object store name
 * @param {string} mode - The transaction mode ('readonly' or 'readwrite')
 * @returns {IDBTransaction} - The transaction
 */
function getTransaction(storeName, mode = 'readonly') {
    if (!db) throw new Error('Database not initialized');
    return db.transaction(storeName, mode);
}

/**
 * Get an object store
 * @param {string} storeName - The object store name
 * @param {string} mode - The transaction mode ('readonly' or 'readwrite')
 * @returns {IDBObjectStore} - The object store
 */
function getObjectStore(storeName, mode = 'readonly') {
    const transaction = getTransaction(storeName, mode);
    return transaction.objectStore(storeName);
}

/**
 * Add an item to a store
 * @param {string} storeName - The object store name
 * @param {Object} item - The item to add
 * @returns {Promise<Object>} - The added item
 */
async function addItem(storeName, item) {
    if (DB_CONFIG.type === 'mongodb') {
        return addMongoDbItem(storeName, item);
    }
    return new Promise((resolve, reject) => {
        try {
            // Ensure item has an ID
            if (!item.id) {
                item.id = Date.now().toString();
            }

            // Add timestamps
            item.createdAt = item.createdAt || new Date().toISOString();
            item.updatedAt = new Date().toISOString();

            const store = getObjectStore(storeName, 'readwrite');
            const request = store.add(item);

            request.onsuccess = () => resolve(item);
            request.onerror = (event) => reject(event.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get an item from a store by ID
 * @param {string} storeName - The object store name
 * @param {string} id - The item ID
 * @returns {Promise<Object>} - The item
 */
async function getItem(storeName, id) {
    if (DB_CONFIG.type === 'mongodb') {
        return getMongoDbItem(storeName, id);
    }
    return new Promise((resolve, reject) => {
        try {
            const store = getObjectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get all items from a store
 * @param {string} storeName - The object store name
 * @returns {Promise<Array>} - Array of items
 */
async function getAllItems(storeName) {
    if (DB_CONFIG.type === 'mongodb') {
        return getAllMongoDbItems(storeName);
    }
    return new Promise((resolve, reject) => {
        try {
            const store = getObjectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Update an item in a store
 * @param {string} storeName - The object store name
 * @param {string} id - The item ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} - The updated item
 */
async function updateItem(storeName, id, updates) {
    return new Promise((resolve, reject) => {
        try {
            const store = getObjectStore(storeName, 'readwrite');
            const request = store.get(id);
            
            request.onsuccess = () => {
                const item = request.result;
                if (!item) {
                    reject(new Error(`Item not found: ${id}`));
                    return;
                }
                
                // Apply updates
                const updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
                
                // Put back in store
                const updateRequest = store.put(updatedItem);
                updateRequest.onsuccess = () => resolve(updatedItem);
                updateRequest.onerror = (event) => reject(event.target.error);
            };
            
            request.onerror = (event) => reject(event.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Delete an item from a store
 * @param {string} storeName - The object store name
 * @param {string} id - The item ID
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
async function deleteItem(storeName, id) {
    return new Promise((resolve, reject) => {
        try {
            const store = getObjectStore(storeName, 'readwrite');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Query items from a store
 * @param {string} storeName - The object store name
 * @param {Function} filterFn - Filter function
 * @returns {Promise<Array>} - Array of matching items
 */
async function queryItems(storeName, filterFn) {
    try {
        const items = await getAllItems(storeName);
        return items.filter(filterFn);
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

/**
 * Clear all data from a store
 * @param {string} storeName - The object store name
 * @returns {Promise<boolean>} - Whether clear was successful
 */
async function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        try {
            const store = getObjectStore(storeName, 'readwrite');
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Import data into a store
 * @param {string} storeName - The object store name
 * @param {Array} items - Array of items to import
 * @returns {Promise<boolean>} - Whether import was successful
 */
async function importData(storeName, items) {
    try {
        const store = getObjectStore(storeName, 'readwrite');
        
        // Add each item
        for (const item of items) {
            // Ensure item has an ID and timestamps
            if (!item.id) {
                item.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            }
            
            item.createdAt = item.createdAt || new Date().toISOString();
            item.updatedAt = new Date().toISOString();
            
            await new Promise((resolve, reject) => {
                const request = store.put(item);
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        }
        
        return true;
    } catch (error) {
        console.error('Import error:', error);
        return false;
    }
}

/**
 * Export data from a store
 * @param {string} storeName - The object store name
 * @returns {Promise<Array>} - Array of exported items
 */
async function exportData(storeName) {
    try {
        return await getAllItems(storeName);
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}

/**
 * Migrate data from localStorage to IndexedDB
 * @returns {Promise<boolean>} - Whether migration was successful
 */
async function migrateFromLocalStorage() {
    try {
        // Migrate users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.length > 0) {
            await importData('users', users);
        }
        
        // Migrate tasks
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        if (tasks.length > 0) {
            await importData('tasks', tasks);
        }
        
        // Migrate assigned tasks
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        if (assignedTasks.length > 0) {
            await importData('tasks', assignedTasks.map(task => ({
                ...task,
                type: 'assigned'
            })));
        }
        
        // Migrate user tasks
        const userTasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
        if (userTasks.length > 0) {
            await importData('submissions', userTasks);
        }
        
        // Migrate achievements
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        if (achievements.length > 0) {
            await importData('achievements', achievements);
        }
        
        console.log('Data migration from localStorage completed');
        return true;
    } catch (error) {
        console.error('Migration error:', error);
        return false;
    }
}

// Export the database module
window.EcoNovaDB = {
    init: initDatabase,
    add: addItem,
    get: getItem,
    getAll: getAllItems,
    update: updateItem,
    delete: deleteItem,
    query: queryItems,
    clear: clearStore,
    import: importData,
    export: exportData,
    migrate: migrateFromLocalStorage,
    saveData: async function(storeName, item) {
        if (!item || !item.id) {
            throw new Error('Item must have an id to be saved.');
        }
        const existingItem = await getItem(storeName, item.id);
        if (existingItem) {
            return updateItem(storeName, item.id, item);
        } else {
            return addItem(storeName, item);
        }
    }
};

// Initialize the database
(async () => {
    await initDatabase();
})();