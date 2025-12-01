import { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DonationForm() {
    const [image, setImage] = useState<string | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState<{ foodType: string; qualityScore: number } | null>(null);
    const [description, setDescription] = useState('');
    const [expiry, setExpiry] = useState('');
    const [quantity, setQuantity] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const analyzeImage = async (urlToAnalyze: string) => {
        setLoading(true);
        setAiResult(null);
        try {
            const response = await fetch('http://localhost:3002/api/donations/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: urlToAnalyze })
            });

            if (response.ok) {
                const data = await response.json();
                setAiResult(data);
            } else {
                console.error("Analysis failed");
            }
        } catch (error) {
            console.error("Error analyzing image:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const localUrl = URL.createObjectURL(file);
            setImage(localUrl);
            // For local files, we can't easily send to Azure without uploading first.
            // We'll send a placeholder to trigger the mock service, or the user can use the URL input for real Azure.
            analyzeImage('https://example.com/placeholder-food.jpg');
        }
    };

    const handleUrlSubmit = () => {
        if (imageUrlInput) {
            setImage(imageUrlInput);
            analyzeImage(imageUrlInput);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3002/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donorId: 'user-123', // Mock user ID
                    imageUrl: image || 'https://example.com/placeholder.jpg',
                    description,
                    expiry: expiry || new Date(Date.now() + 86400000).toISOString(),
                    quantity,
                    aiFoodType: aiResult?.foodType,
                    aiQualityScore: aiResult?.qualityScore
                })
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center p-12 bg-white rounded-3xl border border-forest-100">
                <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-forest-600" />
                </div>
                <h3 className="text-2xl font-bold text-forest-900">Donation Posted!</h3>
                <p className="text-forest-600 mt-2">Thank you for rescuing food today.</p>
                <button onClick={() => {
                    setSubmitted(false);
                    setImage(null);
                    setAiResult(null);
                    setDescription('');
                    setQuantity('');
                    setImageUrlInput('');
                }} className="mt-6 text-forest-700 font-medium hover:underline">
                    Donate Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-forest-100">
                <h2 className="text-2xl font-bold text-forest-900 mb-6">Post a Donation</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Section */}
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Food Image</label>

                        {/* URL Input for Real Testing */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Paste image URL (for real AI test)"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none text-sm text-black"
                            />
                            <button
                                type="button"
                                onClick={handleUrlSubmit}
                                className="px-4 py-2 bg-forest-100 text-forest-700 rounded-xl text-sm font-medium hover:bg-forest-200"
                            >
                                Analyze URL
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-forest-200 rounded-2xl p-8 text-center hover:bg-forest-50 transition-colors relative overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            />

                            {image ? (
                                <div className="relative z-10 pointer-events-none">
                                    <img src={image} alt="Preview" className="h-48 w-full object-cover rounded-xl mx-auto mb-4" />
                                    {loading ? (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-8 h-8 text-forest-600 animate-spin mb-2" />
                                                <span className="text-sm font-medium text-forest-900">AI Analyzing Quality...</span>
                                            </div>
                                        </div>
                                    ) : aiResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-mint inline-block"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div>
                                                    <p className="text-xs text-forest-500 uppercase tracking-wider font-bold">Detected Type</p>
                                                    <p className="text-lg font-bold text-forest-900">{aiResult.foodType}</p>
                                                </div>
                                                <div className="h-8 w-px bg-forest-200"></div>
                                                <div>
                                                    <p className="text-xs text-forest-500 uppercase tracking-wider font-bold">Quality Score</p>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-lg font-bold ${aiResult.qualityScore > 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                            {aiResult.qualityScore}%
                                                        </span>
                                                        {aiResult.qualityScore > 70 ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 pointer-events-none">
                                    <Upload className="w-12 h-12 text-forest-300 mx-auto mb-4" />
                                    <p className="text-forest-600 font-medium">Click or drag to upload photo</p>
                                    <p className="text-sm text-forest-400 mt-2">AI will automatically detect food type and quality</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-forest-700 mb-2">Food Type</label>
                            <input
                                type="text"
                                value={aiResult?.foodType || ''}
                                onChange={(e) => setAiResult(prev => prev ? { ...prev, foodType: e.target.value } : { foodType: e.target.value, qualityScore: 0 })}
                                placeholder="e.g. Mixed Vegetables"
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none transition-all text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-forest-700 mb-2">Quantity</label>
                            <input
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g. 5 kg"
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none transition-all text-black"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Expiry Date & Time</label>
                        <input
                            type="datetime-local"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Description / Notes</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Any specific details about the food..."
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none transition-all resize-none text-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !image}
                        className="w-full py-4 bg-forest-900 text-ivory rounded-xl font-bold hover:bg-forest-800 transition-all shadow-lg shadow-forest-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Post Donation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
