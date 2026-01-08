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
    ]
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
          // params: [id, email, password, name, type, organization, licenseId, location, ecoPoints, lat, lng]
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
            lat: params[9] || null,
            lng: params[10] || null,
            createdAt: new Date().toISOString()
          });
        } else if (table === 'donations') {
          // params: [id, donorId, status, expiry, aiFoodType, aiQualityScore, imageUrl, description, quantity, lat, lng, recommendations]
          this.data.donations.push({
            id: params[0], donorId: params[1], status: params[2], expiry: params[3],
            aiFoodType: params[4], aiQualityScore: params[5], imageUrl: params[6],
            description: params[7], quantity: params[8], lat: params[9], lng: params[10],
            recommendations: params[11] || 'Food',
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
        } else if (table === 'sponsor_banners') {
          // params: [id, name, type, imageUrl, logoUrl, content, description, backgroundColor, link, active, placement, impressions, clicks, durationMinutes, startedAt, expiresAt, ownerId, targetDashboards, campaignName, status, awardType, startDate, endDate, createdAt]
          this.data.sponsor_banners.push({
            id: params[0],
            name: params[1],
            type: params[2],
            imageUrl: params[3],
            logoUrl: params[4],
            content: params[5],
            description: params[6],
            backgroundColor: params[7],
            link: params[8],
            active: params[9],
            placement: params[10],
            impressions: params[11],
            clicks: params[12],
            durationMinutes: params[13],
            startedAt: params[14],
            expiresAt: params[15],
            ownerId: params[16],
            targetDashboards: params[17],
            campaignName: params[18],
            status: params[19],
            awardType: params[20],
            startDate: params[21],
            endDate: params[22],
            createdAt: params[23]
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
      } else if (lowerSql.includes('update users')) {
        const id = params[params.length - 1];
        const user = this.data.users.find(u => u.id === id);
        if (user) {
          if (lowerSql.includes('set resettoken =')) {
            user.resetToken = params[0];
            user.resetTokenExpiry = params[1];
          } else if (lowerSql.includes('set password =')) {
            user.password = params[0];
            user.resetToken = null;
            user.resetTokenExpiry = null;
          }
        }
      } else if (lowerSql.includes('update sponsor_banners')) {
        const id = params[params.length - 1];
        const banner = this.data.sponsor_banners.find(b => b.id === id);
        if (banner) {
          // Simplistic mock update - just spread the params if it's the full update
          if (params.length > 5) {
            banner.name = params[0];
            banner.type = params[1];
            banner.imageUrl = params[2];
            banner.logoUrl = params[3];
            banner.content = params[4];
            banner.description = params[5];
            banner.backgroundColor = params[6];
            banner.link = params[7];
            banner.active = params[8];
            banner.placement = params[9];
            banner.durationMinutes = params[10];
            banner.targetDashboards = params[11];
            banner.campaignName = params[12];
            banner.status = params[13];
            banner.awardType = params[14];
            banner.startDate = params[15];
            banner.endDate = params[16];
          } else if (lowerSql.includes('set active = ?')) {
            banner.active = params[0];
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
      if (lowerSql.includes('from sponsor_banners')) {
        if (lowerSql.includes('where id = ?')) return this.data.sponsor_banners.find(b => b.id === params[0]);
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
    if (lowerSql.includes('select') && lowerSql.includes('from bank_accounts')) {
      let results = [...this.data.bank_accounts];
      // Filter by userId if specified
      if (lowerSql.includes('userid = ?') || lowerSql.includes('user_id = ?')) {
        const userId = params[0];
        results = results.filter(b => b.userId === userId);
      }
      return results;
    }
    if (lowerSql.includes('select') && lowerSql.includes('from money_requests')) {
      let results = [...this.data.money_requests];
      // Filter by status if specified
      if (lowerSql.includes('status = ?')) {
        const status = params[0];
        results = results.filter(r => r.status === status);
      }
      return results;
    }
    if (lowerSql.includes('select') && lowerSql.includes('from sponsor_banners')) {
      return [...this.data.sponsor_banners];
    }
    return [];
  }
}

export async function initDB() {
  const azureConnString = process.env.AZURE_SQL_CONNECTION_STRING;
  console.log(`Initializing database... (Azure Configured: ${!!azureConnString})`);

  // 1. Try Azure SQL First
  if (azureConnString) {
    try {
      console.log('Attempting to connect to Azure SQL Database...');
      const azureDb = new AzureDatabase({
        connectionString: azureConnString,
        options: {
          encrypt: true,
          trustServerCertificate: false
        }
      } as any);

      await azureDb.initSchema();
      db = azureDb;
      console.log('✅ Azure Database connected and schema initialized.');
      return db;
    } catch (error) {
      console.error('❌ Failed to connect to Azure Database:', error);
      console.warn('⚠️  Continuing without Azure SQL. App will use MockDatabase.');
    }
  }

  // 2. Fallback to MockDatabase (Local/Dev only)
  console.warn('⚠️ Falling back to In-Memory MockDatabase (Data will NOT persist across restarts!)');
  db = new MockDatabase();

  try {
    // Seed Admin User (if not exists)
    const bcrypt = (await import('bcryptjs')).default;
    const adminEmail = 'admin@ecobite.com';
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', [adminEmail]);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const adminId = 'admin-' + Date.now();
      await db.run(
        'INSERT INTO users (id, email, password, name, type, organization, licenseId, location, ecoPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [adminId, adminEmail, hashedPassword, 'Admin User', 'admin', 'EcoBite Admin', null, null, 5000]
      );
      console.log('✅ Admin user created in MockDB');
    }
    console.log('✅ Mock Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
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
