import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react';

export default function WelcomePage() {
    const navigate = useNavigate();

    const features = [
        { icon: Sparkles, title: 'AI-Powered', desc: 'Smart food recognition & quality detection' },
        { icon: Users, title: 'Community', desc: 'Connect donors with those in need' },
        { icon: TrendingUp, title: 'Impact', desc: 'Track your environmental contribution' }
    ];

    return (
        <div className="min-h-screen bg-ivory">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-forest-900 to-forest-700 text-ivory p-8 pb-16">
                <div className="max-w-2xl mx-auto text-center pt-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="w-20 h-20 mx-auto bg-mint rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
                    >
                        <Leaf className="w-12 h-12 text-forest-900" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Welcome to EcoBite
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-mint-200 mb-8"
                    >
                        Join the movement to end food waste and feed communities
                    </motion.p>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-2xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-lg border border-forest-100 text-center"
                            >
                                <div className="w-12 h-12 mx-auto bg-mint rounded-xl flex items-center justify-center mb-3">
                                    <Icon className="w-6 h-6 text-forest-700" />
                                </div>
                                <h3 className="font-bold text-forest-900 mb-1">{feature.title}</h3>
                                <p className="text-sm text-forest-600">{feature.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white mb-8"
                >
                    <h3 className="font-bold text-lg mb-4 text-center">The Power of One Meal</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center justify-start h-full">
                            <p className="text-2xl font-bold mb-1">1 Meal</p>
                            <p className="text-xs text-green-100 leading-tight">Saved prevents ~2.5 kg of CO2</p>
                        </div>
                        <div className="flex flex-col items-center justify-start h-full">
                            <p className="text-2xl font-bold mb-1">$5.00</p>
                            <p className="text-xs text-green-100 leading-tight">Average savings per meal</p>
                        </div>
                        <div className="flex flex-col items-center justify-start h-full">
                            <p className="text-2xl font-bold mb-1">1 Person</p>
                            <p className="text-xs text-green-100 leading-tight">Can save 100+ meals a year</p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-4 pb-8"
                >
                    <button
                        onClick={() => navigate('/signup')}
                        className="w-full py-4 bg-forest-900 text-ivory rounded-xl font-bold text-lg hover:bg-forest-800 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-white text-forest-900 rounded-xl font-bold text-lg hover:bg-forest-50 transition-all border-2 border-forest-200"
                    >
                        Sign In
                    </button>

                    <p className="text-center text-sm text-forest-600 mt-4">
                        By continuing, you agree to our{' '}
                        <button
                            onClick={() => navigate('/terms')}
                            className="underline hover:text-forest-800 transition-colors"
                        >
                            Terms & Privacy Policy
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
