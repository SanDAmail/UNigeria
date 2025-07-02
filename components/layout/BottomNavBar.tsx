import React from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import { Icons } from '../../constants';

const BottomNavBar: React.FC = () => {
    const { activeTab, isQuietSpaceActive } = useAppState();
    const dispatch = useAppDispatch();

    const handleTabClick = (tab: ListPanelTab) => {
        if (tab === ListPanelTab.QUIET) {
            dispatch({ type: 'TOGGLE_QUIET_SPACE' });
        } else {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
        }
    };
    
    const tabs = [
        { id: ListPanelTab.CHATS, icon: Icons.ChatBubbleOvalLeftEllipsis, label: 'Chats' },
        { id: ListPanelTab.NIGERIA, icon: Icons.Map, label: 'Nigeria' },
        { id: ListPanelTab.PEOPLE_CURRENT, icon: Icons.UserGroup, label: 'People' },
        { id: ListPanelTab.TOWN_HALLS, icon: Icons.Landmark, label: 'Town Halls' },
        { id: ListPanelTab.QUIET, icon: Icons.Moon, label: 'Quiet' },
    ];
    
    const isPeopleTabActive = activeTab.startsWith('people');

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-primary border-t border-ui-border dark:border-dark-ui-border flex justify-around items-start pt-2 pb-1 z-30">
            {tabs.map(tab => {
                let isActive = false;
                if (tab.id === ListPanelTab.QUIET) {
                    isActive = isQuietSpaceActive;
                } else if (tab.id === ListPanelTab.PEOPLE_CURRENT) {
                    isActive = isPeopleTabActive && !isQuietSpaceActive;
                } else {
                    isActive = activeTab === tab.id && !isQuietSpaceActive;
                }

                return (
                    <button 
                        key={tab.id} 
                        onClick={() => handleTabClick(tab.id as ListPanelTab)} 
                        className="flex flex-col items-center space-y-1 text-xs w-1/5"
                    >
                       <tab.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-primary-green' : 'text-secondary dark:text-dark-text-secondary'}`} />
                       <span className={`transition-colors text-center ${isActive ? 'text-primary-green font-semibold' : 'text-secondary dark:text-dark-text-secondary'}`}>{tab.label}</span>
                    </button>
                )
            })}
        </div>
    );
};

export default BottomNavBar;