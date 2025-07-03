import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppContext';
import { generateLgaAnalysis } from '../../services/geminiService';
import { Icons } from '../../constants';

interface Insights {
    overview: string;
    keyConcerns: string[];
}

const LGAInsightsView: React.FC = () => {
    const { reports, townHallFilters } = useAppState();
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!townHallFilters.state || !townHallFilters.lga) {
                // Should not happen if UI is correct, but defensive check
                setInsights(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            
            const relevantReports = reports.filter(r => 
                r.location?.state === townHallFilters.state && 
                r.location?.lga === townHallFilters.lga
            );

            if (relevantReports.length === 0) {
                setError(`No reports found for ${townHallFilters.lga}, ${townHallFilters.state} to analyze.`);
                setIsLoading(false);
                setInsights(null);
                return;
            }

            const reportTitles = relevantReports.map(r => r.title);

            try {
                const result = await generateLgaAnalysis(reportTitles);
                setInsights(result);
            } catch (err) {
                setError((err as Error).message || "An unknown error occurred while generating insights.");
                setInsights(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, [reports, townHallFilters.state, townHallFilters.lga]);

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <div className="shimmer h-8 w-3/4 rounded-lg"></div>
                <div className="shimmer h-20 w-full rounded-lg"></div>
                <div className="shimmer h-8 w-1/2 rounded-lg mt-4"></div>
                <div className="flex flex-wrap gap-2">
                    <div className="shimmer h-8 w-24 rounded-full"></div>
                    <div className="shimmer h-8 w-32 rounded-full"></div>
                    <div className="shimmer h-8 w-28 rounded-full"></div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="p-4 text-center text-red-600">
                <p>Error: {error}</p>
            </div>
        )
    }

    if (!insights) {
         return (
            <div className="p-4 text-center text-secondary">
                <p>Select a State and LGA with reports to see insights.</p>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6 animate-fade-in-down">
            <div className="text-center">
                 <h2 className="text-xl font-bold text-primary dark:text-dark-text-primary">
                    State of {townHallFilters.lga}
                </h2>
                <p className="text-sm text-secondary dark:text-dark-text-secondary">{townHallFilters.state} State</p>
            </div>
            
            <div className="p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
                 <h3 className="font-semibold text-primary-green mb-2 flex items-center gap-2">
                    <Icons.Sparkles className="w-5 h-5"/>
                    AI Overview
                 </h3>
                 <p className="text-sm text-primary dark:text-dark-text-primary leading-relaxed">{insights.overview}</p>
            </div>

            {insights.keyConcerns && insights.keyConcerns.length > 0 && (
                <div className="p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
                    <h3 className="font-semibold text-primary-green mb-3 flex items-center gap-2">
                        <Icons.ChartPie className="w-5 h-5"/>
                        Key Concern Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {insights.keyConcerns.map((concern, index) => (
                            <span key={index} className="px-3 py-1 bg-white dark:bg-dark-secondary text-sm text-secondary dark:text-dark-text-secondary rounded-full border border-ui-border dark:border-dark-ui-border">
                                {concern}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LGAInsightsView;
