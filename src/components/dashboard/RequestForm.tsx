import { useState } from 'react';
import { Send, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config/api';

export default function RequestForm() {
    const [foodType, setFoodType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdRequest, setCreatedRequest] = useState<{ aiDrafts: string[] } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/requests/food`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requesterId: 'ngo-123', // Mock ID
                    organizationName: 'Hope Shelter', // Mock Name
                    foodType,
                    quantity
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCreatedRequest(data);
            }
        } catch (error) {
            console.error("Request failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (createdRequest) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-forest-800 p-8 rounded-3xl shadow-sm border border-forest-100 dark:border-forest-700 text-center mb-8">
                    <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-forest-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory">Request Broadcasted!</h3>
                    <p className="text-forest-600 dark:text-forest-300 mt-2">Donors in your area have been notified.</p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h4 className="text-lg font-bold text-forest-900 dark:text-ivory">AI-Drafted Social Media Posts</h4>
                    </div>
                    <p className="text-sm text-forest-500 dark:text-forest-400 -mt-4 mb-6">Use these AI-generated captions to share your need on social media.</p>

                    {createdRequest.aiDrafts.map((draft, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-sm relative group hover:shadow-md transition-all"
                        >
                            <p className="text-forest-800 dark:text-ivory leading-relaxed pr-10">"{draft}"</p>
                            <button
                                onClick={() => copyToClipboard(draft, index)}
                                className="absolute top-4 right-4 p-2 text-forest-400 hover:text-forest-600 dark:hover:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-700 rounded-lg transition-colors"
                                title="Copy to clipboard"
                            >
                                {copiedIndex === index ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </motion.div>
                    ))}

                    <button
                        onClick={() => {
                            setCreatedRequest(null);
                            setFoodType('');
                            setQuantity('');
                        }}
                        className="w-full py-4 mt-8 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-all"
                    >
                        Create Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-forest-800 p-8 rounded-3xl shadow-sm border border-forest-100 dark:border-forest-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Request Food</h2>
                        <p className="text-sm text-forest-500 dark:text-forest-400">AI will help draft your appeal</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">What do you need?</label>
                        <input
                            type="text"
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            placeholder="e.g. Rice, Bread, Cooked Meals"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none transition-all text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">Quantity Needed</label>
                        <input
                            type="text"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g. 50 meals"
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none transition-all text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg shadow-forest-900/20 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Magic...
                            </span>
                        ) : 'Broadcast Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
