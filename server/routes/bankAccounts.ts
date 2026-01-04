import { Router } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Get user's bank accounts
 * GET /api/bank-accounts/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const db = getDB();

        const accounts = await db.all(
            `SELECT * FROM bank_accounts WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC`,
            [userId]
        );

        res.json(accounts);
    } catch (error) {
        console.error('Get bank accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
});

/**
 * Add bank account
 * POST /api/bank-accounts
 */
router.post('/', async (req, res) => {
    const {
        userId,
        accountHolderName,
        bankName,
        accountNumber,
        iban,
        branchCode,
        accountType,
        isDefault
    } = req.body;

    try {
        const db = getDB();

        // Verify user exists
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify user is beneficiary organization
        if (!['ngo', 'shelter', 'fertilizer'].includes(user.type)) {
            return res.status(403).json({
                error: 'Only beneficiary organizations can add bank accounts'
            });
        }

        // Validate required fields
        if (!accountHolderName || !bankName || !accountNumber) {
            return res.status(400).json({
                error: 'Account holder name, bank name, and account number are required'
            });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await db.run(
                'UPDATE bank_accounts SET isDefault = 0 WHERE userId = ?',
                [userId]
            );
        }

        const id = uuidv4();

        await db.run(
            `INSERT INTO bank_accounts 
             (id, userId, accountHolderName, bankName, accountNumber, iban, branchCode, accountType, isDefault, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                id,
                userId,
                accountHolderName,
                bankName,
                accountNumber,
                iban || null,
                branchCode || null,
                accountType || 'savings',
                isDefault ? 1 : 0
            ]
        );

        const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        res.status(201).json(account);
    } catch (error) {
        console.error('Add bank account error:', error);
        res.status(500).json({ error: 'Failed to add bank account' });
    }
});

/**
 * Update bank account
 * PUT /api/bank-accounts/:id
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        accountHolderName,
        bankName,
        accountNumber,
        iban,
        branchCode,
        accountType,
        isDefault
    } = req.body;

    try {
        const db = getDB();

        const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await db.run(
                'UPDATE bank_accounts SET isDefault = 0 WHERE userId = ?',
                [account.userId]
            );
        }

        await db.run(
            `UPDATE bank_accounts 
             SET accountHolderName = ?, bankName = ?, accountNumber = ?, 
                 iban = ?, branchCode = ?, accountType = ?, isDefault = ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                accountHolderName || account.accountHolderName,
                bankName || account.bankName,
                accountNumber || account.accountNumber,
                iban !== undefined ? iban : account.iban,
                branchCode !== undefined ? branchCode : account.branchCode,
                accountType || account.accountType,
                isDefault !== undefined ? (isDefault ? 1 : 0) : account.isDefault,
                id
            ]
        );

        const updated = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Update bank account error:', error);
        res.status(500).json({ error: 'Failed to update bank account' });
    }
});

/**
 * Delete bank account
 * DELETE /api/bank-accounts/:id
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();

        const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        await db.run('DELETE FROM bank_accounts WHERE id = ?', [id]);

        res.json({ success: true, message: 'Bank account deleted' });
    } catch (error) {
        console.error('Delete bank account error:', error);
        res.status(500).json({ error: 'Failed to delete bank account' });
    }
});

/**
 * Set default bank account
 * POST /api/bank-accounts/:id/set-default
 */
router.post('/:id/set-default', async (req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();

        const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        // Unset all defaults for this user
        await db.run(
            'UPDATE bank_accounts SET isDefault = 0 WHERE userId = ?',
            [account.userId]
        );

        // Set this as default
        await db.run(
            'UPDATE bank_accounts SET isDefault = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        const updated = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Set default account error:', error);
        res.status(500).json({ error: 'Failed to set default account' });
    }
});

/**
 * Verify bank account (Admin only)
 * POST /api/bank-accounts/:id/verify
 */
router.post('/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { adminId } = req.body;

    try {
        const db = getDB();

        // Verify admin
        const admin = await db.get('SELECT * FROM users WHERE id = ? AND type = ?', [adminId, 'admin']);
        if (!admin) {
            return res.status(403).json({ error: 'Only admins can verify accounts' });
        }

        const account = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        if (!account) {
            return res.status(404).json({ error: 'Bank account not found' });
        }

        await db.run(
            'UPDATE bank_accounts SET isVerified = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        const updated = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Verify account error:', error);
        res.status(500).json({ error: 'Failed to verify account' });
    }
});

/**
 * Get all bank accounts (Admin only)
 * GET /api/bank-accounts/admin/all
 */
router.get('/admin/all', async (_req, res) => {
    try {
        const db = getDB();

        const accounts = await db.all(
            `SELECT ba.*, u.name as userName, u.email as userEmail, u.organization, u.type as userType
             FROM bank_accounts ba
             LEFT JOIN users u ON ba.userId = u.id
             ORDER BY ba.createdAt DESC`
        );

        res.json(accounts);
    } catch (error) {
        console.error('Get all bank accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch bank accounts' });
    }
});

export default router;
