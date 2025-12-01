
export interface User {
    id: string;
    name: string;
    email: string;
    type: 'individual' | 'restaurant' | 'ngo' | 'admin';
    organization?: string;
    location?: string;
    ecoPoints: number;
    joinedAt: string;
}

export interface Voucher {
    id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minEcoPoints: number;
    maxRedemptions: number;
    currentRedemptions: number;
    status: 'active' | 'paused' | 'expired';
    expiryDate: string;
    createdAt: string;
}

export interface Donation {
    id: string;
    donorId: string;
    status: 'Available' | 'Claimed' | 'Pending' | 'Pending Pickup' | 'Delivered' | 'Completed' | 'Expired' | 'Recycled';
    expiry: string;
    aiFoodType: string;
    aiQualityScore: number;
    imageUrl: string;
    description: string;
    quantity: string;
    lat?: number;
    lng?: number;
    senderConfirmed?: number;
    receiverConfirmed?: number;
    claimedById?: string;
    createdAt: string;
}

export interface Transaction {
    id: string;
    type: 'donation' | 'withdrawal';
    amount: number;
    category: 'general' | 'transportation' | 'packaging' | 'marketing' | 'operations' | 'other';
    description: string;
    userId?: string;
    createdAt: string;
}

export interface AdminLog {
    id: string;
    adminId: string;
    action: string;
    targetId: string;
    details: string;
    createdAt: string;
}

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Ali Khan', email: 'ali@example.com', type: 'individual', ecoPoints: 1250, location: 'Islamabad', joinedAt: '2024-01-15' },
    { id: 'u2', name: 'Spice Bazaar', email: 'contact@spicebazaar.pk', type: 'restaurant', organization: 'Spice Bazaar', ecoPoints: 3500, location: 'Lahore', joinedAt: '2024-02-01' },
    { id: 'u3', name: 'Edhi Foundation', email: 'info@edhi.org', type: 'ngo', organization: 'Edhi', ecoPoints: 5000, location: 'Karachi', joinedAt: '2023-12-10' },
    { id: 'u4', name: 'Sara Ahmed', email: 'sara@example.com', type: 'individual', ecoPoints: 450, location: 'Rawalpindi', joinedAt: '2024-03-20' },
    { id: 'u5', name: 'Burger Lab', email: 'manager@burgerlab.pk', type: 'restaurant', organization: 'Burger Lab', ecoPoints: 2100, location: 'Islamabad', joinedAt: '2024-01-05' },
    { id: 'u6', name: 'Fatima Jinnah', email: 'fatima@example.com', type: 'individual', ecoPoints: 800, location: 'Karachi', joinedAt: '2024-04-12' },
    { id: 'u7', name: 'Save Food NGO', email: 'help@savefood.org', type: 'ngo', organization: 'Save Food', ecoPoints: 1500, location: 'Lahore', joinedAt: '2024-02-28' },
    { id: 'admin1', name: 'System Admin', email: 'admin@ecobite.pk', type: 'admin', ecoPoints: 0, location: 'HQ', joinedAt: '2023-11-01' },
];

export const MOCK_VOUCHERS: Voucher[] = [
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

export const MOCK_DONATIONS: Donation[] = [
    {
        id: 'd1', donorId: 'u2', status: 'Available', expiry: '2025-12-05', aiFoodType: 'Fresh Vegetables',
        aiQualityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=400',
        description: 'Fresh organic vegetables from our garden.', quantity: '5 kg', lat: 33.6844, lng: 73.0479, createdAt: '2025-12-01'
    },
    {
        id: 'd2', donorId: 'u5', status: 'Available', expiry: '2025-12-03', aiFoodType: 'Bread Loaves',
        aiQualityScore: 88, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        description: 'Day-old bread, perfectly good for consumption.', quantity: '10 loaves', lat: 33.69, lng: 73.05, createdAt: '2025-12-01'
    },
    {
        id: 'd3', donorId: 'u1', status: 'Completed', expiry: '2025-11-28', aiFoodType: 'Rice & Curry',
        aiQualityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400',
        description: 'Leftover catering food, hygienic and packed.', quantity: '20 servings', lat: 33.70, lng: 73.06, createdAt: '2025-11-25',
        claimedById: 'u3', receiverConfirmed: 1, senderConfirmed: 1
    },
    {
        id: 'd4', donorId: 'u2', status: 'Claimed', expiry: '2025-12-02', aiFoodType: 'Chicken Biryani',
        aiQualityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400',
        description: 'Excess food from event.', quantity: '15 kg', lat: 33.71, lng: 73.07, createdAt: '2025-11-30',
        claimedById: 'u7', receiverConfirmed: 0, senderConfirmed: 1
    },
    {
        id: 'd5', donorId: 'u5', status: 'Expired', expiry: '2024-11-20', aiFoodType: 'Mixed Fruits',
        aiQualityScore: 75, imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400',
        description: 'Seasonal fruits.', quantity: '3 kg', lat: 33.72, lng: 73.08, createdAt: '2024-11-15'
    }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', type: 'donation', amount: 5000, category: 'general', description: 'Monthly Donation from Ali', userId: 'u1', createdAt: '2024-11-01' },
    { id: 't2', type: 'withdrawal', amount: 1200, category: 'transportation', description: 'Fuel for delivery van', createdAt: '2024-11-05' },
    { id: 't3', type: 'donation', amount: 10000, category: 'general', description: 'Corporate CSR Donation', userId: 'u2', createdAt: '2024-11-10' },
    { id: 't4', type: 'withdrawal', amount: 500, category: 'packaging', description: 'Biodegradable boxes', createdAt: '2024-11-15' },
    { id: 't5', type: 'donation', amount: 2500, category: 'general', description: 'Community Fundraiser', createdAt: '2024-11-20' },
    { id: 't6', type: 'withdrawal', amount: 2000, category: 'marketing', description: 'Social Media Ads', createdAt: '2024-11-25' },
];

export const MOCK_LOGS: AdminLog[] = [
    { id: 'l1', adminId: 'admin1', action: 'LOGIN', targetId: 'admin1', details: 'Admin logged in', createdAt: '2024-12-01T09:00:00' },
    { id: 'l2', adminId: 'admin1', action: 'CREATE_VOUCHER', targetId: 'v1', details: 'Created voucher: 50% OFF Shipping', createdAt: '2024-12-01T10:30:00' },
    { id: 'l3', adminId: 'admin1', action: 'DELETE_USER', targetId: 'u99', details: 'Deleted user: Spam Bot', createdAt: '2024-11-30T14:20:00' },
    { id: 'l4', adminId: 'admin1', action: 'UPDATE_SETTINGS', targetId: 'system', details: 'Updated system configuration', createdAt: '2024-11-29T11:15:00' },
    { id: 'l5', adminId: 'admin1', action: 'APPROVE_DONATION', targetId: 'd3', details: 'Manually approved donation', createdAt: '2024-11-28T16:45:00' },
];

export const MOCK_BALANCE = {
    totalBalance: 15000,
    totalDonations: 25000,
    totalWithdrawals: 10000
};

export const MOCK_FINANCIAL_SUMMARY = {
    byCategory: [
        { category: 'Transportation', total: 4500 },
        { category: 'Packaging', total: 2000 },
        { category: 'Marketing', total: 1500 },
        { category: 'Operations', total: 2000 }
    ],
    monthly: [
        { month: 'Jun', donations: 12, amount: 1200 },
        { month: 'Jul', donations: 19, amount: 2100 },
        { month: 'Aug', donations: 15, amount: 1800 },
        { month: 'Sep', donations: 25, amount: 3200 },
        { month: 'Oct', donations: 32, amount: 4500 },
        { month: 'Nov', donations: 45, amount: 6000 },
    ]
};

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    read: boolean;
    createdAt: string;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'n1', userId: 'u1', title: 'Donation Claimed', message: 'Your donation "Rice & Curry" was claimed by Edhi Foundation.', type: 'success', read: false, createdAt: '2025-12-02T10:30:00' },
    { id: 'n2', userId: 'u1', title: 'Impact Update', message: 'You have saved 5kg of CO2 this month!', type: 'info', read: true, createdAt: '2025-12-01T09:00:00' },
    { id: 'n3', userId: 'u2', title: 'Voucher Redeemed', message: 'User Ali Khan redeemed your "50% OFF" voucher.', type: 'success', read: false, createdAt: '2025-12-02T11:15:00' },
    { id: 'n4', userId: 'u2', title: 'Low Stock Alert', message: 'You have only 2 active vouchers remaining.', type: 'warning', read: true, createdAt: '2025-11-30T14:20:00' },
    { id: 'n5', userId: 'u3', title: 'New Donation Available', message: 'Fresh Vegetables are available near you.', type: 'info', read: false, createdAt: '2025-12-02T08:45:00' },
];
