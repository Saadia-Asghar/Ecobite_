# 🔐 Vercel Environment Variables Setup Guide

**Complete list of environment variables needed for EcoBite**

---

## ✅ **IMMEDIATE - Add These Now**

### **1. Cloudinary (Image Storage)**
```env
CLOUDINARY_CLOUD_NAME=dqlqezcm9
CLOUDINARY_API_KEY=696234811429463
CLOUDINARY_API_SECRET=5IPEBGtf8P2n5yzvhHXeIACINfs
```

**Status:** ✅ Ready to add (you have the credentials)

---

### **2. JWT Secret (Required)**
```env
JWT_SECRET=your-super-secret-key-min-32-characters-long
```

**Generate one:**
```bash
# On your computer, run:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Or use online:** https://generate-secret.vercel.app/32

---

### **3. Environment & URLs**
```env
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Replace `your-app.vercel.app` with your actual Vercel domain**

---

## 🔵 **AZURE SERVICES (Add Later When Ready)**

### **4. Azure SQL Database**
```env
AZURE_SQL_SERVER=your-server-name
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=your-admin-username
AZURE_SQL_PASSWORD=your-password
AZURE_SQL_PORT=1433
```

---

### **5. Azure Computer Vision**
```env
AZURE_COMPUTER_VISION_KEY=your-key
AZURE_COMPUTER_VISION_ENDPOINT=https://your-vision.cognitiveservices.azure.com/
```

---

### **6. Azure AD (Microsoft Login)**
```env
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_REDIRECT_URI=https://your-app.vercel.app/auth/callback
AZURE_AUTHORITY=https://login.microsoftonline.com/common
```

---

## 📝 **HOW TO ADD TO VERCEL**

1. **Go to:** https://vercel.com/dashboard
2. **Select:** Your EcoBite project
3. **Click:** Settings → Environment Variables
4. **For each variable:**
   - Click "Add New"
   - Enter Name and Value
   - Select environments (Production, Preview, Development)
   - Click "Save"
5. **Redeploy:** Go to Deployments → Redeploy

---

## ✅ **MINIMUM REQUIRED (To Launch MVP)**

**Must Have:**
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`
- ✅ `JWT_SECRET`
- ✅ `NODE_ENV=production`
- ✅ `FRONTEND_URL`

**Optional (Can Add Later):**
- 🔵 Azure SQL Database
- 🔵 Azure Computer Vision
- 🔵 Azure AD

---

## 🎯 **QUICK SETUP ORDER**

1. **Now:** Cloudinary (you have credentials)
2. **Now:** JWT_SECRET (generate one)
3. **Now:** NODE_ENV and FRONTEND_URL
4. **Later:** Azure services (when ready)

---

**Your Cloudinary credentials are ready!** Just add them to Vercel. 🚀

