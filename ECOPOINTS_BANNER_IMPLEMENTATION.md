# EcoPoints Banner Auto-Generation & Workflow Integration

## Overview
This document outlines the implementation of auto-generated EcoPoints banners and full workflow integration for the sponsor banner system.

## 1. EcoPoints Awarded Banners Section

### Concept
When users (restaurants, NGOs, shelters, fertilizer companies) accumulate enough EcoPoints, they can claim a banner slot. The system should:
- Automatically detect when users reach EcoPoints thresholds
- Allow users to claim banner slots
- Auto-generate banners in a dedicated "Awarded Banners" section
- Admin can approve/reject these banner requests

### EcoPoints Banner Tiers
```typescript
const ECOPOINTS_BANNER_TIERS = [
  { 
    points: 5000, 
    duration: 7, // days
    name: "Bronze Banner Week",
    description: "7-day banner placement"
  },
  { 
    points: 10000, 
    duration: 14,
    name: "Silver Banner Fortnight",
    description: "14-day banner placement"
  },
  { 
    points: 20000, 
    duration: 30,
    name: "Gold Banner Month",
    description: "30-day banner placement"
  },
  { 
    points: 50000, 
    duration: 90,
    name: "Platinum Banner Quarter",
    description: "90-day banner placement"
  }
];
```

### User Flow
1. User accumulates EcoPoints through donations/activities
2. System shows notification: "You've earned a banner slot!"
3. User goes to Rewards → Ads tab
4. Sees available tiers based on their points
5. Clicks "Claim Banner" on desired tier
6. Fills in banner details (name, logo, description, link)
7. Points are reserved (not deducted yet)
8. Request goes to Admin for approval
9. Admin approves → Banner goes live, points deducted
10. Admin rejects → Points refunded

### Admin Dashboard Section
**Location:** Sponsors tab, above regular banners

**"EcoPoints Awarded Banners" Section:**
- Shows all banners earned through EcoPoints
- Filter by status (Pending, Active, Expired)
- Filter by user/organization
- Quick actions: Approve, Reject, Extend duration
- Analytics per awarded banner

## 2. Backend API Integration (Workflow)

### Current Status
✅ Backend routes exist:
- `/api/banners` - CRUD operations
- `/api/ad-redemptions` - Redemption requests
- `/api/notifications` - User notifications

### What Needs Integration

#### A. Banner CRUD Operations
**Current:** Frontend uses mock data
**Needed:** Connect to actual API

```typescript
// CREATE
POST /api/banners
Body: { name, type, imageUrl, logoUrl, content, description, link, placement, targetDashboards, campaignName, status, startDate, endDate, awardType, ecoPointsCost }

// READ
GET /api/banners
Response: Array of banners

// UPDATE
PUT /api/banners/:id
Body: Updated banner fields

// DELETE
DELETE /api/banners/:id

// TOGGLE STATUS
PUT /api/banners/:id/toggle
```

#### B. EcoPoints Redemption Flow
**Current:** Partially implemented
**Needed:** Complete integration

```typescript
// User claims EcoPoints banner
POST /api/ad-redemptions
Body: {
  userId,
  packageId, // tier level
  pointsCost,
  durationMinutes,
  bannerData: {
    name,
    type,
    placement,
    logoUrl,
    content,
    description,
    link,
    targetDashboards
  }
}

// Admin approves
POST /api/ad-redemptions/:id/approve
Body: { bannerId } // Created banner ID

// Admin rejects
POST /api/ad-redemptions/:id/reject
Body: { reason }
```

#### C. Notifications
**Needed:** Trigger notifications for:
- User reaches EcoPoints threshold
- Banner request approved
- Banner request rejected
- Banner about to expire (24h warning)
- Banner expired

```typescript
POST /api/notifications
Body: {
  userId,
  type: 'ecopoints_banner_eligible' | 'banner_approved' | 'banner_rejected' | 'banner_expiring' | 'banner_expired',
  title,
  message,
  actionUrl
}
```

## 3. Implementation Plan

### Phase 1: EcoPoints Awarded Banners Section (Frontend)
**File:** `AdminDashboard.tsx`

1. Add new section above regular banners grid
2. Filter redemption requests where `awardType === 'ecopoints'`
3. Show pending requests with user details
4. Show active EcoPoints banners separately
5. Add approve/reject handlers

### Phase 2: Backend Integration
**Files:** `AdminDashboard.tsx`, `RewardsView.tsx`

1. Replace mock `handleSaveBanner` with API call
2. Replace mock `handleDeleteBanner` with API call
3. Integrate `fetchBanners()` on component mount
4. Integrate `fetchRedemptionRequests()` on component mount
5. Update approval/rejection to use real API

### Phase 3: Auto-Detection & Notifications
**Files:** Backend routes, `RewardsView.tsx`

1. Add EcoPoints tier display in RewardsView
2. Show "Claim Banner" buttons for eligible tiers
3. Implement claim flow with API integration
4. Add notification triggers in backend
5. Display notifications in NotificationsPanel

### Phase 4: Awarded Banners Management
**File:** `AdminDashboard.tsx`

1. Create "EcoPoints Awarded Banners" section
2. List all banners where `awardType === 'ecopoints'`
3. Show user/organization who earned it
4. Display tier, duration, expiry date
5. Add extend duration feature
6. Add analytics per awarded banner

## 4. Database Schema Updates

### sponsor_banners table
```sql
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS startDate DATETIME;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS endDate DATETIME;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS targetDashboards TEXT;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS campaignName TEXT;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS awardType TEXT;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS ecoPointsCost INTEGER;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE sponsor_banners ADD COLUMN IF NOT EXISTS ownerId TEXT;
```

### ad_redemption_requests table
Already exists with:
- userId, packageId, pointsCost, durationMinutes
- bannerData (JSON), status, bannerId
- createdAt, approvedAt, rejectedAt

## 5. UI Components Needed

### A. EcoPoints Awarded Banners Section
```tsx
<div className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
  <h3>🏆 EcoPoints Awarded Banners</h3>
  
  {/* Pending Requests */}
  <div className="mb-6">
    <h4>Pending Approval ({pendingEcoPointsBanners.length})</h4>
    {/* List of pending requests */}
  </div>
  
  {/* Active Awarded Banners */}
  <div>
    <h4>Active ({activeEcoPointsBanners.length})</h4>
    {/* Grid of active banners */}
  </div>
</div>
```

### B. Tier Selection in RewardsView
```tsx
<div className="grid md:grid-cols-2 gap-4">
  {ECOPOINTS_BANNER_TIERS.map(tier => (
    <div key={tier.points} className={`p-6 rounded-xl ${userPoints >= tier.points ? 'bg-green-50' : 'bg-gray-50'}`}>
      <h4>{tier.name}</h4>
      <p>{tier.description}</p>
      <p className="text-2xl font-bold">{tier.points} EcoPoints</p>
      <button 
        disabled={userPoints < tier.points}
        onClick={() => handleClaimBanner(tier)}
      >
        {userPoints >= tier.points ? 'Claim Now' : 'Locked'}
      </button>
    </div>
  ))}
</div>
```

## 6. Testing Checklist

### User Flow
- [ ] User sees available tiers in Rewards
- [ ] User can claim banner with sufficient points
- [ ] Points are reserved (not deducted)
- [ ] Request appears in Admin dashboard
- [ ] Admin can approve request
- [ ] Banner goes live on approval
- [ ] Points are deducted on approval
- [ ] Admin can reject request
- [ ] Points are refunded on rejection

### Admin Flow
- [ ] See pending EcoPoints banner requests
- [ ] See active EcoPoints banners
- [ ] Approve/reject requests
- [ ] View analytics per awarded banner
- [ ] Extend banner duration
- [ ] Filter by user/status

### Notifications
- [ ] User notified when eligible for tier
- [ ] User notified on approval
- [ ] User notified on rejection
- [ ] User notified 24h before expiry
- [ ] User notified on expiry

## 7. Next Steps

1. **Immediate:** Create EcoPoints Awarded Banners section in AdminDashboard
2. **Short-term:** Integrate backend API calls
3. **Medium-term:** Add tier selection UI in RewardsView
4. **Long-term:** Implement auto-detection and notifications

## 8. Benefits

**For Users:**
- Earn advertising through platform engagement
- No monetary cost for promotion
- Incentivizes EcoPoints accumulation
- Promotes sustainable behavior

**For Admins:**
- Automated reward system
- Increased user engagement
- Quality control through approval process
- Analytics on awarded banners

**For Platform:**
- User retention
- Increased activity
- Community building
- Sustainable growth

---

**Status:** Ready for implementation
**Priority:** High
**Estimated Time:** 4-6 hours for complete implementation
