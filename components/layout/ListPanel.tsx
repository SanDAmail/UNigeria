

import React, { useState, useEffect, useMemo } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import { Icons, PERSONA_LIST, ALL_PROFILES } from '../../constants';
import { PersonSubtype, Persona, PersonaType, Topic, ForumSubTab, Profile } from '../../types';
import ChatListItem from '../list/ChatListItem';
import ForumCategoryCard from '../list/ForumCategoryCard';
import TopicListItem from '../list/TopicListItem';
import PeopleSubNav from './PeopleSubNav';
import ForumSubNav from '../forums/ForumSubNav';
import { getChatHistory } from '../../services/dbService';

const DesktopNav: React.FC = () => {
    const { activeTab, isQuietSpaceActive } = useAppState();
    const dispatch = useAppDispatch();
    
    const tabs = [
        { id: ListPanelTab.CHATS, label: "Chats", icon: Icons.ChatBubbleOvalLeftEllipsis },
        { id: ListPanelTab.NIGERIA, label: "Nigeria", icon: Icons.Map },
        { id: ListPanelTab.PEOPLE_CURRENT, label: "People", icon: Icons.UserGroup },
        { id: ListPanelTab.UNIGERIANS, label: "UNigerians", icon: Icons.User },
        { id: ListPanelTab.FORUMS, label: "Forums", icon: Icons.Flag },
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
        <div className="hidden lg:flex items-center justify-around border-b border-ui-border p-1">
           {tabs.map(tab => {
                let isActive = isPeopleTabActive && tab.id === ListPanelTab.PEOPLE_CURRENT ? true : activeTab === tab.id;
                if(tab.id === ListPanelTab.QUIET) isActive = isQuietSpaceActive;

                return (
                    <button 
                        key={tab.id}
                        onClick={() => handleNavClick(tab.id)}
                        className={`flex flex-col items-center p-2 rounded-lg w-full transition-colors ${isActive ? 'bg-primary-green/10 text-primary-green' : 'text-secondary hover:bg-app-light'}`}
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
    const { activeTab, activeChatId, chatListDetails, forumSubTab, topics, userProfile, forumCategories } = useAppState();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setSearchQuery('');
    }, [activeTab]);

    useEffect(() => {
        const loadInitialDetails = async () => {
            const details: { [key: string]: { lastMessage: string; timestamp: number } } = {};
            // Pre-populate details for any chats that have existing history
            const allChatIds = PERSONA_LIST.map(p => `${p.type}_${p.id}`);
            for (const chatId of allChatIds) {
                 try {
                    const history = await getChatHistory(chatId);
                    if (history.length > 0) {
                        const lastMsg = history[history.length - 1];
                        const lastMessageText = lastMsg.type === 'image' ? '[Image]' : lastMsg.text;
                        details[chatId] = { lastMessage: lastMessageText, timestamp: lastMsg.timestamp };
                    }
                } catch (e) {
                    console.error(`Failed to get history for ${chatId}`, e);
                }
            }
            dispatch({ type: 'SET_CHAT_LIST_DETAILS', payload: details });
        };
        loadInitialDetails();
    }, [dispatch]);

    const handleItemClick = (type: PersonaType, id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: { type, id } });
    };
    
    const handleForumCategoryClick = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_FORUM_CATEGORY', payload: id });
    }

    const sortedChats = useMemo(() => {
        return PERSONA_LIST
            .map(p => ({ persona: p, details: chatListDetails[`${p.type}_${p.id}`] }))
            .filter(item => item.details) // Only include chats with history/details
            .sort((a, b) => (b.details?.timestamp || 0) - (a.details?.timestamp || 0))
            .map(item => item.persona);
    }, [chatListDetails]);
    
    const filterItems = <T extends { name: string; title?: string } | Topic >(items: T[], query: string): T[] => {
        if (!query) return items;
        const lowercasedQuery = query.toLowerCase();
        return items.filter(item => {
            if ('title' in item && typeof item.title === 'string') { // Topic type
                 return item.title.toLowerCase().includes(lowercasedQuery);
            }
            if ('name' in item && typeof item.name === 'string') { // Persona, Profile, or ForumCategory
                return item.name.toLowerCase().includes(lowercasedQuery);
            }
            return false;
        });
    };

    const isPeopleTab = activeTab.startsWith('people_');

    const hotTopics = useMemo(() => {
        return Object.values(topics)
            .flat()
            .sort((a, b) => b.replyCount - a.replyCount);
    }, [topics]);

    const myTopics = useMemo(() => {
        return Object.values(topics)
            .flat()
            .filter(topic => topic.author.name === userProfile.name)
            .sort((a, b) => parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1])); // sort by most recent
    }, [topics, userProfile.name]);

    const handleTopicClick = (categoryId: string, topicId: string) => {
        // Must set category first, because SET_ACTIVE_TOPIC reducer relies on it
        dispatch({ type: 'SET_ACTIVE_FORUM_CATEGORY', payload: categoryId });
        // Use timeout to ensure state update is processed before next dispatch
        setTimeout(() => {
            dispatch({ type: 'SET_ACTIVE_TOPIC', payload: topicId });
        }, 0);
    };

    const handleDeleteTopic = (categoryId: string, topicId: string) => {
        if (window.confirm("Are you sure you want to delete this topic and all its messages? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_TOPIC', payload: { categoryId, topicId } });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Topic deleted successfully' } });
        }
    };

    const renderList = () => {
        let listItems: Persona[] = [];
        
        switch(activeTab) {
            case ListPanelTab.CHATS:
                 const chatsToShow = filterItems(sortedChats, searchQuery);
                 if (chatsToShow.length === 0 && !searchQuery) {
                    return <div className="text-center text-secondary p-4 mt-4">No active chats. Start a new conversation to see it here.</div>;
                 }
                 if (searchQuery && chatsToShow.length === 0) {
                    return <div className="text-center text-secondary p-4">No results found for "{searchQuery}".</div>;
                 }
                 return chatsToShow.map(p => {
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
                                unreadCount: 0,
                            }}
                            isActive={activeChatId === chatId}
                            onClick={() => handleItemClick(p.type, p.id)}
                        />
                    )
                 });
            case ListPanelTab.NIGERIA: {
                const allNigeriaEntities = ALL_PROFILES.filter(p => p.personaType === PersonaType.STATE);
                const filteredEntities = filterItems(allNigeriaEntities, searchQuery);

                const nigeriaProfile = filteredEntities.find(p => p.id === 'nigeria');
                const stateProfiles = filteredEntities.filter(p => p.id !== 'nigeria');

                if (searchQuery && filteredEntities.length === 0) {
                    return <div className="text-center text-secondary p-4">No results found for "{searchQuery}".</div>;
                }

                const groupedByRegion = stateProfiles.reduce<{[key: string]: Profile[]}>((acc, state) => {
                    const region = state.region || 'Uncategorized';
                    if (!acc[region]) acc[region] = [];
                    acc[region].push(state);
                    return acc;
                }, {});

                const REGION_ORDER = ['North West', 'North East', 'North Central', 'South South', 'South East', 'South West'];
                const REGION_COLORS: { [key: string]: string } = {
                    'North West': 'text-red-700 bg-red-50 border-t-red-200 border-b-red-200',
                    'North East': 'text-blue-700 bg-blue-50 border-t-blue-200 border-b-blue-200',
                    'North Central': 'text-orange-700 bg-orange-50 border-t-orange-200 border-b-orange-200',
                    'South South': 'text-purple-700 bg-purple-50 border-t-purple-200 border-b-purple-200',
                    'South East': 'text-indigo-700 bg-indigo-50 border-t-indigo-200 border-b-indigo-200',
                    'South West': 'text-teal-700 bg-teal-50 border-t-teal-200 border-b-teal-200',
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
                            const regionColorClass = REGION_COLORS[region] || 'text-gray-700 bg-gray-50 border-t-gray-200 border-b-gray-200';
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
                const allCurrentLeaders = PERSONA_LIST.filter(p => p.type === PersonaType.PERSON && p.subtype === PersonSubtype.CURRENT_LEADER);
                const filteredLeaders = filterItems(allCurrentLeaders, searchQuery);
                
                const federalLeaders = filteredLeaders
                    .filter(p => p.subtitle && !p.subtitle.toLowerCase().includes('governor'))
                    .sort((a,b) => a.name.localeCompare(b.name));
                
                const governors = filteredLeaders
                    .filter(p => p.subtitle && p.subtitle.toLowerCase().includes('governor'))
                    .sort((a,b) => a.name.localeCompare(b.name));
            
                if (filteredLeaders.length === 0 && searchQuery) {
                    return <div className="text-center text-secondary p-4">No results found for "{searchQuery}".</div>;
                }
            
                const renderLeaderList = (leaders: Persona[]) => leaders.map(p => (
                    <ChatListItem
                        key={`${p.type}_${p.id}`}
                        data={{ ...p, lastMessage: p.subtitle, timestamp: '', unreadCount: 0 }}
                        isActive={activeChatId === `${p.type}_${p.id}`}
                        onClick={() => handleItemClick(p.type, p.id)}
                    />
                ));
            
                return (
                    <div>
                        {federalLeaders.length > 0 && (
                            <>
                                <div className="px-4 py-2 text-sm font-bold text-primary-green bg-app-light border-b border-t border-ui-border sticky top-0 z-10">
                                    Federal Leadership
                                </div>
                                {renderLeaderList(federalLeaders)}
                            </>
                        )}
                        {governors.length > 0 && (
                             <>
                                <div className="px-4 py-2 text-sm font-bold text-primary-green bg-app-light border-b border-t border-ui-border sticky top-0 z-10">
                                    State Governors
                                </div>
                                {renderLeaderList(governors)}
                            </>
                        )}
                    </div>
                );
            }
            case ListPanelTab.PEOPLE_FORMER:
                 listItems = PERSONA_LIST.filter(p => p.type === PersonaType.PERSON && p.subtype === PersonSubtype.FORMER_LEADER);
                 break;
            case ListPanelTab.PEOPLE_NOTABLE:
                 listItems = PERSONA_LIST.filter(p => p.type === PersonaType.PERSON && p.subtype === PersonSubtype.NOTABLE_PERSON);
                 break;
            case ListPanelTab.UNIGERIANS:
                 listItems = PERSONA_LIST.filter(p => p.type === PersonaType.UNIGERIAN);
                 break;
            case ListPanelTab.FORUMS:
                switch (forumSubTab) {
                    case ForumSubTab.HOME:
                        const filteredHotTopics = filterItems(hotTopics, searchQuery);
                        if (filteredHotTopics.length === 0) return <div className="text-center text-secondary p-4">No topics found.</div>;
                        return filteredHotTopics.map(topic => {
                            const categoryName = forumCategories.find(c => c.id === topic.categoryId)?.name;
                            return (
                                <TopicListItem 
                                    key={topic.id} 
                                    topic={topic}
                                    onClick={() => handleTopicClick(topic.categoryId, topic.id)}
                                    showCategory
                                    categoryName={categoryName}
                                />
                            );
                        });
                    case ForumSubTab.CATEGORIES:
                        const filteredCategories = filterItems(forumCategories, searchQuery);
                        if(filteredCategories.length === 0) return <div className="text-center text-secondary p-4">No categories found.</div>;
                        return filteredCategories.map(cat => (
                            <ForumCategoryCard 
                                key={cat.id} 
                                category={cat}
                                onClick={() => handleForumCategoryClick(cat.id)}
                            />
                        ));
                    case ForumSubTab.MY_TOPICS:
                        const filteredMyTopics = filterItems(myTopics, searchQuery);
                        if (filteredMyTopics.length === 0) {
                            return (
                                <div className="text-center text-secondary p-8 flex flex-col items-center justify-center h-full">
                                    <Icons.ChatBubbleOvalLeftEllipsis className="w-16 h-16 mx-auto text-gray-300" />
                                    <p className="mt-4 text-lg font-semibold">No Topics Yet</p>
                                    <p className="text-sm">You haven't created any topics. Why not start a new discussion in one of the categories?</p>
                                </div>
                            );
                        }
                        return filteredMyTopics.map(topic => {
                            const categoryName = forumCategories.find(c => c.id === topic.categoryId)?.name;
                            return (
                                <TopicListItem 
                                    key={topic.id} 
                                    topic={topic}
                                    onClick={() => handleTopicClick(topic.categoryId, topic.id)}
                                    showCategory
                                    isAuthor={true}
                                    onDelete={() => handleDeleteTopic(topic.categoryId, topic.id)}
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
            const filteredList = filterItems(listItems, searchQuery);
             if(filteredList.length > 0) {
                 return filteredList.map(p => (
                    <ChatListItem 
                        key={`${p.type}_${p.id}`}
                        data={{ ...p, lastMessage: p.subtitle, timestamp: '', unreadCount: 0 }}
                        isActive={activeChatId === `${p.type}_${p.id}`}
                        onClick={() => handleItemClick(p.type, p.id)}
                    />
                ));
             }
        }

        if (searchQuery) {
            return <div className="text-center text-secondary p-4">No results found for "{searchQuery}".</div>;
        }
        return null;
    };

    return (
        <div className="w-full lg:w-[350px] bg-white border-r border-ui-border flex flex-col h-full">
             <DesktopNav />
            <div className="p-4 bg-white space-y-3 border-b border-ui-border flex-shrink-0">
                 {isPeopleTab && <PeopleSubNav activeTab={activeTab} />}
                 {activeTab === ListPanelTab.FORUMS && <ForumSubNav />}
                <div className="relative">
                    <Icons.MagnifyingGlass className="w-5 h-5 text-secondary absolute top-1/2 left-3 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-app-light border border-transparent rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-green transition"
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