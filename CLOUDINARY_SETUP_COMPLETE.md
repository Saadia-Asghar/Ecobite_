# ✅ Cloudinary Setup - Add Your Credentials

**Status:** Ready to configure!  
**Your Credentials:** Already obtained from Cloudinary dashboard

---

## 🔑 **YOUR CLOUDINARY CREDENTIALS**

From your Cloudinary dashboard:
- **Cloud Name:** `dqlqezcm9`
- **API Key:** `696234811429463`
- **API Secret:** `5IPEBGtf8P2n5yzvhHXeIACINfs`

---

## 📝 **STEP 1: Add to Vercel Environment Variables**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your EcoBite project

2. **Navigate to Settings:**
   - Click on your project
   - Click "Settings" (top menu)
   - Click "Environment Variables" (left sidebar)

3. **Add These 3 Variables:**

   **Variable 1:**
   ```
   Name: CLOUDINARY_CLOUD_NAME
   Value: dqlqezcm9
   Environment: Production, Preview, Development (select all)
   ```

   **Variable 2:**
   ```
   Name: CLOUDINARY_API_KEY
   Value: 696234811429463
   Environment: Production, Preview, Development (select all)
   ```

   **Variable 3:**
   ```
   Name: CLOUDINARY_API_SECRET
   Value: 5IPEBGtf8P2n5yzvhHXeIACINfs
   Environment: Production, Preview, Development (select all)
   ```

4. **Save:**
   - Click "Save" after each variable
   - Or click "Add" for each one

5. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger deployment

---

## 🧪 **STEP 2: Test Cloudinary (After Deployment)**

After redeploying, test if Cloudinary is working:

1. **Check Configuration:**
   ```bash
   curl https://your-app.vercel.app/api/images/config
   ```
   
   Should return:
   ```json
   {
     "cloudinaryConfigured": true,
     "message": "Cloudinary is configured and ready to use"
   }
   ```

2. **Test Image Upload:**
   - Go to your app
   - Try uploading an image in a donation form
   - Check Vercel logs for: `✅ Image uploaded to Cloudinary: https://...`
   - Image should appear in Cloudinary dashboard

---

## 📋 **STEP 3: Verify in Cloudinary Dashboard**

1. **Go to:** https://console.cloudinary.com/
2. **Click:** "Media Library" (left menu)
3. **Check:** Images should appear in `ecobite/` folder after uploads

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Added `CLOUDINARY_CLOUD_NAME` to Vercel
- [ ] Added `CLOUDINARY_API_KEY` to Vercel
- [ ] Added `CLOUDINARY_API_SECRET` to Vercel
- [ ] Redeployed on Vercel
- [ ] Tested `/api/images/config` endpoint
- [ ] Tested image upload
- [ ] Verified images in Cloudinary dashboard

---

## 🎯 **WHAT HAPPENS NOW**

Once configured:
- ✅ All image uploads go to Cloudinary
- ✅ Images are optimized automatically
- ✅ Images served via CDN (fast loading)
- ✅ Images persist in cloud (not lost on restart)
- ✅ 25GB free storage available

---

## 🔒 **SECURITY NOTE**

✅ **Good:** Credentials are in Vercel (secure)  
✅ **Good:** Not committed to Git  
⚠️ **Note:** Keep API Secret private - don't share it

---

## 📚 **CODE LOCATION**

Your Cloudinary code is already implemented:
- ✅ `server/services/imageStorage.ts` - Main service
- ✅ `server/routes/images.ts` - API endpoints
- ✅ Integrated in donation routes

**No code changes needed!** Just add the environment variables.

---

## 🚀 **NEXT STEPS**

After Cloudinary is working:
1. ✅ Test image uploads
2. ✅ Verify images persist
3. ✅ Move to next priority task
4. 🔵 Azure setup (when ready)

---

**Status:** Ready to configure! Just add credentials to Vercel. 🎉

