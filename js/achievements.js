/**
 * Achievements and Badge System Module
 * Handles tracking, awarding, and displaying achievements and badges
 */

// Achievement and badge definitions
const achievementDefinitions = [
    {
        id: 'first_task',
        title: 'First Steps',
        description: 'Complete your first environmental task',
        icon: 'fas fa-seedling',
        requirement: { type: 'tasks_completed', count: 1 }
    },
    {
        id: 'task_master',
        title: 'Task Master',
        description: 'Complete 5 environmental tasks',
        icon: 'fas fa-check-double',
        requirement: { type: 'tasks_completed', count: 5 }
    },
    {
        id: 'eco_warrior',
        title: 'Eco Warrior',
        description: 'Complete 10 environmental tasks',
        icon: 'fas fa-shield-alt',
        requirement: { type: 'tasks_completed', count: 10 }
    },
    {
        id: 'recycling_hero',
        title: 'Recycling Hero',
        description: 'Complete 3 recycling tasks',
        icon: 'fas fa-recycle',
        requirement: { type: 'task_type_completed', taskType: 'recycling', count: 3 }
    },
    {
        id: 'energy_saver',
        title: 'Energy Saver',
        description: 'Complete 3 energy conservation tasks',
        icon: 'fas fa-bolt',
        requirement: { type: 'task_type_completed', taskType: 'energy', count: 3 }
    },
    {
        id: 'water_guardian',
        title: 'Water Guardian',
        description: 'Complete 3 water conservation tasks',
        icon: 'fas fa-tint',
        requirement: { type: 'task_type_completed', taskType: 'water', count: 3 }
    },
    {
        id: 'level_master',
        title: 'Level Master',
        description: 'Complete all game levels',
        icon: 'fas fa-gamepad',
        requirement: { type: 'levels_completed', count: 10 }
    },
    {
        id: 'point_collector',
        title: 'Point Collector',
        description: 'Earn 100 points',
        icon: 'fas fa-star',
        requirement: { type: 'points_earned', count: 100 }
    }
];

const badgeDefinitions = [
    {
        id: 'bronze_eco',
        title: 'Bronze Eco Badge',
        icon: 'fas fa-medal',
        color: '#cd7f32',
        requirement: { type: 'achievements_earned', count: 2 }
    },
    {
        id: 'silver_eco',
        title: 'Silver Eco Badge',
        icon: 'fas fa-medal',
        color: '#c0c0c0',
        requirement: { type: 'achievements_earned', count: 4 }
    },
    {
        id: 'gold_eco',
        title: 'Gold Eco Badge',
        icon: 'fas fa-medal',
        color: '#ffd700',
        requirement: { type: 'achievements_earned', count: 6 }
    },
    {
        id: 'platinum_eco',
        title: 'Platinum Eco Badge',
        icon: 'fas fa-award',
        color: '#e5e4e2',
        requirement: { type: 'achievements_earned', count: 8 }
    }
];

// DOM Elements
let achievementsContainer;
let badgeContainer;

// Initialize the achievements system
document.addEventListener('DOMContentLoaded', () => {
    // Initialize containers
    achievementsContainer = document.getElementById('achievements-container');
    badgeContainer = document.getElementById('badge-container');
    
    // If we're on the achievements page, display achievements and badges
    if (achievementsContainer && badgeContainer) {
        displayAchievements();
        displayBadges();
    }
    
    // Check for new achievements
    checkAchievements();
});

/**
 * Display all achievements in the achievements container
 */
function displayAchievements() {
    if (!achievementsContainer) return;
    
    // Clear container
    achievementsContainer.innerHTML = '';
    
    // Get user achievements
    const userAchievements = getUserAchievements();
    
    // Display each achievement
    achievementDefinitions.forEach(achievement => {
        const isUnlocked = userAchievements.includes(achievement.id);
        const progress = calculateAchievementProgress(achievement);
        
        const achievementCard = document.createElement('div');
        achievementCard.className = `achievement-card ${isUnlocked ? '' : 'achievement-locked'}`;
        
        achievementCard.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
            <div class="achievement-progress">
                <div class="achievement-progress-bar" style="width: ${progress}%"></div>
            </div>
            <p class="achievement-progress-text">${Math.round(progress)}% Complete</p>
        `;
        
        achievementsContainer.appendChild(achievementCard);
    });
}

/**
 * Display all badges in the badge container
 */
function displayBadges() {
    if (!badgeContainer) return;
    
    // Clear container
    badgeContainer.innerHTML = '';
    
    // Get user badges
    const userBadges = getUserBadges();
    
    // Display each badge
    badgeDefinitions.forEach(badge => {
        const isUnlocked = userBadges.includes(badge.id);
        
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${isUnlocked ? '' : 'badge-locked'}`;
        badgeElement.style.backgroundColor = isUnlocked ? badge.color : '#e0e0e0';
        
        badgeElement.innerHTML = `
            <i class="${badge.icon}"></i>
            <span class="badge-info">${badge.title}</span>
        `;
        
        badgeContainer.appendChild(badgeElement);
    });
}

/**
 * Calculate the progress percentage for an achievement
 * @param {Object} achievement - The achievement definition
 * @returns {number} - Progress percentage (0-100)
 */
function calculateAchievementProgress(achievement) {
    const requirement = achievement.requirement;
    let current = 0;
    let target = requirement.count;
    
    switch (requirement.type) {
        case 'tasks_completed':
            current = getCompletedTasksCount();
            break;
        case 'task_type_completed':
            current = getCompletedTasksCountByType(requirement.taskType);
            break;
        case 'levels_completed':
            current = getCompletedLevelsCount();
            break;
        case 'points_earned':
            current = getUserPoints();
            break;
    }
    
    return Math.min(100, (current / target) * 100);
}

/**
 * Check for newly completed achievements and badges
 */
function checkAchievements() {
    // Get current user achievements
    const userAchievements = getUserAchievements();
    const newAchievements = [];
    
    // Check each achievement
    achievementDefinitions.forEach(achievement => {
        // Skip if already earned
        if (userAchievements.includes(achievement.id)) return;
        
        // Check if achievement is completed
        if (isAchievementCompleted(achievement)) {
            // Add to user achievements
            userAchievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    });
    
    // Save updated achievements
    if (newAchievements.length > 0) {
        saveUserAchievements(userAchievements);
        notifyNewAchievements(newAchievements);
    }
    
    // Check for new badges
    checkBadges();
}

/**
 * Check for newly earned badges
 */
function checkBadges() {
    // Get current user badges
    const userBadges = getUserBadges();
    const newBadges = [];
    
    // Check each badge
    badgeDefinitions.forEach(badge => {
        // Skip if already earned
        if (userBadges.includes(badge.id)) return;
        
        // Check if badge is earned
        if (isBadgeEarned(badge)) {
            // Add to user badges
            userBadges.push(badge.id);
            newBadges.push(badge);
        }
    });
    
    // Save updated badges
    if (newBadges.length > 0) {
        saveUserBadges(userBadges);
        notifyNewBadges(newBadges);
    }
}

/**
 * Check if an achievement is completed
 * @param {Object} achievement - The achievement to check
 * @returns {boolean} - Whether the achievement is completed
 */
function isAchievementCompleted(achievement) {
    const requirement = achievement.requirement;
    
    switch (requirement.type) {
        case 'tasks_completed':
            return getCompletedTasksCount() >= requirement.count;
        case 'task_type_completed':
            return getCompletedTasksCountByType(requirement.taskType) >= requirement.count;
        case 'levels_completed':
            return getCompletedLevelsCount() >= requirement.count;
        case 'points_earned':
            return getUserPoints() >= requirement.count;
        default:
            return false;
    }
}

/**
 * Check if a badge is earned
 * @param {Object} badge - The badge to check
 * @returns {boolean} - Whether the badge is earned
 */
function isBadgeEarned(badge) {
    const requirement = badge.requirement;
    
    if (requirement.type === 'achievements_earned') {
        return getUserAchievements().length >= requirement.count;
    }
    
    return false;
}

/**
 * Get the number of completed tasks
 * @returns {number} - The number of completed tasks
 */
function getCompletedTasksCount() {
    const tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
    return tasks.filter(task => task.status === 'approved').length;
}

/**
 * Get the number of completed tasks of a specific type
 * @param {string} taskType - The task type to count
 * @returns {number} - The number of completed tasks of the specified type
 */
function getCompletedTasksCountByType(taskType) {
    const tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
    return tasks.filter(task => task.status === 'approved' && task.type === taskType).length;
}

/**
 * Get the number of completed game levels
 * @returns {number} - The number of completed levels
 */
function getCompletedLevelsCount() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return userData.completedLevels ? userData.completedLevels.length : 0;
}

/**
 * Get the user's current points
 * @returns {number} - The user's points
 */
function getUserPoints() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return userData.points || 0;
}

/**
 * Get the user's earned achievements
 * @returns {Array} - Array of achievement IDs
 */
function getUserAchievements() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return userData.achievements || [];
}

/**
 * Save the user's achievements
 * @param {Array} achievements - Array of achievement IDs
 */
function saveUserAchievements(achievements) {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    userData.achievements = achievements;
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

/**
 * Get the user's earned badges
 * @returns {Array} - Array of badge IDs
 */
function getUserBadges() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return userData.badges || [];
}

/**
 * Save the user's badges
 * @param {Array} badges - Array of badge IDs
 */
function saveUserBadges(badges) {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    userData.badges = badges;
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

/**
 * Notify the user of new achievements
 * @param {Array} achievements - Array of new achievements
 */
function notifyNewAchievements(achievements) {
    if (achievements.length === 0) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    // Add notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="notification-content">
            <h4>Achievement Unlocked!</h4>
            <p>${achievements[0].title}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
            
            // Show next achievement if there are more
            if (achievements.length > 1) {
                notifyNewAchievements(achievements.slice(1));
            }
        }, 500);
    }, 3000);
}

/**
 * Notify the user of new badges
 * @param {Array} badges - Array of new badges
 */
function notifyNewBadges(badges) {
    if (badges.length === 0) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification badge-notification';
    
    // Add notification content
    notification.innerHTML = `
        <div class="notification-icon" style="background-color: ${badges[0].color}">
            <i class="${badges[0].icon}"></i>
        </div>
        <div class="notification-content">
            <h4>New Badge Earned!</h4>
            <p>${badges[0].title}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
            
            // Show next badge if there are more
            if (badges.length > 1) {
                notifyNewBadges(badges.slice(1));
            }
        }, 500);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .achievement-notification {
        position: fixed;
        top: 20px;
        right: -300px;
        width: 280px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        padding: 15px;
        transition: right 0.5s ease;
        z-index: 1000;
    }
    
    .achievement-notification.show {
        right: 20px;
    }
    
    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #4CAF50;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        color: white;
        font-size: 18px;
    }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-content h4 {
        margin: 0 0 5px 0;
        font-size: 16px;
    }
    
    .notification-content p {
        margin: 0;
        font-size: 14px;
        color: #666;
    }
`;

document.head.appendChild(notificationStyles);

// Export functions for use in other modules
window.AchievementSystem = {
    checkAchievements,
    getUserAchievements,
    getUserBadges
};