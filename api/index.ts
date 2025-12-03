let dbInitialized = false;
let appInstance: any = null;

export default async function handler(req: any, res: any) {
    try {
        console.log('API Handler called:', req.method, req.url || req.path);
        
        // Initialize app instance if not already done
        if (!appInstance) {
            try {
                const { default: app } = await import('../server/app');
                appInstance = app;
                console.log('Express app loaded successfully');
            } catch (error: any) {
                console.error('Failed to import app:', error);
                console.error('Error stack:', error.stack);
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
                console.error('Error stack:', error.stack);
                return res.status(500).json({
                    error: 'Database initialization failed',
                    details: error.message || 'Unknown database error',
                    type: 'DB_INIT_ERROR'
                });
            }
        }

        // Vercel rewrites /api/(.*) to /api/index.ts
        // The original URL should be in req.url, but we need to ensure Express sees it correctly
        // Express routes are mounted at /api/auth, so the full path should be /api/auth/register
        const originalPath = req.url || req.path || '';
        console.log('Original path:', originalPath);
        
        // If the path doesn't start with /api, add it (Vercel might strip it)
        if (!originalPath.startsWith('/api')) {
            req.url = '/api' + (originalPath.startsWith('/') ? originalPath : '/' + originalPath);
            req.path = '/api' + (req.path || originalPath);
            console.log('Adjusted path to:', req.url);
        }

        // Handle the request
        return new Promise<void>((resolve) => {
            let resolved = false;
            
            // Ensure response is sent
            const finish = () => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };

            // Override res.end to know when response is complete
            const originalEnd = res.end.bind(res);
            res.end = function(...args: any[]) {
                finish();
                return originalEnd(...args);
            };

            // Handle Express errors
            appInstance(req, res, (err: any) => {
                if (err) {
                    console.error('Express middleware error:', err);
                    console.error('Error stack:', err.stack);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Internal server error',
                            details: err.message || 'Unknown error'
                        });
                    }
                    finish();
                }
            });

            // Timeout safety
            setTimeout(() => {
                if (!resolved && !res.headersSent) {
                    console.error('Request timeout - no response sent');
                    res.status(500).json({
                        error: 'Request timeout',
                        details: 'The server did not respond in time'
                    });
                    finish();
                }
            }, 30000); // 30 second timeout
        });
    } catch (error: any) {
        console.error('Request handler error:', error);
        console.error('Error stack:', error.stack);
        if (!res.headersSent) {
            return res.status(500).json({
                error: 'A server error has occurred',
                details: error.message || 'Unknown error',
                type: 'HANDLER_ERROR'
            });
        }
    }
}
