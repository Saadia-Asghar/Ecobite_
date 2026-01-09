
import { Router } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/seed', async (_req, res) => {
    try {
        const db = getDB();
        const email = 'saadianigah@gmail.com';

        let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        let userId;

        if (!user) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            userId = uuidv4();
            await db.run(
                'INSERT INTO users (id, email, password, name, type, organization, licenseId, location, ecoPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, email, hashedPassword, 'Saadia Anigah', 'individual', null, null, 'Lahore', 0]
            );
        } else {
            userId = user.id;
        }

        // Add Donations
        const donationCount = 12;
        const weightPerDonation = 5.0;

        for (let i = 0; i < donationCount; i++) {
            const donationId = uuidv4();
            const date = new Date();
            date.setDate(date.getDate() - (i * 2));

            await db.run(
                `INSERT INTO donations (
                    id, donorId, status, description, quantity, weight, 
                    aiFoodType, aiQualityScore, createdAt, claimedAt, claimedById
                ) VALUES (?, ?, 'Completed', ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    donationId,
                    userId,
                    `Donation #${i + 1} - Homemade Meal`,
                    '10 Packets',
                    weightPerDonation,
                    'Cooked Food',
                    95,
                    date.toISOString(),
                    new Date(date.getTime() + 3600000).toISOString(),
                    'ngo-seed-1'
                ]
            );
        }

        // Set Points
        await db.run('UPDATE users SET ecoPoints = 350 WHERE id = ?', [userId]);

        res.json({ message: 'Seeding successful', email, points: 350, donations: 12 });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Seeding failed' });
    }
});

export default router;
