import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover',
});

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret?: string;
}

export interface JazzCashPayment {
    transactionId: string;
    amount: number;
    status: string;
    phoneNumber: string;
}

/**
 * Create a Stripe payment intent
 */
export async function createStripePaymentIntent(
    amount: number,
    currency: string = 'pkr',
    metadata?: Record<string, string>
): Promise<PaymentIntent> {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paisa for PKR)
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: metadata || {},
        });

        return {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            clientSecret: paymentIntent.client_secret || undefined,
        };
    } catch (error) {
        console.error('Stripe payment intent creation error:', error);
        throw new Error('Failed to create payment intent');
    }
}

/**
 * Verify Stripe payment
 */
export async function verifyStripePayment(paymentIntentId: string): Promise<boolean> {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    } catch (error) {
        console.error('Stripe payment verification error:', error);
        return false;
    }
}

/**
 * Create a Stripe checkout session (for hosted payment page)
 */
export async function createStripeCheckoutSession(
    amount: number,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
): Promise<{ sessionId: string; url: string }> {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'pkr',
                        product_data: {
                            name: 'EcoBite Donation',
                            description: 'Support food donation logistics',
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: metadata || {},
        });

        return {
            sessionId: session.id,
            url: session.url ?? '',
        };
    } catch (error) {
        console.error('Stripe checkout session creation error:', error);
        throw new Error('Failed to create checkout session');
    }
}

/**
 * JazzCash Payment Integration (Mock implementation)
 * In production, integrate with JazzCash Merchant API
 * https://sandbox.jazzcash.com.pk/
 */
export async function initiateJazzCashPayment(
    amount: number,
    phoneNumber: string,
    description: string
): Promise<JazzCashPayment> {
    try {
        // Mock implementation - Replace with actual JazzCash API integration
        // JazzCash requires:
        // 1. Merchant ID
        // 2. Password
        // 3. Transaction details
        // 4. Secure hash generation

        // For now, return mock successful transaction
        const transactionId = `JC${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        // In production, you would:
        // 1. Generate secure hash
        // 2. Call JazzCash API
        // 3. Redirect user to JazzCash payment page
        // 4. Handle callback/webhook

        console.log('JazzCash Payment Initiated:', {
            amount,
            phoneNumber,
            description,
            transactionId,
        });

        return {
            transactionId,
            amount,
            status: 'pending', // pending, success, failed
            phoneNumber,
        };
    } catch (error) {
        console.error('JazzCash payment error:', error);
        throw new Error('Failed to initiate JazzCash payment');
    }
}

/**
 * Verify JazzCash payment (Mock implementation)
 */
export async function verifyJazzCashPayment(transactionId: string): Promise<boolean> {
    try {
        // Mock implementation - Replace with actual JazzCash verification API
        // In production, verify transaction status with JazzCash API

        console.log('Verifying JazzCash transaction:', transactionId);

        // For development, accept transactions starting with 'JC'
        return transactionId.startsWith('JC');
    } catch (error) {
        console.error('JazzCash verification error:', error);
        return false;
    }
}

/**
 * Process refund (Stripe)
 */
export async function processStripeRefund(
    paymentIntentId: string,
    amount?: number
): Promise<{ id: string; status: string }> {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined,
        });

        return {
            id: refund.id,
            status: refund.status ?? 'pending',
        };
    } catch (error) {
        console.error('Stripe refund error:', error);
        throw new Error('Failed to process refund');
    }
}

/**
 * Get payment methods for a customer
 */
export async function getCustomerPaymentMethods(customerId: string) {
    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });

        return paymentMethods.data;
    } catch (error) {
        console.error('Get payment methods error:', error);
        return [];
    }
}

/**
 * Create or retrieve Stripe customer
 */
export async function createOrGetStripeCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
): Promise<string> {
    try {
        // Check if customer exists
        const customers = await stripe.customers.list({
            email,
            limit: 1,
        });

        if (customers.data.length > 0) {
            return customers.data[0].id;
        }

        // Create new customer
        const customer = await stripe.customers.create({
            email,
            name,
            metadata: metadata || {},
        });

        return customer.id;
    } catch (error) {
        console.error('Create/get customer error:', error);
        throw new Error('Failed to create customer');
    }
}

export default {
    createStripePaymentIntent,
    verifyStripePayment,
    createStripeCheckoutSession,
    initiateJazzCashPayment,
    verifyJazzCashPayment,
    processStripeRefund,
    getCustomerPaymentMethods,
    createOrGetStripeCustomer,
};
