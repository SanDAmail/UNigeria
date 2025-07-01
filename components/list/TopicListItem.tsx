
import React from 'react';
import { Topic } from '../../types';
import { Icons } from '../../constants';

interface TopicListItemProps {
  topic: Topic;
  onClick: () => void;
  isAuthor?: boolean;
  onDelete?: () => void;
  showCategory?: boolean;
  categoryName?: string;
}

const TopicListItem: React.FC<TopicListItemProps> = ({ topic, onClick, isAuthor, onDelete, showCategory, categoryName }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };
  
  return (
    <div
      onClick={onClick}
      className="flex items-start space-x-4 p-4 border-b border-ui-border cursor-pointer hover:bg-app-light transition-colors group"
    >
      <img src={topic.author.avatar} alt={topic.author.name} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <h2 className="text-md font-semibold text-primary truncate group-hover:text-primary-green">{topic.title}</h2>
        <div className="text-sm text-secondary flex items-center flex-wrap">
          <span>
            By <span className="font-medium text-primary-green">{topic.author.name}</span>
          </span>
          {showCategory && categoryName && (
            <>
              <span className="mx-2 text-gray-300">|</span>
              <span>
                In <span className="font-medium text-primary">{categoryName}</span>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 self-center">
        <div className="text-right text-sm text-secondary hidden sm:block">
          <p>{topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}</p>
          <p className="truncate">Last: {topic.lastReply}</p>
        </div>
        {isAuthor && onDelete && (
            <button 
                onClick={handleDelete} 
                className="p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                aria-label="Delete topic"
            >
                <Icons.Trash className="w-5 h-5" />
            </button>
        )}
      </div>
    </div>
  );
};

export default TopicListItem;
