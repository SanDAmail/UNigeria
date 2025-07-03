

import React, { useEffect, useState } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import { Profile, PersonSubtype, GroundingChunk, PersonaType, UserProfile, Report, TownHallSubTab } from '../../types';
import { getProfile } from '../../personas/personas';
import { generateGroundedText, generateArbitraryJson } from '../../services/geminiService';
import { Icons, ALL_PROFILES } from '../../constants';
import ProfileSection from '../profile/ProfileSection';
import ManifestoSection from '../profile/ManifestoSection';
import { useWindowSize } from '../../hooks/useWindowSize';
import ChatListItem from '../list/ChatListItem';
import { getUserProfileById, getReports, getEndorsementsForUser, addEndorsement } from '../../services/dbService';
import ReportListItem from '../list/TopicListItem';
import { supabase } from '../../services/supabaseService';
import { getCivicRank } from '../../utils/getCivicRank';
import ReputationActivityFeed from '../profile/ReputationActivityFeed';

const SidebarWrapper: React.FC<{title: string; children: React.ReactNode; onBack?: () => void}> = ({ title, children, onBack }) => {
    const { width } = useWindowSize();
    const isDesktop = width ? width >= 1024 : false;

    return (
        <div className="h-full w-full flex flex-col bg-white dark:bg-dark-primary">
            <header className="p-4 flex-shrink-0 border-b border-ui-border dark:border-dark-ui-border flex items-center space-x-3">
                {!isDesktop && onBack && (
                     <button onClick={onBack} className="p-1 text-secondary dark:text-dark-text-secondary">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h2 className="font-bold text-lg text-primary dark:text-dark-text-primary">{title}</h2>
            </header>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 min-w-0">
                {children}
            </div>
        </div>
    );
}

const NewsSection: React.FC<{ profileName: string }> = ({ profileName }) => {
    const [summarizedNews, setSummarizedNews] = useState<{ url: string; shortHeadline: string; originalTitle: string; }[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndSummarizeNews = async () => {
            setIsLoading(true);
            setSummarizedNews(null);
            try {
                // Step 1: Get grounded search results
                const groundedResponse = await generateGroundedText(`latest news about ${profileName}`);
                const validChunks = (groundedResponse.groundingChunks || []).filter(c => c.web && c.web.uri && c.web.title);

                if (validChunks.length === 0) {
                    setSummarizedNews([]);
                    setIsLoading(false);
                    return;
                }

                // Step 2: Create prompt to summarize titles
                const articlesToSummarize = validChunks.map(c => ({ url: c.web!.uri!, title: c.web!.title! }));
                const prompt = `Based on the following news article titles, generate a short, optimized, and engaging headline for each (max 8 words). Return the result as a valid JSON array of objects, where each object has "url" (the original URL) and "shortHeadline" keys.

Articles:
${JSON.stringify(articlesToSummarize)}

Respond ONLY with the JSON array.`;

                // Step 3: Call AI to get summarized headlines
                try {
                    const summaries = await generateArbitraryJson(prompt);
                    const finalNews = validChunks.map(chunk => {
                        const summaryObj = Array.isArray(summaries) ? summaries.find(s => s.url === chunk.web!.uri) : null;
                        return {
                            url: chunk.web!.uri!,
                            shortHeadline: summaryObj ? summaryObj.shortHeadline : chunk.web!.title!,
                            originalTitle: chunk.web!.title!
                        };
                    });
                    setSummarizedNews(finalNews);
                } catch (e) {
                    console.error("Failed to summarize headlines, falling back to original titles.", e);
                    const fallbackNews = validChunks.map(c => ({ url: c.web!.uri!, shortHeadline: c.web!.title!, originalTitle: c.web!.title! }));
                    setSummarizedNews(fallbackNews);
                }

            } catch (error) {
                console.error(error);
                setSummarizedNews([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndSummarizeNews();
    }, [profileName]);

    return (
        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-primary-green mb-3">In The News</h2>
            {isLoading ? (
                <div className="space-y-3">
                    <div className="shimmer h-4 w-full rounded"></div>
                    <div className="shimmer h-4 w-5/6 rounded"></div>
                    <div className="shimmer h-4 w-full rounded"></div>
                </div>
            ) : (
                summarizedNews && summarizedNews.length > 0 ? (
                    <ul className="space-y-2">
                        {summarizedNews.slice(0, 5).map((newsItem, index) => (
                            <li key={index} className="flex items-start">
                                <Icons.Link className="w-4 h-4 text-secondary dark:text-dark-text-secondary mt-1 mr-2 flex-shrink-0" />
                                <a
                                    href={newsItem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-secondary dark:text-dark-text-secondary hover:text-primary-green hover:underline break-words"
                                    title={newsItem.originalTitle}
                                >
                                    {newsItem.shortHeadline}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-secondary dark:text-dark-text-secondary">Could not fetch recent news.</p>
                )
            )}
        </div>
    );
};

const InfoRow: React.FC<{ label: string; value: string | undefined; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, icon: IconComponent }) => {
    if (!value) return null;
    const isLink = value.startsWith('http') || value.startsWith('www');
    
    return (
        <div className="flex items-start text-sm py-2">
            <IconComponent className="w-5 h-5 text-primary-green mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <p className="font-semibold text-primary dark:text-dark-text-primary">{label}</p>
                {isLink ? (
                    <a href={`https://${value.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-secondary dark:text-dark-text-secondary hover:underline break-all">{value}</a>
                ) : (
                    <p className="text-secondary dark:text-dark-text-secondary break-words">{value}</p>
                )}
            </div>
        </div>
    )
};

const InfoListSection: React.FC<{ title: string; items: string[] | undefined; icon: React.ComponentType<{ className?: string }> }> = ({ title, items, icon: IconComponent }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center">
                <IconComponent className="w-6 h-6 mr-2 flex-shrink-0" />
                <span>{title}</span>
            </h2>
            <ul className="space-y-1.5">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start text-sm text-secondary dark:text-dark-text-secondary">
                        <span className="text-primary-green mr-2 mt-1 text-xs">◆</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const QuoteListSection: React.FC<{ title: string; items: string[] | undefined }> = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center">
                <Icons.Quote className="w-6 h-6 mr-2 flex-shrink-0" />
                <span>{title}</span>
            </h2>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <blockquote key={index} className="border-l-4 border-accent-gold pl-4 text-secondary dark:text-dark-text-secondary italic">
                        "{item}"
                    </blockquote>
                ))}
            </div>
        </div>
    );
};

const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const PersonDetailsSection: React.FC<{ profile: Profile }> = ({ profile }) => {
    const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;

    const details = [
        { label: "Born", value: profile.dateOfBirth ? `${new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}${age ? ` (age ${age})` : ''}` : undefined },
        { label: "Profession", value: profile.profession },
        { label: "State of Origin", value: profile.stateOfOrigin },
        { label: "City", value: profile.city || (profile.hometown ? profile.hometown.split(',')[0] : undefined) },
    ].filter(d => d.value);

    if (details.length === 0) return null;

    return (
         <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
             <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center">
                <Icons.User className="w-6 h-6 mr-2" />
                Bio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {details.map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-xs text-secondary dark:text-dark-text-secondary font-medium uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-primary dark:text-dark-text-primary break-words">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
};


const StatCard: React.FC<{ label: string; value: string | undefined; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, icon: IconComponent }) => {
    if (!value) return null;
    return (
        <div className="bg-app-light dark:bg-dark-app-light rounded-lg p-3 flex items-center space-x-3">
            <div className="bg-primary-green/10 p-2 rounded-full">
                <IconComponent className="w-5 h-5 text-primary-green" />
            </div>
            <div>
                <p className="text-sm font-bold text-primary dark:text-dark-text-primary">{value}</p>
                <p className="text-xs text-secondary dark:text-dark-text-secondary">{label}</p>
            </div>
        </div>
    );
};

type StateProfileTab = 'overview' | 'economy' | 'governance' | 'culture';

const StateProfileDisplay: React.FC<{profile: Profile; onBack?: () => void}> = ({ profile, onBack }) => {
    const [activeTab, setActiveTab] = useState<StateProfileTab>('overview');
    
    const tabs: {id: StateProfileTab, label: string}[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'economy', label: 'Economy' },
        { id: 'governance', label: 'Governance' },
        { id: 'culture', label: 'Culture & Sites' },
    ];

    return (
         <SidebarWrapper title={`${profile.name} State`} onBack={onBack}>
            <div className="text-center -mt-2">
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-dark-primary shadow-lg" />
                <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
                <p className="text-secondary dark:text-dark-text-secondary break-words italic">"{profile.slogan}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Population" value={profile.population} icon={Icons.UserGroup} />
                <StatCard label="GDP" value={profile.gdp} icon={Icons.Scale} />
                <StatCard label="Land Area" value={profile.landArea} icon={Icons.Map} />
                <StatCard label="LGAs" value={profile.lgas?.toString()} icon={Icons.Flag} />
            </div>
            
            <div className="border-b border-ui-border dark:border-dark-ui-border">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary-green text-primary-green'
                                : 'border-transparent text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-ui-border'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in-down">
                        <ProfileSection title={`About ${profile.name}`} content={profile.description} />
                        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
                            <InfoRow label="Demonym" value={profile.demonym} icon={Icons.User} />
                        </div>
                        <InfoListSection title="Major Ethnic Groups" items={profile.majorEthnicGroups} icon={Icons.UserGroup} />
                    </div>
                )}
                {activeTab === 'economy' && (
                     <div className="space-y-6 animate-fade-in-down">
                        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
                            <InfoRow label="Estimated GDP" value={profile.gdp} icon={Icons.Scale} />
                            <InfoRow label="Literacy Rate" value={profile.literacyRate} icon={Icons.AcademicCap} />
                        </div>
                        <InfoListSection title="Major Industries" items={profile.majorIndustries} icon={Icons.GlobeAsiaAustralia} />
                        <InfoListSection title="Top Natural Resources" items={profile.naturalResources} icon={Icons.Beaker} />
                    </div>
                )}
                {activeTab === 'governance' && (
                    <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg space-y-2 divide-y divide-gray-200 dark:divide-dark-ui-border animate-fade-in-down">
                        <InfoRow label="Capital City" value={profile.capital} icon={Icons.BuildingOffice} />
                        <InfoRow label="Current Governor" value={profile.governor} icon={Icons.User} />
                        <InfoRow label="Date Created" value={profile.dateCreated ? new Date(profile.dateCreated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined} icon={Icons.CalendarDays} />
                        <InfoRow label="Official Website" value={profile.website} icon={Icons.Globe} />
                    </div>
                )}
                 {activeTab === 'culture' && (
                     <div className="space-y-6 animate-fade-in-down">
                        <InfoListSection title="Notable Sites & Landmarks" items={profile.notableSites} icon={Icons.Landmark} />
                        <InfoListSection title="Key Universities" items={profile.universities} icon={Icons.University} />
                    </div>
                )}
            </div>
        </SidebarWrapper>
    );
};

type PersonProfileTab = 'biography' | 'career' | 'projects' | 'legacy';

const PersonProfileDisplay: React.FC<{profile: Profile; onBack?: () => void}> = ({ profile, onBack }) => {
    const [activeTab, setActiveTab] = useState<PersonProfileTab>('biography');
    
    const isLeader = profile.personSubtype === PersonSubtype.CURRENT_LEADER || profile.personSubtype === PersonSubtype.FORMER_LEADER;
    
    const tabs: {id: PersonProfileTab, label: string}[] = [
        { id: 'biography', label: 'Biography' },
        { id: 'career', label: 'Career' },
    ];

    if (profile.projects && profile.projects.length > 0) {
        tabs.push({ id: 'projects', label: 'Projects' });
    }
    tabs.push({ id: 'legacy', label: 'Legacy & Honours' });


    const age = calculateAge(profile.dateOfBirth || '');

    return (
        <SidebarWrapper title="Profile" onBack={onBack}>
            <div className="text-center -mt-2">
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-dark-primary shadow-lg" />
                <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
                <p className="text-secondary dark:text-dark-text-secondary break-words">{profile.title}</p>
            </div>
             <div className="border-b border-ui-border dark:border-dark-ui-border">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary-green text-primary-green'
                                : 'border-transparent text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-ui-border'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-6">
                {activeTab === 'biography' && (
                    <div className="space-y-6 animate-fade-in-down">
                        <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                {profile.dateOfBirth && (
                                    <div>
                                        <p className="text-xs text-secondary dark:text-dark-text-secondary font-medium uppercase tracking-wider">Born</p>
                                        <p className="text-sm font-semibold text-primary dark:text-dark-text-primary break-words">{new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}{age ? ` (age ${age})` : ''}</p>
                                    </div>
                                )}
                                 {profile.profession && (
                                    <div>
                                        <p className="text-xs text-secondary dark:text-dark-text-secondary font-medium uppercase tracking-wider">Profession</p>
                                        <p className="text-sm font-semibold text-primary dark:text-dark-text-primary break-words">{profile.profession}</p>
                                    </div>
                                )}
                                 {profile.stateOfOrigin && (
                                    <div>
                                        <p className="text-xs text-secondary dark:text-dark-text-secondary font-medium uppercase tracking-wider">State of Origin</p>
                                        <p className="text-sm font-semibold text-primary dark:text-dark-text-primary break-words">{profile.stateOfOrigin}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {profile.earlyLifeAndEducation && <ProfileSection title="Early Life & Education" content={profile.earlyLifeAndEducation} />}
                        {isLeader && <NewsSection profileName={profile.name} />}
                    </div>
                )}
                {activeTab === 'career' && (
                     <div className="space-y-6 animate-fade-in-down">
                        <InfoListSection title="Career Highlights" items={profile.careerHighlights} icon={Icons.Briefcase} />
                    </div>
                )}
                 {activeTab === 'projects' && (
                     <div className="space-y-6 animate-fade-in-down">
                        <InfoListSection title="Key Projects & Ventures" items={profile.projects} icon={Icons.BuildingOffice} />
                    </div>
                )}
                {activeTab === 'legacy' && (
                     <div className="space-y-6 animate-fade-in-down">
                         {profile.legacyAndImpact && <ProfileSection title="Legacy & Impact" content={profile.legacyAndImpact} />}
                         <InfoListSection title="Awards & Honours" items={profile.awardsAndHonours} icon={Icons.Award} />
                         <QuoteListSection title="Notable Quotes" items={profile.notableQuotes} />
                    </div>
                )}
            </div>
        </SidebarWrapper>
    );
};


const PersonaProfileViewer: React.FC<{ profileId: string; onBack?: () => void }> = ({ profileId, onBack }) => {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (profileId) {
            const [type, ...idParts] = profileId.split('_');
            let pId = idParts.join('_');
            
            if (type === PersonaType.FORUM && idParts.length > 0) {
                pId = idParts[0];
            }
            const fetchedProfile = getProfile(type as PersonaType, pId);
            setProfile(fetchedProfile);
        } else {
            setProfile(null);
        }
    }, [profileId]);

    if (!profile) {
        return (
            <div className="w-full h-full bg-white dark:bg-dark-primary flex items-center justify-center">
                 <div className="shimmer w-full h-full"></div>
            </div>
        );
    }

    if (profile.personaType === PersonaType.PERSON) {
        return <PersonProfileDisplay profile={profile} onBack={onBack} />;
    }

    if (profile.personaType === PersonaType.STATE) {
        return <StateProfileDisplay profile={profile} onBack={onBack} />;
    }

    return (
        <SidebarWrapper title="Profile" onBack={onBack}>
            <div className="text-center -mt-2">
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-dark-primary shadow-lg" />
                <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
                <p className="text-secondary dark:text-dark-text-secondary break-words">{profile.title}</p>
            </div>

            {(profile.personaType === PersonaType.UNIGERIAN) && 
                <PersonDetailsSection profile={profile} />}
            
            {profile.personaType === PersonaType.FORUM && (
                <>
                    <ProfileSection title="Purpose" content={profile.description} />
                    <InfoListSection title="Key Discussion Topics" items={profile.keyTopics} icon={Icons.ChatBubbleBottomCenterText} />
                    <InfoListSection title="Community Guidelines" items={profile.forumRules} icon={Icons.Flag} />
                </>
            )}

            {profile.sections?.map((section, index) => (
                section.content ? <ProfileSection key={index} title={section.title} content={section.content} /> : null
            ))}
        </SidebarWrapper>
    );
};

const getCurrentElectionCycle = (): string => {
    const year = new Date().getFullYear();
    const startYear = year % 2 === 0 ? year : year - 1;
    return `${startYear}-${startYear + 2}`;
};

type UserProfileTab = 'overview' | 'manifesto' | 'activity' | 'reports';

const UserProfileViewer: React.FC<{ userId: string; onBack: () => void; }> = ({ userId, onBack }) => {
    const { userProfile: currentUser, isAuthenticated, session, townHallCategories } = useAppState();
    const dispatch = useAppDispatch();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userReports, setUserReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEndorsing, setIsEndorsing] = useState(false);
    const [canEndorse, setCanEndorse] = useState(false);
    const [activeTab, setActiveTab] = useState<UserProfileTab>('overview');
    const [isLoadingReports, setIsLoadingReports] = useState(false);


    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            setCanEndorse(false); // Reset on profile change
            const userProfile = await getUserProfileById(userId);
            setProfile(userProfile);

            if (userProfile?.is_candidate && isAuthenticated && currentUser.id && currentUser.id !== userProfile.id) {
                 if (userProfile.state !== currentUser.state || userProfile.lga !== currentUser.lga) {
                     setCanEndorse(false);
                } else {
                    const endorsements = await getEndorsementsForUser(currentUser.id);
                    const currentCycle = getCurrentElectionCycle();
                    const hasEndorsedInLGA = endorsements.some(e => {
                        return e.election_cycle === currentCycle;
                    });
                    
                    if (!hasEndorsedInLGA) {
                        setCanEndorse(true);
                    }
                }
            }
            setIsLoading(false);
        };
        fetchProfileData();
    }, [userId, isAuthenticated, currentUser.id, currentUser.state, currentUser.lga]);
    
    useEffect(() => {
        if(profile) {
            setActiveTab('overview');
        }
    }, [profile?.id]);

     useEffect(() => {
        const fetchUserReports = async () => {
            if (activeTab !== 'reports' || !userId) return;
            
            setIsLoadingReports(true);
            try {
                const fetchedReports = await getReports({ author_id: userId });
                setUserReports(fetchedReports);
            } catch(e) {
                console.error("Failed to fetch user reports:", e);
                setUserReports([]);
            } finally {
                setIsLoadingReports(false);
            }
        };

        fetchUserReports();
    }, [activeTab, userId]);


    const handleEndorse = async () => {
        if (!profile || !currentUser.id || !canEndorse) return;
        
        setIsEndorsing(true);
        const result = await addEndorsement(profile.id!, currentUser);
        
        if (result.success) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: result.message } });
            dispatch({ type: 'UPDATE_CANDIDATE_ENDORSEMENT', payload: { candidateId: profile.id! } });
            setProfile(p => p ? { ...p, endorsement_count: (p.endorsement_count || 0) + 1 } : null);
            setCanEndorse(false);
        } else {
            dispatch({ type: 'SHOW_TOAST', payload: { message: result.message, type: 'error' } });
        }
        setIsEndorsing(false);
    };

    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: ListPanelTab.TOWN_HALLS });
        dispatch({ type: 'SET_TOWNHALL_SUB_TAB', payload: TownHallSubTab.HOT_REPORTS });
        dispatch({ type: 'SET_ACTIVE_TOWNHALL_CATEGORY', payload: report.category_id });
        setTimeout(() => {
            dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id });
        }, 50);
    };


    if (isLoading) {
         return (
            <div className="w-full h-full bg-white dark:bg-dark-primary flex items-center justify-center">
                <div className="shimmer w-full h-full"></div>
            </div>
        );
    }

    if (!profile) {
        return (
             <SidebarWrapper title="User Profile" onBack={onBack}>
                 <p className="text-center text-secondary dark:text-dark-text-secondary">Could not load user profile.</p>
             </SidebarWrapper>
        );
    }
    
    const isOwnProfile = currentUser.id === profile.id;
    const civicRank = getCivicRank(profile.reputation_score || 0);

    const tabs: {id: UserProfileTab, label: string}[] = [{ id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity'}, {id: 'reports', label: 'Reports'}];
    if (profile.is_candidate && profile.manifesto && profile.manifesto.length > 0) {
        tabs.splice(1, 0, { id: 'manifesto', label: 'Manifesto' });
    }

    return (
        <SidebarWrapper title={isOwnProfile ? "My Profile" : "User Profile"} onBack={onBack}>
            <div className="text-center">
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-dark-primary shadow-lg" />
                <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
                <p className="text-secondary dark:text-dark-text-secondary break-words">{profile.title}</p>
                <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1">{profile.lga}, {profile.state} State</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-app-light dark:bg-dark-app-light px-3 py-1 rounded-full">
                    <civicRank.icon className="w-5 h-5 text-accent-gold"/>
                    <span className="font-semibold text-sm text-primary dark:text-dark-text-primary">{civicRank.name}</span>
                    <span className="text-xs text-secondary dark:text-dark-text-secondary">({profile.reputation_score || 0} pts)</span>
                </div>
            </div>
             {profile.is_candidate && (
                <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg flex flex-col items-center text-center mt-4">
                    <h3 className="text-lg font-semibold text-primary-green">Candidate for Office</h3>
                    <p className="text-sm text-secondary dark:text-dark-text-secondary">Running for representative in {profile.lga}, {profile.state}.</p>
                    <div className="flex items-center space-x-2 text-2xl font-bold my-2">
                        <Icons.ShieldCheck className="w-8 h-8 text-primary-green" />
                        <span>{profile.endorsement_count || 0}</span>
                        <span className="text-base font-normal text-secondary dark:text-dark-text-secondary">Endorsements</span>
                    </div>
                    {canEndorse && !isOwnProfile ? (
                        <button
                            onClick={handleEndorse}
                            disabled={isEndorsing}
                            className="w-full bg-primary-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center disabled:bg-gray-400"
                        >
                            {isEndorsing ? 'Endorsing...' : `Endorse in ${profile.lga}`}
                        </button>
                    ) : (
                       !isOwnProfile && isAuthenticated && currentUser.state === profile.state && currentUser.lga === profile.lga &&
                        <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">You have already endorsed a candidate in your LGA.</p>
                    )}
                </div>
            )}
            
            <div className="border-b border-ui-border dark:border-dark-ui-border">
                <nav className="-mb-px flex space-x-4">
                    {tabs.map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary-green text-primary-green'
                                : 'border-transparent text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-ui-border'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="animate-fade-in-down">
                {activeTab === 'overview' && (
                    <div className='text-center text-sm text-secondary p-4'>
                       Member since {new Date(session?.user.created_at || Date.now()).toLocaleDateString()}.
                    </div>
                )}
                {activeTab === 'manifesto' && profile.manifesto && (
                     <div className="space-y-6">
                        <ManifestoSection manifesto={profile.manifesto} />
                    </div>
                )}
                {activeTab === 'activity' && (
                    <ReputationActivityFeed userId={profile.id!} />
                )}
                {activeTab === 'reports' && (
                     isLoadingReports ? (
                        <div className="p-4 text-center text-secondary">Loading reports...</div>
                     ) : (
                        <div className="space-y-2">
                            {userReports.length > 0 ? (
                                userReports.map(report => {
                                    const categoryName = townHallCategories.find(c => c.id === report.category_id)?.name;
                                    return (
                                        <ReportListItem
                                            key={report.id}
                                            report={report}
                                            onClick={() => handleReportClick(report)}
                                            showCategory
                                            categoryName={categoryName}
                                        />
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-secondary dark:text-dark-text-secondary p-4">This user has not filed any reports yet.</p>
                            )}
                        </div>
                    )
                )}
            </div>

        </SidebarWrapper>
    );
};


const getDayOfTheYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now as any) - (start as any);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

const DefaultView: React.FC = () => {
    const { isAuthenticated, userProfile, townHallCategories } = useAppState();
    const dispatch = useAppDispatch();
    
    const [featuredState, setFeaturedState] = useState<Profile | null>(null);
    const [featuredCurrentLeader, setFeaturedCurrentLeader] = useState<Profile | null>(null);
    const [featuredFormerLeader, setFeaturedFormerLeader] = useState<Profile | null>(null);
    const [featuredNotablePerson, setFeaturedNotablePerson] = useState<Profile | null>(null);
    const [featuredReport, setFeaturedReport] = useState<Report | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const dayOfYear = getDayOfTheYear();

        const states = ALL_PROFILES.filter(p => p.personaType === PersonaType.STATE && p.id !== 'nigeria');
        if (states.length > 0) setFeaturedState(states[dayOfYear % states.length]);
        
        const currentLeaders = ALL_PROFILES.filter(p => p.personSubtype === PersonSubtype.CURRENT_LEADER);
        if (currentLeaders.length > 0) setFeaturedCurrentLeader(currentLeaders[dayOfYear % currentLeaders.length]);

        const formerLeaders = ALL_PROFILES.filter(p => p.personSubtype === PersonSubtype.FORMER_LEADER);
        if (formerLeaders.length > 0) setFeaturedFormerLeader(formerLeaders[dayOfYear % formerLeaders.length]);
        
        const notablePeople = ALL_PROFILES.filter(p => p.personSubtype === PersonSubtype.NOTABLE_PERSON);
        if (notablePeople.length > 0) setFeaturedNotablePerson(notablePeople[dayOfYear % notablePeople.length]);

        const fetchReport = async () => {
            if (!isAuthenticated) {
                setIsLoadingReport(false);
                return;
            }
            setIsLoadingReport(true);
            try {
                const reports = await getReports();
                if (reports.length > 0) {
                    const recentReport = reports.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    setFeaturedReport(recentReport);
                }
            } catch (e) {
                console.error("Failed to fetch featured report", e);
            } finally {
                setIsLoadingReport(false);
            }
        };

        fetchReport();
    }, [isAuthenticated]);

    const handleLogin = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'login' });
    const handleRegister = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'register' });
    const handleLogout = () => dispatch({ type: 'LOGOUT' });
    const handleItemClick = (type: PersonaType, id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: { type, id } });
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            dispatch({ type: 'SHOW_TOAST', payload: { message: `Error: ${error.message}`, type: 'error' } });
            setIsSubmitting(false);
        }
    };
    
    const handleReportClick = (report: Report) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: ListPanelTab.TOWN_HALLS });
        dispatch({ type: 'SET_ACTIVE_TOWNHALL_CATEGORY', payload: report.category_id });
        setTimeout(() => {
            dispatch({ type: 'SET_ACTIVE_REPORT', payload: report.id });
        }, 50);
    };

    const FeaturedSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-6">
            <h3 className="font-semibold text-primary dark:text-dark-text-primary mb-2 text-lg">{title}</h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    return (
        <SidebarWrapper title="Home">
            <div className="bg-app-light dark:bg-dark-app-light p-4 rounded-lg">
                {isAuthenticated ? (
                    <div>
                        <p className="text-sm text-secondary dark:text-dark-text-secondary mb-2">Welcome back,</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img src={userProfile.avatar} alt={userProfile.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold text-primary dark:text-dark-text-primary">{userProfile.name}</p>
                                    <p className="text-xs text-secondary dark:text-dark-text-secondary">{userProfile.title}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">
                                Sign Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="font-semibold text-primary dark:text-dark-text-primary">Join the Conversation</p>
                        <p className="text-sm text-secondary dark:text-dark-text-secondary mt-1 mb-3">Sign in or create an account to participate in Town Halls, file reports, and more.</p>
                        <div className="space-y-2">
                             <button
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className="w-full bg-white dark:bg-dark-secondary border border-ui-border dark:border-dark-ui-border text-primary dark:text-dark-text-primary font-semibold py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Icons.GoogleIcon className="w-5 h-5" />
                                <span>Sign In with Google</span>
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleLogin} className="w-full bg-primary-green/10 text-primary-green font-semibold py-2 rounded-lg hover:bg-primary-green/20 transition-colors">Sign In</button>
                                <button onClick={handleRegister} className="w-full bg-primary-green text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 transition-colors">Register</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <FeaturedSection title="Featured Report">
                {isLoadingReport ? <div className="shimmer h-16 w-full rounded-lg"></div> : 
                 featuredReport ? <ReportListItem report={featuredReport} onClick={() => handleReportClick(featuredReport)} showCategory categoryName={townHallCategories.find(c=>c.id === featuredReport.category_id)?.name} /> : <p className="text-sm text-secondary dark:text-dark-text-secondary">No reports found.</p>
                }
            </FeaturedSection>
            
            <FeaturedSection title="Explore Nigeria">
                {featuredState && <ChatListItem data={{id: featuredState.id, type: featuredState.personaType, avatar: featuredState.avatar, name: featuredState.name, lastMessage: featuredState.slogan || '', timestamp: '', unreadCount: 0 }} isActive={false} onClick={() => handleItemClick(featuredState.personaType, featuredState.id)} />}
                {featuredCurrentLeader && <ChatListItem data={{id: featuredCurrentLeader.id, type: featuredCurrentLeader.personaType, avatar: featuredCurrentLeader.avatar, name: featuredCurrentLeader.name, lastMessage: featuredCurrentLeader.title || '', timestamp: '', unreadCount: 0 }} isActive={false} onClick={() => handleItemClick(featuredCurrentLeader.personaType, featuredCurrentLeader.id)} />}
                {featuredFormerLeader && <ChatListItem data={{id: featuredFormerLeader.id, type: featuredFormerLeader.personaType, avatar: featuredFormerLeader.avatar, name: featuredFormerLeader.name, lastMessage: featuredFormerLeader.title || '', timestamp: '', unreadCount: 0 }} isActive={false} onClick={() => handleItemClick(featuredFormerLeader.personaType, featuredFormerLeader.id)} />}
                {featuredNotablePerson && <ChatListItem data={{id: featuredNotablePerson.id, type: featuredNotablePerson.personaType, avatar: featuredNotablePerson.avatar, name: featuredNotablePerson.name, lastMessage: featuredNotablePerson.title || '', timestamp: '', unreadCount: 0 }} isActive={false} onClick={() => handleItemClick(featuredNotablePerson.personaType, featuredNotablePerson.id)} />}
            </FeaturedSection>
        </SidebarWrapper>
    );
};

const RightSidebar: React.FC = () => {
    const { activeChatId, sidebarProfileId } = useAppState();
    const dispatch = useAppDispatch();

    const handleBack = () => {
        if (sidebarProfileId) {
            dispatch({ type: 'HIDE_SIDEBAR_PROFILE' });
        } else if (activeChatId) {
            dispatch({ type: 'CLEAR_ACTIVE_CHAT' });
        }
    };
    
    if (sidebarProfileId) {
        const isUser = !sidebarProfileId.includes('_');
        if (isUser) {
            return <UserProfileViewer userId={sidebarProfileId} onBack={handleBack} />;
        } else {
            return <PersonaProfileViewer profileId={sidebarProfileId} onBack={handleBack} />;
        }
    }
    
    if (activeChatId) {
        if (activeChatId.startsWith('townhall_')) {
            return <DefaultView />;
        }
        return <PersonaProfileViewer profileId={activeChatId} onBack={handleBack} />;
    }

    return <DefaultView />;
};

export default RightSidebar;
