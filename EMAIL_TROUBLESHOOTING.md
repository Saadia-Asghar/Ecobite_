# 🔧 Email Notification System - Troubleshooting Guide

## ❌ **Problem: Email Notifications Not Working**

### **Root Cause:**
The email service was using incorrect environment variable names (`EMAIL_*` instead of `SMTP_*`).

---

## ✅ **Solution Applied**

### **Fixed Files:**
- `server/services/email.ts` - Updated to use `SMTP_*` variables

### **Changes Made:**
```typescript
// Before (Wrong):
host: process.env.EMAIL_HOST
user: process.env.EMAIL_USER
pass: process.env.EMAIL_PASSWORD

// After (Correct):
host: process.env.SMTP_HOST
user: process.env.SMTP_USER
pass: process.env.SMTP_PASSWORD
```

---

## 🧪 **How to Test**

### **Option 1: Test Script**
```bash
cd server
npx ts-node test-email.ts
```

This will:
- Check if environment variables are set
- Send a test welcome email
- Show success/error messages

### **Option 2: Test via API**
```bash
# Register a new user
POST http://localhost:3002/api/auth/register
{
  "name": "Test User",
  "email": "your-email@gmail.com",
  "password": "test123",
  "type": "individual"
}
```

Should send welcome email to the registered email.

---

## 📋 **Environment Variables Checklist**

### **Required Variables:**
- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `SMTP_USER` = `your-email@gmail.com`
- [ ] `SMTP_PASSWORD` = `your-app-password`

### **Where to Set:**

#### **Local Development (.env file):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=saadianigah@gmail.com
SMTP_PASSWORD=bvxprcbqzfrwwizt
```

#### **Vercel (Dashboard):**
1. Go to: https://vercel.com/saadia-asghars-projects/ecobite
2. Settings → Environment Variables
3. Verify all SMTP_* variables are set
4. Redeploy if you just added them

---

## 🔍 **Debugging Steps**

### **1. Check Server Logs**
When server starts, you should see:
```
✅ Email service ready
```

If you see:
```
❌ Email service error: ...
```
Then SMTP credentials are wrong or missing.

### **2. Check Vercel Logs**
1. Go to Vercel Dashboard
2. Click on your deployment
3. Go to "Runtime Logs"
4. Look for email-related messages

### **3. Test Locally First**
```bash
# Create .env file in root
cp .env.example .env

# Edit .env and add:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Start server
npm run dev

# Register a user and check if email is sent
```

---

## 🚨 **Common Issues**

### **Issue 1: "Invalid login" error**
**Cause:** Using regular Gmail password instead of App Password

**Solution:**
1. Go to: https://myaccount.google.com/apppasswords
2. Create new App Password
3. Use that password in `SMTP_PASSWORD`

### **Issue 2: "Connection timeout"**
**Cause:** Wrong SMTP host or port

**Solution:**
- Gmail: `smtp.gmail.com:587`
- SendGrid: `smtp.sendgrid.net:587`
- AWS SES: `email-smtp.us-east-1.amazonaws.com:587`

### **Issue 3: Emails not received**
**Check:**
- [ ] Spam folder
- [ ] Email address is correct
- [ ] Gmail account allows "Less secure apps" (if needed)
- [ ] 2-Step Verification is enabled (required for App Passwords)

### **Issue 4: "Email would be sent to..." in logs**
**Cause:** SMTP credentials not configured

**Solution:**
- Add `SMTP_USER` and `SMTP_PASSWORD` to environment variables
- Restart server

---

## ✅ **Verification**

### **Email Service is Working When:**
1. ✅ Server logs show: `✅ Email service ready`
2. ✅ User registration sends welcome email
3. ✅ Payment approval sends verification email
4. ✅ Money request approval sends notification email
5. ✅ No errors in server logs

---

## 📞 **Still Not Working?**

### **Check:**
1. Environment variables are set correctly in Vercel
2. Vercel deployment has redeployed after adding variables
3. Gmail App Password is correct
4. No typos in email address
5. Server logs for specific error messages

### **Get Help:**
- Check server logs: `vercel logs`
- Test locally first
- Verify SMTP credentials manually
- Try different email provider (SendGrid, AWS SES)

---

## 🎯 **Quick Fix Summary**

**Problem:** Email not working  
**Cause:** Wrong environment variable names  
**Fix:** Changed `EMAIL_*` to `SMTP_*`  
**Status:** ✅ Fixed and deployed  

**Next:** Redeploy on Vercel to apply changes

---

**Last Updated:** December 10, 2024  
**Status:** ✅ Fixed
