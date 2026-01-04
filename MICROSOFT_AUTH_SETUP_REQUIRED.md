# Microsoft Authentication Setup - Required Configuration

## ⚠️ Important: Microsoft Authentication Requires Environment Variables

Your Microsoft authentication feature is currently **not configured**. The code is ready, but you need to set up Azure AD and configure environment variables in Vercel.

## 🔧 Step 1: Set Up Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **"+ New registration"**
4. Fill in:
   - **Name**: EcoBite
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `https://ecobite-iota.vercel.app/api/auth/microsoft/callback`
5. Click **Register**

## 🔑 Step 2: Get Your Credentials

After registration:
1. **Copy the Application (client) ID** - This is your `AZURE_CLIENT_ID`
2. Go to **Certificates & secrets** → **"+ New client secret"**
   - Description: "EcoBite Production"
   - Expires: 24 months (recommended)
   - Click **Add**
   - **COPY THE VALUE IMMEDIATELY** (you won't see it again) - This is your `AZURE_CLIENT_SECRET`

## 🔐 Step 3: Configure API Permissions

1. Go to **API permissions**
2. Click **"+ Add a permission"**
3. Select **Microsoft Graph** → **Delegated permissions**
4. Add these permissions:
   - `User.Read`
   - `email`
   - `profile`
   - `openid`
5. Click **Add permissions**
6. Click **Grant admin consent** (if you have admin rights)

## 🌐 Step 4: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **ecobite** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (for **Production**, **Preview**, and **Development**):

```env
AZURE_CLIENT_ID=your-application-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-value-here
AZURE_REDIRECT_URI=https://ecobite-iota.vercel.app/api/auth/microsoft/callback
```

**OR use the alternative variable names:**
```env
AZURE_AUTH_CLIENT_ID=your-application-client-id-here
AZURE_AUTH_CLIENT_SECRET=your-client-secret-value-here
AZURE_REDIRECT_URI=https://ecobite-iota.vercel.app/api/auth/microsoft/callback
```

## ✅ Step 5: Redeploy

After adding the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete

## 🧪 Step 6: Test

1. Go to your signup/login page
2. Click **"Continue with Microsoft"** button
3. You should be redirected to Microsoft login
4. After login, you'll be redirected back to your app

## ❌ Current Status Without Configuration

Currently, when Microsoft authentication is not configured:
- The button will show an error: "Microsoft Authentication not configured"
- The error is handled gracefully (503 Service Unavailable)
- The app continues to work normally
- Users can still use email/password authentication

## 🔍 Troubleshooting

If you still see errors after configuration:

1. **Check Vercel Logs**: Go to your Vercel deployment → **Runtime Logs** to see detailed error messages
2. **Verify Redirect URI**: Make sure the redirect URI in Azure matches exactly: `https://ecobite-iota.vercel.app/api/auth/microsoft/callback`
3. **Check Environment Variables**: Ensure they're set for the correct environment (Production/Preview/Development)
4. **Verify Permissions**: Make sure admin consent was granted for the API permissions

## 📝 Alternative: Disable Microsoft Auth

If you don't want to use Microsoft authentication right now:

1. The code will automatically handle missing configuration
2. Users will see an error if they try to use Microsoft login
3. Email/password authentication will continue to work
4. You can configure it later when ready

---

**Note**: Microsoft Authentication is optional. Your app works fine without it - users can still sign up and log in using email/password.

