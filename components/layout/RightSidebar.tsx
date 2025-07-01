import React, { useEffect, useState } from 'react';
import { useAppState, useAppDispatch, ListPanelTab } from '../../context/AppContext';
import { Profile, PersonSubtype, GroundingChunk, PersonaType, UserProfile } from '../../types';
import { getProfile } from '../../personas/personas';
import { generateGroundedText, generateArbitraryJson } from '../../services/geminiService';
import { Icons, PERSONA_LIST } from '../../constants';
import ProfileSection from '../profile/ProfileSection';
import { useWindowSize } from '../../hooks/useWindowSize';
import ChatListItem from '../list/ChatListItem';

const SidebarWrapper: React.FC<{title: string; children: React.ReactNode; onBack?: () => void}> = ({ title, children, onBack }) => {
    const { width } = useWindowSize();
    const isDesktop = width ? width >= 1024 : false;

    return (
        <div className="h-full w-full flex flex-col bg-white">
            <header className="p-4 flex-shrink-0 border-b border-ui-border flex items-center space-x-3">
                {!isDesktop && onBack && (
                     <button onClick={onBack} className="p-1 text-secondary">
                        <Icons.ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h2 className="font-bold text-lg text-primary">{title}</h2>
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
        <div className="bg-app-light p-4 rounded-lg">
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
                                <Icons.Link className="w-4 h-4 text-secondary mt-1 mr-2 flex-shrink-0" />
                                <a
                                    href={newsItem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-secondary hover:text-primary-green hover:underline break-words"
                                    title={newsItem.originalTitle}
                                >
                                    {newsItem.shortHeadline}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-secondary">Could not fetch recent news.</p>
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
                <p className="font-semibold text-primary">{label}</p>
                {isLink ? (
                    <a href={`https://${value.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all">{value}</a>
                ) : (
                    <p className="text-secondary break-words">{value}</p>
                )}
            </div>
        </div>
    )
};

const InfoListSection: React.FC<{ title: string; items: string[] | undefined; icon: React.ComponentType<{ className?: string }> }> = ({ title, items, icon: IconComponent }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-app-light p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center">
                <IconComponent className="w-6 h-6 mr-2 flex-shrink-0" />
                <span>{title}</span>
            </h2>
            <ul className="space-y-1.5">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start text-sm text-secondary">
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
        <div className="bg-app-light p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center">
                <Icons.Quote className="w-6 h-6 mr-2 flex-shrink-0" />
                <span>{title}</span>
            </h2>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <blockquote key={index} className="border-l-4 border-accent-gold pl-4 text-secondary italic">
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
         <div className="bg-app-light p-4 rounded-lg">
             <h2 className="text-lg font-semibold text-primary-green mb-3 flex items-center">
                <Icons.User className="w-6 h-6 mr-2" />
                Bio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {details.map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-xs text-secondary font-medium uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-primary break-words">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
};


const StatCard: React.FC<{ label: string; value: string | undefined; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, icon: IconComponent }) => {
    if (!value) return null;
    return (
        <div className="bg-app-light rounded-lg p-3 flex items-center space-x-3">
            <div className="bg-primary-green/10 p-2 rounded-full">
                <IconComponent className="w-5 h-5 text-primary-green" />
            </div>
            <div>
                <p className="text-sm font-bold text-primary">{value}</p>
                <p className="text-xs text-secondary">{label}</p>
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
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg" />
                <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
                <p className="text-secondary break-words italic">"{profile.slogan}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Population" value={profile.population} icon={Icons.UserGroup} />
                <StatCard label="GDP" value={profile.gdp} icon={Icons.Scale} />
                <StatCard label="Land Area" value={profile.landArea} icon={Icons.Map} />
                <StatCard label="LGAs" value={profile.lgas?.toString()} icon={Icons.Flag} />
            </div>
            
            <div className="border-b border-ui-border">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary-green text-primary-green'
                                : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'
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
                        <div className="bg-app-light p-4 rounded-lg">
                            <InfoRow label="Demonym" value={profile.demonym} icon={Icons.User} />
                        </div>
                        <InfoListSection title="Major Ethnic Groups" items={profile.majorEthnicGroups} icon={Icons.UserGroup} />
                    </div>
                )}
                {activeTab === 'economy' && (
                     <div className="space-y-6 animate-fade-in-down">
                        <div className="bg-app-light p-4 rounded-lg">
                            <InfoRow label="Estimated GDP" value={profile.gdp} icon={Icons.Scale} />
                            <InfoRow label="Literacy Rate" value={profile.literacyRate} icon={Icons.AcademicCap} />
                        </div>
                        <InfoListSection title="Major Industries" items={profile.majorIndustries} icon={Icons.GlobeAsiaAustralia} />
                        <InfoListSection title="Top Natural Resources" items={profile.naturalResources} icon={Icons.Beaker} />
                    </div>
                )}
                {activeTab === 'governance' && (
                    <div className="bg-app-light p-4 rounded-lg space-y-2 divide-y divide-gray-200 animate-fade-in-down">
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

type PersonProfileTab = 'biography' | 'career' | 'legacy';

const PersonProfileDisplay: React.FC<{profile: Profile; onBack?: () => void}> = ({ profile, onBack }) => {
    const [activeTab, setActiveTab] = useState<PersonProfileTab>('biography');
    
    const tabs: {id: PersonProfileTab, label: string}[] = [
        { id: 'biography', label: 'Biography' },
        { id: 'career', label: 'Career' },
        { id: 'legacy', label: 'Legacy & Honours' },
    ];

    const isLeader = profile.personSubtype === PersonSubtype.CURRENT_LEADER || profile.personSubtype === PersonSubtype.FORMER_LEADER;
    const age = calculateAge(profile.dateOfBirth || '');

    return (
        <SidebarWrapper title="Profile" onBack={onBack}>
            <div className="text-center -mt-2">
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg" />
                <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
                <p className="text-secondary break-words">{profile.title}</p>
            </div>
             <div className="border-b border-ui-border">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary-green text-primary-green'
                                : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'
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
                        <div className="bg-app-light p-4 rounded-lg">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                {profile.dateOfBirth && (
                                    <div>
                                        <p className="text-xs text-secondary font-medium uppercase tracking-wider">Born</p>
                                        <p className="text-sm font-semibold text-primary break-words">{new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}{age ? ` (age ${age})` : ''}</p>
                                    </div>
                                )}
                                 {profile.profession && (
                                    <div>
                                        <p className="text-xs text-secondary font-medium uppercase tracking-wider">Profession</p>
                                        <p className="text-sm font-semibold text-primary break-words">{profile.profession}</p>
                                    </div>
                                )}
                                 {profile.stateOfOrigin && (
                                    <div>
                                        <p className="text-xs text-secondary font-medium uppercase tracking-wider">State of Origin</p>
                                        <p className="text-sm font-semibold text-primary break-words">{profile.stateOfOrigin}</p>
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


const ProfileViewer: React.FC = () => {
  const { activeChatId } = useAppState();
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (activeChatId) {
      const [type, ...idParts] = activeChatId.split('_');
      let profileId = idParts.join('_');
      // For forum chats like 'forum_town-halls_topic-1', the profile ID is the category 'town-halls'
      if (type === PersonaType.FORUM && idParts.length > 0) {
        profileId = idParts[0];
      }
      const fetchedProfile = getProfile(type as PersonaType, profileId);
      setProfile(fetchedProfile);
    } else {
      setProfile(null);
    }
  }, [activeChatId]);
  
  const handleCloseOverlay = () => {
    dispatch({ type: 'HIDE_PROFILE_OVERLAY' });
  };

  if (!profile) {
    return (
        <div className="w-full h-full bg-white flex items-center justify-center">
             <div className="shimmer w-full h-full"></div>
        </div>
    );
  }

  if (profile.personaType === PersonaType.PERSON) {
    return <PersonProfileDisplay profile={profile} onBack={handleCloseOverlay} />;
  }

  if (profile.personaType === PersonaType.STATE) {
      return <StateProfileDisplay profile={profile} onBack={handleCloseOverlay} />;
  }

  return (
    <SidebarWrapper title="Profile" onBack={handleCloseOverlay}>
        <div className="text-center -mt-2">
            <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg" />
            <h1 className="text-2xl font-bold mt-4 break-words">{profile.name}</h1>
            <p className="text-secondary break-words">{profile.title}</p>
        </div>

        { (profile.personaType === PersonaType.UNIGERIAN) && 
            <PersonDetailsSection profile={profile} /> }
        
        { profile.personaType === PersonaType.FORUM && (
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
  )
}

const DefaultView: React.FC = () => {
    const { isAuthenticated, userProfile } = useAppState();
    const dispatch = useAppDispatch();

    const handleLogin = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'login' });
    const handleRegister = () => dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'register' });
    const handleLogout = () => dispatch({ type: 'LOGOUT' });
    const handleItemClick = (type: PersonaType, id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: { type, id } });
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

    const featuredPersonas = PERSONA_LIST.filter(p => ['wole-soyinka', 'ngozi-okonjo-iweala', 'lagos'].includes(p.id));

    return (
        <SidebarWrapper title="Home">
            <div className="bg-app-light p-4 rounded-lg">
                {isAuthenticated ? (
                    <div>
                        <p className="text-sm text-secondary mb-2">Welcome back,</p>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-primary">{userProfile.name}</p>
                            <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:underline">Logout</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-semibold text-primary text-center">Join UNigeria</h3>
                            <p className="text-xs text-secondary text-center mt-1">
                                Sign in or create an account to personalize your experience.
                            </p>
                        </div>

                        <button 
                            onClick={handleGoogleLogin} 
                            className="w-full bg-white border border-ui-border text-primary font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Icons.GoogleIcon className="w-5 h-5" />
                            <span>Sign In with Google</span>
                        </button>

                        <div className="flex items-center">
                            <hr className="flex-grow border-t border-ui-border"/>
                            <span className="px-2 text-xs text-secondary">OR</span>
                            <hr className="flex-grow border-t border-ui-border"/>
                        </div>

                        <div className="flex space-x-2">
                            <button onClick={handleLogin} className="flex-1 bg-primary-green text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 transition-opacity">
                                Sign In
                            </button>
                            <button onClick={handleRegister} className="flex-1 bg-gray-200 text-primary font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors">
                                Register
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div>
                 <h3 className="font-semibold text-primary mb-2 text-lg">Featured</h3>
                 <div className="space-y-1">
                    {featuredPersonas.map(p => (
                         <ChatListItem 
                            key={`${p.type}_${p.id}`}
                            data={{ ...p, lastMessage: p.subtitle, timestamp: '', unreadCount: 0 }}
                            isActive={false}
                            onClick={() => handleItemClick(p.type, p.id)}
                        />
                    ))}
                 </div>
            </div>
        </SidebarWrapper>
    )
}

const RightSidebar: React.FC = () => {
  const { activeChatId } = useAppState();

  return (
    <aside className="w-full h-full bg-white border-l border-ui-border">
      {activeChatId ? <ProfileViewer /> : <DefaultView />}
    </aside>
  );
};

export default RightSidebar;