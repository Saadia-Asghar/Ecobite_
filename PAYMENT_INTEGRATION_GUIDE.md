# Payment Integration Guide - EcoBite

## Overview
EcoBite now supports multiple payment methods for money donations:
- **Stripe** - International credit/debit cards
- **JazzCash** - Pakistan mobile wallet (mock implementation)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install stripe
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Update the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# JazzCash Configuration (Optional)
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
```

### 3. Get Stripe API Keys

1. Create account at [https://stripe.com](https://stripe.com)
2. Go to [Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Copy your **Publishable key** (starts with `pk_test_`)

### 4. Test Mode vs Live Mode

**Test Mode** (Development):
- Use test API keys (sk_test_... and pk_test_...)
- Use test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Requires 3D Secure: `4000 0027 6000 3184`

**Live Mode** (Production):
- Use live API keys (sk_live_... and pk_live_...)
- Real transactions will be processed
- Stripe charges 2.9% + PKR 15 per transaction

## API Endpoints

### 1. Create Payment Intent
**POST** `/api/payment/create-intent`

Creates a Stripe payment intent for processing payment.

**Request:**
```json
{
  "userId": "user-123",
  "amount": 1000,
  "donationType": "money_donation"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "customerId": "cus_xxx"
}
```

### 2. Verify Payment
**POST** `/api/payment/verify`

Verifies payment and creates donation record.

**Request:**
```json
{
  "paymentIntentId": "pi_xxx",
  "userId": "user-123",
  "amount": 1000,
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "donation": {...},
  "ecoPointsEarned": 100,
  "message": "Payment verified! You earned 100 EcoPoints."
}
```

### 3. Create Checkout Session
**POST** `/api/payment/create-checkout`

Creates a Stripe hosted checkout page.

**Request:**
```json
{
  "userId": "user-123",
  "amount": 1000,
  "successUrl": "http://localhost:5173/payment/success",
  "cancelUrl": "http://localhost:5173/payment/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

### 4. JazzCash Payment (Mock)
**POST** `/api/payment/jazzcash/initiate`

Initiates JazzCash mobile wallet payment.

**Request:**
```json
{
  "userId": "user-123",
  "amount": 1000,
  "phoneNumber": "03001234567"
}
```

**Response:**
```json
{
  "transactionId": "JC1234567890",
  "status": "pending",
  "message": "JazzCash payment initiated..."
}
```

### 5. Get Payment Methods
**GET** `/api/payment/methods`

Returns available payment methods.

**Response:**
```json
{
  "methods": [
    {
      "id": "stripe",
      "name": "Credit/Debit Card",
      "description": "Pay with Visa, Mastercard, or other cards",
      "enabled": true,
      "icon": "💳"
    },
    {
      "id": "jazzcash",
      "name": "JazzCash",
      "description": "Pay with JazzCash mobile wallet",
      "enabled": true,
      "icon": "📱",
      "requiresPhone": true
    }
  ]
}
```

### 6. Get Payment History
**GET** `/api/payment/history/:userId`

Returns user's payment history.

**Response:**
```json
[
  {
    "id": "donation-123",
    "donorId": "user-123",
    "amount": 1000,
    "paymentMethod": "stripe",
    "transactionId": "pi_xxx",
    "status": "completed",
    "createdAt": "2024-12-09T10:00:00Z"
  }
]
```

## Frontend Integration

### Option 1: Payment Intent (Recommended)

```typescript
// 1. Create payment intent
const response = await fetch('/api/payment/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    amount: 1000,
    donationType: 'money_donation'
  })
});

const { clientSecret, paymentIntentId } = await response.json();

// 2. Confirm payment with Stripe.js
const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: user.name,
      email: user.email
    }
  }
});

// 3. Verify payment
if (!error) {
  await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId,
      userId: user.id,
      amount: 1000,
      paymentMethod: 'stripe'
    })
  });
}
```

### Option 2: Checkout Session (Simpler)

```typescript
// Create checkout session
const response = await fetch('/api/payment/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    amount: 1000,
    successUrl: window.location.origin + '/payment/success',
    cancelUrl: window.location.origin + '/payment/cancel'
  })
});

const { url } = await response.json();

// Redirect to Stripe checkout
window.location.href = url;
```

## EcoPoints Rewards

Users earn EcoPoints for donations:
- **10 EcoPoints** per PKR 100 donated
- Example: PKR 1000 donation = 100 EcoPoints

## Security Features

1. ✅ **Payment Intent Verification** - All payments verified before recording
2. ✅ **Role-Based Access** - Only individuals can donate money
3. ✅ **Amount Validation** - Minimum and maximum limits enforced
4. ✅ **Idempotency** - Duplicate payment prevention
5. ✅ **Secure Keys** - API keys stored in environment variables
6. ✅ **HTTPS Required** - Production must use HTTPS

## Testing

### Test Card Numbers (Stripe)

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Insufficient funds |

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

### Test Flow

1. Login as individual user
2. Navigate to Finance tab
3. Click "Donate Money"
4. Enter amount (e.g., PKR 1000)
5. Use test card: 4242 4242 4242 4242
6. Verify success message
7. Check EcoPoints increase

## JazzCash Integration (Production)

For production JazzCash integration:

1. Register at [JazzCash Merchant Portal](https://sandbox.jazzcash.com.pk/)
2. Get credentials:
   - Merchant ID
   - Password
   - Integrity Salt
3. Implement hash generation:
```typescript
import crypto from 'crypto';

function generateJazzCashHash(data: any, integritySalt: string): string {
  const sortedKeys = Object.keys(data).sort();
  const hashString = sortedKeys.map(key => data[key]).join('&') + '&' + integritySalt;
  return crypto.createHash('sha256').update(hashString).digest('hex');
}
```
4. Update `server/services/payment.ts` with real API calls
5. Handle webhooks/callbacks

## Webhooks

### Stripe Webhooks

1. Set up webhook endpoint: `/api/payment/stripe/webhook`
2. Configure in Stripe Dashboard
3. Handle events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

```typescript
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }

  res.json({ received: true });
});
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API key | Wrong Stripe key | Check .env file |
| Amount too small | Amount < PKR 50 | Increase amount |
| Card declined | Test card or real decline | Use different card |
| Network error | Backend not running | Start server |

## Production Checklist

- [ ] Use live Stripe API keys
- [ ] Enable HTTPS
- [ ] Set up webhook endpoints
- [ ] Configure proper CORS
- [ ] Add rate limiting
- [ ] Implement logging
- [ ] Set up error monitoring (Sentry)
- [ ] Test with real cards (small amounts)
- [ ] Configure refund policy
- [ ] Add terms and conditions
- [ ] Implement receipt emails

## Support

For issues:
1. Check server logs
2. Verify environment variables
3. Test with Stripe test cards
4. Check Stripe Dashboard for payment status

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [JazzCash API Docs](https://sandbox.jazzcash.com.pk/documentation)
- [Payment Card Industry (PCI) Compliance](https://stripe.com/docs/security/guide)

---

**Last Updated:** December 9, 2024  
**Status:** ✅ IMPLEMENTED
