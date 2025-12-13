import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Package, Award, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../config/api';

interface AnalyticsData {
    totalDonations: number;
    totalUsers: number;
    totalFunds: number;
    totalEcoPoints: number;
    donationTrend: Array<{ date: string; count: number }>;
    usersByType: Array<{ type: string; count: number }>;
    fundsByCategory: Array<{ category: string; amount: number }>;
}

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdvancedAnalytics() {
    const [data, setData] = useState<AnalyticsData>({
        totalDonations: 0,
        totalUsers: 0,
        totalFunds: 0,
        totalEcoPoints: 0,
        donationTrend: [],
        usersByType: [],
        fundsByCategory: [],
    });
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch summary data
            const summaryRes = await fetch(`${API_URL}/api/finance/summary?period=${timeRange}`);
            const summary = await summaryRes.json();

            // Fetch analytics data
            const analyticsRes = await fetch(`${API_URL}/api/finance/analytics`);
            const analytics = await analyticsRes.json();

            // Mock data for demonstration (replace with real API calls)
            setData({
                totalDonations: summary.donations?.count || 0,
                totalUsers: 150, // Would come from users API
                totalFunds: summary.donations?.total || 0,
                totalEcoPoints: 12500, // Would come from users API
                donationTrend: generateTrendData(),
                usersByType: [
                    { type: 'Individual', count: 80 },
                    { type: 'Restaurant', count: 25 },
                    { type: 'NGO', count: 20 },
                    { type: 'Shelter', count: 15 },
                    { type: 'Fertilizer', count: 10 },
                ],
                fundsByCategory: analytics.categoryBreakdown || [],
            });
        } catch (error) {
            console.error('Analytics fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateTrendData = () => {
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: Math.floor(Math.random() * 20) + 5,
            });
        }
        return data;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-900 dark:border-ivory"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Advanced Analytics</h2>

                {/* Time Range Selector */}
                <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                    ? 'bg-forest-900 text-ivory dark:bg-forest-500'
                                    : 'bg-forest-100 text-forest-700 hover:bg-forest-200 dark:bg-forest-800 dark:text-forest-300'
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-8 h-8" />
                        <h3 className="text-lg font-bold">Total Donations</h3>
                    </div>
                    <p className="text-4xl font-bold">{data.totalDonations}</p>
                    <p className="text-green-100 text-sm mt-2">Food donations made</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8" />
                        <h3 className="text-lg font-bold">Total Users</h3>
                    </div>
                    <p className="text-4xl font-bold">{data.totalUsers}</p>
                    <p className="text-blue-100 text-sm mt-2">Active community members</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-8 h-8" />
                        <h3 className="text-lg font-bold">Total Funds</h3>
                    </div>
                    <p className="text-4xl font-bold">PKR {data.totalFunds.toLocaleString()}</p>
                    <p className="text-orange-100 text-sm mt-2">Money donated</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-8 h-8" />
                        <h3 className="text-lg font-bold">EcoPoints</h3>
                    </div>
                    <p className="text-4xl font-bold">{data.totalEcoPoints.toLocaleString()}</p>
                    <p className="text-purple-100 text-sm mt-2">Points earned by users</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donation Trend */}
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-forest-900 dark:text-ivory">Donation Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.donationTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#059669"
                                strokeWidth={3}
                                name="Donations"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Users by Type */}
                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-forest-900 dark:text-ivory">Users by Type</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.usersByType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {data.usersByType.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-forest-900 dark:text-ivory">Funds by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.fundsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="category" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="total" fill="#f59e0b" name="Amount (PKR)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
                <button className="px-6 py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Export Report
                </button>
            </div>
        </div>
    );
}
