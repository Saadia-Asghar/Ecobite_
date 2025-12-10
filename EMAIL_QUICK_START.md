# 📧 Email Notifications - Quick Reference

## ✅ Status: COMPLETE & READY

---

## 🚀 Quick Setup (5 Minutes)

### **1. Get Gmail App Password**
```
1. Visit: https://myaccount.google.com/apppasswords
2. Select: Mail → Other (Custom name) → "EcoBite"
3. Copy the 16-character password
```

### **2. Update `.env` File**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:5173
```

### **3. Restart Server**
```bash
npm run dev
```

**Look for:** `✅ Email service ready`

---

## 📧 Active Emails

| Event | Recipient | Status |
|-------|-----------|--------|
| User Registration | New User | ✅ Active |
| Payment Verified | Donor | ✅ Active |
| Payment Rejected | Donor | ✅ Active |
| Password Reset | User | ✅ Template Ready |
| Money Request Approved | Beneficiary | ✅ Template Ready |

---

## 🧪 Test Commands

### **Test Welcome Email:**
```bash
POST http://localhost:3002/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "individual"
}
```

### **Test Payment Verification:**
```bash
POST http://localhost:3002/api/payment/manual/:id/approve
{ "adminId": "admin-id" }
```

---

## 📁 Files

### **Created:**
- `server/services/email.ts` - Email service
- `EMAIL_SETUP_GUIDE.md` - Full setup guide
- `EMAIL_COMPLETE.md` - Complete documentation

### **Modified:**
- `server/routes/auth.ts` - Welcome email
- `server/routes/manualPayment.ts` - Payment emails

---

## 🔍 Troubleshooting

**Emails not sending?**
1. Check server logs for `✅ Email service ready`
2. Verify SMTP credentials in `.env`
3. For Gmail, use App Password (not regular password)
4. Check spam folder

**Gmail Issues?**
- Enable 2FA first
- Use 16-character App Password
- Check sending limits (500/day)

---

## 📊 What's Included

✅ Professional HTML templates  
✅ EcoBite branding  
✅ Mobile-responsive design  
✅ Async sending (non-blocking)  
✅ Error handling  
✅ Multi-provider support  

---

## 📞 Need Help?

- **Setup Guide:** `EMAIL_SETUP_GUIDE.md`
- **Full Docs:** `EMAIL_COMPLETE.md`
- **Gmail Help:** https://support.google.com/accounts/answer/185833

---

**Status:** ✅ READY TO USE  
**Time to Setup:** 5 minutes  
**Emails Sent:** Automatic on events  

🎉 **Email notifications are live!**
