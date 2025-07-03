import React, { useState } from 'react';
import { Icons } from '../../constants';

interface QuickOptionsProps {
    onSelect: (text: string) => void;
    options: string[];
}

const VISIBLE_OPTIONS_COUNT = 4;

const QuickOptions: React.FC<QuickOptionsProps> = ({ onSelect, options }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!options || options.length === 0) {
        return null;
    }

    const displayedOptions = isExpanded ? options : options.slice(0, VISIBLE_OPTIONS_COUNT);
    const hasMoreOptions = options.length > VISIBLE_OPTIONS_COUNT;

    return (
        <div className="flex flex-wrap gap-2 mb-3">
            {displayedOptions.map(option => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className="bg-app-light text-primary-green px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap hover:bg-primary-green/20 transition-colors animate-fade-in-down"
                >
                    {option}
                </button>
            ))}
            {hasMoreOptions && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-app-light text-secondary px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-300 transition-colors flex items-center"
                >
                    {isExpanded ? 'Show Less' : `+${options.length - VISIBLE_OPTIONS_COUNT} More`}
                    {isExpanded ? <Icons.ChevronUp className="w-4 h-4 ml-1" /> : <Icons.ChevronDown className="w-4 h-4 ml-1" />}
                </button>
            )}
        </div>
    );
};

export default QuickOptions;
