# 🔵 Azure Setup Guide - When You're Ready

**Status:** All code is ready! Just need Azure resources and credentials.

---

## 📋 **QUICK OVERVIEW**

You need 3 Azure services:
1. **Azure SQL Database** - For persistent data storage
2. **Azure Computer Vision** - For food image analysis
3. **Azure AD** - For Microsoft login

**All code is already implemented!** You just need to:
- Create Azure resources
- Get credentials
- Add to Vercel environment variables

---

## 🗄️ **1. AZURE SQL DATABASE**

### **Current Status:**
- ✅ PostgreSQL code ready (`server/database.ts`)
- ✅ Schema defined
- ⏳ Need to connect to Azure SQL

### **Setup Steps:**

1. **Create Azure SQL Database:**
   - Go to: https://portal.azure.com
   - Click "Create a resource"
   - Search "Azure SQL Database"
   - Click "Create"

2. **Configure:**
   ```
   Subscription: Your subscription
   Resource Group: Create new "ecobite-rg"
   Database name: ecobite-db
   Server: Create new server
     - Server name: ecobite-server (must be unique)
     - Location: Choose closest region
     - Authentication: SQL authentication
     - Admin username: ecobite-admin
     - Password: (create strong password - SAVE THIS!)
   ```

3. **Get Connection String:**
   - After creation, go to your database
   - Click "Connection strings" (left menu)
   - Copy "ADO.NET" connection string
   - Or use format: `Server=tcp:ecobite-server.database.windows.net,1433;Database=ecobite-db;User ID=ecobite-admin@ecobite-server;Password=YOUR_PASSWORD;`

4. **Add to Vercel:**
   ```env
   AZURE_SQL_SERVER=ecobite-server
   AZURE_SQL_DATABASE=ecobite-db
   AZURE_SQL_USER=ecobite-admin
   AZURE_SQL_PASSWORD=your-password
   AZURE_SQL_PORT=1433
   ```

5. **Update Code:**
   - Update `server/db.ts` to check for `AZURE_SQL_SERVER`
   - If found, use PostgreSQL from `server/database.ts`
   - Otherwise, use mock database

**Guide:** See `AZURE_TRAINING_AND_CONNECTION_GUIDE.md` Section 4 for detailed steps

---

## 🤖 **2. AZURE COMPUTER VISION**

### **Current Status:**
- ✅ Code ready (`server/services/azureAI.ts`)
- ✅ Integrated in donation routes
- ✅ Falls back to mock if not configured
- ⏳ Need API key and endpoint

### **Setup Steps:**

1. **Create Computer Vision Resource:**
   - Go to: https://portal.azure.com
   - Click "Create a resource"
   - Search "Computer Vision"
   - Click "Create"

2. **Configure:**
   ```
   Subscription: Your subscription
   Resource Group: ecobite-rg (same as SQL)
   Region: Choose closest to you
   Name: ecobite-vision
   Pricing tier: Free F0 (5,000 images/month)
   ```

3. **Get Credentials:**
   - After creation, go to your resource
   - Click "Keys and Endpoint" (left menu)
   - Copy KEY 1
   - Copy Endpoint URL

4. **Add to Vercel:**
   ```env
   AZURE_COMPUTER_VISION_KEY=your-key-here
   AZURE_COMPUTER_VISION_ENDPOINT=https://ecobite-vision.cognitiveservices.azure.com/
   ```

5. **Test:**
   - Upload a food image
   - Should analyze and detect food type
   - Check logs for "✅ Azure Computer Vision initialized"

**Guide:** See `AZURE_TRAINING_AND_CONNECTION_GUIDE.md` Section 3 for detailed steps

**Code Location:**
- `server/services/azureAI.ts` - Main service
- `server/routes/donations.ts` - Uses it for image analysis

---

## 🔐 **3. AZURE AD (MICROSOFT LOGIN)**

### **Current Status:**
- ✅ Code ready (`server/services/azureAuth.ts`)
- ✅ Routes ready (`server/routes/azureAuth.ts`)
- ✅ Falls back gracefully if not configured
- ⏳ Need App Registration credentials

### **Setup Steps:**

1. **Create App Registration:**
   - Go to: https://portal.azure.com
   - Search "Azure Active Directory" or "Microsoft Entra ID"
   - Click "App registrations" (left menu)
   - Click "+ New registration"

2. **Configure:**
   ```
   Name: EcoBite
   Supported account types: 
     ✅ Accounts in any organizational directory and personal Microsoft accounts
   Redirect URI:
     Platform: Web
     URI: http://localhost:5173/auth/callback (for development)
     Click "Add"
   ```

3. **Get Client ID:**
   - After registration, copy "Application (client) ID"
   - Save this!

4. **Create Client Secret:**
   - Click "Certificates & secrets" (left menu)
   - Click "+ New client secret"
   - Description: "EcoBite Production"
   - Expires: 24 months
   - Click "Add"
   - **Copy the Value immediately!** (You won't see it again)

5. **Configure API Permissions:**
   - Click "API permissions" (left menu)
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add: `User.Read`, `email`, `profile`, `openid`
   - Click "Add permissions"
   - Click "Grant admin consent" (if you're admin)

6. **Add Production Redirect URI:**
   - Click "Authentication" (left menu)
   - Click "+ Add a platform"
   - Select "Web"
   - Add: `https://your-app.vercel.app/auth/callback`
   - Click "Configure"

7. **Add to Vercel:**
   ```env
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_REDIRECT_URI=https://your-app.vercel.app/auth/callback
   AZURE_AUTHORITY=https://login.microsoftonline.com/common
   ```

8. **Test:**
   - Try Microsoft sign-in button
   - Should redirect to Microsoft login
   - After login, should redirect back with token

**Guide:** See `AZURE_TRAINING_AND_CONNECTION_GUIDE.md` Section 2 for detailed steps

**Code Location:**
- `server/services/azureAuth.ts` - Authentication service
- `server/routes/azureAuth.ts` - API routes
- Frontend component needed (can be added later)

---

## 📝 **ALL VERCEL ENVIRONMENT VARIABLES**

When you're ready for Azure, add these to Vercel:

```env
# Azure SQL Database
AZURE_SQL_SERVER=ecobite-server
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=ecobite-admin
AZURE_SQL_PASSWORD=your-password
AZURE_SQL_PORT=1433

# Azure Computer Vision
AZURE_COMPUTER_VISION_KEY=your-key
AZURE_COMPUTER_VISION_ENDPOINT=https://ecobite-vision.cognitiveservices.azure.com/

# Azure AD (Microsoft Login)
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_REDIRECT_URI=https://your-app.vercel.app/auth/callback
AZURE_AUTHORITY=https://login.microsoftonline.com/common
```

---

## ✅ **VERIFICATION CHECKLIST**

After setting up Azure:

### **Azure SQL Database:**
- [ ] Database created
- [ ] Connection string works
- [ ] Tables created automatically
- [ ] Data persists after restart

### **Azure Computer Vision:**
- [ ] Resource created
- [ ] API key works
- [ ] Image analysis works
- [ ] Food type detected correctly

### **Azure AD:**
- [ ] App registration created
- [ ] Client secret saved
- [ ] Redirect URIs configured
- [ ] Microsoft sign-in works

---

## 🎯 **CURRENT RECOMMENDATION**

**Do Now:**
1. ✅ Cloudinary (15 min) - Quick win
2. ✅ Environment variables (10 min)
3. ✅ Test & launch MVP

**Do Later (When Ready):**
1. 🔵 Azure SQL Database
2. 🔵 Azure Computer Vision  
3. 🔵 Azure AD

**All Azure code is ready!** Just add credentials when you're ready.

---

## 📚 **REFERENCE DOCUMENTS**

- **Detailed Guide:** `AZURE_TRAINING_AND_CONNECTION_GUIDE.md`
- **Integration Guide:** `AZURE_INTEGRATION_GUIDE.md`
- **Complete Setup:** `AZURE_COMPLETE_SETUP.md`

---

**Remember:** Your app works without Azure! Azure enhances features but isn't required for MVP launch.

