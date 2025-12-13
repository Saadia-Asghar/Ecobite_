import { useState } from 'react';
import { User, Bell, Shield, Globe, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import BankAccountSettings from '../settings/BankAccountSettings';

export default function SettingsView() {
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        organization: 'Green Initiative',
        licenseId: 'NGO-12345'
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-forest-900">Settings</h2>

            {/* Profile Settings */}
            <div className="bg-white rounded-2xl p-6 border border-forest-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-forest-100 rounded-xl">
                        <User className="w-6 h-6 text-forest-700" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-900">Profile Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-forest-700 mb-2">Organization</label>
                        <input
                            type="text"
                            value={profile.organization}
                            onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-forest-50 border-transparent focus:bg-white focus:ring-2 focus:ring-forest-500 outline-none"
                        />
                    </div>
                </div>
                <button className="mt-6 px-6 py-3 bg-forest-900 text-ivory rounded-xl font-bold hover:bg-forest-800 transition-colors">
                    Save Changes
                </button>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-6 border border-forest-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Bell className="w-6 h-6 text-purple-700" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-900">Notifications</h3>
                </div>
                <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-xl hover:bg-forest-50 transition-colors">
                            <div>
                                <p className="font-medium text-forest-900 capitalize">{key} Notifications</p>
                                <p className="text-sm text-forest-600">Receive updates via {key}</p>
                            </div>
                            <button
                                onClick={() => setNotifications({ ...notifications, [key]: !value })}
                                className={`relative w-14 h-8 rounded-full transition-colors ${value ? 'bg-forest-700' : 'bg-gray-300'
                                    }`}
                            >
                                <motion.div
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                                    animate={{ left: value ? '28px' : '4px' }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-forest-800 rounded-2xl p-6 border border-forest-100 dark:border-forest-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Globe className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-900 dark:text-ivory">Appearance</h3>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-forest-50 dark:hover:bg-forest-700 transition-colors">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Moon className="w-5 h-5 text-forest-700 dark:text-forest-300" /> : <Sun className="w-5 h-5 text-forest-700 dark:text-forest-300" />}
                        <div>
                            <p className="font-medium text-forest-900 dark:text-ivory">Dark Mode</p>
                            <p className="text-sm text-forest-600 dark:text-forest-400">Toggle dark theme</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-forest-700' : 'bg-gray-300'
                            }`}
                    >
                        <motion.div
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                            animate={{ left: theme === 'dark' ? '28px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
            </div>

            {/* Bank Account Settings */}
            <BankAccountSettings />

            {/* Privacy & Security */}
            <div className="bg-white rounded-2xl p-6 border border-forest-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 rounded-xl">
                        <Shield className="w-6 h-6 text-red-700" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-900">Privacy & Security</h3>
                </div>
                <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-forest-50 transition-colors text-forest-700 font-medium">
                        Change Password
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-forest-50 transition-colors text-forest-700 font-medium">
                        Two-Factor Authentication
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-forest-50 transition-colors text-forest-700 font-medium">
                        Privacy Policy
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-700 font-medium">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
