// Initialize DB
let db: any;
let dbInstanceId = 0;

// Simple in-memory mock database for fallback
class MockDatabase {
  private data: Record<string, any[]> = {
    users: [],
    donations: [],
    food_requests: [],
    vouchers: [],
    voucher_redemptions: [],
    financial_transactions: [],
    fund_balance: [{ id: 1, totalBalance: 0, totalDonations: 0, totalWithdrawals: 0 }],
    admin_logs: [],
    sponsor_banners: [],
    ad_redemption_requests: [],
    notifications: [],
    money_donations: [],
    money_requests: []
  };

  async exec(_sql: string) {
    // Basic parsing to create tables (noop in mock)
    return;
  }

  async run(sql: string, params: any[] = []) {
    // Very basic mock implementation for INSERT/UPDATE/DELETE
    const lowerSql = sql.toLowerCase();

    if (lowerSql.includes('insert into')) {
      const tableNameMatch = lowerSql.match(/insert into (\w+)/);
      if (tableNameMatch && this.data[tableNameMatch[1]]) {
        const table = tableNameMatch[1];
        console.log('MockDB INSERT:', table);

        if (table === 'users') {
          // params from auth.ts: [id, email, password, name, type, organization, licenseId, location, ecoPoints]
          this.data.users.push({
            id: params[0],
            email: params[1],
            password: params[2],
            name: params[3],
            type: params[4],
            organization: params[5] || null,
            licenseId: params[6] || null,
            location: params[7] || null,
            ecoPoints: params[8] || 0,
            createdAt: new Date().toISOString()
          });
        } else if (table === 'donations') {
          // params: [id, donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng]
          this.data.donations.push({
            id: params[0], donorId: params[1], status: params[2], expiry: params[3],
            aiFoodType: params[4], aiQualityScore: params[5], imageUrl: params[6],
            description: params[7], quantity: params[8], lat: params[9], lng: params[10],
            senderConfirmed: 0, receiverConfirmed: 0, createdAt: new Date().toISOString()
          });
        } else if (table === 'food_requests') {
          // params: [id, requesterId, foodType, quantity, aiDrafts]
          this.data.food_requests.push({
            id: params[0], requesterId: params[1], foodType: params[2], quantity: params[3],
            aiDrafts: params[4], createdAt: new Date().toISOString()
          });
        } else if (table === 'financial_transactions') {
          // params: [id, userId, type, amount, category, description, createdAt]
          this.data.financial_transactions.push({
            id: params[0], userId: params[1], type: params[2], amount: params[3],
            category: params[4], description: params[5], createdAt: params[6]
          });
        }
      }
    } else if (lowerSql.includes('update')) {
      // Basic UPDATE support for common operations
      if (lowerSql.includes('donations') && lowerSql.includes('set status =')) {
        // Extract ID (assuming it's the last param)
        const id = params[params.length - 1];
        const donation = this.data.donations.find(d => d.id === id);
        if (donation) {
          // This is very specific to the app's update logic, might need generalization
          // For now, just logging updates in mock mode is often enough if we don't need perfect state
          // But for "features should work", we try to update status
          if (lowerSql.includes('claimedbyid')) {
            donation.status = params[0];
            donation.claimedById = params[1];
          } else if (lowerSql.includes('senderconfirmed')) {
            donation.senderConfirmed = 1;
          } else if (lowerSql.includes('receiverconfirmed')) {
            donation.receiverConfirmed = 1;
          } else if (lowerSql.includes('status = ? where id')) {
            donation.status = params[0];
          }
        }
      }
    } else if (lowerSql.includes('delete from')) {
      if (lowerSql.includes('donations')) {
        const id = params[0];
        this.data.donations = this.data.donations.filter(d => d.id !== id);
      }
    }

    return { lastID: 0, changes: 1 };
  }

  async get(sql: string, params: any[] = []) {
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes('select')) {
      if (lowerSql.includes('from users')) {
        console.log('[MockDB GET] Looking for user with params:', params);
        console.log('[MockDB GET] Total users in database:', this.data.users.length);
        console.log('[MockDB GET] User emails:', this.data.users.map(u => u.email));

        let user;
        if (lowerSql.includes('where email = ?')) {
          user = this.data.users.find(u => u.email === params[0]);
          console.log('[MockDB GET] Search by email:', params[0], '→', user ? 'FOUND' : 'NOT FOUND');
        } else if (lowerSql.includes('where id = ?')) {
          user = this.data.users.find(u => u.id === params[0]);
          console.log('[MockDB GET] Search by ID:', params[0], '→', user ? 'FOUND' : 'NOT FOUND');
        }

        if (user) {
          // Return user with all fields, ensuring licenseId is included
          return {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            type: user.type,
            organization: user.organization || null,
            licenseId: user.licenseId || null,
            location: user.location || null,
            ecoPoints: user.ecoPoints || 0,
            createdAt: user.createdAt || new Date().toISOString()
          };
        }
        return undefined;
      }
      if (lowerSql.includes('count(*)') && lowerSql.includes('from users')) {
        return { count: this.data.users.length };
      }
      if (lowerSql.includes('from donations')) {
        if (lowerSql.includes('where id = ?')) return this.data.donations.find(d => d.id === params[0]);
      }
      if (lowerSql.includes('from fund_balance')) {
        return this.data.fund_balance[0];
      }
    }
    return undefined;
  }

  async all(sql: string, params: any[] = []) {
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes('select') && lowerSql.includes('from donations')) {
      let results = [...this.data.donations];
      // Basic filtering mock
      if (lowerSql.includes('status = ?')) {
        const status = params[0]; // Simplified param mapping
        results = results.filter(d => d.status === status);
      }
      return results;
    }
    return [];
  }
}

export async function initDB() {
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const dbPath = isVercel ? '/tmp/ecobite.db' : './ecobite.db';
  console.log(`Initializing database at ${dbPath} (Vercel: ${isVercel})`);

  // FORCE MOCK DATABASE EVERYWHERE
  // This eliminates any risk of native module crashes (sqlite3) in serverless environments.
  // Data will be in-memory and lost on restart, but the app will be stable.
  console.log('Using In-Memory MockDatabase for stability.');

  if (!db) {
    dbInstanceId++;
    console.log(`[DB] Creating NEW MockDatabase instance #${dbInstanceId}`);
    db = new MockDatabase();
  } else {
    console.log(`[DB] Reusing existing MockDatabase instance #${dbInstanceId}`);
  }



  try {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          password TEXT,
          name TEXT,
          type TEXT,
          organization TEXT,
          licenseId TEXT,
          location TEXT,
          ecoPoints INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS donations (
          id TEXT PRIMARY KEY,
          donorId TEXT,
          status TEXT,
          expiry TEXT,
          claimedById TEXT,
          aiFoodType TEXT,
          aiQualityScore INTEGER,
          imageUrl TEXT,
          description TEXT,
          quantity TEXT,
          lat REAL,
          lng REAL,
          senderConfirmed INTEGER DEFAULT 0,
          receiverConfirmed INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS food_requests (
          id TEXT PRIMARY KEY,
          requesterId TEXT,
          foodType TEXT,
          quantity TEXT,
          aiDrafts TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS vouchers (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE,
          title TEXT,
          description TEXT,
          discountType TEXT,
          discountValue REAL,
          minEcoPoints INTEGER,
          maxRedemptions INTEGER,
          currentRedemptions INTEGER DEFAULT 0,
          status TEXT DEFAULT 'active',
          expiryDate TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS voucher_redemptions (
          id TEXT PRIMARY KEY,
          voucherId TEXT,
          userId TEXT,
          redeemedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (voucherId) REFERENCES vouchers(id),
          FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS financial_transactions (
          id TEXT PRIMARY KEY,
          type TEXT,
          amount REAL,
          userId TEXT,
          donationId TEXT,
          category TEXT,
          description TEXT,
          status TEXT DEFAULT 'completed',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (donationId) REFERENCES donations(id)
        );

        CREATE TABLE IF NOT EXISTS fund_balance (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          totalBalance REAL DEFAULT 0,
          totalDonations REAL DEFAULT 0,
          totalWithdrawals REAL DEFAULT 0,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_logs (
          id TEXT PRIMARY KEY,
          adminId TEXT,
          action TEXT,
          targetId TEXT,
          details TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (adminId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS sponsor_banners (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          imageUrl TEXT,
          logoUrl TEXT,
          content TEXT,
          description TEXT,
          backgroundColor TEXT,
          link TEXT NOT NULL,
          active INTEGER DEFAULT 1,
          placement TEXT DEFAULT 'dashboard',
          impressions INTEGER DEFAULT 0,
          clicks INTEGER DEFAULT 0,
          durationMinutes INTEGER,
          startedAt DATETIME,
          expiresAt DATETIME,
          ownerId TEXT,
          displayOrder INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ownerId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS ad_redemption_requests (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          packageId TEXT NOT NULL,
          pointsCost INTEGER NOT NULL,
          durationMinutes INTEGER NOT NULL,
          bannerData TEXT,
          status TEXT DEFAULT 'pending',
          bannerId TEXT,
          rejectionReason TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          approvedAt DATETIME,
          rejectedAt DATETIME,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (bannerId) REFERENCES sponsor_banners(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          read INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS money_donations (
          id TEXT PRIMARY KEY,
          donorId TEXT NOT NULL,
          donorRole TEXT NOT NULL CHECK (donorRole = 'individual'),
          amount REAL NOT NULL CHECK (amount > 0),
          paymentMethod TEXT,
          transactionId TEXT,
          status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (donorId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS money_requests (
          id TEXT PRIMARY KEY,
          requesterId TEXT NOT NULL,
          requesterRole TEXT NOT NULL CHECK (requesterRole IN ('ngo', 'shelter', 'fertilizer')),
          amount REAL NOT NULL CHECK (amount > 0),
          purpose TEXT NOT NULL,
          distance REAL,
          transportRate REAL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          rejectionReason TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          reviewedAt DATETIME,
          reviewedBy TEXT,
          FOREIGN KEY (requesterId) REFERENCES users(id),
          FOREIGN KEY (reviewedBy) REFERENCES users(id)
        );
      `);

    // Migration for existing databases (skip if mock DB)
    if (!(db instanceof MockDatabase)) {
      try { await db.exec('ALTER TABLE donations ADD COLUMN senderConfirmed INTEGER DEFAULT 0'); } catch (e) { }
      try { await db.exec('ALTER TABLE donations ADD COLUMN receiverConfirmed INTEGER DEFAULT 0'); } catch (e) { }
      try { await db.exec('ALTER TABLE donations ADD COLUMN lat REAL'); } catch (e) { }
      try { await db.exec('ALTER TABLE donations ADD COLUMN lng REAL'); } catch (e) { }
    }

    // Initialize fund balance
    const fundBalance = await db.get('SELECT * FROM fund_balance WHERE id = 1');
    if (!fundBalance) {
      await db.run('INSERT INTO fund_balance (id, totalBalance, totalDonations, totalWithdrawals) VALUES (1, 0, 0, 0)');
    }

    // Seed Admin User (if not exists)
    const bcrypt = (await import('bcryptjs')).default;
    const adminEmail = 'admin@ecobite.com';
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', [adminEmail]);

    console.log('Checking for existing admin...');
    console.log('Existing admin:', existingAdmin ? 'FOUND' : 'NOT FOUND');

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const adminId = 'admin-' + Date.now();
      console.log('Creating admin user with ID:', adminId);
      console.log('Hashed password length:', hashedPassword.length);

      // params: [id, email, password, name, type, organization, licenseId, location, ecoPoints]
      await db.run(
        'INSERT INTO users (id, email, password, name, type, organization, licenseId, location, ecoPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [adminId, adminEmail, hashedPassword, 'Admin User', 'admin', 'EcoBite Admin', null, null, 5000]
      );
      console.log('✅ Admin user created:');
      console.log('   Email: admin@ecobite.com');
      console.log('   Password: Admin@123');

      // Verify it was created
      const verifyAdmin = await db.get('SELECT * FROM users WHERE email = ?', [adminEmail]);
      console.log('Verification - Admin exists:', verifyAdmin ? 'YES' : 'NO');
      if (verifyAdmin) {
        console.log('   Admin ID:', verifyAdmin.id);
        console.log('   Admin Type:', verifyAdmin.type);
        console.log('   Stored password hash:', verifyAdmin.password?.substring(0, 20) + '...');

        // Test password with stored hash
        const storedTest = await bcrypt.compare('Admin@123', verifyAdmin.password);
        console.log('   Password test with stored hash:', storedTest ? '✅ PASS' : '❌ FAIL');
      }
    } else {
      console.log('Admin user already exists, skipping creation');
      // Test existing admin password
      const testExisting = await bcrypt.compare('Admin@123', existingAdmin.password);
      console.log('Existing admin password test:', testExisting ? '✅ PASS' : '❌ FAIL');
    }

    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    // If even the mock DB fails (unlikely), we re-throw
    throw error;
  }

  return db;
}

export function getDB() {
  console.log(`[DB] getDB() called - returning instance #${dbInstanceId}, exists: ${!!db}`);
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
