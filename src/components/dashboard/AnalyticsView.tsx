import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Leaf, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsView() {
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

    // Mock data for charts
    const weeklyData = [
        { name: 'Mon', donations: 4, meals: 12, co2: 15 },
        { name: 'Tue', donations: 3, meals: 9, co2: 11 },
        { name: 'Wed', donations: 6, meals: 18, co2: 22 },
        { name: 'Thu', donations: 5, meals: 15, co2: 18 },
        { name: 'Fri', donations: 8, meals: 24, co2: 30 },
        { name: 'Sat', donations: 7, meals: 21, co2: 26 },
        { name: 'Sun', donations: 5, meals: 15, co2: 19 }
    ];

    const foodTypeData = [
        { name: 'Vegetables', value: 35, color: '#4d8562' },
        { name: 'Bakery', value: 25, color: '#6fa382' },
        { name: 'Dairy', value: 20, color: '#9cc5aa' },
        { name: 'Prepared Meals', value: 15, color: '#c5dfcd' },
        { name: 'Other', value: 5, color: '#e1efe6' }
    ];

    const impactMetrics = [
        {
            icon: Leaf,
            label: 'CO2 Saved',
            value: '128 kg',
            change: '+12%',
            color: 'green'
        },
        {
            icon: Users,
            label: 'People Fed',
            value: '245',
            change: '+8%',
            color: 'blue'
        },
        {
            icon: TrendingUp,
            label: 'Donations',
            value: '38',
            change: '+15%',
            color: 'purple'
        },
        {
            icon: Award,
            label: 'Active Users',
            value: '156',
            change: '+23%',
            color: 'orange'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-forest-900">Analytics & Impact</h2>
                <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${timeframe === t
                                    ? 'bg-forest-900 text-ivory'
                                    : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {impactMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl border border-forest-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
                                    <Icon className={`w-6 h-6 text-${metric.color}-700`} />
                                </div>
                                <span className="text-green-600 text-sm font-bold">{metric.change}</span>
                            </div>
                            <p className="text-3xl font-bold text-forest-900 mb-1">{metric.value}</p>
                            <p className="text-sm text-forest-600">{metric.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-forest-100">
                    <h3 className="text-lg font-bold text-forest-900 mb-6">Weekly Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1efe6" />
                            <XAxis dataKey="name" stroke="#1a4d2e" />
                            <YAxis stroke="#1a4d2e" />
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

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-forest-100">
                    <h3 className="text-lg font-bold text-forest-900 mb-6">Food Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={foodTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {foodTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CO2 Impact Visualization */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 rounded-3xl text-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white/20 rounded-xl">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">Environmental Impact</h3>
                        <p className="text-green-100">Your contribution to sustainability</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                        <p className="text-green-100 text-sm mb-1">CO2 Emissions Prevented</p>
                        <p className="text-3xl font-bold">128 kg</p>
                        <p className="text-green-100 text-sm mt-1">≈ 640 km driven</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                        <p className="text-green-100 text-sm mb-1">Water Saved</p>
                        <p className="text-3xl font-bold">2,400 L</p>
                        <p className="text-green-100 text-sm mt-1">≈ 16 bathtubs</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                        <p className="text-green-100 text-sm mb-1">Land Preserved</p>
                        <p className="text-3xl font-bold">45 m²</p>
                        <p className="text-green-100 text-sm mt-1">≈ Small apartment</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white p-6 rounded-2xl border border-forest-100">
                <h3 className="text-lg font-bold text-forest-900 mb-6">Top Contributors This Month</h3>
                <div className="space-y-4">
                    {[
                        { name: 'Green Cafe', donations: 45, points: 2250, rank: 1 },
                        { name: 'Fresh Market', donations: 38, points: 1900, rank: 2 },
                        { name: 'Community Kitchen', donations: 32, points: 1600, rank: 3 },
                        { name: 'Organic Bakery', donations: 28, points: 1400, rank: 4 },
                        { name: 'Local Restaurant', donations: 24, points: 1200, rank: 5 }
                    ].map((user) => (
                        <div key={user.rank} className="flex items-center gap-4 p-4 rounded-xl hover:bg-forest-50 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                    user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                        user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                            'bg-forest-100 text-forest-700'
                                }`}>
                                {user.rank}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-forest-900">{user.name}</p>
                                <p className="text-sm text-forest-600">{user.donations} donations</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-forest-900">{user.points}</p>
                                <p className="text-sm text-forest-600">points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
