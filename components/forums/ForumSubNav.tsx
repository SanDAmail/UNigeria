import React from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { TownHallSubTab } from '../../types';
import { NIGERIAN_STATES, LGAS } from '../../constants';

const TownHallSubNav: React.FC = () => {
    const { townHallSubTab, townHallFilters, userProfile } = useAppState();
    const dispatch = useAppDispatch();

    const tabs = [
        { label: "Hot Reports", tab: TownHallSubTab.HOT_REPORTS },
        { label: "Categories", tab: TownHallSubTab.CATEGORIES },
        { label: "My Reports", tab: TownHallSubTab.MY_REPORTS },
        { label: "Candidates", tab: TownHallSubTab.CANDIDATES },
    ];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        dispatch({ type: 'SET_TOWNHALL_FILTERS', payload: { ...townHallFilters, [name]: value } });
    };

    const handleSetToMyLGA = () => {
        if(userProfile.state && userProfile.lga) {
            dispatch({ type: 'SET_TOWNHALL_FILTERS', payload: { state: userProfile.state, lga: userProfile.lga } });
        } else {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Please set your location in Settings first.', type: 'error' }});
        }
    };

    return (
        <div>
            <div className="flex items-center bg-app-light dark:bg-dark-app-light rounded-lg p-1">
                {tabs.map(item => (
                    <button
                        key={item.tab}
                        onClick={() => dispatch({ type: 'SET_TOWNHALL_SUB_TAB', payload: item.tab })}
                        className={`flex-1 text-center text-xs sm:text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
                            townHallSubTab === item.tab 
                            ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' 
                            : 'text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            {(townHallSubTab === TownHallSubTab.HOT_REPORTS || townHallSubTab === TownHallSubTab.CANDIDATES) && (
                 <div className="mt-2 grid grid-cols-2 gap-2">
                    <select
                        name="state"
                        value={townHallFilters.state}
                        onChange={handleFilterChange}
                        className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-green"
                    >
                        <option value="">All States</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select
                        name="lga"
                        value={townHallFilters.lga}
                        onChange={handleFilterChange}
                        disabled={!townHallFilters.state}
                        className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                    >
                        <option value="">All LGAs</option>
                        {townHallFilters.state && LGAS[townHallFilters.state] && LGAS[townHallFilters.state].map(lga => (
                            <option key={lga} value={lga}>{lga}</option>
                        ))}
                    </select>
                 </div>
            )}
        </div>
    );
};

export default TownHallSubNav;
