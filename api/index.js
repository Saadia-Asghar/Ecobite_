import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import all routes
import authRoutes from '../server/routes/auth.js';
import donationsRoutes from '../server/routes/donations.js';
import financeRoutes from '../server/routes/finance.js';
import voucherRoutes from '../server/routes/vouchers.js';
import adminRoutes from '../server/routes/admin.js';
import moneyRequestsRoutes from '../server/routes/moneyRequests.js';
import bankAccountsRoutes from '../server/routes/bankAccounts.js';
import notificationsRoutes from '../server/routes/notifications.js';
import passwordResetRoutes from '../server/routes/passwordReset.js';
import azureAuthRoutes from '../server/routes/azureAuth.js';
import imagesRoutes from '../server/routes/images.js';
import bannersRoutes from '../server/routes/banners.js';
import paymentRoutes from '../server/routes/payment.js';
import manualPaymentRoutes from '../server/routes/manualPayment.js';
import adRedemptionsRoutes from '../server/routes/adRedemptions.js';
import emailRoutes from '../server/routes/email.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/money-requests', moneyRequestsRoutes);
app.use('/api/bank-accounts', bankAccountsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/azure-auth', azureAuthRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/manual-payment', manualPaymentRoutes);
app.use('/api/ad-redemptions', adRedemptionsRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Export for Vercel serverless
export default app;
