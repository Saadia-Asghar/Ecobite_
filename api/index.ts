import app from '../server/app';
import { initDB } from '../server/db';

// Initialize database connection
let dbInitialized = false;

export default async function handler(req: any, res: any) {
    // Log request for debugging in Vercel logs
    const fullUrl = req.url || '';
    console.log(`[Vercel Handler] Method: ${req.method} URL: ${fullUrl}`);

    // Initialize DB only once per instance
    if (!dbInitialized) {
        try {
            await initDB();
            dbInitialized = true;
            console.log('✅ Database & Azure MSAL initialized');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            return res.status(500).json({ error: 'Initialization failed', details: (error as any).message });
        }
    }

    // Handle the request with our Express app
    // Express already handles '/api' prefixes if they are defined in the routes
    return app(req, res);
}
