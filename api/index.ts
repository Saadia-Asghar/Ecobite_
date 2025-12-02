let dbInitialized = false;
let appInstance: any = null;

export default async function handler(req: any, res: any) {
    try {
        // Initialize app instance if not already done
        if (!appInstance) {
            try {
                const { default: app } = await import('../server/app');
                appInstance = app;
            } catch (error: any) {
                console.error('Failed to import app:', error);
                return res.status(500).json({
                    error: 'Server startup failed',
                    details: error.message || 'Failed to load server application',
                    type: 'IMPORT_ERROR'
                });
            }
        }

        // Initialize database if not already done
        if (!dbInitialized) {
            try {
                const { initDB } = await import('../server/db');
                await initDB();
                dbInitialized = true;
                console.log('Database initialized successfully');
            } catch (error: any) {
                console.error('Failed to initialize database:', error);
                return res.status(500).json({
                    error: 'Database initialization failed',
                    details: error.message || 'Unknown database error',
                    type: 'DB_INIT_ERROR'
                });
            }
        }

        // Handle the request
        return appInstance(req, res);
    } catch (error: any) {
        console.error('Request handler error:', error);
        return res.status(500).json({
            error: 'A server error has occurred',
            details: error.message || 'Unknown error',
            type: 'HANDLER_ERROR'
        });
    }
}
