import React from 'react';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-ui-border dark:border-dark-ui-border ${className}`}>
      <header className="p-4 border-b border-ui-border dark:border-dark-ui-border flex items-center space-x-3">
        {icon}
        <h3 className="font-semibold text-primary dark:text-dark-text-primary">{title}</h3>
      </header>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
