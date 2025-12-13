/**
 * Environment Variable Validation
 * Validates all required environment variables on startup
 */

interface EnvConfig {
    required: string[];
    optional: string[];
}

const envConfig: EnvConfig = {
    required: [
        'JWT_SECRET' // Critical for security
    ],
    optional: [
        'PORT',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'AZURE_SQL_SERVER',
        'AZURE_SQL_DATABASE',
        'AZURE_SQL_USER',
        'AZURE_SQL_PASSWORD',
        'FRONTEND_URL',
        'VITE_API_URL',
        'SMTP_HOST',
        'SMTP_USER',
        'SMTP_PASS',
        'STRIPE_SECRET_KEY',
        'AZURE_CLIENT_ID',
        'AZURE_CLIENT_SECRET',
        'AZURE_COMPUTER_VISION_ENDPOINT',
        'AZURE_COMPUTER_VISION_KEY'
    ]
};

export function validateEnv(): void {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const key of envConfig.required) {
        if (!process.env[key]) {
            if (process.env.NODE_ENV === 'production') {
                missing.push(key);
            } else {
                warnings.push(key);
            }
        }
    }

    // Report missing required variables
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Report warnings for development
    if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Missing recommended environment variables (development mode):');
        warnings.forEach(key => console.warn(`   - ${key}`));
    }

    // Check database configuration
    const hasPostgres = !!(process.env.DB_HOST || process.env.DATABASE_URL);
    const hasAzureSQL = !!(
        process.env.AZURE_SQL_SERVER &&
        process.env.AZURE_SQL_DATABASE &&
        process.env.AZURE_SQL_USER &&
        process.env.AZURE_SQL_PASSWORD
    );

    if (!hasPostgres && !hasAzureSQL && process.env.NODE_ENV === 'production') {
        console.warn('⚠️  No database configuration found. Will use SQLite (not recommended for production)');
    }

    console.log('✅ Environment variables validated');
}

// Auto-validate on import (only in production or when explicitly enabled)
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
    validateEnv();
}

