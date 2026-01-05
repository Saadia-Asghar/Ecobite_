import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Validate JWT_SECRET on module load
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
    }
    console.warn('⚠️  WARNING: JWT_SECRET not set. Using default (INSECURE - development only)');
}

export const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET is required in production');
        }
        return 'ecobite-secret-key-change-in-production';
    }
    return secret;
};

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as any;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error: any) {
        console.error('JWT Verification Error:', error.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, getJwtSecret()) as any;
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            // Token invalid but continue anyway
        }
    }
    next();
}
