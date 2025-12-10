import { Router } from 'express';
import { sendEmail, sendBulkEmail } from '../services/emailService';
import { getDB } from '../db';

const router = Router();

// Send test email
router.post('/test', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const result = await sendEmail(email, 'welcomeEmail', 'Test User', 'individual');
        res.json(result);
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

// Send notification to user
router.post('/notify', async (req, res) => {
    const { userId, template, ...templateArgs } = req.body;

    try {
        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await sendEmail(user.email, template, ...Object.values(templateArgs));
        res.json(result);
    } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Send bulk notification
router.post('/notify-bulk', async (req, res) => {
    const { userIds, template, ...templateArgs } = req.body;

    try {
        const db = getDB();
        const users = await db.all(
            `SELECT email FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
            userIds
        );

        const emails = users.map((u: any) => u.email);
        const result = await sendBulkEmail(emails, template, ...Object.values(templateArgs));
        res.json(result);
    } catch (error) {
        console.error('Bulk notification error:', error);
        res.status(500).json({ error: 'Failed to send bulk notification' });
    }
});

export default router;
