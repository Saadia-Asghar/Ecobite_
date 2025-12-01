import { Request, Response, NextFunction } from 'express';

export function validateDonation(req: Request, res: Response, next: NextFunction) {
    const { donorId, status, expiry, quantity } = req.body;

    const errors: string[] = [];

    if (!donorId || typeof donorId !== 'string') {
        errors.push('Valid donorId is required');
    }

    if (!status || !['available', 'claimed', 'completed'].includes(status)) {
        errors.push('Status must be: available, claimed, or completed');
    }

    if (!expiry) {
        errors.push('Expiry date is required');
    } else {
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) {
            errors.push('Invalid expiry date format');
        }
    }

    if (!quantity || typeof quantity !== 'string') {
        errors.push('Quantity is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}

export function validateRequest(req: Request, res: Response, next: NextFunction) {
    const { requesterId, foodType, quantity } = req.body;

    const errors: string[] = [];

    if (!requesterId || typeof requesterId !== 'string') {
        errors.push('Valid requesterId is required');
    }

    if (!foodType || typeof foodType !== 'string') {
        errors.push('Food type is required');
    }

    if (!quantity || typeof quantity !== 'string') {
        errors.push('Quantity is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}

export function validateUser(req: Request, res: Response, next: NextFunction) {
    const { email, password, name, role, organization } = req.body;

    const errors: string[] = [];

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        errors.push('Valid email is required');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    // Accept either name or organization
    const displayName = name || organization;
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
        errors.push('Name or organization is required');
    }

    if (!role || !['individual', 'restaurant', 'ngo', 'shelter', 'fertilizer'].includes(role)) {
        errors.push('Valid role is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
}
