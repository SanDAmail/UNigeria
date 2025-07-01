
import React, { createContext, useReducer, useContext, Dispatch, ReactNode } from 'react';
import { PersonaType, ChatListDetail, UserProfile, Topic, PersonSubtype, ForumSubTab, Message, ForumCategory } from '../types';
import { TOPICS_DATA, INITIAL_FORUM_CATEGORIES } from '../constants';
import { clearChatHistory } from '../services/dbService';

export enum ListPanelTab {
  CHATS = 'chats',
  NIGERIA = 'nigeria',
  PEOPLE_CURRENT = 'people_current',
  PEOPLE_FORMER = 'people_former',
  PEOPLE_NOTABLE = 'people_notable',
  FORUMS = 'forums',
  UNIGERIANS = 'unigerians',
  QUIET = 'quiet',
}

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface AppState {
  activeTab: ListPanelTab;
  activeChatId: string | null;
  activeForumCategory: string | null;
  activeTopicId: string | null;
  chatListDetails: { [chatId: string]: ChatListDetail };
  topics: { [categoryId: string]: Topic[] };
  forumCategories: ForumCategory[];
  userProfile: UserProfile;
  activeSystemView: 'settings' | null;
  toast: ToastState | null;
  isAuthenticated: boolean;
  isProfileOverlayVisible: boolean;
  isAuthOverlayVisible: boolean;
  authOverlayMode: 'login' | 'register' | null;
  forumSubTab: ForumSubTab;
  profileCardUser: UserProfile | null;
  isQuietSpaceActive: boolean;
}

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: ListPanelTab }
  | { type: 'SET_ACTIVE_CHAT'; payload: { type: PersonaType, id: string } }
  | { type: 'CLEAR_ACTIVE_CHAT' }
  | { type: 'SET_ACTIVE_FORUM_CATEGORY'; payload: string | null }
  | { type: 'SET_ACTIVE_TOPIC'; payload: string | null }
  | { type: 'SET_CHAT_LIST_DETAILS'; payload: { [chatId: string]: ChatListDetail } }
  | { type: 'UPDATE_CHAT_LIST_DETAIL'; payload: { chatId: string; detail: ChatListDetail } }
  | { type: 'ADD_TOPIC'; payload: { categoryId: string; topic: Topic } }
  | { type: 'DELETE_TOPIC'; payload: { categoryId: string; topicId: string } }
  | { type: 'ADD_FORUM_REPLIES'; payload: { categoryId: string; topicId: string; replies: Message[] } }
  | { type: 'SET_USER_PROFILE', payload: UserProfile }
  | { type: 'SET_ACTIVE_SYSTEM_VIEW', payload: 'settings' | null }
  | { type: 'SHOW_TOAST', payload: { message: string, type?: 'success' | 'error' } }
  | { type: 'HIDE_TOAST' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SHOW_PROFILE_OVERLAY' }
  | { type: 'HIDE_PROFILE_OVERLAY' }
  | { type: 'SHOW_AUTH_OVERLAY'; payload: 'login' | 'register' }
  | { type: 'HIDE_AUTH_OVERLAY' }
  | { type: 'GO_HOME' }
  | { type: 'SET_FORUM_SUB_TAB'; payload: ForumSubTab }
  | { type: 'SHOW_PROFILE_CARD'; payload: UserProfile }
  | { type: 'HIDE_PROFILE_CARD' }
  | { type: 'TOGGLE_QUIET_SPACE' };

const defaultUserProfile: UserProfile = {
  name: 'Citizen Ade',
  title: 'Concerned Nigerian',
  avatar: 'https://picsum.photos/seed/ade/40/40',
};

const loadUserProfile = (): UserProfile => {
  try {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
  } catch (e) {
    console.error("Failed to load user profile from localStorage", e);
  }
  return defaultUserProfile;
};

const loadTopics = (): { [categoryId: string]: Topic[] } => {
    try {
        const storedTopics = localStorage.getItem('forumTopics');
        if (storedTopics) {
            return JSON.parse(storedTopics);
        }
    } catch (e) {
        console.error("Failed to load topics from localStorage", e);
    }
    return TOPICS_DATA;
}

const saveTopics = (topics: { [categoryId: string]: Topic[] }) => {
    try {
        localStorage.setItem('forumTopics', JSON.stringify(topics));
    } catch (e) {
        console.error("Failed to save topics to localStorage", e);
    }
}

const loadForumCategories = (): ForumCategory[] => {
    try {
        const stored = localStorage.getItem('forumCategories');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load forum categories from localStorage", e);
    }
    return INITIAL_FORUM_CATEGORIES;
}

const saveForumCategories = (categories: ForumCategory[]) => {
    try {
        localStorage.setItem('forumCategories', JSON.stringify(categories));
    } catch (e) {
        console.error("Failed to save forum categories to localStorage", e);
    }
}

const loadAuthStatus = (): boolean => {
    try {
        const storedAuth = localStorage.getItem('isAuthenticated');
        return storedAuth ? JSON.parse(storedAuth) : false;
    } catch (e) {
        console.error("Failed to load auth status from localStorage", e);
        return false;
    }
}

const saveAuthStatus = (isAuthed: boolean) => {
    try {
        localStorage.setItem('isAuthenticated', JSON.stringify(isAuthed));
    } catch (e) {
        console.error("Failed to save auth status to localStorage", e);
    }
}


const initialState: AppState = {
  activeTab: ListPanelTab.CHATS,
  activeChatId: null,
  activeForumCategory: null,
  activeTopicId: null,
  chatListDetails: {},
  topics: loadTopics(),
  forumCategories: loadForumCategories(),
  userProfile: loadUserProfile(),
  activeSystemView: null,
  toast: null,
  isAuthenticated: loadAuthStatus(),
  isProfileOverlayVisible: false,
  isAuthOverlayVisible: false,
  authOverlayMode: null,
  forumSubTab: ForumSubTab.HOME,
  profileCardUser: null,
  isQuietSpaceActive: false,
};

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<Action>>(() => null);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      if (action.payload === ListPanelTab.QUIET) {
        return { ...state, isQuietSpaceActive: true };
      }
      return { ...state, activeTab: action.payload, isQuietSpaceActive: false };
    case 'SET_ACTIVE_CHAT':
      const chatId = `${action.payload.type}_${action.payload.id}`;
      return { ...state, activeChatId: chatId, activeTopicId: null, activeForumCategory: null, activeSystemView: null, isProfileOverlayVisible: false, isQuietSpaceActive: false };
    case 'CLEAR_ACTIVE_CHAT':
      return { ...state, activeChatId: null, activeTopicId: null, isProfileOverlayVisible: false };
    case 'SET_ACTIVE_FORUM_CATEGORY':
        return { ...state, activeForumCategory: action.payload, activeChatId: null, activeTopicId: null, activeSystemView: null, isQuietSpaceActive: false };
    case 'SET_ACTIVE_TOPIC':
        const topicChatId = `forum_${state.activeForumCategory}_${action.payload}`;
        return { ...state, activeTopicId: action.payload, activeChatId: topicChatId, activeSystemView: null, isQuietSpaceActive: false };
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
    case 'ADD_TOPIC': {
        const { categoryId, topic } = action.payload;
        const newTopics = {
            ...state.topics,
            [categoryId]: [...(state.topics[categoryId] || []), topic],
        };
        saveTopics(newTopics);

        // Update category stats
        const newCategories = state.forumCategories.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    topics: cat.topics + 1,
                    posts: cat.posts + 1 // The first post is also counted
                };
            }
            return cat;
        });
        saveForumCategories(newCategories);

        return { ...state, topics: newTopics, forumCategories: newCategories };
    }
    case 'DELETE_TOPIC': {
        const { categoryId, topicId } = action.payload;
        if (!state.topics[categoryId]) {
            return state;
        }

        const topicToDelete = state.topics[categoryId].find(t => t.id === topicId);
        const postCountInTopic = topicToDelete ? topicToDelete.replyCount + 1 : 1;

        const newTopics = {
            ...state.topics,
            [categoryId]: state.topics[categoryId].filter(t => t.id !== topicId),
        };
        saveTopics(newTopics);

        // Update category stats
        const newCategories = state.forumCategories.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    topics: Math.max(0, cat.topics - 1),
                    posts: Math.max(0, cat.posts - postCountInTopic)
                };
            }
            return cat;
        });
        saveForumCategories(newCategories);

        const chatIdToDelete = `forum_${categoryId}_${topicId}`;
        clearChatHistory(chatIdToDelete);

        return { 
            ...state, 
            topics: newTopics,
            forumCategories: newCategories,
            activeChatId: state.activeChatId === chatIdToDelete ? null : state.activeChatId,
            activeTopicId: state.activeTopicId === topicId ? null : state.activeTopicId
        };
    }
    case 'ADD_FORUM_REPLIES': {
      const { categoryId, topicId, replies } = action.payload;
      const replyCount = replies.length;
      if (replyCount === 0) return state;

      const lastReply = replies[replies.length - 1];
      const lastReplierName = lastReply.authorInfo?.name || 'AI';

      const newTopics = {
          ...state.topics,
          [categoryId]: (state.topics[categoryId] || []).map(topic => {
              if (topic.id === topicId) {
                  return {
                      ...topic,
                      replyCount: topic.replyCount + replyCount,
                      lastReply: `by ${lastReplierName}`
                  };
              }
              return topic;
          })
      };
      saveTopics(newTopics);

      const newCategories = state.forumCategories.map(cat => {
          if (cat.id === categoryId) {
              return { ...cat, posts: cat.posts + replyCount };
          }
          return cat;
      });
      saveForumCategories(newCategories);

      return { ...state, topics: newTopics, forumCategories: newCategories };
    }
    case 'SET_USER_PROFILE':
        try {
            localStorage.setItem('userProfile', JSON.stringify(action.payload));
        } catch (e) {
            console.error("Failed to save user profile to localStorage", e);
        }
        return { ...state, userProfile: action.payload };
    case 'SET_ACTIVE_SYSTEM_VIEW':
        return { ...state, activeSystemView: action.payload, activeChatId: null, activeTopicId: null, activeForumCategory: null, isQuietSpaceActive: false };
    case 'SHOW_TOAST':
      return { ...state, toast: { id: Date.now(), message: action.payload.message, type: action.payload.type || 'success' } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'LOGIN':
        saveAuthStatus(true);
        return { ...state, isAuthenticated: true, isAuthOverlayVisible: false, authOverlayMode: null };
    case 'LOGOUT':
        saveAuthStatus(false);
        // Reset user profile to default on logout
        localStorage.removeItem('userProfile');
        return { ...state, isAuthenticated: false, userProfile: defaultUserProfile, toast: { id: Date.now(), message: "You have signed out.", type: 'success' } };
    case 'SHOW_PROFILE_OVERLAY':
        return { ...state, isProfileOverlayVisible: true, isQuietSpaceActive: false };
    case 'HIDE_PROFILE_OVERLAY':
        return { ...state, isProfileOverlayVisible: false };
    case 'SHOW_AUTH_OVERLAY':
      return { ...state, isAuthOverlayVisible: true, authOverlayMode: action.payload, isQuietSpaceActive: false };
    case 'HIDE_AUTH_OVERLAY':
      return { ...state, isAuthOverlayVisible: false, authOverlayMode: null };
    case 'GO_HOME':
        return {
            ...state,
            activeTab: ListPanelTab.CHATS,
            activeChatId: null,
            activeForumCategory: null,
            activeTopicId: null,
            activeSystemView: null,
            isProfileOverlayVisible: false,
            isQuietSpaceActive: false,
        };
    case 'SET_FORUM_SUB_TAB':
        return { ...state, forumSubTab: action.payload };
    case 'SHOW_PROFILE_CARD':
        return { ...state, profileCardUser: action.payload };
    case 'HIDE_PROFILE_CARD':
        return { ...state, profileCardUser: null };
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
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);
