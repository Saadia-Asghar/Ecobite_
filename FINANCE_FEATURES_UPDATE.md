# Finance Features Update - December 2024

## Overview
Updated the finance features to create a clear separation between donors and beneficiaries, ensuring logical access to money donation and request features.

## Changes Made

### 1. Donate Money Feature
**Restriction:** Only available to **Individual** users

**Files Modified:**
- `src/components/mobile/FinanceView.tsx`
  - Updated button conditional: `userRole === 'individual'`
  - Updated form conditional: `userRole === 'individual' && showDonateForm`

**Removed From:**
- ❌ Restaurants
- ❌ NGOs
- ❌ Animal Shelters
- ❌ Fertilizer/Waste Management

### 2. Request Money Feature
**Restriction:** Only available to **Beneficiary Organizations** (NGO, Shelter, Fertilizer)

**Files Modified:**
- `src/components/mobile/FinanceView.tsx`
  - Updated button conditional: `(userRole === 'ngo' || userRole === 'shelter' || userRole === 'fertilizer')`
  - Updated form conditional: Same as above + `showRequestForm`
- `src/components/roles/IndividualDashboard.tsx`
  - Removed "Request Finance" button from Quick Actions

**Removed From:**
- ❌ Individuals
- ❌ Restaurants

### 3. Live Donations Map Feature
**Updated:** Changed naming from "Find Nearby Donors" to "Live Donations Map"

**Files Modified:**
- `src/pages/RoleDashboard.tsx` - Bottom nav label: "Donors" → "Live"
- `src/components/mobile/NearbyNGOsView.tsx` - Title: "Nearby Donations" → "Live Donations"
- `src/components/roles/NGODashboard.tsx` - Button: "Find Nearby Donors" → "Live Donations Map"
- `src/components/roles/AnimalShelterDashboard.tsx` - Same update
- `src/components/roles/FertilizerDashboard.tsx` - Same update

## Final User Access Matrix

| User Role | Donate Money | Request Money | Finance Tab Content |
|-----------|--------------|---------------|---------------------|
| Individual | ✅ YES | ❌ NO | Donate Money button + form |
| Restaurant | ❌ NO | ❌ NO | Statistics only |
| NGO | ❌ NO | ✅ YES | Request Money button + form |
| Animal Shelter | ❌ NO | ✅ YES | Request Money button + form |
| Fertilizer/Waste | ❌ NO | ✅ YES | Request Money button + form |

## Logical Flow

### Individual Users
- **Can:** Donate money to support platform operations
- **Cannot:** Request money (they are donors)
- **Quick Actions:** Donate Food, Donate Money, Find Nearby NGOs, View Stats

### Restaurant Users
- **Can:** Donate food
- **Cannot:** Donate or request money (business entity)
- **Quick Actions:** Donate Food, View Stats

### Beneficiary Organizations (NGO, Shelter, Fertilizer)
- **Can:** Request money for logistics/transportation
- **Cannot:** Donate money (they are beneficiaries)
- **Quick Actions:** Browse Donations, Request Logistics Funding, Live Donations Map

## Database Schema Considerations

### Money Donations Table
```sql
-- Only individuals can create money donations
CREATE TABLE money_donations (
    id VARCHAR(255) PRIMARY KEY,
    donor_id VARCHAR(255) NOT NULL,
    donor_role VARCHAR(50) NOT NULL CHECK (donor_role = 'individual'),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id)
);
```

### Money Requests Table
```sql
-- Only beneficiary organizations can create money requests
CREATE TABLE money_requests (
    id VARCHAR(255) PRIMARY KEY,
    requester_id VARCHAR(255) NOT NULL,
    requester_role VARCHAR(50) NOT NULL CHECK (requester_role IN ('ngo', 'shelter', 'fertilizer')),
    amount DECIMAL(10, 2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    distance DECIMAL(10, 2),
    transport_rate DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(255),
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

## API Endpoints

### POST /api/money-donations
**Access:** Individual users only
**Body:**
```json
{
  "amount": 1000,
  "paymentMethod": "card",
  "transactionId": "txn_123456"
}
```

### POST /api/money-requests
**Access:** NGO, Shelter, Fertilizer users only
**Body:**
```json
{
  "amount": 500,
  "purpose": "Transport (10km)",
  "distance": 10,
  "transportRate": 100
}
```

### GET /api/money-requests
**Access:** Admin users (to review requests)

### POST /api/money-requests/:id/approve
**Access:** Admin users only

### POST /api/money-requests/:id/reject
**Access:** Admin users only

## Backend Validation

Ensure the following validations are in place:

1. **Money Donations:**
   - Verify `user.role === 'individual'` before accepting donation
   - Validate amount > 0
   - Verify payment method and transaction ID

2. **Money Requests:**
   - Verify `user.role IN ('ngo', 'shelter', 'fertilizer')` before accepting request
   - Validate amount > 0
   - Validate purpose is not empty
   - Calculate amount based on distance × transport_rate

3. **Admin Actions:**
   - Only admin users can approve/reject money requests
   - Log all admin actions for audit trail

## Testing Checklist

- [ ] Individual can donate money
- [ ] Individual cannot request money (UI hidden)
- [ ] Restaurant cannot donate money (UI hidden)
- [ ] Restaurant cannot request money (UI hidden)
- [ ] NGO can request money
- [ ] NGO cannot donate money (UI hidden)
- [ ] Shelter can request money
- [ ] Shelter cannot donate money (UI hidden)
- [ ] Fertilizer can request money
- [ ] Fertilizer cannot donate money (UI hidden)
- [ ] Backend rejects invalid role attempts
- [ ] Admin can approve/reject money requests

## Migration Notes

If updating an existing database:

```sql
-- Add role checks to existing tables
ALTER TABLE money_donations 
ADD CONSTRAINT check_donor_role 
CHECK (donor_role = 'individual');

ALTER TABLE money_requests 
ADD CONSTRAINT check_requester_role 
CHECK (requester_role IN ('ngo', 'shelter', 'fertilizer'));

-- Update any existing records that violate these constraints
-- (Review and handle case-by-case)
```

## Deployment Steps

1. Update frontend code (already done)
2. Update backend API validations
3. Run database migrations
4. Test all user roles
5. Deploy to production
6. Monitor for any issues

## Related Files

### Frontend
- `src/components/mobile/FinanceView.tsx`
- `src/components/roles/IndividualDashboard.tsx`
- `src/components/roles/NGODashboard.tsx`
- `src/components/roles/AnimalShelterDashboard.tsx`
- `src/components/roles/FertilizerDashboard.tsx`
- `src/pages/RoleDashboard.tsx`
- `src/components/mobile/NearbyNGOsView.tsx`

### Backend (to be updated)
- `server/routes/money-donations.ts` (or similar)
- `server/routes/money-requests.ts` (or similar)
- `server/middleware/roleValidation.ts`

## Notes

- This update ensures a clear separation between donors and beneficiaries
- Individuals are the only ones who can financially support the platform
- Beneficiaries can only request logistics funding, not donate money
- Restaurants focus solely on food donation without financial features
