# Azure Maps Interactive App Setup Guide

## ✅ What You Need to Configure in Azure Portal

For Azure Maps to work with interactive authentication, you need to configure your Azure AD app registration properly.

---

## 🔧 Step 1: Configure Authentication Settings

**Go to:** Azure Portal → App Registrations → Your EcoBite App → **"Authentication"**

### **1. Add Redirect URIs:**

Under **"Single-page application"** or **"Web"** platform, add:

**For Development:**
```
http://localhost:5173
```

**For Production:**
```
https://your-app.vercel.app
https://asghars-projects.vercel.app
```

**For Vercel Preview URLs:**
```
https://*.vercel.app
```

### **2. Enable Implicit Grant and Hybrid Flows:**

Under **"Implicit grant and hybrid flows"** section:

- ✅ **Check: "Access tokens"** (REQUIRED for Azure Maps)
- ✅ **Check: "ID tokens"** (REQUIRED for authentication)

**Why these are needed:**
- Access tokens allow your app to call Azure Maps API
- ID tokens are needed for user authentication

### **3. Click "Save"**

---

## 🔑 Step 2: Verify API Permissions

**Go to:** Azure Portal → App Registrations → Your EcoBite App → **"API permissions"**

Make sure you have:

- ✅ **Azure Maps** → `user_impersonation` → **Status: Granted**
- ✅ **Microsoft Graph** → `User.Read`, `email`, `profile`, `openid`, `offline_access` → **Status: Granted**

If not granted, click **"Grant admin consent"**

---

## 🌐 Step 3: Set Environment Variables in Vercel

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, AND **Development**:

```env
VITE_AZURE_CLIENT_ID=your_application_client_id_here
VITE_AZURE_TENANT_ID=your_tenant_id_or_common
```

**OR** (if using Microsoft naming):

```env
VITE_MICROSOFT_CLIENT_ID=your_application_client_id_here
VITE_AZURE_TENANT_ID=your_tenant_id_or_common
```

### **How to get these values:**

1. **Client ID:**
   - Azure Portal → App Registrations → Your EcoBite App
   - Copy **"Application (client) ID"** from Overview page

2. **Tenant ID:**
   - Azure Portal → App Registrations → Your EcoBite App
   - Copy **"Directory (tenant) ID"** from Overview page
   - OR use `common` to allow any Microsoft account

---

## 🔄 Step 4: How Interactive Authentication Works

### **Authentication Flow:**

1. **First Time User:**
   - Map tries to get token silently
   - If no account found → Redirects to Microsoft login
   - User signs in → Redirected back to your app
   - Token stored in session → Map loads

2. **Returning User:**
   - Map gets token silently from cache
   - If token expired → Automatically refreshes
   - If refresh fails → Interactive login popup or redirect

3. **Fallback:**
   - If Azure AD fails → Falls back to subscription key (if configured)
   - If both fail → Shows error message

---

## ✅ Step 5: Redeploy Your App

**After adding environment variables:**

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. OR push a new commit to trigger automatic deployment
4. Wait for deployment to complete

---

## 🧪 Step 6: Test the Interactive Login

1. **Clear browser cache and cookies** (important!)
2. **Open your live app** on Vercel
3. **Open browser Developer Tools** (F12) → Console tab
4. **Navigate to a page with the map**

### **Expected Console Messages:**

**On First Load:**
```
🗺️ Initializing Azure Maps...
🔄 Redirecting to login for Azure Maps authentication...
```

**After Redirect (returning from Microsoft login):**
```
✅ MSAL redirect handled successfully
Azure Maps token acquired via redirect
✅ Azure Maps token acquired via Azure AD
🗺️ Initializing Azure Maps...
✅ Azure Maps loaded successfully
```

**On Subsequent Loads (token cached):**
```
✅ Azure Maps token acquired silently
🗺️ Initializing Azure Maps...
✅ Azure Maps loaded successfully
```

---

## 🐛 Troubleshooting

### **Issue: "Redirect URI mismatch"**

**Solution:**
- Make sure redirect URI in Azure Portal **exactly** matches your app URL
- Include protocol: `https://` or `http://`
- No trailing slash
- Check both development and production URLs

### **Issue: "Access tokens not enabled"**

**Solution:**
- Go to Authentication → Implicit grant
- ✅ Check "Access tokens"
- ✅ Check "ID tokens"
- Click Save

### **Issue: Map still shows white/blank after login**

**Solution:**
1. Check browser console for errors
2. Verify token is in sessionStorage: `sessionStorage.getItem('msal.account.keys')`
3. Clear cache and try again
4. Check that API permissions are granted

### **Issue: Popup blocked**

**Solution:**
- The code will automatically fall back to redirect if popup is blocked
- This is normal and expected behavior
- User will be redirected to Microsoft login page

### **Issue: "Failed to get Azure Maps token"**

**Possible causes:**
1. Environment variables not set in Vercel
2. Client ID incorrect
3. API permissions not granted
4. Redirect URI mismatch

**Check:**
1. Verify environment variables are set
2. Redeploy after adding variables
3. Check API permissions are granted
4. Verify redirect URI matches exactly

---

## 📝 Quick Checklist

- [ ] Redirect URIs added in Azure Portal (localhost + Vercel URL)
- [ ] "Access tokens" enabled in Authentication settings
- [ ] "ID tokens" enabled in Authentication settings
- [ ] Azure Maps API permission granted
- [ ] Environment variables added to Vercel
- [ ] App redeployed after adding variables
- [ ] Browser cache cleared
- [ ] Tested on live app

---

## 🎯 What Happens Now

1. **User opens app** → Map component loads
2. **First time:** Redirects to Microsoft login
3. **User signs in** → Redirected back to app
4. **Token acquired** → Map initializes and displays
5. **Next time:** Token retrieved silently from cache

---

## 💡 Tips

- **Development:** Use `http://localhost:5173` as redirect URI
- **Production:** Use your actual Vercel URL
- **Testing:** Clear browser cache between tests
- **Debugging:** Check browser console for detailed logs

---

## 🆘 Still Not Working?

1. **Check browser console** for specific error messages
2. **Verify redirect URI** matches exactly (including protocol)
3. **Test in incognito mode** to avoid cache issues
4. **Check Azure Portal** logs for authentication errors
5. **Verify environment variables** are set correctly

