import app from '../server/app';
import { initDB } from '../server/db';

// Initialize database connection
let dbInitialized = false;

async function handler(req: any, res: any) {
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

    // Handle the request with Express app
    return app(req, res);
}

export default handler;
