import React, { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { Icons, NIGERIAN_STATES, LGAS } from '../../constants';
import { upsertProfile, supabase } from '../../services/supabaseService';
import { uploadUserAvatar, declareCandidacy } from '../../services/dbService';

const getCurrentElectionCycle = (): string => {
    const year = new Date().getFullYear();
    // Assuming a 2-year cycle starting on even years
    const startYear = year % 2 === 0 ? year : year - 1;
    return `${startYear}-${startYear + 2}`;
};


const ThemeToggle: React.FC = () => {
    const { theme } = useAppState();
    const dispatch = useAppDispatch();

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        dispatch({ type: 'SET_THEME', payload: newTheme });
    };

    return (
        <div className="flex items-center justify-between bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
            <div className="flex items-center">
                <Icons.Moon className="w-6 h-6 mr-3 text-primary-green" />
                <div>
                    <h3 className="font-semibold text-primary dark:text-dark-text-primary">Dark Mode</h3>
                    <p className="text-sm text-secondary dark:text-dark-text-secondary">
                        {theme === 'dark' ? 'Enabled' : 'Disabled'}
                    </p>
                </div>
            </div>
            <button
                onClick={toggleTheme}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green dark:focus:ring-offset-dark-primary ${
                    theme === 'dark' ? 'bg-primary-green' : 'bg-gray-300'
                }`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};

const ChangePasswordForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        
        setIsSubmitting(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setError(error.message);
            dispatch({ type: 'SHOW_TOAST', payload: { message: `Error: ${error.message}`, type: 'error' } });
        } else {
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Password updated successfully!' } });
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsSubmitting(false);
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
             <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">New Password</label>
                <input 
                    type="password" 
                    name="new_password" 
                    id="new_password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"
                />
            </div>
             <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Confirm New Password</label>
                <input 
                    type="password" 
                    name="confirm_password" 
                    id="confirm_password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
             <button
                type="submit"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="w-full bg-primary-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400"
            >
                {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

const CandidacySection: React.FC = () => {
    const { userProfile } = useAppState();
    const dispatch = useAppDispatch();
    const [isDeclaring, setIsDeclaring] = useState(false);
    const electionCycle = getCurrentElectionCycle();

    const handleDeclareCandidacy = async () => {
        if (!userProfile.id) return;
        setIsDeclaring(true);
        try {
            await declareCandidacy(userProfile.id);
            dispatch({ type: 'SET_USER_PROFILE', payload: { ...userProfile, is_candidate: true }});
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'You are now a candidate!' }});
        } catch (error) {
            console.error("Failed to declare candidacy", error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: (error as Error).message || "Candidacy declaration failed.", type: 'error' }});
        } finally {
            setIsDeclaring(false);
        }
    };

    return (
        <div className="p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-primary dark:text-dark-text-primary">My Candidacy</h3>
                    <p className="text-sm text-secondary dark:text-dark-text-secondary">
                        {userProfile.is_candidate
                            ? `You are a candidate for the ${electionCycle} election cycle.`
                            : "Run to become a UNigerian representative for your community."}
                    </p>
                </div>
                {!userProfile.is_candidate && (
                    <button
                        onClick={handleDeclareCandidacy}
                        disabled={isDeclaring}
                        className="bg-primary-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center disabled:bg-gray-400"
                    >
                        {isDeclaring ? 'Declaring...' : 'Declare Candidacy'}
                    </button>
                )}
                 {userProfile.is_candidate && (
                     <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <Icons.CheckCircle className="w-6 h-6" />
                        <span className="font-semibold">Declared</span>
                     </div>
                )}
            </div>
             {userProfile.is_representative && (
                 <p className="text-sm text-primary-green font-semibold mt-2">
                    Current Representative for {userProfile.lga}, {userProfile.state}. Tenure ends {userProfile.tenure_end_date ? new Date(userProfile.tenure_end_date).getFullYear() : 'N/A'}.
                 </p>
             )}
        </div>
    );
};

const SettingsScreen: React.FC = () => {
    const { userProfile, isAuthenticated } = useAppState();
    const dispatch = useAppDispatch();
    const [profile, setProfile] = useState<UserProfile>(userProfile);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setProfile(userProfile);
        setHasChanges(false);
        setAvatarFile(null);
        setAvatarPreview(null);
    }, [userProfile]);

    useEffect(() => {
        const detectChanges = () => {
            if (
                profile.name !== userProfile.name ||
                profile.title !== userProfile.title ||
                profile.state !== userProfile.state ||
                profile.lga !== userProfile.lga ||
                profile.ward !== userProfile.ward ||
                avatarFile
            ) {
                setHasChanges(true);
            } else {
                setHasChanges(false);
            }
        };
        detectChanges();
    }, [profile, userProfile, avatarFile]);
    
    useEffect(() => {
        // Cleanup object URL
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        }
    }, [avatarPreview]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleBack = () => {
        dispatch({ type: 'SET_ACTIVE_SYSTEM_VIEW', payload: null });
    };

    const handleSave = async () => {
        if (!hasChanges || !isAuthenticated || !profile.id) return;

        setIsSaving(true);
        let newAvatarUrl = profile.avatar;
        
        if (avatarFile) {
            setIsUploading(true);
            try {
                newAvatarUrl = await uploadUserAvatar(profile.id, avatarFile);
            } catch (error) {
                console.error('Failed to upload avatar:', error);
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Avatar upload failed.', type: 'error' } });
                setIsSaving(false);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        try {
            const updatedProfileData = {
                id: profile.id,
                name: profile.name,
                title: profile.title,
                avatar: newAvatarUrl,
                state: profile.state,
                lga: profile.lga,
                ward: profile.ward,
            };
            
            await upsertProfile(updatedProfileData);
            dispatch({ type: 'SET_USER_PROFILE', payload: { ...profile, avatar: newAvatarUrl } });
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Profile updated successfully!' } });
            setHasChanges(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error) {
            console.error('Failed to save profile:', error);
            dispatch({ type: 'SHOW_TOAST', payload: { message: 'Failed to update profile.', type: 'error' } });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-dark-primary">
            <header className="flex-shrink-0 bg-white dark:bg-dark-primary border-b border-ui-border dark:border-dark-ui-border p-3 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={handleBack} className="lg:hidden p-1 text-secondary dark:text-dark-text-secondary">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <Icons.Cog className="w-6 h-6 text-primary-green" />
                        <h1 className="text-xl font-bold text-primary dark:text-dark-text-primary">Profile & Settings</h1>
                    </div>
                </div>
                 {isAuthenticated && hasChanges && (
                     <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                )}
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                     <h2 className="text-lg font-semibold text-primary dark:text-dark-text-primary mb-4">Appearance</h2>
                    <ThemeToggle />
                </div>
                
                {isAuthenticated && (
                     <div>
                        <h2 className="text-lg font-semibold text-primary dark:text-dark-text-primary mb-4">Governance</h2>
                        <CandidacySection />
                    </div>
                )}
                
                {isAuthenticated && (
                     <div>
                        <h2 className="text-lg font-semibold text-primary dark:text-dark-text-primary mb-4">Security</h2>
                        <ChangePasswordForm />
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-semibold text-primary dark:text-dark-text-primary mb-4">Your Identity & Location</h2>
                     <div className="p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
                         <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img src={avatarPreview || profile.avatar} alt="Current Avatar" className="w-16 h-16 rounded-full"/>
                                {isAuthenticated && (
                                    <button onClick={handleAvatarClick} disabled={isUploading} className="absolute bottom-0 right-0 bg-white dark:bg-dark-secondary p-1 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-dark-app-light transition">
                                        {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-green"></div> : <Icons.Pencil className="w-4 h-4 text-primary-green" />}
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                            <div>
                                <p className="font-bold text-lg text-primary dark:text-dark-text-primary">{profile.name}</p>
                                <p className="text-secondary dark:text-dark-text-secondary">{profile.title}</p>
                                 <p className="text-xs text-secondary dark:text-dark-text-secondary mt-1">{profile.state}, {profile.lga}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Display Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={profile.name} 
                            onChange={handleInputChange} 
                            disabled={!isAuthenticated}
                            className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                        />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Title / Tagline</label>
                        <input 
                            type="text" 
                            name="title" 
                            id="title" 
                            value={profile.title || ''} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Student from Abuja"
                            disabled={!isAuthenticated}
                            className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                        />
                    </div>
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">State</label>
                        <select
                            name="state"
                            id="state"
                            value={profile.state || ''}
                            onChange={handleInputChange}
                            disabled={!isAuthenticated}
                             className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                        >
                            <option value="">Select your state</option>
                            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="lga" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Local Government Area (LGA)</label>
                        <select
                            name="lga"
                            id="lga"
                            value={profile.lga || ''}
                            onChange={handleInputChange}
                            disabled={!isAuthenticated || !profile.state}
                            className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                        >
                             <option value="">Select your LGA</option>
                             {profile.state && LGAS[profile.state] && LGAS[profile.state].map(lga => (
                                 <option key={lga} value={lga}>{lga}</option>
                             ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="ward" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Ward</label>
                        <input 
                            type="text" 
                            name="ward" 
                            id="ward" 
                            value={profile.ward || ''} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Ward C"
                            disabled={!isAuthenticated}
                            className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary disabled:bg-gray-100 dark:disabled:bg-dark-app-light"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsScreen;