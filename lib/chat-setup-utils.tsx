"use client"

import { useChatStore } from "@/lib/chat-store"

/**
 * 채팅 기능 초기 설정 및 테스트 데이터
 * 개발 환경에서 테스트용으로 사용
 */

export function initializeChatData() {
  const { addChat } = useChatStore.getState()

  // 테스트 채팅 데이터
  const testChats = [
    {
      campaignId: 1,
      campaignTitle: "뷰티 제품 체험단 모집",
      influencerId: 1,
      influencerName: "김민지",
      influencerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minji",
      advertiserId: 2,
      advertiserName: "뷰티코리아",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=BC",
      lastMessage: "네, 제품 받았습니다! 리뷰 작성할게요 😊",
      time: new Date(Date.now() - 300000).toISOString(), // 5분 전
      unreadCount: 1,
      isUnread: true,
      isActiveCollaboration: true,
      initiatedBy: "influencer" as const,
      status: "accepted" as const,
      messages: [
        {
          id: 1,
          senderId: 2,
          senderType: "advertiser" as const,
          content: "안녕하세요! 저희 캠페인에 지원해주셔서 감사합니다.",
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2시간 전
          type: "text" as const,
          isRead: true,
        },
        {
          id: 2,
          senderId: 1,
          senderType: "influencer" as const,
          content: "네, 안녕하세요! 제품 체험 기대됩니다 ✨",
          timestamp: new Date(Date.now() - 7000000).toISOString(),
          type: "text" as const,
          isRead: true,
        },
        {
          id: 3,
          senderId: 2,
          senderType: "advertiser" as const,
          content: "제품은 내일 발송 예정입니다. 받으시면 연락 주세요!",
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
          type: "text" as const,
          isRead: true,
        },
        {
          id: 4,
          senderId: 1,
          senderType: "influencer" as const,
          content: "네, 제품 받았습니다! 리뷰 작성할게요 😊",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: "text" as const,
          isRead: false,
        },
      ],
    },
    {
      campaignId: 2,
      campaignTitle: "맛집 방문 리뷰 작성",
      influencerId: 1,
      influencerName: "김민지",
      influencerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minji",
      advertiserId: 3,
      advertiserName: "맛있는식당",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=MR",
      lastMessage: "사진 정말 예쁘게 찍으셨네요!",
      time: new Date(Date.now() - 86400000).toISOString(), // 1일 전
      unreadCount: 0,
      isUnread: false,
      isActiveCollaboration: true,
      initiatedBy: "advertiser" as const,
      status: "active" as const,
      messages: [
        {
          id: 5,
          senderId: 3,
          senderType: "advertiser" as const,
          content: "저희 식당 방문해주셔서 감사합니다!",
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2일 전
          type: "text" as const,
          isRead: true,
        },
        {
          id: 6,
          senderId: 1,
          senderType: "influencer" as const,
          content: "맛있게 잘 먹었습니다! 사진 보내드릴게요",
          timestamp: new Date(Date.now() - 172500000).toISOString(),
          type: "text" as const,
          isRead: true,
        },
        {
          id: 7,
          senderId: 3,
          senderType: "advertiser" as const,
          content: "사진 정말 예쁘게 찍으셨네요!",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: "text" as const,
          isRead: true,
        },
      ],
    },
    {
      campaignId: 3,
      campaignTitle: "패션 브랜드 협업 제안",
      influencerId: 1,
      influencerName: "김민지",
      influencerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minji",
      advertiserId: 4,
      advertiserName: "패션하우스",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=FH",
      lastMessage: "협업 관련해서 상세히 논의하고 싶습니다.",
      time: new Date(Date.now() - 7200000).toISOString(), // 2시간 전
      unreadCount: 2,
      isUnread: true,
      isActiveCollaboration: false,
      initiatedBy: "advertiser" as const,
      status: "pending" as const,
      messages: [
        {
          id: 8,
          senderId: 4,
          senderType: "advertiser" as const,
          content: "안녕하세요! 김민지님의 콘텐츠를 보고 연락드립니다.",
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3시간 전
          type: "text" as const,
          isRead: true,
        },
        {
          id: 9,
          senderId: 4,
          senderType: "advertiser" as const,
          content: "협업 관련해서 상세히 논의하고 싶습니다.",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: "text" as const,
          isRead: false,
        },
      ],
    },
  ]

  // 테스트 데이터 추가
  console.log("[ChatSetup] Initializing test chat data...")
  testChats.forEach((chat) => {
    addChat(chat)
  })
  console.log("[ChatSetup] Test data initialized successfully!")
}

// 채팅 스토어 초기화 (기존 데이터 삭제)
export function resetChatStore() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("chat-storage")
    console.log("[ChatSetup] Chat store reset complete")
    window.location.reload()
  }
}

// 개발 도구
export const chatDevTools = {
  // 테스트 데이터 초기화
  init: initializeChatData,

  // 스토어 리셋
  reset: resetChatStore,

  // 현재 채팅 목록 확인
  listChats: () => {
    const { chats } = useChatStore.getState()
    console.table(chats.map((chat) => ({
      id: chat.id,
      title: chat.campaignTitle,
      lastMessage: chat.lastMessage,
      unread: chat.unreadCount,
      status: chat.status,
    })))
  },

  // 특정 채팅의 메시지 확인
  showMessages: (chatId: number) => {
    const { getChatById } = useChatStore.getState()
    const chat = getChatById(chatId)
    if (chat) {
      console.table(chat.messages.map((msg) => ({
        id: msg.id,
        sender: msg.senderType,
        content: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString(),
        read: msg.isRead,
      })))
    } else {
      console.log("Chat not found")
    }
  },

  // 테스트 메시지 전송
  sendTestMessage: (chatId: number, content: string) => {
    const { addMessage } = useChatStore.getState()
    addMessage(chatId, {
      senderId: 1,
      senderType: "influencer",
      content,
      timestamp: new Date().toISOString(),
      type: "text",
      isRead: false,
    })
    console.log(`[ChatDevTools] Test message sent to chat ${chatId}`)
  },

  // 모든 메시지 읽음 처리
  markAllRead: () => {
    const { markAllAsRead } = useChatStore.getState()
    markAllAsRead(1) // userId: 1
    console.log("[ChatDevTools] All messages marked as read")
  },
}

// 개발 환경에서 window 객체에 추가
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  ;(window as any).chatDevTools = chatDevTools
  console.log("💬 Chat Dev Tools available: window.chatDevTools")
  console.log("Commands:")
  console.log("  - chatDevTools.init() - 테스트 데이터 초기화")
  console.log("  - chatDevTools.reset() - 스토어 리셋")
  console.log("  - chatDevTools.listChats() - 채팅 목록 보기")
  console.log("  - chatDevTools.showMessages(chatId) - 메시지 보기")
  console.log("  - chatDevTools.sendTestMessage(chatId, content) - 테스트 메시지")
  console.log("  - chatDevTools.markAllRead() - 모두 읽음 처리")
}
