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
      { id: 'u1', name: 'Ali Khan', email: 'ali@example.com', type: 'individual', ecoPoints: 1250, location: 'Islamabad', joinedAt: '2024-01-15' },
      { id: 'u2', name: 'Spice Bazaar', email: 'contact@spicebazaar.pk', type: 'restaurant', organization: 'Spice Bazaar', ecoPoints: 3500, location: 'Lahore', joinedAt: '2024-02-01' },
      { id: 'u3', name: 'Edhi Foundation', email: 'info@edhi.org', type: 'ngo', organization: 'Edhi', ecoPoints: 5000, location: 'Karachi', joinedAt: '2023-12-10' },
      { id: 'u4', name: 'Sara Ahmed', email: 'sara@example.com', type: 'individual', ecoPoints: 450, location: 'Rawalpindi', joinedAt: '2024-03-20' },
      { id: 'u5', name: 'Burger Lab', email: 'manager@burgerlab.pk', type: 'restaurant', organization: 'Burger Lab', ecoPoints: 2100, location: 'Islamabad', joinedAt: '2024-01-05' },
      { id: 'u6', name: 'Fatima Jinnah', email: 'fatima@example.com', type: 'individual', ecoPoints: 800, location: 'Karachi', joinedAt: '2024-04-12' },
      { id: 'u7', name: 'Save Food NGO', email: 'help@savefood.org', type: 'ngo', organization: 'Save Food', ecoPoints: 1500, location: 'Lahore', joinedAt: '2024-02-28' },
      { id: 'admin1', name: 'System Admin', email: 'admin@ecobite.pk', type: 'admin', ecoPoints: 0, location: 'HQ', joinedAt: '2023-11-01' },
    ];

    for (const u of mockUsers) {
      const hashedPassword = await bcrypt.hash('User@123', 10);
      await db.run(
        `INSERT INTO users (id, email, password, name, type, organization, ecoPoints, location, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.email, hashedPassword, u.name, u.type, u.organization || '', u.ecoPoints, u.location || '', u.joinedAt]
      );
    }
    console.log(`Seeded ${mockUsers.length} mock users`);

    // Seed mock donations
    const mockDonations = [
      {
        id: 'd1', donorId: 'u1', status: 'Available', expiry: '2024-12-05', aiFoodType: 'Fresh Vegetables',
        aiQualityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=400',
        description: 'Fresh organic vegetables from our garden.', quantity: '5 kg', lat: 33.6844, lng: 73.0479, createdAt: '2024-12-01'
      },
      {
        id: 'd2', donorId: 'u2', status: 'Available', expiry: '2024-12-03', aiFoodType: 'Bread Loaves',
        aiQualityScore: 88, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        description: 'Day-old bread, perfectly good for consumption.', quantity: '10 loaves', lat: 33.69, lng: 73.05, createdAt: '2024-12-01'
      },
      {
        id: 'd3', donorId: 'u3', status: 'Completed', expiry: '2024-11-28', aiFoodType: 'Rice & Curry',
        aiQualityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400',
        description: 'Leftover catering food, hygienic and packed.', quantity: '20 servings', lat: 33.70, lng: 73.06, createdAt: '2024-11-25',
        claimedById: 'u3', receiverConfirmed: 1, senderConfirmed: 1
      },
      {
        id: 'd4', donorId: 'u2', status: 'Claimed', expiry: '2024-12-02', aiFoodType: 'Chicken Biryani',
        aiQualityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400',
        description: 'Excess food from event.', quantity: '15 kg', lat: 33.71, lng: 73.07, createdAt: '2024-11-30',
        claimedById: 'u7', receiverConfirmed: 0, senderConfirmed: 1
      },
      {
        id: 'd5', donorId: 'u5', status: 'Expired', expiry: '2024-11-20', aiFoodType: 'Mixed Fruits',
        aiQualityScore: 75, imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400',
        description: 'Seasonal fruits.', quantity: '3 kg', lat: 33.72, lng: 73.08, createdAt: '2024-11-15'
      }
    ];

    for (const d of mockDonations) {
      await db.run(
        `INSERT INTO donations (id, donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng, senderConfirmed, receiverConfirmed, claimedById, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.donorId, d.status, d.expiry, d.aiFoodType, d.aiQualityScore, d.imageUrl, d.description, d.quantity, d.lat, d.lng, d.senderConfirmed || 0, d.receiverConfirmed || 0, d.claimedById || null, d.createdAt]
      );
    }
    console.log(`Seeded ${mockDonations.length} mock donations`);

    // Seed mock vouchers
    const mockVouchers = [
      {
        id: 'v1', code: 'ECO50', title: '50% OFF Shipping', description: 'Get 50% off on your next food delivery shipping cost.',
        discountType: 'percentage', discountValue: 50, minEcoPoints: 500, maxRedemptions: 100, currentRedemptions: 45,
        status: 'active', expiryDate: '2025-12-31', createdAt: '2024-01-01'
      },
      {
        id: 'v2', code: 'FREEBURGER', title: 'Free Burger', description: 'Redeem for a free Zinger burger at participating outlets.',
        discountType: 'fixed', discountValue: 100, minEcoPoints: 2000, maxRedemptions: 50, currentRedemptions: 12,
        status: 'active', expiryDate: '2025-06-30', createdAt: '2024-02-15'
      },
      {
        id: 'v3', code: 'GROCERY10', title: '10% OFF Groceries', description: '10% discount on eco-friendly grocery partners.',
        discountType: 'percentage', discountValue: 10, minEcoPoints: 300, maxRedemptions: 200, currentRedemptions: 150,
        status: 'active', expiryDate: '2025-12-31', createdAt: '2024-03-01'
      },
      {
        id: 'v4', code: 'SUMMER20', title: 'Summer Sale 20%', description: 'Special summer discount.',
        discountType: 'percentage', discountValue: 20, minEcoPoints: 800, maxRedemptions: 50, currentRedemptions: 50,
        status: 'paused', expiryDate: '2024-08-31', createdAt: '2024-05-01'
      },
      {
        id: 'v5', code: 'WELCOME100', title: 'Welcome Bonus', description: 'PKR 100 off for new eco-warriors.',
        discountType: 'fixed', discountValue: 100, minEcoPoints: 100, maxRedemptions: 500, currentRedemptions: 320,
        status: 'active', expiryDate: '2026-01-01', createdAt: '2024-01-01'
      }
    ];

    for (const v of mockVouchers) {
      await db.run(
        `INSERT INTO vouchers (id, code, title, description, discountType, discountValue, minEcoPoints, maxRedemptions, currentRedemptions, status, expiryDate, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.code, v.title, v.description, v.discountType, v.discountValue, v.minEcoPoints, v.maxRedemptions, v.currentRedemptions, v.status, v.expiryDate, v.createdAt]
      );
    }
    console.log(`Seeded ${mockVouchers.length} mock vouchers`);

    // Seed mock financial transactions
    const mockTransactions = [
      { id: 't1', type: 'donation', amount: 5000, category: 'general', description: 'Monthly Donation from Ali', userId: 'u1', createdAt: '2024-11-01' },
      { id: 't2', type: 'withdrawal', amount: 1200, category: 'transportation', description: 'Fuel for delivery van', createdAt: '2024-11-05' },
      { id: 't3', type: 'donation', amount: 10000, category: 'general', description: 'Corporate CSR Donation', userId: 'u2', createdAt: '2024-11-10' },
      { id: 't4', type: 'withdrawal', amount: 500, category: 'packaging', description: 'Biodegradable boxes', createdAt: '2024-11-15' },
      { id: 't5', type: 'donation', amount: 2500, category: 'general', description: 'Community Fundraiser', createdAt: '2024-11-20' },
      { id: 't6', type: 'withdrawal', amount: 2000, category: 'marketing', description: 'Social Media Ads', createdAt: '2024-11-25' },
    ];

    for (const t of mockTransactions) {
      await db.run(
        `INSERT INTO financial_transactions (id, userId, type, amount, category, description, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.userId || null, t.type, t.amount, t.category, t.description, t.createdAt]
      );
    }
    console.log(`Seeded ${mockTransactions.length} mock financial transactions`);
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
