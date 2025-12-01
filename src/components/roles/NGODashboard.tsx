import { useState, useEffect } from 'react';
import { Heart, MapPin, DollarSign, Users, Package, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NGODashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import ClaimedDonationsList from '../dashboard/ClaimedDonationsList';

export default function NGODashboard({ onNavigate }: NGODashboardProps = {}) {
    const { user } = useAuth();
    const [impactStory, setImpactStory] = useState<string>('');
    const [loadingStory, setLoadingStory] = useState(true);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const stats = { meals: 450, co2: 1200 };
                const response = await fetch('http://localhost:3002/api/donations/impact-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stats })
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
        fetchStory();
    }, []);

    return (
        <div className="space-y-6">
            {/* NGO Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-3xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">{user?.organization || user?.name || 'NGO'}</h1>
                        <p className="text-blue-100 text-sm">NGO • Verified</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Serving 500+ families daily</span>
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
                        <p className="text-sm text-red-700 dark:text-red-400 mb-3">We need 100 meals for tonight's service</p>
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
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">28</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Available Now</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">450</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Fed This Week</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">$850</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Logistics Fund</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <MapPin className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">12</p>
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
                        📍 Find Nearby Donors
                    </button>
                </div>
            </div>

            {/* Claimed Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Claimed Donations</h3>
                <ClaimedDonationsList />
            </div>

            {/* Active Requests */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <h3 className="font-bold text-lg mb-3">Active Food Requests</h3>
                <div className="space-y-2 mb-4">
                    <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                        <p className="font-medium text-sm">Rice & Grains - 50kg</p>
                        <p className="text-xs text-purple-100">12 donors notified • 3 responses</p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate?.('add')}
                    className="w-full py-2 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors text-sm"
                >
                    View All Requests
                </button>
            </div>
        </div>
    );
}
