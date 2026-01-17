import { sendEmail } from './email.js';
import { sendSMS } from './sms.js';
import { sendPushNotification, NotificationTemplates } from './push.js';
import { getDB } from '../db.js';

/**
 * Unified notification service
 * Sends notifications via Email, SMS, and Push
 */

export interface NotificationOptions {
    userId: string;
    type: 'welcome' | 'payment_verified' | 'payment_rejected' | 'money_request_approved' | 'money_request_rejected' | 'donation_claimed' | 'donation_available' | 'ecopoints_earned' | 'voucher_redeemed' | 'funding_claimed';
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    data?: any;
}

/**
 * Send notification via all enabled channels
 */
export async function sendNotification(options: NotificationOptions): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
}> {
    const results = {
        email: false,
        sms: false,
        push: false
    };

    try {
        const db = getDB();
        // Get user details
        const user = await db.get('SELECT * FROM users WHERE id = ?', [options.userId]);

        if (!user) {
            console.error('User not found:', options.userId);
            return results;
        }

        // Prepare notification content based on type
        let emailSubject = '';
        let emailBody = '';
        let smsMessage = '';
        let pushNotification: any = null;

        switch (options.type) {
            case 'welcome':
                emailSubject = 'Welcome to EcoBite! 🌱';
                emailBody = `<h1>Welcome ${user.name}!</h1><p>Thank you for joining EcoBite.</p>`;
                smsMessage = `Welcome to EcoBite, ${user.name}! 🌱`;
                pushNotification = NotificationTemplates.welcome(user.name);
                break;

            case 'payment_verified':
                const amount = options.data?.amount || 0;
                emailSubject = 'Payment Verified ✅';
                emailBody = `<h1>Payment Verified!</h1><p>Your payment of PKR ${amount.toLocaleString()} has been verified.</p>`;
                smsMessage = `✅ Your payment of PKR ${amount.toLocaleString()} has been verified!`;
                pushNotification = NotificationTemplates.paymentVerified(amount);
                break;

            case 'payment_rejected':
                const reason = options.data?.reason || 'Unknown reason';
                emailSubject = 'Payment Not Verified ❌';
                emailBody = `<h1>Payment Not Verified</h1><p>Reason: ${reason}</p>`;
                smsMessage = `❌ Your payment was not verified. Reason: ${reason}`;
                pushNotification = NotificationTemplates.paymentRejected(reason);
                break;

            case 'money_request_approved':
                const approvedAmount = options.data?.amount || 0;
                emailSubject = 'Funding Approved! 🎉';
                emailBody = `<h1>Funding Approved!</h1><p>Your request for PKR ${approvedAmount.toLocaleString()} has been approved!</p>`;
                smsMessage = `✅ Your funding request of PKR ${approvedAmount.toLocaleString()} has been approved!`;
                pushNotification = NotificationTemplates.moneyRequestApproved(approvedAmount);
                break;

            case 'money_request_rejected':
                const rejectionReason = options.data?.reason || 'Unknown reason';
                emailSubject = 'Request Rejected ❌';
                emailBody = `<h1>Request Rejected</h1><p>Reason: ${rejectionReason}</p>`;
                smsMessage = `❌ Your funding request was rejected. Reason: ${rejectionReason}`;
                pushNotification = NotificationTemplates.moneyRequestRejected(rejectionReason);
                break;

            case 'donation_claimed':
                const foodType = options.data?.foodType || 'Donation';
                const claimerName = options.data?.claimerName || 'Someone';
                emailSubject = 'Donation Claimed! 📦';
                emailBody = `<h1>Donation Claimed!</h1><p>Your "${foodType}" has been claimed by ${claimerName}.</p>`;
                smsMessage = `📦 Your donation "${foodType}" has been claimed by ${claimerName}!`;
                pushNotification = NotificationTemplates.donationClaimed(foodType, claimerName);
                break;

            case 'donation_available':
                const availableFoodType = options.data?.foodType || 'Food';
                const location = options.data?.location || 'Nearby';
                emailSubject = 'New Donation Available! 🍽️';
                emailBody = `<h1>New Donation Available!</h1><p>${availableFoodType} available at ${location}.</p>`;
                smsMessage = `🍽️ New donation: ${availableFoodType} at ${location}. Claim now!`;
                pushNotification = NotificationTemplates.donationAvailable(availableFoodType, location);
                break;

            case 'ecopoints_earned':
                const points = options.data?.points || 0;
                emailSubject = 'EcoPoints Earned! ⭐';
                emailBody = `<h1>EcoPoints Earned!</h1><p>You earned ${points} EcoPoints!</p>`;
                smsMessage = `⭐ You earned ${points} EcoPoints!`;
                pushNotification = NotificationTemplates.ecoPointsEarned(points);
                break;

            case 'voucher_redeemed':
                const voucherTitle = options.data?.voucherTitle || 'Voucher';
                emailSubject = 'Voucher Redeemed! 🎁';
                emailBody = `<h1>Voucher Redeemed!</h1><p>You redeemed: ${voucherTitle}</p>`;
                smsMessage = `🎁 You redeemed: ${voucherTitle}`;
                pushNotification = NotificationTemplates.voucherRedeemed(voucherTitle);
                break;

            case 'funding_claimed':
                const claimedAmount = options.data?.amount || 0;
                const requesterName = options.data?.requesterName || 'Someone';
                emailSubject = 'Funding Claimed! 💰';
                emailBody = `<h1>Funding Claimed!</h1><p>${requesterName} has claimed funding of PKR ${claimedAmount.toLocaleString()}.</p>`;
                smsMessage = `💰 ${requesterName} has claimed funding of PKR ${claimedAmount.toLocaleString()}.`;
                pushNotification = NotificationTemplates.fundingClaimed(claimedAmount, requesterName);
                break;
        }

        // Send via enabled channels
        if (options.email !== false && user.email) {
            results.email = await sendEmail(user.email, emailSubject, emailBody);
        }

        if (options.sms !== false && user.phone) {
            results.sms = await sendSMS(user.phone, smsMessage);
        }

        if (options.push !== false && user.deviceToken) {
            results.push = await sendPushNotification(
                user.deviceToken,
                pushNotification.title,
                pushNotification.body,
                options.data
            );
        }

        // Log notification in database
        try {
            const notifId = `notif-${Date.now()}`;
            await db.run(
                `INSERT INTO notifications (id, userId, title, message, type)
                 VALUES (?, ?, ?, ?, ?)`,
                [notifId, options.userId, emailSubject || pushNotification?.title || options.type, smsMessage || pushNotification?.body || '', options.type]
            );
        } catch (logError) {
            console.error('Failed to log notification:', logError);
        }

    } catch (error) {
        console.error('Notification error:', error);
    }

    return results;
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotification(
    userIds: string[],
    type: NotificationOptions['type'],
    data?: any
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
        try {
            await sendNotification({ userId, type, data });
            success++;
        } catch (error) {
            failed++;
        }
    }

    return { success, failed };
}

export default {
    sendNotification,
    sendBulkNotification
};
