import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { getDB } from '../db.js';
import * as azureAuth from '../services/azureAuth.js';
import { sendWelcomeEmail } from '../services/email.js';

import { getJwtSecret } from '../middleware/auth.js';

const router = Router();

/**
 * Get Microsoft sign-in URL
 * GET /api/auth/microsoft/url
 */
router.get('/url', async (req, res) => {
    try {
        // Check configuration
        if (!azureAuth.isAzureADConfigured()) {
            return res.status(503).json({
                error: 'Microsoft Authentication not configured',
                message: 'Please configure AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in environment variables'
            });
        }

        // Construct redirect URI from request headers (for Vercel serverless functions)
        let redirectUri = process.env.AZURE_REDIRECT_URI;
        const isPlaceholder = redirectUri?.includes('your-app.vercel.app');

        if ((!redirectUri || isPlaceholder) && req.headers.host) {
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers.host;
            redirectUri = `${protocol}://${host}/api/auth/microsoft/callback`;
        }

        // Ensure we have a redirect URI
        if (!redirectUri) {
            return res.status(500).json({
                error: 'Redirect URI could not be determined',
                message: 'Please set AZURE_REDIRECT_URI environment variable or ensure request headers are available'
            });
        }

        console.log('--- Microsoft Auth URL Generation ---');
        console.log('Host Header:', req.headers.host);
        console.log('Env AZURE_REDIRECT_URI:', process.env.AZURE_REDIRECT_URI);
        console.log('Generated Redirect URI:', redirectUri);

        // Include any signup data in the state
        const signupData = {
            type: req.query.type as string,
            name: req.query.name as string,
            org: req.query.org as string,
            loc: req.query.loc as string,
            lic: req.query.lic as string,
            nonce: Math.random().toString(36).substring(7)
        };
        const state = Buffer.from(JSON.stringify(signupData)).toString('base64');

        const { url } = await azureAuth.getAuthUrl(redirectUri, state);
        res.json({ url, state });
    } catch (error: any) {
        console.error('Error generating Microsoft auth URL:', error);
        console.error('Error stack:', error.stack);

        // Return detailed error in response
        res.status(500).json({
            error: 'Failed to generate authentication URL',
            message: error.message || 'A server error has occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

        // Construct redirect URI from request headers (must match the one used in getAuthUrl)
        let redirectUri = process.env.AZURE_REDIRECT_URI;
        const isPlaceholder = redirectUri?.includes('your-app.vercel.app');

        if ((!redirectUri || isPlaceholder) && req.headers.host) {
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers.host;
            redirectUri = `${protocol}://${host}/api/auth/microsoft/callback`;
        }

        // Exchange code for tokens
        const tokenResponse = await azureAuth.acquireTokenByCode(code as string, state as string, redirectUri);

        // Get user info from Microsoft Graph
        const userInfo = await azureAuth.getUserInfo(tokenResponse.accessToken);

        const db = getDB();
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }

        // Check if user exists
        let user = await db.get('SELECT * FROM users WHERE email = ?', [userInfo.email]);

        if (!user) {
            // New user registration flow
            const id = uuidv4();

            // Try to recover signup details from state
            let type = 'individual';
            let name = userInfo.name;
            let organization = '';
            let location = '';
            let licenseId = '';

            try {
                if (state) {
                    const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
                    if (decodedState.type) type = decodedState.type;
                    if (decodedState.name) name = decodedState.name;
                    if (decodedState.org) organization = decodedState.org;
                    if (decodedState.loc) location = decodedState.loc;
                    if (decodedState.lic) licenseId = decodedState.lic;
                }
            } catch (e) {
                console.warn('Could not decode state for signup data:', e);
            }

            await db.run(
                `INSERT INTO users(id, email, password, name, type, organization, licenseId, location, ecoPoints)
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userInfo.email, 'microsoft-auth', name, type, organization, licenseId, location, 0]
            );

            user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

            // Send welcome email
            sendWelcomeEmail(userInfo.email, name, type).catch(err =>
                console.error('Failed to send welcome email:', err)
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.type },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        // Determine frontend URL
        // Priority:
        // 1. FRONTEND_URL (Explicitly set in environment)
        // 2. Hardcoded Production URL (ecobite-iota.vercel.app)
        // 3. Request Header Host (Fallback)
        let frontendUrl = process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.replace(/\/$/, '')
            : 'https://ecobite-iota.vercel.app';

        // If we are clearly on localhost (dev), keep using localhost
        // (Note: This check is a bit simplistic, but safer for your specific constraint of fixing 'ecobite-iota')
        if (req.headers.host && req.headers.host.includes('localhost')) {
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            frontendUrl = `${protocol}://${req.headers.host}`;
        }


        // Redirect to frontend with token and additional info for new users
        let redirectPath = '/auth/callback';
        const params = new URLSearchParams({
            token,
            email: user.email,
            name: user.name,
            role: user.type
        });

        // If it's a new user (or we just created them with defaults), let the frontend know
        // so it can ask for missing details (Location, Org Name, etc.)
        if (req.query.state) {
            try {
                const decodedState = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString());
                if (decodedState.type === 'new') {
                    // This was a explicit signup attempt
                }
            } catch (e) { }
        }

        // We'll use a simpler check: if location or organization is missing, it's an incomplete profile
        if (!user.location || (user.type !== 'individual' && !user.organization)) {
            params.append('isNewUser', 'true');
        }

        res.redirect(`${frontendUrl}${redirectPath}?${params.toString()}`);
    } catch (error: any) {
        console.error('Microsoft authentication error:', error);
        let frontendUrl = process.env.FRONTEND_URL;
        const isPlaceholderFrontend = frontendUrl?.includes('your-app.vercel.app');

        if (!frontendUrl || isPlaceholderFrontend) {
            const protocol = req.headers['x-forwarded-proto'] || 'https';
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

