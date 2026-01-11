import { AzureDatabase } from './azure-db.js';

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
    fund_balance: [{ id: 1, totalBalance: 150000, totalDonations: 250000, totalWithdrawals: 100000 }],
    admin_logs: [],
    sponsor_banners: [],
    ad_redemption_requests: [],
    notifications: [],
    money_donations: [],
    settings: [
      { key: 'ECOBITE_SETTINGS_DELIVERY_COST', value: '100' }
    ],
    money_requests: [
      {
        id: 'req-1',
        requesterId: 'ngo-001',
        requesterRole: 'ngo',
        amount: 50000,
        purpose: 'Food supplies for 100 families',
        distance: 25,
        transportRate: 50,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'req-2',
        requesterId: 'shelter-001',
        requesterRole: 'shelter',
        amount: 30000,
        purpose: 'Animal food and medical supplies',
        distance: 15,
        transportRate: 40,
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'req-3',
        requesterId: 'fertilizer-001',
        requesterRole: 'fertilizer',
        amount: 25000,
        purpose: 'Composting equipment and transportation',
        distance: 30,
        transportRate: 60,
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'req-4',
        requesterId: 'ngo-001',
        requesterRole: 'ngo',
        amount: 75000,
        purpose: 'Emergency relief fund for flood victims',
        status: 'approved',
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: 'admin-001',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'req-5',
        requesterId: 'shelter-001',
        requesterRole: 'shelter',
        amount: 15000,
        purpose: 'Insufficient documentation provided',
        status: 'rejected',
        rejectionReason: 'Please provide detailed breakdown of expenses',
        reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: 'admin-001',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bank_accounts: [
      {
        id: 'bank-1',
        userId: 'ngo-001',
        accountHolderName: 'Green Earth NGO',
        bankName: 'HBL Bank',
        accountNumber: '1234567890',
        iban: 'PK36HBLA0000001234567890',
        branchCode: '0123',
        accountType: 'current',
        isDefault: 1,
        isVerified: 1,
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bank-2',
        userId: 'ngo-001',
        accountHolderName: 'Green Earth NGO',
        bankName: 'EasyPaisa',
        accountNumber: '03001234567',
        accountType: 'mobile_wallet',
        isDefault: 0,
        isVerified: 1,
        status: 'active',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bank-3',
        userId: 'shelter-001',
        accountHolderName: 'Animal Shelter Foundation',
        bankName: 'MCB Bank',
        accountNumber: '9876543210',
        iban: 'PK45MCBA0000009876543210',
        branchCode: '0456',
        accountType: 'savings',
        isDefault: 1,
        isVerified: 1,
        status: 'active',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bank-4',
        userId: 'shelter-001',
        accountHolderName: 'Animal Shelter Foundation',
        bankName: 'JazzCash',
        accountNumber: '03009876543',
        accountType: 'mobile_wallet',
        isDefault: 0,
        isVerified: 0,
        status: 'active',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bank-5',
        userId: 'fertilizer-001',
        accountHolderName: 'Eco Compost Ltd',
        bankName: 'UBL Bank',
        accountNumber: '5555666677',
        iban: 'PK78UBLA0000005555666677',
        branchCode: '0789',
        accountType: 'business',
        isDefault: 1,
        isVerified: 1,
        status: 'active',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bank-6',
        userId: 'fertilizer-001',
        accountHolderName: 'Eco Compost Ltd',
        bankName: 'PayPal',
        accountNumber: 'ecocompost@business.com',
        accountType: 'digital_payment',
        isDefault: 0,
        isVerified: 1,
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    activity_logs: []
  };

  async exec(_sql: string) {
    // Basic parsing to create tables (noop in mock)
    return;
  }

  async run(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();

    if (lowerSql.includes('insert into')) {
      const tableNameMatch = lowerSql.match(/insert into (\w+)/);
      if (tableNameMatch) {
        const table = tableNameMatch[1];
        if (!this.data[table]) this.data[table] = [];
        console.log('MockDB INSERT:', table);

        if (table === 'users') {
          this.data.users.push({
            id: params[0], email: params[1], password: params[2], name: params[3],
            type: params[4], organization: params[5] || null, licenseId: params[6] || null,
            location: params[7] || null, ecoPoints: params[8] || 0,
            lat: params[9] || null, lng: params[10] || null, createdAt: new Date().toISOString()
          });
        } else if (table === 'donations') {
          this.data.donations.push({
            id: params[0], donorId: params[1], status: params[2], expiry: params[3],
            aiFoodType: params[4], aiQualityScore: params[5], imageUrl: params[6],
            description: params[7], quantity: params[8], lat: params[9], lng: params[10],
            recommendations: params[11] || 'Food', senderConfirmed: 0, receiverConfirmed: 0,
            createdAt: new Date().toISOString()
          });
        } else if (table === 'food_requests') {
          this.data.food_requests.push({
            id: params[0], requesterId: params[1], foodType: params[2],
            quantity: params[3], aiDrafts: params[4],
            createdAt: new Date().toISOString()
          });
        } else if (table === 'money_donations') {
          this.data.money_donations.push({
            id: params[0], donorId: params[1], donorRole: params[2], amount: params[3],
            paymentMethod: params[4], transactionId: params[5], status: 'pending',
            proofImage: params[6], accountUsed: params[7], notes: params[8],
            createdAt: new Date().toISOString()
          });
        } else if (table === 'settings') {
          this.data.settings.push({
            key: params[0],
            value: params[1],
            updatedAt: new Date().toISOString()
          });
        } else if (table === 'sponsor_banners' || table === 'banners') {
          const targetTable = this.data.sponsor_banners ? 'sponsor_banners' : 'banners';
          this.data[targetTable].push({
            id: params[0], name: params[1], imageUrl: params[2], link: params[3],
            active: params[4], category: params[5] || 'all',
            createdAt: new Date().toISOString()
          });
        } else if (table === 'financial_transactions') {
          this.data.financial_transactions.push({
            id: params[0], type: params[1], amount: params[2], userId: params[3],
            category: params[4], description: params[5], createdAt: new Date().toISOString()
          });
        } else {
          // Generic insert for other tables
          const mockObj: any = { id: params[0], createdAt: new Date().toISOString() };
          params.forEach((p, idx) => { if (idx > 0) mockObj[`param${idx}`] = p; });
          this.data[table].push(mockObj);
        }
      }
    } else if (lowerSql.includes('update')) {
      if (lowerSql.includes('donations') && !lowerSql.includes('money_donations')) {
        const status = params[0];
        const claimedById = params[1];
        const id = params[params.length - 1];
        const donation = this.data.donations.find((d: any) => d.id === id);
        if (donation) {
          donation.status = status;
          donation.claimedById = claimedById;
          donation.senderConfirmed = 0;
          donation.receiverConfirmed = 0;
          donation.claimedAt = new Date().toISOString();
        }
      } else if (lowerSql.includes('money_donations')) {
        const id = params[params.length - 1];
        const donation = this.data.money_donations.find((d: any) => d.id === id);
        if (donation) {
          if (lowerSql.includes('status = \'completed\'')) {
            donation.status = 'completed';
            donation.verifiedBy = params[0];
            donation.verifiedAt = new Date().toISOString();
            donation.reviewRequested = 0;
          } else if (lowerSql.includes('status = \'rejected\'')) {
            donation.status = 'rejected';
            donation.verifiedBy = params[0];
            donation.verifiedAt = new Date().toISOString();
            donation.rejectionReason = params[1];
            donation.reviewRequested = 0;
          } else if (lowerSql.includes('reviewrequested = 1')) {
            donation.reviewRequested = 1;
            donation.reviewReason = params[0];
            donation.reviewDate = new Date().toISOString();
            donation.status = 'pending';
          }
        }
      } else if (lowerSql.includes('users')) {
        const id = params[params.length - 1];
        const user = this.data.users.find((u: any) => u.id === id);
        if (user) {
          if (lowerSql.includes('ecopoints = ecopoints +')) {
            user.ecoPoints = (user.ecoPoints || 0) + params[0];
          } else if (lowerSql.includes('isverified =')) {
            user.isVerified = params[0];
          }
        }
      } else if (lowerSql.includes('fund_balance')) {
        if (!this.data.fund_balance[0]) {
          this.data.fund_balance.push({ id: 1, totalBalance: 0, totalDonations: 0, totalWithdrawals: 0, updatedAt: new Date().toISOString() });
        }
        const balance = this.data.fund_balance[0];
        if (lowerSql.includes('totalbalance = totalbalance +')) {
          balance.totalBalance += params[0];
          balance.totalDonations += params[1];
        } else if (lowerSql.includes('totalbalance = totalbalance -')) {
          balance.totalBalance -= params[0];
          balance.totalWithdrawals += params[1];
        }
        balance.updatedAt = new Date().toISOString();
      } else if (lowerSql.includes('settings')) {
        const value = params[0];
        const key = params[1];
        const settingIndex = this.data.settings.findIndex((s: any) => s.key === key);
        if (settingIndex !== -1) {
          this.data.settings[settingIndex].value = value;
          this.data.settings[settingIndex].updatedAt = new Date().toISOString();
        } else {
          this.data.settings.push({ key, value, updatedAt: new Date().toISOString() });
        }
      }
    }

    return { lastID: 0, changes: 1 };
  }

  async get(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes('from ')) {
      const match = lowerSql.match(/from\s+(\w+)/);
      const table = match ? match[1] : null;

      if (table && this.data[table]) {
        if (lowerSql.includes('where')) {
          // Basic filter: match first param against ID or Email or donorId
          return this.data[table].find((item: any) =>
            item.id === params[0] || item.email === params[0] || item.donorId === params[0] || item.userId === params[0]
          );
        }
        return this.data[table][0]; // Return first if no where
      }
    }
    return undefined;
  }

  async all(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();
    const match = lowerSql.match(/from\s+(\w+)/);
    const table = match ? match[1] : null;

    if (table && this.data[table]) {
      let results = [...this.data[table]];
      if (lowerSql.includes('status = ?')) {
        results = results.filter((item: any) => item.status && item.status.toLowerCase() === (params[0] as string).toLowerCase());
      }
      if (lowerSql.includes('userid = ?') || lowerSql.includes('donorid = ?') || lowerSql.includes('claimedbyid = ?')) {
        results = results.filter((item: any) => (item.userId || item.donorId || item.claimedById) === params[0]);
      }
      return results;
    }
    return [];
  }
}

export async function initDB() {
  const azureConnString = process.env.AZURE_SQL_CONNECTION_STRING;
  console.log(`Initializing database... (Azure Configured: ${!!azureConnString})`);

  // 1. Try Azure SQL First (WITH TIMEOUT)
  if (azureConnString) {
    try {
      console.log('Attempting to connect to Azure SQL Database... (3s Timeout)');

      // Create a promise that rejects after 3 seconds
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Azure SQL Connection Timeout')), 3000)
      );

      const azureDb = new AzureDatabase({
        connectionString: azureConnString,
        options: {
          encrypt: true,
          trustServerCertificate: false,
          connectTimeout: 3000 // mssql specific timeout
        }
      } as any);

      // Race the initialization against the timeout
      await Promise.race([azureDb.initSchema(), timeout]);

      db = azureDb;
      console.log('✅ Azure Database connected.');
      return db;
    } catch (error) {
      console.warn('❌ Azure SQL Unreachable:', (error as Error).message);
      console.warn('⚠️  Switching to Robust MockDatabase for Demo Mode.');

      db = new MockDatabase();
      return runSeed(db);
    }
  }

  // 2. Fallback to MockDatabase (Local/Dev only)
  console.warn('⚠️ Falling back to In-Memory MockDatabase (Data will NOT persist across restarts!)');
  db = new MockDatabase();
  return runSeed(db);
}

// Helper to seed the DB (Mock or Real)
async function runSeed(database: any) {
  try {
    // Seed Admin User (if not exists)
    const bcrypt = (await import('bcryptjs')).default;
    const adminEmail = 'admin@ecobite.com';
    const existingAdmin = await database.get('SELECT * FROM users WHERE email = ?', [adminEmail]);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const adminId = 'admin-' + Date.now();
      await database.run(
        'INSERT INTO users (id, email, password, name, type, organization, licenseId, location, ecoPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [adminId, adminEmail, hashedPassword, 'Admin User', 'admin', 'EcoBite Admin', null, null, 5000]
      );
      console.log('✅ Admin user created in Database');
    }
    console.log('✅ Database initialized successfully');
    return database;
  } catch (error) {
    console.error('Database seeding error:', error);
    return database; // Return DB even if seed fails, to avoid total crash
  }
}


export function getDB() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
