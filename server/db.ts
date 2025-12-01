import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

// Initialize DB
let db: any;

export async function initDB() {
  const dbPath = process.env.VERCEL ? '/tmp/ecobite.db' : './ecobite.db';
  console.log(`Initializing database at ${dbPath}`);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

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

  // Migration for existing databases
  try {
    await db.exec('ALTER TABLE donations ADD COLUMN senderConfirmed INTEGER DEFAULT 0');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE donations ADD COLUMN receiverConfirmed INTEGER DEFAULT 0');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE donations ADD COLUMN lat REAL');
  } catch (e) { }
  try {
    await db.exec('ALTER TABLE donations ADD COLUMN lng REAL');
  } catch (e) { }

  // Initialize fund balance
  const fundBalance = await db.get('SELECT * FROM fund_balance WHERE id = 1');
  if (!fundBalance) {
    await db.run('INSERT INTO fund_balance (id, totalBalance, totalDonations, totalWithdrawals) VALUES (1, 0, 0, 0)');
  }

  // Seed Users
  const userCount = await db.get('SELECT count(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding mock users...');
    const mockUsers = [
      // Admin
      { id: 'admin-1', email: 'admin@ecobite.com', password: 'Admin@123', name: 'System Admin', type: 'admin', organization: 'EcoBite HQ', ecoPoints: 0, location: 'New York, USA' },

      // Individual Users
      { id: 'user-1', email: 'john.doe@gmail.com', password: 'User@123', name: 'John Doe', type: 'individual', organization: '', ecoPoints: 450, location: 'New York, USA' },
      { id: 'user-2', email: 'sarah.smith@outlook.com', password: 'User@123', name: 'Sarah Smith', type: 'individual', organization: '', ecoPoints: 320, location: 'Los Angeles, USA' },
      { id: 'user-3', email: 'mike.johnson@yahoo.com', password: 'User@123', name: 'Mike Johnson', type: 'individual', organization: '', ecoPoints: 580, location: 'Chicago, USA' },

      // Restaurants
      { id: 'rest-1', email: 'manager@pizzahut.com', password: 'Restaurant@123', name: 'Pizza Hut Manager', type: 'restaurant', organization: 'Pizza Hut Downtown', ecoPoints: 1250, location: 'Manhattan, New York' },
      { id: 'rest-2', email: 'admin@olivegarden.com', password: 'Restaurant@123', name: 'Olive Garden Admin', type: 'restaurant', organization: 'Olive Garden Central', ecoPoints: 980, location: 'Brooklyn, New York' },
      { id: 'rest-3', email: 'contact@subway.com', password: 'Restaurant@123', name: 'Subway Manager', type: 'restaurant', organization: 'Subway Express', ecoPoints: 750, location: 'Queens, New York' },

      // NGOs
      { id: 'ngo-1', email: 'info@feedingamerica.org', password: 'NGO@123', name: 'Feeding America', type: 'ngo', organization: 'Feeding America NYC', ecoPoints: 2100, location: 'New York, USA' },
      { id: 'ngo-2', email: 'contact@foodbank.org', password: 'NGO@123', name: 'Food Bank', type: 'ngo', organization: 'City Food Bank', ecoPoints: 1850, location: 'Los Angeles, USA' },
      { id: 'ngo-3', email: 'help@mealsonwheels.org', password: 'NGO@123', name: 'Meals on Wheels', type: 'ngo', organization: 'Meals on Wheels', ecoPoints: 1600, location: 'Chicago, USA' },

      // Animal Shelters
      { id: 'shelter-1', email: 'info@aspca.org', password: 'Shelter@123', name: 'ASPCA', type: 'shelter', organization: 'ASPCA New York', ecoPoints: 890, location: 'New York, USA' },
      { id: 'shelter-2', email: 'contact@humanesociety.org', password: 'Shelter@123', name: 'Humane Society', type: 'shelter', organization: 'Humane Society LA', ecoPoints: 720, location: 'Los Angeles, USA' },

      // Fertilizer/Waste Management
      { id: 'fert-1', email: 'operations@greencycle.com', password: 'Fertilizer@123', name: 'GreenCycle Ops', type: 'fertilizer', organization: 'GreenCycle Waste Management', ecoPoints: 1450, location: 'New Jersey, USA' },
      { id: 'fert-2', email: 'admin@ecocompost.com', password: 'Fertilizer@123', name: 'EcoCompost Admin', type: 'fertilizer', organization: 'EcoCompost Solutions', ecoPoints: 1120, location: 'California, USA' }
    ];

    for (const u of mockUsers) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await db.run(
        `INSERT INTO users (id, email, password, name, type, organization, ecoPoints, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.email, hashedPassword, u.name, u.type, u.organization, u.ecoPoints, u.location]
      );
    }
    console.log('Seeded 15 mock users across all roles');

    // Seed mock donations
    const mockDonations = [
      { id: 'don-1', userId: 'user-1', foodType: 'Pizza', quantity: '2 large pizzas', status: 'Available', location: 'Manhattan, New York', aiQualityScore: 95, aiFoodType: 'Pizza', createdAt: new Date('2024-11-25').toISOString() },
      { id: 'don-2', userId: 'rest-1', foodType: 'Pasta', quantity: '5 kg', status: 'Available', location: 'Manhattan, New York', aiQualityScore: 92, aiFoodType: 'Pasta', createdAt: new Date('2024-11-26').toISOString() },
      { id: 'don-3', userId: 'user-2', foodType: 'Bread', quantity: '10 loaves', status: 'Available', location: 'Brooklyn, New York', aiQualityScore: 88, aiFoodType: 'Bread', createdAt: new Date('2024-11-27').toISOString() },
      { id: 'don-4', userId: 'rest-2', foodType: 'Vegetables', quantity: '15 kg mixed', status: 'Claimed', location: 'Brooklyn, New York', aiQualityScore: 90, aiFoodType: 'Vegetables', createdAt: new Date('2024-11-28').toISOString() },
      { id: 'don-5', userId: 'user-3', foodType: 'Rice', quantity: '8 kg', status: 'Available', location: 'Queens, New York', aiQualityScore: 94, aiFoodType: 'Rice', createdAt: new Date('2024-11-29').toISOString() },
      { id: 'don-6', userId: 'rest-3', foodType: 'Sandwiches', quantity: '20 sandwiches', status: 'Available', location: 'Queens, New York', aiQualityScore: 85, aiFoodType: 'Sandwiches', createdAt: new Date('2024-11-30').toISOString() },
      { id: 'don-7', userId: 'user-1', foodType: 'Fruits', quantity: '10 kg apples', status: 'Completed', location: 'Manhattan, New York', aiQualityScore: 91, aiFoodType: 'Fruits', createdAt: new Date('2024-11-20').toISOString() },
      { id: 'don-8', userId: 'rest-1', foodType: 'Chicken', quantity: '5 kg cooked', status: 'Available', location: 'Manhattan, New York', aiQualityScore: 89, aiFoodType: 'Chicken', createdAt: new Date('2024-12-01').toISOString() }
    ];

    for (const d of mockDonations) {
      await db.run(
        `INSERT INTO donations (id, userId, foodType, quantity, status, location, aiQualityScore, aiFoodType, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.userId, d.foodType, d.quantity, d.status, d.location, d.aiQualityScore, d.aiFoodType, d.createdAt]
      );
    }
    console.log('Seeded 8 mock donations');

    // Seed mock vouchers
    const mockVouchers = [
      { id: 'vouch-1', code: 'SAVE20', title: '20% Off Pizza', description: 'Get 20% off on any pizza order', discountType: 'percentage', discountValue: 20, minEcoPoints: 100, maxRedemptions: 50, currentRedemptions: 12, status: 'active', expiryDate: new Date('2025-12-31').toISOString(), createdAt: new Date().toISOString() },
      { id: 'vouch-2', code: 'PASTA15', title: '15% Off Pasta', description: 'Enjoy 15% discount on pasta dishes', discountType: 'percentage', discountValue: 15, minEcoPoints: 150, maxRedemptions: 30, currentRedemptions: 8, status: 'active', expiryDate: new Date('2025-12-31').toISOString(), createdAt: new Date().toISOString() },
      { id: 'vouch-3', code: 'BURGER10', title: '$10 Off Burgers', description: 'Save $10 on burger meals', discountType: 'fixed', discountValue: 10, minEcoPoints: 200, maxRedemptions: 40, currentRedemptions: 15, status: 'active', expiryDate: new Date('2025-12-31').toISOString(), createdAt: new Date().toISOString() },
      { id: 'vouch-4', code: 'SALAD25', title: '25% Off Salads', description: 'Healthy choice discount', discountType: 'percentage', discountValue: 25, minEcoPoints: 120, maxRedemptions: 25, currentRedemptions: 5, status: 'paused', expiryDate: new Date('2025-12-31').toISOString(), createdAt: new Date().toISOString() },
      { id: 'vouch-5', code: 'COFFEE5', title: '$5 Off Coffee', description: 'Morning boost discount', discountType: 'fixed', discountValue: 5, minEcoPoints: 50, maxRedemptions: 100, currentRedemptions: 45, status: 'active', expiryDate: new Date('2025-12-31').toISOString(), createdAt: new Date().toISOString() }
    ];

    for (const v of mockVouchers) {
      await db.run(
        `INSERT INTO vouchers (id, code, title, description, discountType, discountValue, minEcoPoints, maxRedemptions, currentRedemptions, status, expiryDate, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.code, v.title, v.description, v.discountType, v.discountValue, v.minEcoPoints, v.maxRedemptions, v.currentRedemptions, v.status, v.expiryDate, v.createdAt]
      );
    }
    console.log('Seeded 5 mock vouchers');

    // Seed mock financial transactions
    const mockTransactions = [
      { id: 'trans-1', userId: 'ngo-1', type: 'donation', amount: 500, category: 'general', description: 'Monthly donation from supporter', createdAt: new Date('2024-11-01').toISOString() },
      { id: 'trans-2', userId: 'rest-1', type: 'donation', amount: 750, category: 'general', description: 'Restaurant partnership donation', createdAt: new Date('2024-11-05').toISOString() },
      { id: 'trans-3', userId: 'ngo-1', type: 'withdrawal', amount: 200, category: 'transportation', description: 'Food delivery costs', createdAt: new Date('2024-11-10').toISOString() },
      { id: 'trans-4', userId: 'user-1', type: 'donation', amount: 100, category: 'general', description: 'Individual contribution', createdAt: new Date('2024-11-15').toISOString() },
      { id: 'trans-5', userId: 'ngo-2', type: 'withdrawal', amount: 150, category: 'packaging', description: 'Food packaging materials', createdAt: new Date('2024-11-18').toISOString() },
      { id: 'trans-6', userId: 'rest-2', type: 'donation', amount: 600, category: 'general', description: 'Weekly surplus donation', createdAt: new Date('2024-11-20').toISOString() },
      { id: 'trans-7', userId: 'shelter-1', type: 'withdrawal', amount: 120, category: 'transportation', description: 'Animal food transport', createdAt: new Date('2024-11-22').toISOString() },
      { id: 'trans-8', userId: 'user-2', type: 'donation', amount: 250, category: 'general', description: 'Community support', createdAt: new Date('2024-11-25').toISOString() },
      { id: 'trans-9', userId: 'rest-3', type: 'donation', amount: 450, category: 'general', description: 'End of day surplus', createdAt: new Date('2024-11-28').toISOString() },
      { id: 'trans-10', userId: 'fert-1', type: 'withdrawal', amount: 180, category: 'other', description: 'Composting equipment', createdAt: new Date('2024-11-30').toISOString() }
    ];

    for (const t of mockTransactions) {
      await db.run(
        `INSERT INTO financial_transactions (id, userId, type, amount, category, description, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.userId, t.type, t.amount, t.category, t.description, t.createdAt]
      );
    }
    console.log('Seeded 10 mock financial transactions');
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
