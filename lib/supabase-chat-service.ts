"use client"

import { supabase } from './supabase-client'
import type { Database } from './supabase-client'

type Chat = Database['public']['Tables']['chats']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type ChatInsert = Database['public']['Tables']['chats']['Insert']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

// =============================================
// 채팅방 관련 함수
// =============================================

/**
 * 사용자의 채팅 목록 조회
 */
export async function getUserChats(userId: string, userType: 'influencer' | 'advertiser') {
  try {
    const column = userType === 'influencer' ? 'influencer_id' : 'advertiser_id'
    const archiveColumn = userType === 'influencer' 
      ? 'is_archived_by_influencer' 
      : 'is_archived_by_advertiser'

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq(column, userId)
      .eq(archiveColumn, false)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error fetching chats:', error)
    return { data: null, error }
  }
}

/**
 * 특정 채팅방 조회
 */
export async function getChatById(chatId: number) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error fetching chat:', error)
    return { data: null, error }
  }
}

/**
 * 새 채팅방 생성
 */
export async function createChat(chatData: ChatInsert) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert(chatData)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error creating chat:', error)
    return { data: null, error }
  }
}

/**
 * 채팅방 상태 업데이트
 */
export async function updateChatStatus(
  chatId: number, 
  status: Chat['status']
) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .update({ status })
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error updating chat status:', error)
    return { data: null, error }
  }
}

/**
 * 채팅방 보관
 */
export async function archiveChat(chatId: number, userId: string, userType: 'influencer' | 'advertiser') {
  try {
    const column = userType === 'influencer' 
      ? 'is_archived_by_influencer' 
      : 'is_archived_by_advertiser'

    const { data, error } = await supabase
      .from('chats')
      .update({ [column]: true })
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error archiving chat:', error)
    return { data: null, error }
  }
}

/**
 * 채팅방 삭제 (실제로는 보관 처리)
 */
export async function deleteChat(chatId: number, userId: string, userType: 'influencer' | 'advertiser') {
  return archiveChat(chatId, userId, userType)
}

/**
 * 사용자 차단
 */
export async function blockUser(chatId: number, blockerId: number) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .update({ 
        is_blocked: true,
        blocked_by: blockerId 
      })
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error blocking user:', error)
    return { data: null, error }
  }
}

// =============================================
// 메시지 관련 함수
// =============================================

/**
 * 채팅방의 메시지 목록 조회
 */
export async function getChatMessages(chatId: number, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error fetching messages:', error)
    return { data: null, error }
  }
}

/**
 * 메시지 전송
 */
export async function sendMessage(messageData: MessageInsert) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error sending message:', error)
    return { data: null, error }
  }
}

/**
 * 메시지 읽음 처리
 */
export async function markMessagesAsRead(chatId: number, userId: string) {
  try {
    // RPC 함수 호출
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_chat_id: chatId,
      p_user_id: userId,
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('[ChatService] Error marking messages as read:', error)
    return { error }
  }
}

/**
 * 안읽은 메시지 수 조회
 */
export async function getUnreadCount(chatId: number, userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_unread_count', {
      p_chat_id: chatId,
      p_user_id: userId,
    })

    if (error) throw error
    return { data: data || 0, error: null }
  } catch (error) {
    console.error('[ChatService] Error getting unread count:', error)
    return { data: 0, error }
  }
}

/**
 * 전체 안읽은 메시지 수 조회
 */
export async function getTotalUnreadCount(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_total_unread_count', {
      p_user_id: userId,
    })

    if (error) throw error
    return { data: data || 0, error: null }
  } catch (error) {
    console.error('[ChatService] Error getting total unread count:', error)
    return { data: 0, error }
  }
}

// =============================================
// 타이핑 상태 관련 함수
// =============================================

/**
 * 타이핑 상태 업데이트
 */
export async function updateTypingStatus(
  chatId: number,
  userId: string,
  userType: 'influencer' | 'advertiser',
  isTyping: boolean
) {
  try {
    const { data, error } = await supabase
      .from('typing_status')
      .upsert({
        chat_id: chatId,
        user_id: userId,
        user_type: userType,
        is_typing: isTyping,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error updating typing status:', error)
    return { data: null, error }
  }
}

/**
 * 타이핑 상태 조회
 */
export async function getTypingStatus(chatId: number) {
  try {
    const { data, error } = await supabase
      .from('typing_status')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_typing', true)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error getting typing status:', error)
    return { data: null, error }
  }
}

// =============================================
// 실시간 구독 함수
// =============================================

/**
 * 채팅방 변경사항 실시간 구독
 */
export function subscribeToChats(
  userId: string,
  userType: 'influencer' | 'advertiser',
  callback: (payload: any) => void
) {
  const column = userType === 'influencer' ? 'influencer_id' : 'advertiser_id'

  return supabase
    .channel(`chats:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `${column}=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

/**
 * 특정 채팅방의 새 메시지 실시간 구독
 */
export function subscribeToMessages(chatId: number, callback: (payload: any) => void) {
  return supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      callback
    )
    .subscribe()
}

/**
 * 타이핑 상태 실시간 구독
 */
export function subscribeToTypingStatus(chatId: number, callback: (payload: any) => void) {
  return supabase
    .channel(`typing:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `chat_id=eq.${chatId}`,
      },
      callback
    )
    .subscribe()
}

/**
 * 구독 해제
 */
export async function unsubscribe(channel: ReturnType<typeof supabase.channel>) {
  await supabase.removeChannel(channel)
}

// =============================================
// 파일 업로드 함수
// =============================================

/**
 * 파일을 Supabase Storage에 업로드
 */
export async function uploadFile(
  file: File,
  chatId: number,
  userId: string
) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `chat/${chatId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath)

    return {
      data: {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
      error: null,
    }
  } catch (error) {
    console.error('[ChatService] Error uploading file:', error)
    return { data: null, error }
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from('chat-files')
      .remove([filePath])

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('[ChatService] Error deleting file:', error)
    return { error }
  }
}

// =============================================
// 검색 함수
// =============================================

/**
 * 채팅 검색
 */
export async function searchChats(
  userId: string,
  userType: 'influencer' | 'advertiser',
  query: string
) {
  try {
    const column = userType === 'influencer' ? 'influencer_id' : 'advertiser_id'
    const nameColumn = userType === 'influencer' ? 'advertiser_name' : 'influencer_name'

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq(column, userId)
      .or(`${nameColumn}.ilike.%${query}%,campaign_title.ilike.%${query}%,last_message.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error searching chats:', error)
    return { data: null, error }
  }
}

/**
 * 메시지 검색
 */
export async function searchMessages(chatId: number, query: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .ilike('content', `%${query}%`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('[ChatService] Error searching messages:', error)
    return { data: null, error }
  }
}