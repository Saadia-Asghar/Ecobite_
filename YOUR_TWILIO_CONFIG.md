# 🔐 Your Twilio Configuration - EcoBite

## ✅ **Your Twilio Account Details**

From your Twilio dashboard:
- **Account SID:** `ACc78ad85`
- **Auth Token:** `07d1054865` (keep this secret!)
- **Your Phone Number:** `+923159127771`

---

## 📝 **Environment Variables**

### **Local Development (.env file):**

Add these to your `d:\ecobite_\.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACc78ad85
TWILIO_AUTH_TOKEN=07d1054865
TWILIO_PHONE_NUMBER=+923159127771
```

### **Vercel (Production):**

Add these in Vercel Dashboard → Settings → Environment Variables:

1. **TWILIO_ACCOUNT_SID** = `ACc78ad85`
2. **TWILIO_AUTH_TOKEN** = `07d1054865`
3. **TWILIO_PHONE_NUMBER** = `+923159127771`

---

## ⚠️ **Important Notes**

### **Phone Number Format:**
- **Your number:** `03159127771`
- **International format:** `+923159127771`
- **For SMS:** Always use `+92` prefix (Pakistan country code)

### **Twilio Phone Number:**
You need to get a Twilio phone number to send SMS from:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click **"Buy a number"**
3. Select a number (you have $15.50 trial credit)
4. Use that number as `TWILIO_PHONE_NUMBER`

**Note:** Trial accounts can only send to verified numbers. You need to verify `+923159127771` first!

---

## 🧪 **Verify Your Phone Number**

### **Step 1: Verify Your Number**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **"Add a new number"**
3. Enter: `+923159127771`
4. Verify via SMS or call

### **Step 2: Get a Twilio Phone Number**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/search
2. Search for a number (any country)
3. Buy it (uses your trial credit)
4. Copy the number

### **Step 3: Update Configuration**
Replace `TWILIO_PHONE_NUMBER` with the number you bought from Twilio.

---

## 📱 **Testing SMS**

### **Test 1: Simple SMS**
```bash
cd d:\ecobite_\server
npx ts-node -e "
import { sendSMS } from './services/sms';
sendSMS('+923159127771', 'Test SMS from EcoBite! 🌱');
"
```

### **Test 2: Welcome SMS**
```bash
npx ts-node -e "
import { sendWelcomeSMS } from './services/sms';
sendWelcomeSMS('+923159127771', 'Saadia');
"
```

---

## 🔒 **Security**

### **DO:**
- ✅ Keep Auth Token secret
- ✅ Use environment variables
- ✅ Never commit to GitHub
- ✅ Verify phone numbers in trial mode

### **DON'T:**
- ❌ Share Auth Token publicly
- ❌ Commit credentials to GitHub
- ❌ Use trial account for production (upgrade when ready)

---

## 💰 **Trial Account Limits**

Your trial account has:
- **Credit:** $15.50
- **SMS Cost:** ~$0.04 per message
- **Total SMS:** ~387 messages
- **Limitation:** Can only send to verified numbers

**To remove limitations:** Upgrade to paid account (no minimum)

---

## 🚀 **Quick Setup Steps**

1. ✅ **Verify your phone number** (+923159127771)
2. ✅ **Get a Twilio phone number** (buy from dashboard)
3. ✅ **Add to .env file** (all 3 variables)
4. ✅ **Test SMS** (run test command)
5. ✅ **Add to Vercel** (environment variables)
6. ✅ **Deploy** (automatic)

---

## 📞 **Your Configuration**

```env
# Your Twilio Account
TWILIO_ACCOUNT_SID=ACc78ad85
TWILIO_AUTH_TOKEN=07d1054865

# Your Phone (to receive SMS)
YOUR_PHONE=+923159127771

# Twilio Phone (to send FROM) - Get this from Twilio
TWILIO_PHONE_NUMBER=+1234567890  # Replace with Twilio number
```

---

## ✅ **Next Steps**

1. **Verify your phone:** https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. **Get Twilio number:** https://console.twilio.com/us1/develop/phone-numbers/manage/search
3. **Update .env file** with all credentials
4. **Test SMS** using the commands above
5. **Deploy to Vercel**

---

**Need help?** Let me know and I'll guide you through each step! 📱
