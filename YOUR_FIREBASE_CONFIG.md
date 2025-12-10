# 🔥 Your Firebase Configuration - EcoBite

## ✅ **Your Firebase Project Details**

From your Firebase console:
- **Project ID:** `ecobite-b241c`
- **Project Name:** `ecobite`
- **Web App URL:** `ecobite-b241c.web.app`

---

## 📱 **Firebase Configuration (Frontend)**

### **Your Firebase Config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA3Th3gLI55qpqI3wqxof5U8wwRtL3nNpw",
  authDomain: "ecobite-b241c.firebaseapp.com",
  projectId: "ecobite-b241c",
  storageBucket: "ecobite-b241c.firebasestorage.app",
  messagingSenderId: "966619503744",
  appId: "1:966619503744:web:e3daf6ef28e3bcc98eda65",
  measurementId: "G-3G64L85N3E"
};
```

---

## 🔔 **Setup Push Notifications (Backend)**

### **Step 1: Enable Cloud Messaging**
1. Go to: https://console.firebase.google.com/project/ecobite-b241c/settings/cloudmessaging
2. Click on **"Cloud Messaging"** tab
3. Enable **"Cloud Messaging API"** if not already enabled

### **Step 2: Generate Service Account Key**
1. Go to: https://console.firebase.google.com/project/ecobite-b241c/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Click **"Generate Key"** (downloads a JSON file)
4. **IMPORTANT:** Keep this file secure! Don't share it!

### **Step 3: Add to Environment Variables**

The downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "ecobite-b241c",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@ecobite-b241c.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Add to `.env` file:**
```env
# Firebase Push Notifications
FIREBASE_PROJECT_ID=ecobite-b241c
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"ecobite-b241c",...}'
```

**Note:** Copy the ENTIRE JSON content as a single line string.

---

## 🌐 **Frontend Integration**

### **Step 1: Install Firebase**
```bash
npm install firebase
```

### **Step 2: Create Firebase Config**
Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA3Th3gLI55qpqI3wqxof5U8wwRtL3nNpw",
  authDomain: "ecobite-b241c.firebaseapp.com",
  projectId: "ecobite-b241c",
  storageBucket: "ecobite-b241c.firebasestorage.app",
  messagingSenderId: "966619503744",
  appId: "1:966619503744:web:e3daf6ef28e3bcc98eda65",
  measurementId: "G-3G64L85N3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

### **Step 3: Request Permission**
```typescript
import { messaging, getToken } from './config/firebase';

// Request notification permission
const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console
    });
    
    // Send token to backend
    await fetch('/api/users/device-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }
};
```

### **Step 4: Handle Notifications**
```typescript
import { messaging, onMessage } from './config/firebase';

onMessage(messaging, (payload) => {
  console.log('Notification received:', payload);
  
  // Show notification
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.png'
  });
});
```

---

## 🔑 **Get VAPID Key (for Frontend)**

1. Go to: https://console.firebase.google.com/project/ecobite-b241c/settings/cloudmessaging
2. Scroll to **"Web configuration"**
3. Click **"Generate key pair"**
4. Copy the **"Key pair"** value
5. Use it in `getToken()` function

---

## 📝 **Environment Variables Summary**

### **Backend (.env):**
```env
# Firebase Push Notifications
FIREBASE_PROJECT_ID=ecobite-b241c
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### **Frontend (.env):**
```env
# Firebase Config (public - safe to expose)
VITE_FIREBASE_API_KEY=AIzaSyA3Th3gLI55qpqI3wqxof5U8wwRtL3nNpw
VITE_FIREBASE_AUTH_DOMAIN=ecobite-b241c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ecobite-b241c
VITE_FIREBASE_STORAGE_BUCKET=ecobite-b241c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=966619503744
VITE_FIREBASE_APP_ID=1:966619503744:web:e3daf6ef28e3bcc98eda65
VITE_FIREBASE_MEASUREMENT_ID=G-3G64L85N3E
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

---

## 🧪 **Testing Push Notifications**

### **Test from Backend:**
```bash
cd d:\ecobite_\server
npx ts-node -e "
import { sendPushNotification } from './services/push';
sendPushNotification('device-token', 'Test', 'Test push notification from EcoBite!');
"
```

### **Test from Firebase Console:**
1. Go to: https://console.firebase.google.com/project/ecobite-b241c/notification
2. Click **"Send your first message"**
3. Enter title and message
4. Click **"Send test message"**
5. Enter your device token
6. Click **"Test"**

---

## 🚀 **Quick Setup Steps**

1. ✅ **Enable Cloud Messaging** (Firebase Console)
2. ✅ **Generate Service Account** (download JSON)
3. ✅ **Add to .env** (backend)
4. ✅ **Get VAPID Key** (for frontend)
5. ✅ **Install Firebase** (frontend)
6. ✅ **Request Permission** (frontend)
7. ✅ **Test Notifications**

---

## 📞 **Important Links**

- **Firebase Console:** https://console.firebase.google.com/project/ecobite-b241c
- **Cloud Messaging:** https://console.firebase.google.com/project/ecobite-b241c/settings/cloudmessaging
- **Service Accounts:** https://console.firebase.google.com/project/ecobite-b241c/settings/serviceaccounts/adminsdk
- **Notifications:** https://console.firebase.google.com/project/ecobite-b241c/notification

---

## ✅ **Next Steps**

1. **Generate Service Account Key** (download JSON)
2. **Add to .env file** (backend)
3. **Get VAPID Key** (for frontend)
4. **Test push notifications**
5. **Deploy to Vercel**

---

**Your Firebase project is ready! Just get the service account key and you're done!** 🔥
