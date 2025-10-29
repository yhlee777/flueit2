"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  getUserChats,
  getChatMessages,
  sendMessage as sendMessageService,
  markMessagesAsRead,
  updateTypingStatus,
  subscribeToChats,
  subscribeToMessages,
  subscribeToTypingStatus,
  unsubscribe,
  uploadFile,
  getTotalUnreadCount,
} from './supabase-chat-service'
import type { Database } from './supabase-client'

type Chat = Database['public']['Tables']['chats']['Row']
type Message = Database['public']['Tables']['messages']['Row']

/**
 * 채팅 목록 관리 훅
 */
export function useChats(userId: string, userType: 'influencer' | 'advertiser') {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // 채팅 목록 로드
  const loadChats = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getUserChats(userId, userType)
    
    if (error) {
      setError(error)
    } else {
      setChats(data || [])
    }
    
    setLoading(false)
  }, [userId, userType])

  // 안읽은 메시지 수 로드
  const loadUnreadCount = useCallback(async () => {
    const { data } = await getTotalUnreadCount(userId)
    setUnreadCount(data)
  }, [userId])

  // 실시간 구독
  useEffect(() => {
    loadChats()
    loadUnreadCount()

    const channel = subscribeToChats(userId, userType, (payload) => {
      console.log('[useChats] Realtime update:', payload)
      
      if (payload.eventType === 'INSERT') {
        setChats((prev) => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setChats((prev) =>
          prev.map((chat) => (chat.id === payload.new.id ? payload.new : chat))
        )
      } else if (payload.eventType === 'DELETE') {
        setChats((prev) => prev.filter((chat) => chat.id !== payload.old.id))
      }

      loadUnreadCount()
    })

    return () => {
      unsubscribe(channel)
    }
  }, [userId, userType, loadChats, loadUnreadCount])

  return {
    chats,
    loading,
    error,
    unreadCount,
    refresh: loadChats,
  }
}

/**
 * 개별 채팅방 관리 훅
 */
export function useChatRoom(chatId: number, userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getChatMessages(chatId)
    
    if (error) {
      setError(error)
    } else {
      setMessages(data || [])
      // 메시지 읽음 처리
      await markMessagesAsRead(chatId, userId)
    }
    
    setLoading(false)
  }, [chatId, userId])

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string, messageType: Message['message_type'] = 'text') => {
      if (!content.trim()) return

      setIsSending(true)
      const { data, error } = await sendMessageService({
        chat_id: chatId,
        sender_id: userId,
        sender_type: 'influencer', // 실제로는 userType 전달
        content,
        message_type: messageType,
      })

      if (error) {
        console.error('[useChatRoom] Error sending message:', error)
      } else {
        // 낙관적 업데이트 (실시간 구독으로 자동 추가됨)
        console.log('[useChatRoom] Message sent:', data)
      }

      setIsSending(false)
    },
    [chatId, userId]
  )

  // 파일 전송
  const sendFile = useCallback(
    async (file: File) => {
      setIsSending(true)

      // 1. 파일 업로드
      const { data: fileData, error: uploadError } = await uploadFile(file, chatId, userId)

      if (uploadError || !fileData) {
        console.error('[useChatRoom] Error uploading file:', uploadError)
        setIsSending(false)
        return
      }

      // 2. 메시지 전송
      const messageType = file.type.startsWith('image/') ? 'image' : 'file'
      const { error: sendError } = await sendMessageService({
        chat_id: chatId,
        sender_id: userId,
        sender_type: 'influencer', // 실제로는 userType 전달
        content: file.name,
        message_type: messageType,
        file_url: fileData.url,
        file_name: fileData.name,
        file_size: fileData.size,
        file_type: fileData.type,
      })

      if (sendError) {
        console.error('[useChatRoom] Error sending file message:', sendError)
      }

      setIsSending(false)
    },
    [chatId, userId]
  )

  // 타이핑 상태 전송
  const handleTyping = useCallback(() => {
    updateTypingStatus(chatId, userId, 'influencer', true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(chatId, userId, 'influencer', false)
    }, 3000)
  }, [chatId, userId])

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 실시간 구독
  useEffect(() => {
    loadMessages()

    // 새 메시지 구독
    const messagesChannel = subscribeToMessages(chatId, (payload) => {
      console.log('[useChatRoom] New message:', payload)
      setMessages((prev) => [...prev, payload.new])
      scrollToBottom()

      // 자동 읽음 처리
      if (payload.new.sender_id !== userId) {
        markMessagesAsRead(chatId, userId)
      }
    })

    // 타이핑 상태 구독
    const typingChannel = subscribeToTypingStatus(chatId, (payload) => {
      console.log('[useChatRoom] Typing status:', payload)
      
      if (payload.new && payload.new.user_id !== userId) {
        setIsTyping(payload.new.is_typing)
      }
    })

    return () => {
      unsubscribe(messagesChannel)
      unsubscribe(typingChannel)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [chatId, userId, loadMessages, scrollToBottom])

  // 메시지 변경 시 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return {
    messages,
    loading,
    error,
    isTyping,
    isSending,
    sendMessage,
    sendFile,
    handleTyping,
    messagesEndRef,
    refresh: loadMessages,
  }
}

/**
 * 알림 권한 요청 및 푸시 알림 훅
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return 'denied'
  }, [])

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission === 'granted') {
        new Notification(title, options)
      }
    },
    [permission]
  )

  return {
    permission,
    requestPermission,
    sendNotification,
  }
}

/**
 * 온라인 상태 감지 훅
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * 사운드 재생 훅
 */
export function useSoundEffects(enabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && enabled) {
      audioRef.current = new Audio('/sounds/message.mp3')
    }
  }, [enabled])

  const playMessageSound = useCallback(() => {
    if (enabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [enabled])

  return { playMessageSound }
}