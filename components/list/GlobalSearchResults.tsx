
import React, { useMemo } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import { ALL_PROFILES, Icons } from '../../constants';
import { PersonaType, Profile, Report } from '../../types';
import ChatListItem from './ChatListItem';
import ReportListItem from './TopicListItem';

interface GlobalSearchResultsProps {
    query: string;
}

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ query }) => {
    const { reports, townHallCategories } = useAppState();
    const dispatch = useAppDispatch();
    const lowercasedQuery = query.toLowerCase();

    const results = useMemo(() => {
        if (!query) return { people: [], states: [], reports: [] };

        const people = ALL_PROFILES.filter(p =>
            p.personaType === PersonaType.PERSON &&
            (p.name.toLowerCase().includes(lowercasedQuery) || (p.title && p.title.toLowerCase().includes(lowercasedQuery)))
        );

        const states = ALL_PROFILES.filter(p =>
            p.personaType === PersonaType.STATE &&
            (p.name.toLowerCase().includes(lowercasedQuery) || (p.slogan && p.slogan.toLowerCase().includes(lowercasedQuery)))
        );

        const filteredReports = reports.filter(t =>
            t.title.toLowerCase().includes(lowercasedQuery)
        );

        return { people, states, reports: filteredReports };

    }, [lowercasedQuery, reports]);

    const handleItemClick = (type: PersonaType, id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: { type, id } });
    };

    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: ListPanelTab.TOWN_HALLS });
        dispatch({ type: 'SET_ACTIVE_TOWNHALL_CATEGORY', payload: report.category_id });
        setTimeout(() => {
            dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id });
        }, 50);
    };

    const totalResults = results.people.length + results.states.length + results.reports.length;

    if (totalResults === 0) {
        return <div className="text-center text-secondary dark:text-dark-text-secondary p-4">No results found for "{query}".</div>;
    }

    const ResultSection: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => {
        if (count === 0) return null;
        return (
            <div>
                <div className="px-4 py-2 text-sm font-bold text-primary-green bg-app-light dark:bg-dark-app-light dark:text-green-400 border-b border-t border-ui-border dark:border-dark-ui-border sticky top-0 z-10">
                    {title}
                </div>
                {children}
            </div>
        );
    };

    return (
        <div className="animate-fade-in-down">
            <ResultSection title="People" count={results.people.length}>
                {results.people.map(p => (
                    <ChatListItem
                        key={`${p.personaType}_${p.id}`}
                        data={{
                            id: p.id,
                            type: p.personaType,
                            avatar: p.avatar,
                            name: p.name,
                            lastMessage: p.title || p.description,
                            timestamp: '',
                            unreadCount: 0,
                        }}
                        isActive={false}
                        onClick={() => handleItemClick(p.personaType, p.id)}
                    />
                ))}
            </ResultSection>

            <ResultSection title="States & Entities" count={results.states.length}>
                {results.states.map(p => (
                    <ChatListItem
                        key={`${p.personaType}_${p.id}`}
                        data={{
                            id: p.id,
                            type: p.personaType,
                            avatar: p.avatar,
                            name: p.name,
                            lastMessage: p.slogan || p.description,
                            timestamp: '',
                            unreadCount: 0,
                        }}
                        isActive={false}
                        onClick={() => handleItemClick(p.personaType, p.id)}
                    />
                ))}
            </ResultSection>

            <ResultSection title="Town Hall Reports" count={results.reports.length}>
                {results.reports.map(report => {
                    const categoryName = townHallCategories.find(c => c.id === report.category_id)?.name;
                    return (
                        <ReportListItem
                            key={report.id}
                            report={report}
                            onClick={() => handleReportClick(report)}
                            showCategory
                            categoryName={categoryName}
                        />
                    );
                })}
            </ResultSection>
        </div>
    );
};

export default GlobalSearchResults;
