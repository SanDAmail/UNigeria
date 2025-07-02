

import React, { useState, useEffect } from 'react';
import ListPanel from './components/layout/ListPanel';
import MainPanel from './components/layout/MainPanel';
import BottomNavBar from './components/layout/BottomNavBar';
import Toast from './components/common/Toast';
import WelcomeScreen from './components/common/WelcomeScreen';
import RightSidebar from './components/layout/RightSidebar';
import GlobalHeader from './components/layout/GlobalHeader';
import AuthOverlay from './components/auth/AuthOverlay';
import { useAppState, useAppDispatch } from './context/AppContext';
import { useWindowSize } from './hooks/useWindowSize';
import QuietSpace from './components/common/QuietSpace';
import { Icons } from './constants';

const OfflineBanner: React.FC = () => (
    <div className="bg-red-600 text-white text-center text-sm py-1 font-semibold">
        You are currently offline. Some features may not be available.
    </div>
);


const App: React.FC = () => {
    const { activeChatId, isAuthOverlayVisible, sidebarProfileId, isQuietSpaceActive, isLoadingAuth } = useAppState();
    const dispatch = useAppDispatch();
    const { width } = useWindowSize();
    const isDesktop = width ? width >= 1024 : false;
    
    const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);
    const [isWelcomeCheckComplete, setIsWelcomeCheckComplete] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);


    // The right sidebar acts as an overlay on mobile if either a chat or a profile is active.
    const isRightSidebarOverlayVisible = !isDesktop && (!!activeChatId || !!sidebarProfileId);
    const showListPanel = !isRightSidebarOverlayVisible;

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        try {
            const hasSeen = localStorage.getItem('hasSeenWelcomeScreen');
            if (!hasSeen) {
                setShowWelcomeScreen(true);
            }
        } catch (e) {
            console.error("Could not access localStorage", e);
        } finally {
            setIsWelcomeCheckComplete(true);
        }

        // Check for API Key on startup
        if (!process.env.API_KEY) {
            dispatch({ 
                type: 'SHOW_TOAST', 
                payload: { 
                    message: 'API Key is not configured. AI features are disabled.', 
                    type: 'error' 
                } 
            });
        }

    }, [dispatch]);

    const handleWelcomeComplete = () => {
        try {
            localStorage.setItem('hasSeenWelcomeScreen', 'true');
        } catch (e) {
             console.error("Could not access localStorage", e);
        }
        setShowWelcomeScreen(false);
    };
    
    if (isLoadingAuth || !isWelcomeCheckComplete) {
        return (
            <div className="fixed inset-0 bg-app-light dark:bg-dark-primary z-50 flex items-center justify-center">
              <Icons.FlyingFlagLogo className="w-24 h-24 animate-pulse" />
            </div>
        );
    }
    
    if (showWelcomeScreen) {
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }

    if (isQuietSpaceActive) {
        return <QuietSpace />;
    }

    return (
        <div className="bg-app-light dark:bg-dark-primary h-screen w-screen font-sans text-primary dark:text-dark-text-primary overflow-hidden flex flex-col">
            <GlobalHeader />
            {!isOnline && <OfflineBanner />}
            <div className="flex flex-1 min-h-0">
                {/* Left Panel (List) - Always visible on desktop, conditionally on mobile */}
                <div className={`
                    w-full lg:w-[350px] lg:flex-shrink-0
                    ${showListPanel ? 'flex' : 'hidden lg:flex'}
                `}>
                   <ListPanel />
                </div>
                
                {/* Center Panel (Main Content) - Shown on desktop or if a chat/profile is active on mobile */}
                <main className={`
                    flex-1 bg-adire-pattern relative min-w-0
                    ${!showListPanel ? 'flex' : 'hidden lg:flex'}
                `}>
                     <MainPanel />
                </main>
               
                {/* Right Panel (Persistent) - Desktop Sidebar */}
                {isDesktop && (
                    <div className="hidden lg:flex lg:w-[400px] lg:flex-shrink-0">
                         <RightSidebar />
                    </div>
                )}
                
                {/* Mobile Sidebar as Overlay */}
                {isRightSidebarOverlayVisible && (
                     <div className="fixed inset-0 bg-white dark:bg-dark-primary z-40 lg:hidden animate-fade-in-down">
                        <RightSidebar />
                    </div>
                )}
            </div>
            
             <div className={`lg:hidden ${isRightSidebarOverlayVisible ? 'hidden' : ''}`}>
                <BottomNavBar />
            </div>
             <Toast />
             {isAuthOverlayVisible && <AuthOverlay />}
        </div>
    );
};

export default App;