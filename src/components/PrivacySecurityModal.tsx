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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-6 max-w-md w-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-forest-900">Privacy & Security</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-forest-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-forest-600" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="font-bold text-forest-900 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Change Password
                    </h3>

                    {/* Old Password */}
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none text-black"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-600"
                            >
                                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none text-black"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-600"
                            >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none text-black"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-forest-50 p-3 rounded-xl">
                        <p className="text-xs text-forest-600 font-medium mb-1">Password must:</p>
                        <ul className="text-xs text-forest-600 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                                    • Be at least 6 characters long
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={newPassword === confirmPassword && newPassword ? 'text-green-600' : ''}>
                                    • Match confirmation password
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-forest-100 text-forest-900 rounded-xl font-bold hover:bg-forest-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-forest-900 text-ivory rounded-xl font-bold hover:bg-forest-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
