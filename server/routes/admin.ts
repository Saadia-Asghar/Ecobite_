import { Router } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all activity logs
router.get('/logs', async (_req, res) => {
    try {
        const db = getDB();
        // Fetch from admin_logs which is what the admin dashboard primarily uses
        const logs = await db.all(`
            SELECT * FROM admin_logs ORDER BY createdAt DESC LIMIT 100
        `);
        res.json(logs);
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Create admin log
router.post('/logs', async (req, res) => {
    const { adminId, action, targetType, targetId, details } = req.body;

    try {
        const db = getDB();
        const id = uuidv4();

        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetType, targetId, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, adminId, action, targetType || null, targetId, details]
        );

        res.status(201).json({ message: 'Log created' });
    } catch (error) {
        console.error('Create admin log error:', error);
        res.status(500).json({ error: 'Failed to create admin log' });
    }
});

// Temporary migration endpoint to add notification columns
router.get('/migrate-schema', async (_req, res) => {
    try {
        const db = getDB();
        console.log('Starting schema migration...');

        // Try adding emailNotifications
        try {
            await db.run('ALTER TABLE users ADD emailNotifications INT DEFAULT 1');
            console.log('Added emailNotifications column');
        } catch (e: any) {
            console.log('emailNotifications column likely exists or error:', e.message);
        }

        // Try adding smsNotifications
        try {
            await db.run('ALTER TABLE users ADD smsNotifications INT DEFAULT 1');
            console.log('Added smsNotifications column');
        } catch (e: any) {
            console.log('smsNotifications column likely exists or error:', e.message);
        }

        res.json({ message: 'Migration attempted. Check server logs for details.' });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: 'Migration failed' });
    }
});

import { sendEmail } from '../services/email.js';

// ... (existing imports)

// Health Check Endpoint
router.get('/health', async (_req, res) => {
    try {
        const db = getDB();
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'unknown',
                email: 'unknown',
                storage: 'unknown',
            },
            system: {
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            }
        };

        // Check DB
        try {
            await db.get('SELECT 1');
            health.services.database = 'connected';
        } catch (e) {
            health.services.database = 'disconnected';
            health.status = 'degraded';
        }

        // Check Email
        if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
            health.services.email = 'configured';
        } else {
            health.services.email = 'not_configured';
            // Not critical for 'healthy' status but good to know
        }

        // Check Storage
        if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
            health.services.storage = 'azure_blob';
        } else {
            health.services.storage = 'local_fallback';
        }

        res.json(health);
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: 'Health check failed' });
    }
});

// Verify User Endpoint
router.post('/verify-user', async (req, res) => {
    const { userId, status, reason, adminId } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user
        const isVerified = status === 'approved' ? 1 : 0;
        await db.run(
            'UPDATE users SET isVerified = ? WHERE id = ?',
            [isVerified, userId]
        );

        // Send Email
        const subject = status === 'approved'
            ? '✅ Account Verified - EcoBite'
            : '❌ Account Verification Failed - EcoBite';

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>${status === 'approved' ? 'Congratulations! 🎉' : 'Verification Status Update'}</h2>
                <p>Hello ${user.name},</p>
                <p>Your account verification status has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
                ${reason ? `<p><strong>Reason/Note:</strong> ${reason}</p>` : ''}
                ${status === 'approved' ? '<p>You can now access all verified features of EcoBite.</p>' : '<p>Please contact support if you believe this is a mistake.</p>'}
                <br/>
                <p>Best regards,<br/>The EcoBite Team</p>
            </div>
        `;

        if (user.email) {
            await sendEmail(user.email, subject, html);
        }

        // Log admin action
        const logId = uuidv4();
        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetType, targetId, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                logId,
                adminId || 'admin',
                status === 'approved' ? 'verify_user' : 'reject_user',
                'user',
                userId,
                `User ${status} by admin. Reason: ${reason || 'N/A'}`
            ]
        );

        res.json({ success: true, message: `User ${status}` });

    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ error: 'Failed to update verification status' });
    }
});

export default router;
