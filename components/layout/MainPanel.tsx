
import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import ChatScreen from '../chat/ChatScreen';
import ReportListItem from '../list/TopicListItem';
import { Icons } from '../../constants';
import SettingsScreen from '../settings/SettingsScreen';
import StateComparisonScreen from '../compare/StateComparisonScreen';
import { Report } from '../../types';
import Dashboard from '../dashboard/Dashboard';

const MainPanel: React.FC = () => {
    const { activeChatId, activeTownHallCategory, activeSystemView, reports, userProfile, townHallCategories, stateComparisonIds, sidebarProfileId } = useAppState();
    const dispatch = useAppDispatch();
    
    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id });
    };
    
    const isViewActive = activeChatId || activeTownHallCategory || activeSystemView || (stateComparisonIds.state1 && stateComparisonIds.state2) || sidebarProfileId;

    if (!isViewActive) {
        return <Dashboard />;
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

        return (
            <div className="w-full h-full bg-white dark:bg-dark-primary flex flex-col">
                <header className="p-4 border-b border-ui-border dark:border-dark-ui-border flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">{category?.name}</h2>
                        <p className="text-sm text-secondary dark:text-dark-text-secondary">{category?.description}</p>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {categoryReports.length > 0 ? categoryReports.map(report => (
                        <ReportListItem 
                            key={report.id} 
                            report={report} 
                            onClick={() => handleReportClick(report)}
                            isAuthor={report.author_id === userProfile.id}
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
    
    return <Dashboard />;
};

export default MainPanel;
