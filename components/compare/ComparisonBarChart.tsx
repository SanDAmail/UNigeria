

import React from 'react';

interface ComparisonBarChartProps {
    label: string;
    value1: string | undefined;
    value2: string | undefined;
    parsedValue1: number;
    parsedValue2: number;
    icon: React.ComponentType<{ className?: string }>;
}

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
    label,
    value1,
    value2,
    parsedValue1,
    parsedValue2,
    icon: IconComponent
}) => {
    const maxValue = Math.max(parsedValue1, parsedValue2, 1); // Avoid division by zero
    const width1 = (parsedValue1 / maxValue) * 100;
    const width2 = (parsedValue2 / maxValue) * 100;

    return (
        <div className="py-4 border-b border-ui-border dark:border-dark-ui-border last:border-b-0">
            <div className="text-center text-sm font-bold text-secondary dark:text-dark-text-secondary flex items-center justify-center space-x-1.5 mb-2">
                <IconComponent className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
                {/* State 1 Bar */}
                <div className="text-right">
                    <span className="text-sm font-semibold text-primary dark:text-dark-text-primary pr-2">{value1 || 'N/A'}</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-primary-green h-2.5 rounded-full" style={{ width: `${width1}%`, float: 'right' }}></div>
                    </div>
                </div>

                {/* State 2 Bar */}
                <div className="text-left">
                     <span className="text-sm font-semibold text-primary dark:text-dark-text-primary pl-2">{value2 || 'N/A'}</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${width2}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonBarChart;