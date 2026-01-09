import sql from 'mssql';

export class AzureDatabase {
    private pool: sql.ConnectionPool | null = null;
    private connected: boolean = false;

    constructor(private config: any) {
        // config can be a string, a config object, or our custom wrapper object
    }

    async connect() {
        if (!this.pool || !this.connected) {
            try {
                // Handle different config types
                let connectionConfig = this.config;

                // 1. Handle our custom wrapper object { connectionString, options }
                if (typeof this.config === 'object' && this.config.connectionString) {
                    connectionConfig = this.config.connectionString;
                }

                // 2. Default case: config object or connection string
                this.pool = await sql.connect(connectionConfig);

                this.connected = true;
                console.log('✅ Connected to Azure SQL Database');
            } catch (err) {
                console.error('❌ Failed to connect to Azure SQL:', err);
                throw err;
            }
        }
    }

    /**
     * Convert SQLite '?' parameters to MSSQL @p0, @p1... format
     */
    private prepareQuery(query: string, params: any[]): { sql: string, inputs: { name: string, value: any }[] } {
        let paramIndex = 0;
        const inputs: { name: string, value: any }[] = [];

        // Replace ? with @p0, @p1, etc.
        const azureSql = query.replace(/\?/g, () => {
            const name = `p${paramIndex}`;
            inputs.push({ name, value: params[paramIndex] });
            paramIndex++;
            return `@${name}`;
        });

        return { sql: azureSql, inputs };
    }

    async exec(query: string) {
        await this.connect();
        try {
            // exec for simple statements or scripts
            if (!this.pool) throw new Error('Database pool not initialized');
            const request = this.pool.request();
            await request.batch(query);
            return true;
        } catch (err) {
            console.error('Azure DB exec error:', err);
            throw err;
        }
    }

    async run(query: string, paramsInput: any = []) {
        const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
        await this.connect();
        try {
            if (!this.pool) throw new Error('Database pool not initialized');
            const { sql, inputs } = this.prepareQuery(query, params);
            const request = this.pool.request();

            inputs.forEach(input => {
                request.input(input.name, input.value);
            });

            const result = await request.query(sql);
            return { lastID: 0, changes: result.rowsAffected[0] };
        } catch (err) {
            console.error('Azure DB run error:', err);
            throw err;
        }
    }

    async get(query: string, paramsInput: any = []) {
        const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
        await this.connect();
        try {
            if (!this.pool) throw new Error('Database pool not initialized');
            const { sql, inputs } = this.prepareQuery(query, params);
            const request = this.pool.request();

            inputs.forEach(input => {
                request.input(input.name, input.value);
            });

            const result = await request.query(sql);
            return result.recordset[0];
        } catch (err) {
            console.error('Azure DB get error:', err);
            throw err;
        }
    }

    async all(query: string, paramsInput: any = []) {
        const params = Array.isArray(paramsInput) ? paramsInput : [paramsInput];
        await this.connect();
        try {
            if (!this.pool) throw new Error('Database pool not initialized');
            const { sql, inputs } = this.prepareQuery(query, params);
            const request = this.pool.request();

            inputs.forEach(input => {
                request.input(input.name, input.value);
            });

            const result = await request.query(sql);
            return result.recordset;
        } catch (err) {
            console.error('Azure DB all error:', err);
            throw err;
        }
    }

    async initSchema() {
        await this.connect();
        try {
            console.log('Initializing Azure SQL Schema...');

            // 1. Base Schema - Create tables if they don't exist
            // Note: We keep the CREATE statements basic. Migrations will handle adding extra columns if missing.
            const baseSchema = `
            IF OBJECT_ID('users', 'U') IS NULL
            CREATE TABLE users (
                id NVARCHAR(50) PRIMARY KEY,
                email NVARCHAR(255) UNIQUE,
                password NVARCHAR(MAX),
                name NVARCHAR(255),
                type NVARCHAR(50),
                organization NVARCHAR(255), -- Try to create with these if new
                licenseId NVARCHAR(255),
                location NVARCHAR(MAX),
                ecoPoints INT DEFAULT 0,
                emailNotifications INT DEFAULT 1,
                smsNotifications INT DEFAULT 1,
                resetToken NVARCHAR(MAX),
                resetTokenExpiry BIGINT,
                avatar NVARCHAR(MAX),
                createdAt DATETIME DEFAULT GETDATE()
            );

            IF OBJECT_ID('donations', 'U') IS NULL
            CREATE TABLE donations (
                id NVARCHAR(50) PRIMARY KEY,
                donorId NVARCHAR(50),
                status NVARCHAR(50),
                expiry NVARCHAR(50),
                claimedById NVARCHAR(50),
                aiFoodType NVARCHAR(255),
                aiQualityScore INT,
                imageUrl NVARCHAR(MAX),
                description NVARCHAR(MAX),
                quantity NVARCHAR(255),
                lat FLOAT,
                lng FLOAT,
                senderConfirmed INT DEFAULT 0,
                receiverConfirmed INT DEFAULT 0,
                createdAt DATETIME DEFAULT GETDATE()
            );

            IF OBJECT_ID('food_requests', 'U') IS NULL
            CREATE TABLE food_requests (
                id NVARCHAR(50) PRIMARY KEY,
                requesterId NVARCHAR(50),
                foodType NVARCHAR(255),
                quantity NVARCHAR(255),
                aiDrafts NVARCHAR(MAX),
                createdAt DATETIME DEFAULT GETDATE()
            );

            IF OBJECT_ID('vouchers', 'U') IS NULL
            CREATE TABLE vouchers (
                id NVARCHAR(50) PRIMARY KEY,
                code NVARCHAR(50) UNIQUE,
                title NVARCHAR(255),
                description NVARCHAR(MAX),
                discountType NVARCHAR(50),
                discountValue FLOAT,
                minEcoPoints INT,
                maxRedemptions INT,
                currentRedemptions INT DEFAULT 0,
                status NVARCHAR(50) DEFAULT 'active',
                expiryDate NVARCHAR(50),
                createdAt DATETIME DEFAULT GETDATE()
            );

            IF OBJECT_ID('voucher_redemptions', 'U') IS NULL
            CREATE TABLE voucher_redemptions (
                id NVARCHAR(50) PRIMARY KEY,
                voucherId NVARCHAR(50),
                userId NVARCHAR(50),
                redeemedAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (voucherId) REFERENCES vouchers(id),
                FOREIGN KEY (userId) REFERENCES users(id)
            );

            IF OBJECT_ID('financial_transactions', 'U') IS NULL
            CREATE TABLE financial_transactions (
                id NVARCHAR(50) PRIMARY KEY,
                type NVARCHAR(50),
                amount FLOAT,
                userId NVARCHAR(50),
                donationId NVARCHAR(50),
                category NVARCHAR(50),
                description NVARCHAR(MAX),
                status NVARCHAR(50) DEFAULT 'completed',
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (donationId) REFERENCES donations(id)
            );

            IF OBJECT_ID('fund_balance', 'U') IS NULL
            CREATE TABLE fund_balance (
                id INT PRIMARY KEY CHECK (id = 1),
                totalBalance FLOAT DEFAULT 0,
                totalDonations FLOAT DEFAULT 0,
                totalWithdrawals FLOAT DEFAULT 0,
                updatedAt DATETIME DEFAULT GETDATE()
            );

            IF OBJECT_ID('admin_logs', 'U') IS NULL
            CREATE TABLE admin_logs (
                id NVARCHAR(50) PRIMARY KEY,
                adminId NVARCHAR(50),
                action NVARCHAR(50),
                targetType NVARCHAR(50), -- Added targetType
                targetId NVARCHAR(50),
                details NVARCHAR(MAX),
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (adminId) REFERENCES users(id)
            );

            IF OBJECT_ID('sponsor_banners', 'U') IS NULL
            CREATE TABLE sponsor_banners (
                id NVARCHAR(50) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                type NVARCHAR(50) NOT NULL,
                imageUrl NVARCHAR(MAX),
                logoUrl NVARCHAR(MAX),
                content NVARCHAR(MAX),
                description NVARCHAR(MAX),
                backgroundColor NVARCHAR(50),
                link NVARCHAR(MAX) NOT NULL,
                active INT DEFAULT 1,
                placement NVARCHAR(50) DEFAULT 'dashboard',
                impressions INT DEFAULT 0,
                clicks INT DEFAULT 0,
                durationMinutes INT,
                startedAt DATETIME,
                expiresAt DATETIME,
                ownerId NVARCHAR(50),
                displayOrder INT DEFAULT 0,
                targetDashboards NVARCHAR(MAX),
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (ownerId) REFERENCES users(id)
            );
 
            IF OBJECT_ID('notifications', 'U') IS NULL
            CREATE TABLE notifications (
                id NVARCHAR(50) PRIMARY KEY,
                userId NVARCHAR(50),
                title NVARCHAR(255),
                message NVARCHAR(MAX),
                type NVARCHAR(50) DEFAULT 'info',
                [read] INT DEFAULT 0,
                createdAt DATETIME DEFAULT GETDATE()
            );
            IF OBJECT_ID('ad_redemption_requests', 'U') IS NULL
            CREATE TABLE ad_redemption_requests (
                id NVARCHAR(50) PRIMARY KEY,
                userId NVARCHAR(50) NOT NULL,
                packageId NVARCHAR(50) NOT NULL,
                pointsCost INT NOT NULL,
                durationMinutes INT NOT NULL,
                bannerData NVARCHAR(MAX),
                status NVARCHAR(50) DEFAULT 'pending',
                bannerId NVARCHAR(50),
                rejectionReason NVARCHAR(MAX),
                createdAt DATETIME DEFAULT GETDATE(),
                approvedAt DATETIME,
                rejectedAt DATETIME,
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (bannerId) REFERENCES sponsor_banners(id)
            );

            IF OBJECT_ID('notifications', 'U') IS NULL
            CREATE TABLE notifications (
                id NVARCHAR(50) PRIMARY KEY,
                userId NVARCHAR(50) NOT NULL,
                type NVARCHAR(50) NOT NULL,
                title NVARCHAR(255) NOT NULL,
                message NVARCHAR(MAX) NOT NULL,
                [read] INT DEFAULT 0,
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES users(id)
            );

            IF OBJECT_ID('money_donations', 'U') IS NULL
            CREATE TABLE money_donations (
                id NVARCHAR(50) PRIMARY KEY,
                donorId NVARCHAR(50) NOT NULL,
                donorRole NVARCHAR(50) NOT NULL,
                amount FLOAT NOT NULL,
                paymentMethod NVARCHAR(50),
                transactionId NVARCHAR(50),
                status NVARCHAR(50) DEFAULT 'completed',
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (donorId) REFERENCES users(id)
            );

            IF OBJECT_ID('money_requests', 'U') IS NULL
            CREATE TABLE money_requests (
                id NVARCHAR(50) PRIMARY KEY,
                requesterId NVARCHAR(50) NOT NULL,
                requesterRole NVARCHAR(50) NOT NULL,
                amount FLOAT NOT NULL,
                purpose NVARCHAR(MAX) NOT NULL,
                distance FLOAT,
                transportRate FLOAT,
                status NVARCHAR(50) DEFAULT 'pending',
                rejectionReason NVARCHAR(MAX),
                createdAt DATETIME DEFAULT GETDATE(),
                reviewedAt DATETIME,
                reviewedBy NVARCHAR(50),
                FOREIGN KEY (requesterId) REFERENCES users(id),
                FOREIGN KEY (reviewedBy) REFERENCES users(id)
            );

            IF OBJECT_ID('bank_accounts', 'U') IS NULL
            CREATE TABLE bank_accounts (
                id NVARCHAR(50) PRIMARY KEY,
                userId NVARCHAR(50) NOT NULL,
                accountHolderName NVARCHAR(255) NOT NULL,
                bankName NVARCHAR(255) NOT NULL,
                accountNumber NVARCHAR(50) NOT NULL,
                iban NVARCHAR(50),
                branchCode NVARCHAR(20),
                accountType NVARCHAR(50) DEFAULT 'savings',
                isDefault INT DEFAULT 1,
                isVerified INT DEFAULT 0,
                status NVARCHAR(20) DEFAULT 'active',
                createdAt DATETIME DEFAULT GETDATE(),
                updatedAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES users(id)
            );

            -- Initialize fund balance if empty
            IF NOT EXISTS (SELECT * FROM fund_balance WHERE id = 1)
            INSERT INTO fund_balance (id, totalBalance, totalDonations, totalWithdrawals) VALUES (1, 0, 0, 0);

            IF OBJECT_ID('activity_logs', 'U') IS NULL
            CREATE TABLE activity_logs (
                id NVARCHAR(50) PRIMARY KEY,
                userId NVARCHAR(50),
                userEmail NVARCHAR(255),
                userName NVARCHAR(255),
                action NVARCHAR(50),
                entityType NVARCHAR(50),
                entityId NVARCHAR(50),
                details NVARCHAR(MAX),
                ipAddress NVARCHAR(50),
                createdAt DATETIME DEFAULT GETDATE()
            );
            `;

            await this.exec(baseSchema);
            console.log('✅ Base Schema Executed');

            // 2. Safe Migrations - Run individually to prevent block failure
            const migrations = [
                // User table columns
                "IF COL_LENGTH('users', 'organization') IS NULL ALTER TABLE users ADD organization NVARCHAR(255)",
                "IF COL_LENGTH('users', 'licenseId') IS NULL ALTER TABLE users ADD licenseId NVARCHAR(255)",
                "IF COL_LENGTH('users', 'location') IS NULL ALTER TABLE users ADD location NVARCHAR(MAX)",
                "IF COL_LENGTH('users', 'ecoPoints') IS NULL ALTER TABLE users ADD ecoPoints INT DEFAULT 0",
                "IF COL_LENGTH('users', 'emailNotifications') IS NULL ALTER TABLE users ADD emailNotifications INT DEFAULT 1",
                "IF COL_LENGTH('users', 'smsNotifications') IS NULL ALTER TABLE users ADD smsNotifications INT DEFAULT 1",
                "IF COL_LENGTH('users', 'resetToken') IS NULL ALTER TABLE users ADD resetToken NVARCHAR(MAX)",
                "IF COL_LENGTH('users', 'resetTokenExpiry') IS NULL ALTER TABLE users ADD resetTokenExpiry BIGINT",
                "IF COL_LENGTH('users', 'avatar') IS NULL ALTER TABLE users ADD avatar NVARCHAR(MAX)",
                "IF COL_LENGTH('users', 'isVerified') IS NULL ALTER TABLE users ADD isVerified INT DEFAULT 0",
                "IF COL_LENGTH('users', 'lat') IS NULL ALTER TABLE users ADD lat FLOAT",
                "IF COL_LENGTH('users', 'lng') IS NULL ALTER TABLE users ADD lng FLOAT",

                // Admin logs migrations
                "IF COL_LENGTH('admin_logs', 'targetType') IS NULL ALTER TABLE admin_logs ADD targetType NVARCHAR(50)",

                // Sponsor banners
                "IF COL_LENGTH('sponsor_banners', 'targetDashboards') IS NULL ALTER TABLE sponsor_banners ADD targetDashboards NVARCHAR(MAX)",

                // Donation improvements for real stats
                "IF COL_LENGTH('donations', 'targetSpecies') IS NULL ALTER TABLE donations ADD targetSpecies NVARCHAR(255)",
                "IF COL_LENGTH('donations', 'weight') IS NULL ALTER TABLE donations ADD weight FLOAT DEFAULT 1.0",
                "IF COL_LENGTH('donations', 'claimedAt') IS NULL ALTER TABLE donations ADD claimedAt DATETIME",
                "IF COL_LENGTH('donations', 'completedAt') IS NULL ALTER TABLE donations ADD completedAt DATETIME",
                "IF COL_LENGTH('donations', 'recommendations') IS NULL ALTER TABLE donations ADD recommendations NVARCHAR(255) DEFAULT 'Food'",

                // Sponsor Banner Extended Attributes
                "IF COL_LENGTH('sponsor_banners', 'campaignName') IS NULL ALTER TABLE sponsor_banners ADD campaignName NVARCHAR(255)",
                "IF COL_LENGTH('sponsor_banners', 'status') IS NULL ALTER TABLE sponsor_banners ADD status NVARCHAR(50) DEFAULT 'draft'",
                "IF COL_LENGTH('sponsor_banners', 'awardType') IS NULL ALTER TABLE sponsor_banners ADD awardType NVARCHAR(50) DEFAULT 'sponsored'",
                "IF COL_LENGTH('sponsor_banners', 'startDate') IS NULL ALTER TABLE sponsor_banners ADD startDate DATETIME",
                "IF COL_LENGTH('sponsor_banners', 'endDate') IS NULL ALTER TABLE sponsor_banners ADD endDate DATETIME"
            ];

            console.log(`Checking ${migrations.length} migrations...`);
            for (const migration of migrations) {
                if (!migration) continue;
                try {
                    await this.exec(migration as string);
                } catch (e: any) {
                    // Log but don't throw, so other migrations can proceed
                    console.warn(`⚠️ Migration check failed: ${migration.substring(0, 50)}...`, e.message);
                }
            }

            console.log('✅ Azure SQL Schema initialized');
        } catch (err) {
            console.error('Azure DB initSchema error:', err);
            throw err;
        }
    }
}
