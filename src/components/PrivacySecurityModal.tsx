import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacySecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export default function PrivacySecurityModal({ isOpen, onClose, onChangePassword }: PrivacySecurityModalProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSaving(true);
        try {
            await onChangePassword(oldPassword, newPassword);
            setSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" 
            style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-forest-800 rounded-3xl w-full max-w-md my-auto min-h-[400px] max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sticky Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-forest-100 dark:border-forest-700 sticky top-0 bg-white dark:bg-forest-800 rounded-t-3xl z-10">
                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Privacy & Security</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-forest-100 dark:hover:bg-forest-700 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-forest-600 dark:text-forest-300" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm">
                            {success}
                        </div>
                    )}

                    <form id="privacy-security-form" onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Change Password
                        </h3>

                        {/* Old Password */}
                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? 'text' : 'password'}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-600 dark:text-forest-400"
                                >
                                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-600 dark:text-forest-400"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-600 dark:text-forest-400"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-forest-50 dark:bg-forest-900/50 p-3 rounded-xl">
                            <p className="text-xs text-forest-600 dark:text-forest-400 font-medium mb-1">Password must:</p>
                            <ul className="text-xs text-forest-600 dark:text-forest-400 space-y-1">
                                <li className="flex items-center gap-2">
                                    <span className={newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                                        • Be at least 6 characters long
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className={newPassword === confirmPassword && newPassword ? 'text-green-600 dark:text-green-400' : ''}>
                                        • Match confirmation password
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </form>
                </div>

                {/* Sticky Footer with Buttons */}
                <div className="sticky bottom-0 p-6 pt-4 border-t border-forest-100 dark:border-forest-700 bg-white dark:bg-forest-800 rounded-b-3xl">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-forest-100 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-forest-200 dark:hover:bg-forest-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="privacy-security-form"
                            disabled={saving}
                            className="flex-1 py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
