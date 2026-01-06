# EcoBite App - Azure Portal Permissions Checklist

## ✅ Current Status (Based on Your Screenshot)

### **Already Configured:**
- ✅ **Microsoft Graph** - `email` (Granted)
- ✅ **Microsoft Graph** - `offline_access` (Granted) 
- ✅ **Microsoft Graph** - `openid` (Granted)
- ✅ **Microsoft Graph** - `profile` (Granted)
- ⚠️ **Azure Maps** - `user_impersonation` (ADDED but NOT GRANTED)

---

## 🔴 CRITICAL: Grant Admin Consent for Azure Maps

### **Step 1: Grant Admin Consent**

1. On the **API permissions** page (where you are now)
2. Look at the **Azure Maps** section
3. You'll see `user_impersonation` with three dots (`...`) in the Status column
4. **Check the box** at the top that says: **"Grant admin consent for Default Directory"**
5. Click the **blue "Grant admin consent"** button (should appear when you check the box)
6. Confirm the pop-up that appears

**After granting consent, the status should change to:**
- `Granted for Default Directory...` ✅

---

## ✅ Complete List of Required Permissions

### **Microsoft Graph Permissions (Delegated):**

| Permission | Status | Required For |
|------------|--------|--------------|
| ✅ `User.Read` | ⚠️ **CHECK IF MISSING** | Microsoft Sign-in, User Profile |
| ✅ `email` | ✅ Granted | Email Address Access |
| ✅ `profile` | ✅ Granted | Basic Profile Info |
| ✅ `openid` | ✅ Granted | OpenID Connect Sign-in |
| ✅ `offline_access` | ✅ Granted | Refresh Tokens |

### **Azure Maps Permissions (Delegated):**

| Permission | Status | Required For |
|------------|--------|--------------|
| ⚠️ `user_impersonation` | **NEEDS ADMIN CONSENT** | Azure Maps Display |

---

## 📋 Step-by-Step Actions to Take RIGHT NOW

### **Action 1: Check for User.Read Permission**

1. Scroll down in your **API permissions** list
2. Look under **Microsoft Graph** section
3. Check if `User.Read` is listed
4. If **MISSING**, do this:
   - Click **"+ Add a permission"**
   - Select **"Microsoft Graph"**
   - Select **"Delegated permissions"**
   - Search for: `User.Read`
   - Check: **`User.Read`** (View users' basic profile)
   - Click **"Add permissions"**

### **Action 2: Grant Admin Consent for Azure Maps**

**THIS IS THE MOST IMPORTANT STEP:**

1. At the top of the **API permissions** page
2. Find the checkbox: **"Grant admin consent for Default Directory"**
3. **CHECK THE BOX** ✅
4. Click the **"Grant admin consent for Default Directory"** button
5. You'll see a confirmation pop-up, click **"Yes"**
6. Wait for the success message

**After this, Azure Maps `user_impersonation` should show:**
```
Status: Granted for Default Directory...
```

### **Action 3: Verify All Permissions Are Granted**

After granting consent, verify:
- ✅ All Microsoft Graph permissions show "Granted"
- ✅ Azure Maps `user_impersonation` shows "Granted"
- ✅ No warnings or errors

---

## 🔍 If User.Read is Missing

If `User.Read` is not in your list:

1. Click **"+ Add a permission"**
2. Select **"Microsoft Graph"**
3. Select **"Delegated permissions"**
4. Search: `User.Read`
5. Select: **User.Read** (View users' basic profile)
6. Click **"Add permissions"**
7. Grant admin consent again

---

## ✅ Final Verification Checklist

After completing all steps, verify:

- [ ] All Microsoft Graph permissions show "Granted"
  - [ ] `User.Read` (if not already present, add it)
  - [ ] `email` ✅
  - [ ] `profile` ✅
  - [ ] `openid` ✅
  - [ ] `offline_access` ✅

- [ ] Azure Maps permission shows "Granted"
  - [ ] `user_impersonation` ✅ (Currently shows three dots - needs admin consent)

- [ ] No error messages or warnings

---

## 🚨 Common Issues

### **Issue: "Grant admin consent" button is disabled/grayed out**
- **Solution:** You may not have admin rights. Contact your Azure AD admin to grant consent.

### **Issue: After granting consent, still shows three dots**
- **Solution:** Refresh the page and check again. It should update within a few seconds.

### **Issue: Can't find "Grant admin consent" button**
- **Solution:** Look for a checkbox at the top that says "Grant admin consent for Default Directory". Check it first, then the button appears.

---

## 📝 Summary: What You Need to Do

1. **IMMEDIATE:** Grant admin consent for Azure Maps `user_impersonation`
2. **CHECK:** Verify `User.Read` is in Microsoft Graph permissions (add if missing)
3. **VERIFY:** All permissions show "Granted" status
4. **TEST:** Deploy to Vercel and test the map

---

## 🎯 Expected Result

After completing these steps:

- All permissions should have ✅ **"Granted"** status
- Azure Maps will work with Azure AD authentication
- Microsoft Sign-in will work properly
- No authentication errors in your app

---

## ⚡ Quick Fix (Copy-Paste Checklist)

```
[ ] 1. Check box: "Grant admin consent for Default Directory"
[ ] 2. Click "Grant admin consent" button
[ ] 3. Verify Azure Maps user_impersonation shows "Granted"
[ ] 4. Check if User.Read exists in Microsoft Graph permissions
[ ] 5. If User.Read missing, add it and grant consent again
[ ] 6. Verify all permissions show "Granted"
[ ] 7. Refresh page to confirm
```

