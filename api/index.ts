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
            console.log('✅ Database initialized');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return res.status(500).json({ error: 'Database initialization failed', details: (error as any).message });
        }
    }

    // Ensure the path is correctly formatted for Express
    // Vercel sometimes gives us /auth/microsoft/url and sometimes /api/auth/microsoft/url
    // Our Express app expects /api prefix
    if (fullUrl && !fullUrl.startsWith('/api')) {
        req.url = '/api' + (fullUrl.startsWith('/') ? '' : '/') + fullUrl;
    }

    // Handle the request with our Express app
    return app(req, res);
}
