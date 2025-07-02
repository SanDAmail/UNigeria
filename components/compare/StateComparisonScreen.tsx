

import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { ALL_PROFILES, Icons } from '../../constants';
import { Profile, PersonaType } from '../../types';
import { parseNumericValue } from '../../utils/parsing';
import ComparisonBarChart from './ComparisonBarChart';

const ComparisonRow: React.FC<{
    label: string;
    value1: string | undefined;
    value2: string | undefined;
    icon: React.ComponentType<{ className?: string }>;
}> = ({ label, value1, value2, icon: IconComponent }) => (
    <div className="grid grid-cols-3 items-center py-3 border-b border-ui-border dark:border-dark-ui-border last:border-b-0">
        <div className="col-span-1 text-center font-semibold text-primary dark:text-dark-text-primary break-words">{value1 || 'N/A'}</div>
        <div className="col-span-1 text-center font-bold text-primary-green flex items-center justify-center space-x-2">
            <IconComponent className="w-5 h-5 text-secondary dark:text-dark-text-secondary" />
            <span>{label}</span>
        </div>
        <div className="col-span-1 text-center font-semibold text-primary dark:text-dark-text-primary break-words">{value2 || 'N/A'}</div>
    </div>
);

const StateComparisonScreen: React.FC = () => {
    const { stateComparisonIds } = useAppState();
    const dispatch = useAppDispatch();
    
    if (!stateComparisonIds.state1 || !stateComparisonIds.state2) {
        return null;
    }

    const handleBack = () => {
        dispatch({ type: 'CLEAR_STATE_COMPARISON' });
    };

    const state1 = ALL_PROFILES.find(p => p.id === stateComparisonIds.state1 && p.personaType === PersonaType.STATE) as Profile | undefined;
    const state2 = ALL_PROFILES.find(p => p.id === stateComparisonIds.state2 && p.personaType === PersonaType.STATE) as Profile | undefined;
    
    if (!state1 || !state2) {
        return (
             <div className="w-full h-full flex flex-col items-center justify-center bg-adire-pattern p-8 text-center">
                <p className="text-secondary dark:text-dark-text-secondary">Could not load state data for comparison.</p>
             </div>
        )
    }

    const numericalComparisons = [
        { label: "Population", value1: state1.population, value2: state2.population, icon: Icons.UserGroup },
        { label: "GDP", value1: state1.gdp, value2: state2.gdp, icon: Icons.Scale },
        { label: "Land Area", value1: state1.landArea, value2: state2.landArea, icon: Icons.Map },
        { label: "Literacy Rate", value1: state1.literacyRate, value2: state2.literacyRate, icon: Icons.AcademicCap },
        { label: "# of LGAs", value1: state1.lgas?.toString(), value2: state2.lgas?.toString(), icon: Icons.Flag },
    ];

    const textualComparisons = [
        { label: "Capital", value1: state1.capital, value2: state2.capital, icon: Icons.BuildingOffice },
        { label: "Current Governor", value1: state1.governor, value2: state2.governor, icon: Icons.User },
        { label: "Date Created", value1: state1.dateCreated, value2: state2.dateCreated, icon: Icons.CalendarDays },
    ];

    return (
        <div className="w-full h-full bg-white dark:bg-dark-primary flex flex-col">
            <header className="p-4 border-b border-ui-border dark:border-dark-ui-border flex-shrink-0 flex items-center justify-center relative">
                <button onClick={handleBack} className="absolute left-4 p-1 text-secondary dark:text-dark-text-secondary hover:text-primary-green transition-colors">
                    <Icons.ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-center">State-by-State Comparison</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-3 items-center mb-6">
                    {/* State 1 Header */}
                    <div className="col-span-1 text-center">
                        <img src={state1.avatar} alt={state1.name} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-primary-green"/>
                        <h2 className="text-lg font-bold text-primary dark:text-dark-text-primary break-words">{state1.name}</h2>
                        <p className="text-xs text-secondary dark:text-dark-text-secondary italic">"{state1.slogan}"</p>
                    </div>
                     {/* "VS" Header */}
                    <div className="col-span-1 text-center">
                        <p className="text-4xl font-extrabold text-gray-300 dark:text-gray-700">VS</p>
                    </div>
                    {/* State 2 Header */}
                    <div className="col-span-1 text-center">
                        <img src={state2.avatar} alt={state2.name} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-indigo-500"/>
                        <h2 className="text-lg font-bold text-primary dark:text-dark-text-primary break-words">{state2.name}</h2>
                        <p className="text-xs text-secondary dark:text-dark-text-secondary italic">"{state2.slogan}"</p>
                    </div>
                </div>

                <div className="bg-app-light dark:bg-dark-app-light rounded-lg p-4 text-sm">
                    {numericalComparisons.map(comp => {
                        const parsed1 = parseNumericValue(comp.value1);
                        const parsed2 = parseNumericValue(comp.value2);
                        if (parsed1 !== null && parsed2 !== null) {
                            return (
                                <ComparisonBarChart
                                    key={comp.label}
                                    label={comp.label}
                                    value1={comp.value1}
                                    value2={comp.value2}
                                    parsedValue1={parsed1}
                                    parsedValue2={parsed2}
                                    icon={comp.icon}
                                />
                            );
                        }
                        // Fallback to text row if parsing fails
                        return <ComparisonRow key={comp.label} {...comp} />;
                    })}
                     {textualComparisons.map(comp => (
                        <ComparisonRow key={comp.label} {...comp} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StateComparisonScreen;