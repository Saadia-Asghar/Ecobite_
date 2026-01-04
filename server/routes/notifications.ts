import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await getDB();

        const notifications = await db.all(`
            SELECT * FROM notifications 
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT 50
        `, [userId]);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get unread count
router.get('/user/:userId/unread-count', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await getDB();

        const result = await db.get(`
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE userId = ? AND read = 0
        `, [userId]);

        res.json({ count: result.count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDB();

        await db.run(`
            UPDATE notifications 
            SET read = 1 
            WHERE id = ?
        `, [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read for a user
router.put('/user/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await getDB();

        await db.run(`
            UPDATE notifications 
            SET read = 1 
            WHERE userId = ? AND read = 0
        `, [userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDB();

        await db.run('DELETE FROM notifications WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Clear all notifications for a user
router.delete('/user/:userId/clear-all', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await getDB();

        await db.run('DELETE FROM notifications WHERE userId = ?', [userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

export default router;
