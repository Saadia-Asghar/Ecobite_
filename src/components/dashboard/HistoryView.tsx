import { useState } from 'react';
import { Calendar, TrendingUp, Award, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryItem {
    id: string;
    type: 'donation' | 'claim' | 'badge';
    title: string;
    description: string;
    points: number;
    date: string;
}

export default function HistoryView() {
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

    // Mock history data
    const history: HistoryItem[] = [
        {
            id: '1',
            type: 'donation',
            title: 'Donated Fresh Vegetables',
            description: '5kg of mixed vegetables',
            points: 50,
            date: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '2',
            type: 'badge',
            title: 'Earned "Food Rescuer" Badge',
            description: 'Completed 10 donations',
            points: 100,
            date: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: '3',
            type: 'donation',
            title: 'Donated Bakery Items',
            description: '20 pieces of bread',
            points: 40,
            date: new Date(Date.now() - 259200000).toISOString()
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'donation': return Package;
            case 'badge': return Award;
            default: return Calendar;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'donation': return 'bg-green-100 text-green-700';
            case 'badge': return 'bg-purple-100 text-purple-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-forest-900">Activity History</h2>
                <div className="flex gap-2">
                    {(['week', 'month', 'all'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all ${timeframe === t
                                    ? 'bg-forest-900 text-ivory'
                                    : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
                                }`}
                        >
                            {t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Package className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-green-100 text-sm">Total Donations</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 opacity-80" />
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-purple-100 text-sm">Badges Earned</p>
                </div>
                <div className="bg-gradient-to-br from-forest-600 to-forest-700 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold opacity-80">★</span>
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold">1,250</p>
                    <p className="text-mint-200 text-sm">EcoPoints Earned</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-forest-100">
                <h3 className="font-bold text-lg text-forest-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {history.map((item, index) => {
                        const Icon = getIcon(item.type);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 p-4 rounded-xl hover:bg-forest-50 transition-colors"
                            >
                                <div className={`p-3 rounded-xl ${getColor(item.type)}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-forest-900">{item.title}</h4>
                                    <p className="text-sm text-forest-600">{item.description}</p>
                                    <p className="text-xs text-forest-400 mt-1">
                                        {new Date(item.date).toLocaleDateString()} • +{item.points} points
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
