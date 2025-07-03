import React from 'react';
import { ReportStatus } from '../../types';
import { Icons } from '../../constants';

interface StatusBadgeProps {
  status: ReportStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: { [key in ReportStatus]: { bg: string, text: string, icon: React.ComponentType<{className?:string}> } } = {
    'New': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300', icon: Icons.Plus },
    'Under Review': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', icon: Icons.MagnifyingGlass },
    'Acknowledged': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-300', icon: Icons.ChatBubbleOvalLeftEllipsis },
    'Resolved': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', icon: Icons.CheckCircle },
  };

  const currentStyle = statusStyles[status] || statusStyles['New'];
  const IconComponent = currentStyle.icon;

  return (
    <div
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${currentStyle.bg} ${currentStyle.text}`}
      title={`Status: ${status}`}
    >
      <IconComponent className="w-3 h-3 mr-1" />
      {status}
    </div>
  );
};

export default StatusBadge;
