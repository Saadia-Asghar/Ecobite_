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
    detectedText?: string;
}> {
    // If Computer Vision not configured, return mock data
    if (!computerVisionClient) {
        console.log('Using mock AI data (Azure Computer Vision not configured)');
        return {
            foodType: 'Vegetables',
            description: 'Fresh organic greens',
            qualityScore: 92,
            detectedText: 'Exp: Dec 2025'
        };
    }

    try {
        // 1. Analyze image visual features
        const analysis = await computerVisionClient.analyzeImage(imageUrl, {
            visualFeatures: ['Categories', 'Description', 'Tags', 'Color', 'Objects'],
        });

        // 2. OCR (Read API) for Expiry Labels
        let detectedText = '';
        try {
            const ocrResult = await computerVisionClient.recognizePrintedText(false, imageUrl);
            detectedText = ocrResult.regions?.map(r =>
                r.lines?.map(l => l.words?.map(w => w.text).join(' ')).join('\n')
            ).join('\n') || '';
        } catch (ocrErr) {
            console.warn('OCR Failed, continuing with visual analysis only');
        }

        const tags: string[] = (analysis.tags || [])
            .map(tag => tag?.name)
            .filter((name): name is string => typeof name === 'string');
        const description = analysis.description?.captions?.[0]?.text || 'Food item';
        const confidence = analysis.description?.captions?.[0]?.confidence || 0;

        // Determine food type
        let foodType = 'Food Item';
        const foodKeywords = ['vegetable', 'fruit', 'bread', 'meal', 'dairy', 'meat', 'grain', 'pasta', 'rice'];
        for (const tag of tags) {
            if (foodKeywords.some(kw => tag.toLowerCase().includes(kw))) {
                foodType = tag.charAt(0).toUpperCase() + tag.slice(1);
                break;
            }
        }

        // Feature 3: Multi-Factor Quality Score
        // Base score on AI confidence + color vibrancy
        const colorVibe = analysis.color?.isBWImg ? 0.5 : (analysis.color?.accentColor ? 1.0 : 0.8);

        const negativeKeywords = [
            'dirty', 'waste', 'trash', 'mold', 'dark', 'rotten', 'decay',
            'spoil', 'bruise', 'brown', 'fungus', 'slime', 'wrinkled', 'aged',
            'maggot', 'fly', 'insect', 'damaged'
        ];

        // Color-based Rot Detection (Brown/Grey/Black in food is often bad)
        const suspiciousColors = ['Brown', 'Grey', 'Black'];
        const isSuspiciousColor = suspiciousColors.includes(analysis.color?.dominantColorForeground || '');

        const hasNegativeIndicator = tags.some(t => negativeKeywords.includes(t.toLowerCase())) ||
            negativeKeywords.some(kw => description.toLowerCase().includes(kw)) ||
            (isSuspiciousColor && tags.some(t => ['fruit', 'vegetable', 'meat'].includes(t.toLowerCase())));

        // Aggressive Penalty: Drop to ~8% if any rot/mold/bad color is detected
        const tagPenalty = hasNegativeIndicator ? 0.08 : 1.0;

        const qualityScore = Math.min(100, Math.floor((confidence * 0.6 + colorVibe * 0.4) * 100 * tagPenalty));

        return { foodType, description, qualityScore, tags, confidence, detectedText };
    } catch (error) {
        console.error('Azure Vision error:', error);
        return { foodType: 'Food Item', description: 'Sample food', qualityScore: 85 };
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
    detectedText?: string;
}> {
    if (!computerVisionClient) {
        return analyzeFoodImage('');
    }

    try {
        const analysis = await computerVisionClient.analyzeImageInStream(imageBuffer, {
            visualFeatures: ['Categories', 'Description', 'Tags', 'Color', 'Objects'],
        });

        // OCR for Buffer
        let detectedText = '';
        try {
            const ocrResult = await computerVisionClient.recognizePrintedTextInStream(false, imageBuffer);
            detectedText = ocrResult.regions?.map(r =>
                r.lines?.map(l => l.words?.map(w => w.text).join(' ')).join('\n')
            ).join('\n') || '';
        } catch (ocrErr) {
            console.warn('OCR Failed (stream)');
        }

        const tags: string[] = (analysis.tags || [])
            .map(tag => tag?.name)
            .filter((name): name is string => typeof name === 'string');
        const description = analysis.description?.captions?.[0]?.text || 'Food item';
        const confidence = analysis.description?.captions?.[0]?.confidence || 0;

        let foodType = 'Food Item';
        const foodKeywords = ['vegetable', 'fruit', 'bread', 'meal', 'dairy', 'meat', 'grain', 'pasta', 'rice'];
        for (const tag of tags) {
            if (foodKeywords.some(kw => tag.toLowerCase().includes(kw))) {
                foodType = tag.charAt(0).toUpperCase() + tag.slice(1);
                break;
            }
        }

        const colorVibe = analysis.color?.isBWImg ? 0.5 : (analysis.color?.accentColor ? 1.0 : 0.8);

        const negativeKeywords = [
            'dirty', 'waste', 'trash', 'mold', 'dark', 'rotten', 'decay',
            'spoil', 'bruise', 'brown', 'fungus', 'slime', 'wrinkled', 'aged',
            'maggot', 'fly', 'insect', 'damaged'
        ];

        const suspiciousColors = ['Brown', 'Grey', 'Black'];
        const isSuspiciousColor = suspiciousColors.includes(analysis.color?.dominantColorForeground || '');

        const hasNegativeIndicator = tags.some(t => negativeKeywords.includes(t.toLowerCase())) ||
            negativeKeywords.some(kw => description.toLowerCase().includes(kw)) ||
            (isSuspiciousColor && tags.some(t => ['fruit', 'vegetable', 'meat'].includes(t.toLowerCase())));

        const tagPenalty = hasNegativeIndicator ? 0.08 : 1.0;

        const qualityScore = Math.min(100, Math.floor((confidence * 0.6 + colorVibe * 0.4) * 100 * tagPenalty));

        return { foodType, description, qualityScore, tags, confidence, detectedText };
    } catch (error) {
        console.error('Azure Vision error (buffer):', error);
        return { foodType: 'Food Item', description: 'Sample food', qualityScore: 85 };
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

