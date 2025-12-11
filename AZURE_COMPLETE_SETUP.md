# 🚀 Azure Complete Integration Guide - EcoBite

**Date:** December 2024  
**Services:** Microsoft Authentication, Azure Computer Vision, Azure SQL Database  
**Cost:** FREE tier available for all services!

---

## 🎯 WHAT WE'RE INTEGRATING

1. ✅ **Microsoft Authentication (Azure AD)** - Sign in with Microsoft account
2. ✅ **Azure Computer Vision** - AI-powered food image scanning
3. ✅ **Azure SQL Database** - Production database
4. ✅ **Other Azure Services** - Recommendations included

---

## 📋 PREREQUISITES

### **What You Need:**
- [ ] Microsoft Azure account (FREE tier available)
- [ ] 30-60 minutes of setup time

### **Costs:**
- Azure AD: **FREE** (up to 50,000 users)
- Azure Computer Vision: **FREE** (5,000 images/month)
- Azure SQL Database: **FREE** (Basic tier, first 12 months) or ~$5/month
- **Total: $0-5/month** 💰

---

## 🚀 PART 1: MICROSOFT AUTHENTICATION (Azure AD)

### **Step 1: Create Azure AD App Registration**

1. **Go to:** https://portal.azure.com/
2. **Click:** "Azure Active Directory" (or search for it)
3. **Click:** "App registrations" (left menu)
4. **Click:** "+ New registration"

**Configuration:**
```
Name: EcoBite
Supported account types: Accounts in any organizational directory and personal Microsoft accounts
Redirect URI: 
  - Platform: Web
  - URI: http://localhost:5173/auth/callback
  - Click "Add"
```

5. **Click:** "Register"
6. **Copy:** Application (client) ID - **SAVE THIS!**

### **Step 2: Create Client Secret**

1. **In your app registration, click:** "Certificates & secrets" (left menu)
2. **Click:** "+ New client secret"
3. **Description:** "EcoBite Production Secret"
4. **Expires:** 24 months (or your preference)
5. **Click:** "Add"
6. **Copy:** Value - **SAVE THIS IMMEDIATELY!** (You won't see it again)

### **Step 3: Configure API Permissions**

1. **Click:** "API permissions" (left menu)
2. **Click:** "+ Add a permission"
3. **Select:** "Microsoft Graph"
4. **Select:** "Delegated permissions"
5. **Add these permissions:**
   - `User.Read`
   - `email`
   - `profile`
   - `openid`
6. **Click:** "Add permissions"
7. **Click:** "Grant admin consent" (if you're an admin)

### **Step 4: Add to .env**

Add to your `server/.env` file:
```env
# Microsoft Authentication (Azure AD)
AZURE_CLIENT_ID=your_client_id_here
AZURE_CLIENT_SECRET=your_client_secret_here
AZURE_AUTHORITY=https://login.microsoftonline.com/common
AZURE_REDIRECT_URI=http://localhost:5173/auth/callback
FRONTEND_URL=http://localhost:5173
```

**For Production:**
```env
AZURE_REDIRECT_URI=https://yourdomain.com/auth/callback
FRONTEND_URL=https://yourdomain.com
```

---

## 🚀 PART 2: AZURE COMPUTER VISION (Food Image Scanning)

### **Step 1: Create Computer Vision Resource**

1. **Go to:** https://portal.azure.com/
2. **Click:** "Create a resource"
3. **Search:** "Computer Vision"
4. **Click:** "Create"

**Configuration:**
```
Subscription: Your subscription
Resource Group: Create new → "ecobite-rg"
Region: Choose closest to you
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
   - KEY 1 (or KEY 2)
   - ENDPOINT

### **Step 3: Add to .env**

```env
# Azure Computer Vision
AZURE_COMPUTER_VISION_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_COMPUTER_VISION_KEY=your_key_here
```

---

## 🚀 PART 3: AZURE SQL DATABASE

### **Step 1: Create SQL Database**

1. **Go to:** https://portal.azure.com/
2. **Click:** "Create a resource"
3. **Search:** "SQL Database"
4. **Click:** "Create"

**Configuration:**
```
Subscription: Your subscription
Resource Group: Use existing → "ecobite-rg"
Database name: ecobite-db
Server: Create new
  Server name: ecobite-server-XXXX (must be globally unique)
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
   - Click: "Add 0.0.0.0 - 255.255.255.255" (for development - NOT recommended for production)
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

### **Step 4: Add to .env**

```env
# Azure SQL Database
AZURE_SQL_SERVER=ecobite-server-XXXX
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=ecobiteadmin
AZURE_SQL_PASSWORD=your_password_here
AZURE_SQL_PORT=1433
```

**OR use connection string format:**
```env
# Alternative: Full connection string
AZURE_SQL_CONNECTION_STRING=Server=tcp:ecobite-server-XXXX.database.windows.net,1433;Initial Catalog=ecobite-db;Persist Security Info=False;User ID=ecobiteadmin;Password=your_password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## 🎨 PART 4: FRONTEND INTEGRATION

### **Step 1: Install MSAL Browser**

```bash
npm install @azure/msal-browser
```

### **Step 2: Create Microsoft Sign-In Component**

Create `src/components/auth/MicrosoftSignIn.tsx`:

```typescript
import { useMsal } from '@azure/msal-browser';
import { Microsoft } from 'lucide-react';

export default function MicrosoftSignIn() {
    const { instance } = useMsal();

    const handleSignIn = async () => {
        try {
            // Get auth URL from backend
            const response = await fetch('http://localhost:3002/api/auth/microsoft/url');
            const { url } = await response.json();
            
            // Redirect to Microsoft login
            window.location.href = url;
        } catch (error) {
            console.error('Microsoft sign-in error:', error);
        }
    };

    return (
        <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
            <Microsoft className="w-5 h-5" />
            <span>Sign in with Microsoft</span>
        </button>
    );
}
```

### **Step 3: Add to Login Page**

In your login page, add the Microsoft sign-in button:

```typescript
import MicrosoftSignIn from '../components/auth/MicrosoftSignIn';

// In your login form:
<div className="mt-4">
    <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
    </div>
    <MicrosoftSignIn />
</div>
```

### **Step 4: Handle Callback**

Create `src/pages/AuthCallback.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (token) {
            setToken(token);
            localStorage.setItem('ecobite_token', token);
            navigate('/dashboard', { replace: true });
        } else {
            const error = searchParams.get('message');
            navigate('/login', { 
                replace: true,
                state: { error: error || 'Authentication failed' }
            });
        }
    }, [searchParams, navigate, setToken]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p>Completing sign-in...</p>
            </div>
        </div>
    );
}
```

---

## ✅ TESTING

### **Test Microsoft Sign-In:**

1. Start server: `cd server && npm run dev`
2. Start frontend: `npm run dev`
3. Go to login page
4. Click "Sign in with Microsoft"
5. Sign in with your Microsoft account
6. Should redirect back and log you in!

### **Test Azure Computer Vision:**

1. Upload a food image in donation form
2. Check server logs for "✅ Azure Computer Vision analysis complete"
3. Should see real food type and description!

### **Test Azure SQL Database:**

1. Check server logs for "✅ Connected to PostgreSQL database"
2. Create a user account
3. Check Azure portal → SQL Database → Query editor
4. Run: `SELECT * FROM users;`
5. Should see your user!

---

## 🔧 TROUBLESHOOTING

### **Microsoft Sign-In Not Working:**

1. **Check .env variables:**
   ```bash
   echo $AZURE_CLIENT_ID
   echo $AZURE_CLIENT_SECRET
   ```

2. **Check redirect URI matches:**
   - Azure Portal → App Registration → Authentication
   - Must match exactly: `http://localhost:5173/auth/callback`

3. **Check API permissions:**
   - Azure Portal → App Registration → API permissions
   - Must have: User.Read, email, profile, openid

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

1. **Check firewall rules:**
   - Azure Portal → SQL Server → Networking
   - Must allow your IP or Azure services

2. **Check connection string:**
   - Server name must include `.database.windows.net`
   - Password must be correct

3. **Check SSL:**
   - Azure SQL requires SSL
   - Code already handles this

---

## 📊 OTHER AZURE SERVICES YOU CAN USE

### **1. Azure Blob Storage (Image Storage)**
- **Free Tier:** 5GB storage, 20,000 read operations/month
- **Use for:** Storing donation images, payment proofs
- **Cost:** FREE (up to limits)

### **2. Azure OpenAI (Content Generation)**
- **Free Tier:** $200 credit for 30 days
- **Use for:** Generating marketing content, impact stories
- **Cost:** Pay-as-you-go after free credit

### **3. Azure App Service (Hosting)**
- **Free Tier:** 1GB storage, 1GB outbound data/month
- **Use for:** Hosting your backend API
- **Cost:** FREE (with limitations)

### **4. Azure Notification Hubs (Push Notifications)**
- **Free Tier:** 500 devices, 1 million pushes/month
- **Use for:** Push notifications to mobile apps
- **Cost:** FREE (up to limits)

### **5. Azure Cognitive Services Text Analytics**
- **Free Tier:** 5,000 transactions/month
- **Use for:** Sentiment analysis, keyword extraction
- **Cost:** FREE (up to limits)

---

## 📋 FINAL CHECKLIST

### **Microsoft Authentication:**
- [ ] Azure AD app registered
- [ ] Client ID saved
- [ ] Client secret saved
- [ ] API permissions configured
- [ ] Redirect URI added
- [ ] Environment variables set

### **Azure Computer Vision:**
- [ ] Computer Vision resource created
- [ ] Endpoint copied
- [ ] Key copied
- [ ] Environment variables set

### **Azure SQL Database:**
- [ ] SQL Database created
- [ ] Firewall configured
- [ ] Connection string saved
- [ ] Environment variables set

### **Testing:**
- [ ] Microsoft sign-in works
- [ ] Food image scanning works
- [ ] Database connection works
- [ ] All features functional

---

## 🎊 SUCCESS!

**You now have:**
- ✅ Microsoft Authentication (Azure AD)
- ✅ Azure Computer Vision (Food scanning)
- ✅ Azure SQL Database (Production database)
- ✅ All integrated and working!

**Cost:** $0-5/month (mostly FREE!)

---

## 📚 RESOURCES

- **Azure Portal:** https://portal.azure.com/
- **Azure AD Docs:** https://docs.microsoft.com/azure/active-directory/
- **Computer Vision Docs:** https://docs.microsoft.com/azure/cognitive-services/computer-vision/
- **Azure SQL Docs:** https://docs.microsoft.com/azure/azure-sql/

---

**Questions? Check the code comments or Azure documentation!**

