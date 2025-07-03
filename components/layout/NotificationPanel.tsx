import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Notification } from '../../types';
import { markNotificationsAsRead } from '../../services/dbService';
import { Icons } from '../../constants';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const { notifications, userProfile } = useAppState();
    const dispatch = useAppDispatch();

    const handleNotificationClick = async (notification: Notification) => {
        // Basic navigation for now, can be replaced with react-router later
        window.location.hash = notification.link;
        
        if (!notification.is_read) {
            await markNotificationsAsRead(userProfile.id!, [notification.id]);
            dispatch({ type: 'DECREMENT_UNREAD_COUNT', payload: 1 });
            // Optimistically update the UI
            const updatedNotifications = notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n);
            dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
        }
        onClose();
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        await markNotificationsAsRead(userProfile.id!, unreadIds);
        dispatch({ type: 'SET_UNREAD_NOTIFICATION_COUNT', payload: 0 });
        const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
        dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
      }

    return (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-secondary rounded-lg shadow-2xl border border-ui-border dark:border-dark-ui-border z-30 animate-fade-in-down">
            <div className="flex justify-between items-center p-4 border-b border-ui-border dark:border-dark-ui-border">
                <h3 className="font-bold text-lg text-primary dark:text-dark-text-primary">Notifications</h3>
                <button 
                    onClick={handleMarkAllAsRead} 
                    className="text-xs font-semibold text-primary-green hover:underline"
                    disabled={notifications.every(n => n.is_read)}
                >
                    Mark all as read
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-ui-border dark:border-dark-ui-border last:border-b-0 cursor-pointer hover:bg-app-light dark:hover:bg-dark-app-light flex items-start gap-3 transition-colors ${!notification.is_read ? 'bg-primary-green/5 dark:bg-primary-green/10' : ''}`}
                        >
                            <div className="flex-shrink-0 relative">
                                <img src={notification.author_avatar || `https://picsum.photos/seed/${notification.type}/40/40`} alt="author" className="w-10 h-10 rounded-full" />
                                {!notification.is_read && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary-green ring-2 ring-white dark:ring-dark-secondary" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-primary dark:text-dark-text-primary">{notification.title}</p>
                                <p className="text-sm text-secondary dark:text-dark-text-secondary">{notification.body}</p>
                                <p className="text-xs text-secondary dark:text-dark-text-secondary mt-1">{formatTimeAgo(notification.created_at)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-secondary dark:text-dark-text-secondary">
                        <Icons.Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
                        <p className="mt-2 font-semibold">No notifications yet</p>
                        <p className="text-sm">We'll let you know when there's new activity.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;