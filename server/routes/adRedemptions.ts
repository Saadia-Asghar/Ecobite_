import express from 'express';
import { getDB } from '../db';

const router = express.Router();

// Get all redemption requests
router.get('/', async (_req, res) => {
    try {
        const db = await getDB();
        const requests = await db.all(`
            SELECT 
                ar.*,
                u.name as userName,
                u.email as userEmail,
                u.type as userType,
                u.organization,
                u.ecoPoints as currentPoints
            FROM ad_redemption_requests ar
            JOIN users u ON ar.userId = u.id
            ORDER BY ar.createdAt DESC
        `);
        res.json(requests);
    } catch (error) {
        console.error('Error fetching redemption requests:', error);
        res.status(500).json({ error: 'Failed to fetch redemption requests' });
    }
});

// Get redemption requests by user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await getDB();

        const requests = await db.all(`
            SELECT * FROM ad_redemption_requests 
            WHERE userId = ?
            ORDER BY createdAt DESC
        `, [userId]);

        res.json(requests);
    } catch (error) {
        console.error('Error fetching user redemption requests:', error);
        res.status(500).json({ error: 'Failed to fetch user redemption requests' });
    }
});

// Create redemption request
router.post('/', async (req, res) => {
    try {
        const { userId, packageId, pointsCost, durationMinutes, bannerData } = req.body;

        const db = await getDB();

        // Check user's current points
        const user = await db.get('SELECT ecoPoints FROM users WHERE id = ?', [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.ecoPoints < pointsCost) {
            return res.status(400).json({
                error: 'Insufficient EcoPoints',
                required: pointsCost,
                available: user.ecoPoints
            });
        }

        const id = `redemption-${Date.now()}`;
        const createdAt = new Date().toISOString();

        // Create redemption request
        await db.run(`
            INSERT INTO ad_redemption_requests (
                id, userId, packageId, pointsCost, durationMinutes,
                bannerData, status, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, userId, packageId, pointsCost, durationMinutes,
            JSON.stringify(bannerData), 'pending', createdAt
        ]);

        // Deduct points from user (hold them)
        await db.run(`
            UPDATE users 
            SET ecoPoints = ecoPoints - ? 
            WHERE id = ?
        `, [pointsCost, userId]);

        // Create notification for admin
        await db.run(`
            INSERT INTO notifications (
                id, userId, type, title, message, read, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            `notif-${Date.now()}`,
            'admin-1',
            'ad_redemption',
            'New Ad Space Redemption Request',
            `${user.name || 'A user'} wants to redeem ${durationMinutes} minutes of ad space for ${pointsCost} points`,
            0,
            createdAt
        ]);

        // Create notification for user
        await db.run(`
            INSERT INTO notifications (
                id, userId, type, title, message, read, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            `notif-${Date.now() + 1}`,
            userId,
            'ad_redemption_submitted',
            'Ad Redemption Request Submitted',
            `Your request for ${durationMinutes} minutes of ad space has been submitted. Admin will review it shortly.`,
            0,
            createdAt
        ]);

        const request = await db.get('SELECT * FROM ad_redemption_requests WHERE id = ?', [id]);
        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating redemption request:', error);
        res.status(500).json({ error: 'Failed to create redemption request' });
    }
});

// Approve redemption request
router.post('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { bannerId } = req.body;

        const db = await getDB();

        const request = await db.get('SELECT * FROM ad_redemption_requests WHERE id = ?', [id]);

        if (!request) {
            return res.status(404).json({ error: 'Redemption request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        const approvedAt = new Date().toISOString();

        // Update request status
        await db.run(`
            UPDATE ad_redemption_requests 
            SET status = 'approved', bannerId = ?, approvedAt = ?
            WHERE id = ?
        `, [bannerId, approvedAt, id]);

        // Create notification for user
        await db.run(`
            INSERT INTO notifications (
                id, userId, type, title, message, read, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            `notif-${Date.now()}`,
            request.userId,
            'ad_redemption_approved',
            'Ad Space Approved!',
            `Your ad space request has been approved and is now live for ${request.durationMinutes} minutes!`,
            0,
            approvedAt
        ]);

        res.json({ success: true, message: 'Redemption approved' });
    } catch (error) {
        console.error('Error approving redemption:', error);
        res.status(500).json({ error: 'Failed to approve redemption' });
    }
});

// Reject redemption request
router.post('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const db = await getDB();

        const request = await db.get('SELECT * FROM ad_redemption_requests WHERE id = ?', [id]);

        if (!request) {
            return res.status(404).json({ error: 'Redemption request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        const rejectedAt = new Date().toISOString();

        // Update request status
        await db.run(`
            UPDATE ad_redemption_requests 
            SET status = 'rejected', rejectionReason = ?, rejectedAt = ?
            WHERE id = ?
        `, [reason, rejectedAt, id]);

        // Refund points to user
        await db.run(`
            UPDATE users 
            SET ecoPoints = ecoPoints + ? 
            WHERE id = ?
        `, [request.pointsCost, request.userId]);

        // Create notification for user
        await db.run(`
            INSERT INTO notifications (
                id, userId, type, title, message, read, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            `notif-${Date.now()}`,
            request.userId,
            'ad_redemption_rejected',
            'Ad Space Request Rejected',
            `Your ad space request was rejected. ${reason || 'Please contact admin for details.'}. Your ${request.pointsCost} points have been refunded.`,
            0,
            rejectedAt
        ]);

        res.json({ success: true, message: 'Redemption rejected and points refunded' });
    } catch (error) {
        console.error('Error rejecting redemption:', error);
        res.status(500).json({ error: 'Failed to reject redemption' });
    }
});

export default router;
