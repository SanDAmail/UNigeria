import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Report, Message } from '../../types';
import { addMessage, createReport } from '../../services/dbService';
import { Icons } from '../../constants';

interface CreateReportScreenProps {
    categoryId: string;
    onCancel: () => void;
}

const CreateReportScreen: React.FC<CreateReportScreenProps> = ({ categoryId, onCancel }) => {
    const { userProfile } = useAppState();
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim() || isSubmitting || !userProfile.id || !userProfile.state || !userProfile.lga || !userProfile.ward) {
            dispatch({type: 'SHOW_TOAST', payload: { message: "Cannot file report without a complete location in your profile.", type: 'error'}});
            return;
        }
        setIsSubmitting(true);

        try {
            const location = { state: userProfile.state, lga: userProfile.lga, ward: userProfile.ward };
            const newReport = await createReport(title.trim(), categoryId, userProfile.id, location);

            if (!newReport) {
                throw new Error("Failed to create report in the database.");
            }

            const firstMessage: Message = {
                id: `post_${Date.now()}`,
                text: message.trim(),
                sender: userProfile.id,
                timestamp: Date.now(),
                type: 'post',
                authorInfo: { name: userProfile.name, avatar: userProfile.avatar },
                isOriginalPost: true,
            };

            const chatId = `townhall_${newReport.id}`;
            await addMessage(chatId, firstMessage);

            dispatch({ type: 'ADD_REPORT', payload: newReport });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Report filed successfully!' } });
            dispatch({ type: 'SET_ACTIVE_REPORT', payload: newReport.id });

        } catch (error) {
            console.error("Failed to create new report:", error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Could not file report.', type: 'error' } });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full bg-white dark:bg-dark-primary flex flex-col">
            <header className="p-4 border-b border-ui-border dark:border-dark-ui-border flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button onClick={onCancel} className="p-1 text-secondary dark:text-dark-text-secondary">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold">File a New Report</h2>
                </div>
                <button 
                    onClick={onCancel}
                    className="p-2 rounded-full hover:bg-app-light dark:hover:bg-dark-app-light transition-colors"
                    aria-label="Cancel"
                >
                    <Icons.XMark className="w-6 h-6 text-secondary dark:text-dark-text-secondary" />
                </button>
            </header>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="flex-1 space-y-6">
                    <div>
                        <label htmlFor="report-title" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">
                            Report Title
                        </label>
                        <input
                            id="report-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Broken pipeline on Ajao Street"
                            required
                            className="w-full bg-app-light dark:bg-dark-app-light border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="report-message" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">
                            Describe the Issue
                        </label>
                        <textarea
                            id="report-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Provide details about the issue. Be as specific as possible."
                            required
                            rows={10}
                            className="w-full bg-app-light dark:bg-dark-app-light border border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition resize-y"
                        />
                    </div>
                     <div>
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                             <Icons.InformationCircle className="w-8 h-8 text-blue-500 flex-shrink-0"/>
                            <div>
                                <p className="font-semibold text-primary dark:text-dark-text-primary">Posting as {userProfile.name}</p>
                                <p className="text-sm text-secondary dark:text-dark-text-secondary">This report will be publicly tagged with your location: {userProfile.ward}, {userProfile.lga}, {userProfile.state} State.</p>
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
                                Submitting...
                            </>
                        ) : "Submit Report"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateReportScreen;