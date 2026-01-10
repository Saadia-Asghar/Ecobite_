import { useState, useEffect } from 'react';
import { Dog, Package, TrendingUp, MapPin, Clock, Sparkles, Edit2, Trash2, PawPrint, Award, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

interface AnimalShelterDashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import ClaimedDonationsList from '../dashboard/ClaimedDonationsList';
import AnimalFoodDonationsList from '../dashboard/AnimalFoodDonationsList';
import NotificationsPanel from '../dashboard/NotificationsPanel';

interface AnimalCategory {
    id: string;
    name: string;
    count: number;
    color: string;
}

export default function AnimalShelterDashboard({ onNavigate }: AnimalShelterDashboardProps = {}) {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Animal categories state
    const [animalCategories, setAnimalCategories] = useState<AnimalCategory[]>([
        { id: '1', name: 'Dogs', count: 45, color: '#f59e0b' },
        { id: '2', name: 'Cats', count: 38, color: '#8b5cf6' },
        { id: '3', name: 'Birds', count: 22, color: '#3b82f6' },
        { id: '4', name: 'Rabbits', count: 15, color: '#ec4899' },
        { id: '5', name: 'Others', count: 30, color: '#10b981' }
    ]);

    const [isEditingCategories, setIsEditingCategories] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryCount, setNewCategoryCount] = useState(0);

    const [stats, setStats] = useState({
        donations: 0,
        peopleFed: 0, // In shelter context, this is 'Meals Served'
        co2Saved: 0,
        ecoPoints: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [impactStory, setImpactStory] = useState<string>('');
    const [loadingStory, setLoadingStory] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${user?.id}/stats`);
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Fetched real stats from database:', data);
                setStats({
                    donations: data.donations || 0,
                    peopleFed: data.peopleFed || 0,
                    co2Saved: data.co2Saved || 0,
                    ecoPoints: data.ecoPoints || 0
                });
            }
        } catch (error) {
            console.error('Error fetching shelter stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchStory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/donations/impact-story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats: stats.donations > 0 ? stats : { donations: 18, peopleFed: 340, co2Saved: 85 } })
            });
            if (response.ok) {
                const data = await response.json();
                setImpactStory(data.story);
            }
        } catch (error) {
            setImpactStory("Your shelter is saving lives and protecting the environment!");
        } finally {
            setLoadingStory(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchStats().then(fetchStory);
        }
    }, [user?.id]);

    // Listen for donation and payment events to refresh stats in real-time
    useEffect(() => {
        const handleDonationPosted = (event: any) => {
            const eventUserId = event.detail?.userId;
            // STRICT CHECK: Only refresh if this event is for the current authenticated user
            // Prevents unnecessary refreshes for anonymous donations or invalid events
            if (
                user?.id &&
                typeof user.id === 'string' &&
                user.id.trim().length > 0 &&
                eventUserId &&
                typeof eventUserId === 'string' &&
                eventUserId.trim().length > 0 &&
                eventUserId === user.id &&
                eventUserId !== 'anonymous'
            ) {
                console.log('🔄 Refreshing stats for authenticated user:', user.id);
                setLoadingStats(true);
                fetchStats().then(fetchStory);
            } else if (eventUserId && eventUserId !== user?.id) {
                console.log('⏭️  Ignoring donationPosted event: userId mismatch', { eventUserId, currentUserId: user?.id });
            }
        };

        const handlePaymentApproved = (event: any) => {
            const eventUserId = event.detail?.userId;
            // STRICT CHECK: Same validation as donationPosted
            if (
                user?.id &&
                typeof user.id === 'string' &&
                user.id.trim().length > 0 &&
                eventUserId &&
                typeof eventUserId === 'string' &&
                eventUserId.trim().length > 0 &&
                eventUserId === user.id &&
                eventUserId !== 'anonymous'
            ) {
                console.log('💰 Payment approved, refreshing stats for authenticated user:', user.id);
                setLoadingStats(true);
                fetchStats().then(fetchStory);
            } else if (eventUserId && eventUserId !== user?.id) {
                console.log('⏭️  Ignoring paymentApproved event: userId mismatch', { eventUserId, currentUserId: user?.id });
            }
        };

        window.addEventListener('donationPosted', handleDonationPosted);
        window.addEventListener('paymentApproved', handlePaymentApproved);
        return () => {
            window.removeEventListener('donationPosted', handleDonationPosted);
            window.removeEventListener('paymentApproved', handlePaymentApproved);
        };
    }, [user?.id]);

    // Calculate totals
    const totalAnimals = animalCategories.reduce((sum, cat) => sum + cat.count, 0);

    const COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981'];

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            const newCategory: AnimalCategory = {
                id: Date.now().toString(),
                name: newCategoryName,
                count: newCategoryCount,
                color: COLORS[animalCategories.length % COLORS.length]
            };
            setAnimalCategories([...animalCategories, newCategory]);
            setNewCategoryName('');
            setNewCategoryCount(0);
        }
    };

    const handleUpdateCategory = (id: string, count: number) => {
        setAnimalCategories(animalCategories.map(cat =>
            cat.id === id ? { ...cat, count } : cat
        ));
    };

    const handleDeleteCategory = (id: string) => {
        setAnimalCategories(animalCategories.filter(cat => cat.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Shelter Header with Notifications */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-3xl text-white shadow-lg flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Dog className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">{user?.organization || user?.name || 'Animal Shelter'}</h1>
                            <p className="text-amber-100 text-sm">Animal Shelter • Verified</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Caring for {totalAnimals}+ animals</span>
                    </div>
                </div>
                <div className="bg-white/20 rounded-full p-1 relative z-[100]">
                    <NotificationsPanel />
                </div>
            </div>

            {/* EcoPoints Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-3xl text-white shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-6 h-6" />
                            <h3 className="font-bold text-lg">EcoPoints Balance</h3>
                        </div>
                        <p className="text-4xl font-bold">{loadingStats ? '...' : stats.ecoPoints.toLocaleString()}</p>
                        <p className="text-green-100 text-sm mt-1">Keep rescuing to earn more!</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-green-100">Impact Level</p>
                        <p className="text-2xl font-bold">{stats.ecoPoints > 1000 ? 'Silver' : 'Bronze'}</p>
                    </div>
                </div>
            </motion.div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 rounded-3xl shadow-lg text-ivory">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-mint-400" />
                    <h3 className="text-mint-400 font-bold uppercase tracking-wider text-xs">AI Impact Story</h3>
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
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Package className="w-8 h-8 text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {loadingStats ? '...' : stats.donations}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Claims Completed</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Dog className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {loadingStats ? '...' : stats.peopleFed}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Meals Served</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">
                        {loadingStats ? '...' : `${stats.co2Saved}kg`}
                    </p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Food Rescued</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Clock className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">Live</p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Status</p>
                </motion.div>
            </div>

            {/* Animal Categories Management */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory flex items-center gap-2">
                        <PawPrint className="w-5 h-5" />
                        Animal Categories
                    </h3>
                    <button
                        onClick={() => setIsEditingCategories(!isEditingCategories)}
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors flex items-center gap-1"
                    >
                        <Edit2 className="w-4 h-4" />
                        {isEditingCategories ? 'Done' : 'Manage'}
                    </button>
                </div>

                <div className="space-y-3 mb-4">
                    {animalCategories.map((category) => (
                        <div key={category.id} className="flex items-center gap-3 p-3 rounded-xl border border-forest-100 dark:border-forest-700">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                            <div className="flex-1">
                                <p className="font-bold text-forest-900 dark:text-ivory">{category.name}</p>
                            </div>
                            {isEditingCategories ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={category.count}
                                        onChange={(e) => handleUpdateCategory(category.id, parseInt(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 border border-forest-200 dark:border-forest-600 rounded-lg text-center text-sm bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory"
                                    />
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-2xl font-bold text-forest-900 dark:text-ivory">{category.count}</span>
                            )}
                        </div>
                    ))}
                </div>

                {isEditingCategories && (
                    <div className="p-4 bg-forest-50 dark:bg-forest-900/30 rounded-xl border-2 border-dashed border-forest-200 dark:border-forest-600">
                        <p className="text-sm font-bold text-forest-900 dark:text-ivory mb-3">Add New Category</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 px-3 py-2 border border-forest-200 dark:border-forest-600 rounded-lg text-sm bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory"
                            />
                            <input
                                type="number"
                                placeholder="Count"
                                value={newCategoryCount || ''}
                                onChange={(e) => setNewCategoryCount(parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 border border-forest-200 dark:border-forest-600 rounded-lg text-sm bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Total Animals: {totalAnimals}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate?.('donations')}
                        className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                    >
                        Browse Animal-Safe Food
                    </button>
                    <button
                        onClick={() => onNavigate?.('add')}
                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                        Create Food Request
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

            {/* Animal Food Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">🐾 Animal Food Donations</h3>
                <AnimalFoodDonationsList />
            </div>

            {/* Claimed Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Claimed Donations</h3>
                <ClaimedDonationsList />
            </div>
        </div>
    );
}
