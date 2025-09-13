// Navigation Menu Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

if (burger) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('toggle');
    });
}

// Form Validation
const validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    // Reset previous errors
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });

    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error');
    });

    // Validate each input
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        const errorMessage = input.nextElementSibling;
        if (!errorMessage || !errorMessage.classList.contains('error-message')) return;

        if (input.required && !input.value.trim()) {
            errorMessage.textContent = 'This field is required';
            errorMessage.style.display = 'block';
            input.parentElement.classList.add('error');
            isValid = false;
        } else if (input.type === 'email' && !emailRegex.test(input.value) && input.value.trim()) {
            errorMessage.textContent = 'Please enter a valid email address';
            errorMessage.style.display = 'block';
            input.parentElement.classList.add('error');
            isValid = false;
        } else if (input.type === 'password' && input.value.length < 6 && input.value.trim()) {
            errorMessage.textContent = 'Password must be at least 6 characters';
            errorMessage.style.display = 'block';
            input.parentElement.classList.add('error');
            isValid = false;
        }
    });

    return isValid;
};

// Handle form submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm('registerForm')) {
            // Store user data in localStorage for demo purposes
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            const userData = {
                name,
                email,
                password, // In a real app, never store passwords in localStorage
                role
            };

            // Store user in localStorage
            localStorage.setItem('econova_user_' + email, JSON.stringify(userData));
            localStorage.setItem('econova_registered_users', 
                localStorage.getItem('econova_registered_users') ? 
                localStorage.getItem('econova_registered_users') + ',' + email : 
                email
            );

            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm('loginForm')) {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Check if user exists in localStorage
            const userData = localStorage.getItem('econova_user_' + email);
            if (userData) {
                const user = JSON.parse(userData);
                if (user.password === password) {
                    // Store logged in user
                    localStorage.setItem('econova_current_user', JSON.stringify(user));
                    
                    // Redirect based on role
                    if (user.role === 'Student') {
                        window.location.href = 'student-dashboard.html';
                    } else {
                        window.location.href = 'teacher-dashboard.html';
                    }
                } else {
                    alert('Invalid password');
                }
            } else {
                alert('User not found');
            }
        }
    });
}

// Check if user is logged in
const checkAuth = () => {
    const currentUser = localStorage.getItem('econova_current_user');
    const isAuthPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname.includes('register.html');
    
    if (!currentUser && !isAuthPage && 
        !window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/') {
        window.location.href = 'login.html';
    }

    if (currentUser && isAuthPage) {
        const user = JSON.parse(currentUser);
        if (user.role === 'Student') {
            window.location.href = 'student-dashboard.html';
        } else {
            window.location.href = 'teacher-dashboard.html';
        }
    }
};

// Initialize dashboard if on dashboard page
const initDashboard = () => {
    const currentUser = localStorage.getItem('econova_current_user');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    const welcomeMessage = document.querySelector('.welcome-message h2');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${user.name}!`;
    }

    // Initialize student dashboard specific elements
    if (user.role === 'Student') {
        initStudentDashboard(user);
    } 
    // Initialize teacher dashboard specific elements
    else if (user.role === 'Teacher') {
        initTeacherDashboard(user);
    }
};

// Initialize student dashboard
const initStudentDashboard = (user) => {
    // Set up progress data
    const progressElement = document.querySelector('.progress');
    if (progressElement) {
        // Get or initialize user progress
        let userProgress = localStorage.getItem('econova_progress_' + user.email);
        if (!userProgress) {
            userProgress = {
                completedLevels: [],
                currentLevel: 1,
                totalPoints: 0,
                badges: []
            };
            localStorage.setItem('econova_progress_' + user.email, JSON.stringify(userProgress));
        } else {
            userProgress = JSON.parse(userProgress);
        }

        // Update progress bar
        const progressPercentage = (userProgress.completedLevels.length / 20) * 100;
        progressElement.style.width = `${progressPercentage}%`;

        // Update points display
        const pointsElement = document.querySelector('.number');
        if (pointsElement) {
            pointsElement.textContent = userProgress.totalPoints;
        }

        // Initialize games grid
        initGamesGrid(userProgress);
    }
};

// Initialize teacher dashboard
const initTeacherDashboard = (user) => {
    // Get registered students
    const registeredUsers = localStorage.getItem('econova_registered_users');
    if (registeredUsers) {
        const emails = registeredUsers.split(',');
        const students = [];

        emails.forEach(email => {
            const userData = localStorage.getItem('econova_user_' + email);
            if (userData) {
                const user = JSON.parse(userData);
                if (user.role === 'Student') {
                    // Get student progress
                    let progress = localStorage.getItem('econova_progress_' + email);
                    if (progress) {
                        progress = JSON.parse(progress);
                    } else {
                        progress = {
                            completedLevels: [],
                            currentLevel: 1,
                            totalPoints: 0
                        };
                    }

                    students.push({
                        ...user,
                        progress
                    });
                }
            }
        });

        // Populate students table
        const studentsTableBody = document.querySelector('.students-table tbody');
        if (studentsTableBody) {
            studentsTableBody.innerHTML = '';
            
            if (students.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4">No students registered yet</td>`;
                studentsTableBody.appendChild(row);
            } else {
                students.forEach(student => {
                    const progressPercentage = (student.progress.completedLevels.length / 20) * 100;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="student-info">
                                <div class="student-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div>
                                    <div class="student-name">${student.name}</div>
                                    <div class="student-email">${student.email}</div>
                                </div>
                            </div>
                        </td>
                        <td class="progress-cell">
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${progressPercentage}%"></div>
                                </div>
                                <div class="progress-info">
                                    <span>Level ${student.progress.currentLevel}</span>
                                    <span>${student.progress.totalPoints} points</span>
                                </div>
                            </div>
                        </td>
                        <td>${student.progress.completedLevels.length} / 20 levels</td>
                        <td class="actions-cell">
                            <button class="action-btn view-student" data-email="${student.email}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    `;
                    studentsTableBody.appendChild(row);
                });

                // Add event listeners to view buttons
                const viewButtons = document.querySelectorAll('.view-student');
                viewButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const email = this.getAttribute('data-email');
                        // In a real app, this would navigate to a student detail page
                        alert(`Viewing student: ${email}`);
                    });
                });
            }
        }

        // Initialize reports
        initReports(students);
    }
};

// Initialize games grid
const initGamesGrid = (userProgress) => {
    const gamesGrid = document.querySelector('.games-grid');
    if (!gamesGrid) return;

    // Game levels data
    const levels = [
        {
            id: 1,
            name: "Level 1: Soil Basics",
            topics: ["Soil types", "Air", "Water cycle"],
            activityType: "Drag-and-drop labeling, quiz",
            icon: "fas fa-seedling",
            difficulty: "Easy"
        },
        {
            id: 2,
            name: "Level 2: Plants 101",
            topics: ["Seed germination", "Photosynthesis basics"],
            activityType: "Multiple-choice quiz",
            icon: "fas fa-leaf",
            difficulty: "Easy"
        },
        {
            id: 3,
            name: "Level 3: Air and Atmosphere",
            topics: ["Air composition", "Oxygen cycle"],
            activityType: "Matching game",
            icon: "fas fa-wind",
            difficulty: "Easy"
        },
        {
            id: 4,
            name: "Level 4: Food Chains",
            topics: ["Producers", "Consumers", "Decomposers"],
            activityType: "Scenario-based challenge",
            icon: "fas fa-link",
            difficulty: "Medium"
        },
        {
            id: 5,
            name: "Level 5: Water Resources",
            topics: ["Freshwater", "Groundwater", "Oceans"],
            activityType: "Sorting and categorization",
            icon: "fas fa-water",
            difficulty: "Medium"
        },
        {
            id: 6,
            name: "Level 6: Photosynthesis Advanced",
            topics: ["Chlorophyll", "Light reactions"],
            activityType: "Timed quiz",
            icon: "fas fa-sun",
            difficulty: "Medium"
        }
    ];

    // Clear grid
    gamesGrid.innerHTML = '';

    // Add game cards
    levels.forEach(level => {
        const isCompleted = userProgress.completedLevels.includes(level.id);
        const isLocked = level.id > userProgress.currentLevel && !isCompleted;

        const card = document.createElement('div');
        card.className = `game-card ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="game-card-image">
                <i class="${level.icon}"></i>
            </div>
            <div class="game-card-content">
                <h3>${level.name}</h3>
                <p>${level.topics.join(", ")}</p>
            </div>
            <div class="game-card-footer">
                <div class="difficulty">
                    <i class="fas fa-signal"></i>
                    <span>${level.difficulty}</span>
                </div>
                ${isCompleted ? 
                    '<span class="completed"><i class="fas fa-check-circle"></i> Completed</span>' : 
                    `<a href="game.html?level=${level.id}" class="play-btn" ${isLocked ? 'disabled' : ''}>Play</a>`
                }
            </div>
        `;

        gamesGrid.appendChild(card);
    });
};

// Initialize reports for teacher dashboard
const initReports = (students) => {
    // Example chart data
    const levelCompletionData = {
        labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'],
        datasets: [{
            label: 'Students Completed',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: '#4CAF50'
        }]
    };

    // Count completions for each level
    students.forEach(student => {
        student.progress.completedLevels.forEach(level => {
            if (level <= 6) { // We're only showing 6 levels in our chart
                levelCompletionData.datasets[0].data[level - 1]++;
            }
        });
    });

    // Render chart placeholder
    const levelCompletionChart = document.getElementById('levelCompletionChart');
    if (levelCompletionChart) {
        levelCompletionChart.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h4>Level Completion Statistics</h4>
                    <p>Number of students who completed each level</p>
                </div>
                <div class="chart-placeholder">
                    <div class="chart-bars">
                        ${levelCompletionData.datasets[0].data.map((value, index) => `
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="height: ${value * 30}px; background-color: #4CAF50;"></div>
                                <div class="chart-label">${levelCompletionData.labels[index]}</div>
                                <div class="chart-value">${value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Add some basic CSS for the chart
    const style = document.createElement('style');
    style.textContent = `
        .chart-placeholder {
            height: 200px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding: 20px;
        }
        .chart-bars {
            display: flex;
            align-items: flex-end;
            gap: 20px;
            height: 100%;
        }
        .chart-bar-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 40px;
        }
        .chart-bar {
            width: 40px;
            min-height: 1px;
            transition: height 0.5s ease;
        }
        .chart-label {
            margin-top: 5px;
            font-size: 12px;
        }
        .chart-value {
            margin-top: 5px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
};

// Game logic
const initGame = () => {
    const gameContainer = document.querySelector('.game-content');
    if (!gameContainer) return;

    // Get level ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const levelId = parseInt(urlParams.get('level')) || 1;

    // Get current user
    const currentUser = localStorage.getItem('econova_current_user');
    if (!currentUser) return;
    const user = JSON.parse(currentUser);

    // Get or initialize user progress
    let userProgress = localStorage.getItem('econova_progress_' + user.email);
    if (!userProgress) {
        userProgress = {
            completedLevels: [],
            currentLevel: 1,
            totalPoints: 0,
            badges: []
        };
    } else {
        userProgress = JSON.parse(userProgress);
    }

    // Set game title
    const gameTitleElement = document.querySelector('.game-title h2');
    if (gameTitleElement) {
        // Game levels data (simplified version)
        const levels = [
            { id: 1, name: "Level 1: Soil Basics" },
            { id: 2, name: "Level 2: Plants 101" },
            { id: 3, name: "Level 3: Air and Atmosphere" },
            { id: 4, name: "Level 4: Food Chains" },
            { id: 5, name: "Level 5: Water Resources" },
            { id: 6, name: "Level 6: Photosynthesis Advanced" }
        ];

        const level = levels.find(l => l.id === levelId) || levels[0];
        gameTitleElement.textContent = level.name;
    }

    // Sample questions for each level
    const questions = {
        1: [ // Soil Basics
            {
                question: "Which of the following is NOT a type of soil?",
                options: ["Sandy soil", "Clay soil", "Metallic soil", "Loamy soil"],
                correctAnswer: 2
            },
            {
                question: "What percentage of Earth's atmosphere is nitrogen?",
                options: ["21%", "78%", "1%", "50%"],
                correctAnswer: 1
            },
            {
                question: "Which process describes water changing from liquid to gas?",
                options: ["Condensation", "Precipitation", "Evaporation", "Collection"],
                correctAnswer: 2
            }
        ],
        2: [ // Plants 101
            {
                question: "What do plants need to germinate?",
                options: ["Only sunlight", "Water, oxygen, and suitable temperature", "Only water", "Carbon dioxide"],
                correctAnswer: 1
            },
            {
                question: "During photosynthesis, plants convert sunlight, water, and what else into glucose and oxygen?",
                options: ["Nitrogen", "Carbon dioxide", "Methane", "Hydrogen"],
                correctAnswer: 1
            },
            {
                question: "Which part of the plant absorbs water and nutrients from soil?",
                options: ["Leaves", "Stem", "Roots", "Flowers"],
                correctAnswer: 2
            }
        ],
        3: [ // Air and Atmosphere
            {
                question: "Which gas makes up the largest percentage of Earth's atmosphere?",
                options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
                correctAnswer: 2
            },
            {
                question: "What is the main source of oxygen in Earth's atmosphere?",
                options: ["Animals", "Plants", "Oceans", "Volcanoes"],
                correctAnswer: 1
            },
            {
                question: "Which layer of the atmosphere contains the ozone layer?",
                options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
                correctAnswer: 1
            }
        ],
        4: [ // Food Chains
            {
                question: "Which of the following is a producer in a food chain?",
                options: ["Lion", "Rabbit", "Grass", "Snake"],
                correctAnswer: 2
            },
            {
                question: "What is the main role of decomposers in an ecosystem?",
                options: ["To eat other animals", "To produce oxygen", "To break down dead organisms", "To pollinate plants"],
                correctAnswer: 2
            },
            {
                question: "Which of these is a primary consumer?",
                options: ["Eagle", "Grass", "Rabbit", "Wolf"],
                correctAnswer: 2
            }
        ],
        5: [ // Water Resources
            {
                question: "What percentage of Earth's water is freshwater?",
                options: ["About 3%", "About 50%", "About 75%", "About 97%"],
                correctAnswer: 0
            },
            {
                question: "Which of the following is NOT a source of groundwater pollution?",
                options: ["Agricultural runoff", "Industrial waste", "Rainfall", "Landfills"],
                correctAnswer: 2
            },
            {
                question: "What is the largest ocean on Earth?",
                options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
                correctAnswer: 3
            }
        ],
        6: [ // Photosynthesis Advanced
            {
                question: "What is the primary pigment in plants that absorbs light for photosynthesis?",
                options: ["Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin"],
                correctAnswer: 1
            },
            {
                question: "During which phase of photosynthesis is oxygen produced?",
                options: ["Calvin cycle", "Light-dependent reactions", "Dark reactions", "Krebs cycle"],
                correctAnswer: 1
            },
            {
                question: "Which of the following is NOT required for photosynthesis?",
                options: ["Water", "Carbon dioxide", "Oxygen", "Light"],
                correctAnswer: 2
            }
        ]
    };

    // Get questions for current level
    const levelQuestions = questions[levelId] || questions[1];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedOption = null;

    // Function to render current question
    const renderQuestion = () => {
        const question = levelQuestions[currentQuestionIndex];
        
        gameContainer.innerHTML = `
            <div class="game-question">
                <h3>${question.question}</h3>
            </div>
            <div class="game-options">
                ${question.options.map((option, index) => `
                    <div class="game-option" data-index="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to options
        const optionElements = gameContainer.querySelectorAll('.game-option');
        optionElements.forEach(element => {
            element.addEventListener('click', function() {
                // Remove selected class from all options
                optionElements.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Store selected option
                selectedOption = parseInt(this.getAttribute('data-index'));
                
                // Enable next button
                const nextButton = document.querySelector('.game-next-btn');
                if (nextButton) {
                    nextButton.disabled = false;
                }
            });
        });
    };

    // Function to check answer
    const checkAnswer = () => {
        if (selectedOption === null) return;

        const question = levelQuestions[currentQuestionIndex];
        const optionElements = gameContainer.querySelectorAll('.game-option');
        
        // Show correct and incorrect answers
        optionElements.forEach((element, index) => {
            if (index === question.correctAnswer) {
                element.classList.add('correct');
            } else if (index === selectedOption) {
                element.classList.add('incorrect');
            }
        });

        // Update score if correct
        if (selectedOption === question.correctAnswer) {
            score++;
        }

        // Disable options
        optionElements.forEach(element => {
            element.style.pointerEvents = 'none';
        });

        // Show feedback
        const feedback = document.createElement('div');
        feedback.className = 'game-feedback';
        feedback.innerHTML = selectedOption === question.correctAnswer ?
            '<p class="correct-feedback">Correct! Well done!</p>' :
            `<p class="incorrect-feedback">Incorrect. The correct answer is: ${question.options[question.correctAnswer]}</p>`;
        
        gameContainer.appendChild(feedback);

        // Update next button text for last question
        const nextButton = document.querySelector('.game-next-btn');
        if (nextButton && currentQuestionIndex === levelQuestions.length - 1) {
            nextButton.textContent = 'Finish';
        }
    };

    // Function to go to next question or finish game
    const nextQuestion = () => {
        currentQuestionIndex++;
        selectedOption = null;

        // Update progress bar
        const progressElement = document.querySelector('.game-progress-bar .progress');
        if (progressElement) {
            const progressPercentage = ((currentQuestionIndex) / levelQuestions.length) * 100;
            progressElement.style.width = `${progressPercentage}%`;
        }

        // If there are more questions, render next question
        if (currentQuestionIndex < levelQuestions.length) {
            renderQuestion();
            
            // Disable next button until an option is selected
            const nextButton = document.querySelector('.game-next-btn');
            if (nextButton) {
                nextButton.disabled = true;
            }
        } else {
            // Game finished, show results
            finishGame();
        }
    };

    // Function to finish game and show results
    const finishGame = () => {
        const passingScore = Math.ceil(levelQuestions.length / 2); // At least half correct to pass
        const passed = score >= passingScore;

        gameContainer.innerHTML = `
            <div class="game-results">
                <div class="result-icon">
                    <i class="fas ${passed ? 'fa-trophy' : 'fa-times-circle'}"></i>
                </div>
                <h3>${passed ? 'Congratulations!' : 'Try Again'}</h3>
                <p>You scored ${score} out of ${levelQuestions.length}</p>
                ${passed ? '<p class="success-message">You have completed this level!</p>' : 
                          '<p class="failure-message">You need to score at least ' + passingScore + ' to pass this level.</p>'}
                <div class="result-actions">
                    <button class="btn btn-primary retry-btn">Try Again</button>
                    <a href="student-dashboard.html" class="btn btn-secondary">Back to Dashboard</a>
                </div>
            </div>
        `;

        // Add event listener to retry button
        const retryButton = gameContainer.querySelector('.retry-btn');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                currentQuestionIndex = 0;
                score = 0;
                selectedOption = null;
                
                // Reset progress bar
                const progressElement = document.querySelector('.game-progress-bar .progress');
                if (progressElement) {
                    progressElement.style.width = '0%';
                }
                
                renderQuestion();
                
                // Disable next button until an option is selected
                const nextButton = document.querySelector('.game-next-btn');
                if (nextButton) {
                    nextButton.disabled = true;
                }
            });
        }

        // If passed, update user progress
        if (passed) {
            // Add level to completed levels if not already completed
            if (!userProgress.completedLevels.includes(levelId)) {
                userProgress.completedLevels.push(levelId);
                
                // Award points
                userProgress.totalPoints += score * 10;
                
                // Update current level if this is the current level
                if (userProgress.currentLevel === levelId) {
                    userProgress.currentLevel = levelId + 1;
                }
                
                // Save progress
                localStorage.setItem('econova_progress_' + user.email, JSON.stringify(userProgress));
            }
        }
    };

    // Initialize game
    renderQuestion();

    // Add event listener to next button
    const nextButton = document.querySelector('.game-next-btn');
    if (nextButton) {
        nextButton.disabled = true; // Disabled until an option is selected
        
        nextButton.addEventListener('click', () => {
            if (selectedOption !== null) {
                if (nextButton.textContent === 'Check Answer') {
                    checkAnswer();
                    nextButton.textContent = currentQuestionIndex === levelQuestions.length - 1 ? 'Finish' : 'Next Question';
                } else {
                    nextQuestion();
                    nextButton.textContent = 'Check Answer';
                }
            }
        });
    }

    // Add some basic styles for the game
    const style = document.createElement('style');
    style.textContent = `
        .game-feedback {
            margin-top: 20px;
            text-align: center;
        }
        .correct-feedback {
            color: #4CAF50;
            font-weight: bold;
        }
        .incorrect-feedback {
            color: #F44336;
        }
        .game-results {
            text-align: center;
            padding: 30px;
        }
        .result-icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        .result-icon .fa-trophy {
            color: #FFC107;
        }
        .result-icon .fa-times-circle {
            color: #F44336;
        }
        .success-message {
            color: #4CAF50;
            font-weight: bold;
            margin: 15px 0;
        }
        .failure-message {
            color: #F44336;
            margin: 15px 0;
        }
        .result-actions {
            margin-top: 30px;
            display: flex;
            justify-content: center;
            gap: 15px;
        }
    `;
    document.head.appendChild(style);
};

// Initialize logout functionality
const initLogout = () => {
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('econova_current_user');
            window.location.href = 'index.html';
        });
    }
};

// Run initialization functions
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initDashboard();
    initGame();
    initLogout();
});