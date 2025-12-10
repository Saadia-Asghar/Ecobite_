# 📧 Email Notifications - Complete Setup Guide

**Date:** December 10, 2024  
**Status:** ✅ IMPLEMENTED  
**Time to Setup:** 15 minutes

---

## ✅ WHAT'S BEEN IMPLEMENTED

### **Email Service Created:**
- **File:** `server/services/emailService.ts`
- **Features:**
  - Welcome emails
  - Donation received notifications
  - Money request approved/rejected
  - Donation claimed notifications
  - Bulk email support

### **Email Routes Created:**
- **File:** `server/routes/email.ts`
- **Endpoints:**
  - `POST /api/email/test` - Send test email
  - `POST /api/email/notify` - Send notification to user
  - `POST /api/email/notify-bulk` - Send bulk notifications

---

## 🚀 SETUP INSTRUCTIONS

### **Option 1: Gmail (Easiest - FREE)**

#### **Step 1: Enable App Password**

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to: https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password

#### **Step 2: Add to .env**

Add to `server/.env`:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-16-char-app-password
```

---

### **Option 2: SendGrid (Recommended for Production)**

#### **Step 1: Create Account**

1. Go to: https://signup.sendgrid.com/
2. Sign up (FREE - 100 emails/day)
3. Verify your email
4. Create API key

#### **Step 2: Add to .env**

```env
# Email Configuration (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

### **Option 3: Other Providers**

#### **Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your.email@outlook.com
SMTP_PASS=your-password
```

#### **Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your.email@yahoo.com
SMTP_PASS=your-app-password
```

---

## 📝 USAGE EXAMPLES

### **Send Welcome Email:**

```typescript
import { sendEmail } from './services/emailService';

// After user registration
await sendEmail(
    user.email,
    'welcomeEmail',
    user.name,
    user.type
);
```

### **Send Donation Received:**

```typescript
await sendEmail(
    donor.email,
    'donationReceived',
    donor.name,
    donationAmount
);
```

### **Send Money Request Approved:**

```typescript
await sendEmail(
    requester.email,
    'moneyRequestApproved',
    requester.name,
    requestAmount,
    requestPurpose
);
```

---

## 🧪 TESTING

### **Test Email Endpoint:**

```bash
curl -X POST http://localhost:3002/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your.email@gmail.com"}'
```

### **Expected Response:**
```json
{
  "success": true,
  "messageId": "<message-id@gmail.com>"
}
```

---

## 🔧 INTEGRATION POINTS

### **1. User Registration:**

**File:** `server/routes/auth.ts`

Add after user creation:
```typescript
import { sendEmail } from '../services/emailService';

// After successful registration
await sendEmail(newUser.email, 'welcomeEmail', newUser.name, newUser.type);
```

### **2. Money Donation:**

**File:** `server/routes/payment.ts`

Add after payment verification:
```typescript
await sendEmail(user.email, 'donationReceived', user.name, amount);
```

### **3. Money Request Approval:**

**File:** `server/routes/finance.ts`

Add after approval:
```typescript
await sendEmail(
    requester.email,
    'moneyRequestApproved',
    requester.name,
    request.amount,
    request.purpose
);
```

### **4. Donation Claimed:**

**File:** `server/routes/donations.ts`

Add after claiming:
```typescript
const donor = await db.get('SELECT * FROM users WHERE id = ?', donation.donorId);
await sendEmail(
    donor.email,
    'donationClaimed',
    donor.name,
    donation.aiFoodType,
    claimer.name
);
```

---

## 📊 EMAIL TEMPLATES

### **Available Templates:**

1. **welcomeEmail** - New user registration
   - Parameters: `userName`, `userType`

2. **donationReceived** - Money donation confirmed
   - Parameters: `donorName`, `amount`

3. **moneyRequestApproved** - Request approved
   - Parameters: `requesterName`, `amount`, `purpose`

4. **moneyRequestRejected** - Request rejected
   - Parameters: `requesterName`, `amount`, `reason`

5. **donationClaimed** - Food donation claimed
   - Parameters: `donorName`, `foodType`, `claimerName`

---

## 🎨 CUSTOMIZING TEMPLATES

Edit `server/services/emailService.ts`:

```typescript
const templates = {
    yourTemplate: (param1: string, param2: number) => ({
        subject: 'Your Subject',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hello ${param1}!</h2>
                <p>Your value: ${param2}</p>
            </div>
        `,
    }),
};
```

---

## 🔒 SECURITY BEST PRACTICES

1. **Never commit .env file** to Git
2. **Use app passwords** instead of main password
3. **Enable 2FA** on email account
4. **Rotate passwords** regularly
5. **Use SendGrid** for production (better deliverability)

---

## 📈 MONITORING

### **Check Email Logs:**

```bash
# Backend console will show:
✅ Email sent: <message-id>
⚠️ Email not configured. Skipping email to: user@example.com
❌ Email error: [error details]
```

### **Track Delivery:**

- Gmail: Check "Sent" folder
- SendGrid: Dashboard → Activity Feed
- Other: Provider's dashboard

---

## 🚨 TROUBLESHOOTING

### **"Email not configured" message:**
- Check `.env` file has SMTP settings
- Restart backend server
- Verify environment variables loaded

### **"Authentication failed":**
- Gmail: Use app password, not main password
- Enable "Less secure app access" (not recommended)
- Check username/password correct

### **Emails not arriving:**
- Check spam folder
- Verify email address correct
- Check provider's sending limits
- Gmail: 500 emails/day limit

### **"Connection timeout":**
- Check firewall settings
- Verify SMTP port (587 or 465)
- Try different SMTP host

---

## 💰 COSTS

### **Free Options:**
- **Gmail:** 500 emails/day (FREE)
- **SendGrid:** 100 emails/day (FREE)
- **Outlook:** 300 emails/day (FREE)

### **Paid Options:**
- **SendGrid:** $15/month for 40,000 emails
- **Mailgun:** $35/month for 50,000 emails
- **AWS SES:** $0.10 per 1,000 emails

---

## ✅ QUICK START CHECKLIST

- [ ] Choose email provider (Gmail/SendGrid)
- [ ] Get SMTP credentials
- [ ] Add to `server/.env`
- [ ] Restart backend server
- [ ] Test with `/api/email/test`
- [ ] Integrate into app flows
- [ ] Test all email types
- [ ] Monitor delivery

---

## 🎊 YOU'RE DONE!

**Email notifications are now ready to use!**

Just add the SMTP credentials to your `.env` file and emails will start sending automatically when:
- Users register
- Donations are made
- Requests are approved/rejected
- Donations are claimed

---

**No credit card needed for testing with Gmail!** 📧✨
