import { Dog, Package, TrendingUp, MapPin, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimalShelterDashboardProps {
    onNavigate?: (tab: 'add' | 'stats' | 'finance' | 'nearby' | 'donations') => void;
}

import { useAuth } from '../../context/AuthContext';
import ClaimedDonationsList from '../dashboard/ClaimedDonationsList';
import AnimalFoodDonationsList from '../dashboard/AnimalFoodDonationsList';

export default function AnimalShelterDashboard({ onNavigate }: AnimalShelterDashboardProps = {}) {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            {/* Shelter Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-3xl text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Dog className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">{user?.organization || user?.name || 'Animal Shelter'}</h1>
                        <p className="text-amber-100 text-sm">Animal Shelter • Verified</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Caring for 150+ animals</span>
                </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-forest-900 to-forest-800 p-6 rounded-3xl shadow-lg text-ivory">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-mint-400" />
                    <h3 className="text-mint-400 font-bold uppercase tracking-wider text-xs">This Month's Impact</h3>
                </div>
                <p className="text-lg font-medium leading-relaxed">
                    "You've rescued 85kg of food, providing 340 meals for shelter animals. Your work prevents waste and saves lives!"
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Package className="w-8 h-8 text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">18</p>
                    <p className="text-sm text-forest-600">Available Items</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Dog className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">340</p>
                    <p className="text-sm text-forest-600">Meals Served</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">85kg</p>
                    <p className="text-sm text-forest-600">Food Rescued</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest-100"
                >
                    <Clock className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900">5</p>
                    <p className="text-sm text-forest-600">Pending Pickups</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate?.('donations')}
                        className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                    >
                        Browse Animal-Safe Food
                    </button>
                    <button
                        onClick={() => onNavigate?.('finance')}
                        className="w-full py-3 bg-forest-100 text-forest-900 rounded-xl font-bold hover:bg-forest-200 transition-colors"
                    >
                        Request Transport Funding
                    </button>
                    <button
                        onClick={() => onNavigate?.('nearby')}
                        className="w-full py-3 bg-forest-100 text-forest-900 rounded-xl font-bold hover:bg-forest-200 transition-colors"
                    >
                        📍 Find Nearby Donors
                    </button>
                </div>
            </div>

            {/* Animal Food Donations - Claimed, Pending, Completed */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">🐾 Animal Food Donations</h3>
                <p className="text-sm text-forest-600 dark:text-forest-400 mb-4">
                    Track food donations suitable for animals - claimed, pending, and completed
                </p>
                <AnimalFoodDonationsList />
            </div>

            {/* Auto-Redirected Food */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-forest-900">Auto-Redirected Food</h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                        AI Matched
                    </span>
                </div>
                <p className="text-sm text-forest-600 mb-4">
                    Food items automatically flagged as safe for animal consumption
                </p>
                <div className="space-y-3">
                    {[
                        { item: 'Vegetable Scraps', qty: '8kg', donor: 'Green Market', quality: 65, safe: true },
                        { item: 'Bread (Day Old)', qty: '15 loaves', donor: 'Local Bakery', quality: 58, safe: true },
                        { item: 'Meat Trimmings', qty: '5kg', donor: 'Butcher Shop', quality: 72, safe: true }
                    ].map((food, index) => (
                        <div key={index} className="p-3 rounded-xl border border-forest-100 hover:bg-forest-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-bold text-forest-900 text-sm">{food.item}</p>
                                    <p className="text-xs text-forest-600">from {food.donor}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-600" />
                                        <span className="text-xs font-bold text-purple-600">{food.quality}%</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        Safe
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-forest-600">{food.qty}</span>
                                <button
                                    onClick={() => alert(`✅ Claimed ${food.item}! This will be connected to the backend.`)}
                                    className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                                >
                                    Claim
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Claimed Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Claimed Donations</h3>
                <ClaimedDonationsList />
            </div>

            {/* Animals Fed Counter */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Dog className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">150 Animals Fed</h3>
                        <p className="text-green-100 text-sm">This week</p>
                    </div>
                </div>
                <p className="text-sm text-green-100">
                    Your shelter is making a huge difference in animal welfare!
                </p>
            </div>
        </div>
    );
}


