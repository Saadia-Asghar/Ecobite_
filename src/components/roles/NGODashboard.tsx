import { useState, useEffect } from 'react';
import { Heart, MapPin, DollarSign, Users, Package, Sparkles, AlertCircle, BarChart3, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

interface NGODashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import ClaimedDonationsList from '../dashboard/ClaimedDonationsList';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import PromotionalBanner from '../PromotionalBanner';
import { useDashboardBanners } from '../../hooks/useDashboardBanners';

export default function NGODashboard({ onNavigate }: NGODashboardProps = {}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { banners } = useDashboardBanners('ngo');
    const [impactStory, setImpactStory] = useState<string>('');
    const [loadingStory, setLoadingStory] = useState(true);
    const [stats, setStats] = useState({
        donations: 0,
        peopleFed: 0,
        co2Saved: 0,
        ecoPoints: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

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
            console.error('Error fetching NGO stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchStory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/donations/impact-story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats: stats.peopleFed > 0 ? stats : { donations: 28, peopleFed: 450, co2Saved: 1200 } })
            });
            if (response.ok) {
                const data = await response.json();
                setImpactStory(data.story);
            }
        } catch (error) {
            setImpactStory("Your organization is changing lives!");
        } finally {
            setLoadingStory(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchStats().then(fetchStory);
        }
    }, [user?.id]);

    // Listen for donation events to refresh stats in real-time
    useEffect(() => {
        const handleDonationPosted = (event: any) => {
            const eventUserId = event.detail?.userId;
            // Only refresh if this event is for the current user (require both to exist and match)
            if (user?.id && eventUserId && eventUserId === user.id) {
                console.log('🔄 Refreshing stats for user:', user.id);
                setLoadingStats(true);
                fetchStats().then(fetchStory);
            }
        };

        window.addEventListener('donationPosted', handleDonationPosted);
        return () => {
            window.removeEventListener('donationPosted', handleDonationPosted);
        };
    }, [user?.id]);

    return (
        <div className="space-y-6">
            {/* NGO Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-3xl text-white shadow-lg flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">{user?.organization || user?.name || 'NGO'}</h1>
                            <p className="text-blue-100 text-sm">NGO • Verified</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Empowering the community through EcoBite</span>
                    </div>
                </div>
                <div className="bg-white/20 rounded-full p-1 relative z-[100]">
                    <NotificationsPanel />
                </div>
            </div>

            {/* AI Impact Story */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 dark:from-forest-800 dark:to-forest-700 p-6 rounded-3xl shadow-lg text-ivory relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-mint-400" />
                        <h3 className="text-mint-400 font-bold uppercase tracking-wider text-xs">Community Impact</h3>
                    </div>
                    {loadingStory ? (
                        <div className="h-12 animate-pulse bg-white/10 rounded-xl w-full"></div>
                    ) : (
                        <p className="text-lg font-medium leading-relaxed">"{impactStory}"</p>
                    )}
                </div>
            </div>

            {/* Urgent Needs Alert */}
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-900 dark:text-red-300 mb-1">Urgent Need</h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-3">Broadcast your immediate food requirements to nearby donors.</p>
                        <button
                            onClick={() => onNavigate?.('add')}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
                        >
                            Broadcast Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Package className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {loadingStats ? '...' : stats.donations}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Total Claims</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {loadingStats ? '...' : stats.peopleFed}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">People Fed</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">Verified</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Logistics Fund</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <MapPin className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">Live</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Nearby Donors</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate?.('donations')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Browse Available Food
                    </button>
                    <button
                        onClick={() => onNavigate?.('add')}
                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                        Create Food Request
                    </button>
                    <button
                        onClick={() => onNavigate?.('finance')}
                        className="w-full py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                    >
                        Request Logistics Funding
                    </button>
                    <button
                        onClick={() => onNavigate?.('nearby')}
                        className="w-full py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                    >
                        📍 Live Donations Map
                    </button>
                    <button
                        onClick={() => navigate('/mobile?tab=profile')}
                        className="w-full py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                        🏦 Manage Bank Account
                    </button>
                </div>
            </div>

            {/* Claimed Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Claimed Donations</h3>
                <ClaimedDonationsList />
            </div>

            {/* EcoPoints Tracking */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                        <h3 className="font-bold text-lg">EcoPoints Balance</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">{loadingStats ? '...' : stats.ecoPoints}</p>
                        <p className="text-sm text-green-100">Total Points</p>
                    </div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Progress to Next Tier</span>
                        <span className="text-sm font-bold">{stats.ecoPoints} / 5000</span>
                    </div>
                    <div className="bg-white/30 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min((stats.ecoPoints / 5000) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Analytics Graph */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory">Monthly Impact Analytics</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                        { month: 'Jan', meals: 320, families: 85 },
                        { month: 'Feb', meals: 380, families: 95 },
                        { month: 'Mar', meals: 420, families: 110 },
                        { month: 'Apr', meals: 450, families: 120 },
                        { month: 'May', meals: 500, families: 135 },
                        { month: 'Jun', meals: 550, families: 145 }
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="meals" fill="#3b82f6" name="Meals Distributed" />
                        <Bar dataKey="families" fill="#8b5cf6" name="Families Helped" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Promotional Banners - Footer */}
            {banners.map(banner => (
                <PromotionalBanner key={banner.id} banner={banner} />
            ))}
        </div>
    );
}
