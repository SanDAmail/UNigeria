import React, { useState, useMemo } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { ALL_PROFILES } from '../../constants';
import { PersonaType } from '../../types';
import { Icons } from '../../constants';

const StateComparisonSelector: React.FC = () => {
    const dispatch = useAppDispatch();
    const [state1, setState1] = useState('');
    const [state2, setState2] = useState('');
    const [error, setError] = useState('');

    const stateOptions = useMemo(() => {
        return ALL_PROFILES
            .filter(p => p.personaType === PersonaType.STATE && p.id !== 'nigeria')
            .sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const handleCompare = () => {
        if (!state1 || !state2) {
            setError('Please select two states to compare.');
            return;
        }
        if (state1 === state2) {
            setError('Please select two different states.');
            return;
        }
        setError('');
        dispatch({ type: 'SET_STATE_COMPARISON', payload: { state1Id: state1, state2Id: state2 } });
    };

    return (
        <div className="p-4 space-y-4 animate-fade-in-down">
            <h3 className="text-lg font-semibold text-primary dark:text-dark-text-primary">Compare State Metrics</h3>
            <p className="text-sm text-secondary dark:text-dark-text-secondary">Select two states to see a side-by-side comparison of key data points.</p>
            
            <div className="space-y-3">
                <div>
                    <label htmlFor="state1-select" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary">State 1</label>
                    <select
                        id="state1-select"
                        value={state1}
                        onChange={(e) => setState1(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-dark-secondary border-ui-border dark:border-dark-ui-border focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm rounded-md"
                    >
                        <option value="">Select a state...</option>
                        {stateOptions.map(state => (
                            <option key={state.id} value={state.id}>{state.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="state2-select" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary">State 2</label>
                    <select
                        id="state2-select"
                        value={state2}
                        onChange={(e) => setState2(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-dark-secondary border-ui-border dark:border-dark-ui-border focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm rounded-md"
                    >
                        <option value="">Select a state...</option>
                        {stateOptions.map(state => (
                            <option key={state.id} value={state.id}>{state.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                onClick={handleCompare}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-green hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400"
                disabled={!state1 || !state2}
            >
                <Icons.Scale className="w-5 h-5 mr-2" />
                Compare Now
            </button>
        </div>
    );
};

export default StateComparisonSelector;