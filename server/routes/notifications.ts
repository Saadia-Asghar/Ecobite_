import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db.js';

const router = Router();

// Get user notifications
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const notifications = await db.all(
            'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark as read
router.post('/:id/read', async (req, res) => {
    try {
        const db = getDB();
        await db.run('UPDATE notifications SET read = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Create notification (internal helper or API)
router.post('/', async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;
        const db = getDB();
        const id = uuidv4();
        const createdAt = new Date().toISOString();

        await db.run(
            'INSERT INTO notifications (id, userId, title, message, type, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, userId, title, message, type || 'info', 0, createdAt]
        );

        res.json({ id, success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

export default router;
