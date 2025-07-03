
import React from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { TownHallSubTab } from '../../types';
import { NIGERIAN_LOCATIONS } from '../../data/locations';
import { Icons } from '../../constants';

const TownHallSubNav: React.FC = () => {
    const { townHallSubTab, townHallFilters, userProfile, isAuthenticated } = useAppState();
    const dispatch = useAppDispatch();

    const NIGERIAN_STATES = Object.keys(NIGERIAN_LOCATIONS).sort();

    const tabs = [
        { label: "Hot Reports", tab: TownHallSubTab.HOT_REPORTS, requiresFilter: false },
        { label: "Categories", tab: TownHallSubTab.CATEGORIES, requiresFilter: false },
        { label: "My Reports", tab: TownHallSubTab.MY_REPORTS, requiresFilter: false },
        { label: "Candidates", tab: TownHallSubTab.CANDIDATES, requiresFilter: false },
        { label: "LGA Insights", tab: TownHallSubTab.LGA_INSIGHTS, requiresFilter: true },
    ];

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'state') {
             dispatch({ type: 'SET_TOWNHALL_FILTERS', payload: { ...townHallFilters, state: value, lga: '' } });
        } else {
            dispatch({ type: 'SET_TOWNHALL_FILTERS', payload: { ...townHallFilters, [name]: value } });
        }
    };

    const handleSetToMyLGA = () => {
        if(userProfile.state && userProfile.lga) {
            dispatch({ type: 'SET_TOWNHALL_FILTERS', payload: { state: userProfile.state, lga: userProfile.lga } });
        } else {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Please set your location in Settings first.', type: 'error' }});
            dispatch({ type: 'SET_ACTIVE_SYSTEM_VIEW', payload: 'settings' });
        }
    };

    const handleFileNewReportClick = () => {
        if (!userProfile.state || !userProfile.lga || !userProfile.ward) {
            dispatch({type: 'SHOW_TOAST', payload: { message: "Please complete your location in Settings to file a report.", type: 'error'}});
            dispatch({type: 'SET_ACTIVE_SYSTEM_VIEW', payload: 'settings'});
            return;
        }
        dispatch({ type: 'SHOW_CREATE_REPORT_MODAL' });
    }

    const showLocationFilters = [
        TownHallSubTab.HOT_REPORTS, 
        TownHallSubTab.CANDIDATES, 
        TownHallSubTab.LGA_INSIGHTS
    ].includes(townHallSubTab);

    return (
        <div>
            <div className="flex items-center bg-app-light dark:bg-dark-app-light rounded-lg p-1">
                {tabs.map(item => {
                    const isDisabled = item.requiresFilter && (!townHallFilters.state || !townHallFilters.lga);
                    return (
                        <button
                            key={item.tab}
                            onClick={() => !isDisabled && dispatch({ type: 'SET_TOWNHALL_SUB_TAB', payload: item.tab })}
                            disabled={isDisabled}
                            className={`flex-1 text-center text-xs sm:text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
                                townHallSubTab === item.tab 
                                ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' 
                                : `text-secondary dark:text-dark-text-secondary ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary dark:hover:text-dark-text-primary'}`
                            }`}
                            title={isDisabled ? "Select a State and LGA to view insights" : ""}
                        >
                            {item.label}
                        </button>
                    )
                })}
            </div>
            {showLocationFilters && (
                 <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
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
                            {townHallFilters.state && NIGERIAN_LOCATIONS[townHallFilters.state] && Object.keys(NIGERIAN_LOCATIONS[townHallFilters.state]).map(lga => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                    </div>
                    {isAuthenticated && userProfile.state && userProfile.lga && (
                        <button onClick={handleSetToMyLGA} className="w-full text-xs text-primary-green font-semibold hover:underline">
                            Filter to my LGA ({userProfile.lga})
                        </button>
                    )}
                 </div>
            )}
            {isAuthenticated && (
                <button 
                    onClick={handleFileNewReportClick}
                    className="w-full text-sm flex items-center justify-center gap-2 bg-primary-green text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 transition-all mt-3"
                >
                    <Icons.Plus className="w-5 h-5"/>
                    File a New Report
                </button>
            )}
        </div>
    );
};

export default TownHallSubNav;
