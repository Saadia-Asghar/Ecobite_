import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

// Initialize Twilio client
let twilioClient: any = null;

if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ SMS service ready (Twilio)');
} else {
    console.log('⚠️  SMS service not configured. Add Twilio credentials to .env');
}

/**
 * Send SMS notification
 */
export async function sendSMS(
    to: string,
    message: string
): Promise<boolean> {
    try {
        // If Twilio not configured, log and return false
        if (!twilioClient) {
            console.log('📱 SMS would be sent to:', to);
            console.log('Message:', message);
            return false;
        }

        // Ensure phone number has country code
        const formattedPhone = to.startsWith('+') ? to : `+92${to.replace(/^0/, '')}`;

        const result = await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: formattedPhone
        });

        console.log('✅ SMS sent successfully:', result.sid);
        return true;
    } catch (error) {
        console.error('❌ SMS sending failed:', error);
        return false;
    }
}

/**
 * Send welcome SMS
 */
export async function sendWelcomeSMS(
    phoneNumber: string,
    name: string
): Promise<boolean> {
    const message = `Welcome to EcoBite, ${name}! 🌱 Start donating food and making an impact. Download our app: ecobite.app`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send payment verification SMS
 */
export async function sendPaymentVerifiedSMS(
    phoneNumber: string,
    amount: number
): Promise<boolean> {
    const message = `✅ Your payment of PKR ${amount.toLocaleString()} has been verified! Thank you for supporting EcoBite. 🌱`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send payment rejection SMS
 */
export async function sendPaymentRejectedSMS(
    phoneNumber: string,
    reason: string
): Promise<boolean> {
    const message = `❌ Your payment was not verified. Reason: ${reason}. Please contact support@ecobite.com`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send money request approved SMS
 */
export async function sendMoneyRequestApprovedSMS(
    phoneNumber: string,
    amount: number
): Promise<boolean> {
    const message = `✅ Your funding request of PKR ${amount.toLocaleString()} has been approved! Funds will be transferred to your bank account. 🎉`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send money request rejected SMS
 */
export async function sendMoneyRequestRejectedSMS(
    phoneNumber: string,
    reason: string
): Promise<boolean> {
    const message = `❌ Your funding request was rejected. Reason: ${reason}. Contact us for more info.`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send donation claimed SMS
 */
export async function sendDonationClaimedSMS(
    phoneNumber: string,
    foodType: string,
    claimerName: string
): Promise<boolean> {
    const message = `📦 Your donation "${foodType}" has been claimed by ${claimerName}. Thank you for reducing food waste! 🌱`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send donation available SMS (to NGOs/Shelters)
 */
export async function sendDonationAvailableSMS(
    phoneNumber: string,
    foodType: string,
    location: string
): Promise<boolean> {
    const message = `🍽️ New donation available: ${foodType} at ${location}. Claim it now on EcoBite!`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send OTP for verification
 */
export async function sendOTP(
    phoneNumber: string,
    otp: string
): Promise<boolean> {
    const message = `Your EcoBite verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    return await sendSMS(phoneNumber, message);
}

/**
 * Send bulk SMS (for announcements)
 */
export async function sendBulkSMS(
    phoneNumbers: string[],
    message: string
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const phone of phoneNumbers) {
        const result = await sendSMS(phone, message);
        if (result) success++;
        else failed++;

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { success, failed };
}

export default {
    sendSMS,
    sendWelcomeSMS,
    sendPaymentVerifiedSMS,
    sendPaymentRejectedSMS,
    sendMoneyRequestApprovedSMS,
    sendMoneyRequestRejectedSMS,
    sendDonationClaimedSMS,
    sendDonationAvailableSMS,
    sendOTP,
    sendBulkSMS
};
