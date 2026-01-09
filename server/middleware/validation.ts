import { Request, Response, NextFunction } from 'express';

export function validateDonation(req: Request, _res: Response, next: NextFunction) {
    const { expiry, quantity } = req.body;

    // Auto-fix common issues for demo robustness
    if (!req.body.status) req.body.status = 'available';
    req.body.status = req.body.status.toLowerCase();



    if (!expiry) {
        // Fallback: 2 days from now
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 2);
        req.body.expiry = fallback.toISOString();
    } else {
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) {
            // Fix invalid date
            const fallback = new Date();
            fallback.setDate(fallback.getDate() + 2);
            req.body.expiry = fallback.toISOString();
        }
    }

    if (!quantity) {
        req.body.quantity = '1 piece'; // Default
    } else if (typeof quantity !== 'string') {
        req.body.quantity = String(quantity);
    }

    // Never block in demo mode, just fix the data
    next();
}

export function validateRequest(req: Request, res: Response, next: NextFunction) {
    const { requesterId, foodType, quantity } = req.body;
    const authRequest = req as any; // AuthRequest type

    const errors: string[] = [];

    // requesterId can come from body or authenticated user from token
    // If not in body and not in token, it's an error
    if (!requesterId && !authRequest.user?.id) {
        errors.push('Valid requesterId is required (must be logged in or provided in request)');
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
