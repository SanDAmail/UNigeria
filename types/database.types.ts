

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type NotificationType = "new_reply" | "status_change" | "new_endorsement" | "announcement"
export type ReputationEventType = "create_report" | "like_post_received" | "report_resolved" | "endorse_candidate" | "receive_endorsement"
export type ReportStatus = "New" | "Under Review" | "Acknowledged" | "Resolved"

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          lga: string
          state: string
          title: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          lga: string
          state: string
          title: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          lga?: string
          state?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          id: number
          message_content: Json
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: number
          message_content: Json
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: number
          message_content?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      endorsements: {
        Row: {
          candidate_id: string
          created_at: string
          election_cycle: string
          endorser_id: string
          id: string
          weight: number
        }
        Insert: {
          candidate_id: string
          created_at?: string
          election_cycle: string
          endorser_id: string
          id?: string
          weight?: number
        }
        Update: {
          candidate_id?: string
          created_at?: string
          election_cycle?: string
          endorser_id?: string
          id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_categories: {
        Row: {
          description: string
          id: string
          iconName: string
          name: string
        }
        Insert: {
          description: string
          id?: string
          iconName: string
          name: string
        }
        Update: {
          description?: string
          id?: string
          iconName?: string
          name?: string
        }
        Relationships: []
      }
      forum_topics: {
        Row: {
          author_id: string
          category_id: string
          created_at: string
          id: string
          location: Json | null
          reply_count: number
          status: ReportStatus
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id: string
          created_at?: string
          id?: string
          location?: Json | null
          reply_count?: number
          status?: ReportStatus
          title: string
          updated_at: string
        }
        Update: {
          author_id?: string
          category_id?: string
          created_at?: string
          id?: string
          location?: Json | null
          reply_count?: number
          status?: ReportStatus
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          author_avatar: string | null
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string
          title: string
          type: NotificationType
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link: string
          title: string
          type: NotificationType
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string
          title?: string
          type?: NotificationType
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar: string
          email: string | null
          id: string
          is_candidate: boolean | null
          is_representative: boolean | null
          lga: string | null
          manifesto: Json | null
          name: string
          reputation_score: number
          state: string | null
          tenure_end_date: string | null
          title: string
          ward: string | null
        }
        Insert: {
          avatar: string
          email?: string | null
          id: string
          is_candidate?: boolean | null
          is_representative?: boolean | null
          lga?: string | null
          manifesto?: Json | null
          name: string
          reputation_score?: number
          state?: string | null
          tenure_end_date?: string | null
          title: string
          ward?: string | null
        }
        Update: {
          avatar?: string
          email?: string | null
          id?: string
          is_candidate?: boolean | null
          is_representative?: boolean | null
          lga?: string | null
          manifesto?: Json | null
          name?: string
          reputation_score?: number
          state?: string | null
          tenure_end_date?: string | null
          title?: string
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reputation_events: {
        Row: {
          created_at: string
          id: string
          points: number
          related_id: string | null
          related_text: string | null
          type: ReputationEventType
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          related_id?: string | null
          related_text?: string | null
          type: ReputationEventType
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          related_id?: string | null
          related_text?: string | null
          type?: ReputationEventType
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reputation_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_topic_reply_count: {
        Args: {
          topic_id_arg: string
        }
        Returns: undefined
      }
      get_latest_messages_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          chat_id: string
          message_content: Json
        }[]
      }
      get_leaderboard: {
        Args: {
          state_filter: string | null
          lga_filter: string | null
        }
        Returns: {
          id: string
          name: string
          avatar: string
          title: string
          reputation_score: number
          state: string
          lga: string
        }[]
      }
      has_endorsed_in_lga_cycle: {
        Args: {
          p_endorser_id: string
          p_election_cycle: string
        }
        Returns: boolean
      }
      increment_topic_reply_count: {
        Args: {
          topic_id_arg: string
        }
        Returns: undefined
      }
      update_reputation: {
        Args: {
          user_id_arg: string
          event_type_arg: string
          points_arg: number
          related_id_arg: string | null
          related_text_arg: string | null
        }
        Returns: undefined
      }
    }
    Enums: {
      notification_type:
        | "new_reply"
        | "status_change"
        | "new_endorsement"
        | "announcement"
      reputation_event_type:
        | "create_report"
        | "like_post_received"
        | "report_resolved"
        | "endorse_candidate"
        | "receive_endorsement"
      report_status: "New" | "Under Review" | "Acknowledged" | "Resolved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
