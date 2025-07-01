import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { USER_AVATAR_OPTIONS, Icons } from '../../constants';

const SettingsScreen: React.FC = () => {
    const { userProfile } = useAppState();
    const dispatch = useAppDispatch();
    const [profile, setProfile] = useState<UserProfile>(userProfile);

    useEffect(() => {
        setProfile(userProfile);
    }, [userProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newProfile = { ...profile, [name]: value };
        setProfile(newProfile);
        dispatch({ type: 'SET_USER_PROFILE', payload: newProfile });
    };

    const handleAvatarSelect = (avatar: string) => {
        const newProfile = { ...profile, avatar };
        setProfile(newProfile);
        dispatch({ type: 'SET_USER_PROFILE', payload: newProfile });
    };

    const handleBack = () => {
        dispatch({ type: 'SET_ACTIVE_SYSTEM_VIEW', payload: null });
    };

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <header className="flex-shrink-0 bg-white border-b border-ui-border p-3 flex items-center space-x-3 z-10">
                <button onClick={handleBack} className="lg:hidden p-1 text-secondary">
                    <Icons.ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                    <Icons.Cog className="w-6 h-6 text-primary-green" />
                    <h1 className="text-xl font-bold text-primary">Profile & Settings</h1>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h2 className="text-lg font-semibold text-primary mb-4">Your Forum Identity</h2>
                    <div className="flex items-center space-x-4 p-4 bg-app-light rounded-lg">
                        <img src={profile.avatar} alt="Current Avatar" className="w-16 h-16 rounded-full"/>
                        <div>
                            <p className="font-bold text-lg text-primary">{profile.name}</p>
                            <p className="text-secondary">{profile.title}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">Display Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={profile.name} 
                            onChange={handleInputChange} 
                            className="w-full bg-white border border-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-secondary mb-1">Title / Tagline</label>
                        <input 
                            type="text" 
                            name="title" 
                            id="title" 
                            value={profile.title} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Student from Abuja"
                            className="w-full bg-white border border-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-primary mb-4">Choose Your Avatar</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                        {USER_AVATAR_OPTIONS.map(avatarUrl => (
                            <button 
                                key={avatarUrl} 
                                onClick={() => handleAvatarSelect(avatarUrl)} 
                                className={`rounded-full aspect-square transition-all duration-200 focus:outline-none ${profile.avatar === avatarUrl ? 'ring-4 ring-offset-2 ring-primary-green' : 'hover:scale-105 hover:ring-2 hover:ring-gray-300'}`}
                                aria-label={`Select avatar ${avatarUrl}`}
                            >
                                <img src={avatarUrl} alt="avatar option" className="w-full h-full rounded-full object-cover"/>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;