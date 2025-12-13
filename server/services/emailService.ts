import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Email templates
const templates = {
    donationReceived: (donorName: string, amount: number) => ({
        subject: '✅ Thank You for Your Donation!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Thank You, ${donorName}!</h2>
                <p>Your generous donation of <strong>PKR ${amount}</strong> has been received.</p>
                <p>Your contribution will help fund logistics for food donations and make a real difference in fighting food waste.</p>
                <p>You've earned <strong>${Math.floor(amount / 100) * 10} EcoPoints</strong>!</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    Thank you for being part of the EcoBite community! 🍽️💚
                </p>
            </div>
        `,
    }),

    moneyRequestApproved: (requesterName: string, amount: number, purpose: string) => ({
        subject: '✅ Money Request Approved!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Request Approved!</h2>
                <p>Hi ${requesterName},</p>
                <p>Your money request has been approved:</p>
                <ul>
                    <li><strong>Amount:</strong> PKR ${amount}</li>
                    <li><strong>Purpose:</strong> ${purpose}</li>
                </ul>
                <p>The funds will be transferred to your registered bank account shortly.</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    EcoBite - Fighting Food Waste Together 🌱
                </p>
            </div>
        `,
    }),

    moneyRequestRejected: (requesterName: string, amount: number, reason: string) => ({
        subject: '❌ Money Request Update',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Request Not Approved</h2>
                <p>Hi ${requesterName},</p>
                <p>Unfortunately, your money request for <strong>PKR ${amount}</strong> was not approved.</p>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>You can submit a new request or contact support for more information.</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    EcoBite Support Team
                </p>
            </div>
        `,
    }),

    donationClaimed: (donorName: string, foodType: string, claimerName: string) => ({
        subject: '🎉 Your Donation Has Been Claimed!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Great News!</h2>
                <p>Hi ${donorName},</p>
                <p>Your donation of <strong>${foodType}</strong> has been claimed by ${claimerName}.</p>
                <p>Thank you for helping reduce food waste and feeding those in need!</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    Together we're making a difference! 🍽️💚
                </p>
            </div>
        `,
    }),

    welcomeEmail: (userName: string, userType: string) => ({
        subject: '🎉 Welcome to EcoBite!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Welcome to EcoBite, ${userName}!</h2>
                <p>Thank you for joining our mission to fight food waste in Pakistan.</p>
                <p>As a <strong>${userType}</strong>, you can:</p>
                ${userType === 'individual' ? `
                    <ul>
                        <li>Donate food to those in need</li>
                        <li>Contribute money to fund logistics</li>
                        <li>Earn EcoPoints and redeem rewards</li>
                    </ul>
                ` : `
                    <ul>
                        <li>Claim food donations</li>
                        <li>Request logistics funding</li>
                        <li>Track your impact</li>
                    </ul>
                `}
                <p>Get started now and make a difference!</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    EcoBite - Fighting Food Waste Together 🌱
                </p>
            </div>
        `,
    }),
};

// Send email function
export async function sendEmail(to: string, template: keyof typeof templates, ...args: any[]) {
    try {
        // Skip if email not configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️ Email not configured. Skipping email to:', to);
            console.log('   Template:', template);
            return { success: false, message: 'Email not configured' };
        }

        // Type-safe template call
        const templateFn = templates[template] as (...args: any[]) => { subject: string; html: string };
        const { subject, html } = templateFn(...args);

        const info = await transporter.sendMail({
            from: `"EcoBite" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// Bulk email function
export async function sendBulkEmail(recipients: string[], template: keyof typeof templates, ...args: any[]) {
    const results = await Promise.allSettled(
        recipients.map(email => sendEmail(email, template, ...args))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`📧 Bulk email: ${successful} sent, ${failed} failed`);
    return { successful, failed };
}

export default {
    sendEmail,
    sendBulkEmail,
};
