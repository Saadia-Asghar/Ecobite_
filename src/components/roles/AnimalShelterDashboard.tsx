import { useState } from 'react';
import { Dog, Package, TrendingUp, MapPin, Clock, Sparkles, Edit2, Plus, Trash2, PawPrint, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const [showStats, setShowStats] = useState(false);
    const [claimedItems, setClaimedItems] = useState<string[]>([]);

    // Calculate totals
    const totalAnimals = animalCategories.reduce((sum, cat) => sum + cat.count, 0);
    const ecoPoints = user?.ecoPoints || 1250;

    // Mock data for charts
    const monthlyData = [
        { month: 'Jan', meals: 280, rescued: 65 },
        { month: 'Feb', meals: 310, rescued: 72 },
        { month: 'Mar', meals: 295, rescued: 68 },
        { month: 'Apr', meals: 340, rescued: 85 },
    ];

    const COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981'];

    const handleClaim = (itemName: string) => {
        setClaimedItems(prev => [...prev, itemName]);
        // Show success message
        alert(`✅ Successfully claimed ${itemName}! The donor has been notified.`);
    };

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
                            <h1 className="text-2xl font-bold">{user?.name || 'Animal Shelter'}</h1>
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
                        <p className="text-4xl font-bold">{ecoPoints.toLocaleString()}</p>
                        <p className="text-green-100 text-sm mt-1">+125 this week</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-green-100">Rank</p>
                        <p className="text-2xl font-bold">#12</p>
                        <p className="text-xs text-green-100">Top Shelter</p>
                    </div>
                </div>
            </motion.div>

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
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Package className="w-8 h-8 text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">18</p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Available Items</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Dog className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">340</p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Meals Served</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">85kg</p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Food Rescued</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700"
                >
                    <Clock className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory">5</p>
                    <p className="text-sm text-forest-600 dark:text-forest-400">Pending Pickups</p>
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

            {/* Analytics Charts */}
            {showStats && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Trends */}
                        <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                            <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Monthly Trends</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="meals" stroke="#f59e0b" strokeWidth={2} name="Meals Served" />
                                    <Line type="monotone" dataKey="rescued" stroke="#10b981" strokeWidth={2} name="Food Rescued (kg)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Animal Distribution */}
                        <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                            <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Animal Distribution</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={animalCategories}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {animalCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* EcoPoints Progress Chart */}
                    <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                        <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">EcoPoints Growth</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyData.map((d, i) => ({ ...d, points: 250 + i * 50 }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="points" fill="#10b981" name="EcoPoints Earned" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* EcoBadges Section */}
                    <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 lg:col-span-2">
                        <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            EcoBadges & Achievements
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Earned Badges */}
                            <div>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-3">🏆 Earned Badges</p>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Animal Savior', icon: '🐾', desc: 'Rescued 50+ animals', progress: 100, color: 'bg-green-500' },
                                        { name: 'Food Rescuer', icon: '🍎', desc: 'Claimed 25+ donations', progress: 100, color: 'bg-blue-500' },
                                        { name: 'Eco Warrior', icon: '🌱', desc: 'Earned 1000 EcoPoints', progress: 100, color: 'bg-purple-500' }
                                    ].map((badge, idx) => (
                                        <div key={idx} className="p-3 bg-gradient-to-r from-green-50 to-mint-50 dark:from-green-900/20 dark:to-mint-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl">{badge.icon}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-forest-900 dark:text-ivory text-sm">{badge.name}</p>
                                                    <p className="text-xs text-forest-600 dark:text-forest-400">{badge.desc}</p>
                                                    <div className="mt-1 h-1.5 bg-forest-200 dark:bg-forest-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${badge.color}`} style={{ width: `${badge.progress}%` }}></div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Locked Badges */}
                            <div>
                                <p className="text-sm font-bold text-forest-500 dark:text-forest-400 mb-3">🔒 Locked Badges</p>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Super Shelter', icon: '🏠', desc: 'Care for 200+ animals', progress: 75, color: 'bg-amber-500' },
                                        { name: 'Zero Waste', icon: '♻️', desc: 'Claim 100 donations', progress: 45, color: 'bg-teal-500' },
                                        { name: 'Eco Legend', icon: '⭐', desc: 'Earn 5000 EcoPoints', progress: 25, color: 'bg-indigo-500' }
                                    ].map((badge, idx) => (
                                        <div key={idx} className="p-3 bg-forest-50 dark:bg-forest-900/30 rounded-xl border border-forest-200 dark:border-forest-700 opacity-75">
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl grayscale opacity-50">{badge.icon}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-forest-700 dark:text-forest-300 text-sm">{badge.name}</p>
                                                    <p className="text-xs text-forest-500 dark:text-forest-500">{badge.desc}</p>
                                                    <div className="mt-1 h-1.5 bg-forest-200 dark:bg-forest-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${badge.color}`} style={{ width: `${badge.progress}%` }}></div>
                                                    </div>
                                                    <p className="text-xs text-forest-500 dark:text-forest-500 mt-0.5">{badge.progress}% complete</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

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
                        onClick={() => onNavigate?.('finance')}
                        className="w-full py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                    >
                        Request Transport Funding
                    </button>
                    <button
                        onClick={() => onNavigate?.('nearby')}
                        className="w-full py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                    >
                        📍 Live Donations Map
                    </button>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        <Award className="w-5 h-5" />
                        View EcoPoints & Badges
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
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-forest-900 dark:text-ivory">Auto-Redirected Food</h3>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                        AI Matched
                    </span>
                </div>
                <p className="text-sm text-forest-600 dark:text-forest-400 mb-4">
                    Food items automatically flagged as safe for animal consumption
                </p>
                <div className="space-y-3">
                    {[
                        { item: 'Vegetable Scraps', qty: '8kg', donor: 'Green Market', quality: 65, safe: true },
                        { item: 'Bread (Day Old)', qty: '15 loaves', donor: 'Local Bakery', quality: 58, safe: true },
                        { item: 'Meat Trimmings', qty: '5kg', donor: 'Butcher Shop', quality: 72, safe: true }
                    ].filter(food => !claimedItems.includes(food.item)).map((food, index) => (
                        <div key={index} className="p-3 rounded-xl border border-forest-100 dark:border-forest-700 hover:bg-forest-50 dark:hover:bg-forest-700/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-bold text-forest-900 dark:text-ivory text-sm">{food.item}</p>
                                    <p className="text-xs text-forest-600 dark:text-forest-400">from {food.donor}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-purple-600" />
                                        <span className="text-xs font-bold text-purple-600">{food.quality}%</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                                        Safe
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-forest-600 dark:text-forest-400">{food.qty}</span>
                                <button
                                    onClick={() => handleClaim(food.item)}
                                    className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                                >
                                    Claim
                                </button>
                            </div>
                        </div>
                    ))}
                    {claimedItems.length > 0 && [
                        { item: 'Vegetable Scraps', qty: '8kg', donor: 'Green Market', quality: 65, safe: true },
                        { item: 'Bread (Day Old)', qty: '15 loaves', donor: 'Local Bakery', quality: 58, safe: true },
                        { item: 'Meat Trimmings', qty: '5kg', donor: 'Butcher Shop', quality: 72, safe: true }
                    ].every(food => claimedItems.includes(food.item)) && (
                            <div className="p-6 text-center text-forest-500 dark:text-forest-400">
                                <p className="text-sm">All items claimed! Check back later for more donations.</p>
                            </div>
                        )}
                </div>
            </div>

            {/* Claimed Donations */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">Claimed Donations</h3>

                {/* Show recently claimed items */}
                {claimedItems.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-forest-600 dark:text-forest-400 mb-3">Recently Claimed Items:</p>
                        <div className="space-y-2">
                            {[
                                { item: 'Vegetable Scraps', qty: '8kg', donor: 'Green Market', quality: 65 },
                                { item: 'Bread (Day Old)', qty: '15 loaves', donor: 'Local Bakery', quality: 58 },
                                { item: 'Meat Trimmings', qty: '5kg', donor: 'Butcher Shop', quality: 72 }
                            ].filter(food => claimedItems.includes(food.item)).map((food, index) => (
                                <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-bold text-forest-900 dark:text-ivory text-sm">{food.item}</p>
                                            <p className="text-xs text-forest-600 dark:text-forest-400">from {food.donor} • {food.qty}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-purple-600">{food.quality}%</span>
                                            <span className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-bold">
                                                ✓ Claimed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <ClaimedDonationsList />
            </div>

            {/* Animals Fed Counter */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Dog className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{totalAnimals} Animals Fed</h3>
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
