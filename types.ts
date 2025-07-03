import { ReactNode } from "react";
import type { Session, User } from '@supabase/supabase-js';

export enum PersonaType {
  STATE = "state",
  PERSON = "person",
  FORUM = "forum",
  UNIGERIAN = "unigerian",
  TOWNHALL = "townhall",
}

export enum PersonSubtype {
  CURRENT_LEADER = "Current Leaders",
  FORMER_LEADER = "Former Leaders",
  NOTABLE_PERSON = "Notable People",
}

export enum TownHallSubTab {
  HOT_REPORTS = 'hot_reports',
  CATEGORIES = 'categories',
  MY_REPORTS = 'my_reports',
  CANDIDATES = 'candidates',
  LGA_INSIGHTS = 'lga_insights',
}

export enum UnigerianSubTab {
    REPS = 'reps',
    ANNOUNCEMENTS = 'announcements',
}

export interface ManifestoItem {
  topic: string;
  stance: string;
}

export interface UserProfile {
  id?: string; // From auth.users
  name: string;
  title: string;
  avatar: string;
  email?: string; // From auth.users
  state?: string;
  lga?: string;
  ward?: string;
  is_candidate?: boolean;
  is_representative?: boolean;
  tenure_end_date?: string;
  endorsement_count?: number;
  manifesto?: ManifestoItem[];
  reputation_score?: number;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai" | string; // 'user' or author's name for forums
  timestamp: number;
  updated_at?: number; // For tracking edits
  likes?: string[]; // Array of user IDs who liked the post
  type?: "text" | "image" | "post";
  isStreaming?: boolean;
  isThinking?: boolean;
  isLoading?: boolean; // For image loading state
  imageData?: string; // For base64 image data
  authorInfo?: {
    name: string;
    avatar: string;
  };
  isOriginalPost?: boolean;
  groundingChunks?: GroundingChunk[];
  isCurrentSearchResult?: boolean;
  error?: string;
}

export interface ChatHistory {
  [chatId: string]: Message[];
}

export interface Persona {
  id: string;
  name:string;
  type: PersonaType;
  subtype?: PersonSubtype;
  avatar: string;
  description: string;
  subtitle: string;
  systemInstruction: string;
  greeting: string;
  useSearchGrounding?: boolean;
}

export interface Profile {
  id: string;
  name: string;
  personaType: PersonaType;
  personSubtype?: PersonSubtype;
  avatar: string;
  title?: string; // For people and unigerians
  description: string;
  sections?: { title: string; content: string }[]; // Deprecated for Person, use specific fields

  // Person-specific
  dateOfBirth?: string;
  city?: string;
  stateOfOrigin?: string;
  profession?: string;
  earlyLifeAndEducation?: string;
  careerHighlights?: string[];
  legacyAndImpact?: string;
  awardsAndHonours?: string[];
  notableQuotes?: string[];
  termEndDate?: string; // YYYY-MM-DD for sorting former leaders
  projects?: string[]; // For developmental projects

  // UNigerian-specific
  hometown?: string;

  // State-specific
  slogan?: string; // Replaces 'title' for states
  demonym?: string;
  capital?: string;
  dateCreated?: string;
  governor?: string;
  website?: string;
  majorEthnicGroups?: string[];
  landArea?: string; // e.g., "70,898 sq km"
  gdp?: string; // e.g., "Approx. $4.5 Billion"
  literacyRate?: string; // e.g., "67%"
  lgas?: number;
  population?: string;
  naturalResources?: string[];
  economySources?: string[];
  majorIndustries?: string[];
  notableSites?: string[];
  universities?: string[];
  region?: string;
  
  // Town Hall-specific
  keyTopics?: string[];
  forumRules?: string[];
}

export interface TownHallCategory {
  id: string;
  name: string;
  description: string;
  iconName: string; // Changed from ReactNode to string for DB storage
  // reports and posts counts will be calculated on the client
  reports?: number;
  posts?: number;
}

export type ReportStatus = 'New' | 'Under Review' | 'Acknowledged' | 'Resolved';

export interface Report {
  id: string;
  title: string;
  author_id: string; // From Supabase
  category_id: string; // From Supabase
  created_at: string; // From Supabase
  updated_at: string;
  reply_count: number; // From Supabase
  status: ReportStatus;
  location?: {
    state: string;
    lga: string;
    ward: string;
  }
  // Client-side populated fields
  author: {
    name: string;
    avatar: string;
  };
  lastReply: string;
}

export interface Endorsement {
    id: string;
    candidate_id: string;
    endorser_id: string;
    created_at: string;
    election_cycle: string; // e.g., "2024-2026"
    weight: number;
}

export type NotificationType = 'new_reply' | 'status_change' | 'new_endorsement' | 'announcement';

export interface Notification {
    id: string;
    created_at: string;
    user_id: string; // The user who receives the notification
    type: NotificationType;
    title: string;
    body: string;
    link: string; // e.g., /townhall/report/123
    is_read: boolean;
    author_avatar?: string; // Avatar of the person who triggered the notification
}

export interface Announcement {
    id: string;
    author_id: string;
    title: string;
    content: string;
    created_at: string;
    lga: string;
    state: string;
    author: {
        name: string;
        avatar: string;
    };
}

export type ReputationEventType = 'create_report' | 'like_post_received' | 'report_resolved' | 'endorse_candidate' | 'receive_endorsement';

export interface ReputationEvent {
    id: string;
    user_id: string;
    type: ReputationEventType;
    points: number;
    created_at: string;
    related_id?: string;
    related_text?: string;
}

export interface CivicRank {
    name: string;
    minScore: number;
    icon: React.ComponentType<{ className?: string }>;
}


export interface ChatListItemData {
  id: string;
  type: PersonaType;
  avatar: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  dateCreated?: string;
  lgas?: number;
}

export interface ModeratedResponseItem {
  speaker: string;
  text: string;
}

export interface ChatListDetail {
  lastMessage: string;
  timestamp: number;
}

export type { Session, User };