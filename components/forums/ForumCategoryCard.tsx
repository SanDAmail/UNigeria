import React from 'react';
import { TownHallCategory } from '../../types';
import { TownHallCategoryIcons } from '../../constants';

interface TownHallCategoryCardProps {
  category: TownHallCategory;
  onClick: () => void;
}

const TownHallCategoryCard: React.FC<TownHallCategoryCardProps> = ({ category, onClick }) => {
  const IconComponent = TownHallCategoryIcons[category.iconName] || (() => null);

  return (
    <div 
        onClick={onClick}
        className="m-3 bg-white dark:bg-dark-app-light border border-ui-border dark:border-dark-ui-border rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="p-4 flex flex-col items-center text-center">
        <IconComponent className="w-12 h-12 text-primary-green" />
        <h2 className="text-lg font-bold mt-2 text-primary dark:text-dark-text-primary">{category.name}</h2>
        <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1">{category.description}</p>
      </div>
      <div className="border-t border-ui-border dark:border-dark-ui-border px-4 py-2 flex justify-around text-sm text-secondary dark:text-dark-text-secondary">
        <span>Reports: <span className="font-semibold text-primary dark:text-dark-text-primary">{category.reports || 0}</span></span>
        <span>Posts: <span className="font-semibold text-primary dark:text-dark-text-primary">{category.posts || 0}</span></span>
      </div>
    </div>
  );
};

export default TownHallCategoryCard;