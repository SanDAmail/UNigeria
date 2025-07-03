import React from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { UnigerianSubTab } from '../../types';
import { NIGERIAN_LOCATIONS } from '../../data/locations';
import { Icons } from '../../constants';

interface UnigerianSubNavProps {
    onStartCreateAnnouncement: () => void;
}

const UnigerianSubNav: React.FC<UnigerianSubNavProps> = ({ onStartCreateAnnouncement }) => {
    const { unigerianSubTab, unigerianFilters, userProfile, isAuthenticated } = useAppState();
    const dispatch = useAppDispatch();

    const NIGERIAN_STATES = Object.keys(NIGERIAN_LOCATIONS).sort();

    const tabs = [
        { label: "Representatives", tab: UnigerianSubTab.REPS },
        { label: "Announcements", tab: UnigerianSubTab.ANNOUNCEMENTS },
    ];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'state') {
             dispatch({ type: 'SET_UNIGERIAN_FILTERS', payload: { ...unigerianFilters, state: value, lga: '' } });
        } else {
            dispatch({ type: 'SET_UNIGERIAN_FILTERS', payload: { ...unigerianFilters, [name]: value } });
        }
    };

    return (
        <div>
            <div className="flex items-center bg-app-light dark:bg-dark-app-light rounded-lg p-1">
                {tabs.map(item => (
                    <button
                        key={item.tab}
                        onClick={() => dispatch({ type: 'SET_UNIGERIAN_SUB_TAB', payload: item.tab })}
                        className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
                            unigerianSubTab === item.tab 
                            ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' 
                            : 'text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            
            <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        name="state"
                        value={unigerianFilters.state}
                        onChange={handleFilterChange}
                        className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-green"
                    >
                        <option value="">All States</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        name="lga"
                        value={unigerianFilters.lga}
                        onChange={handleFilterChange}
                        disabled={!unigerianFilters.state}
                        className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                    >
                        <option value="">All LGAs</option>
                        {unigerianFilters.state && NIGERIAN_LOCATIONS[unigerianFilters.state] && Object.keys(NIGERIAN_LOCATIONS[unigerianFilters.state]).map(lga => (
                            <option key={lga} value={lga}>{lga}</option>
                        ))}
                    </select>
                </div>
                 {isAuthenticated && userProfile.is_representative && (
                    <button 
                        onClick={onStartCreateAnnouncement}
                        className="w-full text-sm flex items-center justify-center gap-2 bg-primary-green text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 transition-all mt-2"
                    >
                        <Icons.Plus className="w-5 h-5"/>
                        Create Announcement
                    </button>
                )}
            </div>
        </div>
    );
};

export default UnigerianSubNav;