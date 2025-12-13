# Quick Testing Guide - Money Request Approval Feature

## Prerequisites Checklist

Before testing, ensure:
- [ ] Backend server is running (`npm run server` or `node server/index.js`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database has at least one admin user
- [ ] Database has at least one NGO/Shelter/Fertilizer user
- [ ] The NGO/Shelter user has at least one bank account registered
- [ ] There is at least one pending money request

## Quick Setup (If Starting Fresh)

### 1. Create Test Users
```sql
-- Admin user should already exist from seed data
-- If not, create one:
INSERT INTO users (id, email, password, name, type) 
VALUES ('admin-1', 'admin@ecobite.com', 'admin123', 'Admin User', 'admin');

-- Create NGO user
INSERT INTO users (id, email, password, name, type, organization) 
VALUES ('ngo-1', 'ngo@example.com', 'password123', 'Green Earth Foundation', 'ngo', 'Green Earth Foundation');
```

### 2. Create Bank Account for NGO
```sql
INSERT INTO bank_accounts (
    id, userId, accountHolderName, bankName, accountNumber, 
    iban, accountType, isDefault, isVerified, status
) VALUES (
    'bank-1', 'ngo-1', 'Green Earth Foundation', 'HBL Bank', '1234567890',
    'PK36HBLA0000001234567890', 'current', 1, 1, 'active'
);
```

### 3. Create Money Request
```sql
INSERT INTO money_requests (
    id, requester_id, requester_role, amount, purpose, status
) VALUES (
    'req-1', 'ngo-1', 'ngo', 50000, 'Transportation for food delivery', 'pending'
);
```

## Testing Steps

### Test 1: Approve Money Request

1. **Login as Admin**
   - Email: `admin@ecobite.com`
   - Password: `admin123`

2. **Navigate to Money Requests**
   - Click on "Money Requests" tab in admin dashboard
   - Should see the pending request

3. **View Request Details** (Optional)
   - Click "View" button
   - Verify all details are correct
   - Close modal

4. **Initiate Approval**
   - Click "Approve" button on the request
   - Transfer Panel should open

5. **Verify Transfer Panel**
   - [ ] Request summary shows correct amount and purpose
   - [ ] Bank accounts list appears
   - [ ] Default account is pre-selected
   - [ ] Account type selection shows (Savings/Current)
   - [ ] Transfer summary displays

6. **Select Bank Account**
   - Click on a bank account card
   - Verify it gets highlighted
   - Check that account details are visible

7. **Select Account Type**
   - Click "Savings Account" or "Current Account"
   - Verify selection is highlighted

8. **Confirm Transfer**
   - Click "Confirm Transfer" button
   - Wait for processing (loading spinner should appear)
   - Verify success message appears with:
     - Bank name
     - Account number
     - Account type
     - Amount
     - Email notification confirmation
     - App notification confirmation

9. **Verify Backend Updates**
   - Check that request status changed to "approved"
   - Check fund balance decreased
   - Check financial transaction was created
   - Check admin log was created

10. **Verify User Notifications**
    - Login as the NGO user
    - Check notification bell icon (should have new notification)
    - Click to view notification
    - Verify notification contains transfer details
    - Check email inbox for email notification

### Test 2: Reject Money Request

1. **Create Another Request** (or use existing pending request)

2. **Login as Admin**

3. **Navigate to Money Requests Tab**

4. **Click Reject Button**
   - Rejection reason prompt should appear

5. **Enter Rejection Reason**
   - Example: "Insufficient documentation provided"
   - Click OK

6. **Verify Rejection**
   - Success message should appear
   - Request should move to "rejected" status
   - Rejection reason should be visible

7. **Verify User Notification**
   - Login as NGO user
   - Check notification (should show rejection with reason)
   - Check email for rejection notification

### Test 3: Edge Cases

#### Test 3.1: No Bank Account
1. Create a user without bank account
2. Create money request from that user
3. Try to approve
4. Should show error: "No bank account found"

#### Test 3.2: Insufficient Funds
1. Create a request with amount > fund balance
2. Try to approve
3. Should show error: "Insufficient funds in the pool"

#### Test 3.3: Already Processed Request
1. Try to approve an already approved request
2. Should show error: "Request already processed"

## Expected Results Checklist

### After Successful Approval:
- [ ] Request status = "approved"
- [ ] Fund balance decreased by request amount
- [ ] Financial transaction created with transfer details
- [ ] Admin log created
- [ ] User notification created in database
- [ ] Email sent to user
- [ ] Success message displayed to admin
- [ ] Request appears in "approved" filter

### After Successful Rejection:
- [ ] Request status = "rejected"
- [ ] Rejection reason stored
- [ ] User notification created
- [ ] Email sent to user
- [ ] Admin log created
- [ ] Request appears in "rejected" filter

## Database Queries for Verification

### Check Request Status
```sql
SELECT * FROM money_requests WHERE id = 'req-1';
```

### Check Fund Balance
```sql
SELECT * FROM fund_balance WHERE id = 1;
```

### Check Financial Transaction
```sql
SELECT * FROM financial_transactions 
WHERE category = 'money_request' 
ORDER BY created_at DESC LIMIT 1;
```

### Check Notifications
```sql
SELECT * FROM notifications 
WHERE type = 'money_request_approved' 
ORDER BY created_at DESC LIMIT 1;
```

### Check Admin Logs
```sql
SELECT * FROM admin_logs 
WHERE action = 'approve_money_request' 
ORDER BY created_at DESC LIMIT 1;
```

## Troubleshooting

### Issue: Transfer Panel Not Opening
- **Check**: Browser console for errors
- **Solution**: Ensure bank accounts API is working
- **Test**: `GET http://localhost:3002/api/bank-accounts?userId=ngo-1`

### Issue: Email Not Sending
- **Check**: SMTP configuration in `.env`
- **Solution**: Verify email service credentials
- **Note**: Email sending is async, check server logs

### Issue: Notification Not Appearing
- **Check**: Notifications table in database
- **Solution**: Verify notification was created
- **Refresh**: User dashboard to see new notifications

### Issue: Fund Balance Not Updating
- **Check**: fund_balance table
- **Solution**: Ensure fund_balance record exists with id = 1
- **Create**: If missing, run:
```sql
INSERT INTO fund_balance (id, total_balance, total_donations, total_withdrawals)
VALUES (1, 1000000, 1000000, 0);
```

## API Testing (Using Postman/cURL)

### Get Money Requests
```bash
curl http://localhost:3002/api/money-requests
```

### Get User's Bank Accounts
```bash
curl http://localhost:3002/api/bank-accounts?userId=ngo-1
```

### Approve Request
```bash
curl -X POST http://localhost:3002/api/money-requests/req-1/approve \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-1",
    "bankAccountId": "bank-1",
    "accountType": "savings"
  }'
```

### Reject Request
```bash
curl -X POST http://localhost:3002/api/money-requests/req-1/reject \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin-1",
    "reason": "Insufficient documentation"
  }'
```

## Success Indicators

✅ **Feature is Working If:**
1. Transfer panel opens when clicking approve
2. Bank accounts are displayed correctly
3. Account type can be selected
4. Transfer processes successfully
5. Success message shows all details
6. User receives both email and app notification
7. Database records are created correctly
8. Admin logs track the action

## Performance Benchmarks

- Transfer panel should open in < 500ms
- Bank accounts should load in < 300ms
- Approval processing should complete in < 1s
- Notifications should be created immediately
- Email should be queued immediately (sent async)

## Next Steps After Testing

1. Test with multiple users
2. Test with different bank account types
3. Test concurrent approvals
4. Test with large amounts
5. Test notification delivery
6. Test email delivery
7. Verify all edge cases
8. Check mobile responsiveness
9. Test dark mode
10. Verify accessibility

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check server logs for backend errors
3. Verify database records
4. Check API responses
5. Review the implementation docs in `MONEY_REQUEST_APPROVAL_COMPLETE.md`
