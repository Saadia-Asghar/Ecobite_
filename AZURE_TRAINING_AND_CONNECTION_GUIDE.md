# 🚀 Azure Complete Setup Guide - Training & Connection

**Complete step-by-step guide to connect Azure services and train the food recognition model**

---

## 📋 TABLE OF CONTENTS

1. [Azure Account Setup](#1-azure-account-setup)
2. [Microsoft Authentication Setup](#2-microsoft-authentication-setup)
3. [Azure Computer Vision Setup & Training](#3-azure-computer-vision-setup--training)
4. [Azure SQL Database Setup](#4-azure-sql-database-setup)
5. [Connect Everything](#5-connect-everything)
6. [Test Everything](#6-test-everything)

---

## 1. AZURE ACCOUNT SETUP

### **Step 1: Create Azure Account**

1. **Go to:** https://azure.microsoft.com/free/
2. **Click:** "Start free"
3. **Sign up** with your Microsoft account (or create one)
4. **Verify** phone number
5. **Add credit card** (won't be charged on free tier)
6. **Get:** $200 free credit for 30 days + 12 months of free services

**✅ Done!** You now have an Azure account.

---

## 2. MICROSOFT AUTHENTICATION SETUP

### **Step 1: Create App Registration**

1. **Go to:** https://portal.azure.com/
2. **Search:** "Azure Active Directory" (or "Microsoft Entra ID")
3. **Click:** "App registrations" (left menu)
4. **Click:** "+ New registration"

**Fill in:**
```
Name: EcoBite
Supported account types: 
  ✅ Accounts in any organizational directory and personal Microsoft accounts
Redirect URI:
  Platform: Web
  URI: http://localhost:5173/auth/callback
  Click "Add"
```

5. **Click:** "Register"
6. **Copy:** Application (client) ID → **SAVE THIS!**

### **Step 2: Create Client Secret**

1. **In your app, click:** "Certificates & secrets" (left menu)
2. **Click:** "+ New client secret"
3. **Description:** "EcoBite Production"
4. **Expires:** 24 months
5. **Click:** "Add"
6. **Copy:** Value → **SAVE THIS IMMEDIATELY!** (You won't see it again)

### **Step 3: Configure API Permissions**

1. **Click:** "API permissions" (left menu)
2. **Click:** "+ Add a permission"
3. **Select:** "Microsoft Graph"
4. **Select:** "Delegated permissions"
5. **Add these:**
   - ✅ `User.Read`
   - ✅ `email`
   - ✅ `profile`
   - ✅ `openid`
6. **Click:** "Add permissions"
7. **Click:** "Grant admin consent" (if you're admin)

### **Step 4: Add Redirect URI for Production**

1. **Click:** "Authentication" (left menu)
2. **Click:** "+ Add a platform"
3. **Select:** "Web"
4. **Add:** `https://yourdomain.com/auth/callback` (when you deploy)
5. **Click:** "Configure"

**✅ Microsoft Authentication configured!**

---

## 3. AZURE COMPUTER VISION SETUP & TRAINING

### **Step 1: Create Computer Vision Resource**

1. **Go to:** https://portal.azure.com/
2. **Click:** "Create a resource" (top left)
3. **Search:** "Computer Vision"
4. **Click:** "Create"

**Fill in:**
```
Subscription: Your subscription
Resource Group: Create new → "ecobite-rg"
Region: Choose closest (e.g., "East US", "West Europe")
Name: ecobite-vision (must be unique)
Pricing Tier: Free F0 (5,000 calls/month FREE!)
```

5. **Click:** "Review + create"
6. **Click:** "Create"
7. **Wait:** 1-2 minutes

### **Step 2: Get Keys and Endpoint**

1. **Go to:** Your Computer Vision resource
2. **Click:** "Keys and Endpoint" (left menu)
3. **Copy:**
   - **KEY 1** (or KEY 2)
   - **ENDPOINT** (looks like: `https://your-region.api.cognitive.microsoft.com/`)

**✅ Computer Vision ready!**

### **Step 3: Train Custom Model (Optional - For Better Food Recognition)**

**Option A: Use Pre-trained Model (Recommended for Start)**
- ✅ Already works out of the box!
- ✅ Recognizes food items automatically
- ✅ No training needed
- ✅ Good for prototype

**Option B: Train Custom Vision Model (For Production)**

1. **Go to:** https://www.customvision.ai/
2. **Sign in** with your Azure account
3. **Click:** "New Project"

**Fill in:**
```
Name: EcoBite Food Recognition
Description: Food waste recognition system
Resource: Select your Computer Vision resource
Project Types: Classification
Classification Types: Multiclass
Domains: Food
```

4. **Click:** "Create project"

5. **Add Training Images:**
   - Click "Add images"
   - Upload food images (at least 50 per category)
   - Tag them with food types:
     - Vegetables
     - Fruits
     - Bread
     - Prepared Meals
     - Dairy Products
     - Meat
     - Grains
   - Click "Upload"

6. **Train Model:**
   - Click "Train" button
   - Select "Quick Training" (free) or "Advanced Training"
   - Wait 5-10 minutes

7. **Get Prediction Endpoint:**
   - After training, click "Performance"
   - Click "Prediction URL"
   - Copy:
     - **Prediction Key**
     - **Project ID**
     - **Iteration Name**

**✅ Custom model trained!**

---

## 4. AZURE SQL DATABASE SETUP

### **Step 1: Create SQL Database**

1. **Go to:** https://portal.azure.com/
2. **Click:** "Create a resource"
3. **Search:** "SQL Database"
4. **Click:** "Create"

**Fill in:**
```
Subscription: Your subscription
Resource Group: Use existing → "ecobite-rg"
Database name: ecobite-db
Server: Create new
  Server name: ecobite-server-XXXX (must be globally unique, e.g., ecobite-server-2024)
  Location: Choose closest to you
  Authentication: SQL authentication
  Admin login: ecobiteadmin
  Password: [Create strong password - SAVE THIS!]
Compute + storage: Basic (2GB) - FREE for first 12 months!
```

5. **Click:** "Review + create"
6. **Click:** "Create"
7. **Wait:** 5-10 minutes

### **Step 2: Configure Firewall**

1. **Go to:** Your SQL Server (not database)
2. **Click:** "Networking" (left menu)
3. **Under "Firewall rules":**
   - ✅ Check: "Allow Azure services and resources to access this server"
   - Click: "Add your client IPv4 address"
   - For development: Click "Add 0.0.0.0 - 255.255.255.255" (NOT for production!)
4. **Click:** "Save"

### **Step 3: Get Connection String**

1. **Go to:** Your database (ecobite-db)
2. **Click:** "Connection strings" (left menu)
3. **Copy:** ADO.NET connection string
4. **Extract values:**
   - Server: `ecobite-server-XXXX.database.windows.net`
   - Database: `ecobite-db`
   - User: `ecobiteadmin`
   - Password: (the one you created)

**✅ Azure SQL Database ready!**

---

## 5. CONNECT EVERYTHING

### **Step 1: Update .env File**

Open `server/.env` and add:

```env
# ===================================
# MICROSOFT AUTHENTICATION (Azure AD)
# ===================================
AZURE_CLIENT_ID=your_client_id_from_step_2
AZURE_CLIENT_SECRET=your_client_secret_from_step_2
AZURE_AUTHORITY=https://login.microsoftonline.com/common
AZURE_REDIRECT_URI=http://localhost:5173/auth/callback
FRONTEND_URL=http://localhost:5173

# ===================================
# AZURE COMPUTER VISION
# ===================================
# Option A: Use Pre-trained Model (Recommended)
AZURE_COMPUTER_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_COMPUTER_VISION_KEY=your_key_from_step_3

# Option B: Use Custom Vision Model (If you trained one)
# AZURE_CUSTOM_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
# AZURE_CUSTOM_VISION_KEY=your_prediction_key
# AZURE_CUSTOM_VISION_PROJECT_ID=your_project_id
# AZURE_CUSTOM_VISION_ITERATION_NAME=your_iteration_name

# ===================================
# AZURE SQL DATABASE
# ===================================
AZURE_SQL_SERVER=ecobite-server-XXXX
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=ecobiteadmin
AZURE_SQL_PASSWORD=your_password_here
AZURE_SQL_PORT=1433

# ===================================
# EXISTING CONFIG (Keep these)
# ===================================
PORT=3002
JWT_SECRET=your-jwt-secret-here
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Step 2: Restart Server**

```bash
cd server
npm run dev
```

**Check logs for:**
- ✅ "Microsoft Authentication initialized"
- ✅ "Azure Computer Vision initialized"
- ✅ "Connected to PostgreSQL database" (or Azure SQL)

---

## 6. TEST EVERYTHING

### **Test 1: Microsoft Sign-In**

1. **Start server:** `cd server && npm run dev`
2. **Start frontend:** `npm run dev`
3. **Go to:** http://localhost:5173/login
4. **Click:** "Sign in with Microsoft"
5. **Sign in** with your Microsoft account
6. **Should redirect** back and log you in!

**✅ Microsoft Authentication working!**

### **Test 2: Food Image Scanning**

1. **Go to:** Donation form
2. **Upload** a food image
3. **Check server logs** for:
   - "✅ Azure Computer Vision analysis complete"
4. **Should see:**
   - Real food type detected
   - Quality score
   - Description

**✅ Food scanning working!**

### **Test 3: Azure SQL Database**

1. **Create a user account** via registration
2. **Check Azure Portal:**
   - Go to your SQL Database
   - Click "Query editor"
   - Login with your SQL credentials
   - Run: `SELECT * FROM users;`
   - Should see your user!

**✅ Database working!**

---

## 🎯 QUICK REFERENCE

### **All Azure Services:**

| Service | Free Tier | What It Does |
|---------|-----------|--------------|
| **Azure AD** | ✅ Unlimited | Microsoft sign-in |
| **Computer Vision** | ✅ 5,000/month | Food image scanning |
| **Azure SQL** | ✅ 12 months free | Database |
| **Custom Vision** | ✅ 2 projects free | Train custom models |

### **Cost After Free Tier:**

- Azure AD: **FREE forever**
- Computer Vision: $1 per 1,000 images
- Azure SQL: ~$5/month (Basic tier)
- **Total: ~$5/month**

---

## 🐛 TROUBLESHOOTING

### **Microsoft Sign-In Not Working:**

1. **Check redirect URI matches exactly:**
   - Azure Portal → App Registration → Authentication
   - Must match: `http://localhost:5173/auth/callback`

2. **Check API permissions:**
   - Must have: User.Read, email, profile, openid
   - Must grant admin consent

3. **Check .env variables:**
   ```bash
   echo $AZURE_CLIENT_ID
   echo $AZURE_CLIENT_SECRET
   ```

### **Computer Vision Not Working:**

1. **Check endpoint format:**
   - Should be: `https://your-region.api.cognitive.microsoft.com/`
   - NOT: `https://your-region.cognitiveservices.azure.com/`

2. **Check key:**
   - Use KEY 1 or KEY 2 from Azure Portal

3. **Check free tier limits:**
   - Free tier: 5,000 calls/month
   - Check usage in Azure Portal

### **Azure SQL Not Connecting:**

1. **Check firewall:**
   - Azure Portal → SQL Server → Networking
   - Must allow your IP or Azure services

2. **Check connection string:**
   - Server must include `.database.windows.net`
   - Password must be correct

3. **Check SSL:**
   - Azure SQL requires SSL
   - Code already handles this

---

## 📚 ADDITIONAL RESOURCES

- **Azure Portal:** https://portal.azure.com/
- **Custom Vision:** https://www.customvision.ai/
- **Azure AD Docs:** https://docs.microsoft.com/azure/active-directory/
- **Computer Vision Docs:** https://docs.microsoft.com/azure/cognitive-services/computer-vision/

---

## ✅ CHECKLIST

### **Microsoft Authentication:**
- [ ] Azure AD app registered
- [ ] Client ID saved
- [ ] Client secret saved
- [ ] API permissions configured
- [ ] Redirect URI added
- [ ] .env variables set

### **Computer Vision:**
- [ ] Computer Vision resource created
- [ ] Endpoint copied
- [ ] Key copied
- [ ] .env variables set
- [ ] (Optional) Custom model trained

### **Azure SQL:**
- [ ] SQL Database created
- [ ] Firewall configured
- [ ] Connection string saved
- [ ] .env variables set

### **Testing:**
- [ ] Microsoft sign-in works
- [ ] Food image scanning works
- [ ] Database connection works

---

## 🎊 SUCCESS!

**You now have:**
- ✅ Microsoft Authentication
- ✅ Azure AI for food scanning
- ✅ Azure SQL Database
- ✅ All connected and working!

**Your EcoBite app is production-ready!** 🚀

---

**Need help? Check the code comments or Azure documentation!**

