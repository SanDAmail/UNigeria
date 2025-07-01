
import React from 'react';
import { ForumCategory } from '../../types';

interface ForumCategoryCardProps {
  category: ForumCategory;
  onClick: () => void;
}

const ForumCategoryCard: React.FC<ForumCategoryCardProps> = ({ category, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className="m-3 bg-white border border-ui-border rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="p-4 flex flex-col items-center text-center">
        {category.icon}
        <h2 className="text-lg font-bold mt-2 text-primary">{category.name}</h2>
        <p className="text-sm text-secondary mt-1">{category.description}</p>
      </div>
      <div className="border-t border-ui-border px-4 py-2 flex justify-around text-sm text-secondary">
        <span>Topics: <span className="font-semibold text-primary">{category.topics}</span></span>
        <span>Posts: <span className="font-semibold text-primary">{category.posts}</span></span>
      </div>
    </div>
  );
};

export default ForumCategoryCard;
