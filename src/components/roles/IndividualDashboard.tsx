import { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface IndividualDashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import PromotionalBanner from '../PromotionalBanner';
import { useDashboardBanners } from '../../hooks/useDashboardBanners';

export default function IndividualDashboard({ onNavigate }: IndividualDashboardProps = {}) {
    const { user } = useAuth();
    const { banners } = useDashboardBanners('individual');
    const [impactStory, setImpactStory] = useState<string>('');
    const [loadingStory, setLoadingStory] = useState(true);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const stats = { meals: 12, co2: 35 };
                const response = await fetch('/api/donations/impact-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stats })
                });
                if (response.ok) {
                    const data = await response.json();
                    setImpactStory(data.story);
                }
            } catch (error) {
                setImpactStory("Every donation makes a difference!");
            } finally {
                setLoadingStory(false);
            }
        };
        fetchStory();
    }, []);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-3xl text-white shadow-lg flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Welcome Back, {user?.name || 'User'}! 👋</h1>
                    <p className="text-green-100">Individual Donor</p>
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
                        <h3 className="text-mint-400 font-bold uppercase tracking-wider text-xs">Your Impact Story</h3>
                    </div>
                    {loadingStory ? (
                        <div className="h-12 animate-pulse bg-white/10 rounded-xl w-full"></div>
                    ) : (
                        <p className="text-lg font-medium leading-relaxed">"{impactStory}"</p>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Package className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">12</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">Donations</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Award className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">450</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">EcoPoints</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">36</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">People Fed</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">35kg</p>
                    <p className="text-sm text-forest-600 dark:text-forest-300">CO2 Saved</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate?.('add')}
                        className="w-full py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors"
                    >
                        + Donate Food
                    </button>
                    <button
                        onClick={() => window.location.href = '/money-donation'}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-colors"
                    >
                        💰 Donate Money
                    </button>
                    <button
                        onClick={() => onNavigate?.('finance')}
                        className="w-full py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                    >
                        Request Finance
                    </button>
                    <button
                        onClick={() => onNavigate?.('nearby')}
                        className="w-full py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                    >
                        📍 Find Nearby NGOs
                    </button>
                    <button
                        onClick={() => onNavigate?.('stats')}
                        className="w-full py-3 bg-forest-50 dark:bg-forest-700/50 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-100 dark:hover:bg-forest-600 transition-colors"
                    >
                        View Stats
                    </button>
                </div>
            </div>

            {/* My Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">My Donations</h3>
                <DonorDonationsList />
            </div>

            {/* Next Badge Progress */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5" />
                    <h3 className="font-bold">Next Badge: Community Hero</h3>
                </div>
                <p className="text-purple-100 text-sm mb-3">Help 50 people to unlock</p>
                <div className="bg-white/20 rounded-full h-3 mb-2">
                    <div className="bg-white h-3 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <p className="text-sm text-purple-100">36 / 50 people helped</p>
            </div>

            {/* Promotional Banners - Footer */}
            {banners.map(banner => (
                <PromotionalBanner key={banner.id} banner={banner} />
            ))}
        </div>
    );
}

function DonorDonationsList() {
    const { user, token } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'pending' | 'completed' | 'expired' | 'recycled'>('all');

    useEffect(() => {
        if (user) {
            fetchDonations();
        }
    }, [user]);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`/api/donations?donorId=${user?.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDonations(data);
            }
        } catch (error) {
            console.error('Failed to fetch donations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSent = async (id: string) => {
        try {
            const response = await fetch(`/api/donations/${id}/confirm-sent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                fetchDonations(); // Refresh list
                alert('✅ Confirmed sent!');
            } else {
                throw new Error('Failed to confirm sent');
            }
        } catch (error) {
            console.error('Failed to confirm, using mock update', error);
            setDonations(prev => prev.map(d => {
                if (d.id === id) {
                    const updated = { ...d, senderConfirmed: 1 };
                    if (updated.receiverConfirmed) updated.status = 'Completed';
                    return updated;
                }
                return d;
            }));
            alert('✅ (Offline Mode) Confirmed sent!');
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (donations.length === 0) return <div className="text-center py-4 text-gray-500">No donations yet.</div>;

    // Check if donation is expired
    const isExpired = (donation: any) => {
        if (!donation.expiry) return false;
        return new Date(donation.expiry) < new Date();
    };

    // Filter donations
    const filteredDonations = donations.filter(d => {
        if (filter === 'all') return true;

        if (filter === 'available') {
            return d.status === 'Available' && !isExpired(d);
        }

        if (filter === 'pending') {
            return (d.status === 'Claimed' || d.status === 'Pending' || d.status === 'Pending Pickup')
                && (!d.senderConfirmed || !d.receiverConfirmed);
        }

        if (filter === 'completed') {
            return (d.status === 'Delivered' || d.status === 'Completed')
                || (d.senderConfirmed && d.receiverConfirmed);
        }

        if (filter === 'expired') {
            return isExpired(d) && d.status !== 'Recycled';
        }

        if (filter === 'recycled') {
            return d.status === 'Recycled';
        }

        return true;
    });

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'available', 'pending', 'completed', 'expired', 'recycled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${filter === f
                            ? 'bg-forest-900 dark:bg-forest-500 text-ivory'
                            : 'bg-forest-100 dark:bg-forest-700 text-forest-700 dark:text-forest-300 hover:bg-forest-200 dark:hover:bg-forest-600'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Donations List */}
            {filteredDonations.length === 0 ? (
                <div className="text-center py-8 text-forest-500 dark:text-forest-400 text-sm">
                    No {filter !== 'all' ? filter : ''} donations found.
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDonations.map((donation) => (
                        <div key={donation.id} className="flex flex-col p-3 rounded-xl hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors border border-forest-50 dark:border-forest-700">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-medium text-forest-900 dark:text-ivory text-sm">{donation.aiFoodType || 'Donation'}</p>
                                    <p className="text-xs text-forest-500 dark:text-forest-400">{donation.quantity} • {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${donation.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    donation.status === 'Pending Pickup' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                        donation.status === 'Claimed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            donation.status === 'Recycled' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                isExpired(donation) ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {isExpired(donation) && donation.status === 'Available' ? 'Expired' : donation.status}
                                </span>
                            </div>

                            {(donation.status === 'Pending Pickup' || donation.status === 'Claimed') && (
                                <div className="flex items-center justify-between text-xs mt-1 border-t border-forest-100 dark:border-forest-700 pt-2">
                                    <span className="text-forest-500 dark:text-forest-400">
                                        {donation.senderConfirmed ? '✅ You marked as delivered' : '⏳ Action needed'}
                                    </span>

                                    {!donation.senderConfirmed && (
                                        <button
                                            onClick={() => handleConfirmSent(donation.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}
                                    {donation.senderConfirmed && !donation.receiverConfirmed && (
                                        <span className="text-orange-600 dark:text-orange-400 font-medium">Waiting for receiver confirmation</span>
                                    )}
                                    {donation.senderConfirmed && donation.receiverConfirmed && (
                                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Completed!</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
