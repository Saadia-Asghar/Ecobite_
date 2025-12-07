
export interface User {
    id: string;
    name: string;
    email: string;
    type: 'individual' | 'restaurant' | 'ngo' | 'admin' | 'shelter' | 'fertilizer';
    category?: 'donor' | 'beneficiary';
    organization?: string;
    location?: string;
    address?: string;
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

export interface SponsorBanner {
    id: string;
    name: string;
    type: 'image' | 'custom';
    imageUrl?: string; // For full image banner
    logoUrl?: string;  // For custom design
    content?: string;  // Headline for custom design
    description?: string; // Subtext for custom design
    backgroundColor?: string;
    link: string;
    active: boolean;
    placement: 'home' | 'sidebar' | 'dashboard' | 'landing';
    // Analytics & Scheduling
    impressions?: number;
    clicks?: number;
    durationMinutes?: number; // How long the ad runs
    startedAt?: string; // When the ad was activated
    ownerId?: string; // If redeemed by a specific user (Restaurant/NGO)
}

export const mockBanners: SponsorBanner[] = [
    {
        id: 'b1',
        name: 'Green Energy Corp',
        type: 'custom',
        logoUrl: 'https://cdn-icons-png.flaticon.com/512/2913/2913990.png',
        content: 'Switch to Solar Today!',
        description: 'Get 50% off installation charges. Partnering for a greener future.',
        backgroundColor: 'from-green-50 to-green-100', // CSS class or hex
        link: 'https://example.com/solar',
        active: true,
        placement: 'dashboard'
    },
    {
        id: 'b2',
        name: 'EcoPack Solutions',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&q=80&w=1000',
        content: 'Sustainable Packaging',
        link: 'https://example.com/packaging',
        active: true,
        placement: 'dashboard'
    }
];

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
    { id: 'u1', name: 'Ali Khan', email: 'ali@example.com', type: 'individual', category: 'donor', ecoPoints: 1250, location: 'Islamabad', address: 'House 12, Street 4, F-10/2, Islamabad', joinedAt: '2024-01-15' },
    { id: 'u2', name: 'Spice Bazaar', email: 'contact@spicebazaar.pk', type: 'restaurant', category: 'donor', organization: 'Spice Bazaar', ecoPoints: 3500, location: 'Lahore', address: '123 MM Alam Rd, Gulberg III, Lahore', joinedAt: '2024-02-01' },
    { id: 'u3', name: 'Edhi Foundation', email: 'info@edhi.org', type: 'ngo', category: 'beneficiary', organization: 'Edhi', ecoPoints: 5000, location: 'Karachi', address: 'Edhi Centre, Boltan Market, Karachi', joinedAt: '2023-12-10' },
    { id: 'u4', name: 'Sara Ahmed', email: 'sara@example.com', type: 'individual', category: 'donor', ecoPoints: 450, location: 'Rawalpindi', address: 'Flat 4, Al-Aziz Heights, Bahria Town Ph 4, Rawalpindi', joinedAt: '2024-03-20' },
    { id: 'u5', name: 'Burger Lab', email: 'manager@burgerlab.pk', type: 'restaurant', category: 'donor', organization: 'Burger Lab', ecoPoints: 2100, location: 'Islamabad', address: 'Shop 5, Beverly Centre, Blue Area, Islamabad', joinedAt: '2024-01-05' },
    { id: 'u6', name: 'Fatima Jinnah', email: 'fatima@example.com', type: 'individual', category: 'donor', ecoPoints: 800, location: 'Karachi', address: 'Plot 45-C, Lane 4, DHA Phase 6, Karachi', joinedAt: '2024-04-12' },
    { id: 'u7', name: 'Save Food NGO', email: 'help@savefood.org', type: 'ngo', category: 'beneficiary', organization: 'Save Food', ecoPoints: 1500, location: 'Lahore', address: 'Office 201, Siddiq Trade Centre, Lahore', joinedAt: '2024-02-28' },
    { id: 'u8', name: 'Happy Paws Shelter', email: 'paws@shelter.org', type: 'shelter', category: 'beneficiary', organization: 'Happy Paws', ecoPoints: 800, location: 'Islamabad', address: 'Plot 10, F-8, Islamabad', joinedAt: '2024-05-10' },
    { id: 'u9', name: 'Green Grow Fertilizers', email: 'contact@greengrow.com', type: 'fertilizer', category: 'beneficiary', organization: 'Green Grow', ecoPoints: 2000, location: 'Rawalpindi', address: 'Industrial Area, Rawalpindi', joinedAt: '2024-06-01' },
    { id: 'admin1', name: 'System Admin', email: 'admin@ecobite.pk', type: 'admin', category: 'beneficiary', ecoPoints: 0, location: 'HQ', address: 'EcoBite HQ, Software Technology Park, Islamabad', joinedAt: '2023-11-01' },
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
        id: 'd1', donorId: 'u2', status: 'Available', expiry: '2025-12-30', aiFoodType: 'Fresh Vegetables',
        aiQualityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=400',
        description: 'Fresh organic vegetables from our garden.', quantity: '5 kg', lat: 33.6844, lng: 73.0479, createdAt: '2025-12-01'
    },
    {
        id: 'd2', donorId: 'u6', status: 'Pending', expiry: '2025-12-28', aiFoodType: 'Bread Loaves',
        aiQualityScore: 88, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        description: 'Day-old bread, perfectly good for consumption.', quantity: '10 loaves', lat: 33.69, lng: 73.05, createdAt: '2025-12-01',
        claimedById: 'u3', receiverConfirmed: 0, senderConfirmed: 1
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
    },
    {
        id: 'd6', donorId: 'u2', status: 'Recycled', expiry: '2024-11-18', aiFoodType: 'Vegetable Peels',
        aiQualityScore: 45, imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=400',
        description: 'Organic waste for fertilizer.', quantity: '10 kg', lat: 33.73, lng: 73.09, createdAt: '2024-11-18',
        claimedById: 'u9'
    },
    {
        id: 'd7', donorId: 'u4', status: 'Delivered', expiry: '2025-12-05', aiFoodType: 'Canned Goods',
        aiQualityScore: 100, imageUrl: 'https://images.unsplash.com/photo-1584285418504-0062b9f34a14?auto=format&fit=crop&q=80&w=400',
        description: 'Assorted canned beans and vegetables.', quantity: '20 cans', lat: 33.74, lng: 73.10, createdAt: '2025-11-29',
        claimedById: 'u8', senderConfirmed: 1, receiverConfirmed: 0
    },
    {
        id: 'd8', donorId: 'u2', status: 'Completed', expiry: '2025-12-04', aiFoodType: 'Sandwiches',
        aiQualityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&q=80&w=400',
        description: 'Freshly made club sandwiches.', quantity: '20 pieces', lat: 33.75, lng: 73.11, createdAt: '2025-11-28',
        claimedById: 'u7', senderConfirmed: 1, receiverConfirmed: 1
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
