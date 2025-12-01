import { Router } from 'express';
import { getDB } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { type, userId, startDate, endDate } = req.query;

        let query = `
            SELECT ft.*, u.name as userName, u.email as userEmail
            FROM financial_transactions ft
            LEFT JOIN users u ON ft.userId = u.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (type) {
            query += ' AND ft.type = ?';
            params.push(type);
        }
        if (userId) {
            query += ' AND ft.userId = ?';
            params.push(userId);
        }
        if (startDate) {
            query += ' AND ft.createdAt >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND ft.createdAt <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY ft.createdAt DESC';

        const transactions = await db.all(query, params);
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get fund balance
router.get('/balance', async (_req, res) => {
    try {
        const db = getDB();
        const balance = await db.get('SELECT * FROM fund_balance WHERE id = 1');
        res.json(balance || { totalBalance: 0, totalDonations: 0, totalWithdrawals: 0 });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// Get financial summary
router.get('/summary', async (req, res) => {
    try {
        const db = getDB();
        const { period } = req.query; // 'day', 'week', 'month', 'year'

        let dateFilter = '';
        if (period === 'day') {
            dateFilter = "AND createdAt >= date('now', '-1 day')";
        } else if (period === 'week') {
            dateFilter = "AND createdAt >= date('now', '-7 days')";
        } else if (period === 'month') {
            dateFilter = "AND createdAt >= date('now', '-1 month')";
        } else if (period === 'year') {
            dateFilter = "AND createdAt >= date('now', '-1 year')";
        }

        const donations = await db.get(
            `SELECT SUM(amount) as total, COUNT(*) as count 
             FROM financial_transactions 
             WHERE type = 'donation' ${dateFilter}`
        );

        const withdrawals = await db.get(
            `SELECT SUM(amount) as total, COUNT(*) as count 
             FROM financial_transactions 
             WHERE type = 'withdrawal' ${dateFilter}`
        );

        const byCategory = await db.all(
            `SELECT category, SUM(amount) as total, COUNT(*) as count 
             FROM financial_transactions 
             WHERE type = 'withdrawal' ${dateFilter}
             GROUP BY category`
        );

        res.json({
            donations: {
                total: donations.total || 0,
                count: donations.count || 0
            },
            withdrawals: {
                total: withdrawals.total || 0,
                count: withdrawals.count || 0
            },
            byCategory,
            netBalance: (donations.total || 0) - (withdrawals.total || 0)
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// Record donation
router.post('/donation', async (req, res) => {
    const { amount, userId, donationId, description } = req.body;

    try {
        const db = getDB();
        const id = uuidv4();

        await db.run(
            `INSERT INTO financial_transactions (id, type, amount, userId, donationId, category, description)
             VALUES (?, 'donation', ?, ?, ?, 'general', ?)`,
            [id, amount, userId, donationId, description || 'Donation received']
        );

        // Update fund balance
        await db.run(
            `UPDATE fund_balance 
             SET totalBalance = totalBalance + ?, 
                 totalDonations = totalDonations + ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = 1`,
            [amount, amount]
        );

        const transaction = await db.get('SELECT * FROM financial_transactions WHERE id = ?', id);
        res.status(201).json(transaction);
    } catch (error) {
        console.error('Record donation error:', error);
        res.status(500).json({ error: 'Failed to record donation' });
    }
});

// Record withdrawal
router.post('/withdrawal', async (req, res) => {
    const { amount, userId, category, description } = req.body;

    if (!['transportation', 'packaging', 'other'].includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        const db = getDB();

        // Check if sufficient balance
        const balance = await db.get('SELECT totalBalance FROM fund_balance WHERE id = 1');
        if (!balance || balance.totalBalance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const id = uuidv4();

        await db.run(
            `INSERT INTO financial_transactions (id, type, amount, userId, category, description)
             VALUES (?, 'withdrawal', ?, ?, ?, ?)`,
            [id, amount, userId, category, description || `Withdrawal for ${category}`]
        );

        // Update fund balance
        await db.run(
            `UPDATE fund_balance 
             SET totalBalance = totalBalance - ?, 
                 totalWithdrawals = totalWithdrawals + ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = 1`,
            [amount, amount]
        );

        const transaction = await db.get('SELECT * FROM financial_transactions WHERE id = ?', id);
        res.status(201).json(transaction);
    } catch (error) {
        console.error('Record withdrawal error:', error);
        res.status(500).json({ error: 'Failed to record withdrawal' });
    }
});

// Get transaction analytics
router.get('/analytics', async (_req, res) => {
    try {
        const db = getDB();

        // Monthly trend
        const monthlyTrend = await db.all(`
            SELECT 
                strftime('%Y-%m', createdAt) as month,
                type,
                SUM(amount) as total
            FROM financial_transactions
            WHERE createdAt >= date('now', '-12 months')
            GROUP BY month, type
            ORDER BY month DESC
        `);

        // Category breakdown
        const categoryBreakdown = await db.all(`
            SELECT 
                category,
                SUM(amount) as total,
                COUNT(*) as count
            FROM financial_transactions
            WHERE type = 'withdrawal'
            GROUP BY category
        `);

        // Top donors
        const topDonors = await db.all(`
            SELECT 
                u.name,
                u.email,
                SUM(ft.amount) as totalDonated,
                COUNT(ft.id) as donationCount
            FROM financial_transactions ft
            JOIN users u ON ft.userId = u.id
            WHERE ft.type = 'donation'
            GROUP BY ft.userId
            ORDER BY totalDonated DESC
            LIMIT 10
        `);

        res.json({
            monthlyTrend,
            categoryBreakdown,
            topDonors
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
