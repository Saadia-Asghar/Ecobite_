import { Router } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all activity logs
router.get('/logs', async (_req, res) => {
    try {
        const db = getDB();
        // Fallback to admin_logs if activity_logs is empty or just fetch activity_logs
        // Ideally we transition to activity_logs fully.
        const logs = await db.all(`
            SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT 100
        `);
        res.json(logs);
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Create admin log
router.post('/logs', async (req, res) => {
    const { adminId, action, targetId, details } = req.body;

    try {
        const db = getDB();
        const id = uuidv4();

        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetId, details)
             VALUES (?, ?, ?, ?, ?)`,
            [id, adminId, action, targetId, details]
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

export default router;
