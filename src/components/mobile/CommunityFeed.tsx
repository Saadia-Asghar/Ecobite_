import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Utensils, Clock, Sparkles } from 'lucide-react';
import { API_URL } from '../../config/api';

interface FeedItem {
    id: string;
    aiFoodType: string;
    quantity: string;
    createdAt: string;
    donorName: string;
    donorOrg?: string;
}

export default function CommunityFeed() {
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(`${API_URL}/api/donations/feed`);
                if (response.ok) {
                    const data = await response.json();
                    setFeed(data);
                }
            } catch (error) {
                console.error('Failed to fetch feed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
        const interval = setInterval(fetchFeed, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && feed.length === 0) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-forest-100 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-forest-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-mint-600" />
                    Live from EcoBite
                </h3>
                <span className="text-xs font-bold text-mint-700 bg-mint-100 px-2 py-1 rounded-full animate-pulse">
                    LIVE
                </span>
            </div>

            <AnimatePresence mode="popLayout">
                {feed.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-2xl border border-forest-100 shadow-sm hover:shadow-md transition-all flex gap-4 items-center"
                    >
                        <div className="w-12 h-12 bg-mint-50 rounded-full flex items-center justify-center text-mint-700 shrink-0">
                            <Utensils className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-forest-900 truncate">
                                <span className="font-bold">{item.donorOrg || item.donorName}</span>
                                <span className="text-forest-500 font-normal"> rescued </span>
                                <span className="font-bold text-forest-700">{item.quantity}</span> of {item.aiFoodType}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-forest-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-mint-600 font-bold flex items-center gap-1">
                                    <Heart className="w-3 h-3 fill-mint-600" />
                                    Impact Hero
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {feed.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-forest-400 text-sm italic">Be the first to create an impact today! 🌟</p>
                </div>
            )}
        </div>
    );
}
