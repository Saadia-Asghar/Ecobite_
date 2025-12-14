# 🔐 Environment Variables Setup Guide

This guide will help you set up all required environment variables for the EcoBite platform.

---

## 📋 Quick Setup Steps

### **1. Create `.env` File**

In the root directory of your project (`d:\ecobite_`), create a file named `.env` (note: this file is gitignored for security).

---

### **2. JWT Secret (Required) 🔑**

**Your Generated JWT Secret:**
```env
JWT_SECRET=K7mP9nQ2rT5vX8zA3bC6dF1gH4jL7oM0pR3sU6wY9zB2eG5hK8nQ1tW4xZ7aC0dF
```

**Alternative: Generate Your Own**
```bash
# Option 1: Using Node.js (recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: Using PowerShell
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"

# Option 3: Online Generator
# Visit: https://generate-secret.vercel.app/32
```

---

### **3. Environment & URLs**

```env
# Environment
NODE_ENV=production

# Frontend URL (Update with your Vercel deployment URL)
FRONTEND_URL=https://your-app.vercel.app

# Backend API URL (Update with your backend deployment URL)
API_URL=https://your-api.vercel.app
VITE_API_URL=https://your-api.vercel.app
```

---

## 🗂️ Complete `.env` File Template

Create a `.env` file in the root directory with the following content:

```env
# ============================================
# ECOBITE ENVIRONMENT VARIABLES
# ============================================

# -----------------
# 1. ENVIRONMENT
# -----------------
NODE_ENV=production

# -----------------
# 2. SECURITY
# -----------------
JWT_SECRET=K7mP9nQ2rT5vX8zA3bC6dF1gH4jL7oM0pR3sU6wY9zB2eG5hK8nQ1tW4xZ7aC0dF

# -----------------
# 3. URLS
# -----------------
# Replace these with your actual deployment URLs
FRONTEND_URL=https://your-app.vercel.app
API_URL=https://your-api.vercel.app
VITE_API_URL=https://your-api.vercel.app

# -----------------
# 4. DATABASE (PostgreSQL)
# -----------------
# Local Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecobite
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Production (Azure SQL or other cloud database)
# AZURE_SQL_SERVER=your-server-name
# AZURE_SQL_DATABASE=ecobite
# AZURE_SQL_USER=your-username
# AZURE_SQL_PASSWORD=your-password
# AZURE_SQL_PORT=5432

# -----------------
# 5. EMAIL SERVICE (Optional)
# -----------------
# Using SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@ecobite.com

# OR using Gmail SMTP
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# -----------------
# 6. SMS SERVICE (Optional)
# -----------------
# Using Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# -----------------
# 7. PUSH NOTIFICATIONS (Optional)
# -----------------
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}

# -----------------
# 8. PAYMENT GATEWAYS (Optional)
# -----------------
# JazzCash
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
JAZZCASH_RETURN_URL=https://your-app.vercel.app/payment/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# -----------------
# 9. AI SERVICES (Optional)
# -----------------
# OpenAI for AI features
OPENAI_API_KEY=sk-your-openai-api-key

# Azure AI Vision for image scanning
AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_VISION_KEY=your_vision_api_key

# -----------------
# 10. GOOGLE MAPS (Optional)
# -----------------
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# -----------------
# 11. MICROSOFT AUTH (Optional)
# -----------------
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id

# -----------------
# 12. SERVER CONFIGURATION
# -----------------
PORT=3002
```

---

## 🚀 Deployment to Vercel

### **Step 1: Set Environment Variables in Vercel Dashboard**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from your `.env` file

### **Step 2: Required Variables for Production**

**Minimum required for deployment:**
```env
NODE_ENV=production
JWT_SECRET=K7mP9nQ2rT5vX8zA3bC6dF1gH4jL7oM0pR3sU6wY9zB2eG5hK8nQ1tW4xZ7aC0dF
FRONTEND_URL=https://your-app.vercel.app
API_URL=https://your-api.vercel.app
VITE_API_URL=https://your-api.vercel.app
```

### **Step 3: Update URLs After Deployment**

After your first deployment:
1. Copy your Vercel deployment URL
2. Update `FRONTEND_URL` and `API_URL` with the actual URLs
3. Redeploy

---

## 📝 Important Notes

### **Security Best Practices:**
- ✅ Never commit `.env` file to Git (already in `.gitignore`)
- ✅ Use different secrets for development and production
- ✅ Rotate JWT secret periodically
- ✅ Keep API keys secure and private

### **Local Development:**
- For local development, you can use `http://localhost:3002` for `API_URL`
- For local frontend, use `http://localhost:5173` for `FRONTEND_URL`

### **Optional Services:**
- Email, SMS, Push Notifications, and Payment services are optional
- The app will work without them but with limited functionality
- Add them as needed based on your requirements

---

## ✅ Verification

After setting up your `.env` file:

1. **Test locally:**
   ```bash
   npm run dev
   ```

2. **Check if variables are loaded:**
   - Server should start without errors
   - Check console for any missing variable warnings

3. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Update environment configuration"
   git push
   ```

---

## 🆘 Troubleshooting

### **Issue: JWT Secret Error**
- Make sure `JWT_SECRET` is at least 32 characters long
- Use the generated secret provided above

### **Issue: Database Connection Failed**
- Verify database credentials
- Check if database is accessible from your deployment environment
- For Vercel, ensure database allows external connections

### **Issue: API URL Not Working**
- Make sure `VITE_API_URL` is set (required for Vite frontend)
- URLs should include `https://` protocol
- No trailing slashes in URLs

---

## 📞 Need Help?

If you encounter any issues:
1. Check the console for specific error messages
2. Verify all required variables are set
3. Ensure URLs are correct and accessible
4. Check Vercel deployment logs

---

**Generated on:** 2025-12-14
**Project:** EcoBite Platform
