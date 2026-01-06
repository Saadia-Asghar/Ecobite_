import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

// Get all banners
router.get('/', async (_req, res) => {
    try {
        const db = await getDB();
        const banners = await db.all(`
            SELECT * FROM sponsor_banners 
            ORDER BY active DESC, createdAt DESC
        `);

        const parsedBanners = banners.map((b: any) => ({
            ...b,
            targetDashboards: b.targetDashboards ? JSON.parse(b.targetDashboards) : ['all']
        }));

        res.json(parsedBanners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ error: 'Failed to fetch banners' });
    }
});

// Get active banners by placement
router.get('/active/:placement', async (req, res) => {
    try {
        const { placement } = req.params;
        const db = await getDB();

        const now = new Date().toISOString();

        const banners = await db.all(`
            SELECT * FROM sponsor_banners 
            WHERE active = 1 
            AND placement = ?
            AND (expiresAt IS NULL OR expiresAt > ?)
            ORDER BY displayOrder ASC, createdAt DESC
        `, [placement, now]);

        res.json(banners);
    } catch (error) {
        console.error('Error fetching active banners:', error);
        res.status(500).json({ error: 'Failed to fetch active banners' });
    }
});

// Create new banner
router.post('/', async (req, res) => {
    try {
        const {
            name,
            type,
            imageUrl,
            logoUrl,
            content,
            description,
            backgroundColor,
            link,
            active,
            placement,
            durationMinutes,
            ownerId,
            targetDashboards
        } = req.body;

        const db = await getDB();
        const id = `banner-${Date.now()}`;
        const createdAt = new Date().toISOString();

        // Calculate expiration if duration is provided
        let expiresAt = null;
        let startedAt = null;

        if (durationMinutes && active) {
            startedAt = createdAt;
            const expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + durationMinutes);
            expiresAt = expirationDate.toISOString();
        }

        await db.run(`
            INSERT INTO sponsor_banners (
                id, name, type, imageUrl, logoUrl, content, description,
                backgroundColor, link, active, placement, impressions, clicks,
                durationMinutes, startedAt, expiresAt, ownerId, targetDashboards, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, name, type, imageUrl, logoUrl, content, description,
            backgroundColor, link, active ? 1 : 0, placement, 0, 0,
            durationMinutes, startedAt, expiresAt, ownerId,
            JSON.stringify(targetDashboards || ['all']),
            createdAt
        ]);

        const banner = await db.get('SELECT * FROM sponsor_banners WHERE id = ?', [id]);

        // Create admin notification if this was a redemption
        if (ownerId) {
            await db.run(`
                INSERT INTO notifications (
                    id, userId, type, title, message, read, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                `notif-${Date.now()}`,
                'admin-1', // Admin user ID
                'ad_redemption',
                'New Ad Space Redemption',
                `${name} has redeemed ${durationMinutes} minutes of ad space`,
                0,
                createdAt
            ]);
        }

        res.status(201).json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ error: 'Failed to create banner' });
    }
});

// Update banner
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            imageUrl,
            logoUrl,
            content,
            description,
            backgroundColor,
            link,
            active,
            placement,
            durationMinutes,
            targetDashboards
        } = req.body;

        const db = await getDB();

        // If activating with duration, set start and expiration times
        let updateFields = `
            name = ?, type = ?, imageUrl = ?, logoUrl = ?, content = ?,
            description = ?, backgroundColor = ?, link = ?, active = ?,
            placement = ?, durationMinutes = ?, targetDashboards = ?
        `;

        let params: any[] = [
            name, type, imageUrl, logoUrl, content,
            description, backgroundColor, link, active ? 1 : 0,
            placement, durationMinutes, JSON.stringify(targetDashboards || ['all'])
        ];

        // If activating a banner with duration
        if (active && durationMinutes) {
            const existing = await db.get('SELECT startedAt FROM sponsor_banners WHERE id = ?', [id]);

            if (!existing.startedAt) {
                const startedAt = new Date().toISOString();
                const expirationDate = new Date();
                expirationDate.setMinutes(expirationDate.getMinutes() + durationMinutes);
                const expiresAt = expirationDate.toISOString();

                updateFields += ', startedAt = ?, expiresAt = ?';
                params.push(startedAt, expiresAt);
            }
        }

        params.push(id);

        await db.run(`
            UPDATE sponsor_banners 
            SET ${updateFields}
            WHERE id = ?
        `, params);

        const banner = await db.get('SELECT * FROM sponsor_banners WHERE id = ?', [id]);
        res.json(banner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ error: 'Failed to update banner' });
    }
});

// Delete banner
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDB();

        await db.run('DELETE FROM sponsor_banners WHERE id = ?', [id]);
        res.json({ success: true, message: 'Banner deleted' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ error: 'Failed to delete banner' });
    }
});

// Track impression
router.post('/:id/impression', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDB();

        await db.run(`
            UPDATE sponsor_banners 
            SET impressions = impressions + 1 
            WHERE id = ?
        `, [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking impression:', error);
        res.status(500).json({ error: 'Failed to track impression' });
    }
});

// Track click
router.post('/:id/click', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDB();

        await db.run(`
            UPDATE sponsor_banners 
            SET clicks = clicks + 1 
            WHERE id = ?
        `, [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ error: 'Failed to track click' });
    }
});

// Check and deactivate expired banners
router.post('/check-expiration', async (_req, res) => {
    try {
        const db = await getDB();
        const now = new Date().toISOString();

        await db.run(`
            UPDATE sponsor_banners 
            SET active = 0 
            WHERE active = 1 
            AND expiresAt IS NOT NULL 
            AND expiresAt <= ?
        `, [now]);

        res.json({ success: true, message: 'Expired banners deactivated' });
    } catch (error) {
        console.error('Error checking expiration:', error);
        res.status(500).json({ error: 'Failed to check expiration' });
    }
});

export default router;
