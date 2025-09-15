/**
 * AI Task Validation Module using Gemini API
 * This module handles the AI-based validation of student-submitted real-world tasks
 */

// Configuration object for AI validation
const aiValidationConfig = {
    apiKey: null, // Will be loaded from .env
    modelName: 'gemini-2.5-flash-image-preview',
    maxRetries: 3,
    validationThreshold: 0.7, // Confidence threshold for automatic approval
    enabled: false, // Default to disabled until API key is loaded
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
    imageAnalysisPrompt: 'Analyze this environmental task image. Identify visible environmental actions, objects, and context. Determine if it shows evidence of the described task.'
};

/**
 * Initialize the AI validation module
 * @param {string} apiKey - The Gemini API key
 * @returns {boolean} - Whether initialization was successful
 */
function initAIValidation(apiKey) {
    if (!apiKey) {
        console.error('AI Validation Error: No API key provided');
        return false;
    }
    
    aiValidationConfig.apiKey = apiKey;
    aiValidationConfig.enabled = true;
    
    // Test the API connection
    testApiConnection().then(isConnected => {
        if (!isConnected) {
            console.warn('AI Validation API connection failed, some features may be limited');
        } else {
            console.log('AI Validation API connection successful');
        }
    });
    
    console.log('AI Validation initialized successfully');
    return true;
}

/**
 * Test the API connection
 * @returns {Promise<boolean>} - Whether the connection was successful
 */
async function testApiConnection() {
    try {
        // Simple text-only request to test the connection
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${aiValidationConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Hello, are you working?'
                    }]
                }]
            })
        });
        
        const data = await response.json();
        return response.ok && data.candidates && data.candidates.length > 0;
    } catch (error) {
        console.error('API connection test failed:', error);
        return false;
    }
}

/**
 * Validate a task submission using AI
 * @param {Object} submission - The task submission object
 * @param {string} submission.taskType - Type of environmental task
 * @param {string} submission.description - Student's description of the task
 * @param {string} submission.imageUrl - URL of the uploaded image
 * @returns {Promise<Object>} - Validation result
 */
async function validateTaskWithAI(submission) {
    if (!aiValidationConfig.enabled) {
        return {
            success: false,
            error: 'AI validation not enabled',
            message: 'Please initialize AI validation with a valid API key'
        };
    }
    
    try {
        console.log(`Validating task: ${submission.taskType} with AI`);
        
        // Extract keywords from description
        const description = submission.description.toLowerCase();
        const taskType = submission.taskType.toLowerCase();
        
        // Define task-specific keywords that would increase confidence
        const taskKeywords = {
            'recycling': ['recycle', 'plastic', 'paper', 'glass', 'waste', 'bin', 'sorted', 'separation'],
            'energy': ['energy', 'electricity', 'power', 'light', 'bulb', 'led', 'solar', 'conservation'],
            'water': ['water', 'conservation', 'tap', 'shower', 'leak', 'flow', 'save', 'usage'],
            'planting': ['plant', 'tree', 'garden', 'seed', 'grow', 'soil', 'green', 'nature'],
            'cleanup': ['clean', 'litter', 'trash', 'garbage', 'collect', 'environment', 'beach', 'park']
        };
        
        // Calculate base confidence based on image presence
        let confidence = 0.5; // Start with neutral confidence
        
        // Increase confidence if the description contains relevant keywords for the task type
        const relevantKeywords = taskKeywords[taskType] || [];
        let keywordMatches = 0;
        
        relevantKeywords.forEach(keyword => {
            if (description.includes(keyword)) {
                keywordMatches++;
                confidence += 0.05; // Increase confidence for each keyword match
            }
        });
        
        // Adjust confidence based on description length (more detailed descriptions are better)
        if (description.length > 100) {
            confidence += 0.1;
        } else if (description.length < 30) {
            confidence -= 0.1;
        }
        
        // Use Gemini API for image analysis if image is provided
        if (submission.imageUrl) {
            try {
                // Use the new image analysis function
                const imageAnalysis = await analyzeImageWithGemini(
                    submission.imageUrl,
                    taskType,
                    description
                );
                
                if (imageAnalysis.success) {
                    // Incorporate the AI's confidence into our overall confidence
                    confidence = (confidence + imageAnalysis.confidence) / 2;
                    
                    // Add any specific feedback from the image analysis
                    if (imageAnalysis.feedback) {
                        submission.aiImageFeedback = imageAnalysis.feedback;
                    }
                } else {
                    console.warn('Image analysis failed:', imageAnalysis.error);
                    confidence += 0.1; // Still give some credit for providing an image
                }
            } catch (error) {
                console.error('Error analyzing image with Gemini:', error);
                confidence += 0.1; // Still give some credit for providing an image
            }
        }
        
        // Cap confidence between 0 and 1
        confidence = Math.max(0, Math.min(1, confidence));
        
        // Determine if the task is valid based on the confidence threshold
        const isValid = confidence >= aiValidationConfig.validationThreshold;
        
        // Generate detailed feedback
        const feedback = generateDetailedFeedback(submission, confidence, keywordMatches, relevantKeywords.length);
        
        return {
            success: true,
            isValid: isValid,
            confidence: confidence.toFixed(2),
            message: isValid ? 
                'Task verification successful!' : 
                'Task verification needs improvement',
            feedback: feedback
        };
    } catch (error) {
        console.error('AI Validation Error:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to validate task with AI'
        };
    }
}

/**
 * Generate detailed feedback based on the submission and analysis
 * @param {Object} submission - The task submission
 * @param {number} confidence - The confidence score
 * @param {number} keywordMatches - Number of relevant keywords found
 * @param {number} totalKeywords - Total number of relevant keywords for this task type
 * @returns {string} - Detailed feedback message
 */
function generateDetailedFeedback(submission, confidence, keywordMatches, totalKeywords) {
    const taskType = submission.taskType;
    let feedback = '';
    
    // Base feedback based on confidence
    if (confidence > 0.9) {
        feedback = `Excellent work on your ${taskType} task! The evidence clearly shows your environmental contribution.`;
    } else if (confidence > 0.7) {
        feedback = `Good job on your ${taskType} task. The evidence supports your work, though some aspects could be clearer.`;
    } else if (confidence > 0.5) {
        feedback = `Your ${taskType} task shows some evidence of completion, but more details or clearer images would help verification.`;
    } else {
        feedback = `We couldn't fully verify your ${taskType} task. Please provide clearer evidence or a better description of your work.`;
    }
    
    // Add specific feedback about the description
    if (keywordMatches > 0) {
        const keywordPercentage = Math.round((keywordMatches / totalKeywords) * 100);
        if (keywordPercentage > 75) {
            feedback += ` Your description is very detailed and uses specific terminology related to ${taskType}.`;
        } else if (keywordPercentage > 50) {
            feedback += ` Your description contains good details about your ${taskType} activity.`;
        } else {
            feedback += ` Try to include more specific details about your ${taskType} activity in your description.`;
        }
    } else {
        feedback += ` Your description could be improved by including specific details about what you did for this ${taskType} task.`;
    }
    
    // Add feedback about the image
    if (submission.imageUrl) {
        if (confidence > 0.7) {
            feedback += ` The image you provided is clear and helps verify your work.`;
        } else {
            feedback += ` The image could be clearer to better show your environmental action.`;
        }
    } else {
        feedback += ` Please include an image that clearly shows your environmental action.`;
    }
    
    // Add task-specific tips
    switch (taskType.toLowerCase()) {
        case 'recycling':
            feedback += ` Remember to show sorted materials and proper recycling containers in your evidence.`;
            break;
        case 'energy':
            feedback += ` For energy conservation tasks, try to demonstrate before/after or show the specific energy-saving measures you implemented.`;
            break;
        case 'water':
            feedback += ` Water conservation evidence works best when you can show the specific water-saving methods or devices you used.`;
            break;
        case 'planting':
            feedback += ` For planting tasks, showing the full process from preparation to completed planting provides the best evidence.`;
            break;
        case 'cleanup':
            feedback += ` Cleanup tasks are best verified with before and after photos of the area you cleaned.`;
            break;
    }
    
    return feedback;
}

/**
 * Legacy feedback generator (kept for backward compatibility)
 * @param {Object} submission - The task submission
 * @param {number} confidence - The confidence score
 * @returns {string} - Feedback message
 */
function generateFeedback(submission, confidence) {
    return generateDetailedFeedback(submission, confidence, 0, 1);
}

/**
 * Load API key from environment variables
 * In a real application, this would be handled server-side
 * @returns {Promise<string|null>} - The API key or null if not found
 */
async function loadApiKeyFromEnv() {
    // In a real application, this would be handled server-side
    // For demo purposes, we'll simulate loading from localStorage
    return localStorage.getItem('gemini_api_key');
}

/**
 * Analyze an image using Gemini API
 * @param {string} imageDataUrl - The image data URL
 * @param {string} taskType - The type of task
 * @param {string} description - The task description
 * @returns {Promise<Object>} - The analysis result
 */
async function analyzeImageWithGemini(imageDataUrl, taskType, description) {
    try {
        // Extract base64 data from data URL
        const base64Data = imageDataUrl.split(',')[1];
        
        // Prepare the prompt for image analysis
        const prompt = `Analyze this environmental task image for a ${taskType} task. 
        Task description: "${description}"
        
        Determine if the image shows evidence of the described environmental action.
        Look for specific objects, actions, or environmental elements related to ${taskType}.
        Provide a confidence score (0-1) on how well the image matches the task description.`;
        
        // Call Gemini API
        const response = await fetch(`${aiValidationConfig.apiEndpoint}?key=${aiValidationConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
                    ]
                }]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            return { success: false, confidence: 0, error: 'No response from API' };
        }
        
        // Extract the text response
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Parse the response to determine confidence
        let confidence = 0.5; // Default middle confidence
        
        // Look for confidence indicators in the response
        if (aiResponse.toLowerCase().includes('strong evidence') || 
            aiResponse.toLowerCase().includes('clear match') || 
            aiResponse.toLowerCase().includes('definitely shows')) {
            confidence = 0.9;
        } else if (aiResponse.toLowerCase().includes('good evidence') || 
                  aiResponse.toLowerCase().includes('likely shows')) {
            confidence = 0.8;
        } else if (aiResponse.toLowerCase().includes('some evidence') || 
                  aiResponse.toLowerCase().includes('possibly shows')) {
            confidence = 0.6;
        } else if (aiResponse.toLowerCase().includes('little evidence') || 
                  aiResponse.toLowerCase().includes('unlikely')) {
            confidence = 0.3;
        } else if (aiResponse.toLowerCase().includes('no evidence') || 
                  aiResponse.toLowerCase().includes('does not show')) {
            confidence = 0.1;
        }
        
        // Extract any specific feedback from the AI response
        const feedback = aiResponse.split('\n').slice(0, 3).join('\n'); // Take first 3 lines as feedback
        
        return {
            success: true,
            confidence,
            feedback,
            rawResponse: aiResponse
        };
    } catch (error) {
        console.error('Error analyzing image with Gemini:', error);
        return {
            success: false,
            confidence: 0,
            error: error.message || 'Unknown error during image analysis'
        };
    }
}

// Export the module functions
window.AIValidation = {
    init: initAIValidation,
    validateTask: validateTaskWithAI,
    loadApiKey: loadApiKeyFromEnv,
    analyzeImage: analyzeImageWithGemini
};