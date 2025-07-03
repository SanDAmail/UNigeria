import React from 'react';
import { UserProfile } from '../../types';
import { Icons } from '../../constants';
import { useAppDispatch } from '../../context/AppContext';

interface LeaderboardListItemProps {
  user: UserProfile;
  rank: number;
}

const LeaderboardListItem: React.FC<LeaderboardListItemProps> = ({ user, rank }) => {
    const dispatch = useAppDispatch();

    const rankColors: { [key: number]: string } = {
        1: 'bg-yellow-400 text-yellow-900',
        2: 'bg-gray-300 text-gray-800',
        3: 'bg-orange-400 text-orange-900',
    };
    
    const rankIcon: { [key: number]: React.ReactNode } = {
        1: <Icons.Award className="w-4 h-4 text-yellow-700" />,
        2: <Icons.Award className="w-4 h-4 text-gray-600" />,
        3: <Icons.Award className="w-4 h-4 text-orange-700" />,
    }

    const handleProfileClick = () => {
        dispatch({ type: 'SHOW_SIDEBAR_PROFILE', payload: user.id! });
    }

    return (
        <div 
            onClick={handleProfileClick}
            className="flex items-center space-x-4 p-3 border-b border-ui-border dark:border-dark-ui-border cursor-pointer hover:bg-app-light dark:hover:bg-dark-app-light transition-colors"
        >
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm ${rankColors[rank] || 'bg-gray-200 dark:bg-dark-app-light text-secondary dark:text-dark-text-secondary'}`}>
                {rankIcon[rank] || rank}
            </div>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary dark:text-dark-text-primary truncate">{user.name}</p>
                <p className="text-xs text-secondary dark:text-dark-text-secondary truncate">{user.lga}, {user.state}</p>
            </div>
            <div className="text-sm font-bold text-primary-green">
                {user.reputation_score || 0} pts
            </div>
        </div>
    );
};

export default LeaderboardListItem;