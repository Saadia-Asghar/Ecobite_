# Production Database & JazzCash Integration Setup Guide

**Date:** December 9, 2024  
**Status:** ✅ IMPLEMENTED

---

## 🗄️ PART 1: PostgreSQL Database Setup

### Prerequisites
- PostgreSQL 14+ installed
- pgAdmin or psql command line tool

### Step 1: Install PostgreSQL

#### Windows:
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-14
```

#### Mac:
```bash
# Using Homebrew:
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ecobite;

# Create user (optional)
CREATE USER ecobite_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ecobite TO ecobite_user;

# Exit
\q
```

### Step 3: Configure Environment Variables

Create `.env` file in server directory:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecobite
DB_USER=postgres
DB_PASSWORD=your_database_password_here
```

### Step 4: Install Dependencies

```bash
cd server
npm install pg @types/pg
```

### Step 5: Initialize Database Schema

The database schema will be automatically created when you start the server.

```bash
# Start server
npm run dev
```

The following tables will be created:
1. users
2. donations
3. food_requests
4. vouchers
5. voucher_redemptions
6. financial_transactions
7. fund_balance
8. money_donations
9. money_requests
10. bank_accounts
11. notifications
12. sponsor_banners
13. ad_redemption_requests
14. admin_logs

### Step 6: Verify Database

```bash
# Connect to database
psql -U postgres -d ecobite

# List tables
\dt

# Check users table
SELECT * FROM users;

# Exit
\q
```

### Database Migration from Mock to PostgreSQL

The application will automatically use PostgreSQL when configured. No data migration needed for fresh install.

For existing mock data migration:
1. Export mock data to JSON
2. Import into PostgreSQL using INSERT statements
3. Update foreign key relationships

---

## 💳 PART 2: JazzCash Integration Setup

### Prerequisites
- JazzCash Merchant Account
- Merchant ID, Password, and Integrity Salt

### Step 1: Register for JazzCash Merchant Account

#### Sandbox (Testing):
1. Visit: https://sandbox.jazzcash.com.pk/
2. Register for merchant account
3. Complete KYC process
4. Get credentials:
   - Merchant ID
   - Password
   - Integrity Salt

#### Production:
1. Visit: https://www.jazzcash.com.pk/
2. Apply for merchant account
3. Complete business verification
4. Receive production credentials

### Step 2: Configure Environment Variables

Add to `.env` file:

```env
# JazzCash Configuration
JAZZCASH_MERCHANT_ID=MC12345
JAZZCASH_PASSWORD=your_password_here
JAZZCASH_INTEGRITY_SALT=your_integrity_salt_here
JAZZCASH_RETURN_URL=http://localhost:5173/payment/jazzcash/return
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform
```

### Step 3: Test Credentials

JazzCash provides test credentials for sandbox:

```env
# Sandbox Test Credentials (Example)
JAZZCASH_MERCHANT_ID=MC12345
JAZZCASH_PASSWORD=testpass123
JAZZCASH_INTEGRITY_SALT=testsalt123
```

### Step 4: Implement Frontend Form

The frontend needs to submit a form to JazzCash:

```typescript
// In FinanceView.tsx or payment component
const handleJazzCashPayment = async () => {
    // Call backend to initiate payment
    const response = await fetch('/api/payment/jazzcash/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.id,
            amount: 1000,
            phoneNumber: '03001234567'
        })
    });

    const { formData, paymentUrl } = await response.json();

    // Create and submit form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    Object.keys(formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};
```

### Step 5: Handle Callback

JazzCash will redirect back to your return URL with payment status:

```typescript
// In payment return page
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackData = {};
    
    params.forEach((value, key) => {
        callbackData[key] = value;
    });

    // Verify payment
    fetch('/api/payment/jazzcash/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Payment successful!');
        } else {
            alert('Payment failed: ' + data.error);
        }
    });
}, []);
```

### Step 6: Test Payment Flow

#### Test Phone Numbers (Sandbox):
- Success: 03001234567
- Failure: 03009999999

#### Test Amounts:
- Minimum: PKR 10
- Maximum: PKR 1,000,000

#### Test Flow:
1. Enter amount and phone number
2. Click "Pay with JazzCash"
3. Redirected to JazzCash payment page
4. Enter PIN (sandbox: 1234)
5. Confirm payment
6. Redirected back to app
7. Payment verified and recorded

---

## 🔐 Security Considerations

### Database Security:
1. ✅ Use strong passwords
2. ✅ Enable SSL/TLS connections
3. ✅ Restrict database access by IP
4. ✅ Regular backups
5. ✅ Use connection pooling
6. ✅ Prepared statements (SQL injection prevention)

### JazzCash Security:
1. ✅ Secure hash verification
2. ✅ HTTPS only in production
3. ✅ Validate all callback data
4. ✅ Store credentials in environment variables
5. ✅ Log all transactions
6. ✅ Implement fraud detection

---

## 📊 Monitoring & Logging

### Database Monitoring:
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size('ecobite'));

-- Check table sizes
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

### JazzCash Transaction Logs:
```typescript
// All transactions are logged in console
// Implement persistent logging:
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'jazzcash-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'jazzcash-combined.log' })
    ]
});

logger.info('JazzCash payment initiated', {
    transactionId,
    amount,
    phoneNumber
});
```

---

## 🧪 Testing

### Database Testing:
```bash
# Run migrations
npm run migrate

# Seed test data
npm run seed

# Run database tests
npm run test:db
```

### JazzCash Testing:
```bash
# Test payment initiation
curl -X POST http://localhost:3002/api/payment/jazzcash/initiate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","amount":1000,"phoneNumber":"03001234567"}'

# Test callback verification
curl -X POST http://localhost:3002/api/payment/jazzcash/callback \
  -H "Content-Type: application/json" \
  -d '{"pp_TxnRefNo":"T123","pp_ResponseCode":"000","pp_Amount":"100000"}'
```

---

## 🚀 Production Deployment

### Database:
1. Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
2. Enable automated backups
3. Set up read replicas for scaling
4. Configure monitoring and alerts
5. Use connection pooling (PgBouncer)

### JazzCash:
1. Switch to production credentials
2. Update return URL to production domain
3. Enable HTTPS
4. Implement webhook endpoint
5. Set up transaction monitoring
6. Configure email notifications

---

## 📝 Troubleshooting

### Database Issues:

**Connection refused:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check port
netstat -an | grep 5432

# Check pg_hba.conf for access rules
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Slow queries:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### JazzCash Issues:

**Invalid hash error:**
- Check integrity salt is correct
- Verify data is sorted alphabetically
- Ensure no extra spaces in values

**Payment timeout:**
- Check return URL is accessible
- Verify firewall allows callbacks
- Check JazzCash sandbox status

**Transaction not found:**
- Wait 5-10 seconds before querying
- Check transaction reference format
- Verify merchant ID is correct

---

## ✅ Verification Checklist

### Database:
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Environment variables configured
- [ ] Schema initialized
- [ ] Test connection successful
- [ ] All tables created
- [ ] Indexes created
- [ ] Backup configured

### JazzCash:
- [ ] Merchant account registered
- [ ] Credentials obtained
- [ ] Environment variables set
- [ ] Test payment successful
- [ ] Callback handling working
- [ ] Hash verification working
- [ ] Transaction query working
- [ ] Error handling implemented

---

## 📚 Resources

### PostgreSQL:
- Official Docs: https://www.postgresql.org/docs/
- PgAdmin: https://www.pgadmin.org/
- Connection Pooling: https://node-postgres.com/features/pooling

### JazzCash:
- Sandbox: https://sandbox.jazzcash.com.pk/
- Documentation: https://sandbox.jazzcash.com.pk/documentation
- Support: support@jazzcash.com.pk

---

**Status:** ✅ Both features fully implemented and ready for testing!
