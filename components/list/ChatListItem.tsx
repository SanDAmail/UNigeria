

import React from 'react';
import { ChatListItemData, PersonaType } from '../../types';

interface ChatListItemProps {
  data: ChatListItemData;
  isActive: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ data, isActive, onClick }) => {
  const { avatar, name, lastMessage, timestamp, unreadCount } = data;

  // Special card layout for Nigeria
  if (data.id === 'nigeria') {
    return (
      <div
        onClick={onClick}
        className={`p-4 border-b border-ui-border dark:border-dark-ui-border cursor-pointer transition-colors duration-150 ${
          isActive ? 'bg-primary-green/10' : 'hover:bg-app-light dark:hover:bg-dark-app-light'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <img src={avatar} alt={name} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
          <p className="font-bold text-lg text-primary dark:text-dark-text-primary mt-3">{name}</p>
<<<<<<< HEAD
          <p className="text-sm text-secondary dark:text-dark-text-secondary italic mt-1 truncate w-full max-w-xs">{`"${lastMessage}"`}</p>
=======
          <p className="text-sm text-secondary dark:text-dark-text-secondary italic mt-1 truncate w-full max-w-xs">{`"${lastMessage}"`}</p>
>>>>>>> master
        </div>
      </div>
    );
  }

  // Common layout for ALL other items, including other states.
  const isState = data.type === PersonaType.STATE;

  return (
    <div
      onClick={onClick}
      className={`flex p-3 items-start space-x-3 border-b border-ui-border dark:border-dark-ui-border cursor-pointer transition-colors duration-150 ${
        isActive ? 'bg-primary-green/10' : 'hover:bg-app-light dark:hover:bg-dark-app-light'
      }`}
    >
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-accent-gold/50 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-primary dark:text-dark-text-primary truncate">{name}</p>
        <p className="text-sm text-secondary dark:text-dark-text-secondary truncate">{isState ? `"${lastMessage}"` : lastMessage}</p>
      </div>
      <div className="flex flex-col items-end space-y-1 text-xs text-secondary dark:text-dark-text-secondary self-start">
        <span>{timestamp}</span>
        {unreadCount > 0 && (
          <span className="bg-primary-green text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;