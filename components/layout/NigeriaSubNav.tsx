
import React from 'react';
import { useAppDispatch, useAppState, NigeriaSubTab } from '../../context/AppContext';

const NigeriaSubNav: React.FC = () => {
    const { nigeriaSubTab } = useAppState();
    const dispatch = useAppDispatch();

    const tabs = [
        { label: "All States", tab: NigeriaSubTab.ALL_STATES },
        { label: "Compare States", tab: NigeriaSubTab.COMPARE },
    ];

    return (
        <div className="flex items-center bg-app-light rounded-lg p-1">
            {tabs.map(item => (
                <button
                    key={item.tab}
                    onClick={() => dispatch({ type: 'SET_NIGERIA_SUB_TAB', payload: item.tab })}
                    className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
                        nigeriaSubTab === item.tab 
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

export default NigeriaSubNav;
