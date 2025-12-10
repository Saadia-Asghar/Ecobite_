# 📧 Email Notification System - Setup Guide

## ✅ What's Implemented

The EcoBite platform now has a **complete email notification system** with beautiful HTML templates!

### **Email Templates Available:**

1. **Welcome Email** - Sent when users register
2. **Password Reset** - Sent when users request password reset
3. **Payment Verification** - Sent when admin approves manual payment
4. **Payment Rejection** - Sent when admin rejects manual payment
5. **Money Request Approved** - Sent when admin approves funding request
6. **Donation Created** - Sent when food donation is created
7. **Donation Claimed** - Sent when donation is claimed
8. **Donation Completed** - Sent when both parties confirm delivery

---

## 🔧 Setup Instructions

### **Option 1: Gmail (Easiest for Testing)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "EcoBite"
   - Copy the 16-character password

3. **Add to `.env` file:**

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

---

### **Option 2: SendGrid (Recommended for Production)**

1. **Create SendGrid Account:**
   - Go to: https://sendgrid.com/
   - Sign up for free (100 emails/day)

2. **Create API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Add to `.env` file:**

```env
# Email Configuration (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

### **Option 3: AWS SES (Best for Scale)**

1. **Create AWS Account** and verify email
2. **Get SMTP Credentials:**
   - Go to SES Console
   - Create SMTP credentials
   - Note the username and password

3. **Add to `.env` file:**

```env
# Email Configuration (AWS SES)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-aws-smtp-username
SMTP_PASSWORD=your-aws-smtp-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 📝 Environment Variables

Add these to your `.env` file:

```env
# ===================================
# EMAIL CONFIGURATION
# ===================================

# SMTP Server Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Authentication
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3002

# Email Sender Info
EMAIL_FROM_NAME=EcoBite
EMAIL_FROM_ADDRESS=noreply@ecobite.com
```

---

## 🎨 Email Features

### **Beautiful HTML Templates:**
- ✅ Responsive design
- ✅ EcoBite branding (green gradient)
- ✅ Professional styling
- ✅ Mobile-friendly
- ✅ Dark mode compatible

### **Email Content:**
- 📧 Personalized greetings
- 🎯 Clear call-to-action buttons
- 📊 Transaction details
- 🏆 EcoPoints earned
- 🔗 Direct links to dashboard

---

## 🚀 Testing Emails

### **1. Test Welcome Email:**

```bash
# Register a new user
POST http://localhost:3002/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "type": "individual"
}
```

### **2. Test Password Reset:**

```bash
# Request password reset
POST http://localhost:3002/api/auth/forgot-password
{
  "email": "test@example.com"
}
```

### **3. Test Payment Verification:**

```bash
# Admin approves payment
POST http://localhost:3002/api/payment/manual/:id/approve
{
  "adminId": "admin-id"
}
```

---

## 📧 Email Triggers

### **Automatic Emails Sent:**

| Event | Recipient | Email Type |
|-------|-----------|------------|
| User registers | New user | Welcome Email |
| Password reset requested | User | Password Reset |
| Donation created | Donor | Donation Created |
| Donation claimed | Donor & Beneficiary | Donation Claimed |
| Donation completed | Both parties | Donation Completed |
| Payment verified | Donor | Payment Verified |
| Payment rejected | Donor | Payment Rejected |
| Money request approved | Beneficiary | Request Approved |
| Money request rejected | Beneficiary | Request Rejected |

---

## 🔍 Troubleshooting

### **Emails Not Sending?**

1. **Check Console Logs:**
   - Look for "✅ Email service ready" on server start
   - Check for "✅ Email sent to: [email]" when triggered

2. **Verify Credentials:**
   - Make sure SMTP_USER and SMTP_PASSWORD are correct
   - For Gmail, use App Password, not regular password

3. **Check Spam Folder:**
   - Emails might be in spam initially

4. **Test SMTP Connection:**
   ```bash
   # The server will log connection status on startup
   npm run dev
   # Look for: "✅ Email service ready"
   ```

### **Gmail Specific Issues:**

- ✅ Enable "Less secure app access" (if not using App Password)
- ✅ Enable 2FA and use App Password
- ✅ Check Gmail sending limits (500/day for free accounts)

---

## 📊 Email Analytics (Optional)

### **Track Email Performance:**

Add to SendGrid or AWS SES:
- Open rates
- Click rates
- Bounce rates
- Delivery rates

---

## 🎯 Production Checklist

Before going live:

- [ ] Use professional email service (SendGrid/AWS SES)
- [ ] Set up custom domain (emails@ecobite.com)
- [ ] Configure SPF, DKIM, DMARC records
- [ ] Add unsubscribe functionality
- [ ] Set up email templates in provider dashboard
- [ ] Monitor email delivery rates
- [ ] Set up email queue for high volume
- [ ] Add retry logic for failed emails
- [ ] Implement email preferences for users

---

## 💡 Advanced Features (Future)

### **Email Queue System:**
```typescript
// For high-volume emails
import Bull from 'bull';

const emailQueue = new Bull('email-queue');

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  await sendEmail(to, subject, html);
});

// Add to queue
emailQueue.add({ to, subject, html });
```

### **Email Templates with Variables:**
```typescript
// Use template engines like Handlebars
import Handlebars from 'handlebars';

const template = Handlebars.compile(emailTemplate);
const html = template({ name, amount, date });
```

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test SMTP connection
4. Check email provider status
5. Contact support@ecobite.com

---

## ✅ Summary

**Email System Status:** ✅ **FULLY IMPLEMENTED**

**Features:**
- ✅ 8+ email templates
- ✅ Beautiful HTML design
- ✅ Automatic triggers
- ✅ Multiple SMTP providers supported
- ✅ Error handling
- ✅ Logging

**Next Steps:**
1. Add SMTP credentials to `.env`
2. Restart server
3. Test with user registration
4. Monitor email delivery

---

🎉 **Email notifications are ready to use!** Just add your SMTP credentials and start sending beautiful emails to your users!
