import { Router } from 'express';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all vouchers
router.get('/', async (_req, res) => {
    try {
        const db = getDB();
        const vouchers = await db.all('SELECT * FROM vouchers ORDER BY createdAt DESC');
        res.json(vouchers);
    } catch (error) {
        console.error('Get vouchers error:', error);
        res.status(500).json({ error: 'Failed to fetch vouchers' });
    }
});

// Get voucher performance
router.get('/:id/performance', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', id);
        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }

        const redemptions = await db.all(
            `SELECT vr.*, u.name, u.email 
             FROM voucher_redemptions vr 
             JOIN users u ON vr.userId = u.id 
             WHERE vr.voucherId = ? 
             ORDER BY vr.redeemedAt DESC`,
            id
        );

        res.json({
            voucher,
            redemptions,
            redemptionRate: voucher.maxRedemptions > 0
                ? (voucher.currentRedemptions / voucher.maxRedemptions) * 100
                : 0
        });
    } catch (error) {
        console.error('Get voucher performance error:', error);
        res.status(500).json({ error: 'Failed to fetch voucher performance' });
    }
});

// Create voucher
router.post('/', async (req, res) => {
    const { code, title, description, discountType, discountValue, minEcoPoints, maxRedemptions, expiryDate } = req.body;

    try {
        const db = getDB();
        const id = uuidv4();

        await db.run(
            `INSERT INTO vouchers (id, code, title, description, discountType, discountValue, minEcoPoints, maxRedemptions, expiryDate, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [id, code, title, description, discountType, discountValue, minEcoPoints, maxRedemptions, expiryDate]
        );

        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', id);
        res.status(201).json(voucher);
    } catch (error) {
        console.error('Create voucher error:', error);
        res.status(500).json({ error: 'Failed to create voucher' });
    }
});

// Update voucher
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, discountType, discountValue, minEcoPoints, maxRedemptions, expiryDate, status } = req.body;

    try {
        const db = getDB();

        await db.run(
            `UPDATE vouchers 
             SET title = ?, description = ?, discountType = ?, discountValue = ?, 
                 minEcoPoints = ?, maxRedemptions = ?, expiryDate = ?, status = ?
             WHERE id = ?`,
            [title, description, discountType, discountValue, minEcoPoints, maxRedemptions, expiryDate, status, id]
        );

        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', id);
        res.json(voucher);
    } catch (error) {
        console.error('Update voucher error:', error);
        res.status(500).json({ error: 'Failed to update voucher' });
    }
});

// Stop/Pause campaign
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const db = getDB();
        await db.run('UPDATE vouchers SET status = ? WHERE id = ?', [status, id]);
        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', id);
        res.json(voucher);
    } catch (error) {
        console.error('Update voucher status error:', error);
        res.status(500).json({ error: 'Failed to update voucher status' });
    }
});

// Delete voucher
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();
        await db.run('DELETE FROM vouchers WHERE id = ?', id);
        res.json({ message: 'Voucher deleted successfully' });
    } catch (error) {
        console.error('Delete voucher error:', error);
        res.status(500).json({ error: 'Failed to delete voucher' });
    }
});

// Redeem voucher (for users)
router.post('/:id/redeem', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const db = getDB();

        const voucher = await db.get('SELECT * FROM vouchers WHERE id = ?', id);
        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }

        if (voucher.status !== 'active') {
            return res.status(400).json({ error: 'Voucher is not active' });
        }

        if (voucher.currentRedemptions >= voucher.maxRedemptions) {
            return res.status(400).json({ error: 'Voucher redemption limit reached' });
        }

        const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.ecoPoints < voucher.minEcoPoints) {
            return res.status(400).json({ error: 'Insufficient EcoPoints' });
        }

        // Check if already redeemed
        const existing = await db.get(
            'SELECT * FROM voucher_redemptions WHERE voucherId = ? AND userId = ?',
            [id, userId]
        );
        if (existing) {
            return res.status(400).json({ error: 'Voucher already redeemed' });
        }

        // Create redemption
        const redemptionId = uuidv4();
        await db.run(
            'INSERT INTO voucher_redemptions (id, voucherId, userId) VALUES (?, ?, ?)',
            [redemptionId, id, userId]
        );

        // Update voucher redemption count
        await db.run(
            'UPDATE vouchers SET currentRedemptions = currentRedemptions + 1 WHERE id = ?',
            id
        );

        res.json({ message: 'Voucher redeemed successfully', redemptionId });
    } catch (error) {
        console.error('Redeem voucher error:', error);
        res.status(500).json({ error: 'Failed to redeem voucher' });
    }
});

export default router;
