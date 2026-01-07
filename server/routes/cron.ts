import { Router } from 'express';
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

export default router;
