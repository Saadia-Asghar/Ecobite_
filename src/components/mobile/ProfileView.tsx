import { useState } from 'react';
import { User, Mail, Bell, Moon, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import EditProfileModal from '../EditProfileModal';
import PrivacySecurityModal from '../PrivacySecurityModal';
import { API_URL } from '../../config/api';

export default function ProfileView() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showPrivacySecurity, setShowPrivacySecurity] = useState(false);

    const handleSaveProfile = async (data: any) => {
        try {
            updateUser(data);
            // For now, just show success message
            // Backend route will be implemented later
            alert('✅ Profile updated successfully! (Backend integration pending)');

            // Uncomment when backend is ready:
            // const response = await fetch(`http://localhost:3002/api/users/${user?.id}`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });
            // if (response.ok) {
            //     window.location.reload();
            // }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('❌ Failed to update profile');
            throw error;
        }
    };

    const handleChangePassword = async (oldPassword: string, newPassword: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    oldPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to change password');
            }
        } catch (error: any) {
            throw error;
        }
    };

    if (!user) {
        return null;
    }

    const roleNames: Record<string, string> = {
        individual: 'Individual Donor',
        restaurant: 'Restaurant',
        ngo: 'NGO',
        shelter: 'Animal Shelter',
        fertilizer: 'Waste Management'
    };

    return (
        <div className="space-y-6 pb-4">
            <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory">Profile & Settings</h2>

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-forest-900 to-forest-800 dark:from-forest-800 dark:to-forest-700 p-6 rounded-2xl text-ivory">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-forest-900" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{user.name || user.organization}</h3>
                        <p className="text-forest-300 text-sm">{roleNames[user.role]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-forest-300">
                    <Mail className="w-4 h-4" />
                    {user.email}
                </div>
                <div className="mt-4 p-3 bg-mint/20 rounded-xl">
                    <p className="text-sm text-mint-200">EcoPoints</p>
                    <p className="text-2xl font-bold text-mint">{user.ecoPoints || 0}</p>
                </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                <h3 className="font-bold text-forest-900 dark:text-ivory p-4 border-b border-forest-100 dark:border-forest-700">Account</h3>
                <button
                    onClick={() => setShowEditProfile(true)}
                    className="w-full p-4 flex items-center justify-between hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-forest-600 dark:text-forest-300" />
                        <span className="text-forest-900 dark:text-ivory">Edit Profile</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-forest-400" />
                </button>
                <button
                    onClick={() => setShowPrivacySecurity(true)}
                    className="w-full p-4 flex items-center justify-between hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors border-t border-forest-100 dark:border-forest-700"
                >
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-forest-600 dark:text-forest-300" />
                        <span className="text-forest-900 dark:text-ivory">Privacy & Security</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-forest-400" />
                </button>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                <h3 className="font-bold text-forest-900 dark:text-ivory p-4 border-b border-forest-100 dark:border-forest-700">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </div>
                </h3>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-forest-900 dark:text-ivory">Email Notifications</span>
                        <button
                            onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-forest-900 dark:text-ivory">Push Notifications</span>
                        <button
                            onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-forest-900 dark:text-ivory">SMS Notifications</span>
                        <button
                            onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notifications.sms ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.sms ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                <h3 className="font-bold text-forest-900 dark:text-ivory p-4 border-b border-forest-100 dark:border-forest-700">
                    <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5" />
                        Appearance
                    </div>
                </h3>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-forest-900 dark:text-ivory">Dark Mode</span>
                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-forest-900' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                <button
                    onClick={() => navigate('/about')}
                    className="w-full p-4 flex items-center justify-between hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors"
                >
                    <span className="text-forest-900 dark:text-ivory">About EcoBite</span>
                    <ChevronRight className="w-5 h-5 text-forest-400" />
                </button>
                <button
                    onClick={() => navigate('/terms')}
                    className="w-full p-4 flex items-center justify-between hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors border-t border-forest-100 dark:border-forest-700"
                >
                    <span className="text-forest-900 dark:text-ivory">Terms & Privacy</span>
                    <ChevronRight className="w-5 h-5 text-forest-400" />
                </button>
                <button
                    onClick={() => navigate('/help')}
                    className="w-full p-4 flex items-center justify-between hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors border-t border-forest-100 dark:border-forest-700"
                >
                    <span className="text-forest-900 dark:text-ivory">Help & Support</span>
                    <ChevronRight className="w-5 h-5 text-forest-400" />
                </button>
            </div>

            {/* Logout Button */}
            <button
                onClick={logout}
                className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
            >
                <LogOut className="w-5 h-5" />
                Sign Out
            </button>

            {/* Version */}
            <p className="text-center text-sm text-forest-500 dark:text-forest-400">
                EcoBite v1.0.0
            </p>

            {/* Modals */}
            <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                user={user}
                onSave={handleSaveProfile}
            />

            <PrivacySecurityModal
                isOpen={showPrivacySecurity}
                onClose={() => setShowPrivacySecurity(false)}
                onChangePassword={handleChangePassword}
            />
        </div>
    );
}
