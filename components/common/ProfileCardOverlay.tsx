import React from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Icons } from '../../constants';

const ProfileCardOverlay: React.FC = () => {
    const { profileCardUser } = useAppState();
    const dispatch = useAppDispatch();

    if (!profileCardUser) return null;

    const handleClose = () => {
        dispatch({ type: 'HIDE_PROFILE_CARD' });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-down"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-xs pt-12 pb-8 px-6 text-center relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Icons.XMark className="w-6 h-6" />
                </button>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img 
                        src={profileCardUser.avatar} 
                        alt={profileCardUser.name} 
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg" 
                    />
                </div>
                <h2 className="text-xl font-bold mt-4 text-primary">{profileCardUser.name}</h2>
                <p className="text-secondary">{profileCardUser.title}</p>
            </div>
        </div>
    );
};

export default ProfileCardOverlay;
