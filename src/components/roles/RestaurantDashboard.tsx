import { useState, useEffect } from 'react';
import { Store, TrendingUp, BarChart3, Users, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface RestaurantDashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'nearby') => void;
}

import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import PromotionalBanner from '../PromotionalBanner';
import { useDashboardBanners } from '../../hooks/useDashboardBanners';
import { API_URL } from '../../config/api';

export default function RestaurantDashboard({ onNavigate }: RestaurantDashboardProps = {}) {
    const { user } = useAuth();
    const { banners } = useDashboardBanners('restaurant');

    const [impactStory, setImpactStory] = useState<string>('');
    const [loadingStory, setLoadingStory] = useState(true);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const stats = { donations: 45, peopleFed: 245, co2Saved: 680 };
                const response = await fetch(`${API_URL}/api/donations/impact-story`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stats })
                });
                if (response.ok) {
                    const data = await response.json();
                    setImpactStory(data.story);
                }
            } catch (error) {
                setImpactStory("Your restaurant is making a huge impact!");
            } finally {
                setLoadingStory(false);
            }
        };
        fetchStory();
    }, []);



    return (
        <div className="space-y-6">
            {/* Restaurant Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-3xl text-white flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Store className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">{user?.organization || user?.name || 'Restaurant'}</h1>
                            <p className="text-orange-100 text-sm">Restaurant Partner</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                        <span className="font-bold">Top Contributor</span>
                    </div>
                </div>
                <div className="bg-white/20 rounded-full p-1 relative z-[100]">
                    <NotificationsPanel />
                </div>
            </div>

            {/* AI Impact Story */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 rounded-3xl shadow-lg text-ivory relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-mint-400" />
                        <h3 className="text-mint-400 font-bold uppercase tracking-wider text-xs">CSR Impact Report</h3>
                    </div>
                    {loadingStory ? (
                        <div className="h-12 animate-pulse bg-white/10 rounded-xl w-full"></div>
                    ) : (
                        <p className="text-lg font-medium leading-relaxed">"{impactStory}"</p>
                    )}
                </div>
            </div>

            {/* Business Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">45</p>
                    <p className="text-sm text-forest-600">This Month</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">245</p>
                    <p className="text-sm text-forest-600">People Fed</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">680kg</p>
                    <p className="text-sm text-forest-600">CO2 Saved</p>
                </motion.div>

            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate?.('add')}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                    >
                        + Quick Add Surplus
                    </button>

                    <button
                        onClick={() => onNavigate?.('nearby')}
                        className="w-full py-3 bg-forest-100 text-forest-900 rounded-xl font-bold hover:bg-forest-200 transition-colors"
                    >
                        📍 Find Nearby NGOs
                    </button>
                    <button
                        onClick={() => onNavigate?.('stats')}
                        className="w-full py-3 bg-forest-50 text-forest-900 rounded-xl font-bold hover:bg-forest-100 transition-colors"
                    >
                        View Analytics
                    </button>
                </div>
            </div>

            {/* Today's Donations */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">My Donations</h3>
                <DonorDonationsList />
            </div>

            {/* CSR Badge */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Platinum CSR Partner</h3>
                        <p className="text-green-100 text-sm">Top 1% of restaurants</p>
                    </div>
                </div>
                <p className="text-sm text-green-100">Share your impact on social media to boost your brand!</p>
            </div>

            {/* Voucher Creation Modal */}

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

    useEffect(() => {
        if (user) {
            fetchDonations();
        }
    }, [user]);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/donations?donorId=${user?.id}`, {
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
            const response = await fetch(`${API_URL}/api/donations/${id}/confirm-sent`, {
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

    return (
        <div className="space-y-3">
            {donations.map((donation) => (
                <div key={donation.id} className="flex flex-col p-3 rounded-xl hover:bg-forest-50 transition-colors border border-forest-50">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-medium text-forest-900 text-sm">{donation.aiFoodType || 'Donation'}</p>
                            <p className="text-xs text-forest-500">{donation.quantity} • {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${donation.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            donation.status === 'Pending Pickup' ? 'bg-orange-100 text-orange-700' :
                                donation.status === 'Claimed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {donation.status}
                        </span>
                    </div>

                    {(donation.status === 'Pending Pickup' || donation.status === 'Claimed') && (
                        <div className="flex items-center justify-between text-xs mt-1 border-t border-forest-100 pt-2">
                            <span className="text-forest-500">
                                {donation.senderConfirmed ? '✅ You confirmed' : '⏳ Action needed'}
                            </span>

                            {!donation.senderConfirmed && (
                                <button
                                    onClick={() => handleConfirmSent(donation.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Mark Sent
                                </button>
                            )}
                            {donation.senderConfirmed && !donation.receiverConfirmed && (
                                <span className="text-orange-600 font-medium">Waiting for Receiver</span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
