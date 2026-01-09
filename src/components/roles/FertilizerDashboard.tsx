import { useState, useEffect } from 'react';
import { Leaf, Recycle, Package, Truck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

interface FertilizerDashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import ClaimedDonationsList from '../dashboard/ClaimedDonationsList';
import NotificationsPanel from '../dashboard/NotificationsPanel';

export default function FertilizerDashboard({ onNavigate }: FertilizerDashboardProps = {}) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        donations: 0,
        peopleFed: 0, // In this context, this is 'Waste Collected (kg)'
        co2Saved: 0,
        ecoPoints: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [impactStory, setImpactStory] = useState<string>('');
    const [loadingStory, setLoadingStory] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users/${user?.id}/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats({
                        donations: data.donations || 0,
                        peopleFed: data.peopleFed || 0,
                        co2Saved: data.co2Saved || 0,
                        ecoPoints: data.ecoPoints || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching fertilizer stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        const fetchStory = async () => {
            try {
                const response = await fetch(`${API_URL}/api/donations/impact-story`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stats: stats.donations > 0 ? stats : { donations: 450, peopleFed: 180, co2Saved: 1200 } })
                });
                if (response.ok) {
                    const data = await response.json();
                    setImpactStory(data.story);
                }
            } catch (error) {
                setImpactStory("Converting waste into life-giving resources!");
            } finally {
                setLoadingStory(false);
            }
        };

        if (user?.id) {
            fetchStats().then(fetchStory);
        }
    }, [user?.id]);

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
                {loadingStory ? (
                    <div className="h-12 animate-pulse bg-white/10 rounded-xl w-full"></div>
                ) : (
                    <p className="text-lg font-medium leading-relaxed">"{impactStory}"</p>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Package className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">
                        {loadingStats ? '...' : `${stats.peopleFed}kg`}
                    </p>
                    <p className="text-sm text-forest-600">Waste Collected</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Recycle className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">
                        {loadingStats ? '...' : `${Math.round(stats.peopleFed * 0.4)}kg`}
                    </p>
                    <p className="text-sm text-forest-600">Compost Produced</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Leaf className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">
                        {loadingStats ? '...' : `${stats.co2Saved}kg`}
                    </p>
                    <p className="text-sm text-forest-600">CO2 Prevented</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Truck className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">
                        {loadingStats ? '...' : stats.donations}
                    </p>
                    <p className="text-sm text-forest-600">Claims Logged</p>
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
                        onClick={() => navigate('/mobile?tab=profile')}
                        className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors"
                    >
                        🏦 Manage Bank Account
                    </button>
                </div>
            </div>

            {/* Claimed Waste */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Claimed Waste</h3>
                <ClaimedDonationsList />
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
                    You've contributed significantly to carbon reduction this month!
                </p>
            </div>
        </div>
    );
}
