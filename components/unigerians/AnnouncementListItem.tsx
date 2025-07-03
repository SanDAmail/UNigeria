import React from 'react';
import { Announcement } from '../../types';
import MarkdownRenderer from '../chat/MarkdownRenderer';

interface AnnouncementListItemProps {
  announcement: Announcement;
}

const AnnouncementListItem: React.FC<AnnouncementListItemProps> = ({ announcement }) => {

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    return (
        <div className="p-4 border-b border-ui-border dark:border-dark-ui-border">
            <div className="flex items-center space-x-3 mb-3">
                <img src={announcement.author.avatar} alt={announcement.author.name} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-bold text-primary dark:text-dark-text-primary">{announcement.author.name}</p>
                    <p className="text-xs text-secondary dark:text-dark-text-secondary">
                        Representative for {announcement.lga}, {announcement.state}
                    </p>
                </div>
            </div>
            <h2 className="text-lg font-semibold text-primary dark:text-dark-text-primary mb-2">{announcement.title}</h2>
            <div className="text-sm text-secondary dark:text-dark-text-secondary">
                 <MarkdownRenderer content={announcement.content} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-right">
                {formatTimestamp(announcement.created_at)}
            </p>
        </div>
    );
};

export default AnnouncementListItem;