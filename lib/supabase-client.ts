import { createClient } from '@supabase/supabase-js'

// Supabase 프로젝트 URL과 키
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// 채팅 관련 데이터베이스 타입 (UUID 버전)
export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          id: number
          campaign_id: string | null  // UUID → string
          campaign_title: string | null
          influencer_id: string  // UUID → string
          influencer_name: string
          influencer_avatar: string | null
          advertiser_id: string  // UUID → string
          advertiser_name: string
          advertiser_avatar: string | null
          last_message: string | null
          last_message_at: string
          initiated_by: 'influencer' | 'advertiser'
          status: 'pending' | 'accepted' | 'rejected' | 'active' | 'closed'
          is_active_collaboration: boolean
          is_archived_by_influencer: boolean
          is_archived_by_advertiser: boolean
          is_blocked: boolean
          blocked_by: string | null  // UUID → string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          campaign_id?: string | null  // UUID → string
          campaign_title?: string | null
          influencer_id: string  // UUID → string
          influencer_name: string
          influencer_avatar?: string | null
          advertiser_id: string  // UUID → string
          advertiser_name: string
          advertiser_avatar?: string | null
          last_message?: string | null
          last_message_at?: string
          initiated_by: 'influencer' | 'advertiser'
          status?: 'pending' | 'accepted' | 'rejected' | 'active' | 'closed'
          is_active_collaboration?: boolean
          is_archived_by_influencer?: boolean
          is_archived_by_advertiser?: boolean
          is_blocked?: boolean
          blocked_by?: string | null  // UUID → string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          campaign_id?: string | null  // UUID → string
          campaign_title?: string | null
          influencer_id?: string  // UUID → string
          influencer_name?: string
          influencer_avatar?: string | null
          advertiser_id?: string  // UUID → string
          advertiser_name?: string
          advertiser_avatar?: string | null
          last_message?: string | null
          last_message_at?: string
          initiated_by?: 'influencer' | 'advertiser'
          status?: 'pending' | 'accepted' | 'rejected' | 'active' | 'closed'
          is_active_collaboration?: boolean
          is_archived_by_influencer?: boolean
          is_archived_by_advertiser?: boolean
          is_blocked?: boolean
          blocked_by?: string | null  // UUID → string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          chat_id: number
          sender_id: string  // UUID → string
          sender_type: 'influencer' | 'advertiser'
          content: string
          message_type: 'text' | 'image' | 'file' | 'proposal' | 'campaign_card' | 'profile_card'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          is_read: boolean
          read_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          chat_id: number
          sender_id: string  // UUID → string
          sender_type: 'influencer' | 'advertiser'
          content: string
          message_type?: 'text' | 'image' | 'file' | 'proposal' | 'campaign_card' | 'profile_card'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          chat_id?: number
          sender_id?: string  // UUID → string
          sender_type?: 'influencer' | 'advertiser'
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'proposal' | 'campaign_card' | 'profile_card'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      typing_status: {
        Row: {
          id: number
          chat_id: number
          user_id: string  // UUID → string
          user_type: 'influencer' | 'advertiser'
          is_typing: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          chat_id: number
          user_id: string  // UUID → string
          user_type: 'influencer' | 'advertiser'
          is_typing?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          chat_id?: number
          user_id?: string  // UUID → string
          user_type?: 'influencer' | 'advertiser'
          is_typing?: boolean
          updated_at?: string
        }
      }
    }
  }
}

// 타입이 지정된 Supabase 클라이언트
export type TypedSupabaseClient = ReturnType<typeof createClient<Database>>
