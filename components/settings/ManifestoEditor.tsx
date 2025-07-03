import React, { useState } from 'react';
import { ManifestoItem, UserProfile } from '../../types';
import { Icons } from '../../constants';

interface ManifestoEditorProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const ManifestoEditor: React.FC<ManifestoEditorProps> = ({ profile, setProfile }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTopic, setNewTopic] = useState('');
    const [newStance, setNewStance] = useState('');

    const manifesto = profile.manifesto || [];

    const handleAddItem = () => {
        if (!newTopic.trim() || !newStance.trim()) return;
        const newItem: ManifestoItem = { topic: newTopic, stance: newStance };
        setProfile({ ...profile, manifesto: [...manifesto, newItem] });
        setNewTopic('');
        setNewStance('');
        setIsAdding(false);
    };

    const handleUpdateItem = (index: number, updatedItem: ManifestoItem) => {
        const newManifesto = [...manifesto];
        newManifesto[index] = updatedItem;
        setProfile({ ...profile, manifesto: newManifesto });
    };

    const handleDeleteItem = (index: number) => {
        if(window.confirm("Are you sure you want to delete this manifesto item?")){
            const newManifesto = manifesto.filter((_, i) => i !== index);
            setProfile({ ...profile, manifesto: newManifesto });
        }
    };

    return (
        <div className="p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
            <h3 className="font-semibold text-primary dark:text-dark-text-primary mb-2">Manage Manifesto</h3>
            <div className="space-y-3">
                {manifesto.map((item, index) => (
                    <div key={index} className="p-3 bg-white dark:bg-dark-secondary rounded-lg border border-ui-border dark:border-dark-ui-border">
                        <div className="flex justify-end">
                            <button onClick={() => handleDeleteItem(index)} className="p-1 text-gray-400 hover:text-red-500">
                                <Icons.Trash className="w-4 h-4"/>
                            </button>
                        </div>
                        <input
                            type="text"
                            value={item.topic}
                            onChange={(e) => handleUpdateItem(index, { ...item, topic: e.target.value })}
                            placeholder="Topic (e.g., Security)"
                            className="w-full font-semibold bg-transparent focus:outline-none mb-2"
                        />
                        <textarea
                            value={item.stance}
                            onChange={(e) => handleUpdateItem(index, { ...item, stance: e.target.value })}
                            placeholder="Your stance on this topic..."
                            rows={3}
                            className="w-full text-sm bg-transparent focus:outline-none resize-none"
                        />
                    </div>
                ))}
            </div>

            {isAdding ? (
                 <div className="mt-3 p-3 bg-white dark:bg-dark-secondary rounded-lg border border-primary-green">
                    <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="New Topic (e.g., Education)"
                        className="w-full font-semibold bg-transparent focus:outline-none mb-2"
                    />
                    <textarea
                        value={newStance}
                        onChange={(e) => setNewStance(e.target.value)}
                        placeholder="Your detailed stance on the new topic..."
                        rows={3}
                        className="w-full text-sm bg-transparent focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setIsAdding(false)} className="text-xs font-semibold text-secondary dark:text-dark-text-secondary hover:underline">Cancel</button>
                        <button onClick={handleAddItem} className="text-xs font-semibold bg-primary-green text-white px-3 py-1 rounded-md hover:bg-opacity-90">Add Item</button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)} 
                    className="mt-3 w-full flex items-center justify-center gap-2 text-primary-green font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-primary-green/50 hover:bg-primary-green/10 transition-colors"
                >
                    <Icons.Plus className="w-5 h-5"/>
                    Add Manifesto Item
                </button>
            )}
        </div>
    );
};

export default ManifestoEditor;
