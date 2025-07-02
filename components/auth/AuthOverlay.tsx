import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Icons, NIGERIAN_STATES, LGAS } from '../../constants';
import { supabase } from '../../services/supabaseService';

type AuthMode = 'login' | 'register' | 'forgot_password';

const AuthOverlay: React.FC = () => {
    const { authOverlayMode } = useAppState();
    const dispatch = useAppDispatch();
    
    const [mode, setMode] = useState<AuthMode>(authOverlayMode || 'login');
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [lga, setLga] = useState('');
    const [ward, setWard] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);

    useEffect(() => {
        setMode(authOverlayMode || 'login');
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setState('');
        setLga('');
        setWard('');
        setShowConfirmationMessage(false);
        setShowResetConfirmation(false);
    }, [authOverlayMode]);

    const handleClose = () => {
        if (isSubmitting) return;
        dispatch({ type: 'HIDE_AUTH_OVERLAY' });
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            setError(error.message);
        }
        setIsSubmitting(false);
        // On success, Supabase redirects. The listener will handle the rest.
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setShowConfirmationMessage(false);

        if (mode === 'register') {
             if (!state || !lga || !ward) {
                setError("Location fields (State, LGA, Ward) are required.");
                setIsSubmitting(false);
                return;
            }
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        title: 'UNigeria Member',
                        avatar: `https://picsum.photos/seed/${email}/96/96`,
                        state,
                        lga,
                        ward
                    }
                }
            });
            if (error) {
                setError(error.message);
            } else if (data.user?.identities?.length === 0) {
                setError("This email is already taken but unconfirmed. Please check your email for a confirmation link.");
            } else {
                setShowConfirmationMessage(true);
            }
        } else if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                 dispatch({ type: 'SHOW_TOAST', payload: { message: 'Welcome back!' } });
                 handleClose(); // Close the modal on successful login
            }
        } else if (mode === 'forgot_password') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            if (error) {
                setError(error.message);
            }
            setShowResetConfirmation(true); // Show confirmation regardless of error to prevent email enumeration
        }
        setIsSubmitting(false);
    };

    if (showConfirmationMessage) {
        return (
            <div 
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-down"
                onClick={handleClose}
            >
                <div 
                    className="bg-white dark:bg-dark-primary rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
                    onClick={e => e.stopPropagation()}
                >
                    <Icons.CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                    <h2 className="text-2xl font-bold mt-4 text-primary dark:text-dark-text-primary">Check your email</h2>
                    <p className="text-secondary dark:text-dark-text-secondary mt-2">
                        We've sent a confirmation link to <strong>{email}</strong>. Please click the link to complete your registration.
                    </p>
                    <button onClick={handleClose} className="mt-6 w-full bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-down"
            onClick={handleClose}
        >
            <div 
                className="bg-white dark:bg-dark-primary rounded-2xl shadow-2xl w-full max-w-md relative transition-all duration-300"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-secondary rounded-full">
                    <Icons.XMark className="w-6 h-6" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <Icons.FlyingFlagLogo className="w-12 h-12 mx-auto" />
                         <h2 className="text-2xl font-bold mt-2 text-primary dark:text-dark-text-primary">
                            {mode === 'login' && 'Welcome Back'}
                            {mode === 'register' && 'Create Your Account'}
                            {mode === 'forgot_password' && 'Reset Password'}
                        </h2>
                        <p className="text-sm text-secondary dark:text-dark-text-secondary">
                             {mode === 'login' && 'Sign in to continue your journey.'}
                             {mode === 'register' && 'Join the conversation.'}
                             {mode === 'forgot_password' && 'Enter your email to receive a reset link.'}
                        </p>
                    </div>
                    
                    {mode !== 'forgot_password' && (
                        <>
                             <div className="flex items-center bg-app-light dark:bg-dark-app-light rounded-lg p-1 mb-6">
                                <button onClick={() => setMode('login')} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${mode === 'login' ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' : 'text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary'}`}>
                                    Sign In
                                </button>
                                <button onClick={() => setMode('register')} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${mode === 'register' ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' : 'text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary'}`}>
                                    Register
                                </button>
                            </div>

                            <div className="space-y-4">
                                <button 
                                    onClick={handleGoogleLogin} 
                                    className="w-full bg-white dark:bg-dark-app-light border border-ui-border dark:border-dark-ui-border text-primary dark:text-dark-text-primary font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-secondary transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Icons.GoogleIcon className="w-5 h-5" />
                                    <span>Sign In with Google</span>
                                </button>

                                <div className="flex items-center">
                                    <hr className="flex-grow border-t border-ui-border dark:border-dark-ui-border"/>
                                    <span className="px-2 text-xs text-secondary dark:text-dark-text-secondary uppercase">Or</span>
                                    <hr className="flex-grow border-t border-ui-border dark:border-dark-ui-border"/>
                                </div>
                            </div>
                        </>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label htmlFor="name-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Full Name</label>
                                    <input type="text" name="name" id="name-overlay" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bisi Adebayo" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                </div>
                                <div>
                                    <label htmlFor="state-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">State</label>
                                    <select name="state" id="state-overlay" required value={state} onChange={e => setState(e.target.value)} className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition">
                                        <option value="">Select your state</option>
                                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="lga-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">LGA</label>
                                        <input type="text" name="lga" id="lga-overlay" required value={lga} onChange={e => setLga(e.target.value)} placeholder="e.g. Ikeja" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                    </div>
                                    <div>
                                        <label htmlFor="ward-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Ward</label>
                                        <input type="text" name="ward" id="ward-overlay" required value={ward} onChange={e => setWard(e.target.value)} placeholder="e.g. Ward C" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                    </div>
                                </div>
                            </>
                        )}
                        {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && !showResetConfirmation && (
                             <div>
                                <label htmlFor="email-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Email Address</label>
                                <input type="email" name="email" id="email-overlay" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                            </div>
                        )}
                        {(mode === 'login' || mode === 'register') && (
                            <div>
                                <label htmlFor="password-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Password</label>
                                <input type="password" name="password" id="password-overlay" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        
                        {showResetConfirmation ? (
                            <p className="text-sm text-center text-secondary dark:text-dark-text-secondary p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
                                If an account exists for <strong>{email}</strong>, you will receive an email with a password reset link shortly.
                            </p>
                        ) : (
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
                                            {mode === 'login' ? 'Signing In...' : mode === 'register' ? 'Creating Account...' : 'Sending Link...'}
                                        </>
                                    ) : (
                                        mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'
                                    )}
                                </button>
                            </div>
                        )}
                         
                        {mode === 'login' && !showResetConfirmation && (
                             <div className="text-center mt-4">
                                <button onClick={() => setMode('forgot_password')} className="text-sm text-secondary dark:text-dark-text-secondary hover:underline">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthOverlay;