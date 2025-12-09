import { Router } from 'express';
import {
    createStripePaymentIntent,
    verifyStripePayment,
    createStripeCheckoutSession,
    initiateJazzCashPayment,
    verifyJazzCashPayment,
    createOrGetStripeCustomer,
} from '../services/payment';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Create payment intent (Stripe)
 * POST /api/payment/create-intent
 */
router.post('/create-intent', async (req, res) => {
    const { amount, userId, donationType } = req.body;

    try {
        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Get user for customer creation
        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create or get Stripe customer
        const customerId = await createOrGetStripeCustomer(
            user.email,
            user.name,
            { userId: user.id, userType: user.type }
        );

        // Create payment intent
        const paymentIntent = await createStripePaymentIntent(
            amount,
            'pkr',
            {
                userId: user.id,
                userName: user.name,
                donationType: donationType || 'money_donation',
            }
        );

        res.json({
            clientSecret: paymentIntent.clientSecret,
            paymentIntentId: paymentIntent.id,
            customerId,
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

/**
 * Create checkout session (Stripe hosted page)
 * POST /api/payment/create-checkout
 */
router.post('/create-checkout', async (req, res) => {
    const { amount, userId, successUrl, cancelUrl } = req.body;

    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const session = await createStripeCheckoutSession(
            amount,
            successUrl || `${process.env.FRONTEND_URL}/payment/success`,
            cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
            {
                userId: user.id,
                userName: user.name,
            }
        );

        res.json({
            sessionId: session.sessionId,
            url: session.url,
        });
    } catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
 * Verify payment and complete donation
 * POST /api/payment/verify
 */
router.post('/verify', async (req, res) => {
    const { paymentIntentId, userId, amount, paymentMethod } = req.body;

    try {
        const db = getDB();

        // Verify user
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify user is individual
        if (user.type !== 'individual') {
            return res.status(403).json({ error: 'Only individual users can donate money' });
        }

        let verified = false;

        // Verify payment based on method
        if (paymentMethod === 'stripe') {
            verified = await verifyStripePayment(paymentIntentId);
        } else if (paymentMethod === 'jazzcash') {
            verified = await verifyJazzCashPayment(paymentIntentId);
        } else {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        if (!verified) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        // Create money donation record
        const donationId = uuidv4();
        await db.run(
            `INSERT INTO money_donations (id, donorId, donorRole, amount, paymentMethod, transactionId, status)
             VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
            [donationId, userId, user.type, amount, paymentMethod, paymentIntentId]
        );

        // Record in financial transactions
        const ftId = uuidv4();
        await db.run(
            `INSERT INTO financial_transactions (id, type, amount, userId, category, description)
             VALUES (?, 'donation', ?, ?, 'money_donation', ?)`,
            [ftId, amount, userId, `Money donation of PKR ${amount} via ${paymentMethod}`]
        );

        // Update fund balance
        await db.run(
            `UPDATE fund_balance 
             SET totalBalance = totalBalance + ?, 
                 totalDonations = totalDonations + ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = 1`,
            [amount, amount]
        );

        // Award EcoPoints (10 points per 100 PKR donated)
        const ecoPointsEarned = Math.floor(amount / 100) * 10;
        await db.run(
            'UPDATE users SET ecoPoints = ecoPoints + ? WHERE id = ?',
            [ecoPointsEarned, userId]
        );

        const donation = await db.get('SELECT * FROM money_donations WHERE id = ?', [donationId]);

        res.json({
            success: true,
            donation,
            ecoPointsEarned,
            message: `Payment verified! You earned ${ecoPointsEarned} EcoPoints.`,
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

/**
 * Initiate JazzCash payment
 * POST /api/payment/jazzcash/initiate
 */
router.post('/jazzcash/initiate', async (req, res) => {
    const { amount, phoneNumber, userId } = req.body;

    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!phoneNumber || !/^03\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({ error: 'Invalid phone number format (03XXXXXXXXX)' });
        }

        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const payment = await initiateJazzCashPayment(
            amount,
            phoneNumber,
            `EcoBite donation by ${user.name}`
        );

        res.json({
            transactionId: payment.transactionId,
            status: payment.status,
            message: 'JazzCash payment initiated. Please complete payment on your mobile.',
        });
    } catch (error) {
        console.error('JazzCash initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate JazzCash payment' });
    }
});

/**
 * JazzCash webhook/callback
 * POST /api/payment/jazzcash/callback
 */
router.post('/jazzcash/callback', async (req, res) => {
    const { transactionId, status, amount } = req.body;

    try {
        console.log('JazzCash callback received:', { transactionId, status, amount });

        // In production, verify the callback signature/hash
        // Update payment status in database

        res.json({ success: true, message: 'Callback processed' });
    } catch (error) {
        console.error('JazzCash callback error:', error);
        res.status(500).json({ error: 'Failed to process callback' });
    }
});

/**
 * Get payment methods
 * GET /api/payment/methods
 */
router.get('/methods', (_req, res) => {
    res.json({
        methods: [
            {
                id: 'stripe',
                name: 'Credit/Debit Card',
                description: 'Pay with Visa, Mastercard, or other cards',
                enabled: true,
                icon: '💳',
            },
            {
                id: 'jazzcash',
                name: 'JazzCash',
                description: 'Pay with JazzCash mobile wallet',
                enabled: true,
                icon: '📱',
                requiresPhone: true,
            },
            {
                id: 'easypaisa',
                name: 'EasyPaisa',
                description: 'Pay with EasyPaisa mobile wallet',
                enabled: false, // Not implemented yet
                icon: '💰',
            },
        ],
    });
});

/**
 * Get payment history
 * GET /api/payment/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const db = getDB();

        const payments = await db.all(
            `SELECT md.*, u.name as donorName, u.email as donorEmail
             FROM money_donations md
             LEFT JOIN users u ON md.donorId = u.id
             WHERE md.donorId = ?
             ORDER BY md.createdAt DESC`,
            [userId]
        );

        res.json(payments);
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

export default router;
