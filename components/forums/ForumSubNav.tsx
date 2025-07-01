import React from 'react';
import { useAppDispatch, useAppState } from '../../context/AppContext';
import { ForumSubTab } from '../../types';

const ForumSubNav: React.FC = () => {
    const { forumSubTab } = useAppState();
    const dispatch = useAppDispatch();

    const tabs = [
        { label: "Home", tab: ForumSubTab.HOME },
        { label: "Categories", tab: ForumSubTab.CATEGORIES },
        { label: "My Topics", tab: ForumSubTab.MY_TOPICS },
    ];

    return (
        <div className="flex items-center bg-app-light rounded-lg p-1">
            {tabs.map(item => (
                <button
                    key={item.tab}
                    onClick={() => dispatch({ type: 'SET_FORUM_SUB_TAB', payload: item.tab })}
                    className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
                        forumSubTab === item.tab 
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

export default ForumSubNav;
