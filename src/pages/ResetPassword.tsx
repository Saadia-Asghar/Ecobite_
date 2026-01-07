import { useState, useEffect } from 'react';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
            setVerifying(false);
            return;
        }

        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/verify-reset-token/${token}`);
            const data = await response.json();

            if (response.ok) {
                setValidToken(true);
                setEmail(data.email);
            } else {
                setError(data.error || 'Invalid or expired reset link');
            }
        } catch (err) {
            setError('Failed to verify reset link');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 dark:border-mint mx-auto mb-4"></div>
                    <p className="text-forest-600 dark:text-forest-400">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    if (!validToken) {
        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-forest-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-forest-100 dark:border-forest-700"
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">
                        Invalid Reset Link
                    </h2>

                    <p className="text-forest-600 dark:text-forest-400 mb-6">
                        {error || 'This password reset link is invalid or has expired.'}
                    </p>

                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 transition-all shadow-lg"
                    >
                        Back to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-forest-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-forest-100 dark:border-forest-700"
                >
                    <div className="w-16 h-16 bg-green-100 dark:bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-forest-600 dark:text-mint" />
                    </div>

                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">
                        Password Reset Successful! ✅
                    </h2>

                    <p className="text-forest-600 dark:text-forest-400 mb-6">
                        Your password has been reset successfully. You can now login with your new password.
                    </p>

                    <p className="text-sm text-forest-500 dark:text-forest-500 mb-4 animate-pulse">
                        Redirecting to login page...
                    </p>

                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 transition-all shadow-lg"
                    >
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-forest-800 rounded-3xl shadow-xl p-8 max-w-md w-full border border-forest-100 dark:border-forest-700"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-forest-900 dark:bg-forest-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Lock className="w-10 h-10 text-mint" />
                    </div>
                    <h2 className="text-3xl font-bold text-forest-900 dark:text-ivory mb-2">
                        Reset Password
                    </h2>
                    <p className="text-forest-600 dark:text-forest-400">
                        Enter a strong new password for <br /><strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-forest-700 dark:text-forest-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-2 border-transparent focus:border-mint focus:bg-white dark:focus:bg-forest-600 outline-none transition-all text-forest-900 dark:text-ivory"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-forest-500 dark:text-forest-400 mt-2">
                                Must be at least 6 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-forest-700 dark:text-forest-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-700 border-2 border-transparent focus:border-mint focus:bg-white dark:focus:bg-forest-600 outline-none transition-all text-forest-900 dark:text-ivory"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? 'Updating Password...' : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
