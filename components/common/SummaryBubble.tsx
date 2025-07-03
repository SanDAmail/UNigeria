import React from 'react';
import { Icons } from '../../constants';
import MarkdownRenderer from '../chat/MarkdownRenderer';

interface SummaryBubbleProps {
    summaryText: string;
    onDismiss: () => void;
}

const SummaryBubble: React.FC<SummaryBubbleProps> = ({ summaryText, onDismiss }) => {
    return (
        <div className="bg-primary-green/10 dark:bg-primary-green/20 p-4 rounded-lg border-l-4 border-primary-green mb-4 animate-fade-in-down relative">
            <div className="flex items-start gap-3">
                <Icons.Sparkles className="w-6 h-6 text-primary-green flex-shrink-0 mt-1" />
                <div className="flex-1">
                    <h3 className="font-bold text-primary-green mb-1">AI Summary</h3>
                    <div className="text-sm text-primary dark:text-dark-text-primary">
                        <MarkdownRenderer content={summaryText} />
                    </div>
                </div>
            </div>
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1 rounded-full text-primary-green/50 hover:bg-primary-green/20 hover:text-primary-green/80"
                aria-label="Dismiss summary"
            >
                <Icons.XMark className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SummaryBubble;
