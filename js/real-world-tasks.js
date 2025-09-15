/**
 * Real-World Environmental Tasks Module
 * Provides a collection of real-world environmental tasks for the EcoNova platform
 */

const realWorldTasks = {
    // Task categories
    categories: [
        { id: 'recycling', name: 'Recycling & Waste', icon: 'recycle' },
        { id: 'energy', name: 'Energy Conservation', icon: 'bolt' },
        { id: 'water', name: 'Water Conservation', icon: 'tint' },
        { id: 'planting', name: 'Planting & Gardening', icon: 'seedling' },
        { id: 'cleanup', name: 'Environmental Cleanup', icon: 'trash-alt' },
        { id: 'awareness', name: 'Environmental Awareness', icon: 'bullhorn' },
        { id: 'transportation', name: 'Sustainable Transportation', icon: 'bicycle' },
        { id: 'food', name: 'Sustainable Food', icon: 'carrot' },
        { id: 'community', name: 'Community Action', icon: 'users' }
    ],
    
    // Difficulty levels
    difficultyLevels: [
        { id: 'beginner', name: 'Beginner', points: 10 },
        { id: 'intermediate', name: 'Intermediate', points: 25 },
        { id: 'advanced', name: 'Advanced', points: 50 },
        { id: 'expert', name: 'Expert', points: 100 }
    ],
    
    // Task collection
    tasks: [
        // Recycling & Waste Tasks
        {
            id: 'recycling-1',
            title: 'Set Up a Home Recycling Station',
            category: 'recycling',
            difficulty: 'beginner',
            points: 10,
            description: 'Create a dedicated recycling station in your home with separate bins for different materials (paper, plastic, glass, metal).',
            requirements: 'Photo of your completed recycling station with labeled bins.',
            impact: 'Proper sorting increases recycling efficiency and reduces landfill waste.',
            tips: 'Use color-coded bins or clear labels. Place in an easily accessible location.'
        },
        {
            id: 'recycling-2',
            title: 'Plastic-Free Grocery Shopping',
            category: 'recycling',
            difficulty: 'intermediate',
            points: 25,
            description: 'Complete a grocery shopping trip without acquiring any single-use plastic packaging.',
            requirements: 'Photo of your groceries with reusable bags, containers, and plastic-free items.',
            impact: 'Reduces plastic waste and encourages sustainable packaging alternatives.',
            tips: 'Bring reusable produce bags, containers for bulk items, and shop at farmers markets.'
        },
        {
            id: 'recycling-3',
            title: 'Create a Compost System',
            category: 'recycling',
            difficulty: 'intermediate',
            points: 25,
            description: 'Set up a composting system for your food scraps and yard waste.',
            requirements: 'Photo of your compost bin/system and a short description of your setup.',
            impact: 'Diverts organic waste from landfills and creates nutrient-rich soil for plants.',
            tips: 'Include both "green" (food scraps) and "brown" (dry leaves, paper) materials.'
        },
        
        // Energy Conservation Tasks
        {
            id: 'energy-1',
            title: 'LED Lighting Upgrade',
            category: 'energy',
            difficulty: 'beginner',
            points: 10,
            description: 'Replace at least 5 conventional light bulbs in your home with energy-efficient LED bulbs.',
            requirements: 'Photo of the new LED bulbs installed and the old bulbs being properly recycled.',
            impact: 'LEDs use up to 75% less energy and last 25 times longer than incandescent lighting.',
            tips: 'Check for rebates from your utility company for LED purchases.'
        },
        {
            id: 'energy-2',
            title: 'Phantom Power Hunt',
            category: 'energy',
            difficulty: 'beginner',
            points: 10,
            description: 'Identify and unplug at least 5 devices in your home that consume standby power when not in use.',
            requirements: 'Photo of the devices unplugged or connected to a power strip that is turned off.',
            impact: 'Standby power can account for 5-10% of residential energy use.',
            tips: 'Common culprits include chargers, TVs, gaming consoles, and kitchen appliances.'
        },
        {
            id: 'energy-3',
            title: 'DIY Home Energy Audit',
            category: 'energy',
            difficulty: 'advanced',
            points: 50,
            description: 'Conduct a comprehensive energy audit of your home and implement at least 3 improvements.',
            requirements: 'Documentation of your audit findings and photos of the improvements made.',
            impact: 'Home energy audits can identify ways to reduce energy consumption by 5-30%.',
            tips: 'Check for air leaks, inspect insulation, evaluate appliances, and examine heating/cooling systems.'
        },
        
        // Water Conservation Tasks
        {
            id: 'water-1',
            title: 'Install a Rain Barrel',
            category: 'water',
            difficulty: 'intermediate',
            points: 25,
            description: 'Set up a rain barrel to collect rainwater from your roof for garden use.',
            requirements: 'Photo of your installed rain barrel connected to a downspout.',
            impact: 'A single rain barrel can save approximately 1,300 gallons of water during peak summer months.',
            tips: 'Ensure your barrel has a secure lid, overflow valve, and spigot for easy access.'
        },
        {
            id: 'water-2',
            title: 'Low-Flow Fixture Installation',
            category: 'water',
            difficulty: 'beginner',
            points: 10,
            description: 'Install at least one water-saving fixture in your home (faucet aerator, low-flow showerhead, or toilet tank bank).',
            requirements: 'Photo of the installed water-saving fixture.',
            impact: 'Low-flow fixtures can reduce water consumption by 30-50%.',
            tips: 'Many water utilities offer free water-saving devices to customers.'
        },
        {
            id: 'water-3',
            title: 'Greywater Garden System',
            category: 'water',
            difficulty: 'expert',
            points: 100,
            description: 'Create a simple greywater system to divert water from your washing machine or shower to your garden.',
            requirements: 'Photos and description of your greywater system setup and how it waters your plants.',
            impact: 'Greywater reuse can save 30-50% of household water consumption.',
            tips: 'Use biodegradable, plant-friendly soaps and detergents. Check local regulations before installation.'
        },
        
        // Planting & Gardening Tasks
        {
            id: 'planting-1',
            title: 'Native Plant Garden',
            category: 'planting',
            difficulty: 'intermediate',
            points: 25,
            description: 'Create a garden area with at least 5 different native plant species.',
            requirements: 'Photo of your native plant garden with labels identifying the species.',
            impact: 'Native plants support local wildlife, require less water, and reduce the need for fertilizers and pesticides.',
            tips: 'Research plants native to your specific region. Local extension offices can provide guidance.'
        },
        {
            id: 'planting-2',
            title: 'Start a Vegetable Garden',
            category: 'planting',
            difficulty: 'intermediate',
            points: 25,
            description: 'Create a vegetable garden with at least 3 different edible plants.',
            requirements: 'Photos of your garden setup and the plants as they grow.',
            impact: 'Growing your own food reduces transportation emissions and packaging waste.',
            tips: 'Start with easy-to-grow vegetables like lettuce, radishes, or herbs.'
        },
        {
            id: 'planting-3',
            title: 'Community Tree Planting',
            category: 'planting',
            difficulty: 'advanced',
            points: 50,
            description: 'Organize or participate in a community tree planting event.',
            requirements: 'Photos of the tree planting activity and a brief description of the event and your role.',
            impact: 'A single mature tree can absorb up to 48 pounds of carbon dioxide per year.',
            tips: "Partner with local environmental organizations or your city's parks department."
        },
        
        // Environmental Cleanup Tasks
        {
            id: 'cleanup-1',
            title: 'Personal Litter Collection',
            category: 'cleanup',
            difficulty: 'beginner',
            points: 10,
            description: 'Spend at least 30 minutes collecting litter in a public area (park, beach, trail, etc.).',
            requirements: 'Before and after photos of the area and a photo of the collected trash.',
            impact: 'Prevents pollution from entering waterways and harming wildlife.',
            tips: 'Wear gloves and use a grabber tool. Sort recyclables from trash when possible.'
        },
        {
            id: 'cleanup-2',
            title: 'Organize a Cleanup Event',
            category: 'cleanup',
            difficulty: 'advanced',
            points: 50,
            description: 'Organize a community cleanup event with at least 5 participants.',
            requirements: 'Photos of the event, participants, and collected waste. Include a brief summary of the results.',
            impact: 'Group cleanups can remove hundreds of pounds of trash in a single event.',
            tips: 'Provide supplies (bags, gloves), arrange for proper disposal, and consider tracking the types of trash collected.'
        },
        {
            id: 'cleanup-3',
            title: 'Adopt a Spot',
            category: 'cleanup',
            difficulty: 'intermediate',
            points: 25,
            description: 'Commit to maintaining a specific public area (street, park section, etc.) for at least one month with weekly cleanups.',
            requirements: 'Photos from each weekly cleanup and a log of your activities.',
            impact: 'Regular maintenance prevents litter accumulation and inspires others to keep areas clean.',
            tips: 'Choose a location you visit regularly. Post on social media to inspire others.'
        },
        
        // Environmental Awareness Tasks
        {
            id: 'awareness-1',
            title: 'Environmental Education Session',
            category: 'awareness',
            difficulty: 'intermediate',
            points: 25,
            description: 'Conduct an environmental education session for friends, family, or community members on an environmental topic.',
            requirements: 'Photos of your session, outline of content covered, and number of attendees.',
            impact: 'Environmental education leads to increased awareness and behavior change.',
            tips: "Choose a specific topic you're knowledgeable about. Include interactive elements."
        },
        {
            id: 'awareness-2',
            title: 'Create Environmental Infographic',
            category: 'awareness',
            difficulty: 'beginner',
            points: 10,
            description: 'Design an informative infographic about an environmental issue and share it on social media or in your community.',
            requirements: 'Copy of your infographic and documentation of how you shared it.',
            impact: 'Visual information can effectively communicate complex environmental concepts.',
            tips: 'Use reliable sources for your data. Keep text concise and use engaging visuals.'
        },
        {
            id: 'awareness-3',
            title: 'Environmental Documentary Screening',
            category: 'awareness',
            difficulty: 'intermediate',
            points: 25,
            description: 'Host a screening of an environmental documentary followed by a discussion.',
            requirements: 'Photo of the screening, list of attendees, and summary of key discussion points.',
            impact: 'Group viewings create shared understanding and motivation for action.',
            tips: 'Prepare discussion questions in advance. Consider partnering with a local organization.'
        },
        
        // Sustainable Transportation Tasks
        {
            id: 'transportation-1',
            title: 'Car-Free Week Challenge',
            category: 'transportation',
            difficulty: 'advanced',
            points: 50,
            description: 'Go without using a car for one full week, using only sustainable transportation methods.',
            requirements: 'Daily log of your transportation choices and photos of your alternative transportation.',
            impact: 'Transportation accounts for approximately 29% of greenhouse gas emissions in the US.',
            tips: 'Plan routes in advance. Consider walking, cycling, public transit, or carpooling.'
        },
        {
            id: 'transportation-2',
            title: 'Bike Maintenance Workshop',
            category: 'transportation',
            difficulty: 'intermediate',
            points: 25,
            description: 'Attend or host a bike maintenance workshop to promote cycling as sustainable transportation.',
            requirements: 'Photos from the workshop and a summary of skills learned or taught.',
            impact: 'Well-maintained bikes are more likely to be used regularly for transportation.',
            tips: 'Focus on basic skills like tire repair, chain maintenance, and brake adjustment.'
        },
        {
            id: 'transportation-3',
            title: 'EV or Alternative Fuel Research',
            category: 'transportation',
            difficulty: 'beginner',
            points: 10,
            description: 'Research electric vehicles or alternative fuel options and create a comparison chart for different models.',
            requirements: 'Your completed research document comparing at least 3 models.',
            impact: 'Informed consumers make more sustainable vehicle choices.',
            tips: 'Include factors like range, emissions, cost, and charging/fueling infrastructure.'
        },
        
        // Sustainable Food Tasks
        {
            id: 'food-1',
            title: 'Plant-Based Week',
            category: 'food',
            difficulty: 'intermediate',
            points: 25,
            description: 'Eat a completely plant-based diet for one week.',
            requirements: 'Daily food log with photos of your plant-based meals.',
            impact: 'Plant-based diets typically have a much lower carbon footprint than meat-heavy diets.',
            tips: 'Plan your meals in advance. Try new recipes to keep things interesting.'
        },
        {
            id: 'food-2',
            title: 'Zero Food Waste Challenge',
            category: 'food',
            difficulty: 'advanced',
            points: 50,
            description: 'Go one full week without wasting any food through careful planning, storage, and creative use of leftovers.',
            requirements: 'Daily log of your meals, food storage techniques, and strategies to prevent waste.',
            impact: 'About one-third of all food produced globally is wasted, contributing to greenhouse gas emissions.',
            tips: 'Take inventory before shopping. Store food properly. Learn to preserve foods.'
        },
        {
            id: 'food-3',
            title: 'Local Food Map',
            category: 'food',
            difficulty: 'beginner',
            points: 10,
            description: 'Create a map of local food sources in your community (farmers markets, CSAs, farm stands, etc.).',
            requirements: 'Your completed map in digital or physical form.',
            impact: 'Local food typically has a lower carbon footprint and supports the local economy.',
            tips: 'Include information about seasons, products available, and hours of operation.'
        },
        
        // Community Action Tasks
        {
            id: 'community-1',
            title: 'Contact Local Representatives',
            category: 'community',
            difficulty: 'beginner',
            points: 10,
            description: 'Write to or call your local representatives about an environmental issue important to your community.',
            requirements: 'Copy of your letter/email or notes from your call, including the issue addressed.',
            impact: 'Citizen input can influence policy decisions that affect the environment.',
            tips: "Be specific about the issue and what action you'd like them to take."
        },
        {
            id: 'community-2',
            title: 'Join Environmental Organization',
            category: 'community',
            difficulty: 'beginner',
            points: 10,
            description: 'Become a member of a local environmental organization and participate in at least one activity.',
            requirements: 'Proof of membership and photo/description of the activity you participated in.',
            impact: 'Environmental organizations amplify individual efforts through collective action.',
            tips: "Research organizations focused on issues you're passionate about."
        },
        {
            id: 'community-3',
            title: 'Environmental Petition Campaign',
            category: 'community',
            difficulty: 'advanced',
            points: 50,
            description: 'Create or actively support a petition for environmental change in your community, gathering at least 50 signatures.',
            requirements: 'Copy of the petition and documentation of signatures collected.',
            impact: 'Petitions demonstrate community support for environmental initiatives.',
            tips: 'Clearly state the issue and proposed solution. Use both online and in-person collection methods.'
        }
    ],
    
    // Get tasks by category
    getTasksByCategory: function(categoryId) {
        return this.tasks.filter(task => task.category === categoryId);
    },
    
    // Get tasks by difficulty
    getTasksByDifficulty: function(difficultyId) {
        return this.tasks.filter(task => task.difficulty === difficultyId);
    },
    
    // Get random tasks
    getRandomTasks: function(count = 3) {
        const shuffled = [...this.tasks].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },
    
    // Get task by ID
    getTaskById: function(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const difficulty = this.difficultyLevels.find(level => level.id === task.difficulty);
            return { ...task, points: difficulty ? difficulty.points : 0 };
        }
        return null;
    },

    // Get tasks by category
    getTasksByCategory: function(categoryId) {
        return this.tasks.filter(task => task.category === categoryId).map(task => {
            const difficulty = this.difficultyLevels.find(level => level.id === task.difficulty);
            return { ...task, points: difficulty ? difficulty.points : 0 };
        });
    },

    // Get tasks by difficulty
    getTasksByDifficulty: function(difficultyId) {
        return this.tasks.filter(task => task.difficulty === difficultyId).map(task => {
            const difficulty = this.difficultyLevels.find(level => level.id === task.difficulty);
            return { ...task, points: difficulty ? difficulty.points : 0 };
        });
    },

    // Get random tasks
    getRandomTasks: function(count = 3) {
        const shuffled = [...this.tasks].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(task => {
            const difficulty = this.difficultyLevels.find(level => level.id === task.difficulty);
            return { ...task, points: difficulty ? difficulty.points : 0 };
        });
    }
};

// Expose public functions
let isRealWorldTasksInitialized = false;

async function initRealWorldTasks() {
    // In a real application, this might involve fetching tasks from a backend
    // For now, we'll just simulate initialization.
    console.log('RealWorldTasks module initialized.');
    isRealWorldTasksInitialized = true;
    return true;
}

window.RealWorldTasks = {
    ...realWorldTasks,
    init: initRealWorldTasks,
    isInitialized: () => isRealWorldTasksInitialized,
};

// Initialize RealWorldTasks
(async () => {
    await initRealWorldTasks();
})();