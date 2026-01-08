// AI Service for EcoBite
// Uses Azure Computer Vision for food image analysis
// Falls back to mock data if Azure is not configured

import * as azureAI from './azureAI.js';

/**
 * Analyze food image using Azure Computer Vision
 * Falls back to mock data if Azure is not configured
 */
export async function analyzeImage(imageUrl: string): Promise<{
    foodType: string;
    description: string;
    qualityScore: number;
    detectedText?: string;
}> {
    // Use Azure Computer Vision if configured
    if (azureAI.isComputerVisionConfigured()) {
        try {
            const result = await azureAI.analyzeFoodImage(imageUrl);
            console.log('✅ Azure Computer Vision analysis complete');
            return {
                foodType: result.foodType,
                description: result.description,
                qualityScore: result.qualityScore,
                detectedText: result.detectedText
            };
        } catch (error) {
            console.error('Azure Computer Vision error, using fallback:', error);
        }
    }

    // Fallback to mock data
    console.log('Using mock AI data (Azure Computer Vision not configured)');
    const mockFoodTypes = ['Vegetables', 'Fruits', 'Bread', 'Prepared Meals', 'Dairy Products'];
    const randomType = mockFoodTypes[Math.floor(Math.random() * mockFoodTypes.length)];

    return {
        foodType: randomType,
        description: `Fresh ${randomType.toLowerCase()} suitable for donation`,
        qualityScore: Math.floor(Math.random() * 30) + 70 // 70-100
    };
}

/**
 * Generate marketing content for food requests using a Deterministic Template Engine
 * (Replaces OpenAI for cost-efficiency and reliability)
 */
export async function generateMarketingContent(
    foodType: string,
    quantity: string
): Promise<string[]> {
    const templates = [
        // Professional/Urgent
        `🆘 URGENT: We are currently in need of ${quantity} of ${foodType} to support local families. Your donation ensures no one goes hungry tonight. Every contribution makes an impact! 💚`,
        // Community-focused
        `🏠 Community Support Needed: Join us in our mission to provide ${foodType} to those who need it most. We're looking to collect ${quantity} this week. Together, we can strengthen our community! 🙏`,
        // Emotional/Heartfelt
        `✨ A small gesture can make a big difference. We're requesting ${quantity} of ${foodType} to bring hope and nourishment to individuals in need. Will you be their hero today? 🥦🍎`,
        // Action-oriented
        `🚀 Help us bridge the gap! Our team is working hard to secure ${quantity} of ${foodType} for our food bank. Be a part of the solution and donate your surplus today through EcoBite! 🌍`,
        // Impact-focused
        `📈 Did you know? By donating ${quantity} of ${foodType}, you're not just feeding people—you're also preventing carbon emissions from entering our atmosphere. Join our green movement! 🌱`
    ];

    // Shuffle and return 3 random drafts
    return templates.sort(() => 0.5 - Math.random()).slice(0, 3);
}

/**
 * Generate personalized impact story using pre-defined narratives
 * (Replaces OpenAI for instant, consistent branding)
 */
export async function generateImpactStory(stats: {
    donations: number;
    peopleFed: number;
    co2Saved: number;
}): Promise<string> {
    const stories = [
        `🌟 Impact Milestone! \n\nYour incredible commitment to EcoBite has led to ${stats.donations || 0} donations, providing life-sustaining meals for ${stats.peopleFed || 0} people! By choosing to rescue food, you've also successfully diverted ${stats.co2Saved || 0}kg of CO2 from our environment. You're not just a donor; you're a climate hero! 🌍💪`,

        `🍃 A Greener Future Starts with You! \n\nThrough your ${stats.donations || 0} generous acts, you've made a tangible difference in the lives of ${stats.peopleFed || 0} individuals. Beyond the meals, you've saved ${stats.co2Saved || 0}kg of carbon emissions, proving that sustainable living is within everyone's reach. Thank you for being a part of the EcoBite revolution! ✨`,

        `🤝 Community Champion Spotlight! \n\nEvery donation tells a story of compassion. Your ${stats.donations || 0} contributions have directly nourished ${stats.peopleFed || 0} community members. Plus, by preventing food waste, you've protected our planet from ${stats.co2Saved || 0}kg of CO2 emissions. Your ripple effect of kindness is inspiring! ❤️🙌`,

        `📊 Data-Driven Kindness! \n\nNumbers tell a powerful story: ${stats.donations || 0} donations, ${stats.peopleFed || 0} meals served, and ${stats.co2Saved || 0}kg of CO2 saved. You are at the forefront of the fight against food waste and hunger. Stay inspired—the world needs more EcoBite warriors like you! 🍎🚀`
    ];

    return stories[Math.floor(Math.random() * stories.length)];
}

/**
 * Generate badge description
 */
export async function generateBadgeDescription(badgeName: string): Promise<string> {
    const descriptions: Record<string, string> = {
        'First Donation': '🎉 You\'ve officially joined the movement! Your first donation is the first step towards a zero-waste world.',
        'Week Warrior': '⚡ Consistency is key! You\'ve donated for 7 days straight, providing reliable support to our partners.',
        'Century Saver': '💯 One. Hundred. Donations. You are an absolute legend in the fight against food waste and hunger!',
        'Eco Champion': '🌍 Your environmental footprint just got lighter. Your high volume of donations has significantly saved CO2!',
        'Community Leader': '👑 Setting the bar high! You are one of our top contributors, leading the community by example.',
        'Social Guardian': '🛡️ By sharing your impact stories and requests, you\'re spreading awareness and inspiring others to act.'
    };

    return descriptions[badgeName] || `🏆 Incredible achievement! You\'ve earned the ${badgeName} badge for your outstanding dedication to social impact.`;
}


/**
 * Generate a personalized welcome message based on user role
 */
export async function generateWelcomeMessage(name: string, role: string): Promise<string> {
    const messages: Record<string, string[]> = {
        'Individual': [
            `Welcome, ${name}! Ready to turn your surplus into someone's meal? 🍎`,
            `Hi ${name}! Every small donation counts. Let's start reducing waste today! ✨`,
            `Glad you're here, ${name}. Your kitchen is now a part of the global food rescue mission! 🏠`
        ],
        'Restaurant': [
            `Welcome back, Chef ${name}! Let's make sure your delicious surplus finds a good home. 👨‍🍳`,
            `Business with a purpose! ${name}, your commitment to zero-waste sets a great example. 📈`,
            `Ready to serve the community, ${name}? Let's list those surplus items! 🍽️`
        ],
        'NGO': [
            `Greetings, ${name}! We've found some potential donations for your community today. 🤝`,
            `Hello ${name}! Thank you for being the bridge between surplus and those in need. 🆘`,
            `Welcome, ${name}. Let's get those appeals drafted and food delivered! 🚚`
        ],
        'Animal Shelter': [
            `Woof! Welcome, ${name}. Let's find some treats for our furry friends! 🐾`,
            `Hi ${name}! Ready to rescue some food for the animals today? 🦴`,
            `Welcome back! Let's ensure no bowl goes empty. 🐕‍🦺`
        ]
    };

    const roleMessages = messages[role] || [
        `Welcome to EcoBite, ${name}! Let's make a difference today. 🌍`
    ];
    return roleMessages[Math.floor(Math.random() * roleMessages.length)];
}

/**
 * Generate a food safety tip based on food type
 */
export async function generateSafetyTip(foodType?: string): Promise<string> {
    const generalTips = [
        "Keep it cool! Always store perishables at or below 5°C (41°F). ❄️",
        "When in doubt, throw it out! Safety is our number one priority. ⚠️",
        "Label everything! Clear expiry dates help our NGOs plan better. 🏷️",
        "Wash your hands for at least 20 seconds before handling donations. 🧼",
        "FIFO: First In, First Out. Use older items before they reach expiry! 🔄"
    ];

    const specificTips: Record<string, string[]> = {
        'Vegetables': [
            "Store leafy greens with a paper towel to absorb excess moisture. 🥬",
            "Keep tomatoes at room temperature for the best flavor and texture! 🍅"
        ],
        'Fruits': [
            "Keep apples away from other fruits as they release gases that speed up ripening. 🍎",
            "Don't wash berries until you're ready to eat or donate them to prevent mold. 🍓"
        ],
        'Bread': [
            "Keep bread in a cool, dry place. For longer storage, freezing is best! 🍞",
            "Slightly stale bread is perfect for croutons or breadcrumbs! 🥖"
        ],
        'Dairy Products': [
            "Keep dairy in the back of the fridge where it's coldest, not in the door. 🥛",
            "Hard cheeses can be frozen for up to 6 months! 🧀"
        ],
        'Prepared Meals': [
            "Reheat prepared meals to an internal temperature of 74°C (165°F). 🔥",
            "Cool cooked food quickly before refrigerating to prevent bacterial growth. 🥘"
        ]
    };

    if (foodType && specificTips[foodType]) {
        return specificTips[foodType][Math.floor(Math.random() * specificTips[foodType].length)];
    }
    return generalTips[Math.floor(Math.random() * generalTips.length)];
}

/**
 * Generate an inspirational eco-quote
 */
export async function generateEcoQuote(): Promise<string> {
    const quotes = [
        "\"Cutting food waste is a delicious way of saving money, helping people and protecting the planet.\" — Tristram Stuart",
        "\"If you can't feed a hundred people, then feed just one.\" — Mother Teresa",
        "\"Respect for food is a respect for life, for who we are and what we do.\" — Thomas Keller",
        "\"The greatest threat to our planet is the belief that someone else will save it.\" — Robert Swan",
        "\"Reducing food waste is one of the most important things we can do to reverse global warming.\" — Chad Frischmann"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

export default {
    analyzeImage,
    generateMarketingContent,
    generateImpactStory,
    generateBadgeDescription,
    generateWelcomeMessage,
    generateSafetyTip,
    generateEcoQuote
};

