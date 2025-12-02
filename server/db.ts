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
        console.log('MockDB INSERT:', tableNameMatch[1]);

        // Try to reconstruct object for users (most critical)
        if (tableNameMatch[1] === 'users') {
          // params: [id, email, password, name, type, organization, ecoPoints, location, createdAt]
          this.data.users.push({
            id: params[0], email: params[1], password: params[2], name: params[3],
            type: params[4], organization: params[5], ecoPoints: params[6],
            location: params[7], createdAt: params[8]
          });
        }
      }
    }
    return { lastID: 0, changes: 1 };
  }

  async get(sql: string, params: any[] = []) {
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes('select') && lowerSql.includes('from users')) {
      if (lowerSql.includes('where email = ?')) {
        return this.data.users.find(u => u.email === params[0]);
      }
      if (lowerSql.includes('where id = ?')) {
        return this.data.users.find(u => u.id === params[0]);
      }
      if (lowerSql.includes('count(*)')) {
        return { count: this.data.users.length };
      }
    }
    return undefined;
  }

  async all(_sql: string, _params: any[] = []) {
    return [];
  }
}

export async function initDB() {
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const dbPath = isVercel ? '/tmp/ecobite.db' : './ecobite.db';
  console.log(`Initializing database at ${dbPath} (Vercel: ${isVercel})`);

  try {
    // Dynamic import to avoid top-level crash if native bindings missing
    const sqlite3 = await import('sqlite3');
    const { open } = await import('sqlite');

    db = await open({
      filename: dbPath,
      driver: sqlite3.default.Database
    });
    console.log('SQLite3 loaded successfully');
  } catch (error) {
    console.error('Failed to load sqlite3, falling back to In-Memory MockDatabase:', error);
    db = new MockDatabase();
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

    // Seed Users
    const userCount = await db.get('SELECT count(*) as count FROM users');
    if (userCount && userCount.count === 0) {
      console.log('Seeding mock users...');
      let mockUsers = [
        { id: 'u1', name: 'Ali Khan', email: 'ali@example.com', type: 'individual', ecoPoints: 1250, location: 'Islamabad', joinedAt: '2024-01-15' },
        { id: 'u2', name: 'Spice Bazaar', email: 'contact@spicebazaar.pk', type: 'restaurant', organization: 'Spice Bazaar', ecoPoints: 3500, location: 'Lahore', joinedAt: '2024-02-01' },
        { id: 'u3', name: 'Edhi Foundation', email: 'info@edhi.org', type: 'ngo', organization: 'Edhi', ecoPoints: 5000, location: 'Karachi', joinedAt: '2023-12-10' },
        { id: 'u4', name: 'Sara Ahmed', email: 'sara@example.com', type: 'individual', ecoPoints: 450, location: 'Rawalpindi', joinedAt: '2024-03-20' },
        { id: 'u5', name: 'Burger Lab', email: 'manager@burgerlab.pk', type: 'restaurant', organization: 'Burger Lab', ecoPoints: 2100, location: 'Islamabad', joinedAt: '2024-01-05' },
        { id: 'u6', name: 'Fatima Jinnah', email: 'fatima@example.com', type: 'individual', ecoPoints: 800, location: 'Karachi', joinedAt: '2024-04-12' },
        { id: 'u7', name: 'Save Food NGO', email: 'help@savefood.org', type: 'ngo', organization: 'Save Food', ecoPoints: 1500, location: 'Lahore', joinedAt: '2024-02-28' },
        { id: 'admin1', name: 'System Admin', email: 'admin@ecobite.pk', type: 'admin', ecoPoints: 0, location: 'HQ', joinedAt: '2023-11-01' },
      ];

      // In production/Vercel, only seed essential users
      if (isVercel) {
        mockUsers = [
          { id: 'u1', name: 'Ali Khan', email: 'ali@example.com', type: 'individual', ecoPoints: 1250, location: 'Islamabad', joinedAt: '2024-01-15' },
          { id: 'admin1', name: 'System Admin', email: 'admin@ecobite.pk', type: 'admin', ecoPoints: 0, location: 'HQ', joinedAt: '2023-11-01' }
        ];
      }

      for (const u of mockUsers) {
        const hashedPassword = await bcrypt.hash('User@123', 1);
        await db.run(
          `INSERT INTO users (id, email, password, name, type, organization, ecoPoints, location, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.email, hashedPassword, u.name, u.type, u.organization || '', u.ecoPoints, u.location || '', u.joinedAt]
        );
      }
      console.log(`Seeded ${mockUsers.length} mock users`);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    // If even the mock DB fails (unlikely), we re-throw
    throw error;
  }

  console.log('Database initialized');
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
