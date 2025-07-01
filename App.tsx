
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
import ProfileCardOverlay from './components/common/ProfileCardOverlay';
import QuietSpace from './components/common/QuietSpace';

const App: React.FC = () => {
    const { activeChatId, isProfileOverlayVisible, isAuthOverlayVisible, profileCardUser, isQuietSpaceActive } = useAppState();
    const dispatch = useAppDispatch();
    const { width } = useWindowSize();
    const isDesktop = width ? width >= 1024 : false;
    
    const showMainPanelOnMobile = !!activeChatId;
    const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);
    const [isWelcomeCheckComplete, setIsWelcomeCheckComplete] = useState<boolean>(false);

    const isMobileProfileOverlayVisible = !isDesktop && isProfileOverlayVisible && !!activeChatId;


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
    
    if (!isWelcomeCheckComplete) {
        return null;
    }
    
    if (showWelcomeScreen) {
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }

    if (isQuietSpaceActive) {
        return <QuietSpace />;
    }

    return (
        <div className="bg-app-light h-screen w-screen font-sans text-primary overflow-hidden flex flex-col">
            <GlobalHeader />
            <div className="flex flex-1 min-h-0">
                {/* Left Panel (List) - Always visible on desktop, conditionally on mobile */}
                <div className={`
                    w-full lg:w-[350px] lg:flex-shrink-0
                    ${showMainPanelOnMobile ? 'hidden lg:flex' : 'flex'}
                    ${isMobileProfileOverlayVisible ? 'hidden' : 'flex'}
                `}>
                   <ListPanel />
                </div>
                
                {/* Center Panel (Main Content) */}
                <main className={`
                    flex-1 bg-adire-pattern relative min-w-0
                    ${!showMainPanelOnMobile ? 'hidden' : 'flex'} lg:flex
                    ${isMobileProfileOverlayVisible ? 'hidden' : 'flex'}
                `}>
                     <MainPanel />
                </main>
               
                {/* Right Panel (Persistent) - Desktop Sidebar */}
                {isDesktop && (
                    <div className="hidden lg:flex lg:w-[400px] lg:flex-shrink-0">
                         <RightSidebar />
                    </div>
                )}

                {/* Mobile Profile Overlay */}
                {isMobileProfileOverlayVisible && (
                    <div className="fixed inset-0 bg-white z-40 lg:hidden animate-fade-in-down">
                        <RightSidebar />
                    </div>
                )}
            </div>
            
             <div className={`lg:hidden ${isMobileProfileOverlayVisible ? 'hidden' : ''}`}>
                <BottomNavBar />
            </div>
             <Toast />
             {isAuthOverlayVisible && <AuthOverlay />}
             {profileCardUser && <ProfileCardOverlay />}
        </div>
    );
};

export default App;
