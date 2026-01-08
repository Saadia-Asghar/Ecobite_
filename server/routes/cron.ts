import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db.js';
import { sendMonthlyStatsEmail } from '../services/email.js';

const router = Router();

// Secure Cron Endpoint
router.get('/monthly-stats', async (req, res) => {
    // Basic security check (Optional: use CRON_SECRET env var)
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET || 'ecobite-secret-cron-key';

    // Allow if header matches OR if running in dev (localhost) without strict check
    // For manual triggering via browser, we might relax this or requiring ?key=...
    const queryKey = req.query.key;

    if (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret) {
        return res.status(401).json({ error: 'Unauthorized cron request' });
    }

    try {
        const db = getDB();

        // 1. Get all users who have enabled notifications (or all for now)
        // Assuming emailNotifications default is 1 or NULL (treated as 1)
        const users = await db.all('SELECT id, email, name, emailNotifications FROM users');

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthName = now.toLocaleString('default', { month: 'long' });

        let sentCount = 0;
        let errors = 0;

        for (const user of users) {
            // Skip if notifications disabled (explicitly 0)
            if (user.emailNotifications === 0) continue;
            if (!user.email) continue;

            try {
                // 2. Calculate stats for this month
                // Count donations
                const donationStats = await db.get(
                    `SELECT COUNT(*) as count 
                      FROM donations 
                      WHERE donorId = ? 
                      AND createdAt >= ?`,
                    [user.id, startOfMonth]
                );

                const count = donationStats?.count || 0;

                // If no activity, maybe skip? Or send a "We miss you" email?
                // For now, only send if they have done something to be "Motivational"
                // Or send anyway with 0 to encourage them?
                // User said "stats should go in email for motivation".
                // A report with 0 might be demotivating, but "Start your journey" message is better.
                // For simplicity, I'll send it regardless, or minimal check.

                // Calculate metrics (using same estimates as users.ts)
                const co2Saved = count * 2.5;
                const peopleFed = count * 3;

                // EcoPoints Earned this month
                // We don't have a transaction log for points easily queryable by date in simple schema
                // So we might just show Total EcoPoints or estimate. 
                // Let's us Total EcoPoints for now as a "Current Balance" feature.
                // Or 0 if we want strictly monthly.
                // Let's use an estimate: count * 100 (assuming 100 avg per donation) check mockData logic?
                // mockData says "1250 ecoPoints", "12 donations". ~100 per donation.
                const ecoPointsEarned = count * 100;

                // 3. Send Email
                await sendMonthlyStatsEmail(
                    user.email,
                    user.name || 'Eco-Warrior',
                    {
                        donations: count,
                        co2Saved,
                        peopleFed,
                        ecoPointsEarned,
                        monthName
                    }
                );

                sentCount++;
            } catch (err) {
                console.error(`Failed to send stats to ${user.email}:`, err);
                errors++;
            }
        }

        res.json({
            success: true,
            message: `Processed monthly stats`,
            sent: sentCount,
            errors
        });

    } catch (error) {
        console.error('Cron job error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper to calculate distance (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 2. Expiry Guardian - Urgent Rescue Alerts
router.get('/expiry-alerts', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET || 'ecobite-secret-cron-key';
    const queryKey = req.query.key;

    if (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret) {
        return res.status(401).json({ error: 'Unauthorized cron request' });
    }

    try {
        const db = getDB();
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        // 1. Find donations expiring in less than 2 hours that are still available
        // Note: SQLite/SQL Server date comparisons can be tricky depending on storage format
        // Assuming ISO strings in 'expiry'
        const donations = await db.all(
            `SELECT id, aiFoodType, lat, lng, expiry, donorId, quantity 
             FROM donations 
             WHERE status = 'Available' 
             AND expiry IS NOT NULL 
             AND expiry <= ? 
             AND expiry > ?`,
            [twoHoursLater.toISOString(), now.toISOString()]
        );

        if (donations.length === 0) {
            return res.json({ success: true, message: 'No urgent donations found.' });
        }

        // 2. Get all NGOs & Shelters
        const NGOs = await db.all(
            "SELECT id, email, name, lat, lng, type FROM users WHERE type IN ('ngo', 'shelter', 'animal_shelter', 'fertilizer')"
        );

        let totalAlertsSent = 0;

        for (const donation of donations) {
            if (!donation.lat || !donation.lng) continue;

            // 3. Find top 5 nearest NGOs for THIS donation
            const nearbyNGOs = NGOs
                .map((ngo: any) => ({
                    ...ngo,
                    distance: (ngo.lat && ngo.lng) ? getDistance(Number(donation.lat), Number(donation.lng), Number(ngo.lat), Number(ngo.lng)) : 999999
                }))
                .filter((ngo: any) => ngo.distance < 20) // Only NGOs within 20km
                .sort((a: any, b: any) => a.distance - b.distance)
                .slice(0, 5);

            // 4. Send Notifications
            for (const ngo of nearbyNGOs) {
                try {
                    // Send Email Notification
                    // Assuming we have a service for urgent alerts
                    // For now, using console.log or extending email service
                    console.log(`🚀 URGENT ALERT: Notifying ${ngo.name} about ${donation.aiFoodType} expiring soon at distance ${ngo.distance.toFixed(2)}km`);

                    // In a real app, we'd call push notifications or SMS here
                    // Integration with Azure Communication Services (Email)
                    await db.run(
                        `INSERT INTO notifications (id, userId, title, message, type, read, createdAt)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            uuidv4(),
                            ngo.id,
                            '🚨 URGENT: Food Rescue Needed!',
                            `Urgent! ${donation.aiFoodType} nearby is expiring in less than 2 hours. Claim it now to prevent waste!`,
                            'URGENT',
                            0,
                            new Date().toISOString()
                        ]
                    );

                    totalAlertsSent++;
                } catch (err) {
                    console.error(`Failed to notify NGO ${ngo.id}:`, err);
                }
            }
        }

        res.json({
            success: true,
            message: `Expiry Guardian processed ${donations.length} urgent donations`,
            alertsSent: totalAlertsSent
        });

    } catch (error) {
        console.error('Expiry Guardian error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
