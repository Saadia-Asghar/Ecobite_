# Sponsor Banner System - Complete Implementation Plan

## Overview
This document outlines the complete implementation of the enhanced sponsor banner system with advanced features including scheduling, targeting, campaign analytics, and EcoPoints-based awards.

## ✅ Phase 1: Data Structure (COMPLETED)

### Enhanced SponsorBanner Interface
- ✅ Added `startDate` and `endDate` for scheduling
- ✅ Added `targetDashboards` array for dashboard targeting
- ✅ Added `campaignName` for campaign tracking
- ✅ Added `awardType` (ecopoints, purchased, sponsored)
- ✅ Added `ecoPointsCost` for EcoPoints-based ads
- ✅ Added `status` field (draft, scheduled, active, paused, completed, expired)
- ✅ Updated mock data with sample campaigns

## 🔄 Phase 2: Admin Dashboard UI Enhancements (IN PROGRESS)

### 2.1 Banner Form Enhancements
**Location:** `AdminDashboard.tsx` - Banner Form Modal

#### Fields to Add:
1. **Campaign Name** (text input)
   - Required field
   - Helps organize and track campaigns

2. **Start Date & Time** (datetime-local input)
   - Schedule when banner becomes active
   - Optional (immediate start if not set)

3. **End Date & Time** (datetime-local input)
   - Schedule when banner expires
   - Optional (runs indefinitely if not set)

4. **Dashboard Targeting** (multi-select checkboxes)
   - Options: All Dashboards, Individual, Restaurant, NGO, Shelter, Fertilizer
   - Default: All Dashboards

5. **Award Type** (select dropdown)
   - Options: Sponsored, Purchased, EcoPoints Award
   - Determines how the banner was acquired

6. **Status** (select dropdown)
   - Options: Draft, Scheduled, Active, Paused
   - Controls banner visibility

### 2.2 Quick Actions on Banner Cards
**Location:** Banner grid display

#### Actions to Add:
1. **Toggle Active/Pause** (switch button)
   - Quick toggle without opening form
   - Updates status immediately via API

2. **View Analytics** (button)
   - Opens analytics modal for specific campaign
   - Shows detailed metrics

3. **Duplicate Campaign** (button)
   - Creates copy of banner for new campaign
   - Useful for recurring promotions

### 2.3 Filter Section
**Location:** Above banner grid

#### Filters to Implement:
1. **Status Filter** (dropdown)
   - All, Active, Paused, Scheduled, Expired, Draft

2. **User/Organization Filter** (dropdown)
   - All, or specific user/organization
   - Shows banners owned by specific entities

3. **Campaign Filter** (dropdown)
   - All, or specific campaign name
   - Groups banners by campaign

4. **Award Type Filter** (dropdown)
   - All, Sponsored, Purchased, EcoPoints

5. **Date Range Filter** (date inputs)
   - Filter by start/end dates
   - Useful for historical analysis

## 🎯 Phase 3: EcoPoints-Based Banner Awards

### 3.1 Awarded Banners Section
**Location:** New section in Sponsors tab

#### Features:
1. **EcoPoints Threshold System**
   - Define point thresholds for banner awards
   - Example: 5000 points = 7 days banner, 10000 points = 30 days

2. **Automatic Award Detection**
   - Monitor user EcoPoints
   - Trigger notification when threshold reached

3. **Award Redemption Interface**
   - User can claim banner slot
   - Choose duration based on points
   - Submit banner content for approval

4. **Admin Approval Workflow**
   - Review awarded banner requests
   - Approve/reject with feedback
   - Activate approved banners

### 3.2 EcoPoints Tiers
```typescript
const ECOPOINTS_BANNER_TIERS = [
  { points: 5000, duration: 7, name: "Bronze Banner" },
  { points: 10000, duration: 14, name: "Silver Banner" },
  { points: 20000, duration: 30, name: "Gold Banner" },
  { points: 50000, duration: 90, name: "Platinum Banner" }
];
```

## 📊 Phase 4: Campaign Analytics Dashboard

### 4.1 Campaign Overview
**Location:** New "Analytics" sub-tab in Sponsors

#### Metrics to Display:
1. **Total Campaigns** - Count of all campaigns
2. **Active Campaigns** - Currently running
3. **Total Impressions** - Across all campaigns
4. **Total Clicks** - Across all campaigns
5. **Average CTR** - Click-through rate
6. **Top Performing Campaign** - Highest CTR

### 4.2 Per-Campaign Analytics
**Location:** Campaign detail modal

#### Detailed Metrics:
1. **Performance Over Time**
   - Line chart showing impressions/clicks by day
   - Date range selector

2. **Dashboard Distribution**
   - Pie chart showing which dashboards got most views
   - Helps optimize targeting

3. **Engagement Metrics**
   - Total impressions
   - Total clicks
   - CTR percentage
   - Average time to click

4. **ROI Metrics** (for purchased banners)
   - Cost per impression
   - Cost per click
   - Estimated conversion value

### 4.3 Comparative Analytics
**Location:** Analytics overview

#### Comparisons:
1. **Campaign Comparison**
   - Side-by-side metrics for multiple campaigns
   - Identify best performers

2. **Time Period Comparison**
   - Compare current vs previous period
   - Track growth trends

## 🔔 Phase 5: Notification System

### 5.1 Banner Activation Notifications
**Triggers:**
1. When admin activates a banner
2. When scheduled banner goes live
3. When banner is about to expire (24h warning)
4. When banner expires

**Notification Content:**
```typescript
{
  type: 'banner_activated',
  title: 'Your Banner is Live!',
  message: 'Your campaign "{campaignName}" is now active and visible to users.',
  bannerId: 'banner-id',
  timestamp: '2024-12-07T...'
}
```

### 5.2 EcoPoints Award Notifications
**Triggers:**
1. When user reaches EcoPoints threshold
2. When awarded banner is approved
3. When awarded banner is rejected

**Notification Content:**
```typescript
{
  type: 'ecopoints_banner_eligible',
  title: 'Congratulations! You\'ve Earned a Banner Slot',
  message: 'You have {points} EcoPoints. Claim your {tier} banner now!',
  actionUrl: '/dashboard/rewards?tab=ads',
  timestamp: '2024-12-07T...'
}
```

## 🔧 Phase 6: Backend API Updates

### 6.1 New Endpoints Needed

#### Banner Management
- `PUT /api/banners/:id/toggle-status` - Quick toggle active/paused
- `GET /api/banners/analytics/:id` - Get campaign analytics
- `POST /api/banners/duplicate/:id` - Duplicate campaign

#### EcoPoints Awards
- `GET /api/banners/ecopoints-tiers` - Get available tiers
- `POST /api/banners/claim-award` - User claims banner award
- `GET /api/banners/user-eligibility/:userId` - Check user's eligibility

#### Analytics
- `GET /api/banners/analytics/overview` - Overall analytics
- `GET /api/banners/analytics/campaign/:campaignName` - Campaign-specific
- `GET /api/banners/analytics/compare` - Compare campaigns

### 6.2 Database Schema Updates
```sql
-- Add to sponsor_banners table
ALTER TABLE sponsor_banners ADD COLUMN startDate DATETIME;
ALTER TABLE sponsor_banners ADD COLUMN endDate DATETIME;
ALTER TABLE sponsor_banners ADD COLUMN targetDashboards TEXT; -- JSON array
ALTER TABLE sponsor_banners ADD COLUMN campaignName TEXT;
ALTER TABLE sponsor_banners ADD COLUMN awardType TEXT;
ALTER TABLE sponsor_banners ADD COLUMN ecoPointsCost INTEGER;
ALTER TABLE sponsor_banners ADD COLUMN status TEXT;

-- New table for banner analytics (detailed tracking)
CREATE TABLE banner_analytics (
  id TEXT PRIMARY KEY,
  bannerId TEXT,
  date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  dashboard TEXT, -- which dashboard it was shown on
  FOREIGN KEY (bannerId) REFERENCES sponsor_banners(id)
);

-- New table for EcoPoints banner awards
CREATE TABLE ecopoints_banner_awards (
  id TEXT PRIMARY KEY,
  userId TEXT,
  tier TEXT,
  pointsCost INTEGER,
  durationDays INTEGER,
  status TEXT, -- pending, approved, rejected, active, expired
  bannerId TEXT,
  requestedAt DATETIME,
  approvedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (bannerId) REFERENCES sponsor_banners(id)
);
```

## 📝 Implementation Priority

### High Priority (Immediate)
1. ✅ Fix "Failed to save banner" error
2. ✅ Add start/end date fields to form
3. ✅ Add dashboard targeting to form
4. ✅ Add campaign name field
5. ✅ Implement filter UI
6. ✅ Add quick toggle for active/paused

### Medium Priority (Next)
1. Implement EcoPoints award system
2. Add campaign analytics dashboard
3. Implement notification system
4. Add banner duplication feature

### Low Priority (Future)
1. Advanced analytics (time-series charts)
2. A/B testing for campaigns
3. Automated optimization suggestions
4. Export analytics reports

## 🎨 UI/UX Considerations

### Form Improvements
- Use tabs for different sections (Basic Info, Scheduling, Targeting, Analytics)
- Add preview panel showing how banner will look
- Validate dates (end must be after start)
- Show character limits for text fields

### Filter UX
- Sticky filter bar when scrolling
- Clear all filters button
- Show active filter count badge
- Save filter presets

### Analytics UX
- Use charts (recharts library already imported)
- Color-code metrics (green for good, red for poor)
- Export to CSV/PDF functionality
- Real-time updates (WebSocket)

## 🧪 Testing Checklist

### Banner Creation
- [ ] Create banner with all fields
- [ ] Create banner with minimal fields
- [ ] Schedule future banner
- [ ] Set end date in past (should show error)

### Filtering
- [ ] Filter by status
- [ ] Filter by user
- [ ] Filter by campaign
- [ ] Combine multiple filters

### EcoPoints Awards
- [ ] User reaches threshold
- [ ] User claims award
- [ ] Admin approves award
- [ ] Admin rejects award
- [ ] Banner activates automatically

### Notifications
- [ ] Banner activation notification sent
- [ ] EcoPoints eligibility notification sent
- [ ] Expiration warning notification sent

## 📚 Documentation Needed

1. **Admin Guide**
   - How to create campaigns
   - How to use filters
   - How to interpret analytics

2. **User Guide**
   - How to earn EcoPoints
   - How to claim banner awards
   - How to track campaign performance

3. **API Documentation**
   - All new endpoints
   - Request/response formats
   - Error codes

## 🚀 Deployment Plan

### Phase 1: Core Features (Week 1)
- Enhanced form with all fields
- Filter implementation
- Quick actions

### Phase 2: EcoPoints System (Week 2)
- Award tiers
- Claim interface
- Approval workflow

### Phase 3: Analytics (Week 3)
- Campaign analytics
- Overview dashboard
- Export functionality

### Phase 4: Notifications (Week 4)
- Notification system
- Email integration
- Push notifications

---

**Status:** Phase 1 (Data Structure) Complete
**Next:** Implement enhanced form UI and filters
**ETA:** Full system completion in 4 weeks
