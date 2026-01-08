import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Leaf, Award, Copy, Check, Gift, Megaphone, Star, Flame, Zap, PieChart as PieChartIcon, Target, DollarSign, Wind, ShieldCheck, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import BadgeIcon from '../BadgeIcon';
import ImpactCertificateModal from '../ImpactCertificateModal';
import { API_URL } from '../../config/api';

interface Badge {
    id: string;
    name: string;
    description: string;
    iconType: 'first-step' | 'helping-hand' | 'food-rescuer' | 'eco-warrior' | 'planet-saver' | 'century-saver';
    requirement: number;
    earned: boolean;
}

interface UserStats {
    donations: number;
    claimed: number;
    ecoPoints: number;
    peopleFed: number;
    co2Saved: number;
    heroStreak: number;
    wasteToValue: number;
    fulfillmentSpeed: number;
    petFoodSavings: number;
    speciesBreakdown: any[];
    circularScore: number;
    compostYield: number;
    methanePrevention: number;
    waterSaved: number;
    landPreserved: number;
}

import { MOCK_VOUCHERS, Voucher } from '../../data/mockData';

interface StatsVoucher extends Voucher {
    isUnlocked: boolean;
    isUsed: boolean;
    couponCode: string;
}

export default function StatsView() {
    const { user, refreshUser } = useAuth();
    const [stats, setStats] = useState<UserStats>({
        donations: 0,
        claimed: 0,
        ecoPoints: 0,
        peopleFed: 0,
        co2Saved: 0,
        heroStreak: 0,
        wasteToValue: 0,
        fulfillmentSpeed: 0,
        petFoodSavings: 0,
        speciesBreakdown: [],
        circularScore: 0,
        compostYield: 0,
        methanePrevention: 0,
        waterSaved: 0,
        landPreserved: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState<StatsVoucher | null>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [showQr, setShowQr] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'badges' | 'redeem'>('badges');
    const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month'>('week');
    const [aiStory, setAiStory] = useState<string>('');
    const [generatingStory, setGeneratingStory] = useState(false);
    const [selectedBadgeForCert, setSelectedBadgeForCert] = useState<Badge | null>(null);

    // Eco Badges with high-quality SVG graphics
    const badges: Badge[] = [
        { id: '1', name: 'First Step', description: 'Make your first donation', iconType: 'first-step', requirement: 1, earned: stats.donations >= 1 },
        { id: '2', name: 'Helping Hand', description: 'Donate 5 times', iconType: 'helping-hand', requirement: 5, earned: stats.donations >= 5 },
        { id: '3', name: 'Food Rescuer', description: 'Donate 10 times', iconType: 'food-rescuer', requirement: 10, earned: stats.donations >= 10 },
        { id: '4', name: 'Eco Warrior', description: 'Donate 25 times', iconType: 'eco-warrior', requirement: 25, earned: stats.donations >= 25 },
        { id: '5', name: 'Planet Saver', description: 'Donate 50 times', iconType: 'planet-saver', requirement: 50, earned: stats.donations >= 50 },
        { id: '6', name: 'Century Saver', description: 'Donate 100 times', iconType: 'century-saver', requirement: 100, earned: stats.donations >= 100 },
    ];

    // Vouchers
    const vouchers: StatsVoucher[] = MOCK_VOUCHERS.filter(v => v.status === 'active').map(v => ({
        ...v,
        isUnlocked: stats.ecoPoints >= v.minEcoPoints,
        isUsed: false,
        couponCode: v.code + '-' + (user?.id?.substring(0, 6).toUpperCase() || 'USER')
    }));

    useEffect(() => {
        if (user?.id) {
            fetchStats();
        }
    }, [user]);

    useEffect(() => {
        if (selectedVoucher?.couponCode) {
            QRCode.toDataURL(selectedVoucher.couponCode, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#1a4d2e',
                    light: '#ffffff'
                }
            })
                .then(url => setQrCode(url))
                .catch(err => console.error('QR Generation Error:', err));
        } else {
            setQrCode('');
            setShowQr(false);
        }
    }, [selectedVoucher]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${user?.id}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(prev => ({ ...prev, ...data }));

                // Sync with AuthContext if points differ
                if (user && user.ecoPoints !== data.ecoPoints) {
                    refreshUser();
                }
            } else {
                setStats(prev => ({
                    ...prev,
                    donations: 12, ecoPoints: 350, peopleFed: 48, co2Saved: 150,
                    heroStreak: 7, wasteToValue: 180, fulfillmentSpeed: 25,
                    petFoodSavings: 145, circularScore: 82, compostYield: 9.5,
                    methanePrevention: 18, waterSaved: 2500, landPreserved: 12.5
                }));
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStats(prev => ({
                ...prev,
                donations: 12, ecoPoints: 350, peopleFed: 48, co2Saved: 150,
                heroStreak: 7, wasteToValue: 180, fulfillmentSpeed: 25,
                petFoodSavings: 145, circularScore: 82, compostYield: 9.5,
                methanePrevention: 18, waterSaved: 2500, landPreserved: 12.5
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && stats.donations > 0 && !aiStory) {
            fetchAIStory();
        }
    }, [loading, stats]);

    const fetchAIStory = async () => {
        setGeneratingStory(true);
        try {
            const response = await fetch(`${API_URL}/api/donations/impact-story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stats: {
                        donations: stats.donations,
                        peopleFed: stats.peopleFed,
                        co2Saved: stats.co2Saved
                    }
                })
            });
            if (response.ok) {
                const data = await response.json();
                setAiStory(data.story);
            }
        } catch (error) {
            console.error('Failed to fetch AI story:', error);
        } finally {
            setGeneratingStory(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const weeklyData = [
        { day: 'Mon', donations: 2 },
        { day: 'Tue', donations: 3 },
        { day: 'Wed', donations: 1 },
        { day: 'Thu', donations: 4 },
        { day: 'Fri', donations: 3 },
        { day: 'Sat', donations: 5 },
        { day: 'Sun', donations: 2 }
    ];

    const monthlyData = [
        { day: 'Week 1', donations: 8 },
        { day: 'Week 2', donations: 12 },
        { day: 'Week 3', donations: 5 },
        { day: 'Week 4', donations: 10 }
    ];

    const compositionData = [
        { name: 'Cooked Meals', value: 45, color: '#10B981' },
        { name: 'Raw Ingredients', value: 30, color: '#3B82F6' },
        { name: 'Packaged Food', value: 25, color: '#F59E0B' }
    ];

    const statCards = [
        { icon: TrendingUp, label: 'Total Donations', value: stats.donations, color: 'green' },
        { icon: Users, label: 'People Helped', value: stats.peopleFed, color: 'blue' },
        { icon: Leaf, label: 'CO2 Saved', value: `${stats.co2Saved}kg`, color: 'purple' },
        { icon: Award, label: 'EcoPoints', value: stats.ecoPoints, color: 'orange' }
    ];

    // Calculate goal progress
    // e.g., Next goal is multiple of 50
    const nextGoal = Math.ceil((stats.peopleFed + 1) / 50) * 50;
    const progress = (stats.peopleFed / nextGoal) * 100;

    const handleShareImpact = async () => {
        const shareText = `🌍 EcoBite Impact Report: I've saved ${stats.donations} batches of food, helped feed ${stats.peopleFed} people, and prevented ${stats.co2Saved}kg of CO2 emissions! 🚀 Join me in the fight against food waste with EcoBite. #EcoBite #FoodWaste #Sustainability #ImagineCup`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My EcoBite Impact',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            copyToClipboard(shareText);
            alert('Impact summary copied to clipboard! Share it on your favorite platforms.');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-forest-900 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-forest-600 mt-4">Loading stats...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Your Statistics</h2>
                    <p className="text-xs text-forest-500 font-medium tracking-tight">Real-time impact tracking</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShareImpact}
                        className="p-2.5 bg-forest-900 dark:bg-forest-600 text-ivory rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 active:scale-95"
                    >
                        <Megaphone className="w-5 h-5" />
                        <span className="text-sm font-bold pr-1">Share</span>
                    </button>
                    {user?.role === 'individual' && stats.heroStreak > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 rounded-full shadow-lg border border-orange-400">
                            <Flame className="w-4 h-4 text-white fill-white animate-pulse" />
                            <span className="text-sm font-bold text-white">{stats.heroStreak}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-sm"
                        >
                            <Icon className={`w-6 h-6 text-${stat.color}-600 mb-2`} />
                            <p className="text-2xl font-bold text-forest-900 dark:text-ivory">{stat.value}</p>
                            <p className="text-sm text-forest-600 dark:text-forest-300">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Feature: AI Impact Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-lg relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4">
                    <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-forest-900 dark:text-ivory mb-3 flex items-center gap-2">
                    AI Impact Analysis
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">Experimental</span>
                </h3>
                {generatingStory ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-forest-100 dark:bg-forest-700 rounded w-full"></div>
                        <div className="h-3 bg-forest-100 dark:bg-forest-700 rounded w-5/6"></div>
                        <div className="h-3 bg-forest-100 dark:bg-forest-700 rounded w-4/6"></div>
                    </div>
                ) : (
                    <p className="text-sm text-forest-700 dark:text-forest-300 italic leading-relaxed">
                        "{aiStory || 'You are making a significant difference in the community. Keep up the great work!'}"
                    </p>
                )}
            </motion.div>

            {/* Role-Specific Impact Modules */}

            {/* 1. RESTAURANT: Business Value & CSR */}
            {user?.role === 'restaurant' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-forest-900 dark:text-ivory leading-tight">Business Value Index</h3>
                                <p className="text-xs text-forest-500">ROI from surplus food donations</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-forest-50 dark:bg-forest-900/40 rounded-2xl">
                                <p className="text-xs text-forest-500 font-bold uppercase mb-1">Tax/Salvage Value</p>
                                <p className="text-xl font-bold text-forest-900 dark:text-ivory">Rs. {stats.wasteToValue}</p>
                            </div>
                            <div className="p-4 bg-forest-50 dark:bg-forest-900/40 rounded-2xl">
                                <p className="text-xs text-forest-500 font-bold uppercase mb-1">Efficiency Score</p>
                                <p className="text-xl font-bold text-forest-900 dark:text-ivory">94%</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-mint/10 to-transparent p-4 rounded-2xl border border-mint/20 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-mint-600" />
                                <span className="font-bold text-sm text-forest-900 dark:text-ivory">Inventory Insights</span>
                            </div>
                            <p className="text-xs text-forest-600 dark:text-forest-400">
                                You donate **45% more cooked meals** on Fridays. Try reducing your Friday prep by 15% to save costs!
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-forest-900 rounded-2xl text-ivory">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-mint" />
                                <div>
                                    <p className="text-sm font-bold tracking-tight">Public CSR Badge</p>
                                    <p className="text-[10px] text-forest-400 uppercase font-bold">Rescuer Certified</p>
                                </div>
                            </div>
                            <button className="px-4 py-1.5 bg-mint text-forest-900 text-xs font-bold rounded-lg hover:bg-white transition-colors">
                                Download
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 2. NGO: Fulfillment & Speed */}
            {user?.role === 'ngo' && (
                <div className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-forest-900 dark:text-ivory">Logistics Efficiency</h3>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex-1 text-center">
                            <p className="text-3xl font-bold text-forest-900 dark:text-ivory">{stats.fulfillmentSpeed}</p>
                            <p className="text-[10px] text-forest-500 font-bold uppercase">Avg. Mins to Pickup</p>
                            <div className="mt-2 text-[10px] text-mint-600 font-bold py-1 px-2 bg-mint/10 rounded-full inline-block">
                                Top 10% in City
                            </div>
                        </div>
                        <div className="w-px h-12 bg-forest-100 dark:bg-forest-700"></div>
                        <div className="flex-1 text-center">
                            <p className="text-3xl font-bold text-forest-900 dark:text-ivory">98%</p>
                            <p className="text-[10px] text-forest-500 font-bold uppercase">Success Rate</p>
                            <div className="mt-2 text-[10px] text-forest-400 font-bold py-1 px-2 bg-forest-50 rounded-full inline-block">
                                Zero Rejections
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. ANIMAL SHELTER: Species & Savings */}
            {user?.role === 'shelter' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
                                    <PieChartIcon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-forest-900 dark:text-ivory">Rescue Composition</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-amber-600">Rs. {stats.petFoodSavings}</p>
                                <p className="text-[10px] text-forest-400 font-bold uppercase">Budget Saved</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.speciesBreakdown.length > 0 ? stats.speciesBreakdown : compositionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={25}
                                            outerRadius={45}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {(stats.speciesBreakdown.length > 0 ? stats.speciesBreakdown : compositionData).map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 flex-1">
                                {(stats.speciesBreakdown.length > 0 ? stats.speciesBreakdown : compositionData).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-forest-600 dark:text-forest-400">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-forest-900 dark:text-ivory">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. WASTE MANAGEMENT: Circular & Methane */}
            {user?.role === 'fertilizer' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-forest-800 p-6 rounded-3xl border border-forest-100 dark:border-forest-700 shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Leaf className="w-24 h-24 text-forest-900" />
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-forest-900 dark:text-ivory">Circular Environment Score</h3>
                        </div>

                        <div className="h-4 bg-forest-50 dark:bg-forest-900 rounded-full mb-6 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.circularScore}%` }}
                                className="h-full bg-gradient-to-r from-forest-600 to-mint rounded-full flex items-center justify-end px-2"
                            >
                                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Gold Standard</span>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-forest-50/50 dark:bg-forest-900/30 p-4 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <div className="flex items-center gap-2 mb-1">
                                    <Wind className="w-4 h-4 text-blue-500" />
                                    <p className="text-[10px] text-forest-500 font-bold uppercase">Methane Prevented</p>
                                </div>
                                <p className="text-lg font-bold text-forest-900 dark:text-ivory">{stats.methanePrevention}kg</p>
                            </div>
                            <div className="bg-forest-50/50 dark:bg-forest-900/30 p-4 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <div className="flex items-center gap-2 mb-1">
                                    <Leaf className="w-4 h-4 text-forest-600" />
                                    <p className="text-[10px] text-forest-500 font-bold uppercase">Compost Yield</p>
                                </div>
                                <p className="text-lg font-bold text-forest-900 dark:text-ivory">{stats.compostYield}kg</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Motivational Goal Tracker */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 rounded-2xl text-ivory relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-sm text-forest-200 uppercase font-bold tracking-wider">Next Impact Goal</p>
                            <h3 className="text-2xl font-bold">{nextGoal} Meals Served</h3>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </div>
                    </div>

                    <div className="w-full bg-forest-950/50 h-3 rounded-full mb-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                            className="bg-mint-400 h-full rounded-full"
                        />
                    </div>

                    <p className="text-sm text-forest-200">
                        Only <span className="font-bold text-white">{nextGoal - stats.peopleFed} more meals</span> to reach the next level!
                    </p>
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-mint-400/10 rounded-full blur-xl"></div>
            </motion.div>

            {/* Donations Chart Section */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory">Activity Overview</h3>
                    <div className="flex bg-gray-100 dark:bg-forest-900 rounded-lg p-1">
                        <button
                            onClick={() => setChartTimeframe('week')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartTimeframe === 'week'
                                ? 'bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory shadow-sm'
                                : 'text-forest-500 dark:text-forest-400'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setChartTimeframe('month')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartTimeframe === 'month'
                                ? 'bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory shadow-sm'
                                : 'text-forest-500 dark:text-forest-400'
                                }`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartTimeframe === 'week' ? weeklyData : monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1efe6" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#1a4d2e"
                                style={{ fontSize: '10px' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#1a4d2e"
                                style={{ fontSize: '10px' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fdfbf7',
                                    border: '1px solid #c5dfcd',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="donations"
                                fill="#4d8562"
                                radius={[6, 6, 0, 0]}
                                barSize={chartTimeframe === 'week' ? 20 : 40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Donation Breakdown Pie Chart */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">What You Donate</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-40 h-40 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={compositionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {compositionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                        {compositionData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-medium text-forest-700 dark:text-forest-200">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-forest-900 dark:text-ivory">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rewards & Badges Tabs */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                <div className="flex border-b border-forest-100 dark:border-forest-700">
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'badges'
                            ? 'bg-forest-50 dark:bg-forest-700 text-forest-900 dark:text-ivory border-b-2 border-forest-900 dark:border-mint'
                            : 'text-forest-500 dark:text-forest-400 hover:bg-forest-50 dark:hover:bg-forest-700/50'
                            }`}
                    >
                        <Award className="w-4 h-4" />
                        Badges
                    </button>
                    <button
                        onClick={() => setActiveTab('redeem')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'redeem'
                            ? 'bg-forest-50 dark:bg-forest-700 text-forest-900 dark:text-ivory border-b-2 border-forest-900 dark:border-mint'
                            : 'text-forest-500 dark:text-forest-400 hover:bg-forest-50 dark:hover:bg-forest-700/50'
                            }`}
                    >
                        {user?.role === 'individual' ? <Gift className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                        {user?.role === 'individual' ? 'Vouchers' : 'Ad Space'}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'badges' && (
                        <div className="grid grid-cols-3 gap-3">
                            {badges.map((badge) => (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-4 rounded-xl text-center transition-all ${badge.earned
                                        ? 'bg-gradient-to-br from-green-50 to-mint-50 dark:from-green-900/20 dark:to-mint-900/20 border-2 border-green-300 dark:border-green-700'
                                        : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="flex justify-center mb-2">
                                        <BadgeIcon type={badge.iconType} earned={badge.earned} size={56} />
                                    </div>
                                    <p className="text-xs font-bold text-forest-900 dark:text-ivory leading-tight h-8 flex items-center justify-center">{badge.name}</p>

                                    {badge.earned ? (
                                        <button
                                            onClick={() => setSelectedBadgeForCert(badge)}
                                            className="mt-2 w-full py-1.5 bg-forest-900 dark:bg-forest-600 text-ivory text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-forest-800 transition-colors"
                                        >
                                            <Award className="w-3 h-3" />
                                            Certificate
                                        </button>
                                    ) : (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                                            {badge.requirement - stats.donations} more
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'redeem' && user?.role === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {vouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${voucher.isUnlocked
                                        ? 'border-green-300 dark:border-green-700 bg-white dark:bg-forest-700'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${voucher.isUnlocked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                                            }`}>
                                            <Gift className={`w-8 h-8 ${voucher.isUnlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                        </div>
                                        <h4 className="font-bold text-forest-900 dark:text-ivory mb-1">{voucher.title}</h4>
                                        <p className="text-lg font-bold text-forest-900 dark:text-ivory mb-2">
                                            {voucher.discountType === 'percentage' ? `${voucher.discountValue}% OFF` : `Rs. ${voucher.discountValue} OFF`}
                                        </p>
                                        <p className="text-xs text-forest-600 dark:text-forest-300 mb-3">{voucher.description}</p>
                                        <div className="text-xs mb-3">
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                                                {voucher.minEcoPoints} points
                                            </span>
                                        </div>
                                        {voucher.isUnlocked && !voucher.isUsed && (
                                            <button
                                                onClick={() => setSelectedVoucher(voucher)}
                                                className="w-full py-2 bg-forest-900 dark:bg-forest-600 text-ivory rounded-lg text-sm font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors"
                                            >
                                                Redeem
                                            </button>
                                        )}
                                        {!voucher.isUnlocked && (
                                            <div className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-bold">
                                                {voucher.minEcoPoints - stats.ecoPoints} more points
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'redeem' && user?.role !== 'individual' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 items-start">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400 shrink-0">
                                    <Megaphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-forest-900 dark:text-ivory">Promote Your Organization</h3>
                                    <p className="text-forest-600 dark:text-forest-300 text-xs mt-1">
                                        Redeem your EcoPoints for ad time on the EcoBite platform.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'ad1', minutes: 60, points: 500, label: 'Starter Boost' },
                                    { id: 'ad2', minutes: 150, points: 1000, label: 'Growth Pack' },
                                    { id: 'ad3', minutes: 350, points: 2000, label: 'Mega Reach' }
                                ].map((pack) => {
                                    const canAfford = stats.ecoPoints >= pack.points;
                                    return (
                                        <div key={pack.id} className={`bg-gray-50 dark:bg-forest-700/50 p-4 rounded-xl border-2 transition-all ${canAfford ? 'border-forest-200 hover:border-forest-400' : 'border-gray-100 opacity-60'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                                    <Megaphone className="w-4 h-4" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-xl text-forest-900 dark:text-ivory">{pack.minutes}</p>
                                                    <p className="text-[10px] text-forest-500 uppercase font-bold">Minutes</p>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-base text-forest-900 dark:text-ivory mb-1">{pack.label}</h4>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-mint-500"></div>
                                                <span className="font-bold text-sm text-forest-700 dark:text-forest-300">{pack.points} Points</span>
                                            </div>
                                            <button
                                                disabled={!canAfford}
                                                onClick={async () => {
                                                    if (!user?.id) return;
                                                    if (confirm(`Redeem ${pack.points} points for ${pack.minutes} minutes of ad time?`)) {
                                                        try {
                                                            const response = await fetch(`${API_URL}/api/ad-redemptions`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    userId: user.id,
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
                                                                alert(`✅ Request submitted! Admin will review your ad space request.`);
                                                                fetchStats(); // Refresh points
                                                            } else {
                                                                const error = await response.json();
                                                                alert(`❌ ${error.error || 'Failed to submit request'}`);
                                                            }
                                                        } catch (error) {
                                                            alert('❌ Failed to submit request.');
                                                        }
                                                    }
                                                }}
                                                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${canAfford
                                                    ? 'bg-forest-900 text-ivory hover:bg-forest-800 dark:bg-mint dark:text-forest-900'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
            </div>

            {/* Voucher Modal (Without QR Code) */}
            {selectedVoucher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-forest-800 rounded-3xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
                    >
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <h3 className="font-bold text-xl text-forest-900 dark:text-ivory mb-4 text-center pt-2">
                                {selectedVoucher.title}
                            </h3>
                            <button
                                onClick={() => setSelectedVoucher(null)}
                                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-forest-700 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-forest-600 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Coupon Code & QR */}
                            <div className="bg-forest-50 dark:bg-forest-700 p-4 rounded-xl mb-4">
                                <div className="flex justify-center mb-4">
                                    <div className="flex bg-white dark:bg-forest-900 rounded-lg p-1 border border-forest-200 dark:border-forest-600">
                                        <button
                                            onClick={() => setShowQr(false)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!showQr
                                                ? 'bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory shadow-sm'
                                                : 'text-forest-500 hover:text-forest-700 dark:text-forest-400'
                                                }`}
                                        >
                                            Code
                                        </button>
                                        <button
                                            onClick={() => setShowQr(true)}
                                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${showQr
                                                ? 'bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory shadow-sm'
                                                : 'text-forest-500 hover:text-forest-700 dark:text-forest-400'
                                                }`}
                                        >
                                            QR Code
                                        </button>
                                    </div>
                                </div>

                                {showQr ? (
                                    <div className="flex flex-col items-center justify-center py-2">
                                        {qrCode ? (
                                            <div className="bg-white p-3 rounded-xl shadow-sm">
                                                <img src={qrCode} alt="Coupon QR Code" className="w-48 h-48" />
                                            </div>
                                        ) : (
                                            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-900"></div>
                                            </div>
                                        )}
                                        <p className="text-xs text-forest-500 mt-3">Scan at checkout</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-forest-600 dark:text-forest-300 mb-2 text-center">Coupon Code</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-center text-lg font-bold text-forest-900 dark:text-ivory bg-white dark:bg-forest-900 px-4 py-2 rounded-lg border border-forest-100 dark:border-forest-600">
                                                {selectedVoucher.couponCode}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(selectedVoucher.couponCode!)}
                                                className="p-2 bg-forest-900 dark:bg-forest-600 text-ivory rounded-lg hover:bg-forest-800 transition-colors shadow-sm"
                                            >
                                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-forest-600 dark:text-forest-300 text-center">
                                    <strong>Discount:</strong> {selectedVoucher.discountType === 'percentage' ? `${selectedVoucher.discountValue}% OFF` : `Rs. ${selectedVoucher.discountValue} OFF`}
                                </p>
                                <p className="text-xs text-orange-600 text-center font-medium">
                                    ⚠️ This voucher can only be used once
                                </p>
                                <p className="text-xs text-forest-500 dark:text-forest-400 text-center italic">
                                    Show this code at the partner location
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-forest-100 dark:border-forest-700 bg-gray-50 dark:bg-forest-900/30">
                            <button
                                onClick={() => {
                                    setSelectedVoucher(null);
                                }}
                                className="w-full py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Environmental Impact */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Environmental Impact</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                        <span className="text-sm text-forest-700 dark:text-forest-300">CO2 Emissions Prevented</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{stats.co2Saved} kg</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <span className="text-sm text-forest-700 dark:text-forest-300">Water Saved</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{stats.waterSaved} L</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                        <span className="text-sm text-forest-700 dark:text-forest-300">Land Preserved</span>
                        <span className="font-bold text-purple-700 dark:text-purple-400">{stats.landPreserved} m²</span>
                    </div>
                </div>
            </div>
            {/* Certificate Modal */}
            {selectedBadgeForCert && (
                <ImpactCertificateModal
                    isOpen={!!selectedBadgeForCert}
                    onClose={() => setSelectedBadgeForCert(null)}
                    user={user}
                    badge={selectedBadgeForCert}
                    stats={{
                        donations: stats.donations,
                        co2Saved: stats.co2Saved,
                        peopleFed: stats.peopleFed
                    }}
                />
            )}
        </div>
    );
}
