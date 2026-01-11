import { AzureDatabase } from './azure-db.js';
import { v4 as uuidv4 } from 'uuid';

// Initialize DB
let db: any;

// Simple in-memory mock database for fallback
class MockDatabase {
  private data: Record<string, any[]> = {
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

  async exec(_sql: string) {
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

        if (table === 'donations') {
          this.data.donations.push({
            id: params[0], donorId: params[1], status: params[2], weight: params[12] || 1.2,
            createdAt: new Date().toISOString()
          });
        } else if (table === 'users') {
          this.data.users.push({ id: params[0], email: params[1], ecoPoints: 0 });
        } else {
          const mockObj: any = { id: params[0], createdAt: new Date().toISOString() };
          params.forEach((p, idx) => { if (idx > 0) mockObj[`p${idx}`] = p; });
          this.data[table].push(mockObj);
        }
      }
    } else if (lowerSql.includes('update')) {
      if (lowerSql.includes('donations')) {
        const id = params[params.length - 1];
        const donation = this.data.donations.find((d: any) => d.id === id);
        if (donation) {
          if (lowerSql.includes('senderconfirmed = 1')) donation.senderConfirmed = 1;
          if (lowerSql.includes('receiverconfirmed = 1')) donation.receiverConfirmed = 1;
          if (lowerSql.includes('status = ?')) donation.status = params[0];
        }
      } else if (lowerSql.includes('users')) {
        const id = params[params.length - 1];
        const user = this.data.users.find((u: any) => u.id === id);
        if (user) {
          if (lowerSql.includes('ecopoints = ecopoints +')) user.ecoPoints = (user.ecoPoints || 0) + (params[0] || 0);
          if (lowerSql.includes('ecopoints = ecopoints -')) user.ecoPoints = Math.max(0, (user.ecoPoints || 0) - (params[0] || 0));
        }
      } else if (lowerSql.includes('settings')) {
        const value = params[0];
        const key = params[1];
        const setting = this.data.settings.find((s: any) => s.key === key);
        if (setting) setting.value = value;
        else this.data.settings.push({ key, value });
      }
    }
    return { lastID: 0, changes: 1 };
  }

  async get(sql: string, paramsInput: any = []) {
    const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
    const lowerSql = sql.toLowerCase();

    // Special case for SUM(weight)
    if (lowerSql.includes('select sum(case')) {
      const isClaimer = lowerSql.includes('claimedbyid');
      const userId = params[0];
      const relevantDonations = this.data.donations.filter((d: any) =>
        (isClaimer ? d.claimedById === userId : d.donorId === userId) &&
        (d.status === 'Completed' || d.status === 'Delivered')
      );
      const total = relevantDonations.reduce((sum, d) => sum + (d.weight || 1.2), 0);
      return { total };
    }

    if (lowerSql.includes('from ')) {
      const match = lowerSql.match(/from\s+(\w+)/);
      const table = match ? match[1] : null;
      if (table && this.data[table]) {
        if (lowerSql.includes('where id = ?')) return this.data[table].find((i: any) => i.id === params[0]);
        if (lowerSql.includes('where email = ?')) return this.data[table].find((i: any) => i.email === params[0]);
        return this.data[table][0];
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
      if (lowerSql.includes('status = ?')) results = results.filter((i: any) => i.status === params[0]);
      if (lowerSql.includes('donorid = ?')) results = results.filter((i: any) => i.donorId === params[0]);
      return results;
    }
    return [];
  }
}

export async function initDB() {
  const azureConnString = process.env.AZURE_SQL_CONNECTION_STRING;
  if (azureConnString) {
    try {
      const azureDb = new AzureDatabase({ connectionString: azureConnString });
      await azureDb.initSchema();
      db = azureDb;
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
