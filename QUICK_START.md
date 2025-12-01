# 🚀 EcoBite Quick Start Guide

## Get Running in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Application
```bash
npm run dev
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:5173**

That's it! The app is running with mock AI data.

---

## 🎯 Try These Features

### 1. **Create a Donation** (AI-Powered)
1. Click "Get Started" or "Login" (no auth required for demo)
2. Go to `/dashboard/donate`
3. Paste an image URL or upload a file
4. Watch AI auto-detect food type and quality
5. Submit your donation

**Test Image URLs:**
- `https://images.unsplash.com/photo-1509440159596-0249088772ff`
- `https://images.unsplash.com/photo-1546069901-ba9599a7e63c`

### 2. **Browse Donations**
1. Navigate to `/dashboard/browse`
2. See all donations with AI quality scores
3. Filter by status (All/Available/Claimed)
4. Notice the purple sparkle AI indicators

### 3. **Create a Food Request** (AI Content Generation)
1. Go to `/dashboard/request`
2. Enter food type (e.g., "Rice")
3. Enter quantity (e.g., "50 meals")
4. Submit and see 3 AI-generated social media posts
5. Copy any post to clipboard

### 4. **View Your Impact**
1. Return to `/dashboard`
2. Read your AI-generated weekly impact story
3. Check your stats (CO2 saved, meals served, points)

### 5. **Explore Rewards**
1. Navigate to `/dashboard/rewards`
2. View badge progress
3. Browse vouchers
4. See what you can redeem with your points

---

## 🔧 Enable Real Azure AI (Optional)

### Prerequisites
- Azure account
- Azure OpenAI resource
- Azure Custom Vision resource

### Configuration
1. Copy `.env.example` to `.env`
2. Fill in your Azure credentials:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo

AZURE_CUSTOM_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_CUSTOM_VISION_KEY=your_key_here
AZURE_CUSTOM_VISION_PROJECT_ID=your_project_id
AZURE_CUSTOM_VISION_ITERATION_NAME=Iteration1
```
3. Restart the server: `npm run dev`
4. AI features now use real Azure services!

---

## 📱 Navigation Guide

### Main Dashboard Routes
- `/` - Landing page
- `/login` - Login page (demo mode)
- `/dashboard` - Overview with AI impact story
- `/dashboard/donate` - Create donation (AI analysis)
- `/dashboard/browse` - Browse all donations
- `/dashboard/request` - Create food request (AI drafts)
- `/dashboard/history` - Activity timeline
- `/dashboard/rewards` - Badges and vouchers
- `/dashboard/settings` - User settings

---

## 🎨 UI Features to Notice

### AI Indicators
- **Purple sparkle icon** (✨) = AI-powered feature
- **Quality scores** with color coding
- **"AI Verified"** badges on donations

### Animations
- Smooth page transitions
- Card hover effects
- Progress bar animations
- Loading states

### Responsive Design
- Works on desktop, tablet, and mobile
- Collapsible sidebar on mobile
- Adaptive grid layouts

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Kill any process on port 3001
npx kill-port 3001

# Try again
npm run dev
```

### Database issues?
```bash
# Delete and recreate database
del ecobite.db
npm run dev
```

### Frontend not loading?
```bash
# Clear node modules and reinstall
rmdir /s /q node_modules
npm install
npm run dev
```

---

## 💡 Pro Tips

1. **Test AI Features**: Use the URL input in donation form for real Azure testing
2. **Mock Mode**: Works perfectly without any Azure setup
3. **Explore All Views**: Each dashboard section has unique features
4. **Check Console**: Server logs show AI service status
5. **Impact Story**: Refreshes on each dashboard visit

---

## 📊 Sample Data

The app starts with an empty database. Create your first donation to see it populate!

**Suggested Test Flow:**
1. Create 2-3 donations with different food types
2. Browse them in the donations list
3. Create a food request as an NGO
4. Check your history
5. View rewards and badges

---

## 🎉 You're Ready!

The EcoBite platform is now running with:
- ✅ Full dashboard system
- ✅ AI-powered features (mock or real)
- ✅ Gamification system
- ✅ Impact tracking
- ✅ Beautiful UI

**Start making an impact! 🌱**

---

## 📚 Need More Help?

- Check `README.md` for detailed documentation
- See `IMPLEMENTATION_SUMMARY.md` for technical details
- Review `.env.example` for configuration options

**Happy food rescuing! 🍽️**
