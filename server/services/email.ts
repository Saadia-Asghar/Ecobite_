import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
    }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter.verify((error: any) => {
    if (error) {
        console.log('❌ Email service error:', error);
        console.log('⚠️  Email notifications will not work. Please configure SMTP_USER and SMTP_PASSWORD in .env');
    } else {
        console.log('✅ Email service ready');
    }
});

import { getDB } from '../db.js';

/**
 * Send email
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
): Promise<boolean> {
    try {
        // If email not configured, log and return false
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.log('📧 Email would be sent to:', to);
            console.log('Subject:', subject);
            return false;
        }

        // CHECK USER PREFERENCES
        // We do this inside sendEmail to centralize logic
        try {
            const db = getDB();
            // We use a raw query or similar based on DB wrapper availability
            // Since getDB might throw if not init, catch that.
            if (db) {
                const user = await db.get('SELECT emailNotifications FROM users WHERE email = ?', to);

                if (user && user.emailNotifications === 0) {
                    // User has laid disabled notifications.
                    // HOWEVER, we must still send critical transactional emails.
                    const lowerSubject = subject.toLowerCase();
                    const isCritical =
                        lowerSubject.includes('password') ||
                        lowerSubject.includes('reset') ||
                        lowerSubject.includes('verify') ||
                        lowerSubject.includes('verification') ||
                        lowerSubject.includes('welcome') || // Onboarding usually important
                        lowerSubject.includes('approved') || // Money/Food status important
                        lowerSubject.includes('rejected');

                    if (!isCritical) {
                        console.log(`🔕 Email suppressed for ${to} due to user preferences (Subject: ${subject})`);
                        return false;
                    }
                }
            }
        } catch (dbErr) {
            // DB might not be ready or other issue, proceed with sending to be safe for criticals, 
            // or just ignore preference check if DB fails.
            // console.warn('Skipping preference check due to DB error', dbErr);
        }

        const mailOptions = {
            from: `"EcoBite" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent to:', to);
        return true;
    } catch (error) {
        console.error('❌ Email send error:', error);
        return false;
    }
}

// Determine base URL
// Priority:
// 1. FRONTEND_URL (Explicitly set in environment)
// 2. Hardcoded Production URL (ecobite-iota.vercel.app) - matches project name
// 3. VERCEL_URL (Automatic Vercel deployment URL)
// 4. Localhost (Development)
const baseUrl = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, '')
    : 'https://ecobite-iota.vercel.app';
// Fallback to simpler logic to avoid confusion with dynamic VERCEL_URLs
// that might point to specific deployment Hashes.

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
    email: string,
    name: string,
    userType: string
): Promise<boolean> {
    const subject = 'Welcome to EcoBite! 🌱';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍽️ Welcome to EcoBite!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}! 👋</h2>
                    <p>Thank you for joining EcoBite as a <strong>${userType}</strong>!</p>
                    
                    <p>You're now part of a community fighting food waste and hunger in Pakistan. Together, we can make a real difference!</p>
                    
                    <h3>What you can do:</h3>
                    <ul>
                        ${userType === 'individual' ? `
                            <li>🍽️ Donate surplus food</li>
                            <li>💰 Support logistics with money donations</li>
                            <li>⭐ Earn EcoPoints and redeem rewards</li>
                        ` : userType === 'restaurant' ? `
                            <li>🍽️ Donate surplus food from your restaurant</li>
                            <li>📊 Track your impact with analytics</li>
                            <li>⭐ Build your reputation as a sustainable business</li>
                        ` : `
                            <li>🍽️ Request food for your beneficiaries</li>
                            <li>💰 Request logistics funding</li>
                            <li>🏦 Manage your bank account for transfers</li>
                        `}
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${baseUrl}" class="button">
                            Get Started Now
                        </a>
                    </div>
                    
                    <p><strong>Need help?</strong> Contact us at support@ecobite.com</p>
                </div>
                <div class="footer">
                    <p>EcoBite - Fighting Food Waste, Feeding Hope 🌱</p>
                    <p>© 2024 EcoBite. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
): Promise<boolean> {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your EcoBite Password 🔐';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>We received a request to reset your EcoBite password.</p>
                    
                    <p>Click the button below to reset your password:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">
                            Reset Password
                        </a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${resetUrl}
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong>
                        <ul>
                            <li>This link expires in 1 hour</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Your password won't change until you create a new one</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions, contact us at support@ecobite.com</p>
                </div>
                <div class="footer">
                    <p>EcoBite - Fighting Food Waste, Feeding Hope 🌱</p>
                    <p>© 2024 EcoBite. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

/**
 * Send payment verification email
 */
export async function sendPaymentVerificationEmail(
    email: string,
    name: string,
    amount: number,
    ecoPoints: number
): Promise<boolean> {
    const subject = '✅ Payment Verified - EcoBite';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
                .amount { font-size: 36px; font-weight: bold; color: #10b981; }
                .points { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Payment Verified!</h1>
                </div>
                <div class="content">
                    <h2>Great news, ${name}!</h2>
                    <p>Your donation has been verified and approved.</p>
                    
                    <div class="success-box">
                        <p style="margin: 0; font-size: 18px;">Donation Amount</p>
                        <div class="amount">PKR ${amount.toLocaleString()}</div>
                        <p style="margin: 10px 0 0 0; color: #059669;">✓ Successfully Verified</p>
                    </div>
                    
                    <div class="points">
                        <h3 style="margin: 0;">🎉 You Earned EcoPoints!</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #f59e0b; margin: 10px 0;">
                            +${ecoPoints} Points
                        </p>
                        <p style="margin: 0; font-size: 14px;">Redeem for vouchers and rewards!</p>
                    </div>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>Your donation is now part of our central fund</li>
                        <li>It will help transport food to those in need</li>
                        <li>You can track the impact in your dashboard</li>
                    </ul>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <strong>Thank you for making a difference! 💚</strong>
                    </p>
                </div>
                <div class="footer">
                    <p>EcoBite - Fighting Food Waste, Feeding Hope 🌱</p>
                    <p>© 2024 EcoBite. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

/**
 * Send payment rejection email
 */
export async function sendPaymentRejectionEmail(
    email: string,
    name: string,
    amount: number,
    reason: string
): Promise<boolean> {
    const subject = '❌ Payment Verification Failed - EcoBite';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .error-box { background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Payment Verification Failed</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Unfortunately, we couldn't verify your donation of <strong>PKR ${amount.toLocaleString()}</strong>.</p>
                    
                    <div class="error-box">
                        <h3 style="margin-top: 0;">Reason:</h3>
                        <p style="font-size: 16px; margin: 0;">${reason}</p>
                    </div>
                    
                    <p><strong>What you can do:</strong></p>
                    <ul>
                        <li>Check your payment details and transaction ID</li>
                        <li>Verify the payment was sent to the correct account</li>
                        <li>Try submitting again with correct information</li>
                        <li>Contact support if you need help</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/finance" class="button">
                            Try Again
                        </a>
                    </div>
                    
                    <p>If you believe this is an error, please contact us at support@ecobite.com</p>
                </div>
                <div class="footer">
                    <p>EcoBite - Fighting Food Waste, Feeding Hope 🌱</p>
                    <p>© 2024 EcoBite. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

/**
 * Send money request approved email
 */
export async function sendMoneyRequestApprovedEmail(
    email: string,
    name: string,
    amount: number
): Promise<boolean> {
    const subject = '✅ Money Request Approved - EcoBite';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Request Approved!</h1>
                </div>
                <div class="content">
                    <h2>Great news, ${name}!</h2>
                    <p>Your money request has been approved by the admin.</p>
                    
                    <div class="success-box">
                        <p style="margin: 0; font-size: 18px;">Approved Amount</p>
                        <div style="font-size: 36px; font-weight: bold; color: #10b981;">
                            PKR ${amount.toLocaleString()}
                        </div>
                    </div>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>✅ Your request has been approved!</li>
                        <li>💰 Admin will transfer PKR ${amount.toLocaleString()} to your bank account</li>
                        <li>🏦 Transfer will be made to your registered bank account</li>
                        <li>📱 You'll receive the money within a few hours</li>
                        <li>🚚 Use the funds for logistics as requested</li>
                    </ul>
                    
                    <p>Thank you for being part of EcoBite! 💚</p>
                </div>
                <div class="footer">
                    <p>EcoBite - Fighting Food Waste, Feeding Hope 🌱</p>
                    <p>© 2024 EcoBite. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

/**
 * Send monthly stats email
 */
export async function sendMonthlyStatsEmail(
    email: string,
    name: string,
    stats: {
        donations: number;
        co2Saved: number;
        peopleFed: number;
        ecoPointsEarned: number;
        monthName: string;
    }
): Promise<boolean> {
    const subject = `Your ${stats.monthName} Impact Report! 🌍`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .highlight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .stat-box { background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .stat-value { font-size: 24px; font-weight: bold; color: #7c3aed; }
                .stat-label { font-size: 12px; color: #666; text-transform: uppercase; margin-top: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌟 Your Monthly Impact</h1>
                    <p style="margin: 0; opacity: 0.9;">${stats.monthName} Report</p>
                </div>
                <div class="content">
                    <h2>Way to go, ${name}!</h2>
                    <p>Here is the incredible positive impact you made this month. Your contributions are helping us build a hunger-free Pakistan!</p>
                    
                    <div class="highlight-grid">
                        <div class="stat-box">
                            <div class="stat-value">${stats.donations}</div>
                            <div class="stat-label">Donations Made</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.peopleFed}</div>
                            <div class="stat-label">People Fed</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.co2Saved} kg</div>
                            <div class="stat-label">CO2 Prevented</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">+${stats.ecoPointsEarned}</div>
                            <div class="stat-label">EcoPoints Earned</div>
                        </div>
                    </div>
                    
                    <p>You are a true Eco-Hero! Keep up the amazing work.</p>
                    
                    <div style="text-align: center;">
                        <a href="${baseUrl}/mobile" class="button">
                            View Detailed Stats
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>EcoBite - Fighting Food Waste, Feeding Hope 🌱</p>
                    <p>© 2024 EcoBite. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

export default {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPaymentVerificationEmail,
    sendPaymentRejectionEmail,
    sendMoneyRequestApprovedEmail,
    sendMonthlyStatsEmail
};
