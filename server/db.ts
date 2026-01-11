import { AzureDatabase } from './azure-db.js';
import bcrypt from 'bcryptjs';

// Initialize DB
let db: any;

// Simple in-memory mock database for fallback
class MockDatabase {
  public data: Record<string, any[]> = {
    users: [
      { id: 'admin-hardcoded', email: 'admin@ecobite.com', name: 'Admin User', type: 'admin', ecoPoints: 5000, isVerified: 1, createdAt: new Date().toISOString() },
      { id: 'individual-001', email: 'user@example.com', name: 'Zain Ahmed', type: 'individual', ecoPoints: 450, isVerified: 1, createdAt: new Date().toISOString() }
    ],
    donations: [
      { id: 'd-101', donorId: 'individual-001', status: 'Completed', weight: 4.5, aiFoodType: 'Organic Rice', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'd-102', donorId: 'individual-001', status: 'Delivered', weight: 2.1, aiFoodType: 'Wheat Flour', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    food_requests: [],
    vouchers: [
      { id: 'v1', code: 'ECO50', title: '50% OFF Shipping', minEcoPoints: 500, status: 'active' },
      { id: 'v2', code: 'FREEBURGER', title: 'Free Burger', minEcoPoints: 2000, status: 'active' }
    ],
    voucher_redemptions: [],
    financial_transactions: [],
    fund_balance: [{ id: 1, totalBalance: 150000, totalDonations: 250000, totalWithdrawals: 100000 }],
    admin_logs: [],
    sponsor_banners: [],
    notifications: [],
    settings: [{ key: 'ECOBITE_SETTINGS_DELIVERY_COST', value: '100' }],
    money_donations: [],
    money_requests: [],
    bank_accounts: [],
    activity_logs: []
  };

  private getTable(sql: string): string | null {
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes('from ')) {
      const match = lowerSql.match(/from\s+\[?(\w+)\]?/);
      return match ? match[1] : null;
    }
    if (lowerSql.includes('into ')) {
      const match = lowerSql.match(/into\s+\[?(\w+)\]?/);
      return match ? match[1] : null;
    }
    if (lowerSql.includes('update ')) {
      const match = lowerSql.match(/update\s+\[?(\w+)\]?/);
      return match ? match[1] : null;
    }
    return null;
  }

  async exec(_sql: string) {
    return;
  }

  async run(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();
    const table = this.getTable(sql);

    console.log(`MockDB RUN [${table}]:`, sql.substring(0, 100));

    if (lowerSql.includes('insert into') && table) {
      if (!this.data[table]) this.data[table] = [];

      if (table === 'donations') {
        this.data.donations.push({
          id: params[0], donorId: params[1], status: params[2], weight: params[12] || 1.2,
          createdAt: new Date().toISOString()
        });
      } else if (table === 'money_donations') {
        this.data.money_donations.push({
          id: params[0], donorId: params[1], donorRole: params[2], amount: params[3],
          status: 'pending', createdAt: new Date().toISOString()
        });
      } else {
        const mockObj: any = { id: params[0], createdAt: new Date().toISOString() };
        params.forEach((p, idx) => { if (idx >= 0) mockObj[`p${idx}`] = p; });
        this.data[table].push(mockObj);
      }
    } else if (lowerSql.includes('update') && table) {
      const id = params[params.length - 1];
      const items = this.data[table];
      if (items) {
        const item = items.find((i: any) => (i.id === id || i.key === id));
        if (item) {
          if (lowerSql.includes('senderconfirmed = 1')) item.senderConfirmed = 1;
          if (lowerSql.includes('receiverconfirmed = 1')) item.receiverConfirmed = 1;
          if (lowerSql.includes('status = ?')) item.status = params[0];
          if (lowerSql.includes("status = 'completed'")) item.status = 'completed';
          if (lowerSql.includes("status = 'rejected'")) item.status = 'rejected';
          if (lowerSql.includes('ecopoints = ecopoints +')) item.ecoPoints = (item.ecoPoints || 0) + (params[0] || 0);
          if (lowerSql.includes('ecopoints = ecopoints -')) item.ecoPoints = Math.max(0, (item.ecoPoints || 0) - (params[0] || 0));
          if (lowerSql.includes('isverified = ?')) item.isVerified = params[0];
          if (lowerSql.includes('reviewrequested = 0')) item.reviewRequested = 0;
          if (lowerSql.includes('verifiedby = ?')) item.verifiedBy = params[0];
          if (lowerSql.includes('value = ?')) item.value = params[0];
        } else if (table === 'settings') {
          // Fallback for settings upsert in mock
          this.data.settings.push({ key: id, value: params[0] });
        }
      }
    }
    return { lastID: 0, changes: 1 };
  }

  async get(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();

    if (lowerSql.includes('select sum(case')) {
      const isClaimer = lowerSql.includes('claimedbyid');
      const userId = params[0];
      const relevantDonations = this.data.donations.filter((d: any) =>
        (isClaimer ? d.claimedById === userId : d.donorId === userId) && d.status === 'Completed'
      );
      const total = relevantDonations.reduce((sum, d) => sum + (d.weight || 1.2), 0);
      return { total };
    }

    const table = this.getTable(sql);
    if (table && this.data[table]) {
      if (lowerSql.includes('where id = ?')) return this.data[table].find((i: any) => i.id === params[0]);
      if (lowerSql.includes('where email = ?')) return this.data[table].find((i: any) => i.email === params[0]);
      return this.data[table][0];
    }
    return undefined;
  }

  async all(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();
    const table = this.getTable(sql);

    if (table && this.data[table]) {
      let results = [...this.data[table]];
      if (lowerSql.includes('status = ?')) results = results.filter((i: any) => i.status === params[0]);
      if (lowerSql.includes('donorid = ?')) results = results.filter((i: any) => i.donorId === params[0]);
      if (lowerSql.includes('claimedbyid = ?')) results = results.filter((i: any) => i.claimedById === params[0]);
      return results;
    }
    return [];
  }
}

async function runSeed(database: any) {
  try {
    const adminEmail = 'admin@ecobite.com';
    const existingAdmin = await database.get('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await database.run(
        'INSERT INTO users (id, email, password, name, type, organization, licenseId, location, ecoPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['admin-hardcoded', adminEmail, hashedPassword, 'Admin User', 'admin', 'EcoBite Admin', 'ADMIN-001', 'Global', 5000]
      );
    }
  } catch (e) {
    console.error('Seed Error:', e);
  }
}

export async function initDB() {
  const azureConnString = process.env.AZURE_SQL_CONNECTION_STRING;
  if (azureConnString) {
    try {
      const azureDb = new AzureDatabase({ connectionString: azureConnString });
      await azureDb.initSchema();
      db = azureDb;
      await runSeed(db);
      return db;
    } catch (e) {
      console.warn('Azure connection failed, using mock.', e);
    }
  }
  db = new MockDatabase();
  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}
