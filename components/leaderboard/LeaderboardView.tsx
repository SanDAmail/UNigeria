import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { NIGERIAN_LOCATIONS } from '../../data/locations';
import LeaderboardListItem from './LeaderboardListItem';

const LeaderboardView: React.FC = () => {
    const { leaderboardUsers, leaderboardFilters } = useAppState();
    const dispatch = useAppDispatch();
    
    const NIGERIAN_STATES = Object.keys(NIGERIAN_LOCATIONS).sort();

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'state') {
            dispatch({ type: 'SET_LEADERBOARD_FILTERS', payload: { ...leaderboardFilters, state: value, lga: '' } });
        } else {
            dispatch({ type: 'SET_LEADERBOARD_FILTERS', payload: { ...leaderboardFilters, [name]: value } });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-ui-border dark:border-dark-ui-border">
                <h3 className="font-semibold text-primary dark:text-dark-text-primary mb-2">Filter Leaderboard</h3>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        name="state"
                        value={leaderboardFilters.state}
                        onChange={handleFilterChange}
                        className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-green"
                    >
                        <option value="">All States</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        name="lga"
                        value={leaderboardFilters.lga}
                        onChange={handleFilterChange}
                        disabled={!leaderboardFilters.state}
                        className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-green disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                    >
                        <option value="">All LGAs</option>
                        {leaderboardFilters.state && NIGERIAN_LOCATIONS[leaderboardFilters.state] && Object.keys(NIGERIAN_LOCATIONS[leaderboardFilters.state]).map(lga => (
                            <option key={lga} value={lga}>{lga}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {leaderboardUsers.length > 0 ? (
                    leaderboardUsers.map((user, index) => (
                        <LeaderboardListItem key={user.id} user={user} rank={index + 1} />
                    ))
                ) : (
                    <div className="text-center text-secondary dark:text-dark-text-secondary p-8">
                        No users found for the selected location.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardView;