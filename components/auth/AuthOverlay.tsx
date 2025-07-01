import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Icons } from '../../constants';
import { UserProfile } from '../../types';

const AuthOverlay: React.FC = () => {
    const { authOverlayMode } = useAppState();
    const dispatch = useAppDispatch();
    
    const [mode, setMode] = useState<'login' | 'register'>(authOverlayMode || 'login');
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMode(authOverlayMode || 'login');
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    }, [authOverlayMode]);

    const handleClose = () => {
        dispatch({ type: 'HIDE_AUTH_OVERLAY' });
    };

    const handleGoogleLogin = () => {
        const googleUserProfile: UserProfile = {
            name: 'Google User',
            title: 'Civic Explorer',
            avatar: 'https://picsum.photos/seed/google-user/96/96'
        };
        dispatch({ type: 'SET_USER_PROFILE', payload: googleUserProfile });
        dispatch({ type: 'LOGIN' });
        dispatch({ type: 'SHOW_TOAST', payload: { message: 'Signed in with Google!' } });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Mock validation
        if (!email || !password || (mode === 'register' && !name)) {
            setError('All fields are required.');
            setIsSubmitting(false);
            return;
        }

        // Mock API call
        setTimeout(() => {
            if (mode === 'register') {
                const newUserProfile: UserProfile = {
                    name: name,
                    title: 'New Member',
                    avatar: `https://picsum.photos/seed/${email}/96/96`
                };
                dispatch({ type: 'SET_USER_PROFILE', payload: newUserProfile });
                dispatch({ type: 'LOGIN' });
                dispatch({ type: 'SHOW_TOAST', payload: { message: `Welcome, ${name}!` } });
            } else { // Login mode
                 const demoUserProfile: UserProfile = {
                    name: 'Demo User',
                    title: 'Returning Citizen',
                    avatar: `https://picsum.photos/seed/demo-user/96/96`
                };
                // In a real app, you'd fetch the user's profile.
                // Here we just use a demo profile for successful login.
                dispatch({ type: 'SET_USER_PROFILE', payload: demoUserProfile });
                dispatch({ type: 'LOGIN' });
                dispatch({ type: 'SHOW_TOAST', payload: { message: 'Welcome back!' } });
            }
            // No need to call handleClose, as the LOGIN action now hides the overlay
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-down"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative transition-all duration-300"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Icons.XMark className="w-6 h-6" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <Icons.FlyingFlagLogo className="w-12 h-12 mx-auto" />
                         <h2 className="text-2xl font-bold mt-2 text-primary">
                            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                        </h2>
                        <p className="text-sm text-secondary">
                            {mode === 'login' ? 'Sign in to continue your journey.' : 'Join the conversation.'}
                        </p>
                    </div>
                    
                    <div className="flex items-center bg-app-light rounded-lg p-1 mb-6">
                        <button onClick={() => setMode('login')} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${mode === 'login' ? 'bg-white text-primary-green shadow-sm' : 'text-secondary hover:text-primary'}`}>
                            Sign In
                        </button>
                         <button onClick={() => setMode('register')} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${mode === 'register' ? 'bg-white text-primary-green shadow-sm' : 'text-secondary hover:text-primary'}`}>
                            Register
                        </button>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={handleGoogleLogin} 
                            className="w-full bg-white border border-ui-border text-primary font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Icons.GoogleIcon className="w-5 h-5" />
                            <span>Sign In with Google</span>
                        </button>

                         <div className="flex items-center">
                            <hr className="flex-grow border-t border-ui-border"/>
                            <span className="px-2 text-xs text-secondary uppercase">Or</span>
                            <hr className="flex-grow border-t border-ui-border"/>
                        </div>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {mode === 'register' && (
                             <div>
                                <label htmlFor="name-overlay" className="block text-sm font-medium text-secondary mb-1">Full Name</label>
                                <input type="text" name="name" id="name-overlay" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bisi Adebayo" className="w-full bg-white border border-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"/>
                            </div>
                        )}
                        <div>
                            <label htmlFor="email-overlay" className="block text-sm font-medium text-secondary mb-1">Email Address</label>
                            <input type="email" name="email" id="email-overlay" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white border border-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"/>
                        </div>
                        <div>
                            <label htmlFor="password-overlay" className="block text-sm font-medium text-secondary mb-1">Password</label>
                            <input type="password" name="password" id="password-overlay" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition"/>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (mode === 'login' ? 'Sign In' : 'Create Account')}
                            </button>
                        </div>
                    </form>

                     {mode === 'login' && (
                        <div className="text-center mt-4">
                            <a href="#" onClick={(e) => { e.preventDefault(); dispatch({type: 'SHOW_TOAST', payload: { message: "Feature not implemented", type: 'error'}})}} className="text-sm text-primary-green hover:underline">Forgot Password?</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthOverlay;