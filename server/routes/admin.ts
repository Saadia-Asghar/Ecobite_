import { Router } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all admin logs
router.get('/logs', async (_req, res) => {
    try {
        const db = getDB();
        const logs = await db.all(`
            SELECT al.*, u.name as adminName, u.email as adminEmail
            FROM admin_logs al
            LEFT JOIN users u ON al.adminId = u.id
            ORDER BY al.createdAt DESC
        `);
        res.json(logs);
    } catch (error) {
        console.error('Get admin logs error:', error);
        res.status(500).json({ error: 'Failed to fetch admin logs' });
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

export default router;
