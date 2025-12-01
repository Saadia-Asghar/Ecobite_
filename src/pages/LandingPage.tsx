import { motion } from 'framer-motion';
import { ArrowRight, Heart, Recycle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/splash');
    };

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-950">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-mint dark:bg-forest-800 text-forest-700 dark:text-forest-300 text-sm font-medium mb-6">
                            <span className="w-2 h-2 bg-forest-500 rounded-full mr-2 animate-pulse"></span>
                            AI-Powered Food Rescue
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-forest-900 dark:text-ivory leading-tight mb-6">
                            Turn Surplus into <br />
                            <span className="text-forest-500 dark:text-forest-400">Social Impact</span>
                        </h1>
                        <p className="text-lg text-forest-700 dark:text-forest-300 mb-8 max-w-lg">
                            Connect surplus food with those in need. Powered by Azure AI for instant quality verification and impact tracking.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-forest-900 dark:bg-forest-700 text-ivory rounded-full font-medium hover:bg-forest-800 dark:hover:bg-forest-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-forest-900/20 dark:shadow-forest-700/20"
                            >
                                Get Started <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSignIn}
                                className="px-8 py-4 bg-white dark:bg-forest-800 text-forest-900 dark:text-ivory border border-forest-200 dark:border-forest-700 rounded-full font-medium hover:bg-forest-50 dark:hover:bg-forest-700 transition-all flex items-center justify-center"
                            >
                                Sign In
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-forest-200 to-mint rounded-3xl transform rotate-3 opacity-50 blur-3xl"></div>
                        <div className="relative bg-white dark:bg-forest-800 p-6 rounded-3xl shadow-2xl border border-forest-100 dark:border-forest-700">
                            {/* Mock UI Card */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-forest-100 dark:bg-forest-700 rounded-full flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-forest-600 dark:text-forest-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-forest-900 dark:text-ivory">Fresh Bakery Items</h3>
                                            <p className="text-sm text-forest-500 dark:text-forest-400">Posted 5 mins ago</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-mint dark:bg-forest-700 text-forest-700 dark:text-forest-300 text-xs font-medium rounded-full">
                                        AI Verified 98%
                                    </span>
                                </div>
                                <div className="h-48 bg-forest-50 dark:bg-forest-900 rounded-2xl w-full object-cover flex items-center justify-center text-forest-300 dark:text-forest-500">
                                    {/* Placeholder for image */}
                                    <span className="text-sm">Food Image Analysis</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="text-sm text-forest-600 dark:text-forest-400">
                                        <span className="font-bold">5kg</span> available
                                    </div>
                                    <button className="px-4 py-2 bg-forest-900 dark:bg-forest-700 text-ivory text-sm rounded-xl hover:bg-forest-800 dark:hover:bg-forest-600 transition-colors">
                                        Claim Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white dark:bg-forest-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheck className="w-6 h-6" />,
                                title: "AI Quality Check",
                                desc: "Azure Custom Vision analyzes food quality instantly to ensure safety."
                            },
                            {
                                icon: <Recycle className="w-6 h-6" />,
                                title: "Zero Waste",
                                desc: "Smart routing directs food to people, animals, or compost based on condition."
                            },
                            {
                                icon: <Heart className="w-6 h-6" />,
                                title: "Impact Tracking",
                                desc: "Track your CO2 savings and meals served with real-time analytics."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-forest-50 dark:bg-forest-800 hover:bg-mint dark:hover:bg-forest-700 transition-colors cursor-pointer group"
                            >
                                <div className="w-12 h-12 bg-white dark:bg-forest-900 rounded-2xl flex items-center justify-center text-forest-600 dark:text-forest-300 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">{feature.title}</h3>
                                <p className="text-forest-600 dark:text-forest-300 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
