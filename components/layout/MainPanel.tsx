
import React, { useState } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import ChatScreen from '../chat/ChatScreen';
import TopicListItem from '../list/TopicListItem';
import { Icons } from '../../constants';
import SettingsScreen from '../settings/SettingsScreen';
import CreateTopicScreen from '../forums/CreateTopicScreen';

const WelcomePlaceholder: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
    const dispatch = useAppDispatch();

    const actions = [
        { title: "Explore Nigeria", icon: Icons.Map, tab: ListPanelTab.NIGERIA, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Browse Leaders", icon: Icons.UserGroup, tab: ListPanelTab.PEOPLE_CURRENT, color: "text-green-500", bg: "bg-green-50" },
        { title: "Join Forums", icon: Icons.Flag, tab: ListPanelTab.FORUMS, color: "text-yellow-500", bg: "bg-yellow-50" },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-adire-pattern p-8 text-center">
            <button 
                onClick={onGoHome}
                className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg max-w-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green"
            >
                <Icons.FlyingFlagLogo className="w-20 h-20 mx-auto" />
                <h1 className="text-3xl font-bold mt-4 text-primary-green">Welcome to UNigeria</h1>
                <p className="text-secondary mt-2">
                    Select a conversation to begin, or choose an option below to get started.
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
                        <span className="font-semibold text-sm text-gray-700">{action.title}</span>
                     </button>
                ))}
            </div>
        </div>
    );
};


const MainPanel: React.FC = () => {
    const { activeChatId, activeForumCategory, activeTopicId, activeSystemView, topics, userProfile, forumCategories } = useAppState();
    const dispatch = useAppDispatch();
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    
    const handleTopicClick = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_TOPIC', payload: id });
    };

    const handleStartNewTopic = () => {
        setIsCreatingTopic(true);
    };

    const handleCancelCreate = () => {
        setIsCreatingTopic(false);
    };

    const handleDeleteTopic = (categoryId: string, topicId: string) => {
        if (window.confirm("Are you sure you want to delete this topic and all its messages? This action cannot be undone.")) {
            dispatch({ type: 'DELETE_TOPIC', payload: { categoryId, topicId } });
        }
    };
    
    const handleGoHome = () => {
        dispatch({ type: 'GO_HOME' });
    };

    if (activeSystemView === 'settings') {
        return <SettingsScreen />;
    }

    if (activeChatId) {
        const [type, ...idParts] = activeChatId.split('_');
        const id = idParts.join('_');
        return <ChatScreen key={activeChatId} personaType={type as any} personaId={id} />;
    }

    if (activeForumCategory) {
        const category = forumCategories.find(c => c.id === activeForumCategory);
        const categoryTopics = topics[activeForumCategory] || [];

        if (isCreatingTopic) {
            return <CreateTopicScreen categoryId={activeForumCategory} onCancel={handleCancelCreate} />;
        }

        return (
            <div className="w-full h-full bg-white flex flex-col">
                <header className="p-4 border-b border-ui-border flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">{category?.name}</h2>
                        <p className="text-sm text-secondary">{category?.description}</p>
                    </div>
                    <button 
                        onClick={handleStartNewTopic}
                        className="flex items-center gap-2 bg-primary-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                    >
                        <Icons.Plus className="w-5 h-5" />
                        Start New Topic
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {categoryTopics.length > 0 ? [...categoryTopics].reverse().map(topic => (
                        <TopicListItem 
                            key={topic.id} 
                            topic={topic} 
                            onClick={() => handleTopicClick(topic.id)}
                            isAuthor={topic.author.name === userProfile.name}
                            onDelete={() => handleDeleteTopic(activeForumCategory, topic.id)}
                        />
                    )) : (
                        <div className="text-center text-secondary py-10 flex flex-col items-center justify-center h-full">
                            <Icons.ChatBubbleBottomCenterText className="w-16 h-16 mx-auto text-gray-300" />
                            <p className="mt-4 text-lg">No topics in this category yet.</p>
                            <p className="text-sm">Be the first to start a discussion!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return <WelcomePlaceholder onGoHome={handleGoHome} />;
};

export default MainPanel;
