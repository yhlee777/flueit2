"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ChatMessage {
  id: number
  senderId: number
  senderType: "influencer" | "advertiser"
  content: string
  timestamp: string
  type: "text" | "image" | "file" | "proposal" | "campaign_card" | "profile_card"
  fileUrl?: string
  fileName?: string
  fileSize?: number
  isRead: boolean
  readAt?: string
}

export interface Chat {
  id: number
  campaignId?: number
  campaignTitle?: string
  influencerId: number
  influencerName: string
  influencerAvatar: string
  advertiserId: number
  advertiserName: string
  advertiserAvatar: string
  lastMessage: string
  time: string
  unreadCount: number
  isUnread: boolean
  isActiveCollaboration: boolean
  initiatedBy: "influencer" | "advertiser"
  status: "pending" | "accepted" | "rejected" | "active"
  messages: ChatMessage[]
  typingStatus?: {
    userId: number
    isTyping: boolean
    timestamp: string
  }
  isBlocked?: boolean
  blockedBy?: number
  isArchived?: boolean
  lastReadMessageId?: number
}

interface ChatStore {
  chats: Chat[]
  
  // 채팅 관리
  addChat: (chat: Omit<Chat, "id">) => number
  updateChatStatus: (chatId: number, status: Chat["status"]) => void
  deleteChat: (chatId: number) => void
  archiveChat: (chatId: number) => void
  unarchiveChat: (chatId: number) => void
  
  // 메시지 관리
  addMessage: (chatId: number, message: Omit<ChatMessage, "id">) => void
  addMessages: (chatId: number, messages: Omit<ChatMessage, "id">[]) => void
  deleteMessage: (chatId: number, messageId: number) => void
  
  // 읽음 처리
  markAsRead: (chatId: number, userId: number) => void
  markMessageAsRead: (chatId: number, messageId: number) => void
  markAllAsRead: (userId: number) => void
  getUnreadCount: (userId: number, userType: "influencer" | "advertiser") => number
  
  // 타이핑 상태
  setTypingStatus: (chatId: number, userId: number, isTyping: boolean) => void
  getTypingStatus: (chatId: number, userId: number) => boolean
  
  // 차단 기능
  blockUser: (chatId: number, blockerId: number) => void
  unblockUser: (chatId: number) => void
  
  // 조회 기능
  getChatById: (chatId: number) => Chat | undefined
  getChatsForInfluencer: (influencerId: number) => Chat[]
  getChatsForAdvertiser: (advertiserId: number) => Chat[]
  getArchivedChats: (userId: number) => Chat[]
  
  // 검색 기능
  searchChats: (query: string, userId: number) => Chat[]
  searchMessages: (chatId: number, query: string) => ChatMessage[]
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],

      // 채팅 추가
      addChat: (chat) => {
        const newId = Math.max(0, ...get().chats.map((c) => c.id)) + 1
        const newChat: Chat = { 
          ...chat, 
          id: newId,
          messages: chat.messages || [],
          isBlocked: false,
          isArchived: false,
        }
        set((state) => ({
          chats: [...state.chats, newChat],
        }))
        console.log("[ChatStore] Created new chat:", newId)
        return newId
      },

      // 채팅 상태 업데이트
      updateChatStatus: (chatId, status) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, status } : chat
          ),
        }))
        console.log("[ChatStore] Updated chat", chatId, "status to:", status)
      },

      // 채팅 삭제
      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
        }))
        console.log("[ChatStore] Deleted chat:", chatId)
      },

      // 채팅 보관
      archiveChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, isArchived: true } : chat
          ),
        }))
      },

      // 채팅 보관 해제
      unarchiveChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, isArchived: false } : chat
          ),
        }))
      },

      // 메시지 추가
      addMessage: (chatId, message) => {
        const newMessageId = Date.now() + Math.random()
        const newMessage: ChatMessage = {
          ...message,
          id: newMessageId,
          isRead: false,
        }

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  lastMessage: message.content,
                  time: message.timestamp,
                  unreadCount: chat.unreadCount + 1,
                  isUnread: true,
                }
              : chat
          ),
        }))
        console.log("[ChatStore] Added message to chat:", chatId)
      },

      // 여러 메시지 추가 (대량 로드)
      addMessages: (chatId, messages) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    ...messages.map((msg, idx) => ({
                      ...msg,
                      id: Date.now() + idx,
                      isRead: false,
                    })),
                  ],
                }
              : chat
          ),
        }))
      },

      // 메시지 삭제
      deleteMessage: (chatId, messageId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter((msg) => msg.id !== messageId),
                }
              : chat
          ),
        }))
      },

      // 채팅 읽음 처리
      markAsRead: (chatId, userId) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id !== chatId) return chat

            const updatedMessages = chat.messages.map((msg) =>
              msg.senderId !== userId && !msg.isRead
                ? { ...msg, isRead: true, readAt: new Date().toISOString() }
                : msg
            )

            return {
              ...chat,
              messages: updatedMessages,
              isUnread: false,
              unreadCount: 0,
              lastReadMessageId: updatedMessages[updatedMessages.length - 1]?.id,
            }
          }),
        }))
        console.log("[ChatStore] Marked chat as read:", chatId)
      },

      // 특정 메시지 읽음 처리
      markMessageAsRead: (chatId, messageId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, isRead: true, readAt: new Date().toISOString() }
                      : msg
                  ),
                }
              : chat
          ),
        }))
      },

      // 모든 채팅 읽음 처리
      markAllAsRead: (userId) => {
        set((state) => ({
          chats: state.chats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.senderId !== userId && !msg.isRead
                ? { ...msg, isRead: true, readAt: new Date().toISOString() }
                : msg
            ),
            isUnread: false,
            unreadCount: 0,
          })),
        }))
        console.log("[ChatStore] Marked all chats as read for user:", userId)
      },

      // 읽지 않은 메시지 수 가져오기
      getUnreadCount: (userId, userType) => {
        const chats =
          userType === "influencer"
            ? get().getChatsForInfluencer(userId)
            : get().getChatsForAdvertiser(userId)

        return chats.reduce((total, chat) => total + chat.unreadCount, 0)
      },

      // 타이핑 상태 설정
      setTypingStatus: (chatId, userId, isTyping) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  typingStatus: {
                    userId,
                    isTyping,
                    timestamp: new Date().toISOString(),
                  },
                }
              : chat
          ),
        }))
      },

      // 타이핑 상태 가져오기
      getTypingStatus: (chatId, userId) => {
        const chat = get().chats.find((c) => c.id === chatId)
        if (!chat?.typingStatus) return false

        // 타이핑 상태가 3초 이상 지났으면 false 반환
        const typingTime = new Date(chat.typingStatus.timestamp).getTime()
        const now = new Date().getTime()
        const isRecent = now - typingTime < 3000

        return (
          chat.typingStatus.userId !== userId &&
          chat.typingStatus.isTyping &&
          isRecent
        )
      },

      // 사용자 차단
      blockUser: (chatId, blockerId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, isBlocked: true, blockedBy: blockerId }
              : chat
          ),
        }))
        console.log("[ChatStore] Blocked user in chat:", chatId)
      },

      // 사용자 차단 해제
      unblockUser: (chatId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, isBlocked: false, blockedBy: undefined }
              : chat
          ),
        }))
        console.log("[ChatStore] Unblocked user in chat:", chatId)
      },

      // ID로 채팅 가져오기
      getChatById: (chatId) => {
        return get().chats.find((chat) => chat.id === chatId)
      },

      // 인플루언서의 채팅 목록 가져오기
      getChatsForInfluencer: (influencerId) => {
        const chats = get().chats.filter(
          (chat) => chat.influencerId === influencerId && !chat.isArchived
        )
        return chats
          .filter((chat) => {
            // 인플루언서가 신청한 경우 - 수락된 경우만 표시
            if (chat.initiatedBy === "influencer") {
              return chat.status === "accepted" || chat.status === "active"
            }
            // 광고주가 제안한 경우 - 모두 표시
            return true
          })
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      },

      // 광고주의 채팅 목록 가져오기
      getChatsForAdvertiser: (advertiserId) => {
        return get()
          .chats.filter(
            (chat) => chat.advertiserId === advertiserId && !chat.isArchived
          )
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      },

      // 보관된 채팅 가져오기
      getArchivedChats: (userId) => {
        return get()
          .chats.filter(
            (chat) =>
              chat.isArchived &&
              (chat.influencerId === userId || chat.advertiserId === userId)
          )
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      },

      // 채팅 검색
      searchChats: (query, userId) => {
        const allChats = get().chats.filter(
          (chat) =>
            (chat.influencerId === userId || chat.advertiserId === userId) &&
            !chat.isArchived
        )

        if (!query.trim()) return allChats

        const lowerQuery = query.toLowerCase()
        return allChats.filter(
          (chat) =>
            chat.influencerName.toLowerCase().includes(lowerQuery) ||
            chat.advertiserName?.toLowerCase().includes(lowerQuery) ||
            chat.campaignTitle?.toLowerCase().includes(lowerQuery) ||
            chat.lastMessage.toLowerCase().includes(lowerQuery)
        )
      },

      // 메시지 검색
      searchMessages: (chatId, query) => {
        const chat = get().chats.find((c) => c.id === chatId)
        if (!chat || !query.trim()) return []

        const lowerQuery = query.toLowerCase()
        return chat.messages.filter((msg) =>
          msg.content.toLowerCase().includes(lowerQuery)
        )
      },
    }),
    {
      name: "chat-storage",
      version: 2, // 버전 업그레이드
    }
  )
)

// 유틸리티 함수들
export const formatChatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "방금 전"
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "오후" : "오전"
  const displayHours = hours % 12 || 12
  return `${ampm} ${displayHours}:${minutes.toString().padStart(2, "0")}`
}

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith("image/")) return "🖼️"
  if (fileType.includes("pdf")) return "📄"
  if (fileType.includes("word") || fileType.includes("doc")) return "📝"
  if (fileType.includes("excel") || fileType.includes("sheet")) return "📊"
  return "📎"
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}
