import React from 'react';
import { UserProfile } from '../../types';
import { Icons } from '../../constants';

interface CandidateListItemProps {
  candidate: UserProfile;
  onClick: () => void;
}

const CandidateListItem: React.FC<CandidateListItemProps> = ({ candidate, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-4 p-4 border-b border-ui-border dark:border-dark-ui-border cursor-pointer hover:bg-app-light dark:hover:bg-dark-app-light transition-colors group"
    >
      <img src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h2 className="text-md font-semibold text-primary dark:text-dark-text-primary truncate group-hover:text-primary-green">{candidate.name}</h2>
        <p className="text-sm text-secondary dark:text-dark-text-secondary truncate">{candidate.title}</p>
        <p className="text-xs text-secondary dark:text-dark-text-secondary">{candidate.lga}, {candidate.state}</p>
      </div>
       <div className="flex items-center space-x-2 text-sm text-primary-green font-semibold">
          <Icons.ShieldCheck className="w-5 h-5" />
          <span>{candidate.endorsement_count || 0}</span>
      </div>
    </div>
  );
};

export default CandidateListItem;
