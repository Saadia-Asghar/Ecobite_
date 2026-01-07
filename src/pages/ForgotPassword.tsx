import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSent(true);
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-forest-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-forest-100 dark:border-forest-700"
                >
                    <div className="w-20 h-20 bg-mint/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <CheckCircle className="w-10 h-10 text-forest-600 dark:text-mint" />
                    </div>

                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">
                        Check Your Email! 📧
                    </h2>

                    <p className="text-forest-600 dark:text-forest-400 mb-6">
                        We've sent a password reset link to <br /><strong>{email}</strong>
                    </p>

                    <div className="bg-forest-50 dark:bg-forest-900/50 border border-forest-200 dark:border-forest-700 rounded-2xl p-6 mb-8 text-left">
                        <p className="text-sm font-bold text-forest-900 dark:text-ivory mb-3">
                            Next steps:
                        </p>
                        <ol className="text-sm text-forest-600 dark:text-forest-300 space-y-3">
                            <li className="flex gap-2">
                                <span className="font-bold text-mint">1.</span>
                                Check your email inbox
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-mint">2.</span>
                                Click the reset link (expires in 1 hour)
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-mint">3.</span>
                                Create your new password
                            </li>
                        </ol>
                    </div>

                    <p className="text-sm text-forest-500 dark:text-forest-400 mb-6">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setSent(false)}
                            className="w-full py-4 bg-forest-50 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-100 dark:hover:bg-forest-600 transition-all border border-forest-200 dark:border-forest-600"
                        >
                            Try Another Email
                        </button>
                        <Link
                            to="/login"
                            className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 transition-all shadow-lg text-center"
                        >
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-forest-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-forest-100 dark:border-forest-700"
            >
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-forest-500 hover:text-forest-900 dark:hover:text-mint mb-8 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-forest-900 dark:bg-forest-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Mail className="w-10 h-10 text-mint" />
                    </div>
                    <h2 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-forest-600 dark:text-forest-400">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-forest-700 dark:text-forest-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-2 border-transparent focus:border-mint focus:bg-white dark:focus:bg-forest-600 outline-none transition-all text-forest-900 dark:text-ivory"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-forest-500 dark:text-forest-400">
                        Remember your password?{' '}
                        <Link to="/login" className="text-forest-900 dark:text-mint font-bold hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
