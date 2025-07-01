

import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Topic, Message } from '../../types';
import { saveChatHistory } from '../../services/dbService';
import { Icons } from '../../constants';

interface CreateTopicScreenProps {
    categoryId: string;
    onCancel: () => void;
}

const CreateTopicScreen: React.FC<CreateTopicScreenProps> = ({ categoryId, onCancel }) => {
    const { userProfile } = useAppState();
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim() || isSubmitting) {
            return;
        }
        setIsSubmitting(true);

        const newTopicId = `topic_${Date.now()}`;
        const newTopic: Topic = {
            id: newTopicId,
            title: title.trim(),
            author: userProfile,
            replyCount: 0,
            lastReply: `by ${userProfile.name}`,
            categoryId,
        };

        const firstMessage: Message = {
            id: `post_${Date.now()}`,
            text: message.trim(),
            sender: 'user', // user is the author
            timestamp: Date.now(),
            type: 'post',
            authorInfo: userProfile,
            isOriginalPost: true,
        };

        try {
            // Add topic to global state and save to local storage
            dispatch({ type: 'ADD_TOPIC', payload: { categoryId, topic: newTopic } });

            // Save the first message to the chat history for this new topic
            const chatId = `forum_${categoryId}_${newTopicId}`;
            await saveChatHistory(chatId, [firstMessage]);
            
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Topic created successfully!' } });

            // Dispatch action to navigate to the new topic's chat screen
            dispatch({ type: 'SET_ACTIVE_TOPIC', payload: newTopicId });

        } catch (error) {
            console.error("Failed to create new topic:", error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Could not create topic.', type: 'error' } });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full bg-white flex flex-col">
            <header className="p-4 border-b border-ui-border flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button onClick={onCancel} className="p-1 text-secondary">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold">Start a New Topic</h2>
                </div>
                <button 
                    onClick={onCancel}
                    className="p-2 rounded-full hover:bg-app-light transition-colors"
                    aria-label="Cancel"
                >
                    <Icons.XMark className="w-6 h-6 text-secondary" />
                </button>
            </header>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="flex-1 space-y-6">
                    <div>
                        <label htmlFor="topic-title" className="block text-sm font-medium text-secondary mb-1">
                            Topic Title
                        </label>
                        <input
                            id="topic-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="A clear and concise title for your discussion"
                            required
                            className="w-full bg-app-light border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="topic-message" className="block text-sm font-medium text-secondary mb-1">
                            Your Message
                        </label>
                        <textarea
                            id="topic-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your opening post here. You can elaborate on your title, ask a question, or state your opinion."
                            required
                            rows={10}
                            className="w-full bg-app-light border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition resize-y"
                        />
                    </div>
                     <div>
                        <p className="text-sm font-medium text-secondary mb-2">You will be posting as:</p>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-ui-border">
                            <img src={userProfile.avatar} alt="Your Avatar" className="w-10 h-10 rounded-full"/>
                            <div>
                                <p className="font-semibold text-primary">{userProfile.name}</p>
                                <p className="text-sm text-secondary">{userProfile.title}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 pt-4 mt-auto">
                     <button
                        type="submit"
                        disabled={!title.trim() || !message.trim() || isSubmitting}
                        className="w-full bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Posting...
                            </>
                        ) : "Post Topic"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTopicScreen;