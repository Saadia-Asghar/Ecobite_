import app from '../server/app.js';

// Export the Express app instance directly for Vercel
// The initialization is now handled by a middleware inside the app itself
export default app;
