

import React, { useState } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import ChatScreen from '../chat/ChatScreen';
import ReportListItem from '../list/TopicListItem';
import { Icons } from '../../constants';
import SettingsScreen from '../settings/SettingsScreen';
import CreateReportScreen from '../forums/CreateTopicScreen';
import StateComparisonScreen from '../compare/StateComparisonScreen';
import { Report } from '../../types';

const WelcomePlaceholder: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
    const dispatch = useAppDispatch();

    const actions = [
        { title: "Explore Nigeria", icon: Icons.Map, tab: ListPanelTab.NIGERIA, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/50" },
        { title: "Browse Leaders", icon: Icons.UserGroup, tab: ListPanelTab.PEOPLE_CURRENT, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/50" },
        { title: "File a Report", icon: Icons.ChatBubbleBottomCenterText, tab: ListPanelTab.TOWN_HALLS, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/50" },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-adire-pattern p-8 text-center">
            <button 
                onClick={onGoHome}
                className="bg-white/80 dark:bg-dark-primary/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg max-w-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green"
            >
                <Icons.FlyingFlagLogo className="w-20 h-20 mx-auto" />
                <h1 className="text-3xl font-bold mt-4 text-primary-green">Be The Voice Of Your Community</h1>
                <p className="text-secondary dark:text-dark-text-secondary mt-2">
                    Your platform for civic action and community-led change. Select a conversation, or choose an option below to get started.
                </p>
            </button>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
                {actions.map(action => (
                     <button 
                        key={action.tab}
                        onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: action.tab })}
                        className={`p-4 rounded-lg flex flex-col items-center justify-center space-y-2 transition-transform duration-200 hover:scale-105 hover:shadow-xl ${action.bg}`}
                    >
                        <action.icon className={`w-10 h-10 ${action.color}`} />
                        <span className="font-semibold text-sm text-gray-700 dark:text-dark-text-secondary">{action.title}</span>
                     </button>
                ))}
            </div>
        </div>
    );
};


const MainPanel: React.FC = () => {
    const { activeChatId, activeTownHallCategory, activeReportId, activeSystemView, reports, userProfile, townHallCategories, stateComparisonIds, sidebarProfileId } = useAppState();
    const dispatch = useAppDispatch();
    const [isCreatingReport, setIsCreatingReport] = useState(false);
    
    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id });
    };

    const handleStartNewReport = () => {
        if (!userProfile.state || !userProfile.lga || !userProfile.ward) {
            dispatch({type: 'SHOW_TOAST', payload: { message: "Please complete your location in Settings to file a report.", type: 'error'}});
            dispatch({type: 'SET_ACTIVE_SYSTEM_VIEW', payload: 'settings'});
            return;
        }
        setIsCreatingReport(true);
    };

    const handleCancelCreate = () => {
        setIsCreatingReport(false);
    };

    const handleDeleteReport = (reportId: string) => {
        if (window.confirm("Are you sure you want to delete this report and all its messages? This action cannot be undone.")) {
            // The actual deletion logic is now in ListPanel to have access to the service
        }
    };
    
    const handleGoHome = () => {
        dispatch({ type: 'GO_HOME' });
    };

    if (!activeChatId && !activeTownHallCategory && !activeSystemView && !stateComparisonIds.state1 && !sidebarProfileId) {
        return <WelcomePlaceholder onGoHome={handleGoHome} />;
    }

    if (activeSystemView === 'settings') {
        return <SettingsScreen />;
    }

    if (stateComparisonIds.state1 && stateComparisonIds.state2) {
        return <StateComparisonScreen />;
    }
    
    if (activeChatId) {
        const [type, ...idParts] = activeChatId.split('_');
        const id = idParts.join('_');
        return <ChatScreen key={activeChatId} personaType={type as any} personaId={id} />;
    }

    if (activeTownHallCategory) {
        const category = townHallCategories.find(c => c.id === activeTownHallCategory);
        const categoryReports = reports.filter(t => t.category_id === activeTownHallCategory);

        if (isCreatingReport) {
            return <CreateReportScreen categoryId={activeTownHallCategory} onCancel={handleCancelCreate} />;
        }

        return (
            <div className="w-full h-full bg-white dark:bg-dark-primary flex flex-col">
                <header className="p-4 border-b border-ui-border dark:border-dark-ui-border flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">{category?.name}</h2>
                        <p className="text-sm text-secondary dark:text-dark-text-secondary">{category?.description}</p>
                    </div>
                    <button 
                        onClick={handleStartNewReport}
                        className="flex items-center gap-2 bg-primary-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                    >
                        <Icons.Plus className="w-5 h-5" />
                        File a New Report
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {categoryReports.length > 0 ? categoryReports.map(report => (
                        <ReportListItem 
                            key={report.id} 
                            report={report} 
                            onClick={() => handleReportClick(report)}
                            isAuthor={report.author_id === userProfile.id}
                            onDelete={() => handleDeleteReport(report.id)}
                        />
                    )) : (
                        <div className="text-center text-secondary dark:text-dark-text-secondary py-10 flex flex-col items-center justify-center h-full">
                            <Icons.ChatBubbleBottomCenterText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                            <p className="mt-4 text-lg">No reports in this category yet.</p>
                            <p className="text-sm">Be the first to file a report!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    // Fallback to the Welcome placeholder if no other content is active
    return <WelcomePlaceholder onGoHome={handleGoHome} />;
};

export default MainPanel;