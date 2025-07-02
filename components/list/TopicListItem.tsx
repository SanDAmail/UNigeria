import React from 'react';
import { Report } from '../../types';
import { Icons } from '../../constants';

interface ReportListItemProps {
  report: Report;
  onClick: () => void;
  isAuthor?: boolean;
  onDelete?: () => void;
  showCategory?: boolean;
  categoryName?: string;
}

const ReportListItem: React.FC<ReportListItemProps> = ({ report, onClick, isAuthor, onDelete, showCategory, categoryName }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };
  
  return (
    <div
      onClick={onClick}
      className="flex items-start space-x-4 p-4 border-b border-ui-border dark:border-dark-ui-border cursor-pointer hover:bg-app-light dark:hover:bg-dark-app-light transition-colors group"
    >
      <img src={report.author?.avatar} alt={report.author?.name} className="w-10 h-10 rounded-full flex-shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <h2 className="text-md font-semibold text-primary dark:text-dark-text-primary truncate group-hover:text-primary-green">{report.title}</h2>
        <div className="text-sm text-secondary dark:text-dark-text-secondary flex items-center flex-wrap">
          <span>
            By <span className="font-medium text-primary-green">{report.author?.name || '...'}</span>
          </span>
          {showCategory && categoryName && (
            <>
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              <span>
                In <span className="font-medium text-primary dark:text-dark-text-primary">{categoryName}</span>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 self-center">
        <div className="text-right text-sm text-secondary dark:text-dark-text-secondary hidden sm:block">
          <p>{report.reply_count} {report.reply_count === 1 ? 'reply' : 'replies'}</p>
          <p className="truncate">Last: {report.lastReply}</p>
        </div>
        {isAuthor && onDelete && (
            <button 
                onClick={handleDelete} 
                className="p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                aria-label="Delete report"
            >
                <Icons.Trash className="w-5 h-5" />
            </button>
        )}
      </div>
    </div>
  );
};

export default ReportListItem;