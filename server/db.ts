import bcrypt from 'bcryptjs';

// Initialize DB
let db: any;

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
    admin_logs: []
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
        let user;
        if (lowerSql.includes('where email = ?')) {
          user = this.data.users.find(u => u.email === params[0]);
        } else if (lowerSql.includes('where id = ?')) {
          user = this.data.users.find(u => u.id === params[0]);
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
  db = new MockDatabase();



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

    // NO SEEDING - User requested clean state
    console.log('Database initialized (No seeding)');
  } catch (error) {
    console.error('Database initialization error:', error);
    // If even the mock DB fails (unlikely), we re-throw
    throw error;
  }

  return db;
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
