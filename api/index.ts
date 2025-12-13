import app from '../server/app';
import { initDB } from '../server/db';

// Initialize database connection
let dbInitialized = false;

async function handler(req: any, res: any) {
    // Log request for debugging
    console.log(`[Vercel Handler] ${req.method} ${req.url} - Path: ${req.path || 'undefined'}`);
    
    // Initialize DB only once
    if (!dbInitialized) {
        try {
            await initDB();
            dbInitialized = true;
            console.log('✅ Database initialized for serverless function');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return res.status(500).json({ error: 'Database initialization failed' });
        }
    }

    // Vercel passes the full path, but we need to strip /api prefix for Express routes
    // Express routes are defined as /api/auth, /api/users, etc.
    // But Vercel already matched /api/* and sent it here, so req.url includes /api
    if (req.url && req.url.startsWith('/api')) {
        // Keep the path as is since Express routes expect /api prefix
        if (!req.path) {
            req.path = req.url.split('?')[0];
        }
    } else if (!req.path && req.url) {
        // Extract path from URL if path is not set
        try {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            req.path = url.pathname;
        } catch (e) {
            // If URL parsing fails, use the url directly
            const urlPath = req.url.split('?')[0];
            req.path = urlPath;
        }
    }

    // Handle the request with Express app
    return app(req, res);
}

export default handler;
