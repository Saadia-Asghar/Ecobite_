import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ecobite',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Database helper functions
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

export const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args: any[]) => {
        client.lastQuery = args;
        return query(...args);
    };

    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release();
    };

    return client;
};

// Initialize database schema
export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database schema...');

        // Create tables
        await query(`
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('individual', 'restaurant', 'ngo', 'shelter', 'fertilizer', 'admin')),
                phone TEXT,
                address TEXT,
                organization TEXT,
                latitude REAL,
                longitude REAL,
                eco_points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Donations table
            CREATE TABLE IF NOT EXISTS donations (
                id TEXT PRIMARY KEY,
                donor_id TEXT NOT NULL,
                donor_role TEXT NOT NULL,
                food_type TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT NOT NULL,
                expiry_date TIMESTAMP,
                pickup_address TEXT,
                latitude REAL,
                longitude REAL,
                image_url TEXT,
                status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'completed', 'cancelled')),
                claimed_by TEXT,
                claimed_at TIMESTAMP,
                sender_confirmed INTEGER DEFAULT 0,
                receiver_confirmed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (donor_id) REFERENCES users(id),
                FOREIGN KEY (claimed_by) REFERENCES users(id)
            );
            
            -- Food requests table
            CREATE TABLE IF NOT EXISTS food_requests (
                id TEXT PRIMARY KEY,
                requester_id TEXT NOT NULL,
                requester_role TEXT NOT NULL CHECK (requester_role IN ('ngo', 'shelter', 'fertilizer')),
                food_type TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT NOT NULL,
                urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
                purpose TEXT,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users(id)
            );
            
            -- Vouchers table
            CREATE TABLE IF NOT EXISTS vouchers (
                id TEXT PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                points_required INTEGER NOT NULL,
                discount_percentage INTEGER,
                max_redemptions INTEGER DEFAULT 1,
                current_redemptions INTEGER DEFAULT 0,
                expiry_date TIMESTAMP,
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Voucher redemptions table
            CREATE TABLE IF NOT EXISTS voucher_redemptions (
                id TEXT PRIMARY KEY,
                voucher_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                points_spent INTEGER NOT NULL,
                redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            
            -- Financial transactions table
            CREATE TABLE IF NOT EXISTS financial_transactions (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL CHECK (type IN ('donation', 'withdrawal', 'refund')),
                amount REAL NOT NULL,
                user_id TEXT NOT NULL,
                category TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            
            -- Fund balance table
            CREATE TABLE IF NOT EXISTS fund_balance (
                id INTEGER PRIMARY KEY DEFAULT 1,
                total_balance REAL DEFAULT 0,
                total_donations REAL DEFAULT 0,
                total_withdrawals REAL DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CHECK (id = 1)
            );
            
            -- Money donations table
            CREATE TABLE IF NOT EXISTS money_donations (
                id TEXT PRIMARY KEY,
                donor_id TEXT NOT NULL,
                donor_role TEXT NOT NULL CHECK (donor_role = 'individual'),
                amount REAL NOT NULL CHECK (amount > 0),
                payment_method TEXT NOT NULL,
                transaction_id TEXT,
                status TEXT DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (donor_id) REFERENCES users(id)
            );
            
            -- Money requests table
            CREATE TABLE IF NOT EXISTS money_requests (
                id TEXT PRIMARY KEY,
                requester_id TEXT NOT NULL,
                requester_role TEXT NOT NULL CHECK (requester_role IN ('ngo', 'shelter', 'fertilizer')),
                amount REAL NOT NULL CHECK (amount > 0),
                purpose TEXT NOT NULL,
                distance REAL,
                transport_rate REAL,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                rejection_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP,
                reviewed_by TEXT,
                FOREIGN KEY (requester_id) REFERENCES users(id),
                FOREIGN KEY (reviewed_by) REFERENCES users(id)
            );
            
            -- Bank accounts table
            CREATE TABLE IF NOT EXISTS bank_accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                account_holder_name TEXT NOT NULL,
                bank_name TEXT NOT NULL,
                account_number TEXT NOT NULL,
                iban TEXT,
                branch_code TEXT,
                account_type TEXT DEFAULT 'savings' CHECK (account_type IN ('savings', 'current', 'business')),
                is_default INTEGER DEFAULT 1,
                is_verified INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            
            -- Notifications table
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT,
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            
            -- Sponsor banners table
            CREATE TABLE IF NOT EXISTS sponsor_banners (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                link_url TEXT,
                target_role TEXT,
                points_cost INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Ad redemption requests table
            CREATE TABLE IF NOT EXISTS ad_redemption_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                banner_id TEXT NOT NULL,
                points_spent INTEGER NOT NULL,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (banner_id) REFERENCES sponsor_banners(id)
            );
            
            -- Admin logs table
            CREATE TABLE IF NOT EXISTS admin_logs (
                id TEXT PRIMARY KEY,
                admin_id TEXT NOT NULL,
                action TEXT NOT NULL,
                target_type TEXT,
                target_id TEXT,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id)
            );
        `);

        // Initialize fund balance if not exists
        await query(`
            INSERT INTO fund_balance (id, total_balance, total_donations, total_withdrawals)
            VALUES (1, 0, 0, 0)
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('✅ Database schema initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};

export default pool;
