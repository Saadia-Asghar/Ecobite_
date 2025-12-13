# 🔐 Environment Variables Guide

Complete guide to all environment variables used in EcoBite.

---

## 📋 REQUIRED VARIABLES (Production)

### **Critical - Must Set:**

```env
# JWT Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# Generate with: openssl rand -base64 32

# Environment
NODE_ENV=production
```

---

## 🗄️ DATABASE CONFIGURATION

### **Option A: PostgreSQL**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecobite
DB_USER=postgres
DB_PASSWORD=your-password
```

### **Option B: Azure SQL Database**

```env
AZURE_SQL_SERVER=your-server-name
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=your-username
AZURE_SQL_PASSWORD=your-password
AZURE_SQL_PORT=1433
```

### **Option C: Connection String**

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## 🌐 FRONTEND CONFIGURATION

```env
# Production frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Production API URL (optional, defaults to same origin)
VITE_API_URL=https://api.yourdomain.com
```

---

## 🔐 AUTHENTICATION SERVICES

### **Microsoft Azure AD (Optional)**

```env
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_AUTHORITY=https://login.microsoftonline.com/common
AZURE_REDIRECT_URI=https://yourdomain.com/auth/callback
```

---

## 🤖 AI SERVICES (Optional)

### **Azure Computer Vision**

```env
AZURE_COMPUTER_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_COMPUTER_VISION_KEY=your-key
```

### **Azure Custom Vision**

```env
AZURE_CUSTOM_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_CUSTOM_VISION_KEY=your-prediction-key
AZURE_CUSTOM_VISION_PROJECT_ID=your-project-id
AZURE_CUSTOM_VISION_ITERATION_NAME=your-iteration-name
```

---

## 📧 EMAIL CONFIGURATION (Optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 💳 PAYMENT GATEWAYS (Optional)

### **Stripe**

```env
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### **JazzCash**

```env
JAZZCASH_MERCHANT_ID=your-merchant-id
JAZZCASH_PASSWORD=your-password
JAZZCASH_INTEGRITY_SALT=your-salt
JAZZCASH_API_URL=https://payments.jazzcash.com.pk/...
```

---

## 📱 SMS SERVICE (Optional)

### **Twilio**

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🗺️ MAP SERVICES (Optional)

### **Google Maps**

```env
GOOGLE_MAPS_API_KEY=your-api-key
```

---

## ☁️ CLOUD STORAGE (Optional)

### **Cloudinary**

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🚀 DEPLOYMENT PLATFORMS

### **Vercel**

Add all variables in: **Settings → Environment Variables**

- Select environment: Production, Preview, Development
- Add each variable
- Redeploy after adding

### **Railway**

Add in: **Variables** tab

### **Heroku**

```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
```

---

## ✅ VALIDATION

The application validates required variables on startup:

- ✅ `JWT_SECRET` - Required in production
- ⚠️ Database config - Warns if missing
- ✅ Fails fast if critical variables missing

---

## 🔒 SECURITY NOTES

1. **Never commit `.env` files**
2. **Use different secrets for dev/prod**
3. **Rotate secrets regularly**
4. **Use strong random strings for JWT_SECRET**
5. **Restrict database access by IP**
6. **Use environment-specific values**

---

## 📝 GENERATING SECRETS

### **JWT Secret:**
```bash
openssl rand -base64 32
```

### **Random String:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 TESTING

### **Check Environment Variables:**
```bash
# Local
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"

# Production (Vercel)
# Check in Vercel dashboard → Settings → Environment Variables
```

---

## 📚 RESOURCES

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [12-Factor App Config](https://12factor.net/config)

