# 🚀 Quick Start Guide

## Start the Application

### Option 1: Use the Batch File (Easiest)
1. Double-click `START_APP.bat` in the project folder
2. Wait for both servers to start
3. Browser will open automatically at http://localhost:5173

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd "d:\hi gemini"
npx tsc -p tsconfig.server.json
node dist/server/index.js
```
✓ Backend runs on **http://localhost:3002**

**Terminal 2 - Frontend:**
```bash
cd "d:\hi gemini"
npx vite
```
✓ Frontend runs on **http://localhost:5173**

## Access the App
Open your browser to: **http://localhost:5173**

## Troubleshooting

### "Connection Refused" Error
- Make sure both servers are running
- Check that ports 3002 and 3173 are not in use
- Look for error messages in the terminal windows

### Backend Won't Start
```bash
# Reinstall dependencies
npm install

# Rebuild backend
npx tsc -p tsconfig.server.json
```

### Frontend Won't Start
```bash
# Clear cache and restart
npx vite --force
```

## Stop the Servers
- Close the terminal windows
- Or press `Ctrl+C` in each terminal

## Test the Features

1. **Signup** - Create account with any role
2. **Quick Actions** - Click "+ Donate Food" or "Browse Nearby Needs"
3. **Add Donation** - Fill form and submit
4. **Claim Donation** - Click "Claim Donation" button
5. **View Donations** - Filter by All/Available/Claimed

All buttons should now work! 🎉
