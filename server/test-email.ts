import { sendWelcomeEmail } from './services/email';

// Test email configuration
async function testEmail() {
    console.log('🧪 Testing email configuration...\n');

    // Check environment variables
    console.log('Environment Variables:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ Not set');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ Not set');
    console.log('SMTP_SECURE:', process.env.SMTP_SECURE || '❌ Not set');
    console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not set');
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Set (hidden)' : '❌ Not set');
    console.log('\n');

    // Test sending email
    console.log('📧 Sending test email...\n');

    const testUser = {
        name: 'Test User',
        email: 'test@example.com' // Replace with your email to test
    };

    try {
        const result = await sendWelcomeEmail(testUser.name, testUser.email);

        if (result) {
            console.log('✅ Email sent successfully!');
            console.log('Check your inbox at:', testUser.email);
        } else {
            console.log('⚠️  Email not sent - SMTP not configured');
            console.log('Please add SMTP credentials to your .env file or Vercel environment variables');
        }
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

testEmail();
