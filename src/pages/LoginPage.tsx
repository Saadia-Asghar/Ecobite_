import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage('');

        if (!resetEmail || !resetEmail.includes('@')) {
            setResetMessage('Please enter a valid email address');
            return;
        }

        // Simulate password reset (in production, this would call an API)
        setTimeout(() => {
            setResetMessage('✅ Password reset link sent to your email!');
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetMessage('');
            }, 3000);
        }, 1000);
    };

    if (showForgotPassword) {
        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="text-center mb-8"
                    >
                        <div className="w-20 h-20 mx-auto bg-forest-900 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                            <Leaf className="w-12 h-12 text-mint" />
                        </div>
                        <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">Reset Password</h1>
                        <p className="text-forest-600 dark:text-forest-300">Enter your email to receive a reset link</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-forest-800 p-8 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-lg"
                    >
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            {resetMessage && (
                                <div className={`p-4 rounded-xl text-sm ${resetMessage.includes('✅')
                                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                    }`}>
                                    {resetMessage}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </div>
                                </label>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg"
                            >
                                Send Reset Link
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetEmail('');
                                    setResetMessage('');
                                }}
                                className="w-full py-4 bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-50 dark:hover:bg-forest-600 transition-all border-2 border-forest-200 dark:border-forest-600"
                            >
                                Back to Login
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="w-20 h-20 mx-auto bg-forest-900 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                        <Leaf className="w-12 h-12 text-mint" />
                    </div>
                    <h1 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">Welcome Back</h1>
                    <p className="text-forest-600 dark:text-forest-300">Sign in to continue</p>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-forest-800 p-8 rounded-2xl border border-forest-100 dark:border-forest-700 shadow-lg"
                >
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </div>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Password
                                </div>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-transparent focus:bg-white dark:focus:bg-forest-600 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder-forest-400 dark:placeholder-forest-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg mt-6 disabled:opacity-50"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-forest-200 dark:border-forest-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-forest-800 text-forest-500 dark:text-forest-400">Or continue with</span>
                        </div>
                    </div>

                    {/* Microsoft OAuth Button */}
                    <button
                        type="button"
                        onClick={() => alert('Microsoft OAuth integration coming soon! For now, use email/password login.')}
                        className="w-full py-4 bg-white dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-50 dark:hover:bg-forest-600 transition-all border-2 border-forest-200 dark:border-forest-600 flex items-center justify-center gap-3 shadow-md"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                            <path d="M11 0H0V11H11V0Z" fill="#F25022" />
                            <path d="M23 0H12V11H23V0Z" fill="#7FBA00" />
                            <path d="M11 12H0V23H11V12Z" fill="#00A4EF" />
                            <path d="M23 12H12V23H23V12Z" fill="#FFB900" />
                        </svg>
                        Continue with Microsoft
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-forest-600 dark:text-forest-300 hover:text-forest-900 dark:hover:text-ivory font-medium"
                        >
                            Forgot password?
                        </button>
                    </div>
                </motion.div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-forest-600 dark:text-forest-300 mt-6">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-forest-900 dark:text-ivory font-bold hover:underline"
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
}
