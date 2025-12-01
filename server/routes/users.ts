import { Router } from 'express';
import { getDB } from '../db';

const router = Router();

// Get all users
router.get('/', async (_req, res) => {
    try {
        const db = getDB();
        const users = await db.all('SELECT id, email, name, type, organization, location, ecoPoints FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get leaderboard - MUST come before /:id routes
router.get('/leaderboard/top', async (_req, res) => {
    try {
        const db = getDB();
        const leaders = await db.all(
            `SELECT name, organization, type, ecoPoints, 
             (SELECT COUNT(*) FROM donations WHERE donorId = users.id) as donationCount
             FROM users 
             ORDER BY ecoPoints DESC 
             LIMIT 10`
        );

        res.json(leaders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Update user profile (Admin can update all fields)
// IMPORTANT: This must come BEFORE GET /:id
router.put('/:id', async (req, res) => {
    const { name, organization, type, ecoPoints } = req.body;

    try {
        const db = getDB();

        // If type and ecoPoints are provided, it's an admin update
        if (type !== undefined && ecoPoints !== undefined) {
            await db.run(
                'UPDATE users SET name = ?, organization = ?, type = ?, ecoPoints = ? WHERE id = ?',
                [name, organization || null, type, ecoPoints || 0, req.params.id]
            );
        } else {
            // Regular user update
            await db.run(
                'UPDATE users SET name = ?, organization = ? WHERE id = ?',
                [name, organization, req.params.id]
            );
        }

        const updatedUser = await db.get(
            'SELECT id, email, name, type, organization, location, ecoPoints FROM users WHERE id = ?',
            req.params.id
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (Admin only)
// IMPORTANT: This must come BEFORE GET /:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();

        // Check if user exists
        const user = await db.get('SELECT id FROM users WHERE id = ?', id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await db.run('DELETE FROM users WHERE id = ?', id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Add EcoPoints - MUST come before GET /:id
router.post('/:id/points', async (req, res) => {
    const { points } = req.body;

    if (!points || points <= 0) {
        return res.status(400).json({ error: 'Invalid points value' });
    }

    try {
        const db = getDB();
        await db.run(
            'UPDATE users SET ecoPoints = ecoPoints + ? WHERE id = ?',
            [points, req.params.id]
        );

        const user = await db.get('SELECT ecoPoints FROM users WHERE id = ?', req.params.id);
        res.json({ ecoPoints: user.ecoPoints });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add points' });
    }
});

// Get user stats - MUST come before GET /:id
router.get('/:id/stats', async (req, res) => {
    try {
        const db = getDB();

        // Get donation count
        const donationCount = await db.get(
            'SELECT COUNT(*) as count FROM donations WHERE donorId = ?',
            req.params.id
        );

        // Get claimed count (for NGOs/Shelters)
        const claimedCount = await db.get(
            'SELECT COUNT(*) as count FROM donations WHERE claimedById = ?',
            req.params.id
        );

        // Get user points
        const user = await db.get(
            'SELECT ecoPoints FROM users WHERE id = ?',
            req.params.id
        );

        res.json({
            donations: donationCount.count || 0,
            claimed: claimedCount.count || 0,
            ecoPoints: user?.ecoPoints || 0,
            peopleFed: (donationCount.count || 0) * 3, // Estimate
            co2Saved: (donationCount.count || 0) * 2.5 // Estimate in kg
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get user profile - This MUST be last among /:id routes
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const user = await db.get(
            'SELECT id, email, name, type, organization, licenseId, location, ecoPoints FROM users WHERE id = ?',
            req.params.id
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
