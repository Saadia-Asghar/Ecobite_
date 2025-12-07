import { useState } from 'react';
import { Award, Star, Gift, Lock, Sparkles, Megaphone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Badge {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    progress: number;
    total: number;
}

import { MOCK_VOUCHERS, Voucher } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function RewardsView() {
    const [activeTab, setActiveTab] = useState<'badges' | 'vouchers' | 'ads'>('badges');
    const { user } = useAuth();
    const userPoints = user?.ecoPoints || 0;
    const userId = user?.id || '';

    const badges: Badge[] = [
        {
            id: '1',
            name: 'Food Rescuer',
            description: 'Complete 10 donations',
            unlocked: true,
            progress: 10,
            total: 10
        },
        {
            id: '2',
            name: 'Community Hero',
            description: 'Help 50 people',
            unlocked: false,
            progress: 32,
            total: 50
        },
        {
            id: '3',
            name: 'Eco Warrior',
            description: 'Save 100kg of CO2',
            unlocked: true,
            progress: 128,
            total: 100
        },
        {
            id: '4',
            name: 'Consistency Champion',
            description: 'Donate for 30 consecutive days',
            unlocked: false,
            progress: 12,
            total: 30
        }
    ];

    const vouchers: Voucher[] = MOCK_VOUCHERS.filter(v => v.status === 'active');

    return (
        <div className="space-y-6">
            {/* Points Display */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-8 rounded-3xl text-ivory relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-6 h-6 text-mint-400" />
                        <span className="text-mint-400 font-bold uppercase tracking-wider text-sm">Your EcoPoints</span>
                    </div>
                    <p className="text-5xl font-bold mb-2">{userPoints.toLocaleString()}</p>
                    <p className="text-forest-200">Keep earning to unlock more rewards!</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-forest-200">
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`px-6 py-3 font-bold transition-all ${activeTab === 'badges'
                        ? 'text-forest-900 border-b-2 border-forest-900'
                        : 'text-forest-500 hover:text-forest-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Badges
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('vouchers')}
                    className={`px-6 py-3 font-bold transition-all ${activeTab === 'vouchers'
                        ? 'text-forest-900 border-b-2 border-forest-900'
                        : 'text-forest-500 hover:text-forest-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Vouchers
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('ads')}
                    className={`px-6 py-3 font-bold transition-all ${activeTab === 'ads'
                        ? 'text-forest-900 border-b-2 border-forest-900'
                        : 'text-forest-500 hover:text-forest-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5" />
                        Ad Space
                    </div>
                </button>
            </div>

            {/* Content */}
            {activeTab === 'badges' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-6 rounded-2xl border-2 ${badge.unlocked
                                ? 'bg-gradient-to-br from-mint to-mint-200 border-forest-300'
                                : 'bg-white border-forest-100'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-4 rounded-xl ${badge.unlocked ? 'bg-white/80' : 'bg-forest-100'
                                    }`}>
                                    {badge.unlocked ? (
                                        <Award className="w-8 h-8 text-forest-700" />
                                    ) : (
                                        <Lock className="w-8 h-8 text-forest-400" />
                                    )}
                                </div>
                                {badge.unlocked && (
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                )}
                            </div>
                            <h3 className="font-bold text-xl text-forest-900 mb-2">{badge.name}</h3>
                            <p className="text-sm text-forest-600 mb-4">{badge.description}</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-forest-600">Progress</span>
                                    <span className="font-bold text-forest-900">
                                        {badge.progress}/{badge.total}
                                    </span>
                                </div>
                                <div className="w-full bg-forest-200 rounded-full h-2">
                                    <div
                                        className="bg-forest-700 h-2 rounded-full transition-all"
                                        style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'vouchers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vouchers.map((voucher, index) => {
                        const canAfford = userPoints >= voucher.minEcoPoints;
                        const discountDisplay = voucher.discountType === 'percentage'
                            ? `${voucher.discountValue}% OFF`
                            : `Rs. ${voucher.discountValue} OFF`;

                        return (
                            <motion.div
                                key={voucher.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-2xl border-2 ${canAfford
                                    ? 'bg-white border-forest-200 hover:border-forest-400'
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                    } transition-all`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <Gift className={`w-8 h-8 ${canAfford ? 'text-forest-700' : 'text-gray-400'}`} />
                                    {!canAfford && <Lock className="w-5 h-5 text-gray-400" />}
                                </div>
                                <h3 className="font-bold text-xl text-forest-900 mb-1">{voucher.title}</h3>
                                <p className="text-2xl font-bold text-forest-700 mb-4">{discountDisplay}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-forest-600">
                                        {voucher.minEcoPoints} points
                                    </span>
                                    <button
                                        disabled={!canAfford}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all ${canAfford
                                            ? 'bg-forest-900 text-ivory hover:bg-forest-800'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Redeem
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'ads' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-4 items-start">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-forest-900 dark:text-ivory">Promote Your Organization</h3>
                            <p className="text-forest-600 dark:text-forest-300 text-sm mt-1">
                                Redeem your EcoPoints for ad time on the EcoBite platform. Reach more donors and volunteers!
                                Once redeemed, our admin team will review and activate your ad slot.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: 'ad1', minutes: 60, points: 500, label: 'Starter Boost' },
                            { id: 'ad2', minutes: 150, points: 1000, label: 'Growth Pack' },
                            { id: 'ad3', minutes: 350, points: 2000, label: 'Mega Reach' }
                        ].map((pack) => {
                            const canAfford = userPoints >= pack.points;
                            return (
                                <div key={pack.id} className={`bg-white dark:bg-forest-800 p-6 rounded-2xl border-2 transition-all ${canAfford ? 'border-forest-200 hover:border-forest-400' : 'border-gray-100 opacity-60'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-2xl text-forest-900 dark:text-ivory">{pack.minutes}</p>
                                            <p className="text-xs text-forest-500 uppercase font-bold">Minutes</p>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-lg text-forest-900 dark:text-ivory mb-2">{pack.label}</h4>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Star className="w-4 h-4 text-mint-500" />
                                        <span className="font-bold text-forest-700 dark:text-forest-300">{pack.points} Points</span>
                                    </div>
                                    <button
                                        disabled={!canAfford}
                                        onClick={async () => {
                                            if (!userId) {
                                                alert('Please log in to redeem ad space');
                                                return;
                                            }

                                            if (confirm(`Redeem ${pack.points} points for ${pack.minutes} minutes of ad time?`)) {
                                                try {
                                                    const response = await fetch('http://localhost:3002/api/ad-redemptions', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            userId,
                                                            packageId: pack.id,
                                                            pointsCost: pack.points,
                                                            durationMinutes: pack.minutes,
                                                            bannerData: {
                                                                name: user?.organization || user?.name || 'My Organization',
                                                                type: 'custom',
                                                                placement: 'dashboard'
                                                            }
                                                        })
                                                    });

                                                    if (response.ok) {
                                                        alert(`✅ Request submitted! Admin will review your ad space request. Your ${pack.points} points have been reserved.`);
                                                        // Optionally refresh user data to show updated points
                                                        window.location.reload();
                                                    } else {
                                                        const error = await response.json();
                                                        alert(`❌ ${error.error || 'Failed to submit request'}`);
                                                    }
                                                } catch (error) {
                                                    console.error('Error submitting redemption:', error);
                                                    alert('❌ Failed to submit request. Please try again.');
                                                }
                                            }
                                        }}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford
                                            ? 'bg-forest-900 text-ivory hover:bg-forest-800 dark:bg-mint dark:text-forest-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {canAfford ? 'Redeem Now' : 'Not Enough Points'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
