import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin configuration
let firebaseApp: admin.app.App | null = null;

try {
    // Initialize Firebase Admin with service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID
        });

        console.log('✅ Push notification service ready (Firebase)');
    } else {
        console.log('⚠️  Push notifications not configured. Add Firebase credentials to .env');
    }
} catch (error) {
    console.log('⚠️  Push notifications not configured:', error);
}

/**
 * Send push notification to a single device
 */
export async function sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: any
): Promise<boolean> {
    try {
        if (!firebaseApp) {
            console.log('📱 Push notification would be sent:');
            console.log('Title:', title);
            console.log('Body:', body);
            console.log('Data:', data);
            return false;
        }

        const message = {
            notification: {
                title,
                body
            },
            data: data || {},
            token: deviceToken
        };

        const response = await admin.messaging().send(message);
        console.log('✅ Push notification sent:', response);
        return true;
    } catch (error) {
        console.error('❌ Push notification failed:', error);
        return false;
    }
}

/**
 * Send push notification to multiple devices
 */
export async function sendPushNotificationToMultiple(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: any
): Promise<{ success: number; failed: number }> {
    try {
        if (!firebaseApp) {
            console.log('📱 Push notifications would be sent to', deviceTokens.length, 'devices');
            return { success: 0, failed: deviceTokens.length };
        }

        const message = {
            notification: {
                title,
                body
            },
            data: data || {},
            tokens: deviceTokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log('✅ Push notifications sent:', response.successCount, 'success,', response.failureCount, 'failed');

        return {
            success: response.successCount,
            failed: response.failureCount
        };
    } catch (error) {
        console.error('❌ Push notifications failed:', error);
        return { success: 0, failed: deviceTokens.length };
    }
}

/**
 * Send push notification to a topic (all subscribed users)
 */
export async function sendPushNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: any
): Promise<boolean> {
    try {
        if (!firebaseApp) {
            console.log('📱 Push notification would be sent to topic:', topic);
            return false;
        }

        const message = {
            notification: {
                title,
                body
            },
            data: data || {},
            topic
        };

        const response = await admin.messaging().send(message);
        console.log('✅ Push notification sent to topic:', response);
        return true;
    } catch (error) {
        console.error('❌ Push notification to topic failed:', error);
        return false;
    }
}

/**
 * Subscribe device to topic
 */
export async function subscribeToTopic(
    deviceTokens: string[],
    topic: string
): Promise<boolean> {
    try {
        if (!firebaseApp) {
            console.log('📱 Would subscribe to topic:', topic);
            return false;
        }

        const response = await admin.messaging().subscribeToTopic(deviceTokens, topic);
        console.log('✅ Subscribed to topic:', response);
        return true;
    } catch (error) {
        console.error('❌ Subscribe to topic failed:', error);
        return false;
    }
}

/**
 * Unsubscribe device from topic
 */
export async function unsubscribeFromTopic(
    deviceTokens: string[],
    topic: string
): Promise<boolean> {
    try {
        if (!firebaseApp) {
            console.log('📱 Would unsubscribe from topic:', topic);
            return false;
        }

        const response = await admin.messaging().unsubscribeFromTopic(deviceTokens, topic);
        console.log('✅ Unsubscribed from topic:', response);
        return true;
    } catch (error) {
        console.error('❌ Unsubscribe from topic failed:', error);
        return false;
    }
}

// Predefined notification templates
export const NotificationTemplates = {
    welcome: (name: string) => ({
        title: 'Welcome to EcoBite! 🌱',
        body: `Hi ${name}! Start making an impact by donating food today.`
    }),

    paymentVerified: (amount: number) => ({
        title: 'Payment Verified ✅',
        body: `Your payment of PKR ${amount.toLocaleString()} has been verified. Thank you!`
    }),

    paymentRejected: (reason: string) => ({
        title: 'Payment Not Verified ❌',
        body: `Your payment was rejected: ${reason}`
    }),

    moneyRequestApproved: (amount: number) => ({
        title: 'Funding Approved! 🎉',
        body: `Your request for PKR ${amount.toLocaleString()} has been approved!`
    }),

    moneyRequestRejected: (reason: string) => ({
        title: 'Request Rejected ❌',
        body: `Your funding request was rejected: ${reason}`
    }),

    donationClaimed: (foodType: string, claimerName: string) => ({
        title: 'Donation Claimed! 📦',
        body: `Your "${foodType}" has been claimed by ${claimerName}`
    }),

    donationAvailable: (foodType: string, location: string) => ({
        title: 'New Donation Available! 🍽️',
        body: `${foodType} available at ${location}. Claim it now!`
    }),

    ecoPointsEarned: (points: number) => ({
        title: 'EcoPoints Earned! ⭐',
        body: `You earned ${points} EcoPoints! Keep up the great work.`
    }),

    voucherRedeemed: (voucherTitle: string) => ({
        title: 'Voucher Redeemed! 🎁',
        body: `You successfully redeemed: ${voucherTitle}`
    })
};

export default {
    sendPushNotification,
    sendPushNotificationToMultiple,
    sendPushNotificationToTopic,
    subscribeToTopic,
    unsubscribeFromTopic,
    NotificationTemplates
};
