# Feature Implementation Plan

## Priority 1: Core Functionality Fixes

### 1. Image Upload (Add Donation)
- [x] Add file input with preview
- [ ] Upload to server/cloud storage
- [ ] Support both file upload AND URL input
- [ ] Show image preview before submission

### 2. Packaging Cost Feature
- [ ] Add packaging cost input field
- [ ] Calculate based on number of packages
- [ ] Deduct from available donated money pool
- [ ] Show available balance
- [ ] Track packaging claims

### 3. Edit Profile & Privacy
- [ ] Create Edit Profile modal/page
- [ ] Allow updating: name, email, location, organization
- [ ] Create Privacy & Security page
- [ ] Change password functionality
- [ ] Account settings

### 4. Dark Mode
- [ ] Add dark mode state management
- [ ] Create dark theme CSS variables
- [ ] Toggle between light/dark
- [ ] Persist preference in localStorage

## Priority 2: Enhanced Features

### 5. Browse Nearby NGOs
- [ ] Rename "Browse Nearby Needs" to "Nearby NGOs"
- [ ] Integrate Google Maps API
- [ ] Show NGOs on map with markers
- [ ] Filter by distance
- [ ] Show NGO details on click

### 6. Donation Status Tabs
- [x] All donations
- [x] Available
- [x] Claimed
- [ ] Expired (check expiry date)
- [ ] Completed (delivered)

### 7. Money Donation System
- [ ] Add "Donate Money" button
- [ ] Create donation amount input
- [ ] Payment gateway integration:
  - [ ] PayPal
  - [ ] JazzCash
  - [ ] EasyPaisa
  - [ ] Debit/Credit Card (Stripe)
- [ ] Track monetary donations
- [ ] Show total money pool
- [ ] Allow claiming for packaging/delivery

## Implementation Order

1. Image Upload (1 hour)
2. Donation Status Tabs - Expired & Completed (30 min)
3. Edit Profile (1 hour)
4. Dark Mode (1 hour)
5. Packaging Cost System (2 hours)
6. Money Donation UI (1 hour)
7. Payment Integration (3 hours)
8. Nearby NGOs Map (2 hours)
9. Privacy & Security (1 hour)

Total: ~12 hours of development

## Files to Create/Modify

### New Files
- `src/components/ImageUpload.tsx`
- `src/components/EditProfileModal.tsx`
- `src/components/PrivacySettings.tsx`
- `src/pages/MoneyDonation.tsx`
- `src/components/NearbyNGOsMap.tsx`
- `src/components/PackagingCostClaim.tsx`

### Modified Files
- `src/components/mobile/AddFoodView.tsx` - Add image upload
- `src/components/mobile/ProfileView.tsx` - Wire up buttons
- `src/context/ThemeContext.tsx` - Dark mode
- `src/index.css` - Dark theme variables
- `src/components/dashboard/DonationsList.tsx` - Add expired/completed tabs
- `server/routes/donations.ts` - Add money donation endpoints
