import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Leaf, Sparkles, Users, TrendingUp } from 'lucide-react';

export default function IntroPage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: <Leaf className="w-20 h-20" />,
            title: "Welcome to EcoBite",
            description: "Join the movement to reduce food waste and fight hunger with AI-powered food rescue.",
            color: "from-forest-500 to-forest-700"
        },
        {
            icon: <Sparkles className="w-20 h-20" />,
            title: "AI-Powered Quality Check",
            description: "Our Azure AI instantly verifies food quality and safety, ensuring every donation is safe and fresh.",
            color: "from-mint to-forest-500"
        },
        {
            icon: <Users className="w-20 h-20" />,
            title: "Connect & Share",
            description: "Connect surplus food with people in need, animal shelters, and composting facilities.",
            color: "from-forest-600 to-forest-800"
        },
        {
            icon: <TrendingUp className="w-20 h-20" />,
            title: "Track Your Impact",
            description: "See your real-time impact: meals served, CO2 saved, and lives changed.",
            color: "from-forest-700 to-forest-900"
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/welcome');
        }
    };

    const handleSkip = () => {
        navigate('/welcome');
    };

    return (
        <div className="min-h-screen bg-ivory flex flex-col">
            {/* Skip Button */}
            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={handleSkip}
                    className="text-forest-600 hover:text-forest-900 font-medium text-sm"
                >
                    Skip
                </button>
            </div>

            {/* Slides */}
            <div className="flex-1 flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md w-full text-center"
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className={`w-40 h-40 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center text-ivory shadow-2xl`}
                        >
                            {slides[currentSlide].icon}
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-forest-900 mb-6"
                        >
                            {slides[currentSlide].title}
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-forest-700 leading-relaxed"
                        >
                            {slides[currentSlide].description}
                        </motion.p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="p-8">
                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'w-8 bg-forest-900'
                                    : 'w-2 bg-forest-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Next Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full max-w-md mx-auto block py-4 bg-forest-900 text-ivory rounded-2xl font-bold text-lg hover:bg-forest-800 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                    {currentSlide < slides.length - 1 ? (
                        <>
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </>
                    ) : (
                        "Get Started"
                    )}
                </motion.button>
            </div>
        </div>
    );
}
