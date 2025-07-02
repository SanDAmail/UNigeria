import React from 'react';
import { Icons } from '../../constants';
import { useAppState, useAppDispatch } from '../../context/AppContext';

const ThemeToggleButton: React.FC = () => {
    const { theme } = useAppState();
    const dispatch = useAppDispatch();

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        dispatch({ type: 'SET_THEME', payload: newTheme });
    };
    
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-secondary hover:bg-app-light hover:text-primary transition-colors dark:text-dark-text-secondary dark:hover:bg-dark-app-light dark:hover:text-dark-text-primary"
            aria-label="Toggle dark mode"
        >
            {theme === 'light' ? <Icons.Moon className="w-6 h-6" /> : <Icons.Sun className="w-6 h-6" />}
        </button>
    );
};

const GlobalHeader: React.FC = () => {
    const { userProfile } = useAppState();
    const dispatch = useAppDispatch();
    
    const handleSettingsClick = () => {
        dispatch({ type: 'SET_ACTIVE_SYSTEM_VIEW', payload: 'settings' });
    }
    
    const handleGoHome = () => {
        dispatch({ type: 'GO_HOME' });
    };
    
    return (
        <header className="flex bg-white dark:bg-dark-primary border-b border-ui-border dark:border-dark-ui-border h-16 items-center px-4 lg:px-6 justify-between flex-shrink-0 z-20">
            <button onClick={handleGoHome} className="flex items-center space-x-2 lg:space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green rounded-lg p-1 -m-1">
                <Icons.FlyingFlagLogo className="w-8 h-8" />
                <h1 className="text-xl font-bold text-primary-green">UNigeria</h1>
            </button>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="flex items-center space-x-2">
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-9 h-9 rounded-full" />
                    <span className="hidden sm:block font-semibold text-sm text-primary dark:text-dark-text-primary">{userProfile.name}</span>
                </div>
                 <ThemeToggleButton />
                 <button 
                    onClick={handleSettingsClick}
                    className="p-2 rounded-full text-secondary hover:bg-app-light hover:text-primary transition-colors dark:text-dark-text-secondary dark:hover:bg-dark-app-light dark:hover:text-dark-text-primary"
                    aria-label="Profile and Settings"
                >
                    <Icons.Cog className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};

export default GlobalHeader;