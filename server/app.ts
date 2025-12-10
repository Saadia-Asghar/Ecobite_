import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import donationsRoutes from './routes/donations';
import requestsRoutes from './routes/requests';
import vouchersRoutes from './routes/vouchers';
import financeRoutes from './routes/finance';
import adminRoutes from './routes/admin';
import bannersRoutes from './routes/banners';
import adRedemptionsRoutes from './routes/adRedemptions';
import notificationsRoutes from './routes/notifications';
import paymentRoutes from './routes/payment';
import bankAccountsRoutes from './routes/bankAccounts';
import moneyRequestsRoutes from './routes/moneyRequests';

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
app.use('/api/banners', bannersRoutes);
app.use('/api/ad-redemptions', adRedemptionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bank-accounts', bankAccountsRoutes);
app.use('/api/money-requests', moneyRequestsRoutes);

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
