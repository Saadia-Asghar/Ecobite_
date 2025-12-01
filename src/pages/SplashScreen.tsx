import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function SplashScreen() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/welcome');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    duration: 1.5
                }}
                className="text-center"
            >
                {/* Logo */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                    className="w-32 h-32 mx-auto bg-mint rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
                >
                    <Leaf className="w-20 h-20 text-forest-900" />
                </motion.div>



                {/* Loading Dots */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-center gap-2 mt-12"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-3 h-3 bg-mint rounded-full"
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
