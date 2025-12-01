import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db';
import * as aiService from '../services/aiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Get all food requests
router.get('/food', async (req, res) => {
    try {
        const db = getDB();
        const { requesterId } = req.query;

        let query = 'SELECT * FROM food_requests';
        const params: any[] = [];

        if (requesterId) {
            query += ' WHERE requesterId = ?';
            params.push(requesterId);
        }

        query += ' ORDER BY createdAt DESC';

        const requests = await db.all(query, params);
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request
router.get('/food/:id', async (req, res) => {
    try {
        const db = getDB();
        const request = await db.get('SELECT * FROM food_requests WHERE id = ?', req.params.id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Create food request with AI drafts (protected)
router.post('/food', authenticateToken, validateRequest, async (req: AuthRequest, res) => {
    const { requesterId, foodType, quantity } = req.body;
    const id = uuidv4();

    try {
        // Generate AI drafts
        const drafts = await aiService.generateMarketingContent(foodType, quantity);

        const db = getDB();
        await db.run(
            `INSERT INTO food_requests (id, requesterId, foodType, quantity, aiDrafts)
             VALUES (?, ?, ?, ?, ?)`,
            [id, requesterId, foodType, quantity, JSON.stringify(drafts)]
        );

        const newRequest = await db.get('SELECT * FROM food_requests WHERE id = ?', id);

        // Parse aiDrafts back to JSON
        if (newRequest.aiDrafts) {
            newRequest.aiDrafts = JSON.parse(newRequest.aiDrafts);
        }

        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Update request (protected)
router.patch('/food/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { foodType, quantity } = req.body;

    try {
        const db = getDB();

        const request = await db.get('SELECT * FROM food_requests WHERE id = ?', req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Only requester can update
        if (request.requesterId !== req.user?.id) {
            return res.status(403).json({ error: 'Not authorized to update this request' });
        }

        await db.run(
            'UPDATE food_requests SET foodType = ?, quantity = ? WHERE id = ?',
            [foodType || request.foodType, quantity || request.quantity, req.params.id]
        );

        const updated = await db.get('SELECT * FROM food_requests WHERE id = ?', req.params.id);

        if (updated.aiDrafts) {
            updated.aiDrafts = JSON.parse(updated.aiDrafts);
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// Delete request (protected)
router.delete('/food/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const db = getDB();

        const request = await db.get('SELECT * FROM food_requests WHERE id = ?', req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Only requester can delete
        if (request.requesterId !== req.user?.id) {
            return res.status(403).json({ error: 'Not authorized to delete this request' });
        }

        await db.run('DELETE FROM food_requests WHERE id = ?', req.params.id);
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

export default router;
