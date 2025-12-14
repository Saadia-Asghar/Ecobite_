import { useState } from 'react';
import { X, User, Mail, MapPin, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSave: (data: any) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        organization: user?.organization || '',
        email: user?.email || '',
        location: user?.location || '',
        avatar: user?.avatar || ''
    });
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save profile:', error);
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
                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Edit Profile</h2>
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

                    <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-forest-50 dark:bg-forest-700 border-4 border-white dark:border-forest-800 shadow-lg mb-2">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-forest-100 dark:bg-forest-600 text-forest-300 dark:text-forest-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-0">
                                    <ImageUpload
                                        onImageSelected={(_file, url) => setFormData({ ...formData, avatar: url })}
                                        currentUrl={formData.avatar}
                                        compact={true}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-forest-500 dark:text-forest-400">Tap camera to upload</p>
                        </div>
                        {/* Name or Organization */}
                        {user?.role === 'individual' ? (
                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Full Name
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder:text-forest-400 dark:placeholder:text-forest-500"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Organization Name
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder:text-forest-400 dark:placeholder:text-forest-500"
                                    required
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </div>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder:text-forest-400 dark:placeholder:text-forest-500"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location
                                </div>
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                                className="w-full px-4 py-3 rounded-xl bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 focus:bg-white dark:focus:bg-forest-800 focus:ring-2 focus:ring-forest-500 outline-none text-forest-900 dark:text-ivory placeholder:text-forest-400 dark:placeholder:text-forest-500"
                            />
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
                            form="edit-profile-form"
                            disabled={saving}
                            className="flex-1 py-3 bg-forest-900 dark:bg-forest-600 text-ivory rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
