import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { createAnnouncement } from '../../services/dbService';
import { Icons } from '../../constants';

interface CreateAnnouncementScreenProps {
    onCancel: () => void;
}

const CreateAnnouncementScreen: React.FC<CreateAnnouncementScreenProps> = ({ onCancel }) => {
    const { userProfile } = useAppState();
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !userProfile.id || !userProfile.lga || !userProfile.state) {
            dispatch({type: 'SHOW_TOAST', payload: { message: "Title and content are required.", type: 'error'}});
            return;
        }
        setIsSubmitting(true);

        try {
            const newAnnouncement = await createAnnouncement(userProfile.id, title, content, userProfile.lga, userProfile.state);
            if (newAnnouncement) {
                dispatch({ type: 'ADD_ANNOUNCEMENT', payload: newAnnouncement });
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Announcement published!' } });
                onCancel();
            } else {
                throw new Error("Failed to create announcement.");
            }
        } catch (error) {
            console.error("Failed to create announcement:", error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Could not publish announcement.', type: 'error' } });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-dark-primary z-50 flex flex-col animate-fade-in-down">
            <header className="flex-shrink-0 bg-white dark:bg-dark-primary border-b border-ui-border dark:border-dark-ui-border p-3 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={onCancel} className="p-1 text-secondary dark:text-dark-text-secondary">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-primary dark:text-dark-text-primary">Create Announcement</h1>
                </div>
                 <button 
                    type="submit" 
                    form="announcement-form"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="bg-primary-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
            </header>
            <form id="announcement-form" onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="flex-1 space-y-6">
                    <div>
                        <label htmlFor="announcement-title" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">
                            Title
                        </label>
                        <input
                            id="announcement-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Town Hall Meeting on Security"
                            required
                            className="w-full text-lg font-semibold bg-transparent border-b border-ui-border dark:border-dark-ui-border py-2 focus:outline-none focus:border-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="announcement-content" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">
                            Content (Markdown supported)
                        </label>
                        <textarea
                            id="announcement-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your announcement here. Use Markdown for formatting, like **bold** text or lists."
                            required
                            rows={15}
                            className="w-full bg-app-light dark:bg-dark-app-light border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition resize-y"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateAnnouncementScreen;