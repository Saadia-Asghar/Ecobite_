import { Link } from 'react-router-dom';
import { Leaf, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="fixed top-0 w-full z-50 bg-ivory/80 dark:bg-forest-950/80 backdrop-blur-md border-b border-forest-100 dark:border-forest-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-forest-900 dark:bg-forest-700 p-2 rounded-full">
                            <Leaf className="h-6 w-6 text-ivory" />
                        </div>
                        <span className="text-xl font-bold text-forest-900 dark:text-ivory tracking-tight">EcoBite</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-forest-700 dark:text-forest-300 hover:text-forest-900 dark:hover:text-ivory transition-colors">Home</Link>
                        <Link to="/about" className="text-forest-700 dark:text-forest-300 hover:text-forest-900 dark:hover:text-ivory transition-colors">About</Link>
                        <Link to="/impact" className="text-forest-700 dark:text-forest-300 hover:text-forest-900 dark:hover:text-ivory transition-colors">Impact</Link>
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-forest-300" /> : <Moon className="w-5 h-5 text-forest-700" />}
                        </button>
                        <Link to="/login" className="px-4 py-2 bg-forest-900 dark:bg-forest-700 text-ivory rounded-full hover:bg-forest-800 dark:hover:bg-forest-600 transition-all transform hover:scale-105 shadow-lg shadow-forest-900/20 dark:shadow-forest-700/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
