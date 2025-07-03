
import React, { useState, useEffect } from 'react';
import ListPanel from './components/layout/ListPanel';
import MainPanel from './components/layout/MainPanel';
import BottomNavBar from './components/layout/BottomNavBar';
import Toast from './components/common/Toast';
import RightSidebar from './components/layout/RightSidebar';
import GlobalHeader from './components/layout/GlobalHeader';
import AuthOverlay from './components/auth/AuthOverlay';
import { useAppState, useAppDispatch } from './context/AppContext';
import { useWindowSize } from './hooks/useWindowSize';
import QuietSpace from './components/common/QuietSpace';
import { Icons } from './constants';
import CreateAnnouncementScreen from './components/unigerians/CreateAnnouncementScreen';
import CreateReportScreen from './components/forums/CreateTopicScreen';
import CreateReportModal from './components/forums/CreateReportModal';


const OfflineBanner: React.FC = () => (
    <div className="bg-red-600 text-white text-center text-sm py-1 font-semibold">
        You are currently offline. Some features may not be available.
    </div>
);


const App: React.FC = () => {
    const { 
        activeChatId, 
        isAuthOverlayVisible, 
        sidebarProfileId, 
        isQuietSpaceActive, 
        isLoadingAuth,
        isCreatingReport,
        reportCreationCategoryId,
        isCreateReportModalOpen
    } = useAppState();
    const dispatch = useAppDispatch();
    const { width } = useWindowSize();
    const isDesktop = width ? width >= 1024 : false;
    
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);


    // New, clearer layout logic for mobile
    const isChatActiveOnMobile = !isDesktop && !!activeChatId;
    const isProfileActiveOnMobile = !isDesktop && !!sidebarProfileId;
    const isListActiveOnMobile = !isChatActiveOnMobile && !isProfileActiveOnMobile;


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

    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 bg-app-light dark:bg-dark-primary z-50 flex items-center justify-center">
              <Icons.FlyingFlagLogo className="w-24 h-24 animate-pulse" />
            </div>
        );
    }

    if (isQuietSpaceActive) {
        return <QuietSpace />;
    }
    
    if (isCreatingAnnouncement) {
        return <CreateAnnouncementScreen onCancel={() => setIsCreatingAnnouncement(false)} />;
    }

    if (isCreatingReport && reportCreationCategoryId) {
        return <CreateReportScreen categoryId={reportCreationCategoryId} onCancel={() => dispatch({ type: 'CANCEL_CREATE_REPORT' })} />;
    }

    return (
        <div className="bg-app-light dark:bg-dark-primary h-screen w-screen font-sans text-primary dark:text-dark-text-primary overflow-hidden flex flex-col">
            <GlobalHeader />
            {!isOnline && <OfflineBanner />}
            <div className="flex flex-1 min-h-0">
                {/* Left Panel (List) */}
                <div className={`
                    w-full lg:w-[350px] lg:flex-shrink-0
                    ${isDesktop || isListActiveOnMobile ? 'flex' : 'hidden'}
                `}>
                   <ListPanel onStartCreateAnnouncement={() => setIsCreatingAnnouncement(true)} />
                </div>
                
                {/* Center Panel (Main Content / Chat) */}
                <main className={`
                    flex-1 bg-white dark:bg-dark-secondary relative min-w-0
                    ${isDesktop || isChatActiveOnMobile ? 'flex' : 'hidden'}
                `}>
                     <MainPanel />
                </main>
               
                {/* Right Panel (Desktop Sidebar) */}
                {isDesktop && (
                    <div className="hidden lg:flex lg:w-[400px] lg:flex-shrink-0">
                         <RightSidebar />
                    </div>
                )}
                
                {/* Mobile Profile Overlay */}
                {isProfileActiveOnMobile && (
                     <div className="fixed inset-0 bg-white dark:bg-dark-primary z-40 lg:hidden animate-fade-in-down">
                        <RightSidebar />
                    </div>
                )}
            </div>
            
             <div className={`lg:hidden ${isListActiveOnMobile ? '' : 'hidden'}`}>
                <BottomNavBar />
            </div>
             <Toast />
             {isAuthOverlayVisible && <AuthOverlay />}
             {isCreateReportModalOpen && <CreateReportModal />}
        </div>
    );
};

export default App;
