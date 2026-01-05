import Stripe from 'stripe';
import { logActivity, AuditAction } from './audit.js';

// Initialize Stripe with a secret key (from env)
// You must add STRIPE_SECRET_KEY to your .env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
    typescript: true,
});

export const processDonation = async (
    amount: number, // Amount in cents/lowest unit (e.g. PKR 100 = 10000)
    currency: string,
    sourceParams: { tokenId?: string; paymentMethodId?: string },
    userId: string,
    userEmail: string,
    userName: string
) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('⚠️ STRIPE_SECRET_KEY missing. Simulating payment.');
            // Simulate success for demo
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Log the "Mock" payment
            await logActivity(
                userId, userEmail, userName,
                AuditAction.DONATE_MONEY,
                'PAYMENT', 'mock_tx_id',
                `Mock Donation of ${amount / 100} ${currency.toUpperCase()}`
            );

            return { success: true, id: 'mock_tx_' + Date.now(), status: 'succeeded' };
        }

        // Create a PaymentIntent (modern Stripe flow)
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: sourceParams.paymentMethodId,
            confirm: true, // Confirm immediately
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' // simplified for this demo
            },
            metadata: {
                userId,
                email: userEmail
            }
        });

        // Log the successful real payment
        if (paymentIntent.status === 'succeeded') {
            await logActivity(
                userId, userEmail, userName,
                AuditAction.DONATE_MONEY,
                'PAYMENT', paymentIntent.id,
                `Real Donation of ${amount / 100} ${currency.toUpperCase()} via Stripe`
            );
        }

        return { success: true, id: paymentIntent.id, status: paymentIntent.status };

    } catch (error: any) {
        console.error('Stripe Payment Error:', error);

        await logActivity(
            userId, userEmail, userName,
            'PAYMENT_FAILED',
            'PAYMENT', 'failed',
            `Failed donation attempt: ${error.message}`
        );

        return { success: false, error: error.message };
    }
};
