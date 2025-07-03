import React, { useState } from 'react';
import { ManifestoItem } from '../../types';
import { Icons } from '../../constants';
import MarkdownRenderer from '../chat/MarkdownRenderer';

interface ManifestoSectionProps {
  manifesto: ManifestoItem[];
}

const ManifestoItemDisplay: React.FC<{ item: ManifestoItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-ui-border dark:border-dark-ui-border last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-md font-semibold text-primary dark:text-dark-text-primary">{item.topic}</h3>
        {isOpen ? <Icons.ChevronUp className="w-5 h-5 text-secondary" /> : <Icons.ChevronDown className="w-5 h-5 text-secondary" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in-down">
          <MarkdownRenderer content={item.stance} />
        </div>
      )}
    </div>
  );
};


const ManifestoSection: React.FC<ManifestoSectionProps> = ({ manifesto }) => {
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const handleToggle = (topic: string) => {
    setOpenTopic(prev => (prev === topic ? null : topic));
  };
    
  if (!manifesto || manifesto.length === 0) {
      return (
        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg text-center text-secondary dark:text-dark-text-secondary">
          <p>This candidate has not published their manifesto yet.</p>
        </div>
      )
  }

  return (
    <div className="bg-app-light dark:bg-dark-app-light rounded-lg">
      <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center p-4">
        <Icons.DocumentText className="w-6 h-6 mr-2 flex-shrink-0" />
        <span>Policy Stances</span>
      </h2>
      <div className="border-t border-ui-border dark:border-dark-ui-border">
          {manifesto.map((item, index) => (
             <ManifestoItemDisplay 
                key={index} 
                item={item} 
                isOpen={openTopic === item.topic}
                onClick={() => handleToggle(item.topic)}
             />
          ))}
      </div>
    </div>
  );
};

export default ManifestoSection;
