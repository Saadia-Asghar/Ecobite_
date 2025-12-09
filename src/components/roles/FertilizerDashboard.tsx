import { Leaf, Recycle, Package, Truck, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FertilizerDashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import ClaimedDonationsList from '../dashboard/ClaimedDonationsList';
import NotificationsPanel from '../dashboard/NotificationsPanel';

export default function FertilizerDashboard({ onNavigate }: FertilizerDashboardProps = {}) {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            {/* Company Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-3xl text-white shadow-lg flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Recycle className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">{user?.organization || user?.name || 'Waste Management'}</h1>
                            <p className="text-green-100 text-sm">Waste Management Partner</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm">
                        <Leaf className="w-4 h-4" />
                        <span>Converting waste to resources</span>
                    </div>
                </div>
                <div className="bg-white/20 rounded-full p-1 relative z-[100]">
                    <NotificationsPanel />
                </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 rounded-3xl shadow-lg text-ivory">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-mint-400" />
                    <h3 className="text-mint-400 font-bold uppercase tracking-wider text-xs">Environmental Impact</h3>
                </div>
                <p className="text-lg font-medium leading-relaxed">
                    "This month, you've diverted 450kg of organic waste from landfills, producing 180kg of premium compost and preventing 1,200kg of CO2 emissions!"
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Package className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">450kg</p>
                    <p className="text-sm text-forest-600">Waste Collected</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Recycle className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">180kg</p>
                    <p className="text-sm text-forest-600">Compost Produced</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Leaf className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">1,200kg</p>
                    <p className="text-sm text-forest-600">CO2 Prevented</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Truck className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">24</p>
                    <p className="text-sm text-forest-600">Pickups Scheduled</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate?.('donations')}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                        Browse Spoiled Food
                    </button>
                    <button
                        onClick={() => onNavigate?.('add')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Schedule Collection
                    </button>
                    <button
                        onClick={() => onNavigate?.('finance')}
                        className="w-full py-3 bg-forest-100 text-forest-900 rounded-xl font-bold hover:bg-forest-200 transition-colors"
                    >
                        Request Finance
                    </button>
                    <button
                        onClick={() => onNavigate?.('nearby')}
                        className="w-full py-3 bg-forest-100 text-forest-900 rounded-xl font-bold hover:bg-forest-200 transition-colors"
                    >
                        📍 Live Donations Map
                    </button>
                    <button
                        onClick={() => window.location.href = '/settings/bank-account'}
                        className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors"
                    >
                        🏦 Manage Bank Account
                    </button>
                    <button
                        onClick={() => onNavigate?.('stats')}
                        className="w-full py-3 bg-forest-50 text-forest-900 rounded-xl font-bold hover:bg-forest-100 transition-colors"
                    >
                        View Processing Stats
                    </button>
                </div>
            </div>

            {/* Claimed Waste */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Claimed Waste</h3>
                <ClaimedDonationsList />
            </div>

            {/* AI-Flagged Waste */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-forest-900">AI-Flagged for Composting</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        AI Sorted
                    </span>
                </div>
                <p className="text-sm text-forest-600 mb-4">
                    Items automatically identified as suitable for composting
                </p>
                <div className="space-y-3">
                    {[
                        { item: 'Spoiled Vegetables', qty: '25kg', source: 'Green Market', grade: 'Grade A', quality: 45 },
                        { item: 'Expired Fruits', qty: '18kg', source: 'Fruit Stand', grade: 'Grade B', quality: 38 },
                        { item: 'Food Scraps', qty: '12kg', source: 'Restaurant', grade: 'Grade A', quality: 52 }
                    ].map((waste, index) => (
                        <div key={index} className="p-3 rounded-xl border border-forest-100 hover:bg-forest-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-bold text-forest-900 text-sm">{waste.item}</p>
                                    <p className="text-xs text-forest-600">from {waste.source}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-600" />
                                        <span className="text-xs font-bold text-purple-600">{waste.quality}%</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        {waste.grade}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-forest-600">{waste.qty}</span>
                                <button
                                    onClick={() => alert(`✅ Claimed ${waste.item}! This will be connected to the backend.`)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                >
                                    Claim
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Claimed Waste */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Claimed Waste</h3>
                <ClaimedDonationsList />
            </div>

            {/* Efficiency Metrics */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-8 h-8" />
                    <div>
                        <h3 className="font-bold text-lg">Processing Efficiency</h3>
                        <p className="text-purple-100 text-sm">This month</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                        <p className="text-2xl font-bold">40%</p>
                        <p className="text-xs text-purple-100">Conversion Rate</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                        <p className="text-2xl font-bold">95%</p>
                        <p className="text-xs text-purple-100">Diversion Rate</p>
                    </div>
                </div>
            </div>

            {/* Environmental Badge */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Eco Champion</h3>
                        <p className="text-green-100 text-sm">Top waste diverter</p>
                    </div>
                </div>
                <p className="text-sm text-green-100">
                    You've prevented 1.2 tons of CO2 emissions this month!
                </p>
            </div>
        </div>
    );
}


