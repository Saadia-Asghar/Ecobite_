import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import donationsRoutes from './routes/donations.js';
import requestsRoutes from './routes/requests.js';
import vouchersRoutes from './routes/vouchers.js';
import financeRoutes from './routes/finance.js';
import adminRoutes from './routes/admin.js';
import bannersRoutes from './routes/banners.js';
import adRedemptionsRoutes from './routes/adRedemptions.js';
import notificationsRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payment.js';
import bankAccountsRoutes from './routes/bankAccounts.js';
import moneyRequestsRoutes from './routes/moneyRequests.js';
import imagesRoutes from './routes/images.js';
import azureAuthRoutes from './routes/azureAuth.js';
import aiRoutes from './routes/ai.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import { initDB } from './db.js';
import { sanitizeInput } from './middleware/sanitize.js';

const app = express();

// Initialization middleware for serverless cold starts
let dbInitialized = false;
app.use(async (_req, _res, next) => {
    if (!dbInitialized) {
        try {
            await initDB();
            dbInitialized = true;
            console.log('✅ Database initialized via middleware');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return next(error);
        }
    }
    next();
});

// Security headers
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // Disable in dev for easier testing
    crossOriginEmbedderPolicy: false, // Allow embedding if needed
}));

// CORS configuration
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allowed origins
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:4173',
            process.env.FRONTEND_URL,
            process.env.VITE_API_URL?.replace('/api', '')
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
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
