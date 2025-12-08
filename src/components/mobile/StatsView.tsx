import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Leaf, Award, Copy, Check, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import BadgeIcon from '../BadgeIcon';

interface Badge {
    id: string;
    name: string;
    description: string;
    iconType: 'first-step' | 'helping-hand' | 'food-rescuer' | 'eco-warrior' | 'planet-saver' | 'century-saver';
    requirement: number;
    earned: boolean;
}

import { MOCK_VOUCHERS, Voucher } from '../../data/mockData';

interface StatsVoucher extends Voucher {
    isUnlocked: boolean;
    isUsed: boolean;
    couponCode: string;
}

export default function StatsView() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        donations: 0,
        claimed: 0,
        ecoPoints: 0,
        peopleFed: 0,
        co2Saved: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState<StatsVoucher | null>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [showQr, setShowQr] = useState(false);
    const [copied, setCopied] = useState(false);



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
            const response = await fetch(`http://localhost:3002/api/users/${user?.id}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                setStats({ donations: 12, claimed: 5, ecoPoints: 350, peopleFed: 48, co2Saved: 150 });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStats({ donations: 12, claimed: 5, ecoPoints: 350, peopleFed: 48, co2Saved: 150 });
        } finally {
            setLoading(false);
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

    const statCards = [
        { icon: TrendingUp, label: 'Total Donations', value: stats.donations, color: 'green' },
        { icon: Users, label: 'People Helped', value: stats.peopleFed, color: 'blue' },
        { icon: Leaf, label: 'CO2 Saved', value: `${stats.co2Saved}kg`, color: 'purple' },
        { icon: Award, label: 'EcoPoints', value: stats.ecoPoints, color: 'orange' }
    ];

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
            <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Your Statistics</h2>

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

            {/* Eco Badges */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    Eco Badges Earned
                </h3>
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
                            <p className="text-xs font-bold text-forest-900 dark:text-ivory">{badge.name}</p>
                            <p className="text-xs text-forest-600 dark:text-forest-300 mt-1">{badge.description}</p>
                            {!badge.earned && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                                    {badge.requirement - stats.donations} more
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>


            {/* Vouchers - Only for individual users */}
            {user?.role === 'individual' && (
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-600" />
                        Vouchers & Rewards
                    </h3>
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
                </div>
            )}

            {/* Voucher Modal (Without QR Code) */}
            {selectedVoucher && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-forest-800 rounded-3xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <h3 className="font-bold text-xl text-forest-900 dark:text-ivory mb-4 text-center">
                                {selectedVoucher.title}
                            </h3>

                            {/* Coupon Code */}
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

            {/* Weekly Chart */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e1efe6" />
                        <XAxis dataKey="day" stroke="#1a4d2e" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#1a4d2e" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fdfbf7',
                                border: '1px solid #c5dfcd',
                                borderRadius: '12px'
                            }}
                        />
                        <Bar dataKey="donations" fill="#4d8562" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

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
                        <span className="font-bold text-blue-700 dark:text-blue-400">{stats.donations * 60} L</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                        <span className="text-sm text-forest-700 dark:text-forest-300">Land Preserved</span>
                        <span className="font-bold text-purple-700 dark:text-purple-400">{stats.donations * 1.25} m²</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
