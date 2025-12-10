# 🔐 SMTP Configuration - YOUR CREDENTIALS

## ✅ Gmail App Password Retrieved!

From your screenshot, here are your SMTP credentials:

---

## 📧 **Your Email Configuration**

### **Email Account:**
- **Email:** saadianigah@gmail.com
- **App Password:** `bvxp rcbq zfrw wizt`
- **App Password (no spaces):** `bvxprcbqzfrwwizt`

---

## 🔧 **Setup Instructions**

### **Step 1: Create/Edit `.env` File**

Navigate to: `d:\ecobite_\server\.env`

If the file doesn't exist, create it by copying `.env.demo`:

```bash
cd d:\ecobite_\server
copy .env.demo .env
```

### **Step 2: Add These Lines to `.env`**

```env
# ===================================
# EMAIL CONFIGURATION - ACTIVE! ✅
# ===================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=saadianigah@gmail.com
SMTP_PASSWORD=bvxprcbqzfrwwizt

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3002
```

### **Step 3: Restart Your Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### **Step 4: Verify Email Service**

Look for this message in the console:

```
✅ Email service ready
```

---

## 🧪 **Test Your Email Setup**

### **Test 1: Register a New User**

```bash
POST http://localhost:3002/api/auth/register
{
  "name": "Test User",
  "email": "your-test-email@gmail.com",
  "password": "password123",
  "role": "individual"
}
```

**Expected Result:**
- ✅ User registered successfully
- ✅ Welcome email sent to your-test-email@gmail.com
- ✅ Check your inbox!

### **Test 2: Check Server Logs**

You should see:
```
✅ Email sent to: your-test-email@gmail.com
```

---

## 📋 **Complete `.env` File Template**

Here's the complete `.env` file you should have:

```env
# EcoBite Server Configuration

# Server
PORT=3002
NODE_ENV=development

# JWT
JWT_SECRET=ecobite_demo_secret_key_2024

# ===================================
# EMAIL CONFIGURATION - ACTIVE! ✅
# ===================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=saadianigah@gmail.com
SMTP_PASSWORD=bvxprcbqzfrwwizt

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3002

# ===================================
# PAYMENT GATEWAYS (DEMO MODE)
# ===================================

STRIPE_SECRET_KEY=sk_test_demo_mode
STRIPE_PUBLISHABLE_KEY=pk_test_demo_mode
STRIPE_WEBHOOK_SECRET=whsec_demo_mode

JAZZCASH_MERCHANT_ID=MC_DEMO_12345
JAZZCASH_PASSWORD=demo_password
JAZZCASH_INTEGRITY_SALT=demo_salt_key_123
JAZZCASH_RETURN_URL=http://localhost:5173/payment/jazzcash/return
JAZZCASH_API_URL=http://localhost:3002/api/payment/jazzcash/mock

# ===================================
# DATABASE
# ===================================

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecobite
DB_USER=postgres
DB_PASSWORD=your_password_here
```

---

## ✅ **What Will Happen**

Once configured, your EcoBite platform will automatically send:

1. **Welcome Emails** - When users register
2. **Payment Verification** - When admin approves payments
3. **Payment Rejection** - When admin rejects payments
4. **Password Reset** - When users request password reset
5. **Money Request Approved** - When admin approves funding

All emails will be sent from: **saadianigah@gmail.com**

---

## 🔍 **Troubleshooting**

### **If emails don't send:**

1. **Check server logs** for `✅ Email service ready`
2. **Verify App Password** is correct (no spaces): `bvxprcbqzfrwwizt`
3. **Check spam folder** - first emails might go there
4. **Verify 2FA is enabled** on your Gmail account

### **Gmail Limits:**
- Free Gmail accounts: **500 emails per day**
- If you need more, consider upgrading to SendGrid

---

## 🎉 **You're All Set!**

Your email credentials are configured. Just:

1. ✅ Copy the configuration above to `server/.env`
2. ✅ Restart your server
3. ✅ Test with user registration
4. ✅ Enjoy automated email notifications!

---

**App Password:** `bvxprcbqzfrwwizt`  
**Email:** saadianigah@gmail.com  
**Status:** ✅ Ready to use!

🌱 **EcoBite - Email Notifications Active!** 🌱
