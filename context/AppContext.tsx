
import React, { createContext, useReducer, useContext, Dispatch, ReactNode, useEffect } from 'react';
import { PersonaType, ChatListDetail, UserProfile, Report, PersonSubtype, TownHallSubTab, Message, TownHallCategory, Session, User, Persona, ReportStatus, Notification, Announcement, UnigerianSubTab } from '../types';
import { clearAllLocalChats, getTownHallCategories, getReports, getCandidates, updateReportStatus, getNotifications, getUnreadNotificationCount, getAnnouncements, getRepresentatives, getLeaderboard } from '../services/dbService';
import { supabase, upsertProfile } from '../services/supabaseService';
import { PERSONA_LIST } from '../constants';
import { Database } from '../types/database.types';

export enum ListPanelTab {
  CHATS = 'chats',
  NIGERIA = 'nigeria',
  PEOPLE_CURRENT = 'people_current',
  PEOPLE_FORMER = 'people_former',
  PEOPLE_NOTABLE = 'people_notable',
  TOWN_HALLS = 'town_halls',
  UNIGERIANS = 'unigerians',
  LEADERBOARD = 'leaderboard',
  QUIET = 'quiet',
}

export enum NigeriaSubTab {
  ALL_STATES = 'all_states',
  COMPARE = 'compare',
}

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error';
}

type Theme = 'light' | 'dark';

interface AppState {
  activeTab: ListPanelTab;
  activeChatId: string | null;
  activeTownHallCategory: string | null;
  activeReportId: string | null;
  chatListDetails: { [chatId: string]: ChatListDetail };
  reports: Report[];
  candidates: UserProfile[];
  townHallCategories: TownHallCategory[];
  userProfile: UserProfile;
  activeSystemView: 'settings' | null;
  toast: ToastState | null;
  isAuthenticated: boolean;
  isAuthOverlayVisible: boolean;
  authOverlayMode: 'login' | 'register' | null;
  townHallSubTab: TownHallSubTab;
  townHallFilters: { state: string; lga: string; };
  unigerianSubTab: UnigerianSubTab;
  unigerianFilters: { state: string; lga: string; };
  representatives: UserProfile[];
  announcements: Announcement[];
  notifications: Notification[];
  unreadNotificationCount: number;
  leaderboardUsers: UserProfile[];
  leaderboardFilters: { state: string; lga: string };
  nigeriaSubTab: NigeriaSubTab;
  stateComparisonIds: { state1: string | null; state2: string | null };
  sidebarProfileId: string | null;
  isQuietSpaceActive: boolean;
  session: Session | null;
  isLoadingAuth: boolean;
  unreadCounts: { [chatId: string]: number };
  theme: Theme;
  isCreateReportModalOpen: boolean;
  isCreatingReport: boolean;
  reportCreationCategoryId: string | null;
}

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: ListPanelTab }
  | { type: 'SET_ACTIVE_CHAT'; payload: { type: PersonaType, id: string } }
  | { type: 'CLEAR_ACTIVE_CHAT' }
  | { type: 'SET_ACTIVE_TOWNHALL_CATEGORY'; payload: string | null }
  | { type: 'SET_ACTIVE_REPORT'; payload: string | null }
  | { type: 'SET_CHAT_LIST_DETAILS'; payload: { [chatId: string]: ChatListDetail } }
  | { type: 'UPDATE_CHAT_LIST_DETAIL'; payload: { chatId: string; detail: ChatListDetail } }
  | { type: 'REMOVE_CHAT_LIST_DETAIL'; payload: { chatId: string } }
  | { type: 'SET_TOWNHALL_DATA', payload: { categories: TownHallCategory[], reports: Report[] } }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'DELETE_REPORT'; payload: { reportId: string } }
  | { type: 'UPDATE_REPORT_STATUS'; payload: { reportId: string, status: ReportStatus }}
  | { type: 'INCREMENT_REPLY_COUNT', payload: { reportId: string }}
  | { type: 'DECREMENT_REPLY_COUNT', payload: { reportId: string }}
  | { type: 'SET_USER_PROFILE', payload: UserProfile }
  | { type: 'SET_ACTIVE_SYSTEM_VIEW', payload: 'settings' | null }
  | { type: 'SHOW_TOAST', payload: { message: string, type?: 'success' | 'error' } }
  | { type: 'HIDE_TOAST' }
  | { type: 'LOGOUT' }
  | { type: 'SHOW_AUTH_OVERLAY'; payload: 'login' | 'register' }
  | { type: 'HIDE_AUTH_OVERLAY' }
  | { type: 'GO_HOME' }
  | { type: 'SET_TOWNHALL_SUB_TAB'; payload: TownHallSubTab }
  | { type: 'SET_TOWNHALL_FILTERS'; payload: { state: string, lga: string } }
  | { type: 'SET_CANDIDATES'; payload: UserProfile[] }
  | { type: 'UPDATE_CANDIDATE_ENDORSEMENT'; payload: { candidateId: string } }
  | { type: 'SET_NIGERIA_SUB_TAB'; payload: NigeriaSubTab }
  | { type: 'SET_UNIGERIAN_SUB_TAB'; payload: UnigerianSubTab }
  | { type: 'SET_UNIGERIAN_FILTERS'; payload: { state: string, lga: string } }
  | { type: 'SET_REPRESENTATIVES'; payload: UserProfile[] }
  | { type: 'SET_ANNOUNCEMENTS'; payload: Announcement[] }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_UNREAD_NOTIFICATION_COUNT'; payload: number }
  | { type: 'DECREMENT_UNREAD_COUNT'; payload: number }
  | { type: 'SET_LEADERBOARD_DATA'; payload: UserProfile[] }
  | { type: 'SET_LEADERBOARD_FILTERS'; payload: { state: string; lga: string } }
  | { type: 'SET_STATE_COMPARISON'; payload: { state1Id: string, state2Id: string } }
  | { type: 'CLEAR_STATE_COMPARISON' }
  | { type: 'SHOW_SIDEBAR_PROFILE'; payload: string }
  | { type: 'HIDE_SIDEBAR_PROFILE' }
  | { type: 'TOGGLE_QUIET_SPACE' }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_UNREAD_COUNTS'; payload: { [chatId: string]: number } }
  | { type: 'INCREMENT_UNREAD_COUNT'; payload: { chatId: string } }
  | { type: 'RESET_UNREAD_COUNT'; payload: { chatId: string } }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SHOW_CREATE_REPORT_MODAL' }
  | { type: 'HIDE_CREATE_REPORT_MODAL' }
  | { type: 'START_CREATE_REPORT'; payload: { categoryId: string } }
  | { type: 'CANCEL_CREATE_REPORT' };

const defaultUserProfile: UserProfile = {
  id: 'anonymous-user',
  name: 'Citizen Ade',
  title: 'Concerned Nigerian',
  avatar: 'https://picsum.photos/seed/ade/40/40',
};

const initialState: AppState = {
  activeTab: ListPanelTab.CHATS,
  activeChatId: null,
  activeTownHallCategory: null,
  activeReportId: null,
  chatListDetails: {},
  reports: [],
  candidates: [],
  townHallCategories: [],
  userProfile: defaultUserProfile,
  activeSystemView: null,
  toast: null,
  isAuthenticated: false,
  isAuthOverlayVisible: false,
  authOverlayMode: null,
  townHallSubTab: TownHallSubTab.HOT_REPORTS,
  townHallFilters: { state: '', lga: '' },
  unigerianSubTab: UnigerianSubTab.REPS,
  unigerianFilters: { state: '', lga: '' },
  representatives: [],
  announcements: [],
  notifications: [],
  unreadNotificationCount: 0,
  leaderboardUsers: [],
  leaderboardFilters: { state: '', lga: '' },
  nigeriaSubTab: NigeriaSubTab.ALL_STATES,
  stateComparisonIds: { state1: null, state2: null },
  sidebarProfileId: null,
  isQuietSpaceActive: false,
  session: null,
  isLoadingAuth: true,
  unreadCounts: {},
  theme: 'light',
  isCreateReportModalOpen: false,
  isCreatingReport: false,
  reportCreationCategoryId: null,
};

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<Action>>(() => null);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { 
          ...state, 
          activeTab: action.payload, 
          isQuietSpaceActive: false,
          stateComparisonIds: { state1: null, state2: null }, // Reset comparison
      };
    case 'SET_ACTIVE_CHAT': {
      let chatId = `${action.payload.type}_${action.payload.id}`;
      if (action.payload.type === 'townhall') {
        chatId = `townhall_${action.payload.id}`;
      }
      
      const newUnreadCounts = { ...state.unreadCounts };
      delete newUnreadCounts[chatId];
      
      const newChatListDetails = { ...state.chatListDetails };
      if (!newChatListDetails[chatId]) {
          const persona = PERSONA_LIST.find(p => p.id === action.payload.id && (p.type === action.payload.type || (action.payload.type === 'townhall' && p.type === 'townhall')));
          if (persona) {
              newChatListDetails[chatId] = {
                  lastMessage: persona.description, 
                  timestamp: Date.now()
              };
          }
      }

      return { 
          ...state, 
          activeChatId: chatId, 
          activeReportId: null, 
          activeTownHallCategory: null, 
          activeSystemView: null, 
          sidebarProfileId: null, 
          isQuietSpaceActive: false, 
          stateComparisonIds: { state1: null, state2: null }, 
          unreadCounts: newUnreadCounts,
          chatListDetails: newChatListDetails 
      };
    }
    case 'CLEAR_ACTIVE_CHAT':
      return { ...state, activeChatId: null, activeReportId: null, sidebarProfileId: null, stateComparisonIds: { state1: null, state2: null } };
    case 'SET_ACTIVE_TOWNHALL_CATEGORY':
        return { ...state, activeTownHallCategory: action.payload, activeChatId: null, activeReportId: null, activeSystemView: null, sidebarProfileId: null, isQuietSpaceActive: false, stateComparisonIds: { state1: null, state2: null } };
    case 'SET_ACTIVE_REPORT': {
        const report = state.reports.find(t => t.id === action.payload);
        if (!report) return state; // Report not found
        const reportChatId = `townhall_${report.id}`;
        return { ...state, activeReportId: action.payload, activeChatId: reportChatId, activeSystemView: null, sidebarProfileId: null, isQuietSpaceActive: false, stateComparisonIds: { state1: null, state2: null } };
    }
    case 'SET_CHAT_LIST_DETAILS':
        return { ...state, chatListDetails: action.payload };
    case 'UPDATE_CHAT_LIST_DETAIL':
        return { 
            ...state, 
            chatListDetails: { 
                ...state.chatListDetails, 
                [action.payload.chatId]: action.payload.detail 
            } 
        };
    case 'REMOVE_CHAT_LIST_DETAIL': {
      const { [action.payload.chatId]: _, ...newDetails } = state.chatListDetails;
      return { ...state, chatListDetails: newDetails };
    }
    case 'SET_TOWNHALL_DATA':
        return { ...state, townHallCategories: action.payload.categories, reports: action.payload.reports };
    case 'ADD_REPORT':
        return { ...state, reports: [action.payload, ...state.reports] };
    case 'DELETE_REPORT': {
        const { reportId } = action.payload;
        const reportToDelete = state.reports.find(t => t.id === reportId);
        if (!reportToDelete) return state;

        const chatIdToDelete = `townhall_${reportId}`;

        return { 
            ...state, 
            reports: state.reports.filter(t => t.id !== reportId),
            activeChatId: state.activeChatId === chatIdToDelete ? null : state.activeChatId,
            activeReportId: state.activeReportId === reportId ? null : state.activeReportId
        };
    }
    case 'UPDATE_REPORT_STATUS': {
        return {
            ...state,
            reports: state.reports.map(report =>
                report.id === action.payload.reportId
                ? { ...report, status: action.payload.status, updated_at: new Date().toISOString() }
                : report
            )
        };
    }
    case 'INCREMENT_REPLY_COUNT': {
        return {
            ...state,
            reports: state.reports.map(report => 
                report.id === action.payload.reportId 
                ? { ...report, reply_count: report.reply_count + 1 }
                : report
            )
        };
    }
    case 'DECREMENT_REPLY_COUNT': {
        return {
            ...state,
            reports: state.reports.map(report => 
                report.id === action.payload.reportId && report.reply_count > 0
                ? { ...report, reply_count: report.reply_count - 1 }
                : report
            )
        };
    }
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_ACTIVE_SYSTEM_VIEW':
        return { ...state, activeSystemView: action.payload, activeChatId: null, activeReportId: null, activeTownHallCategory: null, sidebarProfileId: null, isQuietSpaceActive: false, stateComparisonIds: { state1: null, state2: null } };
    case 'SHOW_TOAST':
      return { ...state, toast: { id: Date.now(), message: action.payload.message, type: action.payload.type || 'success' } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'LOGOUT':
        supabase.auth.signOut();
        return { ...state, toast: { id: Date.now(), message: "You have signed out.", type: 'success' } };
    case 'SHOW_AUTH_OVERLAY':
      return { ...state, isAuthOverlayVisible: true, authOverlayMode: action.payload, isQuietSpaceActive: false };
    case 'HIDE_AUTH_OVERLAY':
      return { ...state, isAuthOverlayVisible: false, authOverlayMode: null };
    case 'GO_HOME':
        return {
            ...state,
            activeTab: ListPanelTab.CHATS,
            activeChatId: null,
            activeTownHallCategory: null,
            activeReportId: null,
            activeSystemView: null,
            sidebarProfileId: null,
            isQuietSpaceActive: false,
            stateComparisonIds: { state1: null, state2: null },
        };
    case 'SET_TOWNHALL_SUB_TAB':
        return { ...state, townHallSubTab: action.payload };
    case 'SET_TOWNHALL_FILTERS':
        return { ...state, townHallFilters: action.payload };
    case 'SET_CANDIDATES':
        return { ...state, candidates: action.payload };
    case 'UPDATE_CANDIDATE_ENDORSEMENT':
        return {
            ...state,
            candidates: state.candidates.map(c =>
                c.id === action.payload.candidateId
                    ? { ...c, endorsement_count: (c.endorsement_count || 0) + 1 }
                    : c
            ),
        };
    case 'SET_NIGERIA_SUB_TAB':
        return { ...state, nigeriaSubTab: action.payload };
    case 'SET_UNIGERIAN_SUB_TAB':
        return { ...state, unigerianSubTab: action.payload };
    case 'SET_UNIGERIAN_FILTERS':
        return { ...state, unigerianFilters: action.payload };
    case 'SET_REPRESENTATIVES':
        return { ...state, representatives: action.payload };
    case 'SET_ANNOUNCEMENTS':
        return { ...state, announcements: action.payload };
    case 'ADD_ANNOUNCEMENT':
        return { ...state, announcements: [action.payload, ...state.announcements] };
    case 'SET_NOTIFICATIONS':
        return { ...state, notifications: action.payload };
    case 'SET_UNREAD_NOTIFICATION_COUNT':
        return { ...state, unreadNotificationCount: action.payload };
    case 'DECREMENT_UNREAD_COUNT':
        const newCount = state.unreadNotificationCount - action.payload;
        return { ...state, unreadNotificationCount: newCount < 0 ? 0 : newCount };
    case 'SET_LEADERBOARD_DATA':
        return { ...state, leaderboardUsers: action.payload };
    case 'SET_LEADERBOARD_FILTERS':
        return { ...state, leaderboardFilters: action.payload };
    case 'SET_STATE_COMPARISON':
        return {
            ...state,
            stateComparisonIds: { state1: action.payload.state1Id, state2: action.payload.state2Id },
            activeChatId: null,
            activeTownHallCategory: null,
            activeReportId: null,
            activeSystemView: null,
            sidebarProfileId: null,
        };
    case 'CLEAR_STATE_COMPARISON':
        return {
            ...state,
            stateComparisonIds: { state1: null, state2: null },
            nigeriaSubTab: NigeriaSubTab.ALL_STATES, // Return to the list view
        };
    case 'SHOW_SIDEBAR_PROFILE':
        return { ...state, sidebarProfileId: action.payload, activeChatId: null };
    case 'HIDE_SIDEBAR_PROFILE':
        return { ...state, sidebarProfileId: null };
    case 'TOGGLE_QUIET_SPACE':
        const newQuietSpaceState = !state.isQuietSpaceActive;
        // If deactivating quiet space, return to a default view.
        if (!newQuietSpaceState && state.activeTab === ListPanelTab.QUIET) {
            return {
                ...state,
                isQuietSpaceActive: false,
                activeTab: ListPanelTab.CHATS, // Or last active tab
            };
        }
        return { ...state, isQuietSpaceActive: newQuietSpaceState, activeTab: newQuietSpaceState ? ListPanelTab.QUIET : state.activeTab };
    case 'SET_AUTH_LOADING':
        return { ...state, isLoadingAuth: action.payload };
    case 'SET_SESSION':
        return { 
            ...state, 
            session: action.payload,
            isAuthenticated: !!action.payload,
        };
     case 'SET_UNREAD_COUNTS':
        return { ...state, unreadCounts: action.payload };
    case 'INCREMENT_UNREAD_COUNT':
        return {
            ...state,
            unreadCounts: {
                ...state.unreadCounts,
                [action.payload.chatId]: (state.unreadCounts[action.payload.chatId] || 0) + 1,
            },
        };
    case 'RESET_UNREAD_COUNT':
        const newCounts = { ...state.unreadCounts };
        delete newCounts[action.payload.chatId];
        return { ...state, unreadCounts: newCounts };
     case 'SET_THEME':
        return { ...state, theme: action.payload };
     case 'SHOW_CREATE_REPORT_MODAL':
        return { ...state, isCreateReportModalOpen: true };
    case 'HIDE_CREATE_REPORT_MODAL':
        return { ...state, isCreateReportModalOpen: false };
    case 'START_CREATE_REPORT':
        return {
            ...state,
            isCreatingReport: true,
            reportCreationCategoryId: action.payload.categoryId,
            isCreateReportModalOpen: false,
            // Clear other views
            activeChatId: null,
            activeReportId: null,
            activeTownHallCategory: null,
            activeSystemView: null,
            sidebarProfileId: null,
        };
    case 'CANCEL_CREATE_REPORT':
        return {
            ...state,
            isCreatingReport: false,
            reportCreationCategoryId: null,
        };
    default:
      return state;
  }
};

const UNREAD_COUNTS_KEY = 'unigeria_unread_counts';
const THEME_KEY = 'unigeria_theme';
const CHAT_LIST_DETAILS_KEY = 'unigeria_chat_list_details';


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Rehydrate state from localStorage on initial load
  useEffect(() => {
    try {
        const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
        if (storedTheme) {
            dispatch({ type: 'SET_THEME', payload: storedTheme });
        }

        const storedCounts = localStorage.getItem(UNREAD_COUNTS_KEY);
        if (storedCounts) {
            dispatch({ type: 'SET_UNREAD_COUNTS', payload: JSON.parse(storedCounts) });
        }

        const storedDetails = localStorage.getItem(CHAT_LIST_DETAILS_KEY);
        if (storedDetails) {
            dispatch({ type: 'SET_CHAT_LIST_DETAILS', payload: JSON.parse(storedDetails) });
        }

    } catch (e) {
        console.error("Failed to read from localStorage", e);
    }
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem(THEME_KEY, state.theme);
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
  }, [state.theme]);

  useEffect(() => {
    try {
        localStorage.setItem(UNREAD_COUNTS_KEY, JSON.stringify(state.unreadCounts));
    } catch (e) {
        console.error("Failed to save unread counts to localStorage", e);
    }
  }, [state.unreadCounts]);

  useEffect(() => {
    try {
        localStorage.setItem(CHAT_LIST_DETAILS_KEY, JSON.stringify(state.chatListDetails));
    } catch (e) {
        console.error("Failed to save chat list details to localStorage", e);
    }
  }, [state.chatListDetails]);

  // Effect to load Town Hall data dynamically
  useEffect(() => {
    const fetchTownHallData = async () => {
        if (!state.isAuthenticated) {
            dispatch({ type: 'SET_TOWNHALL_DATA', payload: { categories: [], reports: [] } });
            dispatch({ type: 'SET_CANDIDATES', payload: [] });
            return;
        }

        if (state.activeTab === ListPanelTab.TOWN_HALLS) {
            const categories = await getTownHallCategories();

            if (state.townHallSubTab === TownHallSubTab.CANDIDATES) {
                const candidates = await getCandidates(state.townHallFilters);
                dispatch({ type: 'SET_CANDIDATES', payload: candidates });
            } else {
                const reports = await getReports(
                    state.townHallSubTab === TownHallSubTab.HOT_REPORTS ? state.townHallFilters : {}
                );
                
                const categoryStats = reports.reduce((acc, report) => {
                    if (!acc[report.category_id]) {
                        acc[report.category_id] = { reports: 0, posts: 0 };
                    }
                    acc[report.category_id].reports += 1;
                    acc[report.category_id].posts += (report.reply_count + 1);
                    return acc;
                }, {} as { [key: string]: { reports: number, posts: number } });

                const categoriesWithStats = categories.map(cat => ({
                    ...cat,
                    reports: categoryStats[cat.id]?.reports || 0,
                    posts: categoryStats[cat.id]?.posts || 0
                }));

                dispatch({ type: 'SET_TOWNHALL_DATA', payload: { categories: categoriesWithStats, reports } });
            }
        }
    };

    fetchTownHallData();
  }, [state.isAuthenticated, state.activeTab, state.townHallSubTab, state.townHallFilters]);
  
  // Effect for UNigerians tab data
  useEffect(() => {
    const fetchUnigerianData = async () => {
        if (!state.isAuthenticated || state.activeTab !== ListPanelTab.UNIGERIANS) return;

        if (state.unigerianSubTab === UnigerianSubTab.REPS) {
            const reps = await getRepresentatives(state.unigerianFilters);
            dispatch({ type: 'SET_REPRESENTATIVES', payload: reps });
        } else if (state.unigerianSubTab === UnigerianSubTab.ANNOUNCEMENTS) {
            const announcements = await getAnnouncements(state.unigerianFilters);
            dispatch({ type: 'SET_ANNOUNCEMENTS', payload: announcements });
        }
    };
    fetchUnigerianData();
  }, [state.isAuthenticated, state.activeTab, state.unigerianSubTab, state.unigerianFilters]);

  // Effect for Leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
        if (!state.isAuthenticated || state.activeTab !== ListPanelTab.LEADERBOARD) return;
        const users = await getLeaderboard(state.leaderboardFilters);
        dispatch({ type: 'SET_LEADERBOARD_DATA', payload: users });
    };
    fetchLeaderboardData();
  }, [state.isAuthenticated, state.activeTab, state.leaderboardFilters]);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
            // Clear all local data on auth change for data integrity
            await clearAllLocalChats();
            dispatch({ type: 'SET_CHAT_LIST_DETAILS', payload: {} });
            dispatch({ type: 'SET_UNREAD_COUNTS', payload: {} });
            localStorage.removeItem(UNREAD_COUNTS_KEY);
            localStorage.removeItem(CHAT_LIST_DETAILS_KEY);
        }

        if (_event === 'PASSWORD_RECOVERY') {
            dispatch({ type: 'SHOW_TOAST', payload: { message: "You can now sign in with your new password." } });
            dispatch({ type: 'SHOW_AUTH_OVERLAY', payload: 'login' });
        }

        dispatch({ type: 'SET_SESSION', payload: session });

        if (session) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                const userProfile: UserProfile = { ...(profileData as any), manifesto: (profileData as any).manifesto as any, email: session.user.email };
                dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
            } else if (_event === 'SIGNED_IN') {
                 const newProfileData: UserProfile = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
                    avatar: session.user.user_metadata?.avatar_url || `https://picsum.photos/seed/${session.user.id}/96/96`,
                    title: session.user.user_metadata?.title || 'UNigeria Member'
                };
                const { endorsement_count, ...dbProfile } = newProfileData;
                await upsertProfile(dbProfile as any);
                dispatch({ type: 'SET_USER_PROFILE', payload: newProfileData });
            }
        } else {
             dispatch({ type: 'SET_USER_PROFILE', payload: defaultUserProfile });
        }
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [dispatch]);

  // Fetch initial notifications and subscribe to realtime updates
  useEffect(() => {
      if (state.isAuthenticated && state.userProfile.id) {
          const fetchInitialData = async () => {
            if (!state.userProfile.id) return;
              const [notifications, count] = await Promise.all([
                  getNotifications(state.userProfile.id),
                  getUnreadNotificationCount(state.userProfile.id)
              ]);
              dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
              dispatch({ type: 'SET_UNREAD_NOTIFICATION_COUNT', payload: count });
          };
          fetchInitialData();

          const notificationChannel = supabase
              .channel(`public:notifications:user_id=eq.${state.userProfile.id}`)
              .on('postgres_changes', 
                  { event: 'INSERT', schema: 'public', table: 'notifications' },
                  (payload) => {
                      const newNotification = payload.new as Notification;
                      dispatch({ type: 'SET_NOTIFICATIONS', payload: [newNotification, ...state.notifications] });
                      dispatch({ type: 'SET_UNREAD_NOTIFICATION_COUNT', payload: state.unreadNotificationCount + 1 });
                      dispatch({ type: 'SHOW_TOAST', payload: { message: newNotification.title } });
                  }
              )
              .subscribe();

          return () => {
              supabase.removeChannel(notificationChannel);
          };
      }
  }, [state.isAuthenticated, state.userProfile.id, dispatch, state.notifications, state.unreadNotificationCount]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);
