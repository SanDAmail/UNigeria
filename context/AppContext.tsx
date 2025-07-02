import React, { createContext, useReducer, useContext, Dispatch, ReactNode, useEffect } from 'react';
import { PersonaType, ChatListDetail, UserProfile, Report, PersonSubtype, TownHallSubTab, Message, TownHallCategory, Session, User, Persona } from '../types';
import { clearAllLocalChats, getTownHallCategories, getReports } from '../services/dbService';
import { supabase, upsertProfile } from '../services/supabaseService';
import { PERSONA_LIST } from '../constants';

export enum ListPanelTab {
  CHATS = 'chats',
  NIGERIA = 'nigeria',
  PEOPLE_CURRENT = 'people_current',
  PEOPLE_FORMER = 'people_former',
  PEOPLE_NOTABLE = 'people_notable',
  TOWN_HALLS = 'town_halls',
  UNIGERIANS = 'unigerians',
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
  townHallCategories: TownHallCategory[];
  userProfile: UserProfile;
  activeSystemView: 'settings' | null;
  toast: ToastState | null;
  isAuthenticated: boolean;
  isAuthOverlayVisible: boolean;
  authOverlayMode: 'login' | 'register' | null;
  townHallSubTab: TownHallSubTab;
  townHallFilters: { state: string; lga: string; };
  nigeriaSubTab: NigeriaSubTab;
  stateComparisonIds: { state1: string | null; state2: string | null };
  sidebarProfileId: string | null;
  isQuietSpaceActive: boolean;
  session: Session | null;
  isLoadingAuth: boolean;
  unreadCounts: { [chatId: string]: number };
  theme: Theme;
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
  | { type: 'SET_NIGERIA_SUB_TAB'; payload: NigeriaSubTab }
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
  | { type: 'SET_THEME'; payload: Theme };

const defaultUserProfile: UserProfile = {
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
  townHallCategories: [],
  userProfile: defaultUserProfile,
  activeSystemView: null,
  toast: null,
  isAuthenticated: false,
  isAuthOverlayVisible: false,
  authOverlayMode: null,
  townHallSubTab: TownHallSubTab.HOT_REPORTS,
  townHallFilters: { state: '', lga: '' },
  nigeriaSubTab: NigeriaSubTab.ALL_STATES,
  stateComparisonIds: { state1: null, state2: null },
  sidebarProfileId: null,
  isQuietSpaceActive: false,
  session: null,
  isLoadingAuth: true,
  unreadCounts: {},
  theme: 'light',
};

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<Action>>(() => null);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      if (action.payload === ListPanelTab.QUIET) {
        return { ...state, isQuietSpaceActive: true };
      }
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
    case 'SET_NIGERIA_SUB_TAB':
        return { ...state, nigeriaSubTab: action.payload };
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
        // If activating quiet space, no other changes needed.
        // If deactivating, we might want to return to a default view.
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

  // Effect to load global data (like Town Halls)
  useEffect(() => {
    const fetchGlobalData = async () => {
        if (state.isAuthenticated) {
            const [categories, reportsFromDb] = await Promise.all([
                getTownHallCategories(),
                getReports() // Initially fetch all reports
            ]);
            
            const categoryStats = reportsFromDb.reduce((acc, report) => {
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
            
            dispatch({ type: 'SET_TOWNHALL_DATA', payload: { categories: categoriesWithStats, reports: reportsFromDb } });
        } else {
             dispatch({ type: 'SET_TOWNHALL_DATA', payload: { categories: [], reports: [] } });
        }
    };

    fetchGlobalData();
  }, [state.isAuthenticated]);


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
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                dispatch({ type: 'SET_USER_PROFILE', payload: { ...profile, email: session.user.email } });
            } else if (_event === 'SIGNED_IN') {
                 const newProfileData: UserProfile = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
                    avatar: session.user.user_metadata?.avatar_url || `https://picsum.photos/seed/${session.user.id}/96/96`,
                    title: session.user.user_metadata?.title || 'UNigeria Member'
                };
                await upsertProfile(newProfileData as any);
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
  }, []);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);