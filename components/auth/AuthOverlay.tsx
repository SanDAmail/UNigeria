import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Icons } from '../../constants';
import { NIGERIAN_LOCATIONS } from '../../data/locations';
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
    
    // Registration step state
    const [step, setStep] = useState(1);

    const NIGERIAN_STATES = Object.keys(NIGERIAN_LOCATIONS).sort();

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
        setStep(1);
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
    };

    const handleNextStep = () => {
        if (mode === 'register') {
            if (!name || !email || !password) {
                setError("Please fill in all credential fields.");
                return;
            }
             if (password.length < 6) {
                setError("Password must be at least 6 characters long.");
                return;
            }
        }
        setError('');
        setStep(2);
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
                 handleClose();
            }
        } else if (mode === 'forgot_password') {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            if (error) {
                setError(error.message);
            }
            setShowResetConfirmation(true);
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
                            {mode === 'register' && `Create Account (${step}/2)`}
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
                                <button onClick={() => { setMode('login'); setStep(1); }} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${mode === 'login' ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' : 'text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary'}`}>
                                    Sign In
                                </button>
                                <button onClick={() => { setMode('register'); setStep(1); }} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${mode === 'register' ? 'bg-white dark:bg-dark-primary text-primary-green shadow-sm' : 'text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary'}`}>
                                    Register
                                </button>
                            </div>

                             {step === 1 && (
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
                             )}
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {error && <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
                        
                        {mode === 'register' && step === 1 && (
                            <div className="animate-fade-in-down space-y-4">
                                <div>
                                    <label htmlFor="name-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Full Name</label>
                                    <input type="text" name="name" id="name-overlay" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bisi Adebayo" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                </div>
                                <div>
                                    <label htmlFor="email-register-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Email Address</label>
                                    <input type="email" name="email" id="email-register-overlay" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                </div>
                                <div>
                                    <label htmlFor="password-register-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Password</label>
                                    <input type="password" name="password" id="password-register-overlay" required value={password} onChange={e => setPassword(e.target.value)} placeholder="•••••••• (min. 6 characters)" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                </div>
                                <div>
                                    <button type="button" onClick={handleNextStep} className="w-full mt-2 bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all">Next</button>
                                </div>
                            </div>
                        )}

                        {mode === 'register' && step === 2 && (
                             <div className="animate-fade-in-down space-y-4">
                                <div>
                                    <label htmlFor="state-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">State</label>
                                    <select name="state" id="state-overlay" required value={state} onChange={e => { setState(e.target.value); setLga(''); setWard(''); }} className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition">
                                        <option value="">Select your state</option>
                                        {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="lga-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">LGA</label>
                                    <select name="lga" id="lga-overlay" required value={lga} onChange={e => { setLga(e.target.value); setWard(''); }} disabled={!state} className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition disabled:bg-gray-100 dark:disabled:bg-dark-app-light">
                                        <option value="">Select LGA</option>
                                        {state && NIGERIAN_LOCATIONS[state] && Object.keys(NIGERIAN_LOCATIONS[state]).map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="ward-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Ward</label>
                                    <select name="ward" id="ward-overlay" required value={ward} onChange={e => setWard(e.target.value)} disabled={!lga} className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition disabled:bg-gray-100 dark:disabled:bg-dark-app-light">
                                        <option value="">Select Ward</option>
                                        {state && lga && NIGERIAN_LOCATIONS[state]?.[lga]?.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                     <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-200 dark:bg-dark-secondary text-primary dark:text-dark-text-primary font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-opacity-80 transition-all">Back</button>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400">Create Account</button>
                                </div>
                            </div>
                        )}

                        {mode === 'login' && (
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="email-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Email Address</label>
                                    <input type="email" name="email" id="email-overlay" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                </div>
                                <div>
                                    <label htmlFor="password-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Password</label>
                                    <input type="password" name="password" id="password-overlay" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                </div>
                                 <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400">
                                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                                </button>
                                <div className="text-center mt-4">
                                    <button type="button" onClick={() => setMode('forgot_password')} className="text-sm text-secondary dark:text-dark-text-secondary hover:underline">
                                        Forgot password?
                                    </button>
                                </div>
                             </div>
                        )}
                        
                        {mode === 'forgot_password' && (
                            <div>
                                {showResetConfirmation ? (
                                    <p className="text-sm text-center text-secondary dark:text-dark-text-secondary p-4 bg-app-light dark:bg-dark-app-light rounded-lg">
                                        If an account exists for <strong>{email}</strong>, you will receive an email with a password reset link shortly.
                                    </p>
                                ) : (
                                    <>
                                        <div>
                                            <label htmlFor="email-forgot-overlay" className="block text-sm font-medium text-secondary dark:text-dark-text-secondary mb-1">Email Address</label>
                                            <input type="email" name="email" id="email-forgot-overlay" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-green transition placeholder:text-secondary dark:placeholder:text-dark-text-secondary"/>
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all disabled:bg-gray-400">
                                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                        <div className="text-center mt-4">
                                            <button type="button" onClick={() => setMode('login')} className="text-sm text-secondary dark:text-dark-text-secondary hover:underline">
                                                Back to Sign In
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthOverlay;
