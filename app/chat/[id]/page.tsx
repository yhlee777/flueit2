"use client"

import { getSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, CheckCircle, XCircle, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const chatId = parseInt(params.id)
  
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [chatData, setChatData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  console.log('🔍 [Chat] State:', { chatId, userId, loading, messagesCount: messages.length })

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ✅ 세션 로드
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession()
        console.log('🔍 [Chat] Session:', { hasSession: !!session, userId: session?.user?.id })

        if (session?.user?.id) {
          setUserId(session.user.id)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('❌ [Chat] Session error:', error)
        router.push('/login')
      }
    }

    loadSession()
  }, [router])

  // ✅ 채팅 데이터 로드 (API 라우트 사용)
  useEffect(() => {
    if (!userId) return

    loadChatData()
  }, [userId, chatId])

  // ✅ 실시간 구독 (Supabase Realtime)
  useEffect(() => {
    if (!userId || !chatId) return

    console.log('📡 [Chat] Setting up realtime subscription for chat:', chatId)

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('🔔 [Realtime] New message:', payload.new)
          
          // 새 메시지 추가
          setMessages((prev) => {
            // 중복 체크
            if (prev.some(m => m.id === payload.new.id)) {
              return prev
            }
            return [...prev, payload.new]
          })
          
          // 알림음 재생 (선택사항)
          if (payload.new.sender_id !== userId) {
            playNotificationSound()
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [Realtime] Subscription status:', status)
      })

    // 정리
    return () => {
      console.log('📡 [Chat] Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, chatId])

  const loadChatData = async () => {
    try {
      setLoading(true)
      console.log('📥 [Chat] Loading via API:', chatId)

      // ✅ API 라우트로 데이터 가져오기 (RLS 우회)
      const response = await fetch(`/api/chat/${chatId}`)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('❌ [Chat] API error:', error)
        alert('채팅을 불러올 수 없습니다: ' + error.error)
        router.push('/chat')
        return
      }

      const data = await response.json()
      console.log('✅ [Chat] Data loaded:', { chatId: data.chat?.id, messagesCount: data.messages?.length })
      console.log('📨 [Chat] Messages:', data.messages) // 메시지 데이터 전체 확인

      setChatData(data.chat)
      setMessages(data.messages || [])

    } catch (error) {
      console.error('❌ [Chat] Load error:', error)
      alert('채팅 로드 실패')
      router.push('/chat')
    } finally {
      setLoading(false)
    }
  }

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return

    // pending 상태면 전송 불가
    if (chatData?.status === 'pending') {
      alert('제안이 수락되어야 메시지를 보낼 수 있습니다.')
      return
    }

    console.log('📤 [Chat] Sending:', message)

    try {
      // ✅ API 라우트로 메시지 전송 (RLS 우회)
      const response = await fetch(`/api/chat/${chatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.trim(),
          message_type: 'text',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '메시지 전송 실패')
      }

      const data = await response.json()
      console.log('✅ [Chat] Message sent:', data.message.id)
      
      // ✅ 즉시 화면에 추가 (Realtime 기다리지 않음)
      setMessages(prev => {
        // 중복 체크
        if (prev.some(m => m.id === data.message.id)) {
          return prev
        }
        return [...prev, data.message]
      })
      
      setMessage("")
      
    } catch (error: any) {
      console.error('❌ [Chat] Send error:', error)
      alert('메시지 전송 실패: ' + error.message)
    }
  }

  // 알림음 재생
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/message.mp3')
      audio.volume = 0.3
      audio.play().catch(e => console.log('Sound play failed:', e))
    } catch (e) {
      console.log('Sound not available')
    }
  }

  // 로딩 중이거나 로그인 안 됨
  if (!userId || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-500">채팅 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로딩 완료 후에도 데이터 없으면 에러
  if (!chatData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-4">채팅방을 찾을 수 없습니다</p>
          <Button onClick={() => router.push('/chat')} className="bg-[#7b68ee]">
            채팅 목록으로
          </Button>
        </div>
      </div>
    )
  }

  const isInfluencerMode = localStorage.getItem("influencer_mode") === "true"
  const otherUserName = isInfluencerMode ? chatData.advertiser_name : chatData.influencer_name
  const otherUserAvatar = isInfluencerMode ? chatData.advertiser_avatar : chatData.influencer_avatar

  // 디버깅
  console.log('🎨 [Chat] Render:', { 
    messagesCount: messages.length, 
    chatStatus: chatData.status,
    isInfluencerMode,
    otherUserName 
  })

  // 채팅 수락/거절
  const handleStatusChange = async (status: 'active' | 'rejected') => {
    try {
      const response = await fetch(`/api/chat/${chatId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error)
        return
      }

      alert(data.message)
      loadChatData()
    } catch (error: any) {
      console.error('❌ Status change error:', error)
      alert('실패')
    }
  }

  // ✅ 메시지 렌더링 함수 (변수 정의 후)
  const renderMessage = (msg: any) => {
    const isMine = msg.sender_id === userId

    // 시스템 메시지
    if (msg.message_type === 'system') {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full max-w-md text-center">
            {msg.content}
          </div>
        </div>
      )
    }

    // 프로필 카드 (제안서 미리보기 100% 동일)
    if (msg.message_type === 'profile_card') {
      const metadata = msg.metadata || {}
      return (
        <div key={msg.id} className="my-4">
          {/* 헤더 */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={metadata.avatar} />
                <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                  {metadata.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{metadata.name || '인플루언서'}</h3>
                  <div className="w-4 h-4 bg-[#7b68ee] rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  @{metadata.username || 'username'}
                </p>
              </div>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="px-4 py-4 space-y-4">
            {/* 통계 */}
            {(metadata.follower_count || metadata.engagement_rate) && (
              <div className="flex items-center gap-4">
                {metadata.follower_count && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">팔로워</p>
                    <p className="text-sm font-semibold text-gray-900">{metadata.follower_count}</p>
                  </div>
                )}
                {metadata.engagement_rate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">참여율</p>
                    <p className="text-sm font-semibold text-gray-900">{metadata.engagement_rate}%</p>
                  </div>
                )}
              </div>
            )}

            {/* 자기소개 */}
            {metadata.bio && (
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">{metadata.bio}</p>
              </div>
            )}

            {/* 해시태그 */}
            {metadata.hashtags && metadata.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metadata.hashtags.map((tag: string, idx: number) => (
                  <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-gray-400 ml-4 mt-2 inline-block">
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )
    }

    // 캠페인 카드 (심플 스타일)
    if (msg.message_type === 'campaign_card') {
      const metadata = msg.metadata || {}
      return (
        <div key={msg.id} className="my-4">
          <div className="px-4 py-4 border-l-4 border-purple-500 bg-purple-50">
            <div className="flex items-start gap-3">
              {metadata.thumbnail && (
                <img 
                  src={metadata.thumbnail} 
                  alt="Campaign" 
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-700 font-semibold mb-1">🎯 캠페인 제안</p>
                <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                  {metadata.title || '캠페인'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {metadata.category && (
                    <span className="text-xs bg-white text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {metadata.category}
                    </span>
                  )}
                  {metadata.paymentAmount && (
                    <span className="text-xs font-semibold text-purple-900">
                      💰 {typeof metadata.paymentAmount === 'number' 
                        ? metadata.paymentAmount.toLocaleString() + '원'
                        : metadata.paymentAmount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <span className="text-xs text-gray-400 ml-4 mt-2 inline-block">
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )
    }

    // 제안서 (제안서 미리보기 100% 동일)
    if (msg.message_type === 'proposal') {
      return (
        <div key={msg.id} className="my-4">
          {/* 제안서 내용 */}
          <div className="px-4 py-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>

          <span className="text-xs text-gray-400 ml-4 mt-2 inline-block">
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )
    }

    // 일반 메시지
    return (
      <div key={msg.id} className={`flex gap-2 mb-4 ${isMine ? "flex-row-reverse" : ""}`}>
        {!isMine && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} />
            <AvatarFallback>{otherUserName?.[0] || '?'}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%]`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isMine
                ? "bg-[#7b68ee] text-white rounded-tr-sm"
                : "bg-white border border-gray-200 rounded-tl-sm"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src={otherUserAvatar || undefined} alt={otherUserName} />
              <AvatarFallback>{otherUserName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-semibold">{otherUserName}</h1>
              {chatData.status === 'pending' && (
                <p className="text-xs text-yellow-600">⏳ 수락 대기 중</p>
              )}
              {chatData.status === 'active' && chatData.is_active_collaboration && (
                <p className="text-xs text-green-600">✅ 협업 진행중</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 수락/거절 버튼 (광고주만 보임) */}
      {chatData.status === 'pending' && 
       chatData.initiated_by === 'influencer' && 
       !isInfluencerMode && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <p className="text-sm text-yellow-800 mb-3 font-medium">
            💼 인플루언서의 제안을 검토하세요
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusChange('active')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              ✅ 수락
            </Button>
            <Button
              onClick={() => handleStatusChange('rejected')}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              ❌ 거절
            </Button>
          </div>
        </div>
      )}

      {/* 거절됨 표시 */}
      {chatData.status === 'rejected' && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <p className="text-sm text-red-800 text-center">
            ❌ 이 제안은 거절되었습니다
          </p>
        </div>
      )}

      {/* 캠페인 카드 */}
      {chatData.campaign_id && chatData.status === 'active' && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="block hover:bg-gray-50 rounded-lg p-3 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700">
                진행중
              </span>
            </div>
            <h2 className="text-sm font-medium text-gray-900 mb-1">
              {chatData.campaign_title || "캠페인"}
            </h2>
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">메시지가 없습니다</p>
              <p className="text-xs text-gray-300">첫 메시지를 보내보세요!</p>
            </div>
          </div>
        ) : (
          <>
            {console.log('🎨 [Chat] Rendering messages:', messages.length)}
            {messages.map((msg) => {
              console.log('🎨 [Chat] Message:', msg.id, msg.message_type, msg.content?.substring(0, 20))
              return renderMessage(msg)
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 입력창 - 스크린샷과 동일 */}
      {chatData.status !== 'rejected' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            {/* 클립 아이콘 */}
            <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            {/* 입력창 */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={
                  chatData.status === 'pending' 
                    ? "제안 수락 후 메시지를 보낼 수 있습니다..." 
                    : "메시지를 입력하세요..."
                }
                disabled={chatData.status === 'pending'}
                className="w-full h-12 bg-gray-100 rounded-full px-5 text-sm border-0 focus:outline-none placeholder:text-gray-400 disabled:opacity-60"
              />
            </div>

            {/* 전송 버튼 */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || chatData.status === 'pending'}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                message.trim() && chatData.status !== 'pending'
                  ? "bg-[#7b68ee] hover:bg-[#6a5acd]"
                  : "bg-gray-300"
              }`}
            >
              <Send className={`h-5 w-5 ${message.trim() && chatData.status !== 'pending' ? "text-white" : "text-gray-500"}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}