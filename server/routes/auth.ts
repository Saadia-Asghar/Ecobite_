import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db';
import { validateUser } from '../middleware/validation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecobite-secret-key-change-in-production';

// Register
router.post('/register', validateUser, async (req, res) => {
    const { email, password, name, role, organization, licenseId, location } = req.body;

    try {
        const db = getDB();

        // Check if user exists
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();

        // Insert user
        await db.run(
            `INSERT INTO users (id, email, password, name, type, organization, licenseId, location, ecoPoints) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, email, hashedPassword, name, role, organization || null, licenseId || null, location || null, 0]
        );

        // Generate token
        const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id, email, name, role, organization, location, ecoPoints: 0 }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        const db = getDB();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.type },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.type,
                organization: user.organization,
                location: user.location,
                ecoPoints: user.ecoPoints
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const db = getDB();
        const user = await db.get('SELECT id, email, name, type, organization, location, ecoPoints FROM users WHERE id = ?', decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.type,
                organization: user.organization,
                location: user.location,
                ecoPoints: user.ecoPoints
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update user (Admin only)
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, organization, ecoPoints } = req.body;

    try {
        const db = getDB();

        // Update user
        await db.run(
            `UPDATE users SET name = ?, type = ?, organization = ?, ecoPoints = ? WHERE id = ?`,
            [name, type, organization || null, ecoPoints || 0, id]
        );

        // Get updated user
        const user = await db.get('SELECT id, email, name, type, organization, ecoPoints FROM users WHERE id = ?', id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (Admin only)
router.delete('/users/:id', async (req, res) => {
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

export default router;
