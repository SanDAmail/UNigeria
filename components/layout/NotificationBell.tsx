import React, { useState } from 'react';
import { Icons } from '../../constants';
import { useAppState } from '../../context/AppContext';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
    const { unreadNotificationCount } = useAppState();
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="p-2 rounded-full text-secondary hover:bg-app-light hover:text-primary transition-colors dark:text-dark-text-secondary dark:hover:bg-dark-app-light dark:hover:text-dark-text-primary relative"
                aria-label={`Notifications (${unreadNotificationCount} unread)`}
            >
                <Icons.Bell className="w-6 h-6" />
                {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-primary" />
                )}
            </button>

            {isPanelOpen && <NotificationPanel onClose={() => setIsPanelOpen(false)} />}
        </div>
    );
};

export default NotificationBell;