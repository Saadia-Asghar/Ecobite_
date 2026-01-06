# Azure Maps Azure AD Setup Guide

## ✅ What You Need to Do in Azure Portal

### **Step 1: Go to App Registrations (Not Enterprise Applications)**

The "Azure Maps" Enterprise Application you're looking at is the service itself, not your app.

1. In Azure Portal, search for **"Azure Active Directory"** or **"Microsoft Entra ID"**
2. Click on **"App registrations"** (left menu)
3. Look for your EcoBite app OR click **"+ New registration"** if you don't have one

---

### **Step 2: Get Your App Registration Details**

Once you're in your App Registration:

1. **Copy the Application (client) ID**
   - This is what you'll use for `VITE_AZURE_CLIENT_ID`
   - Example: `12345678-abcd-1234-abcd-123456789abc`

2. **Note the Directory (tenant) ID**
   - This is your `VITE_AZURE_TENANT_ID`
   - Or use `common` if you want to allow any Microsoft account

---

### **Step 3: Add Azure Maps API Permission**

1. In your App Registration, click **"API permissions"** (left menu)
2. Click **"+ Add a permission"**
3. Select **"APIs my organization uses"** tab
4. Search for: **"Azure Maps"**
5. Select **"Azure Maps"**
6. Select **"Delegated permissions"**
7. Check: **`user_impersonation`**
8. Click **"Add permissions"**
9. **IMPORTANT**: Click **"Grant admin consent"** for your organization (if you're an admin)

---

### **Step 4: Configure Redirect URIs**

1. In your App Registration, click **"Authentication"** (left menu)
2. Under **"Redirect URIs"**, add:
   - For development: `http://localhost:5173`
   - For production: `https://your-app.vercel.app`
   - For Vercel preview: `https://your-app-*.vercel.app`
3. Under **"Implicit grant and hybrid flows"**:
   - ✅ Check: **"Access tokens"**
   - ✅ Check: **"ID tokens"**
4. Click **"Save"**

---

### **Step 5: Add Environment Variables to Vercel**

Go to your Vercel project → Settings → Environment Variables and add:

```env
VITE_AZURE_CLIENT_ID=your_application_client_id_here
VITE_AZURE_TENANT_ID=your_tenant_id_or_common
```

**OR** (if using Microsoft client ID variable name):

```env
VITE_MICROSOFT_CLIENT_ID=your_application_client_id_here
VITE_AZURE_TENANT_ID=your_tenant_id_or_common
```

---

### **Step 6: Optional - Configure Azure Maps Account**

If you have an Azure Maps account:

1. Go to **Azure Portal** → Search **"Azure Maps Accounts"**
2. Select your Azure Maps account
3. Go to **"Access control (IAM)"**
4. Make sure your Azure AD app has appropriate permissions

---

## 🔍 How to Find Your App Registration

If you're not sure which app registration to use:

1. Go to **Azure Active Directory** → **App registrations**
2. Look for apps with:
   - Name like "EcoBite" or your app name
   - OR check the **"Owned applications"** tab
   - OR check your **"Enterprise applications"** for the app name

---

## ⚠️ Important Notes

- **Enterprise Application vs App Registration**:
  - **Enterprise Application** = The Azure Maps service itself (what you're looking at)
  - **App Registration** = Your application that will use Azure Maps

- **Application ID from Enterprise Application**:
  - The Application ID `ba1ea022-5807-41d5-bbeb-292c7e1cf5f6` you see is for Azure Maps service
  - You need YOUR app's Application ID, not this one

- **Multiple Apps**:
  - If you have multiple app registrations, use the one associated with your EcoBite project
  - Check the redirect URIs to match your Vercel URL

---

## 🧪 Test Your Configuration

After setting up:

1. Deploy to Vercel with the new environment variables
2. Check browser console for:
   - `✅ Azure Maps token acquired via Azure AD`
   - `🗺️ Initializing Azure Maps...`
   - `✅ Azure Maps loaded successfully`

3. If you see authentication errors, check:
   - API permissions are granted
   - Redirect URI matches your domain
   - Client ID is correct

---

## 📝 Quick Checklist

- [ ] Found your App Registration (not Enterprise Application)
- [ ] Copied Application (client) ID
- [ ] Added Azure Maps API permission (`user_impersonation`)
- [ ] Granted admin consent
- [ ] Configured redirect URIs (localhost + Vercel URLs)
- [ ] Enabled "Access tokens" and "ID tokens"
- [ ] Added `VITE_AZURE_CLIENT_ID` to Vercel
- [ ] Redeployed app after adding environment variables

---

## 🆘 Troubleshooting

**If map still shows white/blank:**

1. Check browser console for errors
2. Verify token is being acquired: Look for "Azure Maps token acquired"
3. Check network tab for failed authentication requests
4. Ensure API permission is granted (green checkmark)
5. Try clearing browser cache and cookies

**If authentication fails:**

1. Verify Client ID is correct
2. Check redirect URI matches exactly
3. Ensure admin consent was granted
4. Check that "Access tokens" is enabled in Authentication settings

