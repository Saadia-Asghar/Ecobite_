# Google Maps Setup Guide - Quick & Easy!

**Time:** 15 minutes  
**Cost:** FREE ($200 credit/month)  
**Status:** ✅ READY TO IMPLEMENT

---

## 🚀 STEP-BY-STEP SETUP

### **Step 1: Create Google Cloud Account (5 min)**

1. **Go to:** https://console.cloud.google.com/
2. **Click:** "Get started for free"
3. **Sign in:** With your Google account
4. **Enter:** Billing information (won't be charged - $200 free credit!)
5. **Agree:** To terms and conditions
6. **Click:** "Start my free trial"

✅ **You now have $200 free credit per month!**

---

### **Step 2: Create Project (2 min)**

1. **Click:** "Select a project" (top bar)
2. **Click:** "NEW PROJECT"
3. **Project name:** "EcoBite"
4. **Click:** "CREATE"
5. **Wait:** 10-20 seconds
6. **Select:** Your new project

---

### **Step 3: Enable APIs (3 min)**

1. **Click:** "APIs & Services" → "Library" (left menu)

2. **Search:** "Maps JavaScript API"
   - Click on it
   - Click "ENABLE"
   - Wait 10 seconds

3. **Search:** "Places API"
   - Click on it
   - Click "ENABLE"
   - Wait 10 seconds

4. **Search:** "Geocoding API"
   - Click on it
   - Click "ENABLE"
   - Wait 10 seconds

5. **Search:** "Directions API"
   - Click on it
   - Click "ENABLE"
   - Wait 10 seconds

✅ **All APIs enabled!**

---

### **Step 4: Create API Key (3 min)**

1. **Click:** "APIs & Services" → "Credentials" (left menu)
2. **Click:** "+ CREATE CREDENTIALS"
3. **Select:** "API key"
4. **Copy:** Your API key (looks like: `AIzaSyC...`)
5. **Save it** somewhere safe!

---

### **Step 5: Restrict API Key (2 min)**

**IMPORTANT for security!**

1. **Click:** "RESTRICT KEY" (or edit the key you just created)

2. **Application restrictions:**
   - Select: "HTTP referrers (web sites)"
   - Click: "ADD AN ITEM"
   - Add: `http://localhost:5173/*`
   - Click: "ADD AN ITEM"
   - Add: `https://yourdomain.com/*` (when you deploy)

3. **API restrictions:**
   - Select: "Restrict key"
   - Check these APIs:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
     - ✅ Directions API

4. **Click:** "SAVE"

✅ **API key secured!**

---

### **Step 6: Add to Your Project (2 min)**

1. **Create `.env` file** in project root (if not exists):
```bash
cd d:\ecobite_
copy .env.example .env
```

2. **Open `.env` file** and add:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC...your_actual_key_here...
```

3. **Save** the file

---

### **Step 7: Test It! (1 min)**

1. **Start your app:**
```bash
# Terminal 1 - Backend
cd d:\ecobite_\server
npm run dev

# Terminal 2 - Frontend
cd d:\ecobite_
npm run dev
```

2. **Open:** http://localhost:5173

3. **Go to:** Donations page or Dashboard

4. **See:** Real Google Maps with donation markers! 🗺️

---

## ✅ WHAT YOU GET

### **Real-Time Map Features:**
- ✅ Live donation markers
- ✅ Click markers for details
- ✅ Green = Available
- ✅ Gray = Claimed
- ✅ Blue = Your location
- ✅ Auto-updates every 30 seconds
- ✅ Beautiful info windows
- ✅ Smooth animations

### **Map Shows:**
- Food type
- Quantity
- Donor name
- Expiry date
- Status
- Description
- "View Details" button

---

## 💰 COST

### **Free Tier:**
- $200 credit per month
- ~28,000 map loads/month FREE
- ~40,000 geocoding requests/month FREE
- Perfect for starting!

### **After Free Credit:**
- $7 per 1,000 map loads
- But you get $200 free every month!
- So effectively FREE for most apps

---

## 🎯 USAGE IN YOUR APP

### **Component Already Created:**
```typescript
import RealTimeMap from './components/map/RealTimeMap';

// Use anywhere:
<RealTimeMap />
```

### **API Endpoint Already Created:**
```
GET /api/donations/map

Returns:
[
  {
    id: "donation-123",
    lat: 31.5204,
    lng: 74.3587,
    foodType: "Vegetables",
    quantity: "5 kg",
    donorName: "John Doe",
    donorRole: "restaurant",
    expiry: "2024-12-15",
    status: "available"
  },
  ...
]
```

---

## 🔧 TROUBLESHOOTING

### **Map not showing?**
```
1. Check API key in .env file
2. Make sure it starts with: AIzaSy...
3. Restart your dev server
4. Clear browser cache
```

### **"This page can't load Google Maps correctly"?**
```
1. Check if APIs are enabled
2. Check if API key restrictions allow localhost
3. Check browser console for errors
```

### **No markers showing?**
```
1. Make sure donations have lat/lng coordinates
2. Check browser console
3. Check API endpoint: http://localhost:3002/api/donations/map
```

---

## 📱 MOBILE RESPONSIVE

The map is fully responsive:
- Desktop: 600px height
- Tablet: 500px height
- Mobile: 400px height
- Touch-friendly markers
- Pinch to zoom

---

## 🎨 CUSTOMIZATION

### **Change Map Style:**
```typescript
// In RealTimeMap.tsx
const mapOptions = {
    styles: [
        // Add custom map styles
        // Get styles from: https://snazzymaps.com/
    ]
};
```

### **Change Marker Colors:**
```typescript
const getMarkerIcon = (status: string) => {
    return {
        fillColor: status === 'available' ? '#10b981' : '#6b7280',
        // Change colors here
    };
};
```

---

## ✅ FINAL CHECKLIST

- [ ] Google Cloud account created
- [ ] Project created
- [ ] APIs enabled (4 APIs)
- [ ] API key created
- [ ] API key restricted
- [ ] Added to .env file
- [ ] App restarted
- [ ] Map showing!

---

## 🎊 YOU'RE DONE!

**Your EcoBite platform now has:**
- ✅ Real-time Google Maps
- ✅ Live donation markers
- ✅ Beautiful info windows
- ✅ Auto-updates
- ✅ Mobile responsive
- ✅ Professional look

**All for FREE!** 🎉

---

## 📚 NEXT STEPS

### **Add More Features:**
- Route planning (directions)
- Distance calculation
- Nearby donations
- Filter by food type
- Search locations

### **All APIs are already enabled!**

---

**Enjoy your real-time donation map!** 🗺️🍽️💚
