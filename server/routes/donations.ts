import { Router } from 'express';

import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db.js';
import * as aiService from '../services/aiService.js';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { validateDonation } from '../middleware/validation.js';
import imageStorage from '../services/imageStorage.js';
import notificationService from '../services/notifications.js';

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

// Get recent activity feed (Completed donations)
router.get('/feed', async (_req, res) => {
    try {
        const db = getDB();
        const feed = await db.all(`
            SELECT 
                d.id, d.aiFoodType, d.quantity, d.createdAt,
                u.name as donorName, u.organization as donorOrg
            FROM donations d
            JOIN users u ON d.donorId = u.id
            WHERE d.status = 'Completed'
            ORDER BY d.createdAt DESC
            LIMIT 10
        `);
        res.json(feed);
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
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

// Create donation (optional auth for demo mode - allows anonymous donations)
router.post('/', optionalAuth, validateDonation, async (req: AuthRequest, res) => {
    let { donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng, recommendations } = req.body;
    const id = uuidv4();

    // Prioritize authenticated user ID from token over body donorId
    // This ensures logged-in users always get their donations credited to them
    const finalDonorId = (req as any).user?.id || donorId || 'anonymous';
    
    // Log for debugging
    console.log('📝 Donation creation:', {
        authenticatedUserId: (req as any).user?.id,
        bodyDonorId: donorId,
        finalDonorId,
        hasToken: !!(req.headers['authorization'])
    });
    const finalStatus = status?.toLowerCase() || 'available';
    const finalRecommendations = recommendations || 'Food';
    
    // Ensure all required fields have defaults for demo mode
    let finalAiFoodType = aiFoodType || 'Food';
    let finalAiQualityScore = aiQualityScore || 85;
    let finalImageUrl = imageUrl || '';
    const finalDescription = description || 'Food donation';
    const finalQuantity = quantity || '1 piece';
    const finalLat = lat || 31.5204; // Default to Lahore
    const finalLng = lng || 74.3587;

    try {
        const db = getDB();

        // Handle Base64 Image Upload for Donations
        if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
            try {
                const base64Data = finalImageUrl.split(',')[1] || finalImageUrl;
                const buffer = Buffer.from(base64Data, 'base64');
                const uploadResult = await imageStorage.uploadImage(buffer, 'donations');
                finalImageUrl = uploadResult.secure_url;
                console.log('✅ Donation image uploaded to cloud:', finalImageUrl);
            } catch (imageError) {
                console.error('⚠️ Image upload failed, keeping original URI (might be large):', imageError);
            }
        }

        // 1. Primary Operation: INSERT
        await db.run(
            `INSERT INTO donations (id, donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng, recommendations)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, finalDonorId, finalStatus, expiry, finalAiFoodType, finalAiQualityScore, finalImageUrl, finalDescription, finalQuantity, finalLat, finalLng, finalRecommendations]
        );

        // 2. Fetch created record for confirmation
        let newDonation;
        try {
            newDonation = await db.get('SELECT * FROM donations WHERE id = ?', id);
        } catch (getErr) {
            console.warn('⚠️ Verification fetch failed, using manual object:', getErr);
            newDonation = { id, donorId: finalDonorId, status: finalStatus, createdAt: new Date().toISOString() };
        }

        // 3. Side Effects (Wrapped in try-catch to prevent overall failure)
        try {
            // Award EcoPoints for donation (10 points per donation)
            if (finalDonorId && finalDonorId !== 'anonymous') {
                try {
                    const beforeUpdate = await db.get('SELECT ecoPoints FROM users WHERE id = ?', finalDonorId);
                    await db.run(
                        'UPDATE users SET ecoPoints = ecoPoints + ? WHERE id = ?',
                        [10, finalDonorId]
                    );
                    const afterUpdate = await db.get('SELECT ecoPoints FROM users WHERE id = ?', finalDonorId);
                    console.log(`✅ Awarded 10 EcoPoints to user ${finalDonorId} (${beforeUpdate?.ecoPoints || 0} → ${afterUpdate?.ecoPoints || 0})`);
                } catch (pointsErr) {
                    console.error('⚠️ Failed to award EcoPoints:', pointsErr);
                }
            } else {
                console.warn('⚠️ Skipping EcoPoints: finalDonorId is anonymous or missing');
            }

            // Feature: Push notification to NGOs for matching food
            const users = await db.all('SELECT id FROM users WHERE (type = ? OR type = ?) AND id != ?', ['ngo', 'shelter', finalDonorId]);
            const userIds = users.filter((u: any) => u.id).map((u: any) => u.id);
            if (userIds.length > 0) {
                await notificationService.sendBulkNotification(userIds, 'donation_available', {
                    foodType: finalAiFoodType,
                    location: 'Nearby (Check Map)'
                });
            }
        } catch (notifErr) {
            console.error('⚠️ Post-creation side effects (notifications) failed:', notifErr);
        }

        // Get updated user ecoPoints for response
        let updatedEcoPoints = null;
        if (finalDonorId && finalDonorId !== 'anonymous') {
            try {
                const updatedUser = await db.get('SELECT ecoPoints FROM users WHERE id = ?', finalDonorId);
                updatedEcoPoints = updatedUser?.ecoPoints || null;
            } catch (e) {
                // Ignore error
            }
        }

        res.status(201).json({
            ...(newDonation || { id, success: true }),
            ecoPointsEarned: 10,
            updatedEcoPoints
        });
    } catch (error: any) {
        console.error('❌ CRITICAL ERROR creating donation:', error);

        // Provide more detail if possible for demo debugging
        const errorMessage = error.message || 'Unknown database error';
        res.status(500).json({
            error: 'Failed to create donation',
            details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined,
            code: error.code
        });
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

        // Notify Donor
        const claimer = await db.get('SELECT name FROM users WHERE id = ?', [claimedById]);
        await notificationService.sendNotification({
            userId: donation.donorId,
            type: 'donation_claimed',
            data: {
                foodType: donation.aiFoodType || 'Donation',
                claimerName: claimer?.name || 'An NGO'
            }
        });

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
    const { imageUrl, filename } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const result = await aiService.analyzeImage(imageUrl, filename);
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

// Get AI safety tip
router.get('/ai/safety-tip', async (req, res) => {
    const { foodType } = req.query;
    try {
        const tip = await aiService.generateSafetyTip(foodType as string);
        res.json({ tip });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Get AI welcome message
router.post('/ai/welcome', async (req, res) => {
    const { name, role } = req.body;
    try {
        const message = await aiService.generateWelcomeMessage(name, role);
        res.json({ message });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;