# 🚀 Deploying EcoBite to Vercel with Environment Variables

## 📋 **Overview**

This guide explains how to deploy EcoBite to Vercel while keeping your credentials secure.

---

## 🔐 **Security Best Practices**

### **✅ DO:**
- Store credentials in Vercel Environment Variables
- Use `.env.example` as a template
- Keep `.env` in `.gitignore`
- Use different credentials for production vs development

### **❌ DON'T:**
- Commit `.env` files to GitHub
- Hardcode credentials in source code
- Share credentials in documentation
- Use the same credentials for dev and production

---

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Ensure `.gitignore` is correct:**
   ```
   node_modules
   dist
   .env
   .env.local
   .env.production
   ecobite.db
   *.log
   YOUR_SMTP_CREDENTIALS.md
   *CREDENTIALS*.md
   ```

2. **Commit `.env.example`:**
   ```bash
   git add .env.example
   git commit -m "Add environment variables template"
   git push
   ```

---

### **Step 2: Deploy to Vercel**

#### **Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Vite (or your framework)
   - **Root Directory:** `./` (or your project root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### **Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

### **Step 3: Add Environment Variables in Vercel**

1. **Go to your project in Vercel Dashboard**
2. Click **Settings** → **Environment Variables**
3. **Add each variable:**

#### **Required Variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview, Development |
| `SMTP_PORT` | `587` | Production, Preview, Development |
| `SMTP_SECURE` | `false` | Production, Preview, Development |
| `SMTP_USER` | `your-email@gmail.com` | Production, Preview, Development |
| `SMTP_PASSWORD` | `your-app-password` | Production, Preview, Development |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Production |
| `BACKEND_URL` | `https://your-api.vercel.app` | Production |
| `JWT_SECRET` | `your-strong-random-string` | Production, Preview, Development |

#### **Optional Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production only |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production only |
| `DATABASE_URL` | `postgresql://...` | If using external DB |
| `GOOGLE_MAPS_API_KEY` | `AIza...` | For map features |

4. **Click "Save"** for each variable

---

### **Step 4: Redeploy**

After adding environment variables:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger automatic deployment

---

## 🔧 **Environment-Specific Configuration**

### **Local Development (`.env`):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-dev-app-password
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3002
```

### **Production (Vercel Dashboard):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-production-app-password
FRONTEND_URL=https://ecobite.vercel.app
BACKEND_URL=https://ecobite-api.vercel.app
```

---

## 📊 **Accessing Environment Variables in Code**

### **Backend (Node.js):**
```typescript
// server/services/email.ts
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
};
```

### **Frontend (Vite):**
```typescript
// Only variables prefixed with VITE_ are exposed to frontend
const apiUrl = import.meta.env.VITE_API_URL;
```

**Note:** For Vite, prefix public variables with `VITE_`:
```env
VITE_API_URL=https://your-api.vercel.app
VITE_GOOGLE_MAPS_KEY=your-public-key
```

---

## 🧪 **Testing Environment Variables**

### **Test Locally:**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Then run:
npm run dev
```

### **Test on Vercel:**
1. Deploy to preview branch
2. Check deployment logs for errors
3. Test email functionality
4. Verify all features work

---

## 🔍 **Troubleshooting**

### **Environment Variables Not Working?**

1. **Check variable names:**
   - Must match exactly (case-sensitive)
   - No spaces around `=`
   - No quotes needed in Vercel dashboard

2. **Redeploy after adding variables:**
   - Variables only apply to new deployments
   - Click "Redeploy" in Vercel dashboard

3. **Check deployment logs:**
   - Go to Deployments → Click deployment → View logs
   - Look for errors related to missing variables

4. **Verify in Vercel:**
   - Settings → Environment Variables
   - Make sure they're set for correct environment

---

## 📱 **Multiple Environments**

Vercel supports three environments:

### **Production:**
- Deployed from `main` branch
- Use production credentials
- Public-facing URL

### **Preview:**
- Deployed from pull requests
- Use staging credentials
- Preview URL (e.g., `app-git-feature.vercel.app`)

### **Development:**
- Local development
- Use development credentials
- `localhost`

---

## 🔒 **Security Checklist**

- [ ] `.env` is in `.gitignore`
- [ ] No credentials in source code
- [ ] `.env.example` has placeholder values only
- [ ] Production uses different credentials than development
- [ ] SMTP password is a Gmail App Password (not regular password)
- [ ] JWT_SECRET is a strong random string
- [ ] All sensitive variables are in Vercel dashboard
- [ ] Old exposed credentials have been revoked

---

## 📚 **Additional Resources**

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid API Keys](https://docs.sendgrid.com/ui/account-and-settings/api-keys)

---

## ✅ **Summary**

1. **Never commit** `.env` files to GitHub
2. **Always use** `.env.example` as a template
3. **Store credentials** in Vercel Dashboard → Environment Variables
4. **Use different credentials** for production vs development
5. **Redeploy** after adding/changing environment variables

---

**Your credentials are safe and your app will deploy successfully!** 🎉
