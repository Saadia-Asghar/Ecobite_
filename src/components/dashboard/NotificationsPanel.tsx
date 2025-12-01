import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_NOTIFICATIONS, Notification } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsPanel() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // In a real app, fetch from API
        // For now, filter mock data by user ID (or show all if no user match found in mock)
        // We'll simulate fetching
        const userNotifs = MOCK_NOTIFICATIONS.filter(n => n.userId === user?.id || !user?.id);
        // If no specific notifs for this user in mock, just show some random ones for demo
        const displayNotifs = userNotifs.length > 0 ? userNotifs : MOCK_NOTIFICATIONS.slice(0, 3);

        setNotifications(displayNotifs);
        setUnreadCount(displayNotifs.filter(n => !n.read).length);
    }, [user]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-forest-100 dark:hover:bg-forest-700 transition-colors"
            >
                <Bell className="w-6 h-6 text-forest-700 dark:text-ivory" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-forest-800 rounded-2xl shadow-xl border border-forest-100 dark:border-forest-700 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-forest-100 dark:border-forest-700 flex items-center justify-between bg-forest-50 dark:bg-forest-900/50">
                                <h3 className="font-bold text-forest-900 dark:text-ivory">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-forest-500 hover:text-forest-700 dark:text-forest-400 dark:hover:text-forest-200"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-forest-500 dark:text-forest-400">
                                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No new notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-forest-50 dark:divide-forest-700">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-forest-50 dark:hover:bg-forest-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="mt-1 flex-shrink-0">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-forest-900 dark:text-ivory' : 'text-forest-700 dark:text-forest-300'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notification.id);
                                                                    }}
                                                                    className="text-forest-400 hover:text-forest-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-forest-600 dark:text-forest-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-forest-400 mt-2">
                                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
