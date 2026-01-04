import app from '../server/app';
import { initDB } from '../server/db';

// Log process-level crashes for Vercel visibility
process.on('uncaughtException', (err) => {
    console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

let dbReady = false;

// Standard Vercel Serverless Function Handler
export default async function (req: any, res: any) {
    // 1. Log request path
    console.log(`[Vercel] Handling ${req.method} ${req.url}`);

    try {
        // 2. Lazy-initialize database
        if (!dbReady) {
            console.log('[Vercel] First request: Initializing database...');
            await initDB();
            dbReady = true;
            console.log('✅ [Vercel] Database initialized');
        }

        // 3. Delegate to Express
        // We don't return the app call, we let it handle the response
        app(req, res);
    } catch (error: any) {
        console.error('❌ [Vercel] Entry point crash:', error);

        if (!res.headersSent) {
            res.status(500).json({
                error: 'Server Initialization Error',
                message: error.message,
                phase: 'boot'
            });
        }
    }
}
