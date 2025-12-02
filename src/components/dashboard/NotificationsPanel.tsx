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

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-forest-100 dark:hover:bg-forest-700 transition-colors"
            >
                <Bell className="w-6 h-6 text-forest-700 dark:text-ivory" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-[85vw] sm:w-96 max-w-[400px] bg-white dark:bg-forest-800 rounded-2xl shadow-2xl border border-forest-100 dark:border-forest-700 z-50 overflow-hidden origin-top-right"
                        >
                            <div className="p-4 border-b border-forest-100 dark:border-forest-700 flex items-center justify-between bg-forest-50 dark:bg-forest-900/50">
                                <h3 className="font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 text-xs rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs font-medium text-forest-600 hover:text-forest-800 dark:text-forest-300 dark:hover:text-mint transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center justify-center text-forest-400 dark:text-forest-500">
                                        <div className="w-16 h-16 bg-forest-50 dark:bg-forest-900/50 rounded-full flex items-center justify-center mb-4">
                                            <Bell className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium">No notifications yet</p>
                                        <p className="text-xs mt-1">We'll let you know when something happens!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-forest-50 dark:divide-forest-700">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-forest-50 dark:hover:bg-forest-700/50 transition-colors relative group ${!notification.read ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                            notification.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                notification.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`text-sm font-semibold truncate pr-6 ${!notification.read ? 'text-forest-900 dark:text-ivory' : 'text-forest-700 dark:text-forest-300'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[10px] text-forest-400 whitespace-nowrap ml-2">
                                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-forest-600 dark:text-forest-400 leading-relaxed line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="absolute top-4 right-4 text-forest-400 hover:text-forest-600 p-1 rounded-full hover:bg-forest-100 dark:hover:bg-forest-700 opacity-0 group-hover:opacity-100 transition-all"
                                                            title="Mark as read"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
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
