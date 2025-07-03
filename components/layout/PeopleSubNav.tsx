
import React from 'react';
import { useAppDispatch, ListPanelTab } from '../../context/AppContext';

interface PeopleSubNavProps {
    activeTab: ListPanelTab;
}

const PeopleSubNav: React.FC<PeopleSubNavProps> = ({ activeTab }) => {
    const dispatch = useAppDispatch();

    const tabs = [
        { label: "Current", tab: ListPanelTab.PEOPLE_CURRENT },
        { label: "Former", tab: ListPanelTab.PEOPLE_FORMER },
        { label: "Notable", tab: ListPanelTab.PEOPLE_NOTABLE },
    ];

    return (
        <div className="flex items-center bg-app-light rounded-lg p-1">
            {tabs.map(item => (
                <button
                    key={item.tab}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.tab })}
                    className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
                        activeTab === item.tab 
                        ? 'bg-white text-primary-green shadow-sm' 
                        : 'text-secondary hover:text-primary'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default PeopleSubNav;
