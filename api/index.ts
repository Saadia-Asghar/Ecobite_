import app from '../server/app';
import { initDB } from '../server/db';

let dbInitialized = false;

export default async function handler(req: any, res: any) {
    if (!dbInitialized) {
        try {
            await initDB();
            dbInitialized = true;
        } catch (error) {
            console.error('Failed to initialize DB:', error);
            return res.status(500).json({ error: 'Database initialization failed' });
        }
    }

    return app(req, res);
}
