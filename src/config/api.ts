// API Configuration
// Automatically uses the correct API URL based on environment

const getApiUrl = (): string => {
    // Check if we're in development or production
    if (import.meta.env.DEV) {
        return 'http://localhost:3002';
    }

    // Production: Use environment variable if it looks like a real URL
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && envUrl.includes('://') && !envUrl.includes('your-app.vercel.app')) {
        return envUrl.replace(/\/$/, '').replace(/\/api$/, '');
    }

    // Default to relative paths (works best for Vercel same-domain setups)
    return '';
};

export const API_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
    // Auth
    auth: {
        register: `${API_URL}/api/auth/register`,
        login: `${API_URL}/api/auth/login`,
        verify: `${API_URL}/api/auth/verify`,
    },

    // Users
    users: {
        list: `${API_URL}/api/users`,
        byId: (id: string) => `${API_URL}/api/users/${id}`,
    },

    // Donations
    donations: {
        list: `${API_URL}/api/donations`,
        byId: (id: string) => `${API_URL}/api/donations/${id}`,
        create: `${API_URL}/api/donations`,
    },

    // Money Requests
    moneyRequests: {
        list: `${API_URL}/api/money-requests`,
        byId: (id: string) => `${API_URL}/api/money-requests/${id}`,
        create: `${API_URL}/api/money-requests`,
        approve: (id: string) => `${API_URL}/api/money-requests/${id}/approve`,
        reject: (id: string) => `${API_URL}/api/money-requests/${id}/reject`,
        stats: `${API_URL}/api/money-requests/stats/summary`,
    },

    // Finance
    finance: {
        balance: `${API_URL}/api/finance/balance`,
        transactions: `${API_URL}/api/finance`,
        moneyDonations: `${API_URL}/api/finance/money-donations`,
        moneyRequests: `${API_URL}/api/finance/money-requests`,
    },

    // Payment
    payment: {
        manual: `${API_URL}/api/payment/manual`,
        approve: (id: string) => `${API_URL}/api/payment/manual/${id}/approve`,
        reject: (id: string) => `${API_URL}/api/payment/manual/${id}/reject`,
    },

    // Vouchers
    vouchers: {
        list: `${API_URL}/api/vouchers`,
        byId: (id: string) => `${API_URL}/api/vouchers/${id}`,
    },

    // Notifications
    notifications: {
        list: `${API_URL}/api/notifications`,
        markAsRead: (id: string) => `${API_URL}/api/notifications/${id}/read`,
    },

    // Admin
    admin: {
        logs: `${API_URL}/api/admin/logs`,
    },

    // Bank Accounts
    bankAccounts: {
        list: `${API_URL}/api/bank-accounts`,
        adminAll: `${API_URL}/api/bank-accounts/admin/all`,
        verify: (id: string) => `${API_URL}/api/bank-accounts/${id}/verify`,
    },
};

export default API_URL;
