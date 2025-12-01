import app from './app';
import { initDB } from './db';

const PORT = process.env.PORT || 3002;

async function startServer() {
    try {
        await initDB();
        console.log('✅ Database initialized');

        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ API available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
