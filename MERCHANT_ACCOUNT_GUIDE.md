# Understanding Merchant Accounts & Payment Gateway Setup

**Date:** December 10, 2024  
**For:** EcoBite Payment Integration

---

## 💳 What is a Merchant Account?

### Definition
A **merchant account** is a special type of bank account that allows businesses to accept payments from customers through credit cards, debit cards, and digital wallets (like JazzCash, EasyPaisa).

### Simple Explanation
Think of it like this:
- **Regular Bank Account:** You receive money directly from people
- **Merchant Account:** You receive money from payment processors (Stripe, JazzCash) who collect it from customers

### Why You Need It
When a customer pays you:
1. Customer pays PKR 1,000 via JazzCash
2. JazzCash holds the money temporarily
3. JazzCash verifies the transaction
4. JazzCash transfers money to YOUR merchant account
5. You can then transfer to your regular bank account

---

## 🏦 Types of Payment Accounts for EcoBite

### 1. Stripe Account (International Payments)
**What it is:** Online payment processor for credit/debit cards  
**Best for:** International donors, card payments  
**Fees:** ~2.9% + PKR 30 per transaction  
**Settlement:** 2-7 business days

### 2. JazzCash Merchant Account (Pakistan)
**What it is:** Mobile wallet payment processor  
**Best for:** Pakistani users with JazzCash wallets  
**Fees:** ~1.5-2% per transaction  
**Settlement:** 1-2 business days

### 3. EasyPaisa Merchant Account (Pakistan)
**What it is:** Mobile wallet payment processor  
**Best for:** Pakistani users with EasyPaisa wallets  
**Fees:** ~1.5-2% per transaction  
**Settlement:** 1-2 business days

---

## 📝 How to Get a JazzCash Merchant Account

### Step 1: Check Eligibility
**Requirements:**
- ✅ Registered business in Pakistan
- ✅ Valid CNIC (for individuals) or NTN (for companies)
- ✅ Active bank account
- ✅ Business documents
- ✅ Website or app (EcoBite)

### Step 2: Register Online

#### For Testing (Sandbox):
1. Visit: https://sandbox.jazzcash.com.pk/
2. Click "Register as Merchant"
3. Fill registration form:
   - Business name: EcoBite
   - Business type: NGO/Technology
   - Contact details
   - Bank account details
4. Submit documents:
   - CNIC copy
   - Bank statement
   - Business registration (if company)
5. Wait for approval (1-2 days for sandbox)
6. Receive credentials:
   - Merchant ID (e.g., MC12345)
   - Password
   - Integrity Salt (for security)

#### For Production (Real Money):
1. Visit: https://www.jazzcash.com.pk/
2. Click "Merchant Services"
3. Fill detailed application:
   - Complete business information
   - Tax documents (NTN certificate)
   - Bank account verification
   - Business plan
   - Expected transaction volume
4. Submit documents:
   - CNIC/NTN
   - Bank account details
   - Business registration
   - Address proof
   - Website/app details
5. JazzCash team reviews (5-7 business days)
6. Site visit (sometimes required)
7. Account activation
8. Receive production credentials

### Step 3: Configure in EcoBite

Add to `.env` file:
```env
# JazzCash Sandbox (Testing)
JAZZCASH_MERCHANT_ID=MC12345
JAZZCASH_PASSWORD=test_password_123
JAZZCASH_INTEGRITY_SALT=test_salt_456
JAZZCASH_RETURN_URL=http://localhost:5173/payment/jazzcash/return
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform

# JazzCash Production (Real Money)
# JAZZCASH_MERCHANT_ID=MC67890
# JAZZCASH_PASSWORD=prod_password_xyz
# JAZZCASH_INTEGRITY_SALT=prod_salt_abc
# JAZZCASH_RETURN_URL=https://ecobite.com/payment/jazzcash/return
# JAZZCASH_API_URL=https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform
```

### Step 4: Test Payments

**Sandbox Test Credentials:**
```
Phone Number: 03001234567
PIN: 1234
Amount: Any (PKR 10 - 1,000,000)
```

**Test Flow:**
1. User enters amount: PKR 500
2. User enters phone: 03001234567
3. Click "Pay with JazzCash"
4. Redirected to JazzCash page
5. Enter PIN: 1234
6. Confirm payment
7. Redirected back to EcoBite
8. Payment verified ✅
9. Money added to fund
10. EcoPoints awarded

---

## 💰 How to Get a Stripe Account

### Step 1: Sign Up
1. Visit: https://stripe.com/
2. Click "Start now"
3. Enter email and create password
4. Verify email

### Step 2: Complete Business Profile
**Information Needed:**
- Business name: EcoBite
- Business type: Non-profit/Technology
- Country: Pakistan
- Website: https://ecobite.com
- Business description: "Food donation platform"
- Expected volume: PKR 100,000/month

### Step 3: Verify Identity
**Documents Required:**
- CNIC or Passport
- Bank account details
- Business registration (if applicable)
- Tax ID (NTN)

### Step 4: Add Bank Account
- Bank name
- Account number
- IBAN
- Branch code

### Step 5: Get API Keys
1. Go to Dashboard → Developers → API Keys
2. Copy keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)
   - **Webhook Secret** (starts with `whsec_...`)

### Step 6: Configure in EcoBite

Add to `.env` file:
```env
# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_51Abc...xyz
STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...xyz
STRIPE_WEBHOOK_SECRET=whsec_abc123...

# Stripe Production Mode (after approval)
# STRIPE_SECRET_KEY=sk_live_51Abc...xyz
# STRIPE_PUBLISHABLE_KEY=pk_live_51Abc...xyz
# STRIPE_WEBHOOK_SECRET=whsec_live_abc123...
```

### Step 7: Test Payments

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995

Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

---

## 🔐 Security & Compliance

### For JazzCash:
1. ✅ Never share Integrity Salt publicly
2. ✅ Always verify callback hash
3. ✅ Use HTTPS in production
4. ✅ Store credentials in environment variables
5. ✅ Log all transactions
6. ✅ Implement fraud detection

### For Stripe:
1. ✅ Never expose Secret Key
2. ✅ Use Stripe.js for card collection (PCI compliance)
3. ✅ Verify webhook signatures
4. ✅ Use HTTPS
5. ✅ Enable 3D Secure
6. ✅ Monitor for suspicious activity

---

## 💸 Transaction Fees Comparison

### JazzCash
- **Transaction Fee:** 1.5% - 2%
- **Example:** PKR 1,000 donation
  - Fee: PKR 15-20
  - You receive: PKR 980-985
- **Settlement:** 1-2 business days
- **Minimum:** PKR 10
- **Maximum:** PKR 1,000,000 per transaction

### Stripe
- **Transaction Fee:** 2.9% + PKR 30
- **Example:** PKR 1,000 donation
  - Fee: PKR 29 + PKR 30 = PKR 59
  - You receive: PKR 941
- **Settlement:** 2-7 business days
- **Minimum:** PKR 50
- **Maximum:** No limit

### Recommendation for EcoBite:
- **Small donations (< PKR 500):** Use JazzCash (lower fees)
- **Large donations (> PKR 500):** Either works
- **International donors:** Use Stripe
- **Local donors:** Offer both options

---

## 📊 Settlement & Withdrawals

### How Money Flows:

#### JazzCash:
```
Day 1: Customer pays PKR 1,000
Day 1: JazzCash holds in merchant account
Day 2-3: JazzCash transfers to your bank account
Day 3-4: Money available in your bank
```

#### Stripe:
```
Day 1: Customer pays PKR 1,000
Day 1-7: Stripe holds for verification
Day 7-14: Stripe transfers to your bank account
Day 8-15: Money available in your bank
```

### Withdrawal Process:

**JazzCash:**
1. Login to JazzCash Merchant Portal
2. Go to "Settlements"
3. View available balance
4. Click "Withdraw to Bank"
5. Enter amount
6. Confirm
7. Money transferred in 1-2 days

**Stripe:**
1. Login to Stripe Dashboard
2. Go to "Balance"
3. View available balance
4. Automatic payout (or manual)
5. Money transferred to bank

---

## 🧪 Testing Your Integration

### Test Checklist:

#### JazzCash Testing:
- [ ] Initiate payment with test phone
- [ ] Verify form data generation
- [ ] Check hash calculation
- [ ] Submit to sandbox
- [ ] Complete payment with PIN
- [ ] Verify callback received
- [ ] Check hash verification
- [ ] Confirm database recording
- [ ] Verify EcoPoints awarded
- [ ] Check fund balance updated

#### Stripe Testing:
- [ ] Create payment intent
- [ ] Get client secret
- [ ] Confirm with test card
- [ ] Verify payment status
- [ ] Check webhook received
- [ ] Confirm database recording
- [ ] Verify EcoPoints awarded
- [ ] Check fund balance updated

---

## 🚀 Going Live (Production)

### Pre-Launch Checklist:

#### JazzCash:
- [ ] Production merchant account approved
- [ ] Production credentials received
- [ ] Update environment variables
- [ ] Change API URL to production
- [ ] Update return URL to production domain
- [ ] Test with real money (small amount)
- [ ] Verify settlement to bank account
- [ ] Set up monitoring

#### Stripe:
- [ ] Complete business verification
- [ ] Activate live mode
- [ ] Update API keys to live
- [ ] Configure webhooks for production
- [ ] Enable 3D Secure
- [ ] Set up email notifications
- [ ] Test with real card (small amount)
- [ ] Verify payout to bank account

---

## 📞 Support & Resources

### JazzCash:
- **Website:** https://www.jazzcash.com.pk/
- **Merchant Support:** merchant.support@jazzcash.com.pk
- **Phone:** 111-124-444
- **Documentation:** https://sandbox.jazzcash.com.pk/documentation

### Stripe:
- **Website:** https://stripe.com/
- **Support:** https://support.stripe.com/
- **Documentation:** https://stripe.com/docs
- **Dashboard:** https://dashboard.stripe.com/

---

## ❓ Common Questions

### Q: Do I need a company to get a merchant account?
**A:** For JazzCash, individuals can register with CNIC. For Stripe, you can register as a sole proprietor. However, having a registered NGO/company makes approval easier.

### Q: How long does approval take?
**A:** 
- JazzCash Sandbox: 1-2 days
- JazzCash Production: 5-10 business days
- Stripe: 1-3 days (faster with complete documents)

### Q: What if my application is rejected?
**A:** Contact support, provide additional documents, or consider alternative payment methods.

### Q: Can I use both JazzCash and Stripe?
**A:** Yes! EcoBite supports both. Users can choose their preferred method.

### Q: Are there monthly fees?
**A:** 
- JazzCash: No monthly fee (only transaction fees)
- Stripe: No monthly fee (only transaction fees)

### Q: Can I refund payments?
**A:** Yes, both support refunds. EcoBite has refund functions implemented.

---

## ✅ Summary

### What You Need:
1. **JazzCash Merchant Account** - For Pakistani mobile wallet users
2. **Stripe Account** - For card payments and international donors
3. **Bank Account** - To receive settlements
4. **Business Documents** - CNIC, NTN, registration

### What EcoBite Already Has:
✅ Complete payment integration code  
✅ Stripe API implementation  
✅ JazzCash API implementation  
✅ Secure hash generation  
✅ Callback verification  
✅ Database recording  
✅ EcoPoints calculation  
✅ Error handling  

### What You Need to Do:
1. Register for merchant accounts
2. Get credentials
3. Add to `.env` file
4. Test in sandbox
5. Go live!

**Your payment system is ready - you just need the merchant accounts!** 🎉💳

---

**Need help setting up? Contact the payment providers' support teams - they're very helpful!**
