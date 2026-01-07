import { Router } from 'express';
import { getDB } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendMoneyRequestApprovedEmail } from '../services/email.js';

const router = Router();

/**
 * Create a money request (for beneficiaries: NGO, Shelter, Fertilizer)
 * POST /api/money-requests
 */
router.post('/', async (req, res) => {
    const { userId, amount, purpose, distance, transportRate } = req.body;

    try {
        const db = getDB();

        // Verify user exists and is a beneficiary
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is allowed to request money
        if (!['ngo', 'shelter', 'fertilizer'].includes(user.type)) {
            return res.status(403).json({
                error: 'Only NGOs, Shelters, and Fertilizer companies can request money'
            });
        }

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Create money request
        const requestId = uuidv4();
        await db.run(
            `INSERT INTO money_requests (
                id, requesterId, requesterRole, amount, purpose, 
                distance, transportRate, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                requestId,
                userId,
                user.type,
                amount,
                purpose || 'Logistics funding',
                distance || null,
                transportRate || null
            ]
        );

        // Create notification for admin
        const notifId = uuidv4();
        await db.run(
            `INSERT INTO notifications (id, userId, title, message, type)
             SELECT ?, id, ?, ?, 'money_request'
             FROM users WHERE type = 'admin'`,
            [
                notifId,
                'New Money Request',
                `${user.name} (${user.type}) requested PKR ${amount.toLocaleString()} for ${purpose}`
            ]
        );

        const request = await db.get('SELECT * FROM money_requests WHERE id = ?', [requestId]);

        res.status(201).json({
            success: true,
            request,
            message: 'Money request submitted successfully. Awaiting admin approval.'
        });
    } catch (error) {
        console.error('Create money request error:', error);
        res.status(500).json({ error: 'Failed to create money request' });
    }
});

/**
 * Get all money requests (Admin view)
 * GET /api/money-requests
 */
router.get('/', async (req, res) => {
    const { status, userId } = req.query;

    try {
        const db = getDB();

        let query = `
            SELECT 
                mr.*,
                u.name as requesterName,
                u.email as requesterEmail,
                u.organization as requesterOrganization,
                admin.name as reviewedByName
            FROM money_requests mr
            LEFT JOIN users u ON mr.requesterId = u.id
            LEFT JOIN users admin ON mr.reviewedBy = admin.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ' AND mr.status = ?';
            params.push(status);
        }

        if (userId) {
            query += ' AND mr.requesterId = ?';
            params.push(userId);
        }

        query += ' ORDER BY mr.createdAt DESC';

        const requests = await db.all(query, params);

        res.json(requests);
    } catch (error) {
        console.error('Get money requests error:', error);
        res.status(500).json({ error: 'Failed to fetch money requests' });
    }
});

/**
 * Get money request by ID
 * GET /api/money-requests/:id
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();

        const request = await db.get(
            `SELECT 
                mr.*,
                u.name as requesterName,
                u.email as requesterEmail,
                u.organization as requesterOrganization,
                u.phone as requesterPhone,
                admin.name as reviewedByName
            FROM money_requests mr
            LEFT JOIN users u ON mr.requesterId = u.id
            LEFT JOIN users admin ON mr.reviewedBy = admin.id
            WHERE mr.id = ?`,
            [id]
        );

        if (!request) {
            return res.status(404).json({ error: 'Money request not found' });
        }

        res.json(request);
    } catch (error) {
        console.error('Get money request error:', error);
        res.status(500).json({ error: 'Failed to fetch money request' });
    }
});

/**
 * Approve money request (Admin only)
 * POST /api/money-requests/:id/approve
 */
router.post('/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { adminId, bankAccountId, accountType, withdrawalProof } = req.body;

    try {
        const db = getDB();

        // Ensure withdrawalProof column exists
        try {
            await db.run('ALTER TABLE money_requests ADD COLUMN withdrawalProof TEXT');
        } catch (e) {
            // Column likely exists
        }

        // Get request details
        const request = await db.get('SELECT * FROM money_requests WHERE id = ?', [id]);
        if (!request) {
            return res.status(404).json({ error: 'Money request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Get bank account details if provided
        let bankAccount = null;
        if (bankAccountId) {
            bankAccount = await db.get('SELECT * FROM bank_accounts WHERE id = ?', [bankAccountId]);
            if (!bankAccount) {
                return res.status(404).json({ error: 'Bank account not found' });
            }
        }

        // Check if sufficient funds available
        const fundBalance = await db.get('SELECT * FROM fund_balance WHERE id = 1');
        if (!fundBalance || fundBalance.totalBalance < request.amount) {
            return res.status(400).json({
                error: 'Insufficient funds in the pool',
                available: fundBalance?.totalBalance || 0,
                requested: request.amount
            });
        }

        // Update request status
        await db.run(
            `UPDATE money_requests 
             SET status = 'approved', 
                 reviewedBy = ?,
                 reviewedAt = CURRENT_TIMESTAMP,
                 withdrawalProof = ?
             WHERE id = ?`,
            [adminId || 'admin', withdrawalProof || null, id]
        );

        // Deduct from fund balance
        await db.run(
            `UPDATE fund_balance 
             SET totalBalance = totalBalance - ?,
                 totalWithdrawals = totalWithdrawals + ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = 1`,
            [request.amount, request.amount]
        );

        // Record in financial transactions
        const ftId = uuidv4();
        const transferDetails = bankAccount
            ? `Transfer to ${bankAccount.bankName} (${bankAccount.accountNumber}) - ${accountType || 'savings'} account`
            : 'Bank transfer';

        await db.run(
            `INSERT INTO financial_transactions (id, type, amount, userId, category, description)
             VALUES (?, 'withdrawal', ?, ?, 'money_request', ?)`,
            [
                ftId,
                request.amount,
                request.requesterId,
                `Money request approved: PKR ${request.amount} for ${request.purpose}. ${transferDetails}`
            ]
        );

        // Create notification for requester
        const notifId = uuidv4();
        const notificationMessage = bankAccount
            ? `Your request for PKR ${request.amount.toLocaleString()} has been approved! Funds will be transferred to your ${bankAccount.bankName} account (${bankAccount.accountNumber}) - ${accountType || 'savings'} account.`
            : `Your request for PKR ${request.amount.toLocaleString()} has been approved. Funds will be transferred to your bank account.`;

        await db.run(
            `INSERT INTO notifications (id, userId, title, message, type)
             VALUES (?, ?, ?, ?, 'money_request_approved')`,
            [
                notifId,
                request.requesterId,
                '✅ Money Request Approved!',
                notificationMessage
            ]
        );

        // Create admin log
        const logId = uuidv4();
        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetType, targetId, details)
             VALUES (?, ?, 'approve_money_request', 'money_request', ?, ?)`,
            [
                logId,
                adminId || 'admin',
                id,
                `Approved money request of PKR ${request.amount} for ${request.requesterId}. ${transferDetails}`
            ]
        );

        // Get requester details for email
        const requester = await db.get('SELECT name, email FROM users WHERE id = ?', [request.requesterId]);

        // Send email notification (async)
        if (requester && requester.email) {
            sendMoneyRequestApprovedEmail(requester.email, requester.name, request.amount)
                .catch(err => console.error('Failed to send approval email:', err));
        }

        res.json({
            success: true,
            message: 'Money request approved successfully',
            amountApproved: request.amount,
            remainingBalance: fundBalance.total_balance - request.amount,
            bankAccount: bankAccount ? {
                bankName: bankAccount.bankName,
                accountNumber: bankAccount.accountNumber,
                accountType: accountType || 'savings'
            } : null
        });
    } catch (error) {
        console.error('Approve money request error:', error);
        res.status(500).json({ error: 'Failed to approve money request' });
    }
});

/**
 * Reject money request (Admin only)
 * POST /api/money-requests/:id/reject
 */
router.post('/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { adminId, reason } = req.body;

    try {
        const db = getDB();

        // Get request details
        const request = await db.get('SELECT * FROM money_requests WHERE id = ?', [id]);
        if (!request) {
            return res.status(404).json({ error: 'Money request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Update request status
        await db.run(
            `UPDATE money_requests 
             SET status = 'rejected', 
                 reviewedBy = ?,
                 reviewedAt = CURRENT_TIMESTAMP,
                 rejectionReason = ?
             WHERE id = ?`,
            [adminId || 'admin', reason || 'No reason provided', id]
        );

        // Create notification for requester
        const notifId = uuidv4();
        await db.run(
            `INSERT INTO notifications (id, userId, title, message, type)
             VALUES (?, ?, ?, ?, 'money_request_rejected')`,
            [
                notifId,
                request.requesterId,
                '❌ Money Request Rejected',
                `Your request for PKR ${request.amount.toLocaleString()} was rejected. Reason: ${reason || 'Please contact admin for details'}`
            ]
        );

        // Create admin log
        const logId = uuidv4();
        await db.run(
            `INSERT INTO admin_logs (id, adminId, action, targetType, targetId, details)
             VALUES (?, ?, 'reject_money_request', 'money_request', ?, ?)`,
            [
                logId,
                adminId || 'admin',
                id,
                `Rejected money request of PKR ${request.amount}. Reason: ${reason}`
            ]
        );

        res.json({
            success: true,
            message: 'Money request rejected'
        });
    } catch (error) {
        console.error('Reject money request error:', error);
        res.status(500).json({ error: 'Failed to reject money request' });
    }
});

/**
 * Get money request statistics (Admin)
 * GET /api/money-requests/stats/summary
 */
router.get('/stats/summary', async (_req, res) => {
    try {
        const db = getDB();

        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_approved_amount,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
            FROM money_requests
        `);

        const fundBalance = await db.get('SELECT * FROM fund_balance WHERE id = 1');

        res.json({
            ...stats,
            available_balance: fundBalance?.totalBalance || 0,
            total_donations: fundBalance?.totalDonations || 0,
            total_withdrawals: fundBalance?.totalWithdrawals || 0
        });
    } catch (error) {
        console.error('Get money request stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

export default router;
