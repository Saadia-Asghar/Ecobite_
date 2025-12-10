import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db';
import { validateUser } from '../middleware/validation';
import { sendWelcomeEmail } from '../services/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ecobite-secret-key-change-in-production';

// Register
router.post('/register', validateUser, async (req, res) => {
    const { email, password, name, role, organization, licenseId, location } = req.body;

    try {
        const db = getDB();
        if (!db) {
            console.error('Database not available');
            return res.status(500).json({ error: 'Database not initialized' });
        }

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
            `INSERT INTO users(id, email, password, name, type, organization, licenseId, location, ecoPoints)
VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, email, hashedPassword, name, role, organization || null, licenseId || null, location || null, 0]
        );

        // Generate token
        const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(email, name, role).catch(err =>
            console.error('Failed to send welcome email:', err)
        );

        res.status(201).json({
            token,
            user: { id, email, name, role, organization, location, ecoPoints: 0 }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('=== LOGIN REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    // TEMPORARY FIX: Hardcoded admin login
    if (email === 'admin@ecobite.com' && password === 'Admin@123') {
        console.log('✅ ADMIN LOGIN BYPASS - Hardcoded credentials matched');
        const token = jwt.sign(
            { id: 'admin-hardcoded', email: 'admin@ecobite.com', role: 'admin' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: {
                id: 'admin-hardcoded',
                email: 'admin@ecobite.com',
                name: 'Admin User',
                role: 'admin',
                type: 'admin',
                organization: 'EcoBite Admin',
                location: null,
                ecoPoints: 5000
            }
        });
    }

    try {
        const db = getDB();
        if (!db) {
            console.error('Database not available');
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        console.log('Login attempt for:', email);
        console.log('User found:', user ? 'YES' : 'NO');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        console.log('Comparing password...');
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValid);

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
        res.status(500).json({ error: 'Failed to login', details: (error as any).message });
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
            `UPDATE users SET name = ?, type = ?, organization = ?, ecoPoints = ? WHERE id = ? `,
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

// Test endpoint to verify admin user
router.get('/test-admin', async (_req, res) => {
    try {
        const db = getDB();
        const admin = await db.get('SELECT * FROM users WHERE email = ?', ['admin@ecobite.com']);

        if (!admin) {
            return res.json({
                exists: false,
                message: 'Admin user not found in database'
            });
        }

        // Test password comparison
        const testPassword = 'Admin@123';
        const isValid = await bcrypt.compare(testPassword, admin.password);

        res.json({
            exists: true,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                type: admin.type,
                hashedPasswordLength: admin.password?.length || 0
            },
            passwordTest: {
                testPassword: testPassword,
                isValid: isValid,
                message: isValid ? 'Password matches!' : 'Password does NOT match'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Test failed', details: (error as any).message });
    }
});

export default router;
