import { Router, Request } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { sendPaymentVerificationEmail, sendPaymentRejectionEmail } from '../services/email.js';
import * as imageStorage from '../services/imageStorage.js';

const router = Router();

// Extend Express Request type to include file property
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// Configure multer for image uploads
// Use memory storage if Cloudinary is configured, otherwise use disk storage
const storage = imageStorage.isCloudinaryConfigured()
    ? multer.memoryStorage() // Store in memory for Cloudinary upload
    : multer.diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
            cb(null, 'uploads/payment-proofs/');
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
        }
    }
});

/**
 * Submit manual payment for verification
 * POST /api/payment/manual/submit
 */
router.post('/submit', upload.single('proofImage'), async (req: MulterRequest, res) => {
    const { userId, amount, paymentMethod, transactionId, accountUsed, notes } = req.body;
    let proofImage: string | null = null;

    try {
        // Upload to Cloudinary if configured, otherwise use local storage
        if (req.file) {
            if (imageStorage.isCloudinaryConfigured()) {
                try {
                    // req.file.buffer is available when using memoryStorage
                    const buffer = (req.file as any).buffer || req.file.buffer;
                    if (buffer) {
                        const result = await imageStorage.uploadImage(
                            buffer,
                            'ecobite/payment-proofs'
                        );
                        proofImage = result.secure_url;
                        console.log('✅ Payment proof uploaded to Cloudinary');
                    } else {
                        throw new Error('File buffer not available');
                    }
                } catch (error) {
                    console.error('Cloudinary upload failed, using local storage:', error);
                    // Fallback to local storage (if diskStorage was used)
                    proofImage = req.file.filename ? `/uploads/payment-proofs/${req.file.filename}` : null;
                }
            } else {
                // Use local storage
                proofImage = req.file.filename ? `/uploads/payment-proofs/${req.file.filename}` : null;
            }
        }
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

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create pending donation
        const donationId = uuidv4();
        await db.run(
            `INSERT INTO money_donations (
                id, donorId, donorRole, amount, paymentMethod, 
                transactionId, status, proofImage, accountUsed, notes
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
            [
                donationId,
                userId,
                user.type,
                amount,
                paymentMethod,
                transactionId || null,
                proofImage,
                accountUsed || null,
                notes || null
            ]
        );

        // Create notification for admin
        const notifId = uuidv4();
        await db.run(
            `INSERT INTO notifications (id, userId, title, message, type)
             SELECT ?, id, ?, ?, 'payment_verification'
             FROM users WHERE type = 'admin'`,
            [
                notifId,
                'New Payment Verification Required',
                `${user.name} submitted a payment of PKR ${amount} for verification`
            ]
        );

        const donation = await db.get('SELECT * FROM money_donations WHERE id = ?', [donationId]);

        res.json({
            success: true,
            donation,
            message: 'Payment submitted for verification. Admin will review shortly.'
        });
    } catch (error) {
        console.error('Manual payment submission error:', error);
        res.status(500).json({ error: 'Failed to submit payment for verification' });
    }
});

/**
 * Get all pending donations for verification
 * GET /api/payment/manual/pending
 */
router.get('/pending', async (_req, res) => {
    try {
        const db = getDB();

        const donations = await db.all(
            `SELECT 
                md.*,
                u.name as donorName,
                u.email as donorEmail
             FROM money_donations md
             LEFT JOIN users u ON md.donorId = u.id
             WHERE md.status IN ('pending', 'verified', 'rejected')
             ORDER BY 
                CASE md.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'verified' THEN 2 
                    WHEN 'rejected' THEN 3 
                END,
                md.createdAt DESC`
        );

        res.json(donations);
    } catch (error) {
        console.error('Get pending donations error:', error);
        res.status(500).json({ error: 'Failed to fetch pending donations' });
    }
});

/**
 * Approve and verify manual payment
 * POST /api/payment/manual/:id/approve
 */
router.post('/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { adminId } = req.body;

    try {
        const db = getDB();

        // Get donation
        const donation = await db.get('SELECT * FROM money_donations WHERE id = ?', [id]);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        if (donation.status !== 'pending') {
            return res.status(400).json({ error: 'Donation already processed' });
        }

        // Update donation status
        await db.run(
            `UPDATE money_donations 
             SET status = 'completed', 
                 verifiedBy = ?,
                 verifiedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [adminId || 'admin', id]
        );

        // Record in financial transactions
        const ftId = uuidv4();
        await db.run(
            `INSERT INTO financial_transactions (id, type, amount, userId, category, description)
             VALUES (?, 'donation', ?, ?, 'money_donation', ?)`,
            [
                ftId,
                donation.amount,
                donation.donorId,
                `Money donation of PKR ${donation.amount} via ${donation.paymentMethod} (Verified)`
            ]
        );

        // Update fund balance
        await db.run(
            `UPDATE fund_balance 
             SET totalBalance = totalBalance + ?, 
                 totalDonations = totalDonations + ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = 1`,
            [donation.amount, donation.amount]
        );

        // Award EcoPoints (10 points per 100 PKR donated)
        const ecoPointsEarned = Math.floor(donation.amount / 100) * 10;
        await db.run(
            'UPDATE users SET ecoPoints = ecoPoints + ? WHERE id = ?',
            [ecoPointsEarned, donation.donorId]
        );

        // Create notification for donor
        const notifId = uuidv4();
        await db.run(
            `INSERT INTO notifications (id, userId, title, message, type)
             VALUES (?, ?, ?, ?, 'payment_verified')`,
            [
                notifId,
                donation.donorId,
                '✅ Payment Verified!',
                `Your donation of PKR ${donation.amount} has been verified and approved. You earned ${ecoPointsEarned} EcoPoints!`
            ]
        );

        // Create admin log
        const logId = uuidv4();
        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetType, targetId, details)
             VALUES (?, ?, 'verify_payment', 'money_donation', ?, ?)`,
            [
                logId,
                adminId || 'admin',
                id,
                `Verified payment of PKR ${donation.amount} from donor ${donation.donorId}`
            ]
        );

        // Get donor details for email
        const donor = await db.get('SELECT name, email FROM users WHERE id = ?', [donation.donorId]);

        // Send email notification (async, don't wait)
        if (donor && donor.email) {
            sendPaymentVerificationEmail(donor.email, donor.name, donation.amount, ecoPointsEarned)
                .catch(err => console.error('Failed to send payment verification email:', err));
        }

        // Get updated user ecoPoints for response
        const updatedUser = await db.get('SELECT ecoPoints FROM users WHERE id = ?', [donation.donorId]);
        
        res.json({
            success: true,
            message: 'Payment verified and approved successfully',
            userId: donation.donorId,
            ecoPointsEarned,
            updatedEcoPoints: updatedUser?.ecoPoints || null
        });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
});

/**
 * Reject manual payment
 * POST /api/payment/manual/:id/reject
 */
router.post('/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { adminId, reason } = req.body;

    try {
        const db = getDB();

        // Get donation
        const donation = await db.get('SELECT * FROM money_donations WHERE id = ?', [id]);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        if (donation.status !== 'pending') {
            return res.status(400).json({ error: 'Donation already processed' });
        }

        // Update donation status
        await db.run(
            `UPDATE money_donations 
             SET status = 'rejected', 
                 verifiedBy = ?,
                 verifiedAt = CURRENT_TIMESTAMP,
                 rejectionReason = ?
             WHERE id = ?`,
            [adminId || 'admin', reason || 'No reason provided', id]
        );

        // Create notification for donor
        const notifId = uuidv4();
        await db.run(
            `INSERT INTO notifications (id, userId, title, message, type)
             VALUES (?, ?, ?, ?, 'payment_rejected')`,
            [
                notifId,
                donation.donorId,
                '❌ Payment Rejected',
                `Your donation of PKR ${donation.amount} was rejected. Reason: ${reason || 'Please contact support'}`
            ]
        );

        // Create admin log
        const logId = uuidv4();
        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetType, targetId, details)
             VALUES (?, ?, 'reject_payment', 'money_donation', ?, ?)`,
            [
                logId,
                adminId || 'admin',
                id,
                `Rejected payment of PKR ${donation.amount}. Reason: ${reason}`
            ]
        );

        // Get donor details for email
        const donor = await db.get('SELECT name, email FROM users WHERE id = ?', [donation.donorId]);

        // Send email notification (async, don't wait)
        if (donor && donor.email) {
            sendPaymentRejectionEmail(donor.email, donor.name, donation.amount, reason || 'No reason provided')
                .catch(err => console.error('Failed to send payment rejection email:', err));
        }

        res.json({
            success: true,
            message: 'Payment rejected'
        });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({ error: 'Failed to reject payment' });
    }
});

/**
 * Get donation verification history
 * GET /api/payment/manual/history
 */
router.get('/history', async (req, res) => {
    const { status, startDate, endDate } = req.query;

    try {
        const db = getDB();

        let query = `
            SELECT 
                md.*,
                u.name as donorName,
                u.email as donorEmail,
                admin.name as verifiedByName
            FROM money_donations md
            LEFT JOIN users u ON md.donorId = u.id
            LEFT JOIN users admin ON md.verifiedBy = admin.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ' AND md.status = ?';
            params.push(status);
        }

        if (startDate) {
            query += ' AND md.createdAt >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND md.createdAt <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY md.createdAt DESC LIMIT 100';

        const donations = await db.all(query, params);

        res.json(donations);
    } catch (error) {
        console.error('Get verification history error:', error);
        res.status(500).json({ error: 'Failed to fetch verification history' });
    }
});

export default router;
