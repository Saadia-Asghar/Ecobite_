import { useState } from 'react';
import { Award, Star, Gift, Lock, Sparkles } from 'lucide-react';
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

export default function RewardsView() {
    const [activeTab, setActiveTab] = useState<'badges' | 'vouchers'>('badges');
    const userPoints = 1250;

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
            </div>

            {/* Content */}
            {activeTab === 'badges' ? (
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
            ) : (
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
        </div>
    );
}
