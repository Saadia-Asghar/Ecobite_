import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDB } from '../db';
import * as azureAuth from '../services/azureAuth';
import { sendWelcomeEmail } from '../services/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecobite-secret-key-change-in-production';

/**
 * Get Microsoft sign-in URL
 * GET /api/auth/microsoft/url
 */
router.get('/url', async (_req, res) => {
    try {
        if (!azureAuth.isAzureADConfigured()) {
            return res.status(503).json({
                error: 'Microsoft Authentication not configured',
                message: 'Please configure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in environment variables'
            });
        }

        const { url, state } = await azureAuth.getAuthUrl();
        res.json({ url, state });
    } catch (error: any) {
        console.error('Error generating Microsoft auth URL:', error);
        res.status(500).json({
            error: 'Failed to generate authentication URL',
            message: error.message
        });
    }
});

/**
 * Handle Microsoft authentication callback
 * GET /api/auth/microsoft/callback
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        if (!azureAuth.isAzureADConfigured()) {
            return res.status(503).json({
                error: 'Microsoft Authentication not configured'
            });
        }

        // Exchange code for tokens
        const tokenResponse = await azureAuth.acquireTokenByCode(code as string, state as string);

        // Get user info from Microsoft Graph
        const userInfo = await azureAuth.getUserInfo(tokenResponse.accessToken);

        const db = getDB();
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }

        // Check if user exists
        let user = await db.get('SELECT * FROM users WHERE email = ?', [userInfo.email]);

        if (!user) {
            // Create new user
            const id = uuidv4();
            const defaultRole = 'individual'; // Default role for Microsoft sign-in users

            await db.run(
                `INSERT INTO users(id, email, password, name, type, ecoPoints)
                 VALUES(?, ?, ?, ?, ?, ?)`,
                [id, userInfo.email, 'microsoft-auth', userInfo.name, defaultRole, 0]
            );

            user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

            // Send welcome email
            sendWelcomeEmail(userInfo.email, userInfo.name, defaultRole).catch(err =>
                console.error('Failed to send welcome email:', err)
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.type },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        let frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers['host'];
            frontendUrl = `${protocol}://${host}`;
        }

        res.redirect(`${frontendUrl}/auth/callback?token=${token}&email=${encodeURIComponent(user.email)}`);
    } catch (error: any) {
        console.error('Microsoft authentication error:', error);
        let frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers['host'];
            frontendUrl = `${protocol}://${host}`;
        }
        res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
});

/**
 * Get Microsoft authentication configuration (for frontend)
 * GET /api/auth/microsoft/config
 */
router.get('/config', (_req, res) => {
    const config = azureAuth.getClientConfig();
    res.json(config);
});

export default router;

