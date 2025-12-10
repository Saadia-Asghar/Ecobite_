# EcoBite - Prototype Mode Setup (No Merchant Account Needed!)

**Date:** December 10, 2024  
**Purpose:** Run EcoBite prototype without merchant accounts

---

## ✅ YES! You Can Run Without Merchant Accounts

### **For Prototype/Demo:**
You can use **mock/demo mode** which simulates payments without real money. Perfect for:
- Testing the application
- Demonstrating to investors
- User acceptance testing
- Development
- Portfolio showcase

### **For Production:**
You'll need real merchant accounts to accept actual money.

---

## 🚀 QUICK START - Prototype Mode (5 Minutes)

### Step 1: Create `.env` File

Create a file named `.env` in the `server` folder:

```bash
# Location: d:\ecobite_\server\.env
```

Add this content:

```env
# Server Configuration
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Secret (change this to any random string)
JWT_SECRET=ecobite_demo_secret_key_2024

# Database - Use SQLite for prototype (no PostgreSQL needed!)
# Leave these commented out for now
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=ecobite
# DB_USER=postgres
# DB_PASSWORD=

# Stripe - DEMO MODE (Free, no account needed!)
STRIPE_SECRET_KEY=sk_test_demo_mode
STRIPE_PUBLISHABLE_KEY=pk_test_demo_mode
STRIPE_WEBHOOK_SECRET=whsec_demo_mode

# JazzCash - DEMO MODE (No account needed!)
JAZZCASH_MERCHANT_ID=MC_DEMO_12345
JAZZCASH_PASSWORD=demo_password
JAZZCASH_INTEGRITY_SALT=demo_salt_key_123
JAZZCASH_RETURN_URL=http://localhost:5173/payment/jazzcash/return
JAZZCASH_API_URL=http://localhost:3002/api/payment/jazzcash/mock

# Azure OpenAI (Optional - for AI features)
# AZURE_OPENAI_ENDPOINT=
# AZURE_OPENAI_API_KEY=
# AZURE_OPENAI_DEPLOYMENT_NAME=
```

### Step 2: Enable Demo Payment Mode

The app already has demo mode built in! It will automatically use mock payments when it detects demo credentials.

### Step 3: Start the Application

```bash
# Terminal 1 - Start Backend
cd server
npm install
npm run dev

# Terminal 2 - Start Frontend
cd ..
npm install
npm run dev
```

### Step 4: Access the App

Open browser: `http://localhost:5173`

---

## 💡 How Demo Mode Works

### **Money Donations (Demo):**

1. User clicks "Donate Money"
2. Enters amount: PKR 1,000
3. Selects payment method:
   - **Stripe (Demo):** Instantly succeeds
   - **JazzCash (Demo):** Instantly succeeds
4. Payment is "verified" (simulated)
5. Money added to fund balance
6. EcoPoints awarded
7. Transaction recorded

**No real money involved!** ✅

### **What Gets Recorded:**
- ✅ Donation in database
- ✅ Transaction history
- ✅ Fund balance updated
- ✅ EcoPoints awarded
- ✅ All features work exactly like production

### **Difference from Real Mode:**
- ❌ No actual money transferred
- ❌ No real bank settlements
- ✅ Everything else works identically

---

## 🎮 Demo Mode Features

### **1. Automatic Success**
All payments automatically succeed in demo mode:
```javascript
// Demo Stripe payment
Amount: PKR 1,000
Status: ✅ Success (instant)
Transaction ID: demo_stripe_123456

// Demo JazzCash payment
Amount: PKR 1,000
Phone: 03001234567
Status: ✅ Success (instant)
Transaction ID: demo_jc_789012
```

### **2. Test Different Scenarios**

You can simulate different payment outcomes:

```javascript
// In demo mode, you can test:
- Successful payments ✅
- Failed payments ❌
- Pending payments ⏳
- Refunds 💰
```

### **3. Full Functionality**

Everything works in demo mode:
- ✅ User registration
- ✅ Food donations
- ✅ Money donations (simulated)
- ✅ Money requests
- ✅ Admin approval
- ✅ Bank accounts
- ✅ EcoPoints
- ✅ Vouchers
- ✅ Notifications
- ✅ Analytics

---

## 📊 Demo vs Production Comparison

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| **Setup Time** | 5 minutes | 1-2 weeks |
| **Cost** | FREE | Merchant fees |
| **Real Money** | No | Yes |
| **Testing** | Perfect | Limited |
| **Investors Demo** | ✅ Great | ⚠️ Risky |
| **User Testing** | ✅ Safe | ⚠️ Costly |
| **Database** | SQLite (built-in) | PostgreSQL |
| **Deployment** | Local/Vercel | Production server |

---

## 🎯 When to Use Each Mode

### **Use Demo Mode For:**
- ✅ Development and testing
- ✅ Demonstrating to investors
- ✅ User acceptance testing
- ✅ Portfolio showcase
- ✅ Learning the platform
- ✅ Bug testing
- ✅ Feature development

### **Use Production Mode For:**
- ✅ Accepting real donations
- ✅ Live users
- ✅ Actual money transfers
- ✅ Official launch
- ✅ Real impact

---

## 🔧 Advanced Demo Setup

### **Option 1: Use Built-in SQLite (Easiest)**

The app already uses in-memory database for demo. No setup needed!

```javascript
// Already configured in server/db.ts
// Uses MockDatabase for demo mode
```

### **Option 2: Use PostgreSQL (More Realistic)**

If you want to test with PostgreSQL locally:

```bash
# Install PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# Create database
createdb ecobite

# Update .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecobite
DB_USER=postgres
DB_PASSWORD=your_password
```

### **Option 3: Use Stripe Test Mode (Free!)**

Stripe offers FREE test mode - no merchant account needed:

1. Go to: https://stripe.com/
2. Click "Sign up"
3. Enter email (no verification needed for test mode)
4. Get test API keys instantly
5. Use test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

```env
# Real Stripe test keys (free!)
STRIPE_SECRET_KEY=sk_test_51Abc...
STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...
```

---

## 🎬 Demo Walkthrough

### **Scenario 1: Individual Donates Money**

```
1. Login as: demo@individual.com / password123
2. Go to Finance tab
3. Click "Donate Money"
4. Enter amount: PKR 500
5. Select "Stripe" or "JazzCash"
6. Click "Donate"
7. ✅ Success! (instant in demo mode)
8. See: 
   - Fund balance increased
   - EcoPoints awarded (50 points)
   - Transaction in history
```

### **Scenario 2: NGO Requests Money**

```
1. Login as: demo@ngo.com / password123
2. Go to Finance tab
3. Click "Request Money"
4. Enter:
   - Distance: 10 km
   - Purpose: "Transport for food collection"
5. Submit request
6. ✅ Request created (status: pending)
```

### **Scenario 3: Admin Approves Request**

```
1. Login as: admin@ecobite.com / Admin@123
2. Go to Admin Panel → Finance
3. See pending request
4. Click "Approve & Transfer"
5. ✅ See NGO's bank details
6. Request approved (in demo, no real transfer)
```

---

## 📱 Frontend Demo Features

### **Demo User Accounts (Pre-created)**

```javascript
// Individual
Email: demo@individual.com
Password: password123

// Restaurant
Email: demo@restaurant.com
Password: password123

// NGO
Email: demo@ngo.com
Password: password123

// Animal Shelter
Email: demo@shelter.com
Password: password123

// Fertilizer Company
Email: demo@fertilizer.com
Password: password123

// Admin
Email: admin@ecobite.com
Password: Admin@123
```

### **Demo Data (Pre-loaded)**

The app comes with demo data:
- ✅ Sample food donations
- ✅ Sample users
- ✅ Sample transactions
- ✅ Sample vouchers
- ✅ Sample banners

---

## 🚀 Deployment Options (Demo Mode)

### **Option 1: Local (Easiest)**

```bash
# Already running!
npm run dev
```

Access: `http://localhost:5173`

### **Option 2: Vercel (Free Hosting)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd d:\ecobite_
vercel

# Deploy backend
cd server
vercel
```

Access: `https://your-app.vercel.app`

### **Option 3: Netlify (Free Hosting)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## ⚡ Quick Demo Checklist

- [ ] Create `.env` file with demo credentials
- [ ] Run `npm install` in both folders
- [ ] Start backend: `npm run dev` (in server folder)
- [ ] Start frontend: `npm run dev` (in root folder)
- [ ] Open `http://localhost:5173`
- [ ] Login with demo accounts
- [ ] Test all features
- [ ] Show to investors/users!

---

## 🎓 Learning Path

### **Phase 1: Demo Mode (Now - 1 Week)**
- ✅ Set up and run locally
- ✅ Test all features
- ✅ Understand workflows
- ✅ Demo to stakeholders
- ✅ Get feedback

### **Phase 2: Test Mode (Week 2-3)**
- ⏳ Register Stripe (free test mode)
- ⏳ Test with real Stripe test cards
- ⏳ Set up PostgreSQL locally
- ⏳ Test with more users

### **Phase 3: Production (Week 4+)**
- ⏳ Register merchant accounts
- ⏳ Get production credentials
- ⏳ Deploy to production server
- ⏳ Launch!

---

## 💰 Cost Comparison

### **Demo Mode:**
- Setup: FREE
- Running: FREE
- Testing: FREE
- Hosting (Vercel): FREE
- **Total: PKR 0**

### **Production Mode:**
- Merchant accounts: FREE to register
- Server: ~PKR 5,000/month
- Database: ~PKR 2,000/month
- Storage: ~PKR 500/month
- Transaction fees: 1.5-3% per transaction
- **Total: ~PKR 7,500/month + transaction fees**

---

## ❓ FAQ

### **Q: Can I show this to investors?**
**A:** YES! Demo mode is perfect for investor presentations. Shows all features without risk.

### **Q: Can users test it?**
**A:** YES! Perfect for user acceptance testing. No real money at risk.

### **Q: How long can I use demo mode?**
**A:** Forever! Use it as long as you want for testing and development.

### **Q: Will it look different from production?**
**A:** NO! It looks and works exactly the same. Users won't know it's demo mode.

### **Q: Can I switch to production later?**
**A:** YES! Just update `.env` with real credentials. No code changes needed.

### **Q: Do I need PostgreSQL for demo?**
**A:** NO! The app uses in-memory database for demo. Works perfectly.

### **Q: Can I deploy demo mode online?**
**A:** YES! Deploy to Vercel/Netlify for free. Share link with anyone.

---

## 🎉 You're Ready!

### **What You Have Now:**
✅ Fully functional EcoBite platform  
✅ Demo mode (no merchant accounts needed)  
✅ All features working  
✅ Ready to demonstrate  
✅ Ready to test  
✅ Ready to develop  

### **What You Can Do:**
✅ Show to investors  
✅ Test with users  
✅ Add to portfolio  
✅ Continue development  
✅ Get feedback  
✅ Plan launch  

### **When You're Ready for Real Money:**
⏳ Register merchant accounts  
⏳ Get credentials  
⏳ Update `.env`  
⏳ Deploy to production  
⏳ Launch!  

---

## 🚀 START NOW!

```bash
# 1. Create .env file (copy from above)
# 2. Install dependencies
cd server && npm install
cd .. && npm install

# 3. Start the app
# Terminal 1:
cd server && npm run dev

# Terminal 2:
npm run dev

# 4. Open browser
# http://localhost:5173

# 5. Login with demo account
# Email: demo@individual.com
# Password: password123

# 6. Test everything!
```

**Your prototype is ready to run RIGHT NOW!** 🎊

No merchant accounts needed. No waiting. Just start and demo! 🚀
