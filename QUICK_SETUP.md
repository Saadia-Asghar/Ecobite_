# 🚀 Quick Setup Guide - Run This!

## ✅ **Automatic Setup (Recommended)**

### **Run the setup script:**

```bash
# In PowerShell or Command Prompt
cd d:\ecobite_
.\setup-env.bat
```

This will:
- ✅ Create `.env` file automatically
- ✅ Add all your credentials (Email, SMS, Push)
- ✅ Configure everything correctly

---

## 📝 **What Gets Configured:**

### **Email (SMTP):**
- ✅ Gmail SMTP
- ✅ Your email: saadianigah@gmail.com
- ✅ App password: bvxprcbqzfrwwizt

### **SMS (Twilio):**
- ✅ Account SID: ACc78ad85
- ✅ Auth Token: 07d1054865
- ⚠️ Phone: +923159127771 (YOUR number - need to get Twilio number)

### **Push (Firebase):**
- ✅ Project ID: ecobite-b241c
- ✅ Service Account: Configured

---

## ⚠️ **Important: Twilio Phone Number**

The script sets `TWILIO_PHONE_NUMBER` to your personal number (+923159127771).

**You need to:**
1. Get a Twilio phone number: https://console.twilio.com/us1/develop/phone-numbers/manage/search
2. Buy a number (uses your $15.50 credit)
3. Update `.env` file with that number

**Why?** Twilio sends SMS FROM their number, not yours.

---

## 🧪 **Test After Setup:**

```bash
# Test email
cd server
npx ts-node -e "import { sendEmail } from './services/email'; sendEmail('test@test.com', 'Test', '<h1>Test</h1>');"

# Test SMS (after getting Twilio number)
npx ts-node -e "import { sendSMS } from './services/sms'; sendSMS('+923159127771', 'Test SMS!');"

# Test push
npx ts-node -e "import { sendPushNotification } from './services/push'; console.log('Push service ready!');"
```

---

## ✅ **Checklist:**

- [ ] Run `setup-env.bat`
- [ ] Verify `.env` file created
- [ ] Get Twilio phone number
- [ ] Update `TWILIO_PHONE_NUMBER` in `.env`
- [ ] Test notifications
- [ ] Add same variables to Vercel
- [ ] Deploy!

---

**Total Time:** 5 minutes! 🚀
