import app from './app.js';
import { initDB } from './db.js';
import { validateEnv } from './config/env.js';

const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        // Validate environment variables first
        if (process.env.NODE_ENV === 'production') {
            validateEnv();
        }

        await initDB();
        console.log('✅ Database initialized');

        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ API available at http://localhost:${PORT}/api`);
            console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
