import { ReactNode } from "react";

export enum PersonaType {
  STATE = "state",
  PERSON = "person",
  FORUM = "forum",
  UNIGERIAN = "unigerian",
}

export enum PersonSubtype {
  CURRENT_LEADER = "Current Leaders",
  FORMER_LEADER = "Former Leaders",
  NOTABLE_PERSON = "Notable People",
}

export enum ForumSubTab {
  HOME = 'home',
  CATEGORIES = 'categories',
  MY_TOPICS = 'my_topics'
}

export interface UserProfile {
  name: string;
  title: string;
  avatar: string;
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
  
  // Forum-specific
  keyTopics?: string[];
  forumRules?: string[];
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  topics: number;
  posts: number;
}

export interface Topic {
  id:string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  replyCount: number;
  lastReply: string;
  categoryId: string;
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