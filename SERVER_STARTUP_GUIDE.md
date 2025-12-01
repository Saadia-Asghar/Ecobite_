# EcoBite - Backend Server Startup Guide

## Quick Start

### Option 1: Start Both Frontend and Backend Together (Recommended)
```bash
npm run dev
```
This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3001

### Option 2: Start Backend Only
```bash
npm run server
```

### Option 3: Manual Start
```bash
npx ts-node server/index.ts
```

## Troubleshooting

### If the server doesn't start:

1. **Check if Node.js is installed:**
   ```bash
   node --version
   ```
   Should show v18 or higher

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Check if port 3001 is already in use:**
   ```bash
   netstat -ano | findstr :3001
   ```
   If something is using port 3001, kill that process or change the PORT in server/index.ts

4. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

5. **Try running with more verbose output:**
   ```bash
   set DEBUG=* && npm run server
   ```

## Expected Output

When the server starts successfully, you should see:
```
✅ Database initialized
✅ Server running on http://localhost:3001
✅ API available at http://localhost:3001/api
```

## Testing the Server

Once running, test with:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T...",
  "version": "1.0.0"
}
```

## Location Autocomplete Feature

The location autocomplete now supports detailed Pakistani addresses including:
- House numbers (e.g., House No.92-D)
- Plot numbers (e.g., Plot No.123)
- Street numbers (e.g., Street No.54)
- Sectors (e.g., Sector G-6/4)
- Cities (e.g., Islamabad, Lahore, Karachi)

### Example addresses that work:
- `House No.92-D, Street No.54, Sector G-6/4, Islamabad`
- `Plot No.45, Street 12, DHA Phase 5, Lahore`
- `Flat 3B, Building 7, Gulshan-e-Iqbal, Karachi`

The autocomplete will:
1. Prioritize Pakistani locations
2. Show up to 8 suggestions
3. Allow manual entry of any address
4. Work even if exact match isn't found in the database
