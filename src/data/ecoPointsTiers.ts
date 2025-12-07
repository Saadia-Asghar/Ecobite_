// EcoPoints Banner Tier System
// Users can claim banner slots based on their accumulated EcoPoints

export interface EcoPointsTier {
    id: string;
    name: string;
    emoji: string;
    points: number;
    duration: number; // days
    description: string;
    color: string; // Tailwind color class
    features: string[];
}

export const ECOPOINTS_BANNER_TIERS: EcoPointsTier[] = [
    {
        id: 'starter',
        name: 'Starter Banner',
        emoji: '🌱',
        points: 1000,
        duration: 3,
        description: '3-day banner placement',
        color: 'green',
        features: [
            '3 days visibility',
            'Dashboard placement',
            'Basic analytics'
        ]
    },
    {
        id: 'bronze',
        name: 'Bronze Banner Week',
        emoji: '🥉',
        points: 5000,
        duration: 7,
        description: '7-day banner placement',
        color: 'amber',
        features: [
            '7 days visibility',
            'Dashboard placement',
            'Standard analytics',
            'Click tracking'
        ]
    },
    {
        id: 'silver',
        name: 'Silver Banner Fortnight',
        emoji: '🥈',
        points: 10000,
        duration: 14,
        description: '14-day banner placement',
        color: 'gray',
        features: [
            '14 days visibility',
            'Dashboard placement',
            'Advanced analytics',
            'Click tracking',
            'Impression tracking'
        ]
    },
    {
        id: 'gold',
        name: 'Gold Banner Month',
        emoji: '🥇',
        points: 20000,
        duration: 30,
        description: '30-day banner placement',
        color: 'yellow',
        features: [
            '30 days visibility',
            'Dashboard placement',
            'Premium analytics',
            'Click tracking',
            'Impression tracking',
            'Priority placement'
        ]
    },
    {
        id: 'platinum',
        name: 'Platinum Banner Quarter',
        emoji: '💎',
        points: 50000,
        duration: 90,
        description: '90-day banner placement',
        color: 'cyan',
        features: [
            '90 days visibility',
            'Dashboard placement',
            'Premium analytics',
            'Click tracking',
            'Impression tracking',
            'Priority placement',
            'Featured badge'
        ]
    },
    {
        id: 'diamond',
        name: 'Diamond Banner Half-Year',
        emoji: '💠',
        points: 100000,
        duration: 180,
        description: '180-day banner placement',
        color: 'blue',
        features: [
            '180 days visibility',
            'Dashboard placement',
            'Premium analytics',
            'Click tracking',
            'Impression tracking',
            'Top priority placement',
            'Featured badge',
            'Custom design support'
        ]
    },
    {
        id: 'elite',
        name: 'Elite Banner Year',
        emoji: '👑',
        points: 200000,
        duration: 365,
        description: '365-day banner placement',
        color: 'purple',
        features: [
            '365 days visibility',
            'Dashboard placement',
            'Premium analytics',
            'Click tracking',
            'Impression tracking',
            'Top priority placement',
            'Featured badge',
            'Custom design support',
            'Dedicated account manager'
        ]
    },
    {
        id: 'legendary',
        name: 'Legendary Banner Lifetime',
        emoji: '⭐',
        points: 500000,
        duration: 730, // 2 years
        description: 'Lifetime banner placement (2 years)',
        color: 'pink',
        features: [
            '2 years visibility',
            'Dashboard placement',
            'Premium analytics',
            'Click tracking',
            'Impression tracking',
            'Top priority placement',
            'Featured badge',
            'Custom design support',
            'Dedicated account manager',
            'Exclusive perks'
        ]
    }
];

// Helper function to get tier by points
export const getTierByPoints = (points: number): EcoPointsTier | null => {
    // Find the highest tier the user qualifies for
    const qualifiedTiers = ECOPOINTS_BANNER_TIERS.filter(tier => points >= tier.points);
    if (qualifiedTiers.length === 0) return null;
    return qualifiedTiers[qualifiedTiers.length - 1];
};

// Helper function to get next tier
export const getNextTier = (currentPoints: number): EcoPointsTier | null => {
    const nextTier = ECOPOINTS_BANNER_TIERS.find(tier => tier.points > currentPoints);
    return nextTier || null;
};

// Helper function to get all available tiers for a user
export const getAvailableTiers = (points: number): EcoPointsTier[] => {
    return ECOPOINTS_BANNER_TIERS.filter(tier => points >= tier.points);
};

// Helper function to get locked tiers
export const getLockedTiers = (points: number): EcoPointsTier[] => {
    return ECOPOINTS_BANNER_TIERS.filter(tier => points < tier.points);
};

// Helper function to calculate progress to next tier
export const getProgressToNextTier = (currentPoints: number): {
    currentTier: EcoPointsTier | null;
    nextTier: EcoPointsTier | null;
    progress: number; // 0-100
    pointsNeeded: number;
} => {
    const currentTier = getTierByPoints(currentPoints);
    const nextTier = getNextTier(currentPoints);

    if (!nextTier) {
        return {
            currentTier,
            nextTier: null,
            progress: 100,
            pointsNeeded: 0
        };
    }

    const previousTierPoints = currentTier?.points || 0;
    const pointsInRange = nextTier.points - previousTierPoints;
    const pointsEarned = currentPoints - previousTierPoints;
    const progress = Math.min(100, (pointsEarned / pointsInRange) * 100);
    const pointsNeeded = nextTier.points - currentPoints;

    return {
        currentTier,
        nextTier,
        progress,
        pointsNeeded
    };
};
