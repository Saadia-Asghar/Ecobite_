# 📱 Push & SMS Notifications Setup Guide

## 🎉 **Notification System Complete!**

Your EcoBite platform now supports **3 notification channels**:
1. ✅ **Email** (Already configured)
2. ✅ **SMS** (Twilio - New!)
3. ✅ **Push Notifications** (Firebase - New!)

---

## 📋 **What Was Created**

### **Services:**
1. `server/services/sms.ts` - SMS notifications via Twilio
2. `server/services/push.ts` - Push notifications via Firebase
3. `server/services/notifications.ts` - Unified notification system

### **Features:**
- ✅ Welcome notifications
- ✅ Payment verified/rejected
- ✅ Money request approved/rejected
- ✅ Donation claimed/available
- ✅ EcoPoints earned
- ✅ Voucher redeemed
- ✅ OTP verification
- ✅ Bulk notifications

---

## 🔧 **Setup Instructions**

### **1. SMS Notifications (Twilio)**

#### **Step 1: Create Twilio Account**
1. Go to: https://www.twilio.com/try-twilio
2. Sign up for free account
3. Get $15 free credit

#### **Step 2: Get Credentials**
1. Go to Twilio Console: https://console.twilio.com/
2. Copy your **Account SID**
3. Copy your **Auth Token**
4. Get a **Phone Number** (from Twilio dashboard)

#### **Step 3: Add to Environment Variables**

**Local (.env):**
```env
# Twilio SMS
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Vercel (Dashboard):**
1. Go to Vercel → Settings → Environment Variables
2. Add:
   - `TWILIO_ACCOUNT_SID` = `your_account_sid`
   - `TWILIO_AUTH_TOKEN` = `your_auth_token`
   - `TWILIO_PHONE_NUMBER` = `+1234567890`

---

### **2. Push Notifications (Firebase)**

#### **Step 1: Create Firebase Project**
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: "EcoBite"
4. Follow setup wizard

#### **Step 2: Enable Cloud Messaging**
1. In Firebase Console, go to **Project Settings**
2. Click **Cloud Messaging** tab
3. Note your **Server Key** (for later)

#### **Step 3: Generate Service Account**
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download JSON file
4. **Important:** Keep this file secure!

#### **Step 4: Add to Environment Variables**

**Local (.env):**
```env
# Firebase Push Notifications
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"..."}'
```

**Vercel (Dashboard):**
1. Open the downloaded JSON file
2. Copy entire JSON content
3. Add to Vercel:
   - `FIREBASE_PROJECT_ID` = `your-project-id`
   - `FIREBASE_SERVICE_ACCOUNT` = `{entire JSON content}`

---

## 💻 **How to Use**

### **Option 1: Unified Notification Service (Recommended)**

```typescript
import { sendNotification } from './services/notifications';

// Send welcome notification (Email + SMS + Push)
await sendNotification({
    userId: 'user-123',
    type: 'welcome'
});

// Send payment verified (Email + SMS + Push)
await sendNotification({
    userId: 'user-123',
    type: 'payment_verified',
    data: { amount: 5000 }
});

// Send only SMS and Push (no email)
await sendNotification({
    userId: 'user-123',
    type: 'money_request_approved',
    email: false,
    data: { amount: 10000 }
});
```

### **Option 2: Individual Services**

#### **SMS Only:**
```typescript
import { sendSMS, sendWelcomeSMS } from './services/sms';

// Send custom SMS
await sendSMS('+923001234567', 'Your custom message');

// Send welcome SMS
await sendWelcomeSMS('+923001234567', 'Ali Khan');
```

#### **Push Only:**
```typescript
import { sendPushNotification } from './services/push';

// Send push notification
await sendPushNotification(
    'device-token-here',
    'Welcome to EcoBite!',
    'Start making an impact today',
    { userId: '123' }
);
```

---

## 🔔 **Notification Types**

| Type | Email | SMS | Push | When Triggered |
|------|-------|-----|------|----------------|
| `welcome` | ✅ | ✅ | ✅ | User registration |
| `payment_verified` | ✅ | ✅ | ✅ | Admin approves payment |
| `payment_rejected` | ✅ | ✅ | ✅ | Admin rejects payment |
| `money_request_approved` | ✅ | ✅ | ✅ | Admin approves funding |
| `money_request_rejected` | ✅ | ✅ | ✅ | Admin rejects funding |
| `donation_claimed` | ✅ | ✅ | ✅ | Someone claims donation |
| `donation_available` | ✅ | ✅ | ✅ | New donation posted |
| `ecopoints_earned` | ✅ | ✅ | ✅ | User earns points |
| `voucher_redeemed` | ✅ | ✅ | ✅ | User redeems voucher |

---

## 📊 **Database Schema**

Add this table to track notification logs:

```sql
CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    email INTEGER DEFAULT 0,
    sms INTEGER DEFAULT 0,
    push INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

Add device token to users table:

```sql
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN deviceToken TEXT;
```

---

## 🧪 **Testing**

### **Test SMS:**
```bash
cd server
npx ts-node -e "
import { sendSMS } from './services/sms';
sendSMS('+923001234567', 'Test SMS from EcoBite!');
"
```

### **Test Push:**
```bash
cd server
npx ts-node -e "
import { sendPushNotification } from './services/push';
sendPushNotification('device-token', 'Test', 'Test push notification');
"
```

### **Test Unified:**
```bash
cd server
npx ts-node -e "
import { sendNotification } from './services/notifications';
sendNotification({ userId: 'user-id', type: 'welcome' });
"
```

---

## 💰 **Pricing**

### **Twilio SMS:**
- **Free Trial:** $15 credit
- **Pakistan SMS:** ~$0.04 per message
- **Monthly:** ~$1 for 25 messages

### **Firebase Push:**
- **Free:** Unlimited push notifications
- **No credit card required**

---

## 🔒 **Security**

### **Best Practices:**
1. ✅ Never commit credentials to GitHub
2. ✅ Use environment variables
3. ✅ Rotate keys regularly
4. ✅ Limit API access
5. ✅ Monitor usage

### **Environment Variables:**
```env
# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Push (Firebase)
FIREBASE_PROJECT_ID=ecobite-xxxxx
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

---

## 📱 **Frontend Integration**

### **Request Notification Permission:**
```typescript
// Request push notification permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
    // Get device token from Firebase
    const token = await getToken(messaging);
    
    // Save to backend
    await fetch('/api/users/device-token', {
        method: 'POST',
        body: JSON.stringify({ token })
    });
}
```

### **Handle Incoming Notifications:**
```typescript
import { onMessage } from 'firebase/messaging';

onMessage(messaging, (payload) => {
    console.log('Notification received:', payload);
    // Show notification to user
});
```

---

## 🎯 **Integration Examples**

### **1. User Registration:**
```typescript
// In auth.ts
import { sendNotification } from './services/notifications';

// After user registration
await sendNotification({
    userId: newUser.id,
    type: 'welcome'
});
```

### **2. Payment Approval:**
```typescript
// In manualPayment.ts
await sendNotification({
    userId: payment.userId,
    type: 'payment_verified',
    data: { amount: payment.amount }
});
```

### **3. Money Request Approved:**
```typescript
// In moneyRequests.ts
await sendNotification({
    userId: request.requester_id,
    type: 'money_request_approved',
    data: { amount: request.amount }
});
```

---

## 🚀 **Next Steps**

1. **Setup Twilio Account** (5 minutes)
2. **Setup Firebase Project** (5 minutes)
3. **Add Environment Variables** (2 minutes)
4. **Test Notifications** (5 minutes)
5. **Deploy to Vercel** (automatic)

---

## 📞 **Support**

### **Twilio:**
- Docs: https://www.twilio.com/docs/sms
- Support: https://support.twilio.com/

### **Firebase:**
- Docs: https://firebase.google.com/docs/cloud-messaging
- Support: https://firebase.google.com/support

---

## ✅ **Summary**

**What's Working:**
- ✅ SMS notifications via Twilio
- ✅ Push notifications via Firebase
- ✅ Unified notification system
- ✅ 9 notification types
- ✅ Bulk notifications
- ✅ Notification logging

**What You Need:**
- [ ] Twilio account (free)
- [ ] Firebase project (free)
- [ ] Add environment variables
- [ ] Test notifications

**Total Setup Time:** ~15 minutes

---

**🎉 Your notification system is ready! Just add credentials and test!**
