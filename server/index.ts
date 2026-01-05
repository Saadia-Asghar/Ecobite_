import 'dotenv/config';
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

        const server = app.listen(PORT, async () => {
            const msg = `✅ Server running on http://localhost:${PORT}\n✅ API available at http://localhost:${PORT}/api\n✅ Environment: ${process.env.NODE_ENV || 'development'}`;
            console.log(msg);
            try {
                const fs = await import('fs');
                const path = await import('path');
                fs.appendFileSync(path.resolve(process.cwd(), 'server-start.log'), `[${new Date().toISOString()}] ${msg}\n`);
            } catch (e) { }
        });

        server.on('error', async (error) => {
            console.error('❌ Server Error:', error);
            try {
                const fs = await import('fs');
                const path = await import('path');
                fs.appendFileSync(path.resolve(process.cwd(), 'server-crash.log'), `[${new Date().toISOString()}] Server Event Error: ${error}\n`);
            } catch (e) { }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);

        // Log to file for debugging
        try {
            const fs = await import('fs');
            const path = await import('path');
            const logPath = path.resolve(process.cwd(), 'server-crash.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Server Crash: ${error}\n${(error as Error).stack}\n\n`);
        } catch (e) {
            console.error('Failed to write to crash log:', e);
        }

        process.exit(1);
    }
}

startServer();
