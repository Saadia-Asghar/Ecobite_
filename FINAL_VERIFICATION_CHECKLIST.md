# ✅ Final Verification Checklist - Will It Work?

## 🔍 Quick Status Check

After granting admin consent in Azure Portal, verify these final steps:

---

## ✅ STEP 1: Azure Portal (You Just Did This)

- [x] Azure Maps `user_impersonation` permission is **GRANTED** ✅
- [ ] Verify it shows "Granted for Default Directory" (not just three dots)
- [ ] All Microsoft Graph permissions show "Granted"

---

## ✅ STEP 2: Azure Portal - Redirect URIs (CRITICAL)

**Go to:** Your App Registration → **"Authentication"** (left menu)

### **Check/Add these Redirect URIs:**

1. **Development:**
   - `http://localhost:5173`

2. **Production:**
   - `https://your-app.vercel.app` (replace with your actual Vercel URL)

3. **Vercel Preview URLs** (optional but recommended):
   - `https://*.vercel.app`

### **Under "Implicit grant and hybrid flows":**
- ✅ **Access tokens** - MUST be checked
- ✅ **ID tokens** - MUST be checked

**Click "Save"**

---

## ✅ STEP 3: Vercel Environment Variables (REQUIRED)

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

### **Add these variables:**

```env
VITE_AZURE_CLIENT_ID=your_application_client_id_from_azure_portal
VITE_AZURE_TENANT_ID=your_tenant_id_or_common
```

**OR** (if using Microsoft naming):

```env
VITE_MICROSOFT_CLIENT_ID=your_application_client_id_from_azure_portal
VITE_AZURE_TENANT_ID=your_tenant_id_or_common
```

### **How to get these values:**

1. **Client ID:**
   - Azure Portal → App Registrations → Your EcoBite App
   - Copy the **"Application (client) ID"** from Overview page

2. **Tenant ID:**
   - Azure Portal → App Registrations → Your EcoBite App
   - Copy the **"Directory (tenant) ID"** from Overview page
   - OR use `common` to allow any Microsoft account

### **Important:**
- ✅ Add these for **Production**, **Preview**, AND **Development**
- ✅ After adding, **REDEPLOY** your app on Vercel

---

## ✅ STEP 4: Redeploy Your App

**After adding environment variables:**

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. OR push a new commit to trigger automatic deployment
4. Wait for deployment to complete

---

## ✅ STEP 5: Test the Map

After deployment:

1. **Open your live app** on Vercel
2. **Open browser Developer Tools** (F12)
3. **Go to Console tab**
4. **Navigate to a page with the map**

### **Look for these console messages:**

✅ **Success indicators:**
```
✅ Azure Maps token acquired via Azure AD
🗺️ Initializing Azure Maps...
📍 Container dimensions: [width] x [height]
✅ Azure Maps loaded successfully
```

❌ **Error indicators:**
```
❌ Missing VITE_AZURE_CLIENT_ID
❌ Failed to get Azure Maps token
❌ Authentication Error
```

---

## 🐛 Troubleshooting

### **Issue: "Missing VITE_AZURE_CLIENT_ID"**

**Solution:**
- Check Vercel environment variables are set
- Redeploy after adding variables
- Verify variable names match exactly (case-sensitive)

### **Issue: "Authentication Error" or "Failed to get token"**

**Solution:**
1. Check redirect URI matches your Vercel URL exactly
2. Verify admin consent was granted
3. Check that "Access tokens" is enabled in Authentication settings
4. Verify Client ID is correct

### **Issue: Map still shows white/blank**

**Solution:**
1. Check browser console for errors
2. Verify token is being acquired (look for "token acquired" message)
3. Check network tab for failed requests
4. Try clearing browser cache

### **Issue: Redirect URI mismatch**

**Solution:**
- The redirect URI in Azure Portal must **exactly** match your app URL
- Include protocol: `https://` or `http://`
- No trailing slash
- Check both production and preview URLs

---

## ✅ Final Checklist

Before saying "it should work", verify:

- [ ] Azure Maps permission is **GRANTED** (not just added)
- [ ] Redirect URIs are configured correctly
- [ ] "Access tokens" is enabled in Authentication
- [ ] Environment variables added to Vercel
- [ ] App redeployed after adding variables
- [ ] Console shows "token acquired" message
- [ ] No authentication errors in console

---

## 🎯 What Should Happen

When everything is configured correctly:

1. **User opens app** → No errors
2. **Map component loads** → Gets Azure AD token silently
3. **Map initializes** → Azure Maps renders successfully
4. **Map displays** → Shows map tiles, markers, etc.

---

## 📊 Status Indicators

### **✅ Working:**
- Map displays correctly
- Console shows success messages
- No errors in console or network tab
- Tokens being acquired successfully

### **⚠️ Partially Working:**
- Map shows but no tiles
- Console shows token but map errors
- Check Azure Maps account configuration

### **❌ Not Working:**
- White/blank map
- Authentication errors in console
- Missing environment variables
- Permission not granted

---

## 🚀 Quick Test

**Run this in browser console on your live app:**

```javascript
// Check if environment variable is loaded
console.log('Client ID:', import.meta.env.VITE_AZURE_CLIENT_ID || 'MISSING');
```

If it shows "MISSING", environment variables aren't set correctly.

---

## ✨ Summary

**For it to work, you need:**

1. ✅ Permissions granted (you just did this)
2. ⚠️ Redirect URIs configured (check this)
3. ⚠️ Environment variables in Vercel (add these)
4. ⚠️ App redeployed (after adding variables)
5. ⚠️ Test and verify (check console)

**Most common issue:** Forgetting to redeploy after adding environment variables!

