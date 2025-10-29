"use client"

import { useEffect, useRef, useCallback } from "react"
import { useChatStore } from "@/lib/chat-store"
import type { ChatMessage } from "@/lib/chat-store"

interface RealtimeChatOptions {
  userId: number
  userType: "influencer" | "advertiser"
  onNewMessage?: (chatId: number, message: ChatMessage) => void
  onTypingStatusChange?: (chatId: number, isTyping: boolean) => void
  pollingInterval?: number // ms
  useWebSocket?: boolean
}

/**
 * 실시간 채팅 기능을 제공하는 커스텀 훅
 * WebSocket 또는 폴링을 사용하여 실시간 업데이트 제공
 */
export function useRealtimeChat(options: RealtimeChatOptions) {
  const {
    userId,
    userType,
    onNewMessage,
    onTypingStatusChange,
    pollingInterval = 3000, // 기본 3초
    useWebSocket = false,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { addMessage, setTypingStatus, getTypingStatus } = useChatStore()

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      // 실제 환경에서는 실제 WebSocket 서버 URL 사용
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
      const ws = new WebSocket(`${wsUrl}/chat?userId=${userId}&userType=${userType}`)

      ws.onopen = () => {
        console.log("[RealtimeChat] WebSocket connected")
        wsRef.current = ws
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case "new_message":
              addMessage(data.chatId, data.message)
              onNewMessage?.(data.chatId, data.message)
              break

            case "typing_status":
              setTypingStatus(data.chatId, data.userId, data.isTyping)
              onTypingStatusChange?.(data.chatId, data.isTyping)
              break

            case "message_read":
              // 읽음 처리 로직
              break

            default:
              console.log("[RealtimeChat] Unknown message type:", data.type)
          }
        } catch (error) {
          console.error("[RealtimeChat] Error parsing message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("[RealtimeChat] WebSocket error:", error)
      }

      ws.onclose = () => {
        console.log("[RealtimeChat] WebSocket disconnected")
        wsRef.current = null

        // 재연결 시도 (5초 후)
        setTimeout(() => {
          if (useWebSocket) {
            connectWebSocket()
          }
        }, 5000)
      }
    } catch (error) {
      console.error("[RealtimeChat] Failed to connect WebSocket:", error)
    }
  }, [userId, userType, useWebSocket, addMessage, setTypingStatus, onNewMessage, onTypingStatusChange])

  // 폴링 시작
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return

    pollingIntervalRef.current = setInterval(async () => {
      try {
        // 실제 환경에서는 API 호출
        const response = await fetch(`/api/chat/messages?userId=${userId}&userType=${userType}`)
        
        if (!response.ok) return

        const data = await response.json()

        // 새 메시지 처리
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            addMessage(msg.chatId, msg.message)
            onNewMessage?.(msg.chatId, msg.message)
          })
        }

        // 타이핑 상태 처리
        if (data.typingStatuses && Array.isArray(data.typingStatuses)) {
          data.typingStatuses.forEach((status: any) => {
            setTypingStatus(status.chatId, status.userId, status.isTyping)
            onTypingStatusChange?.(status.chatId, status.isTyping)
          })
        }
      } catch (error) {
        console.error("[RealtimeChat] Polling error:", error)
      }
    }, pollingInterval)

    console.log("[RealtimeChat] Polling started")
  }, [userId, userType, pollingInterval, addMessage, setTypingStatus, onNewMessage, onTypingStatusChange])

  // 폴링 중지
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log("[RealtimeChat] Polling stopped")
    }
  }, [])

  // WebSocket 메시지 전송
  const sendWebSocketMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }))
    }
  }, [])

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback((chatId: number, isTyping: boolean) => {
    if (useWebSocket && wsRef.current) {
      sendWebSocketMessage("typing_status", { chatId, userId, isTyping })
    } else {
      // HTTP 요청으로 전송
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, userId, isTyping }),
      }).catch(console.error)
    }

    // 로컬 상태도 업데이트
    setTypingStatus(chatId, userId, isTyping)
  }, [useWebSocket, userId, setTypingStatus, sendWebSocketMessage])

  // 메시지 전송
  const sendMessage = useCallback(async (chatId: number, message: Omit<ChatMessage, "id">) => {
    try {
      if (useWebSocket && wsRef.current) {
        sendWebSocketMessage("send_message", { chatId, message })
      } else {
        // HTTP 요청으로 전송
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }
      }

      // 로컬에 즉시 추가 (낙관적 업데이트)
      addMessage(chatId, message)
    } catch (error) {
      console.error("[RealtimeChat] Failed to send message:", error)
      throw error
    }
  }, [useWebSocket, addMessage, sendWebSocketMessage])

  // 초기화
  useEffect(() => {
    if (useWebSocket) {
      connectWebSocket()
    } else {
      startPolling()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      stopPolling()
    }
  }, [useWebSocket, connectWebSocket, startPolling, stopPolling])

  return {
    sendMessage,
    sendTypingStatus,
    isConnected: useWebSocket ? wsRef.current?.readyState === WebSocket.OPEN : true,
  }
}

/**
 * 온라인 상태 관리 훅
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * 메시지 알림 훅
 */
export function useMessageNotifications(options: {
  enabled?: boolean
  onClick?: (chatId: number) => void
}) {
  const { enabled = true, onClick } = options

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    // 브라우저 알림 권한 요청
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [enabled])

  const sendNotification = useCallback((title: string, body: string, chatId: number) => {
    if (!enabled || typeof window === "undefined") return
    if (Notification.permission !== "granted") return

    const notification = new Notification(title, {
      body,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: `chat-${chatId}`,
    })

    notification.onclick = () => {
      onClick?.(chatId)
      notification.close()
    }
  }, [enabled, onClick])

  return { sendNotification }
}

/**
 * 채팅 소리 재생 훅
 */
export function useChatSounds(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    audioRef.current = new Audio("/sounds/message.mp3")
  }, [])

  const playMessageSound = useCallback(() => {
    if (enabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [enabled])

  const playNotificationSound = useCallback(() => {
    if (enabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [enabled])

  return {
    playMessageSound,
    playNotificationSound,
  }
}

// 유틸리티 함수
export const chatUtils = {
  // 마지막으로 본 시간 기록
  updateLastSeen: (chatId: number) => {
    if (typeof window === "undefined") return
    localStorage.setItem(`chat_last_seen_${chatId}`, new Date().toISOString())
  },

  // 마지막으로 본 시간 가져오기
  getLastSeen: (chatId: number): Date | null => {
    if (typeof window === "undefined") return null
    const lastSeen = localStorage.getItem(`chat_last_seen_${chatId}`)
    return lastSeen ? new Date(lastSeen) : null
  },

  // 새 메시지 여부 확인
  hasNewMessages: (chatId: number, lastMessageTime: string): boolean => {
    const lastSeen = chatUtils.getLastSeen(chatId)
    if (!lastSeen) return true
    return new Date(lastMessageTime) > lastSeen
  },
}
