import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-forest-900 dark:text-ivory" />
                    </button>
                    <h1 className="text-2xl font-bold text-forest-900 dark:text-ivory">About EcoBite</h1>
                </div>

                <div className="bg-white dark:bg-forest-800 rounded-2xl p-6 border border-forest-100 dark:border-forest-700 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">Our Mission</h2>
                        <p className="text-forest-700 dark:text-forest-300">
                            EcoBite is dedicated to reducing food waste and fighting hunger by connecting food donors
                            with those in need. We leverage technology to make food rescue easy, efficient, and impactful.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">What We Do</h2>
                        <ul className="space-y-2 text-forest-700 dark:text-forest-300">
                            <li>• Connect restaurants, individuals, and organizations with NGOs and shelters</li>
                            <li>• Use AI to analyze food quality and safety</li>
                            <li>• Track environmental impact of food rescue</li>
                            <li>• Reward donors with EcoPoints and vouchers</li>
                            <li>• Facilitate monetary donations for packaging and delivery</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">Our Impact</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">10,000+</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">Meals Rescued</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">5,000+</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">People Fed</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">2,500kg</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">CO2 Saved</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">1,000+</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">Active Users</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">Contact Us</h2>
                        <p className="text-forest-700 dark:text-forest-300">
                            Email: support@ecobite.com<br />
                            Phone: +92-300-1234567<br />
                            Address: Karachi, Pakistan
                        </p>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-sm text-forest-500 dark:text-forest-400">
                            EcoBite v1.0.0 • Made with 💚 for the planet
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
