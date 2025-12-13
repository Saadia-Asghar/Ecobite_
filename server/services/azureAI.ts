import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

// Azure Computer Vision Configuration
let computerVisionClient: ComputerVisionClient | null = null;

/**
 * Initialize Azure Computer Vision client
 */
export function initializeComputerVision() {
    const endpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT;
    const key = process.env.AZURE_COMPUTER_VISION_KEY;

    if (!endpoint || !key) {
        console.log('⚠️  Azure Computer Vision not configured. Using mock AI.');
        return false;
    }

    try {
        const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
        computerVisionClient = new ComputerVisionClient(credentials, endpoint);
        console.log('✅ Azure Computer Vision initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Azure Computer Vision:', error);
        return false;
    }
}

/**
 * Analyze food image using Azure Computer Vision
 */
export async function analyzeFoodImage(imageUrl: string): Promise<{
    foodType: string;
    description: string;
    qualityScore: number;
    tags?: string[];
    confidence?: number;
}> {
    // If Computer Vision not configured, return mock data
    if (!computerVisionClient) {
        console.log('Using mock AI data (Azure Computer Vision not configured)');
        const mockFoodTypes = ['Vegetables', 'Fruits', 'Bread', 'Prepared Meals', 'Dairy Products'];
        const randomType = mockFoodTypes[Math.floor(Math.random() * mockFoodTypes.length)];
        
        return {
            foodType: randomType,
            description: `Fresh ${randomType.toLowerCase()} suitable for donation`,
            qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100
        };
    }

    try {
        // Analyze image using Azure Computer Vision
        const analysis = await computerVisionClient.analyzeImage(imageUrl, {
            visualFeatures: ['Categories', 'Description', 'Tags', 'Color'],
            details: ['Celebrities', 'Landmarks'],
        });

        // Extract food-related information
        const tags: string[] = (analysis.tags || [])
            .map(tag => tag?.name)
            .filter((name): name is string => typeof name === 'string' && name.length > 0);
        const description = analysis.description?.captions?.[0]?.text || 'Food item';
        const confidence = analysis.description?.captions?.[0]?.confidence || 0;

        // Determine food type from tags or categories
        let foodType = 'Food Item';
        const foodKeywords = ['vegetable', 'fruit', 'bread', 'meal', 'dairy', 'meat', 'grain', 'pasta', 'rice'];
        
        for (const tag of tags) {
            if (!tag) continue;
            const lowerTag = tag.toLowerCase();
            for (const keyword of foodKeywords) {
                if (lowerTag.includes(keyword)) {
                    foodType = tag.charAt(0).toUpperCase() + tag.slice(1);
                    break;
                }
            }
            if (foodType !== 'Food Item') break;
        }

        // Calculate quality score based on confidence and image analysis
        const qualityScore = Math.min(100, Math.max(70, Math.floor(confidence * 100)));

        return {
            foodType,
            description,
            qualityScore,
            tags,
            confidence,
        };
    } catch (error) {
        console.error('Azure Computer Vision error:', error);
        // Fallback to mock data on error
        const mockFoodTypes = ['Vegetables', 'Fruits', 'Bread', 'Prepared Meals', 'Dairy Products'];
        const randomType = mockFoodTypes[Math.floor(Math.random() * mockFoodTypes.length)];
        
        return {
            foodType: randomType,
            description: `Fresh ${randomType.toLowerCase()} suitable for donation`,
            qualityScore: Math.floor(Math.random() * 30) + 70,
        };
    }
}

/**
 * Analyze image from buffer (for uploaded files)
 */
export async function analyzeFoodImageFromBuffer(imageBuffer: Buffer): Promise<{
    foodType: string;
    description: string;
    qualityScore: number;
    tags?: string[];
    confidence?: number;
}> {
    if (!computerVisionClient) {
        return analyzeFoodImage(''); // Will return mock data
    }

    try {
        const analysis = await computerVisionClient.analyzeImageInStream(imageBuffer, {
            visualFeatures: ['Categories', 'Description', 'Tags', 'Color'],
            details: ['Celebrities', 'Landmarks'],
        });

        const tags: string[] = (analysis.tags || [])
            .map(tag => tag?.name)
            .filter((name): name is string => typeof name === 'string' && name.length > 0);
        const description = analysis.description?.captions?.[0]?.text || 'Food item';
        const confidence = analysis.description?.captions?.[0]?.confidence || 0;

        let foodType = 'Food Item';
        const foodKeywords = ['vegetable', 'fruit', 'bread', 'meal', 'dairy', 'meat', 'grain', 'pasta', 'rice'];
        
        for (const tag of tags) {
            if (!tag) continue;
            const lowerTag = tag.toLowerCase();
            for (const keyword of foodKeywords) {
                if (lowerTag.includes(keyword)) {
                    foodType = tag.charAt(0).toUpperCase() + tag.slice(1);
                    break;
                }
            }
            if (foodType !== 'Food Item') break;
        }

        const qualityScore = Math.min(100, Math.max(70, Math.floor(confidence * 100)));

        return {
            foodType,
            description,
            qualityScore,
            tags,
            confidence,
        };
    } catch (error) {
        console.error('Azure Computer Vision error (buffer):', error);
        const mockFoodTypes = ['Vegetables', 'Fruits', 'Bread', 'Prepared Meals', 'Dairy Products'];
        const randomType = mockFoodTypes[Math.floor(Math.random() * mockFoodTypes.length)];
        
        return {
            foodType: randomType,
            description: `Fresh ${randomType.toLowerCase()} suitable for donation`,
            qualityScore: Math.floor(Math.random() * 30) + 70,
        };
    }
}

/**
 * Check if Azure Computer Vision is configured
 */
export function isComputerVisionConfigured(): boolean {
    return !!(
        process.env.AZURE_COMPUTER_VISION_ENDPOINT &&
        process.env.AZURE_COMPUTER_VISION_KEY
    );
}

export default {
    initializeComputerVision,
    analyzeFoodImage,
    analyzeFoodImageFromBuffer,
    isComputerVisionConfigured,
};

