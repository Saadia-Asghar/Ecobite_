import { Router } from 'express';
import { getDB } from '../db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email';

const router = Router();

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const db = getDB();

        // Find user
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        // Always return success (security: don't reveal if email exists)
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await db.run(
            `UPDATE users 
             SET resetToken = ?, 
                 resetTokenExpiry = ?
             WHERE id = ?`,
            [resetTokenHash, resetTokenExpiry.toISOString(), user.id]
        );

        // Send email
        await sendPasswordResetEmail(user.email, user.name, resetToken);

        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
            // In development, return token for testing
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

/**
 * Verify reset token
 * GET /api/auth/verify-reset-token/:token
 */
router.get('/verify-reset-token/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const db = getDB();

        // Hash the token
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await db.get(
            `SELECT id, email, name 
             FROM users 
             WHERE resetToken = ? 
             AND resetTokenExpiry > ?`,
            [resetTokenHash, new Date().toISOString()]
        );

        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired reset token',
                expired: true
            });
        }

        res.json({
            success: true,
            email: user.email,
            name: user.name
        });
    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({ error: 'Failed to verify reset token' });
    }
});

/**
 * Reset password
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const db = getDB();

        // Hash the token
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await db.get(
            `SELECT id, email, name 
             FROM users 
             WHERE resetToken = ? 
             AND resetTokenExpiry > ?`,
            [resetTokenHash, new Date().toISOString()]
        );

        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired reset token',
                expired: true
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await db.run(
            `UPDATE users 
             SET password = ?,
                 resetToken = NULL,
                 resetTokenExpiry = NULL
             WHERE id = ?`,
            [hashedPassword, user.id]
        );

        res.json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

/**
 * Change password (for logged-in users)
 * POST /api/auth/change-password
 */
router.post('/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const db = getDB();

        // Get user
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.run(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully!'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

export default router;
