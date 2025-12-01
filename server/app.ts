import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import donationsRoutes from './routes/donations';
import requestsRoutes from './routes/requests';
import vouchersRoutes from './routes/vouchers';
import financeRoutes from './routes/finance';
import adminRoutes from './routes/admin';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((_req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${_req.method} ${_req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

export default app;
