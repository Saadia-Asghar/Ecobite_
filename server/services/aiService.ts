// Mock AI Service for EcoBite
// In production, this would integrate with Azure Custom Vision and Azure OpenAI

/**
 * Analyze food image using Azure Custom Vision
 * Falls back to mock data if Azure is not configured
 */
export async function analyzeImage(_imageUrl: string): Promise<{
    foodType: string;
    description: string;
    qualityScore: number;
}> {
    // Mock data for development
    console.log('Using mock AI data (Azure Custom Vision not configured)');
    const mockFoodTypes = ['Vegetables', 'Fruits', 'Bread', 'Prepared Meals', 'Dairy Products'];
    const randomType = mockFoodTypes[Math.floor(Math.random() * mockFoodTypes.length)];

    return {
        foodType: randomType,
        description: `Fresh ${randomType.toLowerCase()} suitable for donation`,
        qualityScore: Math.floor(Math.random() * 30) + 70 // 70-100
    };
}

/**
 * Generate marketing content for food requests using Azure OpenAI
 * Falls back to mock data if Azure is not configured
 */
export async function generateMarketingContent(
    foodType: string,
    quantity: string
): Promise<string[]> {
    // Mock data for development
    console.log('Using mock AI data (Azure OpenAI not configured)');
    return [
        `🆘 URGENT: We need ${quantity} of ${foodType} to feed families in need. Every donation counts! Can you help today?`,
        `💚 ${quantity} of ${foodType} needed! Your generosity can bring hope to those struggling with hunger. Donate now!`,
        `🙏 Help us provide ${foodType} to our community. We need ${quantity} to make a difference. Together we can end hunger!`
    ];
}

/**
 * Generate personalized impact story using Azure OpenAI
 * Falls back to mock data if Azure is not configured
 */
export async function generateImpactStory(stats: {
    donations: number;
    peopleFed: number;
    co2Saved: number;
}): Promise<string> {
    // Mock data for development
    console.log('Using mock AI data (Azure OpenAI not configured)');
    return generateMockImpactStory(stats);
}

function generateMockImpactStory(stats: {
    donations: number;
    peopleFed: number;
    co2Saved: number;
}): string {
    const stories = [
        `Amazing work! Your ${stats.donations} donations have fed ${stats.peopleFed} people and prevented ${stats.co2Saved}kg of CO2 emissions. You're making a real difference in fighting hunger and climate change!`,
        `What an incredible journey! Through ${stats.donations} generous donations, you've brought meals to ${stats.peopleFed} individuals while saving our planet from ${stats.co2Saved}kg of carbon emissions. Your impact is truly inspiring!`,
        `Your compassion shines through ${stats.donations} donations! You've nourished ${stats.peopleFed} people and protected our environment by preventing ${stats.co2Saved}kg of CO2 emissions. Thank you for being a food waste warrior!`
    ];

    return stories[Math.floor(Math.random() * stories.length)];
}

/**
 * Generate badge description
 */
export async function generateBadgeDescription(badgeName: string): Promise<string> {
    const descriptions: Record<string, string> = {
        'First Donation': '🎉 You made your first donation! Welcome to the EcoBite community!',
        'Week Warrior': '⚡ 7 days of consistent donations! You\'re on fire!',
        'Century Saver': '💯 100 donations milestone! You\'re a true hero!',
        'Eco Champion': '🌍 Your environmental impact is outstanding!',
        'Community Leader': '👑 Leading by example in the fight against food waste!'
    };

    return descriptions[badgeName] || `🏆 Congratulations on earning the ${badgeName} badge!`;
}

export default {
    analyzeImage,
    generateMarketingContent,
    generateImpactStory,
    generateBadgeDescription
};
