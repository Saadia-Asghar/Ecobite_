import app from '../server/app';
import { initDB } from '../server/db';

let initialized = false;

// Vercel serverless function entry point
export default async function handler(req: any, res: any) {
    // 1. Log the incoming request for debugging
    console.log(`[Vercel] ${req.method} ${req.url}`);

    try {
        // 2. Ensure database is initialized (using persistence per instance)
        if (!initialized) {
            console.log('[Vercel] Running first-time initialization...');
            await initDB();
            initialized = true;
            console.log('✅ [Vercel] Initialization successful');
        }

        // 3. Delegate to the Express app
        // Vercel's @vercel/node runtime provides req/res objects compatible with Express
        return app(req, res);
    } catch (error: any) {
        console.error('❌ [Vercel] Critical Handler Error:', error);

        // Ensure we send a JSON error even if everything else fails
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                path: req.url,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}
