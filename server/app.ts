import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import imagesRoutes from './routes/images';
import azureAuthRoutes from './routes/azureAuth';
import aiRoutes from './routes/ai';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import { sanitizeInput } from './middleware/sanitize';

const app = express();

// Security headers
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // Disable in dev for easier testing
    crossOriginEmbedderPolicy: false, // Allow embedding if needed
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || process.env.VITE_API_URL?.replace('/api', '') || false
        : true, // Allow all origins in development
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Request logging with structured logger
app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes with rate limiting
app.use('/api/auth/microsoft', azureAuthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
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
app.use('/api/images', imagesRoutes);
app.use('/api/ai', aiRoutes);

// Health check with database status
app.get('/api/health', async (_req, res) => {
    res.status(200).json({ status: 'ok', server: 'express', vercel: !!process.env.VERCEL });
});

app.get('/api/ping', (_req, res) => {
    res.status(200).json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // Log error with structured logger
    logger.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Only expose error details in development
    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        error: 'Internal server error',
        ...(isDevelopment && {
            message: err.message,
            stack: err.stack
        })
    });
});

// 404 handler
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.path || req.url}`);
    res.status(404).json({
        error: 'Route not found',
        path: req.path || req.url,
        method: req.method
    });
});

export default app;
