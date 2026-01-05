import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db.js';
import * as aiService from '../services/aiService.js';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { validateDonation } from '../middleware/validation.js';

const router = Router();

// Get all donations (with optional filtering)
// Get donations for map (public endpoint)
// Must be defined BEFORE /:id to prevent conflict
router.get('/map', async (_req, res) => {
    try {
        const db = getDB();

        // Get all donations with location data
        const donations = await db.all(`
            SELECT 
                d.id,
                d.lat,
                d.lng,
                d.aiFoodType as foodType,
                d.quantity,
                d.expiry,
                d.status,
                d.description,
                u.name as donorName,
                u.type as donorRole
            FROM donations d
            LEFT JOIN users u ON d.donorId = u.id
            WHERE d.lat IS NOT NULL 
            AND d.lng IS NOT NULL
            AND d.status IN ('available', 'Available', 'Pending Pickup')
            ORDER BY d.createdAt DESC
            LIMIT 100
        `);

        res.json(donations);
    } catch (error) {
        console.error('Error fetching map donations:', error);
        res.status(500).json({ error: 'Failed to fetch map donations' });
    }
});

// Get all donations (with optional filtering)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
    try {
        const db = getDB();
        const { status, donorId, claimedById } = req.query;

        let query = 'SELECT * FROM donations WHERE 1=1';
        const params: any[] = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (donorId) {
            query += ' AND donorId = ?';
            params.push(donorId);
        }
        if (claimedById) {
            query += ' AND claimedById = ?';
            params.push(claimedById);
        }

        query += ' ORDER BY createdAt DESC';

        const donations = await db.all(query, params);
        res.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

// Get single donation
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const donation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donation' });
    }
});

// Create donation (protected)
router.post('/', authenticateToken, validateDonation, async (req: AuthRequest, res) => {
    const { donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng } = req.body;
    const id = uuidv4();

    try {
        const db = getDB();
        await db.run(
            `INSERT INTO donations (id, donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng]
        );

        const newDonation = await db.get('SELECT * FROM donations WHERE id = ?', id);
        res.status(201).json(newDonation);
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ error: 'Failed to create donation' });
    }
});

// Claim donation (protected)
router.post('/:id/claim', authenticateToken, async (req: AuthRequest, res) => {
    const { claimedById } = req.body;

    try {
        const db = getDB();

        // Check if donation exists
        const donation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        // Check if already claimed
        // Allow 'Expired' to be claimed by fertilizer
        if (donation.status !== 'Available' && donation.status !== 'available' && donation.status !== 'Expired') {
            return res.status(400).json({ error: 'Donation is no longer available' });
        }

        // Update donation to Pending Pickup
        await db.run(
            'UPDATE donations SET status = ?, claimedById = ?, senderConfirmed = 0, receiverConfirmed = 0 WHERE id = ?',
            ['Pending Pickup', claimedById, req.params.id]
        );

        const updated = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        res.json(updated);
    } catch (error) {
        console.error('Error claiming donation:', error);
        res.status(500).json({ error: 'Failed to claim donation' });
    }
});

// Confirm Sent (Donor)
router.post('/:id/confirm-sent', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const db = getDB();
        const donation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        // Ensure the user is the donor
        if (donation.donorId !== req.user?.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await db.run('UPDATE donations SET senderConfirmed = 1 WHERE id = ?', req.params.id);

        // Check if both confirmed
        const updatedDonation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        if (updatedDonation.receiverConfirmed) {
            await db.run('UPDATE donations SET status = ? WHERE id = ?', ['Completed', req.params.id]);
        }

        res.json({ message: 'Sender confirmation recorded', status: updatedDonation.receiverConfirmed ? 'Completed' : 'Pending Pickup' });
    } catch (error) {
        console.error('Error confirming sent:', error);
        res.status(500).json({ error: 'Failed to confirm' });
    }
});

// Confirm Received (Receiver)
router.post('/:id/confirm-received', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const db = getDB();
        const donation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        // Ensure the user is the claimer
        if (donation.claimedById !== req.user?.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await db.run('UPDATE donations SET receiverConfirmed = 1 WHERE id = ?', req.params.id);

        // Check if both confirmed
        const updatedDonation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        if (updatedDonation.senderConfirmed) {
            await db.run('UPDATE donations SET status = ? WHERE id = ?', ['Completed', req.params.id]);
        }

        res.json({ message: 'Receiver confirmation recorded', status: updatedDonation.senderConfirmed ? 'Completed' : 'Pending Pickup' });
    } catch (error) {
        console.error('Error confirming received:', error);
        res.status(500).json({ error: 'Failed to confirm' });
    }
});

// Update donation status (protected)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { status, claimedById } = req.body;

    try {
        const db = getDB();

        // Check if donation exists
        const donation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        await db.run(
            'UPDATE donations SET status = ?, claimedById = ? WHERE id = ?',
            [status || donation.status, claimedById || donation.claimedById, req.params.id]
        );

        const updated = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update donation' });
    }
});

// Delete donation (protected)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const db = getDB();

        const donation = await db.get('SELECT * FROM donations WHERE id = ?', req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        // Only donor can delete
        if (donation.donorId !== req.user?.id) {
            return res.status(403).json({ error: 'Not authorized to delete this donation' });
        }

        await db.run('DELETE FROM donations WHERE id = ?', req.params.id);
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete donation' });
    }
});

// Analyze image
router.post('/analyze', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const result = await aiService.analyzeImage(imageUrl);
        res.json(result);
    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Generate impact story
router.post('/impact-story', async (req, res) => {
    const { stats } = req.body;

    if (!stats) {
        return res.status(400).json({ error: 'Stats are required' });
    }

    try {
        const story = await aiService.generateImpactStory(stats);
        res.json({ story });
    } catch (error) {
        console.error('Story generation error:', error);
        res.status(500).json({ error: 'Failed to generate story' });
    }
});



export default router;
