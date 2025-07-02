import React, { useState, useEffect, useMemo } from 'react';
import { useAppState, useAppDispatch, ListPanelTab, NigeriaSubTab } from '../../context/AppContext';
import { Icons, PERSONA_LIST, ALL_PROFILES } from '../../constants';
import { PersonSubtype, Persona, PersonaType, Report, TownHallSubTab, Profile, Message } from '../../types';
import ChatListItem from '../list/ChatListItem';
import ForumCategoryCard from '../list/ForumCategoryCard';
import ReportListItem from '../list/TopicListItem';
import PeopleSubNav from './PeopleSubNav';
import TownHallSubNav from '../forums/ForumSubNav';
import { getChatListDetails, deleteReport as deleteReportFromDb } from '../../services/dbService';
import NigeriaSubNav from './NigeriaSubNav';
import StateComparisonSelector from '../list/StateComparisonSelector';
import { supabase } from '../../services/supabaseService';
import GlobalSearchResults from '../list/GlobalSearchResults';

const DesktopNav: React.FC = () => {
    const { activeTab, isQuietSpaceActive } = useAppState();
    const dispatch = useAppDispatch();
    
    const tabs = [
        { id: ListPanelTab.CHATS, label: "Chats", icon: Icons.ChatBubbleOvalLeftEllipsis },
        { id: ListPanelTab.NIGERIA, label: "Nigeria", icon: Icons.Map },
        { id: ListPanelTab.PEOPLE_CURRENT, label: "People", icon: Icons.UserGroup },
        { id: ListPanelTab.UNIGERIANS, label: "UNigerians", icon: Icons.User },
        { id: ListPanelTab.TOWN_HALLS, label: "Town Halls", icon: Icons.Landmark },
        { id: ListPanelTab.QUIET, label: "Quiet", icon: Icons.Moon },
    ];

    const isPeopleTabActive = activeTab.startsWith('people_');

    const handleNavClick = (tabId: ListPanelTab) => {
        if (tabId === ListPanelTab.QUIET) {
            dispatch({ type: 'TOGGLE_QUIET_SPACE' });
        } else {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
        }
    };

    return (
        <div className="hidden lg:flex items-center justify-around border-b border-ui-border dark:border-dark-ui-border p-1">
           {tabs.map(tab => {
                let isActive = isPeopleTabActive && tab.id === ListPanelTab.PEOPLE_CURRENT ? true : activeTab === tab.id;
                if(tab.id === ListPanelTab.QUIET) isActive = isQuietSpaceActive;

                return (
                    <button 
                        key={tab.id}
                        onClick={() => handleNavClick(tab.id)}
                        className={`flex flex-col items-center p-2 rounded-lg w-full transition-colors ${isActive ? 'bg-primary-green/10 text-primary-green' : 'text-secondary dark:text-dark-text-secondary hover:bg-app-light dark:hover:bg-dark-app-light'}`}
                    >
                        <tab.icon className="w-6 h-6 mb-1"/>
                        <span className="text-xs font-semibold">{tab.label}</span>
                    </button>
                )
           })}
        </div>
    );
};


const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (date > startOfDay) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (date > startOfYesterday) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en-GB');
};

const ListPanel: React.FC = () => {
    const { activeTab, activeChatId, chatListDetails, townHallSubTab, reports, userProfile, townHallCategories, nigeriaSubTab, isAuthenticated, unreadCounts } = useAppState();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setSearchQuery('');
    }, [activeTab]);

    useEffect(() => {
        const loadInitialDetails = async () => {
            const details = await getChatListDetails();
            dispatch({ type: 'SET_CHAT_LIST_DETAILS', payload: details });
        };
        if (isAuthenticated) {
            loadInitialDetails();
        }
    }, [dispatch, isAuthenticated]);

    // Realtime subscription for Chat List updates
    useEffect(() => {
        if (!isAuthenticated || !userProfile.id) return;

        const handleChatUpdate = (payload: any) => {
            if (payload.new && payload.new.message_content) {
                const message = payload.new.message_content as Message;
                const chatId = payload.new.chat_id;

                if (message.isStreaming || message.isThinking) return;

                const lastMessageText = message.error ? '[Error]' : message.type === 'image' ? `[Image] ${message.text}`.trim() : message.text;
                
                dispatch({
                    type: 'UPDATE_CHAT_LIST_DETAIL',
                    payload: {
                        chatId,
                        detail: {
                            lastMessage: lastMessageText,
                            timestamp: message.timestamp,
                        }
                    }
                });

                // If the message is not for the currently active chat, increment unread count
                if (chatId !== activeChatId) {
                    dispatch({ type: 'INCREMENT_UNREAD_COUNT', payload: { chatId } });
                }
            }
        };

        const chatListSubscription = supabase
            .channel('realtime-chat-list')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `user_id=eq.${userProfile.id}`
                },
                handleChatUpdate
            )
            .subscribe();

        return () => {
            if (chatListSubscription) {
                supabase.removeChannel(chatListSubscription);
            }
        }
    }, [isAuthenticated, userProfile.id, dispatch, activeChatId]);

    const handleItemClick = (type: PersonaType, id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: { type, id } });
    };
    
    const handleTownHallCategoryClick = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_TOWNHALL_CATEGORY', payload: id });
    }

    const sortedChats = useMemo(() => {
        return PERSONA_LIST
            .map(p => ({ persona: p, details: chatListDetails[`${p.type}_${p.id}`] }))
            .filter(item => item.details) // Only include chats with history/details
            .sort((a, b) => (b.details?.timestamp || 0) - (a.details?.timestamp || 0))
            .map(item => item.persona);
    }, [chatListDetails]);
    
    const isPeopleTab = activeTab.startsWith('people_');

    const hotReports = useMemo(() => {
        return [...reports].sort((a, b) => b.reply_count - a.reply_count);
    }, [reports]);

    const myReports = useMemo(() => {
        return reports
            .filter(report => report.author_id === userProfile.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [reports, userProfile.id]);

    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_TOWNHALL_CATEGORY', payload: report.category_id });
        setTimeout(() => {
            dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id });
        }, 0);
    };

    const handleDeleteReport = async (reportId: string) => {
        if (window.confirm("Are you sure you want to delete this report and all its messages? This action cannot be undone.")) {
            try {
                await deleteReportFromDb(reportId);
                dispatch({ type: 'DELETE_REPORT', payload: { reportId } });
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Report deleted successfully' } });
            } catch (error) {
                console.error("Failed to delete report:", error);
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to delete report.', type: 'error' } });
            }
        }
    };

    const renderList = () => {
        if (searchQuery) {
            return <GlobalSearchResults query={searchQuery} />;
        }

        let listItems: Profile[] = [];
        
        switch(activeTab) {
            case ListPanelTab.CHATS:
                 if (sortedChats.length === 0) {
                    return <div className="text-center text-secondary dark:text-dark-text-secondary p-4 mt-4">No active chats. Start a new conversation to see it here.</div>;
                 }
                 return sortedChats.map(p => {
                    const chatId = `${p.type}_${p.id}`;
                    const details = chatListDetails[chatId];
                    return (
                        <ChatListItem 
                            key={chatId}
                            data={{
                                id: p.id,
                                type: p.type,
                                avatar: p.avatar,
                                name: p.name,
                                lastMessage: details?.lastMessage || p.description,
                                timestamp: details ? formatTimestamp(details.timestamp) : '',
                                unreadCount: unreadCounts[chatId] || 0,
                            }}
                            isActive={activeChatId === chatId}
                            onClick={() => handleItemClick(p.type, p.id)}
                        />
                    )
                 });
            case ListPanelTab.NIGERIA: {
                if (nigeriaSubTab === NigeriaSubTab.COMPARE) {
                    return <StateComparisonSelector />;
                }
                
                const allNigeriaEntities = ALL_PROFILES.filter(p => p.personaType === PersonaType.STATE);

                const nigeriaProfile = allNigeriaEntities.find(p => p.id === 'nigeria');
                const stateProfiles = allNigeriaEntities.filter(p => p.id !== 'nigeria');

                const groupedByRegion = stateProfiles.reduce<{[key: string]: Profile[]}>((acc, state) => {
                    const region = state.region || 'Uncategorized';
                    if (!acc[region]) acc[region] = [];
                    acc[region].push(state);
                    return acc;
                }, {});

                const REGION_ORDER = ['North West', 'North East', 'North Central', 'South South', 'South East', 'South West'];
                const REGION_COLORS: { [key: string]: string } = {
                    'North West': 'text-red-700 bg-red-50 border-t-red-200 border-b-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
                    'North East': 'text-blue-700 bg-blue-50 border-t-blue-200 border-b-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
                    'North Central': 'text-orange-700 bg-orange-50 border-t-orange-200 border-b-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
                    'South South': 'text-purple-700 bg-purple-50 border-t-purple-200 border-b-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
                    'South East': 'text-indigo-700 bg-indigo-50 border-t-indigo-200 border-b-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
                    'South West': 'text-teal-700 bg-teal-50 border-t-teal-200 border-b-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
                };

                return (
                    <div>
                         {nigeriaProfile && (
                            <ChatListItem 
                                key={`${nigeriaProfile.personaType}_${nigeriaProfile.id}`}
                                data={{
                                    id: nigeriaProfile.id,
                                    type: nigeriaProfile.personaType,
                                    avatar: nigeriaProfile.avatar,
                                    name: nigeriaProfile.name,
                                    lastMessage: nigeriaProfile.slogan || nigeriaProfile.description,
                                    timestamp: '',
                                    unreadCount: 0,
                                    dateCreated: nigeriaProfile.dateCreated,
                                    lgas: nigeriaProfile.lgas,
                                }}
                                isActive={activeChatId === `${nigeriaProfile.personaType}_${nigeriaProfile.id}`}
                                onClick={() => handleItemClick(nigeriaProfile.personaType, nigeriaProfile.id)}
                            />
                        )}
                        {REGION_ORDER.map(region => {
                            const statesInRegion = groupedByRegion[region];
                            if (!statesInRegion || statesInRegion.length === 0) {
                                return null;
                            }
                            const regionColorClass = REGION_COLORS[region] || 'text-gray-700 bg-gray-50 border-t-gray-200 border-b-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
                            return (
                                <div key={region}>
                                    <div className={`px-4 py-2 text-sm font-bold border-b border-t sticky top-0 z-10 ${regionColorClass}`}>
                                        {region}
                                    </div>
                                    {statesInRegion.map(p => {
                                        const chatId = `${p.personaType}_${p.id}`;
                                        return (
                                            <ChatListItem 
                                                key={chatId}
                                                data={{
                                                    id: p.id,
                                                    type: p.personaType,
                                                    avatar: p.avatar,
                                                    name: p.name,
                                                    lastMessage: p.slogan || p.description,
                                                    timestamp: '',
                                                    unreadCount: 0,
                                                    dateCreated: p.dateCreated,
                                                }}
                                                isActive={activeChatId === chatId}
                                                onClick={() => handleItemClick(p.personaType, p.id)}
                                            />
                                        );
                                    })}
                                </div>
                            )
                        })}
                    </div>
                );
            }
            case ListPanelTab.PEOPLE_CURRENT: {
                const allCurrentLeaders = ALL_PROFILES.filter(p => p.personaType === PersonaType.PERSON && p.personSubtype === PersonSubtype.CURRENT_LEADER);
                
                const federalLeaders = allCurrentLeaders
                    .filter(p => p.title && !p.title.toLowerCase().includes('governor'))
                    .sort((a,b) => a.name.localeCompare(b.name));
                
                const governors = allCurrentLeaders
                    .filter(p => p.title && p.title.toLowerCase().includes('governor'))
                    .sort((a,b) => a.name.localeCompare(b.name));
            
                const renderLeaderList = (leaders: Profile[]) => leaders.map(p => (
                    <ChatListItem
                        key={`${p.personaType}_${p.id}`}
                        data={{ id: p.id, type: p.personaType, avatar: p.avatar, name: p.name, lastMessage: p.title || p.description, timestamp: '', unreadCount: 0 }}
                        isActive={activeChatId === `${p.personaType}_${p.id}`}
                        onClick={() => handleItemClick(p.personaType, p.id)}
                    />
                ));
            
                return (
                    <div>
                        {federalLeaders.length > 0 && (
                            <>
                                <div className="px-4 py-2 text-sm font-bold text-primary-green bg-app-light dark:bg-dark-app-light dark:text-green-400 border-b border-t border-ui-border dark:border-dark-ui-border sticky top-0 z-10">
                                    Federal Leadership
                                </div>
                                {renderLeaderList(federalLeaders)}
                            </>
                        )}
                        {governors.length > 0 && (
                             <>
                                <div className="px-4 py-2 text-sm font-bold text-primary-green bg-app-light dark:bg-dark-app-light dark:text-green-400 border-b border-t border-ui-border dark:border-dark-ui-border sticky top-0 z-10">
                                    State Governors
                                </div>
                                {renderLeaderList(governors)}
                            </>
                        )}
                    </div>
                );
            }
            case ListPanelTab.PEOPLE_FORMER:
                 listItems = ALL_PROFILES.filter(p => p.personaType === PersonaType.PERSON && p.personSubtype === PersonSubtype.FORMER_LEADER);
                 break;
            case ListPanelTab.PEOPLE_NOTABLE:
                 listItems = ALL_PROFILES.filter(p => p.personaType === PersonaType.PERSON && p.personSubtype === PersonSubtype.NOTABLE_PERSON);
                 break;
            case ListPanelTab.UNIGERIANS:
                 const unigerianProfiles = ALL_PROFILES.filter(p => p.personaType === PersonaType.UNIGERIAN);
                 return (
                    <div>
                        <div className="p-4 bg-app-light dark:bg-dark-app-light border-b border-ui-border dark:border-dark-ui-border">
                            <h3 className="font-semibold text-primary dark:text-dark-text-primary">Become a Representative</h3>
                            <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1">
                                Represent your community and become a verified UNigerian. Help give your community a voice on our platform.
                            </p>
                            <a href="mailto:apply@unigeria.dev" className="mt-3 inline-block bg-primary-green text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                                Apply Now
                            </a>
                        </div>
                        {unigerianProfiles.map(p => (
                             <ChatListItem 
                                key={`${p.personaType}_${p.id}`}
                                data={{ 
                                    id: p.id, 
                                    type: p.personaType, 
                                    avatar: p.avatar, 
                                    name: p.name, 
                                    lastMessage: p.title || p.description, 
                                    timestamp: '', 
                                    unreadCount: unreadCounts[`${p.personaType}_${p.id}`] || 0 
                                }}
                                isActive={activeChatId === `${p.personaType}_${p.id}`}
                                onClick={() => handleItemClick(p.personaType, p.id)}
                            />
                        ))}
                    </div>
                 )
            case ListPanelTab.TOWN_HALLS:
                if (!isAuthenticated) {
                    return <div className="text-center text-secondary dark:text-dark-text-secondary p-8">Please sign in to access the Town Halls.</div>;
                }
                
                switch (townHallSubTab) {
                    case TownHallSubTab.HOT_REPORTS:
                        if (hotReports.length === 0) return <div className="text-center text-secondary dark:text-dark-text-secondary p-4">No reports found.</div>;
                        return hotReports.map(report => {
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
                        });
                    case TownHallSubTab.CATEGORIES:
                        if(townHallCategories.length === 0) return <div className="text-center text-secondary dark:text-dark-text-secondary p-4">No categories found.</div>;
                        return townHallCategories.map(cat => (
                            <ForumCategoryCard 
                                key={cat.id} 
                                category={cat}
                                onClick={() => handleTownHallCategoryClick(cat.id)}
                            />
                        ));
                    case TownHallSubTab.MY_REPORTS:
                        if (myReports.length === 0) {
                            return (
                                <div className="text-center text-secondary dark:text-dark-text-secondary p-8 flex flex-col items-center justify-center h-full">
                                    <Icons.ChatBubbleOvalLeftEllipsis className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
                                    <p className="mt-4 text-lg font-semibold">No Reports Yet</p>
                                    <p className="text-sm">You haven't filed any reports. Why not start a new one in one of the categories?</p>
                                </div>
                            );
                        }
                        return myReports.map(report => {
                            const categoryName = townHallCategories.find(c => c.id === report.category_id)?.name;
                            return (
                                <ReportListItem 
                                    key={report.id} 
                                    report={report}
                                    onClick={() => handleReportClick(report)}
                                    showCategory
                                    isAuthor={true}
                                    onDelete={() => handleDeleteReport(report.id)}
                                    categoryName={categoryName}
                                />
                            );
                        });
                }
                break;
            default:
                return null;
        }

        if (listItems.length > 0) {
            return listItems.map(p => (
                <ChatListItem 
                    key={`${p.personaType}_${p.id}`}
                    data={{ 
                        id: p.id, 
                        type: p.personaType, 
                        avatar: p.avatar, 
                        name: p.name, 
                        lastMessage: p.slogan || p.title || p.description, 
                        timestamp: '', 
                        unreadCount: unreadCounts[`${p.personaType}_${p.id}`] || 0 
                    }}
                    isActive={activeChatId === `${p.personaType}_${p.id}`}
                    onClick={() => handleItemClick(p.personaType, p.id)}
                />
            ));
        }
        
        return null;
    };

    return (
        <div className="w-full lg:w-[350px] bg-white dark:bg-dark-primary border-r border-ui-border dark:border-dark-ui-border flex flex-col h-full">
             <DesktopNav />
            <div className="p-4 bg-white dark:bg-dark-primary space-y-3 border-b border-ui-border dark:border-dark-ui-border flex-shrink-0">
                 {isPeopleTab && <PeopleSubNav activeTab={activeTab} />}
                 {activeTab === ListPanelTab.TOWN_HALLS && <TownHallSubNav />}
                 {activeTab === ListPanelTab.NIGERIA && <NigeriaSubNav />}
                <div className="relative">
                    <Icons.MagnifyingGlass className="w-5 h-5 text-secondary dark:text-dark-text-secondary absolute top-1/2 left-3 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search Nigeria..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-app-light dark:bg-dark-app-light border border-transparent rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderList()}
            </div>
        </div>
    );
};

export default ListPanel;