
import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Icons, TownHallCategoryIcons } from '../../constants';

const CreateReportModal: React.FC = () => {
    const { townHallCategories } = useAppState();
    const dispatch = useAppDispatch();

    const handleClose = () => {
        dispatch({ type: 'HIDE_CREATE_REPORT_MODAL' });
    };

    const handleSelectCategory = (categoryId: string) => {
        dispatch({ type: 'START_CREATE_REPORT', payload: { categoryId } });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-down"
            onClick={handleClose}
        >
            <div 
                className="bg-white dark:bg-dark-primary rounded-2xl shadow-2xl w-full max-w-2xl relative transition-all duration-300 flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 flex-shrink-0 border-b border-ui-border dark:border-dark-ui-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-primary dark:text-dark-text-primary">Select a Category</h2>
                    <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-secondary rounded-full">
                        <Icons.XMark className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {townHallCategories.map(category => {
                            const IconComponent = TownHallCategoryIcons[category.iconName] || Icons.DocumentText;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleSelectCategory(category.id)}
                                    className="text-left p-4 bg-app-light dark:bg-dark-app-light rounded-lg hover:bg-primary-green/10 hover:ring-2 hover:ring-primary-green transition-all"
                                >
                                    <IconComponent className="w-8 h-8 text-primary-green mb-2" />
                                    <h3 className="font-semibold text-primary dark:text-dark-text-primary">{category.name}</h3>
                                    <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1">{category.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReportModal;
