import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db.js';

export enum AuditAction {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    REGISTER = 'REGISTER',
    DONATE_FOOD = 'DONATE_FOOD',
    DONATE_MONEY = 'DONATE_MONEY',
    REQUEST_FOOD = 'REQUEST_FOOD',
    REQUEST_FUNDS = 'REQUEST_FUNDS',
    CLAIM_DONATION = 'CLAIM_DONATION',
    ADMIN_UPDATE = 'ADMIN_UPDATE',
    VERIFY_USER = 'VERIFY_USER'
}

export async function logActivity(
    userId: string,
    userEmail: string,
    userName: string,
    action: AuditAction | string,
    entityType: string,
    entityId: string,
    details: string,
    ipAddress?: string
) {
    try {
        const db = getDB();
        if (!db) return;

        const id = uuidv4();
        // Check if using standard SQL (Azure) or Mock
        // Our getDB abstraction handles run() so it should work for both.

        await db.run(
            `INSERT INTO activity_logs (id, userId, userEmail, userName, action, entityType, entityId, details, ipAddress)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, userEmail, userName, action, entityType, entityId, details, ipAddress || '']
        );

        console.log(`📝 Audit Log: [${action}] by ${userEmail} -> ${details}`);

    } catch (error) {
        console.error('Failed to log activity:', error);
        // Do not throw, as audit failure shouldn't block main action
    }
}
