import React, { useMemo } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import { Icons } from '../../constants';
import { getGreeting } from '../../utils/getGreeting';
import { getCivicRank } from '../../utils/getCivicRank';
import DashboardCard from './DashboardCard';
import ReportListItem from '../list/TopicListItem';
import AnnouncementListItem from '../unigerians/AnnouncementListItem';
import LeaderboardListItem from '../leaderboard/LeaderboardListItem';
import { supabase } from '../../services/supabaseService';
import { Report, TownHallSubTab } from '../../types';

const ranks = [
    { name: 'Newcomer', minScore: 0 },
    { name: 'Community Voice', minScore: 50 },
    { name: 'Active Citizen', minScore: 150 },
    { name: 'Local Champion', minScore: 400 },
    { name: 'Pillar of the Community', minScore: 1000 }
];

const UnauthenticatedDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
<<<<<<< HEAD
    const handleLogin = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'login' });
    const handleRegister = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'register' });
    
    const featureCards = [
        { title: "Chat with Leaders", description: "Engage with digital personas of Nigerian leaders, past and present.", icon: Icons.UserGroup },
        { title: "Explore Nigeria", description: "Discover the rich history and culture of all 36 states and the FCT.", icon: Icons.Map },
        { title: "Join Town Halls", description: "Participate in civic discussions, file reports, and track their progress.", icon: Icons.Landmark },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-app-light dark:bg-dark-primary text-center">
            <Icons.FlyingFlagLogo className="w-24 h-24" />
            <h1 className="text-4xl font-bold mt-4 text-primary dark:text-dark-text-primary">Welcome to UNigeria</h1>
            <p className="text-lg text-secondary dark:text-dark-text-secondary mt-2 max-w-2xl">
                A new platform for civic engagement. Start conversations with digital personas of leaders, explore states, and participate in forums to build a better Nigeria.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl">
                {featureCards.map(feature => {
                    const Icon = feature.icon;
                    return (
                        <div key={feature.title} className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-sm border border-ui-border dark:border-dark-ui-border">
                            <Icon className="w-10 h-10 mx-auto text-primary-green"/>
                            <h3 className="text-lg font-semibold mt-4 text-primary dark:text-dark-text-primary">{feature.title}</h3>
                            <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-12 space-y-4 max-w-md w-full">
                <button onClick={handleRegister} className="w-full bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all">Get Started</button>
                <p className="text-sm text-secondary dark:text-dark-text-secondary">
                    Already have an account? <button onClick={handleLogin} className="font-semibold text-primary-green hover:underline">Sign In</button>
                </p>
=======
    const handleLogin = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'login' });
    const handleRegister = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'register' });
    
    const featureCards = [
        { title: "Chat with Leaders", description: "Engage with digital personas of Nigerian leaders, past and present.", icon: Icons.UserGroup },
        { title: "Explore Nigeria", description: "Discover the rich history and culture of all 36 states and the FCT.", icon: Icons.Map },
        { title: "Join Town Halls", description: "Participate in civic discussions, file reports, and track their progress.", icon: Icons.Landmark },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-app-light dark:bg-dark-primary text-center">
            <Icons.FlyingFlagLogo className="w-24 h-24" />
            <h1 className="text-4xl font-bold mt-4 text-primary dark:text-dark-text-primary">Welcome to UNigeria</h1>
            <p className="text-lg text-secondary dark:text-dark-text-secondary mt-2 max-w-2xl">
                A new platform for civic engagement. Start conversations with digital personas of leaders, explore states, and participate in forums to build a better Nigeria.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl">
                {featureCards.map(feature => {
                    const Icon = feature.icon;
                    return (
                        <div key={feature.title} className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-sm border border-ui-border dark:border-dark-ui-border">
                            <Icon className="w-10 h-10 mx-auto text-primary-green"/>
                            <h3 className="text-lg font-semibold mt-4 text-primary dark:text-dark-text-primary">{feature.title}</h3>
                            <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-12 space-y-4 max-w-md w-full">
                <button onClick={handleRegister} className="w-full bg-primary-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all">Get Started</button>
                <p className="text-sm text-secondary dark:text-dark-text-secondary">
                    Already have an account? <button onClick={handleLogin} className="font-semibold text-primary-green hover:underline">Sign In</button>
                </p>
>>>>>>> master
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { 
        isAuthenticated, 
        userProfile, 
        reports, 
        announcements,
        leaderboardUsers,
        townHallCategories
    } = useAppState();
    const dispatch = useAppDispatch();
    const greeting = getGreeting();

    const civicRank = getCivicRank(userProfile.reputation_score || 0);
    const nextRankIndex = ranks.findIndex(r => r.name === civicRank.name) + 1;
    const nextRank = nextRankIndex < ranks.length ? ranks[nextRankIndex] : null;
    const progress = nextRank ? (((userProfile.reputation_score || 0) - civicRank.minScore) / (nextRank.minScore - civicRank.minScore)) * 100 : 100;
    
    const communityData = useMemo(() => {
        if (!userProfile.state || !userProfile.lga) return { hotReport: null, latestAnnouncement: null };
        
        const myLgaReports = reports.filter(r => r.location?.lga === userProfile.lga && r.location?.state === userProfile.state);
        const hotReport = myLgaReports.length > 0 ? [...myLgaReports].sort((a,b) => b.reply_count - a.reply_count)[0] : null;
        
        const myLgaAnnouncements = announcements.filter(a => a.lga === userProfile.lga && a.state === userProfile.state);
        const latestAnnouncement = myLgaAnnouncements.length > 0 ? myLgaAnnouncements[0] : null; // Already sorted by date

        return { hotReport, latestAnnouncement };
    }, [userProfile.state, userProfile.lga, reports, announcements]);
    
    const nationalPulseData = useMemo(() => {
        const nationalHotReport = reports.length > 0 ? [...reports].sort((a,b) => b.reply_count - a.reply_count)[0] : null;
        const topLeader = leaderboardUsers.length > 0 ? leaderboardUsers[0] : null;
        return { nationalHotReport, topLeader };
    }, [reports, leaderboardUsers]);

    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: ListPanelTab.TOWN_HALLS });
        dispatch({ type: 'SET_ACTIVE_TOWNHALL_CATEGORY', payload: report.category_id });
        setTimeout(() => dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id }), 50);
    };

    if (!isAuthenticated) {
        return <UnauthenticatedDashboard />;
    }

    return (
        <div className="w-full h-full p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary dark:text-dark-text-primary">{greeting}, {userProfile.name}!</h1>
                    <p className="text-secondary dark:text-dark-text-secondary mt-1">Here's what's happening in your community and across Nigeria.</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Civic Rank Card */}
                        <DashboardCard title="Your Civic Rank" icon={<civicRank.icon className="w-6 h-6 text-primary-green" />}>
                           <div className="flex items-center space-x-4">
                               <img src={userProfile.avatar} alt="You" className="w-16 h-16 rounded-full"/>
                               <div>
                                   <p className="font-bold text-lg text-primary dark:text-dark-text-primary">{civicRank.name}</p>
                                   <p className="text-sm text-secondary dark:text-dark-text-secondary">{userProfile.reputation_score || 0} Reputation Points</p>
                               </div>
                           </div>
                           {nextRank && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-secondary dark:text-dark-text-secondary mb-1">
                                    <span>Progress to {nextRank.name}</span>
                                    <span>{nextRank.minScore} pts</span>
                                </div>
                                <div className="w-full bg-app-light dark:bg-dark-app-light rounded-full h-2.5">
                                    <div className="bg-primary-green h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                </div>
                            </div>
                           )}
                        </DashboardCard>
                        
                        {/* My Community Card */}
                         {userProfile.lga ? (
                            <DashboardCard title={`In Your Community: ${userProfile.lga}`} icon={<Icons.Map className="w-6 h-6 text-primary-green"/>}>
                                {communityData.hotReport ? (
                                    <>
                                        <h4 className="font-semibold text-sm mb-2 text-secondary dark:text-dark-text-secondary">Most Active Report</h4>
                                        <ReportListItem report={communityData.hotReport} onClick={() => handleReportClick(communityData.hotReport!)} showCategory categoryName={townHallCategories.find(c => c.id === communityData.hotReport?.category_id)?.name} />
                                    </>
                                ) : <p className="text-sm text-secondary dark:text-dark-text-secondary text-center p-4">No reports from your LGA yet. Be the first to file one!</p>}

                                {communityData.latestAnnouncement && (
                                    <>
                                        <div className="border-t border-ui-border dark:border-dark-ui-border my-4"></div>
                                        <h4 className="font-semibold text-sm mb-2 text-secondary dark:text-dark-text-secondary">Latest Announcement</h4>
                                        <AnnouncementListItem announcement={communityData.latestAnnouncement} />
                                    </>
                                )}
                            </DashboardCard>
                         ) : (
                            <DashboardCard title="National Pulse" icon={<Icons.FlyingFlagLogo className="w-6 h-6"/>}>
                                 <h4 className="font-semibold text-sm mb-2 text-secondary dark:text-dark-text-secondary">Hottest Report Nationwide</h4>
                                 {nationalPulseData.nationalHotReport ? <ReportListItem report={nationalPulseData.nationalHotReport} onClick={() => handleReportClick(nationalPulseData.nationalHotReport!)} showCategory categoryName={townHallCategories.find(c => c.id === nationalPulseData.nationalHotReport?.category_id)?.name} /> : <p className="text-sm text-secondary dark:text-dark-text-secondary text-center p-4">No reports found.</p>}
                            </DashboardCard>
                         )}
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Quick Actions Card */}
                        <DashboardCard title="Quick Actions" icon={<Icons.Sparkles className="w-6 h-6 text-primary-green"/>}>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => dispatch({type: 'SET_ACTIVE_TAB', payload: ListPanelTab.TOWN_HALLS})} className="text-center p-3 bg-app-light dark:bg-dark-app-light rounded-lg hover:bg-primary-green/10 transition-colors">
                                    <Icons.DocumentText className="w-8 h-8 mx-auto text-primary-green"/>
                                    <span className="text-xs font-semibold mt-2 block">File a Report</span>
                                </button>
                                <button onClick={() => dispatch({type: 'SHOW_SIDEBAR_PROFILE', payload: userProfile.id!})} className="text-center p-3 bg-app-light dark:bg-dark-app-light rounded-lg hover:bg-primary-green/10 transition-colors">
                                    <Icons.User className="w-8 h-8 mx-auto text-primary-green"/>
                                    <span className="text-xs font-semibold mt-2 block">My Profile</span>
                                </button>
                                 <button onClick={() => dispatch({type: 'SET_ACTIVE_TAB', payload: ListPanelTab.LEADERBOARD})} className="text-center p-3 bg-app-light dark:bg-dark-app-light rounded-lg hover:bg-primary-green/10 transition-colors">
                                    <Icons.Award className="w-8 h-8 mx-auto text-primary-green"/>
                                    <span className="text-xs font-semibold mt-2 block">Leaderboard</span>
                                </button>
                                 <button onClick={() => {
                                    dispatch({type: 'SET_ACTIVE_TAB', payload: ListPanelTab.TOWN_HALLS});
                                    dispatch({type: 'SET_TOWNHALL_SUB_TAB', payload: TownHallSubTab.CANDIDATES});
                                 }} className="text-center p-3 bg-app-light dark:bg-dark-app-light rounded-lg hover:bg-primary-green/10 transition-colors">
                                    <Icons.ShieldCheck className="w-8 h-8 mx-auto text-primary-green"/>
                                    <span className="text-xs font-semibold mt-2 block">Candidates</span>
                                </button>
                            </div>
                        </DashboardCard>

                        {/* Leaderboard Peek */}
                         <DashboardCard title="Top Citizen" icon={<Icons.Award className="w-6 h-6 text-primary-green"/>}>
                            {nationalPulseData.topLeader ? <LeaderboardListItem user={nationalPulseData.topLeader} rank={1} /> : <p className="text-sm text-center p-2 text-secondary dark:text-dark-text-secondary">Leaderboard is empty.</p>}
                        </DashboardCard>
                    </div>

                </div>
            </div>
        </div>
    );
};

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> master
