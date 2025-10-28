"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Chat {
  id: number
  campaignId?: number
  campaignTitle?: string
  influencerId?: number
  influencerName: string
  influencerAvatar: string
  advertiserId?: number
  advertiserName?: string
  advertiserAvatar?: string
  lastMessage: string
  time: string
  unreadCount: number
  isUnread: boolean
  isActiveCollaboration: boolean
  initiatedBy: "influencer" | "advertiser"
  status: "pending" | "accepted" | "rejected" | "active"
  messages: Array<{
    id: number
    senderId: number
    senderType: "influencer" | "advertiser"
    content: string
    timestamp: string
    type: "text" | "proposal" | "campaign_card" | "profile_card"
  }>
}

interface ChatStore {
  chats: Chat[]
  addChat: (chat: Omit<Chat, "id">) => number
  updateChatStatus: (chatId: number, status: Chat["status"]) => void
  addMessage: (chatId: number, message: Omit<Chat["messages"][0], "id">) => void
  getChatById: (chatId: number) => Chat | undefined
  getChatsForInfluencer: (influencerId: number) => Chat[]
  getChatsForAdvertiser: (advertiserId: number) => Chat[]
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],

      addChat: (chat) => {
        const newId = Math.max(0, ...get().chats.map((c) => c.id)) + 1
        const newChat = { ...chat, id: newId }
        set((state) => ({
          chats: [...state.chats, newChat],
        }))
        console.log("[v0] Created new chat:", newId, "initiated by:", chat.initiatedBy)
        return newId
      },

      updateChatStatus: (chatId, status) => {
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, status } : chat)),
        }))
        console.log("[v0] Updated chat", chatId, "status to:", status)
      },

      addMessage: (chatId, message) => {
        const newMessageId = Date.now()
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, { ...message, id: newMessageId }],
                  lastMessage: message.content,
                  time: message.timestamp,
                  unreadCount: chat.unreadCount + 1,
                  isUnread: true,
                }
              : chat,
          ),
        }))
        console.log("[v0] Added message to chat:", chatId)
      },

      getChatById: (chatId) => {
        return get().chats.find((chat) => chat.id === chatId)
      },

      getChatsForInfluencer: (influencerId) => {
        const chats = get().chats.filter((chat) => chat.influencerId === influencerId)
        return chats.filter((chat) => {
          // Scenario 1: Influencer applied - only show if accepted
          if (chat.initiatedBy === "influencer") {
            return chat.status === "accepted" || chat.status === "active"
          }
          // Scenario 2: Advertiser initiated - show immediately
          return true
        })
      },

      getChatsForAdvertiser: (advertiserId) => {
        return get().chats.filter((chat) => chat.advertiserId === advertiserId)
      },
    }),
    {
      name: "chat-storage",
    },
  ),
)
