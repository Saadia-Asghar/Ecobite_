import { Router } from 'express';
import * as aiService from '../services/aiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/ai/welcome
 * @desc Get a personalized welcome message
 * @access Private
 */
router.post('/welcome', authenticateToken, async (req: AuthRequest, res) => {
    const { name, role } = req.body;

    if (!name || !role) {
        return res.status(400).json({ error: 'Name and role are required' });
    }

    try {
        const message = await aiService.generateWelcomeMessage(name, role);
        res.json({ message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate welcome message' });
    }
});

/**
 * @route GET /api/ai/safety-tip
 * @desc Get a food safety tip
 * @access Public
 */
router.get('/safety-tip', async (req, res) => {
    const { foodType } = req.query;

    try {
        const tip = await aiService.generateSafetyTip(foodType as string);
        res.json({ tip });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate safety tip' });
    }
});

/**
 * @route GET /api/ai/eco-quote
 * @desc Get an inspirational eco-quote
 * @access Public
 */
router.get('/eco-quote', async (_req, res) => {
    try {
        const quote = await aiService.generateEcoQuote();
        res.json({ quote });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate eco-quote' });
    }
});

/**
 * @route POST /api/ai/marketing-drafts
 * @desc Get marketing drafts for a request
 * @access Private
 */
router.post('/marketing-drafts', authenticateToken, async (req, res) => {
    const { foodType, quantity } = req.body;

    if (!foodType || !quantity) {
        return res.status(400).json({ error: 'Food type and quantity are required' });
    }

    try {
        const drafts = await aiService.generateMarketingContent(foodType, quantity);
        res.json({ drafts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate drafts' });
    }
});

export default router;
