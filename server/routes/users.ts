import { Router } from 'express';
import { getDB } from '../db.js';

const router = Router();

// Get all users
router.get('/', async (_req, res) => {
    try {
        const db = getDB();
        const users = await db.all(`
            SELECT u.id, u.email, u.name, u.type, u.organization, u.location, u.ecoPoints, u.createdAt, u.isVerified,
                   ba.bankName, ba.accountNumber, ba.createdAt as accountCreatedAt
            FROM users u
            LEFT JOIN bank_accounts ba ON u.id = ba.userId AND ba.isDefault = 1
        `);
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
    const { name, organization, type, ecoPoints, lat, lng } = req.body;

    try {
        const db = getDB();

        // If type and ecoPoints are provided, it's an admin update
        if (type !== undefined && ecoPoints !== undefined) {
            await db.run(
                'UPDATE users SET name = ?, organization = ?, type = ?, ecoPoints = ?, lat = ?, lng = ? WHERE id = ?',
                [name, organization || null, type, ecoPoints || 0, lat || null, lng || null, req.params.id]
            );
        } else {
            // Regular user update (including settings)
            const { emailNotifications, smsNotifications } = req.body;

            if (emailNotifications !== undefined || smsNotifications !== undefined) {
                await db.run(
                    `UPDATE users SET name = ?, organization = ?, 
                     emailNotifications = COALESCE(?, emailNotifications), 
                     smsNotifications = COALESCE(?, smsNotifications),
                     lat = COALESCE(?, lat), 
                     lng = COALESCE(?, lng)
                     WHERE id = ?`,
                    [name, organization, emailNotifications, smsNotifications, lat, lng, req.params.id]
                );
            } else {
                await db.run(
                    'UPDATE users SET name = ?, organization = ?, lat = ?, lng = ? WHERE id = ?',
                    [name, organization, lat || null, lng || null, req.params.id]
                );
            }
        }

        const updatedUser = await db.get(
            'SELECT id, email, name, type, organization, location, ecoPoints, emailNotifications, smsNotifications, lat, lng FROM users WHERE id = ?',
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

// Verify/Unverify user
router.post('/:id/verify', async (req, res) => {
    try {
        const db = getDB();
        const { isVerified } = req.body;
        await db.run('UPDATE users SET isVerified = ? WHERE id = ?', [isVerified ? 1 : 0, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update verification status' });
    }
});

// Get user stats - MUST come before GET /:id
router.get('/:id/stats', async (req, res) => {
    try {
        const db = getDB();
        const userId = req.params.id;

        // 1. Basic Stats (Donations & Claims)
        let counts;
        if (db.constructor.name === 'MockDatabase') {
            // Mock implementation for complex stats query
            const user = await db.get('SELECT id, type, ecoPoints FROM users WHERE id = ?', [userId]);
            const donations = await db.all('SELECT id FROM donations WHERE donorId = ?', [userId]);
            const claimed = await db.all('SELECT id FROM donations WHERE claimedById = ?', [userId]);

            counts = {
                donations: donations.length,
                claimed: claimed.length,
                ecoPoints: user?.ecoPoints || 0,
                type: user?.type || 'individual'
            };
        } else {
            counts = await db.get(`
                SELECT 
                    (SELECT COUNT(*) FROM donations WHERE donorId = ?) as donations,
                    (SELECT COUNT(*) FROM donations WHERE claimedById = ?) as claimed,
                    (SELECT ecoPoints FROM users WHERE id = ?) as ecoPoints,
                    (SELECT type FROM users WHERE id = ?) as type
                FROM users WHERE id = ?
            `, [userId, userId, userId, userId, userId]);
        }

        if (!counts) return res.status(404).json({ error: 'User not found' });

        // Calculate total weight based on role (Donors vs Claimers)
        const isClaimer = ['ngo', 'shelter', 'fertilizer'].includes(counts.type?.toLowerCase());

        // MSSQL compatible query with fallback for weight
        const weightQuery = isClaimer
            ? `SELECT SUM(CASE WHEN weight IS NULL OR weight = 0 THEN 1.2 ELSE weight END) as total FROM donations WHERE claimedById = ? AND status = 'Completed'`
            : `SELECT SUM(CASE WHEN weight IS NULL OR weight = 0 THEN 1.2 ELSE weight END) as total FROM donations WHERE donorId = ? AND status = 'Completed'`;

        let weightData;
        if (db.constructor.name === 'MockDatabase') {
            const donationCount = isClaimer ? counts.claimed : counts.donations;
            weightData = { total: donationCount * 1.2 };
        } else {
            // Azure SQL
            weightData = await db.get(weightQuery, [userId]);
        }

        const totalWeight = weightData?.total || 0;
        const donationCount = counts.donations || 0;

        // 2. Fulfillment Speed (Avg minutes from creation to claim)
        let fulfillmentQuery = `
            SELECT AVG(DATEDIFF(MINUTE, createdAt, claimedAt)) as avgSpeed 
            FROM donations 
            WHERE (donorId = ? OR claimedById = ?) AND claimedAt IS NOT NULL
        `;
        if (db.constructor.name === 'MockDatabase') {
            fulfillmentQuery = `SELECT 25 as avgSpeed`;
        }
        const speedData = await db.get(fulfillmentQuery, [userId, userId]);

        // 3. Hero Streak (Days with completed donations)
        let streakQuery = `
            SELECT COUNT(DISTINCT CAST(createdAt AS DATE)) as streak 
            FROM donations 
            WHERE (donorId = ? OR claimedById = ?) AND (status = 'Completed' OR status = 'Delivered')
            AND createdAt >= DATEADD(day, -30, GETDATE())
        `;
        if (db.constructor.name === 'MockDatabase') {
            streakQuery = `SELECT 5 as streak`;
        }
        const streakData = await db.get(streakQuery, [userId, userId]);

        // 4. Species Breakdown for Shelters (if applicable)
        const speciesData = await db.all(`
            SELECT targetSpecies as name, COUNT(*) as value 
            FROM donations 
            WHERE ( donorId = ? OR claimedById = ? ) AND targetSpecies IS NOT NULL
            GROUP BY targetSpecies
        `, [userId, userId]);

        // Prepare colors for pie chart
        const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
        const formattedSpecies = speciesData.map((s: any, i: number) => ({
            name: s.name,
            value: s.value,
            color: colors[i % colors.length]
        }));

        res.json({
            donations: donationCount,
            claimed: counts.claimed || 0,
            ecoPoints: counts.ecoPoints || 0,
            peopleFed: Math.round(totalWeight * 3), // 3 people per kg
            co2Saved: parseFloat((totalWeight * 2.5).toFixed(1)), // 2.5kg CO2 per kg food saved
            waterSaved: Math.round(totalWeight * 500), // ~500L per kg
            landPreserved: parseFloat((totalWeight * 2.5).toFixed(1)), // ~2.5m² per kg

            // Real Role-Specific Stats
            heroStreak: streakData?.streak || 0,
            wasteToValue: Math.round(totalWeight * 15), // Rs. 15 per kg average value
            fulfillmentSpeed: Math.round(speedData?.avgSpeed || 25),
            petFoodSavings: Math.round(totalWeight * 12), // Rs. 12 per animal meal
            speciesBreakdown: formattedSpecies.length > 0 ? formattedSpecies : [
                { name: 'General', value: 100, color: '#10b981' }
            ],
            circularScore: donationCount > 0 ? 85 : 0,
            compostYield: parseFloat((totalWeight * 0.8).toFixed(1)),
            methanePrevention: parseFloat((totalWeight * 1.5).toFixed(1))
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get user profile - This MUST be last among /:id routes
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const user = await db.get(
            'SELECT id, email, name, type, organization, licenseId, location, ecoPoints, createdAt, isVerified FROM users WHERE id = ?',
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
